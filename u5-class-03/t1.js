const express = require("express");
const { MongoClient } = require("mongodb");

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

// Task 1 · this is the add route of last class. Then it pushed into an array; now it must store in MongoDB.
// Three small changes, each marked.
app.post("/api/products", (req, res) =>          // 1. this function will wait for the database: mark it
{
  if (!req.body.name)
  {
    res.status(400).json({ error: "A name is needed" });
    return;
  }
  const one = { name: req.body.name, price: req.body.price };
  // 2. store the object one in the collection products, and wait until MongoDB has it

  res.status(200).json(one);                     // 3. a new product was made: which status says so?
});

async function start()
{
  await client.connect();
  app.listen(3000, () => console.log("Store on 3000"));
}

start();
