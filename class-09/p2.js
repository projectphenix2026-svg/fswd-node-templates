const Valkey = require("iovalkey");

const cache = new Valkey();

async function main()
{
  // Practice · a one-time password that is forgotten after two minutes
  // 1. wait for cache.set with the key "otp:asha", the value "4821", and an expiry of 120 seconds
  // 2. read it with cache.get, and print it
  // 3. wait for cache.quit()

}

main();
