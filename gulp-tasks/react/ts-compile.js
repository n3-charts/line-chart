module.exports = function(gulp, $, paths) {
  // Compile the source files to JavaScript
  gulp.task('src:compile:react', function () {
    return gulp
      .src(paths.source.root.react)
      .pipe($.typescript({
        module: 'CommonJS',
        out: 'LineChart-react.js'
      }))
      .pipe(gulp.dest(paths.source.to))
      .pipe($.uglify())
      .pipe($.rename({extname: '.min.js'}))
      .pipe(gulp.dest(paths.source.to));
  });
};
