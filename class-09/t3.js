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
  const kept = await cache.get(key);
  if (kept !== null)
  {
    res.json({ block: req.params.block, open: Number(kept), source: "cache" });
    return;
  }
  const n = await reports.countDocuments({ block: req.params.block, status: "open" });
  await cache.set(key, n, "EX", 30);
  res.json({ block: req.params.block, open: n, source: "database" });
});

app.post("/reports", async (req, res) =>
{
  await reports.insertOne({ block: req.body.block, problem: req.body.problem, status: "open" });

  // Task 3 · the number that was kept is now wrong
  // 1. wait for cache.del( ... ) with the key of this block:  "open:" + req.body.block

  res.status(201).send("Report stored for Block " + req.body.block);
});

async function start()
{
  await client.connect();
  app.listen(3000, () => console.log("Helpdesk is listening on port 3000"));
}

start();
