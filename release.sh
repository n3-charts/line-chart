#!/usr/bin/env bash

if [ "$(git branch | grep \* | egrep -o '\w+')" != "master" ]; then
  echo "You can only release on master. Please don't do that again."
  exit 1
fi

git diff --quiet HEAD
if [ "$?" -eq 1 ]; then
  echo "Please start from a clean state. Git found some changes (and it never lies)."
  exit 1
fi

VERSION_NAME=""
OLD_VERSION=`grep version package.json | tr -d ' ' | grep -e '(\d+\.?)+' -P -o`

increment() {
  regex="([0-9]+).([0-9]+).([0-9]+)"

  [[ $1 =~ $regex ]]
  major="${BASH_REMATCH[1]}"
  minor="${BASH_REMATCH[2]}"
  patch="${BASH_REMATCH[3]}"

  let "patch++"

  echo "$major.$minor.$patch"
}

rollback() {
  grunt bumpup:$OLD_VERSION > /dev/null
  echo "Version has been rolled back to $OLD_VERSION in package.json and bower.json"
  exit 1
}

VERSION=`increment $OLD_VERSION`
TAG_NAME="v$VERSION"

while getopts n: flag
  do
    case $flag in
      n)
        VERSION_NAME=$OPTARG
        ;;
      ?)
        exit
        ;;
    esac
  done


if [ "$VERSION_NAME" = "" ]; then
  echo "Please give a name to that new version (like ludicrous-limbo, for example)"
  exit 1
fi

echo "Incrementing version to $VERSION in package.json and bower.json"
grunt bumpup:$VERSION > /dev/null

echo "Building project with new version $VERSION..."
grunt build || rollback

git commit -am "Released version $VERSION"

git tag -a $VERSION -m "$VERSION_NAME ($TAG_NAME)"

git push origin master && git push --tags
