// Fills helpdesk.reports with 200000 fault reports, once:   node class-09/seed.js
// Every sixth report is from one block (A to F), and one report in fifty is still open.
const { MongoClient } = require("mongodb");

const client = new MongoClient("mongodb://localhost:27017");

async function main()
{
  await client.connect();
  const reports = client.db("helpdesk").collection("reports");
  await reports.drop();
  const blocks = ["A", "B", "C", "D", "E", "F"];
  let batch = [];
  for (let i = 0; i < 200000; i++)
  {
    batch.push({ no: i + 1, block: blocks[i % 6], problem: "Report " + (i + 1), status: i % 50 === 0 ? "open" : "closed" });
    if (batch.length === 10000)
    {
      await reports.insertMany(batch);
      batch = [];
    }
  }
  console.log((await reports.countDocuments()) + " reports are in helpdesk.reports");
  await client.close();
}

main();
