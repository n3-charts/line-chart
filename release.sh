#!/usr/bin/env bash
set -e
currentVersion=`cat package.json | grep version | sed 's/[",:]//g' | awk '{print $2}'`

# Eventually we'll have a branch named v2, I guess ?
if [ "$(git branch | grep \* | egrep -o '\w+')" != "master" ]; then
  echo "You can only release on master. Please don't do that again."
  exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
  echo "Uncommitted changes in this directory, aborting !";
  exit 1
fi

if [ "$1" == "" ]; then
  a=( ${currentVersion//./ } )
  ((a[2]++))

  read -r -p "Do you want to release ${a[0]}.${a[1]}.${a[2]} ? [Y/n] " response
  if [[ $response =~ ^([nN][oO]|[nN])$ ]]
  then
    echo 'Aborting, have a good day'
    exit 0
  else
    newVersion="${a[0]}.${a[1]}.${a[2]}"
  fi
else
  newVersion=$1
fi

echo "Releasing ${newVersion} (previous was ${currentVersion})"
release-it $1

rm -r build
