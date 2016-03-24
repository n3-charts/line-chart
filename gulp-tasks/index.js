module.exports = function(gulp, $, paths) {
  [
    './angular/clean',
    './angular/ts-lint',
    './angular/ts-compile',
    './angular/e2e-tests',
    './angular/demo',
    './angular/unit-tests',
    './angular/coveralls',
    './angular/scss'
  ].forEach(function(file) {
    require(file)(gulp, $, paths);
  });
};
