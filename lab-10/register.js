const { MongoClient } = require("mongodb");
const given = require("./items.json");

// the address of the database: this Codespace's own, unless another is named when the program is started
const address = process.env.DB_ADDRESS || "mongodb://localhost:27017";
const client = new MongoClient(address, { serverSelectionTimeoutMS: 3000 });
const items = client.db("lostfound").collection("items");

async function main()
{
  await client.connect();
  // STEP A · load the register
  // 1. empty the collection:  wait for items.drop()
  // 2. wait for items.insertMany(given)       (given is the array of ten items from items.json)
  // 3. count the documents, and print:   Loaded 10 items

  // STEP B · a new item handed in:   node lab-10/register.js Spectacles Other Auditorium
  // 1. const name = process.argv[2];           (the category is process.argv[3], the place process.argv[4])
  // 2. only if a name was given: wait for items.insertOne with five fields:
  //      name, category, foundAt, daysHeld: 0, claimed: false
  //    and print:   Added Spectacles

  // STEP C · the students' three questions: each is one find with toArray, and one line printed
  //   Held more than 7 days: Calculator, Power bank, Water bottle, Umbrella      filter: daysHeld greater than 7
  //   Electronics: Calculator, Earphones, Power bank                              filter: category "Electronics"
  //   Claimed: ID card holder, Notebook                                           filter: claimed true

  // STEP D · when the database cannot be reached
  // Put everything from  await client.connect();  down to the last question inside  try { ... }
  // After it:  catch (error) { ... }  that prints   Could not reach the lost and found: + error.message
  // await client.close();  stays after both, so that the program always ends.

  await client.close();
}

main();
