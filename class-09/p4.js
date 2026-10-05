const express = require("express");
const { MongoClient } = require("mongodb");
const Valkey = require("iovalkey");

const app = express();
const client = new MongoClient("mongodb://localhost:27017");
const reports = client.db("helpdesk").collection("reports");
const cache = new Valkey();

app.use(express.urlencoded({ extended: true }));

app.get("/reports/:no", async (req, res) =>
{
  const key = "report:" + req.params.no;

  // Practice · keep a whole document in the cache
  // Valkey keeps text. A document goes in as JSON.stringify(doc) and comes out through JSON.parse(kept).
  // 1. const kept = wait for cache.get(key);
  // 2. if kept is not null: reply with JSON and return
  //      { source: "cache", report: JSON.parse(kept) }
  // 3. const doc = wait for reports.findOne({ no: Number(req.params.no) });
  // 4. keep it for 60 seconds:  wait for cache.set(key, JSON.stringify(doc), "EX", 60);
  // 5. reply with JSON:  { source: "database", report: doc }

});

async function start()
{
  await client.connect();
  app.listen(3000, () => console.log("Helpdesk is listening on port 3000"));
}

start();
