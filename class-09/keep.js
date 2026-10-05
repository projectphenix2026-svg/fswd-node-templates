// A value kept in Valkey from a program, and read back.   node class-09/keep.js
const Valkey = require("iovalkey");

const cache = new Valkey();

async function main()
{
  await cache.set("open:C", 1333, "EX", 30);
  const kept = await cache.get("open:C");
  console.log(kept);
  console.log(typeof kept);
  await cache.quit();
}

main();
