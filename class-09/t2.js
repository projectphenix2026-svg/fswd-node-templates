const express = require("express");
const { MongoClient } = require("mongodb");
const Valkey = require("iovalkey");

const app = express();
const client = new MongoClient("mongodb://localhost:27017");
const reports = client.db("helpdesk").collection("reports");
const cache = new Valkey();

app.use(express.urlencoded({ extended: true }));

app.get("/open/:block", async (req, res) =>
{
  const key = "open:" + req.params.block;

  // Task 2 · ask the cache first
  // 1. const kept = wait for cache.get(key);
  // 2. if kept is not null: reply with JSON and return
  //      { block: req.params.block, open: Number(kept), source: "cache" }

  const n = await reports.countDocuments({ block: req.params.block, status: "open" });

  // 3. keep the number for 30 seconds:  wait for cache.set(key, n, "EX", 30);

  res.json({ block: req.params.block, open: n, source: "database" });
});

async function start()
{
  await client.connect();
  app.listen(3000, () => console.log("Helpdesk is listening on port 3000"));
}

start();
