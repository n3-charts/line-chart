#! /usr/bin/env bash

npm install
node node_modules/typings/dist/bin.js install
node node_modules/gulp/bin/gulp.js