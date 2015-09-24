module.exports = function(gulp, $, paths) {
  // Clean the temporary build directory
  gulp.task('clean:source', function () {
    return gulp.src(paths.source.to, {read: false})
    .pipe($.clean());
  });

  // Clean the temporary test directory
  gulp.task('clean:test', function () {
    return gulp.src(paths.test.to, {read: false})
    .pipe($.clean());
  });

  // Clean the temporary coverage directory
  gulp.task('clean:coverage', function () {
    return gulp.src(paths.coverage.to, {read: false})
    .pipe($.clean());
  });
};
