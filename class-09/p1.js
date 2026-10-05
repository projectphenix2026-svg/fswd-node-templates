const Valkey = require("iovalkey");

const cache = new Valkey();

async function main()
{
  // Practice · keep a value, read it back, remove it
  // 1. wait for cache.set with the key "notice:A" and the value "Lab 3 closed today"
  // 2. read it with cache.get, and print it
  // 3. wait for cache.del("notice:A")
  // 4. read it again, and print what comes back
  // 5. wait for cache.quit()

}

main();
