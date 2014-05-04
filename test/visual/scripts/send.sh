#! /usr/bin/env bash

mkdir /tmp/computed
cp -a test/visual/.tmp/ready_for_git /tmp/

cd /tmp
git clone https://github.com/n3-charts/line-chart.git
cd line-chart

git config user.email "vaporzub@gmail.com"
git config user.name "Travis CI"
git config credential.helper "store --file=.git/credentials"
echo "https://${GH_TOKEN}:@github.com" > .git/credentials

git checkout gh-pages
cp /tmp/ready_for_git/* data/

git add data/*

git commit -m "Travis CI build ${TRAVIS_BUILD_NUMBER}"
git push origin gh-pages
