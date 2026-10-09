// seed.js - empties the collection products of the database store, and puts two products into it.
//   node u5-class-03/seed.js
const { MongoClient } = require("mongodb");

const client = new MongoClient("mongodb://localhost:27017");
const products = client.db("store").collection("products");

async function seed()
{
  await client.connect();
  await products.deleteMany({});
  await products.insertMany([{ name: "Notebook", price: 40 }, { name: "Pen", price: 10 }]);
  const list = await products.find().toArray();
  list.forEach((p) => console.log(p._id + "  " + p.name + "  Rs " + p.price));
  await client.close();
}

seed();
