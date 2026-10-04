// Is the database there? Run:  npm run hello
const { MongoClient } = require("mongodb");

const client = new MongoClient("mongodb://localhost:27017");

client.connect()
  .then(() => client.db("admin").command({ ping: 1 }))
  .then(() => console.log("MongoDB answers: this Codespace is ready"))
  .catch((error) => console.log("MongoDB does not answer: " + error.message))
  .then(() => client.close());
