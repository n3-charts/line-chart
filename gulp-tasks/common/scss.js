module.exports = function(gulp, $, paths) {
  // Transpiles and copies the style file(s)
  gulp.task('scss:copy', function () {
    return gulp
    .src(paths.style.from)
    .pipe($.sass())
    .pipe($.autoprefixer({
      browsers: ['last 2 versions', '> 10%'],
    }))
    .pipe(gulp.dest(paths.style.to))
    .pipe($.uglifycss())
    .pipe($.rename({extname: '.min.css'}))
    .pipe(gulp.dest(paths.style.to));
  });
};
