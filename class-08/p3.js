const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
const client = new MongoClient("mongodb://localhost:27017");
const users = client.db("helpdesk").collection("users");

app.use(express.urlencoded({ extended: true }));
app.use(express.static("class-08/public"));

app.get("/courses/:course", async (req, res) =>
{
  // Practice · who has registered from one course?   /courses/CSE
  // 1. const list = wait for users.find({ course: req.params.course }).toArray();
  // 2. reply with JSON: an array of their emails only   ["asha@college.edu","meera@college.edu"]
  //      list.map((u) => u.email) makes that array

});

async function start()
{
  await client.connect();
  app.listen(3000, () => console.log("Helpdesk is listening on port 3000"));
}

start();
