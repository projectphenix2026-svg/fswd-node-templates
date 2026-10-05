const { MongoClient } = require("mongodb");

const client = new MongoClient("mongodb://localhost:27017");

async function main()
{
  await client.connect();
  const tickets = client.db("helpdesk").collection("tickets");

  // Practice · change one ticket, remove another
  // 1. Ticket 1 is solved: wait for updateOne, and set its status to "closed". Change nothing else in it.
  // 2. Ticket 2 was raised by mistake: wait for deleteOne.
  // 3. Read every ticket that is left, and print how many there are:   2 left

  await client.close();
}

main();
