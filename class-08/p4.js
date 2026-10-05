const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
const client = new MongoClient("mongodb://localhost:27017");
const users = client.db("helpdesk").collection("users");
const tickets = client.db("helpdesk").collection("tickets");

app.use(express.urlencoded({ extended: true }));
app.use(express.static("class-08/public"));

app.post("/tickets", async (req, res) =>
{
  // Practice · only a registered student may raise a ticket
  // The request brings four things in its body: email, password, block, problem
  // 1. const user = wait for users.findOne({ ... }) with the email and the password
  // 2. if user is null: reply with the status 401 and the text  Log in first  and return
  // 3. otherwise wait for tickets.insertOne({ ... }) with:
  //      email (the user's), block and problem (from the body), status "open"
  // 4. reply with the status 201 and the text  Ticket raised by asha@college.edu  (the user's email)

});

async function start()
{
  await client.connect();
  app.listen(3000, () => console.log("Helpdesk is listening on port 3000"));
}

start();
