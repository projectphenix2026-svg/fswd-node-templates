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

// A server that is being checked listens on the check's own door number, so the server you may have left running
// on 3000 is not disturbed: app.listen(3000) is given that number in place of 3000.
const port = Number(process.env.CHECK_PORT || 0);
if (port)
{
  const net = require('net');
  const listen = net.Server.prototype.listen;
  net.Server.prototype.listen = function (...args)
  {
    if (typeof args[0] === 'number' || typeof args[0] === 'string') args[0] = port;
    else if (args[0] && typeof args[0] === 'object' && 'port' in args[0]) args[0] = Object.assign({}, args[0], { port: port });
    return listen.apply(this, args);
  };
}

// A program that is being checked uses database number 15 of the Valkey server, which belongs to the check:
// new Valkey() is given that number. The keys you keep yourself, in database 0, are left alone.
const cacheDb = process.env.CHECK_CACHE_DB;
if (cacheDb)
{
  const id = require.resolve('iovalkey');
  const loaded = require('iovalkey');
  const Real = typeof loaded === 'function' ? loaded : (loaded.default || loaded.Redis);
  class Checked extends Real
  {
    constructor(...args)
    {
      super({ db: Number(cacheDb) }, ...args);
    }
  }
  Object.keys(loaded).forEach(k => { try { Checked[k] = loaded[k]; } catch (e) { /* a fixed name: left as it is */ } });
  Checked.default = Checked;
  require.cache[id].exports = Checked;
}
