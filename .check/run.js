// .check/run.js - checks one task of a class.   npm run check c6-T1 K7QF
// The first word names the task; the second is the key shown on the task's card on the class page.
// It holds no answer. It gives your work a database of its own (never the one you practise in), runs your file the
// way you would, and compares what came back, or what the database then holds, with what the task asks for.
const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn, spawnSync } = require('child_process');
const { MongoClient } = require('mongodb');

// Valkey, for the tasks that use the cache (Class 9 on). A program is checked on database number 15 of the Valkey
// server, which the check empties first; your own keys, in database 0, are never touched.
const CACHE_DB = 15;
function valkey(db)
{
  const Valkey = require('iovalkey');
  return new Valkey({ db: db, lazyConnect: true, maxRetriesPerRequest: 1, retryStrategy: () => null });
}
const NO_CACHE = 'Valkey does not answer. Run  npm run setup  once, then try again.';

const URL = (process.env.MONGO_URL || 'mongodb://localhost:27017').replace(/\/+$/, '');
const ROOT = path.join(__dirname, '..');
const [id, key] = process.argv.slice(2);

function stop(line)
{
  console.log(line);
  process.exit(1);
}

if (!id) stop('Name the task and the key from its card, for example:  npm run check c6-T1 K7QF');
if (!/^[a-z]\d+-[A-Z]\d+$/.test(id)) stop('"' + id + '" is not a task name. A task is named like c6-T1: copy the command from the card.');
const specFile = path.join(__dirname, 'tasks', id + '.json');
if (!fs.existsSync(specFile)) stop('There is no task named ' + id + ' here. Copy the command from the task\'s card.');
if (!key) stop('The key is missing. Copy the whole command from the task\'s card: it ends with a short key.');
const spec = JSON.parse(fs.readFileSync(specFile, 'utf8'));

// the result code: worked out from the key, so it fits only the card that showed that key
function code(k, task)
{
  const f = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h; };
  return (f(k + ':' + task).toString(36).toUpperCase() + f(task + '/' + k).toString(36).toUpperCase()).replace(/[O0I1]/g, 'X').slice(0, 6);
}

let wrong = 0;
const say = line => { wrong++; console.log('NOT YET: ' + line); };
const ok = line => console.log('ok  ' + line);
const tidy = t => String(t || '').replace(/\r/g, '').split('\n').map(l => l.replace(/\s+/g, ' ').trim()).filter(Boolean).join('\n');

// the student's file, without its comment lines
function read(file)
{
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) { say('the file ' + file + ' is missing'); return null; }
  return fs.readFileSync(full, 'utf8').replace(/^\s*\/\/.*$/gm, '').trim();
}

function sourceChecks(text, list)
{
  let fine = true;
  (list || []).forEach(c =>
  {
    if (c.has && !new RegExp(c.has).test(text)) { say(c.msg); fine = false; }
    if (c.lacks && new RegExp(c.lacks).test(text)) { say(c.msg); fine = false; }
  });
  return fine;
}

// the check's own cache: emptied, then given what the task starts from
async function cacheSeed(part)
{
  if (!part.cache) return true;
  let c = null;
  try
  {
    c = valkey(CACHE_DB);
    await c.connect();
    await c.flushdb();
    for (const k of Object.keys(part.cache))
    {
      const v = part.cache[k];
      if (Array.isArray(v)) await c.set(k, String(v[0]), 'EX', v[1]);
      else await c.set(k, String(v));
    }
  }
  catch (e) { say(NO_CACHE); return false; }
  finally { if (c) c.disconnect(); }
  return true;
}

// what Valkey holds afterwards
async function cacheChecks(db, list)
{
  if (!list || !list.length) return;
  let c = null;
  try
  {
    c = valkey(db);
    await c.connect();
    for (const k of list)
    {
      const v = await c.get(k.key);
      const ttl = await c.ttl(k.key);
      let fine = true;
      if (k.absent && v !== null) fine = false;
      if (k.equals != null && v !== String(k.equals)) fine = false;
      if (k.ttlMin != null && !(ttl >= k.ttlMin)) fine = false;
      if (k.ttlMax != null && !(ttl >= 0 && ttl <= k.ttlMax)) fine = false;
      if (!fine) { say(k.msg); break; }
      if (k.ok) ok(k.ok);
    }
  }
  catch (e) { say(NO_CACHE); }
  finally { if (c) c.disconnect(); }
}

// mongosh, as typed in the terminal: quiet, on the check's own database
function shell(db, args)
{
  const out = spawnSync('mongosh', ['--quiet', URL + '/' + db].concat(args), { encoding: 'utf8', timeout: 30000, shell: process.platform === 'win32' });
  return { status: out.status, out: String(out.stdout || ''), err: String(out.stderr || '') + (out.error ? String(out.error.message) : '') };
}

// the first line of an error mongosh printed, in plain words
function why(r)
{
  const line = tidy(r.err + '\n' + r.out).split('\n').filter(l => /Error|error/.test(l))[0];
  return line ? line.slice(0, 160) : 'it did not finish';
}

async function seed(client, db, collections)
{
  await client.db(db).dropDatabase();
  for (const name of Object.keys(collections || {}))
  {
    if (collections[name].length) await client.db(db).collection(name).insertMany(collections[name].map(d => Object.assign({}, d)));
    else await client.db(db).createCollection(name);
  }
}

// what the database holds afterwards
async function after(client, db, checks)
{
  for (const c of checks || [])
  {
    const n = await client.db(db).collection(c.coll).countDocuments(c.filter || {});
    const fine = c.count != null ? n === c.count : n >= (c.min == null ? 1 : c.min);
    if (!fine) say(c.msg);
    else if (c.ok) ok(c.ok);
  }
}

// one command whose answer is compared: db.students.find({ ... })
async function result(client, part)
{
  const text = read(part.file);
  if (text == null) return;
  if (!text) { say(part.file + ' is empty: write your command in it and save'); return; }
  if (!sourceChecks(text, part.source)) return;
  const one = text.replace(/;\s*$/, '');
  await seed(client, part.db, part.seed);
  const script = 'const __v = (' + one + ');\nprint("@@" + EJSON.stringify(__v && typeof __v.toArray === "function" ? __v.toArray() : __v));';
  const tmp = path.join(__dirname, '.run-' + process.pid + '.js');
  fs.writeFileSync(tmp, script);
  const r = shell(part.db, ['--file', tmp]);
  fs.rmSync(tmp, { force: true });
  const m = /@@(.*)$/m.exec(r.out);
  if (!m)
  {
    say(/SyntaxError/.test(r.err + r.out) ? part.file + ' must hold one command, such as db.students.find({ ... }), with every bracket closed' : part.file + ' stopped with an error: ' + why(r));
    return;
  }
  let got = null;
  try { got = JSON.parse(m[1]); } catch (e) { got = null; }
  if (part.expect)
  {
    if (!Array.isArray(got)) { say(part.msg || (part.file + ' must give documents back: use find')); return; }
    const names = got.map(d => String(d && d[part.by])).sort();
    const want = part.expect.map(String).sort();
    if (names.join('|') !== want.join('|'))
    {
      say((part.msg ? part.msg + ' ' : '') + 'On the check\'s data your command gave ' + (names.length ? names.join(', ') : 'nothing') + '; it should give ' + want.join(', ') + '.');
      return;
    }
    if (part.only && got.some(d => Object.keys(d).filter(k => k !== '_id').sort().join(',') !== part.only.slice().sort().join(',')))
    {
      say(part.onlyMsg || ('each document should show only: ' + part.only.join(', ')));
      return;
    }
    if (part.order && got.map(d => String(d[part.by])).join('|') !== part.expect.map(String).join('|'))
    {
      say(part.orderMsg || ('the documents are right but not in the order asked: ' + part.expect.join(', ')));
      return;
    }
    ok(part.file + ' gave ' + want.join(', '));
  }
  if (part.number != null)
  {
    if (got !== part.number) { say((part.msg ? part.msg + ' ' : '') + 'Your command gave ' + JSON.stringify(got) + '; it should give ' + part.number + '.'); return; }
    ok(part.file + ' gave ' + part.number);
  }
  await after(client, part.db, part.after);
}

// a file of commands that change the database: insertOne, updateOne, deleteOne ...
async function apply(client, part)
{
  const text = read(part.file);
  if (text == null) return;
  if (!text) { say(part.file + ' is empty: write your commands in it and save'); return; }
  if (!sourceChecks(text, part.source)) return;
  await seed(client, part.db, part.seed);
  const r = shell(part.db, ['--file', path.join(ROOT, part.file)]);
  if (r.status !== 0) { say(part.file + ' stopped with an error: ' + why(r)); return; }
  const before = wrong;
  await after(client, part.db, part.after);
  if (wrong === before) ok(part.file + ' left the database as the task asks');
}

// a Node program: run as you would run it, and what it printed is compared
async function run(client, part)
{
  if (!fs.existsSync(path.join(ROOT, part.file))) { say('the file ' + part.file + ' is missing'); return; }
  const text = fs.readFileSync(path.join(ROOT, part.file), 'utf8').replace(/\/\/.*$/gm, '');
  if (!sourceChecks(text, part.source)) return;
  if (part.seed) await seed(client, part.db, part.seed);
  if (!(await cacheSeed(part))) return;
  // the program names its database itself, as the examination asks: client.db("helpdesk"). The preload gives every
  // database name the check's own prefix, so the check never touches the database the student practises in.
  const env = Object.assign({}, process.env, { MONGO_URL: URL, MONGO_DB: part.db || '', CHECK_DB_PREFIX: part.prefix || '', CHECK_CACHE_DB: part.cache ? String(CACHE_DB) : '' });
  const cmd = 'node ' + [part.file].concat(part.args || []).join(' ');
  const pre = part.prefix || part.cache ? ['-r', path.join(__dirname, 'preload.js')] : [];
  const out = spawnSync('node', pre.concat([part.file]).concat(part.args || []), { cwd: ROOT, encoding: 'utf8', timeout: part.wait || 20000, env: env });
  if (out.status !== 0)
  {
    const line = tidy(out.stderr).split('\n').filter(l => /Error/.test(l))[0] || (out.status == null ? (part.cache && !part.seed ? 'it did not end: close the line to the cache with await cache.quit()' : 'it did not end: close the connection with client.close()') : 'it did not finish');
    say(cmd + ' stopped with an error: ' + line);
    return;
  }
  const printed = tidy(out.stdout);
  if (part.expected != null && printed !== tidy(part.expected))
  {
    say(cmd + ' printed ' + (printed ? JSON.stringify(printed) : 'nothing') + ', expected ' + JSON.stringify(tidy(part.expected)));
    return;
  }
  const miss = (part.includes || []).filter(t => printed.indexOf(tidy(t)) < 0)[0];
  if (miss != null) { say(part.msg || (cmd + ' did not print ' + JSON.stringify(miss))); return; }
  const extra = (part.excludes || []).filter(t => printed.indexOf(tidy(t)) >= 0)[0];
  if (extra != null) { say(part.msg || (cmd + ' should not print ' + JSON.stringify(extra))); return; }
  ok(cmd);
  await after(client, part.db, part.after);
  await cacheChecks(CACHE_DB, part.cacheAfter);
}

// one real request to the program's server, and what came back
function ask(port, r)
{
  return new Promise(resolve =>
  {
    let body = null;
    const headers = {};
    if (r.form) { body = Object.keys(r.form).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(r.form[k])).join('&'); headers['Content-Type'] = 'application/x-www-form-urlencoded'; }
    if (r.send) { body = JSON.stringify(r.send); headers['Content-Type'] = 'application/json'; }
    if (body != null) headers['Content-Length'] = Buffer.byteLength(body);
    const req = http.request({ host: '127.0.0.1', port: port, path: r.path, method: r.method || 'GET', headers: headers, timeout: 8000 }, res =>
    {
      let text = '';
      res.setEncoding('utf8');
      res.on('data', d => { text += d; });
      res.on('end', () => resolve({ status: res.statusCode, text: text }));
    });
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, text: '', none: 'gave no answer in 8 seconds: every path through the route must end with res.send, res.json or res.status(…).send' }); });
    req.on('error', e => resolve({ status: 0, text: '', none: 'could not be asked (' + e.code + ')' }));
    if (body != null) req.write(body);
    req.end();
  });
}

// a server: started as you would start it, asked real requests, and its answers compared
async function serve(client, part)
{
  if (!fs.existsSync(path.join(ROOT, part.file))) { say('the file ' + part.file + ' is missing'); return; }
  const text = fs.readFileSync(path.join(ROOT, part.file), 'utf8').replace(/\/\/.*$/gm, '');
  if (!sourceChecks(text, part.source)) return;
  if (part.seed) await seed(client, part.db, part.seed);
  if (!(await cacheSeed(part))) return;
  // the check's own door number and database: the student's own server on 3000 and their own data are left alone
  const port = 3900 + Math.floor(Math.random() * 90);
  const env = Object.assign({}, process.env, { MONGO_URL: URL, CHECK_DB_PREFIX: part.prefix || '', CHECK_PORT: String(port), CHECK_CACHE_DB: part.cache ? String(CACHE_DB) : '' }, part.env || {});
  const child = spawn('node', ['-r', path.join(__dirname, 'preload.js'), part.file], { cwd: ROOT, env: env });
  let err = '';
  let printed = '';
  let ended = false;
  child.stderr.on('data', d => { err += d; });
  child.stdout.on('data', d => { printed += d; });
  child.on('exit', () => { ended = true; });
  const wait = ms => new Promise(r => setTimeout(r, ms));
  let up = false;
  for (let i = 0; i < 60 && !ended && !up; i++)
  {
    await wait(250);
    const r = await ask(port, { path: part.ready || '/' });
    up = !r.none;
  }
  try
  {
    if (!up)
    {
      const line = tidy(err).split('\n').filter(l => /Error/.test(l))[0];
      say('node ' + part.file + (ended ? ' stopped' + (line ? ' with an error: ' + line : ' before it listened: the server must connect and then call app.listen(3000)') : ' did not start listening: after the connect, call app.listen(3000)'));
      return;
    }
    const before = wrong;
    for (const r of part.requests || [])
    {
      const got = await ask(port, r);
      const what = (r.method || 'GET') + ' ' + r.path + (r.form ? ' with ' + Object.keys(r.form).map(k => k + '=' + (r.form[k] === '' ? '(empty)' : r.form[k])).join(', ') : '');
      const body = tidy(got.text);
      let fine = !got.none;
      if (fine && r.status != null && got.status !== r.status) fine = false;
      if (fine && (r.has || []).some(t => body.indexOf(t) < 0)) fine = false;
      if (fine && (r.lacks || []).some(t => body.indexOf(t) >= 0)) fine = false;
      if (fine && r.equals != null && body !== tidy(r.equals)) fine = false;
      if (!fine)
      {
        say(r.msg + ' (' + what + (got.none ? ' ' + got.none : ' answered ' + got.status + ' ' + JSON.stringify(body.slice(0, 90))) + ')');
        break;
      }
      ok(what + ' answered ' + got.status + ' ' + JSON.stringify(body.slice(0, 60)));
    }
    if (wrong === before)
    {
      const miss = (part.prints || []).filter(t => tidy(printed).indexOf(tidy(t)) < 0)[0];
      if (miss != null) say(part.printsMsg || ('the server did not print ' + JSON.stringify(miss)));
    }
    if (wrong === before) await after(client, part.db, part.after);
    if (wrong === before) await cacheChecks(CACHE_DB, part.cacheAfter);
  }
  finally
  {
    child.kill();
  }
}

(async () =>
{
  const client = new MongoClient(URL, { serverSelectionTimeoutMS: 5000 });
  try { await client.connect(); }
  catch (e) { stop('The database does not answer. Wait a minute after the Codespace opens, then run  npm run hello  and try again.'); }
  try
  {
    for (const part of spec.parts)
    {
      if (part.kind === 'result') await result(client, part);
      else if (part.kind === 'apply') await apply(client, part);
      else if (part.kind === 'run') await run(client, part);
      else if (part.kind === 'serve') await serve(client, part);
      else if (part.kind === 'cache')
      {
        // a key typed in valkey-cli: only read, in the database you typed it in
        const before = wrong;
        await cacheChecks(part.db || 0, part.checks);
        if (wrong === before) ok('Valkey holds the key as the task asks');
      }
    }
  }
  finally
  {
    await client.close();
  }
  if (wrong) { console.log('\nFix what is named above, then run the same command again.'); process.exit(1); }
  console.log('\nPASSED. Result code: ' + code(key.toUpperCase(), id));
  console.log('Type this code into the task on the class page.');
})();
