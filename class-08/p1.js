const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
const client = new MongoClient("mongodb://localhost:27017");
const users = client.db("helpdesk").collection("users");

app.use(express.urlencoded({ extended: true }));
app.use(express.static("class-08/public"));

app.post("/register", async (req, res) =>
{
  // Practice · refuse a form with an empty box
  // 1. if the email, the password or the course is empty (!req.body.email || ...):
  //      reply with the status 400 and the text  Fill in every box  and return
  // 2. otherwise store the three fields with insertOne, and reply 201  Registered: you can log in now

});

async function start()
{
  await client.connect();
  app.listen(3000, () => console.log("Helpdesk is listening on port 3000"));
}

start();
