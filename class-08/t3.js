const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
const client = new MongoClient("mongodb://localhost:27017");
const users = client.db("helpdesk").collection("users");

app.use(express.urlencoded({ extended: true }));
app.use(express.static("class-08/public"));

app.post("/register", async (req, res) =>
{
  await users.insertOne({ email: req.body.email, password: req.body.password, course: req.body.course });
  res.status(201).send("Registered: you can log in now");
});

app.post("/login", async (req, res) =>
{
  const user = await users.findOne({ email: req.body.email, password: req.body.password });
  if (user === null)
  {
    res.status(401).send("Wrong email or password");
    return;
  }
  res.send("Welcome back, " + user.email);
});

app.get("/count", async (req, res) =>
{
  // Task 3 · how many students have registered?
  // 1. const n = wait for users.countDocuments();
  // 2. reply with the words and the number:   Registered students: 2

});

async function start()
{
  await client.connect();
  app.listen(3000, () => console.log("Helpdesk is listening on port 3000"));
}

start();
