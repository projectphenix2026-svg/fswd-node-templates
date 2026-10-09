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

// Task 2 · GET /api/products/6ac931504a64885a883b6c1c gives one product, by the id MongoDB gave it.
// The route is written, except for the two places that deal with the id. Each is marked.
app.get("/api/products/:id", async (req, res) =>
{
  if (false)                                     // 1. true when the text in the address cannot be an id, such as 2
  {
    res.status(400).json({ error: "Not an id" });
    return;
  }
  const one = await products.findOne({ });       // 2. the filter: the product whose _id is that id, as an ObjectId
  if (one === null)
  {
    res.status(404).json({ error: "No such product" });
    return;
  }
  res.json(one);
});

async function start()
{
  await client.connect();
  app.listen(3000, () => console.log("Store on 3000"));
}

start();
