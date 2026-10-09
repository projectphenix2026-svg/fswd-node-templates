const { ObjectId } = require("mongodb");

const fromAddress = "6ac931504a64885a883b6c1c";
const id = new ObjectId(fromAddress);

console.log(fromAddress === id);
console.log(ObjectId.isValid(fromAddress));
console.log(ObjectId.isValid("2"));
