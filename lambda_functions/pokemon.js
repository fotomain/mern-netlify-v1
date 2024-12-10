//
//
// git init
// git remote add origin https://github.com/fotomain/mern-netlify-v1.git
// git add .
// git commit -m "first commit"
// git branch -M main
//
//     git push -u origin main

const MongoClient = require("mongodb").MongoClient;
// const MONGODB_URI = process.env.MONGODB_URI;

const MONGODB_URI = "mongodb+srv://work_user:Taras777999$Taras777999$@cluster0.algml.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

let cachedDb = null;

const connectToDatabase = async (uri) => {
  if (cachedDb) return cachedDb;

  const client = await MongoClient.connect(uri, {
    useUnifiedTopology: true,
  });

  cachedDb = client.db("test");

  return cachedDb;
};

const queryDatabase = async (db) => {
  const pokemon = await db.collection("pokemon").find({}).toArray();

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(pokemon),
  };
};

const pushToDatabase = async (db, data) => {
  const pokemonData = {
    name: data.name,
    number: data.number,
  };

  if (pokemonData.name && pokemonData.number) {
    await db.collection("pokemon").insertMany([data]);
    return { statusCode: 201 };
  } else {
    return { statusCode: 422 };
  }
};

module.exports.handler = async (event, context) => {
  // otherwise the connection will never complete, since
  // we keep the DB connection alive
  context.callbackWaitsForEmptyEventLoop = false;

  const db = await connectToDatabase(MONGODB_URI);

  switch (event.httpMethod) {
    case "GET":
      return queryDatabase(db);
    case "POST":
      return pushToDatabase(db, JSON.parse(event.body));
    default:
      return { statusCode: 400 };
  }
};
