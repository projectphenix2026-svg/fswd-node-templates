const express = require("express");
const Valkey = require("iovalkey");

const app = express();
const cache = new Valkey();

app.get("/visits", async (req, res) =>
{
  // Practice · count the visits to the notice board
  // 1. const n = wait for cache.incr("visits");     (incr adds 1 to the number kept, and gives the new number)
  // 2. reply with the words and the number:   Visit number 1

});

app.listen(3000, () => console.log("Helpdesk is listening on port 3000"));
