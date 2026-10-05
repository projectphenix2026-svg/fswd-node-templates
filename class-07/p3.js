const { MongoClient } = require("mongodb");

const client = new MongoClient("mongodb://localhost:27017");

async function main()
{
  // Practice · a collection made by name, in the database "prime"
  // 1. Connect, and take the database:  const db = client.db("prime");
  // 2. Make a collection named "numbers":  wait for db.createCollection("numbers")
  // 3. Add one document to it:  value 7, prime true
  // 4. Print  Collection created, document added
  // 5. Close the connection.

}

main();
