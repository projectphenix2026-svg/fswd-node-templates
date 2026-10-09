// try.js - starts the items service (app.js), asks both of its services once, and stops it again.
//   node u5-class-03/try.js
const { spawn } = require("child_process");

const service = spawn("node", ["u5-class-03/app.js"], { stdio: "inherit" });
const pause = (ms) => new Promise((done) => setTimeout(done, ms));
const address = "http://localhost:3000/api/items";

async function up()
{
  for (let i = 0; i < 40; i++)
  {
    await pause(250);
    try
    {
      await fetch(address);
      return true;
    }
    catch (err)
    {
      // not listening yet: ask again
    }
  }
  return false;
}

async function run()
{
  if (!(await up()))
  {
    console.log("app.js did not start listening on port 3000");
  }
  else
  {
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Stapler", qty: 6 })
    };
    const added = await fetch(address, options);
    console.log("POST /api/items  ->  " + added.status + " " + (await added.text()));
    const reply = await fetch(address);
    const list = await reply.json();
    console.log("GET /api/items   ->  " + reply.status + ", " + list.length + " item(s): " + list.map((item) => item.name + " x " + item.qty).join(", "));
  }
  service.kill();
  setTimeout(() => process.exit(0), 200);
}

run();
