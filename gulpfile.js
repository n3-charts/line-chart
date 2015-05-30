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
    to: 'build/'
  }
};

gulp.task('clean:tmp', function () {
    return gulp.src(['.tmp/', 'coverage/'], {read: false})
      .pipe(clean());
});

gulp.task('clean:build', function () {
    return gulp.src(['.tmp/', 'coverage/'], {read: false})
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
    'node_modules/expect.js/index.js',
    'node_modules/angular/angular.js',
    'node_modules/angular-mocks/angular-mocks.js',
    'node_modules/d3/d3.js',
    paths.tests.to + 'src/utils/*.js',
    paths.tests.to + 'src/factories/*.js',
    paths.tests.to + 'src/linechart.js',
    paths.tests.to + 'src/app.js',
    paths.tests.to + 'test/unit/**/*.js'
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
    .pipe(coveralls());
})

gulp.task('default', ['build']);

gulp.task('build', function(callback) {
  return runSequence('clean:tmp',
    'clean:build',
    ['tslint', 'compile:source'],
    'test',
    'clean:tmp',
  callback);
});

gulp.task('travis', function(callback) {
  return runSequence('clean:tmp',
    'clean:build',
    ['tslint', 'compile:source'],
    'test',
    'coveralls',
    //'clean:tmp',
  callback);
});
