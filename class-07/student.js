const { MongoClient } = require("mongodb");

const client = new MongoClient("mongodb://localhost:27017");

async function main()
{
  await client.connect();
  const students = client.db("college").collection("students");
  const result = await students.insertOne({ rno: 101, name: "Asha", course: "CSE" });
  console.log("Inserted: " + result.acknowledged);
  const all = await students.find().toArray();
  console.log(all.length + " student(s) in the collection");
  await students.drop();
  await client.close();
}

main();
