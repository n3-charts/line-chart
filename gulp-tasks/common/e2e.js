module.exports = function(gulp, $, paths) {
  gulp.task('e2e:compile', function () {
    return gulp
    .src(paths.e2e.from)
    .pipe($.typescript({
      module: 'CommonJS',
      sourcemap: true
    }))
    .pipe(gulp.dest(paths.test.to));
  });
};
