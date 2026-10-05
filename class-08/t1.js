const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
const client = new MongoClient("mongodb://localhost:27017");
const users = client.db("helpdesk").collection("users");

app.use(express.urlencoded({ extended: true }));
app.use(express.static("class-08/public"));

app.post("/register", async (req, res) =>
{
  // Task 1 · store what the form sent
  // 1. wait for users.insertOne({ ... }) with three fields, each taken from req.body:  email, password, course
  // 2. reply with the status 201 and the text  Registered: you can log in now

});

async function start()
{
  await client.connect();
  app.listen(3000, () => console.log("Helpdesk is listening on port 3000"));
}

start();
