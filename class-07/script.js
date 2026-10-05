const { MongoClient } = require("mongodb");

const client = new MongoClient("mongodb://localhost:27017");

async function main()
{
  await client.connect();
  const books = client.db("library").collection("books");
  await books.insertOne({ title: "Wings of Fire", copies: 3 });
  console.log(await books.find().toArray());
  await books.updateOne({ title: "Wings of Fire" }, { $set: { copies: 4 } });
  console.log((await books.findOne({ title: "Wings of Fire" })).copies + " copies after the update");
  await books.deleteOne({ title: "Wings of Fire" });
  console.log((await books.find().toArray()).length + " book(s) after the delete");
  await client.close();
}

main();
