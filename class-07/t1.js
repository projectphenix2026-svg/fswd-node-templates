// Task 1 · read a file with a promise, and wait for it
// The file to read is named after the program:  node class-07/t1.js class-07/notes.txt
const fs = require("fs").promises;

async function main()
{
  // 1. try: wait for fs.readFile(process.argv[2], "utf8") and keep what it gives in  text
  // 2. still inside try: print text
  // 3. catch (error): print  Could not read the file

}

main();
