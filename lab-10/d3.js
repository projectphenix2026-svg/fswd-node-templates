const { MongoClient } = require("mongodb");

const client = new MongoClient("mongodb://localhost:27017");
const items = client.db("lostfound").collection("items");

async function main()
{
  await client.connect();

  // Drill 3 · change one field
  // 1. wait for items.updateOne: the item named "Earphones" gets  claimed: true   (use $set)
  // 2. const item = wait for items.findOne({ name: "Earphones" });
  // 3. print:   Earphones, found at Auditorium, claimed: true     (from item.name, item.foundAt, item.claimed)

  await client.close();
}

main();
