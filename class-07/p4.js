const { MongoClient } = require("mongodb");

const client = new MongoClient("mongodb://localhost:27017");

async function main()
{
  // Practice · the connection is always closed, whatever happens
  // The database is "helpdesk" and the collection is "tickets".
  // 1. try: connect; read every ticket with find().toArray(); print how many:   3 tickets
  // 2. catch (error): print  Could not reach the database
  // 3. finally: wait for client.close()   (finally runs after try, and after catch too)

}

main();
