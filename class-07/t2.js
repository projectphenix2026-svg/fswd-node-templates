const { MongoClient } = require("mongodb");

const client = new MongoClient("mongodb://localhost:27017");

async function main()
{
  // Task 2 · the program itself saves a ticket
  // 1. wait for client.connect()
  // 2. const tickets = client.db("helpdesk").collection("tickets");
  // 3. wait for tickets.insertOne( ... ) with the ticket
  //      no 4, block "B", problem "Tap leaking", status "open"
  // 4. print  Ticket saved
  // 5. wait for client.close()

}

main();
