const Valkey = require("iovalkey");

const cache = new Valkey();
const item = { name: "Calculator", foundAt: "Library" };

async function main()
{
  // Drill 4 · a note with an expiry
  // 1. wait for cache.set with the key "item:Calculator", the value JSON.stringify(item), and an expiry of 60 seconds
  // 2. const kept = wait for cache.get("item:Calculator");
  // 3. const back = JSON.parse(kept);
  // 4. print:   Calculator, found at Library     (from back.name and back.foundAt)

  await cache.quit();
}

main();
