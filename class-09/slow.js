// How long does the database take to count Block C's open reports?   node class-09/slow.js
const { MongoClient } = require("mongodb");

const client = new MongoClient("mongodb://localhost:27017");

async function main()
{
  await client.connect();
  const reports = client.db("helpdesk").collection("reports");
  const start = Date.now();
  const n = await reports.countDocuments({ block: "C", status: "open" });
  console.log("Block C, open: " + n);
  console.log("The database took " + (Date.now() - start) + " ms");
  await client.close();
}

main();
