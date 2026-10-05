const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
const client = new MongoClient("mongodb://localhost:27017");
const users = client.db("helpdesk").collection("users");

app.use(express.urlencoded({ extended: true }));
app.use(express.static("class-08/public"));

app.post("/register", async (req, res) =>
{
  // Practice · nobody registers twice with one email
  // 1. const old = wait for users.findOne({ email: req.body.email });
  // 2. if old is not null: reply with the status 409 and the text  Already registered  and return
  // 3. otherwise store the three fields with insertOne, and reply 201  Registered: you can log in now

});

async function start()
{
  await client.connect();
  app.listen(3000, () => console.log("Helpdesk is listening on port 3000"));
}

start();
