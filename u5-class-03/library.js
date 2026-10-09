const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const client = new MongoClient("mongodb://localhost:27017");
const books = client.db("library").collection("books");

app.use(express.json());

// list every book
app.get("/api/books", async (req, res) =>
{
  const list = await books.find().toArray();
  res.json(list);
});

// add a book
app.post("/api/books", async (req, res) =>
{
  if (!req.body.title)
  {
    res.status(400).json({ error: "A title is needed" });
    return;
  }
  const book = { title: req.body.title, author: req.body.author, copies: req.body.copies };
  await books.insertOne(book);
  res.status(201).json(book);
});

// read one book
app.get("/api/books/:id", async (req, res) =>
{
  if (!ObjectId.isValid(req.params.id))
  {
    res.status(400).json({ error: "Not an id" });
    return;
  }
  const book = await books.findOne({ _id: new ObjectId(req.params.id) });
  if (book === null)
  {
    res.status(404).json({ error: "No such book" });
    return;
  }
  res.json(book);
});

// replace one book
app.put("/api/books/:id", async (req, res) =>
{
  if (!ObjectId.isValid(req.params.id))
  {
    res.status(400).json({ error: "Not an id" });
    return;
  }
  const book = { title: req.body.title, author: req.body.author, copies: req.body.copies };
  const result = await books.updateOne({ _id: new ObjectId(req.params.id) }, { $set: book });
  if (result.matchedCount === 0)
  {
    res.status(404).json({ error: "No such book" });
    return;
  }
  res.json({ _id: req.params.id, title: book.title, author: book.author, copies: book.copies });
});

// remove one book
app.delete("/api/books/:id", async (req, res) =>
{
  if (!ObjectId.isValid(req.params.id))
  {
    res.status(400).json({ error: "Not an id" });
    return;
  }
  const result = await books.deleteOne({ _id: new ObjectId(req.params.id) });
  if (result.deletedCount === 0)
  {
    res.status(404).json({ error: "No such book" });
    return;
  }
  res.status(204).end();
});

async function start()
{
  await client.connect();
  app.listen(3000, () => console.log("Library on 3000"));
}

start();
