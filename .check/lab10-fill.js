// Puts the cupboard's paper register into the database, for the drills:   npm run lab10
// (In Exercise 1 you write a program that does this yourself.)
const { MongoClient } = require("mongodb");
const given = require("../lab-10/items.json");

const client = new MongoClient("mongodb://localhost:27017");

client.connect()
  .then(() => client.db("lostfound").collection("items").drop())
  .then(() => client.db("lostfound").collection("items").insertMany(given))
  .then(() => console.log("The register is in the database: lostfound.items holds " + given.length + " items"))
  .catch((error) => console.log("The database does not answer: " + error.message))
  .then(() => client.close());
