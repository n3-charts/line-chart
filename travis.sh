#!/usr/bin/env bash

gulp travis:angularjs || exit 1
gulp travis:react || exit 1

find .tmp -name 'lcov.info' -exec cat {} \; || exit 1

gulp coveralls || exit 1
