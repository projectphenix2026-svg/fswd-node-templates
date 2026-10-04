// .check/run.js - checks one task of a class.   npm run check c6-T1 K7QF
// The first word names the task; the second is the key shown on the task's card on the class page.
// It holds no answer. It gives your work a database of its own (never the one you practise in), runs your file the
// way you would, and compares what came back, or what the database then holds, with what the task asks for.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { MongoClient } = require('mongodb');

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
  const env = Object.assign({}, process.env, { MONGO_URL: URL, MONGO_DB: part.db });
  const cmd = 'node ' + [part.file].concat(part.args || []).join(' ');
  const out = spawnSync('node', [part.file].concat(part.args || []), { cwd: ROOT, encoding: 'utf8', timeout: part.wait || 20000, env: env });
  if (out.status !== 0)
  {
    const line = tidy(out.stderr).split('\n').filter(l => /Error/.test(l))[0] || (out.status == null ? 'it did not end: close the connection with client.close()' : 'it did not finish');
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
