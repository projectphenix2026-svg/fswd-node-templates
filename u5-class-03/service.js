const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const client = new MongoClient("mongodb://localhost:27017");
const products = client.db("store").collection("products");

app.use(express.json());
app.use(express.static("u5-class-03/public"));

app.get("/api/products", async (req, res) =>
{
  const list = await products.find().toArray();
  res.json(list);
});

app.post("/api/products", async (req, res) =>
{
  if (!req.body.name)
  {
    res.status(400).json({ error: "A name is needed" });
    return;
  }
  const one = { name: req.body.name, price: req.body.price };
  await products.insertOne(one);
  res.status(201).json(one);
});

app.get("/api/products/:id", async (req, res) =>
{
  if (!ObjectId.isValid(req.params.id))
  {
    res.status(400).json({ error: "Not an id" });
    return;
  }
  const one = await products.findOne({ _id: new ObjectId(req.params.id) });
  if (one === null)
  {
    res.status(404).json({ error: "No such product" });
    return;
  }
  res.json(one);
});

app.delete("/api/products/:id", async (req, res) =>
{
  if (!ObjectId.isValid(req.params.id))
  {
    res.status(400).json({ error: "Not an id" });
    return;
  }
  const result = await products.deleteOne({ _id: new ObjectId(req.params.id) });
  if (result.deletedCount === 0)
  {
    res.status(404).json({ error: "No such product" });
    return;
  }
  res.status(204).end();
});

async function start()
{
  await client.connect();
  app.listen(3000, () => console.log("Store on 3000"));
}

start();
