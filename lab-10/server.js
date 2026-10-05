const express = require("express");
const { MongoClient } = require("mongodb");
const Valkey = require("iovalkey");

const app = express();
const client = new MongoClient("mongodb://localhost:27017");
const items = client.db("lostfound").collection("items");
const cache = new Valkey();

app.use(express.json());
app.use(express.static("lab-10/public"));

app.get("/items/:name", async (req, res) =>
{
  // STEP A · ask the database
  // 1. const item = wait for items.findOne({ name: req.params.name });
  // 2. if item is null: status 404 and the JSON  { error: "No item called " + req.params.name }  and return
  // 3. otherwise reply with JSON, four fields:
  //      { name: item.name, foundAt: item.foundAt, claimed: item.claimed, source: "database" }

});

// STEP B · the sticky note. In the route above:
//   at its top:      const key = "item:" + req.params.name;   then ask the cache for that key
//   on a hit:        const note = JSON.parse(kept);  reply with the same four fields from note, source "cache", and return
//   after findOne:   wait for cache.set(key, JSON.stringify(item), "EX", 60)   before the reply

// STEP C · the expiry comes from outside. Above the route:
//   const seconds = Number(process.env.CACHE_SECONDS) || 60;
// and in cache.set, write  seconds  where 60 was.

// STEP D · an item is claimed, and its note must go.   POST /items/:name/claim   with the JSON body { "claimedBy": "..." }
//   1. no req.body.claimedBy: status 400 and { error: "Say who is claiming it" }, and return
//   2. wait for items.updateOne: the item of this name gets  claimed: true  and  claimedBy: req.body.claimedBy   ($set)
//   3. wait for cache.del("item:" + req.params.name)
//   4. reply with JSON:  { name: req.params.name, claimed: true }

async function start()
{
  await client.connect();
  app.listen(3000, () => console.log("Lost and found is listening on port 3000"));
}

start();
