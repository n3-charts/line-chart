module.exports = function(gulp, $, paths) {
  // Typescript linting the source files
  gulp.task('ts:lint:source', function () {
    return gulp.src(paths.source.from)
    .pipe($.tslint()).pipe($.tslint.report('prose'));
  });

  // Typescript linting the test files
  gulp.task('ts:lint:spec', function () {
    return gulp.src(paths.spec.from)
    .pipe($.tslint()).pipe($.tslint.report('prose'));
  });

  gulp.task('ts:lint:e2e', function () {
    return gulp.src(paths.e2e.from)
    .pipe($.tslint()).pipe($.tslint.report('prose'));
  });
};
