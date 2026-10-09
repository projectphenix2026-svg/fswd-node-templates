const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
const client = new MongoClient("mongodb://localhost:27017");
const items = client.db("store").collection("items");

app.use(express.json());

// service 1: add an item
app.post("/api/items", async (req, res) =>
{
  if (!req.body.name)
  {
    res.status(400).json({ error: "A name is needed" });
    return;
  }
  const item = { name: req.body.name, qty: req.body.qty };
  await items.insertOne(item);
  res.status(201).json(item);
});

// service 2: list the items
app.get("/api/items", async (req, res) =>
{
  const list = await items.find().toArray();
  res.json(list);
});

async function start()
{
  await client.connect();
  app.listen(3000, () => console.log("Items service on 3000"));
}

start();
