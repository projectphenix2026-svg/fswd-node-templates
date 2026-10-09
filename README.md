# Full Stack Web Development · your Codespace

This Codespace is a computer in the cloud with these things ready:

| | |
|---|---|
| **Node.js** | runs your programs, as in the earlier classes |
| **MongoDB** | a real database server, on this Codespace only |
| **mongosh** | the MongoDB shell: type `mongosh` in the terminal |
| **Valkey** | a real cache server, on this Codespace only; its shell is `valkey-cli` |

## First, once

1. Open the terminal: **Terminal › New Terminal**. If VS Code asks whether you trust the folder, press **Trust Folder & Continue**.
2. Close the Chat panel on the right: in this course you write every command yourself.
3. Check that the database answers:

```
npm run hello
```

It prints `MongoDB answers: this Codespace is ready`.

## When a class's folder is not here

A Codespace made for an earlier class does not have the later folders yet. Fetch them, once:

```
git pull
npm run setup
```

## In a class

Each class has a folder (`class-06`, …; `u5-class-03` is Unit 5 Class 3) with one file for each task. The task's card on the class page names the
file and gives the command that checks it, for example:

```
npm run check c6-T1 K7QF
```

When the work is right the check prints a **result code**: type it into the card on the class page.

## At the end of a sitting

Close the tab. The Codespace stops by itself and opens where you left it next time, from the same button on the class page.
