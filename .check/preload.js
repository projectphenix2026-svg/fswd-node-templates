// .check/preload.js - loaded in front of a program while it is being checked (node -r).
// Every database the program names is given the check's own prefix: client.db("helpdesk") becomes a database
// that belongs to the check alone. The program itself is not changed, and outside a check this file is not used.
const prefix = process.env.CHECK_DB_PREFIX || '';
if (prefix)
{
  const { MongoClient } = require('mongodb');
  const db = MongoClient.prototype.db;
  MongoClient.prototype.db = function (name, options)
  {
    return db.call(this, prefix + (name || 'test'), options);
  };
}
