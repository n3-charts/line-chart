module.exports = function(gulp, $, paths) {
  [
    './common/clean',
    './common/coveralls',
    './common/e2e',
    './common/new-e2e-test',
    './common/scss',
    './common/server',
    './common/ts-lint',
    './common/unit-tests',

    './angularjs/demo',
    './angularjs/e2e-tests',
    './angularjs/ts-compile',

    './react/demo',
    './react/e2e-tests',
    './react/ts-compile',

  ].forEach(function(file) {
    require(file)(gulp, $, paths);
  });
};
