#!/usr/bin/env bash
set -e

# Eventually we'll have a branch named v2, I guess ?
if [ "$(git branch | grep \* | egrep -o '\w+')" != "dev" ]; then
  echo "You can only release on dev. Please don't do that again."
  exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
  echo "Uncommitted changes in this directory, aborting !";
  exit 1
fi

if [ "$1" == "" ]; then
  echo "Missing version number, aborting !"
  echo "Usage: ./release.sh 2.0.0-beta3"
  exit 1
fi

release-it $1

rm -r build
