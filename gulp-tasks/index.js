module.exports = function(gulp, $, paths) {
  [
    './clean',
    './ts-lint',
    './ts-compile',
    './e2e-tests',
    './demo',
    './unit-tests',
    './coveralls',
    './scss'
  ].forEach(function(file) {
    require(file)(gulp, $, paths);
  });
};
