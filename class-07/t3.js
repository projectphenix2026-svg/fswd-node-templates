const { MongoClient } = require("mongodb");

const client = new MongoClient("mongodb://localhost:27017");

async function main()
{
  await client.connect();
  const tickets = client.db("helpdesk").collection("tickets");

  // Task 3 · read the open tickets
  // 1. wait for tickets.find({ status: "open" }).toArray() and keep the array in  open
  // 2. print how many there are:   2 open
  // 3. print each one on a line of its own, its number and its problem:   1 Wi-Fi down

  await client.close();
}

main();
