const { MongoClient } = require("mongodb");

const client = new MongoClient("mongodb://localhost:27017");

async function main()
{
  // Practice · a shop's stock: product name and quantity
  // The database is "shop" and the collection is "products".
  // 1. Connect, and take the collection.
  // 2. Add one product:  name "Marker", quantity 35
  // 3. Read every product and print each as   Marker: 35
  // 4. Close the connection.

}

main();
