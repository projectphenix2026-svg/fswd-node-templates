const { MongoClient } = require("mongodb");

const client = new MongoClient("mongodb://localhost:27017");
const items = client.db("lostfound").collection("items");

async function main()
{
  await client.connect();

  // Drill 1 · count the items
  // 1. const n = wait for items.countDocuments();
  // 2. print the words and the number:   Items: 10

  await client.close();
}

main();
