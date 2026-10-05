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
  // Task 2 · check the login against the database
  // 1. const user = wait for users.findOne({ ... }) with two fields from req.body:  email, password
  // 2. if user is null: reply with the status 401 and the text  Wrong email or password  and return
  // 3. otherwise reply  Welcome back, asha@college.edu  with the email of the user that was found

});

async function start()
{
  await client.connect();
  app.listen(3000, () => console.log("Helpdesk is listening on port 3000"));
}

start();
