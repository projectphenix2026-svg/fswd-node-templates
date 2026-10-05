const { MongoClient } = require("mongodb");

const client = new MongoClient("mongodb://localhost:27017");
const items = client.db("lostfound").collection("items");

async function main()
{
  await client.connect();

  // Drill 2 · one filter
  // 1. const list = wait for items.find({ ... }).toArray();   the filter: daysHeld greater than 7
  // 2. print their names on one line, with a comma and a space between:
  //      list.map((i) => i.name).join(", ")

  await client.close();
}

main();
