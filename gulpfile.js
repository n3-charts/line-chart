var gulp   = require('gulp'),
    tsc    = require('gulp-tsc'),
    shell  = require('gulp-shell'),
    runSequence = require('run-sequence'),
    tslint = require('gulp-tslint'),
    karma = require('gulp-karma'),
    coveralls = require('gulp-coveralls'),
    clean = require('gulp-clean');

var paths = {
  tests: {
    from: 'test/**/*.mocha.ts',
    to: '.tmp/'
  },
  source: {
    from: 'src/**/*.ts',
    to: './build/'
  }
};

gulp.task('clean', function () {
    return gulp.src(['.tmp/', 'coverage'], {read: false})
      .pipe(clean());
});

gulp.task('tslint', function () {
    return gulp.src(paths.source.from).pipe(tslint()).pipe(tslint.report('prose'));
});

gulp.task('compile:source', function () {
  return gulp
  .src(paths.source.from)
  .pipe(tsc({
    module: 'CommonJS',
    sourcemap: true,
    emitError: false
  }))
  .pipe(gulp.dest(paths.source.to));
});

gulp.task('compile:tests', function () {
  return gulp
    .src(paths.tests.from)
    .pipe(tsc({
      module: 'CommonJS',
      sourcemap: true,
      emitError: false
    }))
    .pipe(gulp.dest(paths.tests.to));
});


gulp.task('test', ['compile:tests'], function() {
  return gulp.src([
    'node_modules/angular/angular.js',
    'node_modules/expect.js/index.js',
    paths.tests.to + '**/*.js'
  ]).pipe(karma({
    configFile: 'karma.conf.js',
    action: 'run',
    preprocessors: {
      '.tmp/src/**/*.js': ['coverage']
    }
  }))
  .on('error', function() {})
});

gulp.task('watch', ['compile:source', 'test'], function () {
  gulp.watch([paths.tests.from, paths.source.from], [['compile:source', 'test']])
});

gulp.task('coveralls', function() {
  gulp.src('coverage/**/lcov.info')
    .pipe(coveralls({dryRun: true}));
})

gulp.src('test/coverage/**/lcov.info')
  .pipe(coveralls());

gulp.task('default', ['build']);

gulp.task('build', function(callback) {
  return runSequence('clean',
    ['tslint', 'compile:source'],
    'test',
    'clean',
  callback);
});

gulp.task('travis', function(callback) {
  return runSequence('clean',
    ['tslint', 'compile:source'],
    'test',
    'coveralls',
    'clean',
  callback);
});
