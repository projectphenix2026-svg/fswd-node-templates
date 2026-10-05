#!/bin/bash
# Brings this Codespace up to date:   npm run setup
# It fetches the packages package.json names, and the Valkey command-line tool (valkey-cli) if it is not here yet.
# A new Codespace runs this by itself; one made for an earlier class runs it once, after  git pull
npm install
if ! command -v valkey-cli > /dev/null
then
  sudo apt-get update -qq
  sudo apt-get install -y -qq valkey-tools
fi
if valkey-cli ping > /dev/null 2>&1
then
  echo "Valkey answers: this Codespace is ready"
else
  echo "Valkey does not answer yet: wait a minute and run  npm run setup  again"
fi
