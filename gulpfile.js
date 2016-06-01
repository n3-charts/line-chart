var gulp   = require('gulp');
var $ = require('gulp-load-plugins')();
var runSequence = require('run-sequence');
var abs = require('path').resolve;

var paths = {
  source: {
    from: 'src/**/+([^.]).ts',
    to: '.tmp/build/',
    root: {
      angular: 'src/angularjs/module.ts',
      react: 'src/react/LineChart.ts'
    }
  },
  style: {from: 'src/styles/**/*.scss', to: '.tmp/build/'},
  test: {from: 'src/**/*.spec.ts', to: '.tmp/test/'},
  spec: {config: abs('config/karma.conf.js'), from: 'src/**/*.spec.ts'},
  e2e: {
    config: 'config/protractor.conf.js',
    from: 'e2e/tests/*.e2e.ts',
    templates: 'e2e/test_cases/*.hjson',
    angularjs: {
      single: 'e2e/templates/angularjs/single.html',
      all: 'e2e/templates/angularjs/all.html'
    },
    react: {
      single: 'e2e/templates/react/single.html',
      all: 'e2e/templates/react/all.html'
    }
  },
  coverage: {to: abs('.tmp/coverage/')}
};

require('./gulp-tasks')(gulp, $, paths);

var isWatching = false;

gulp.task('build:angularjs', ['src:compile:angularjs', 'unit:test', 'scss:copy', 'demoSingle:compile:angularjs', 'demoAll:compile:angularjs']);
gulp.task('watch:angularjs', ['build:angularjs'], function () {
  isWatching = true;
  gulp.watch([paths.source.from], ['src:compile:angularjs', 'unit:test']);
  gulp.watch([paths.test.from], ['unit:test']);
  gulp.watch([paths.style.from], ['scss:copy']);
  gulp.watch(
    [paths.e2e.from, paths.e2e.templates, paths.e2e.angularjs.single, paths.e2e.angularjs.all],
    ['demoSingle:compile:angularjs', 'demoAll:compile:angularjs']
  );
});

gulp.task('build:react', ['src:compile:react', 'unit:test', 'scss:copy', 'demoSingle:compile:react', 'demoAll:compile:react']);
gulp.task('watch:react', ['build:react'], function () {
  isWatching = true;
  gulp.watch([paths.source.from], ['src:compile:react']);
  gulp.watch([paths.test.from], ['unit:test']);
  gulp.watch([paths.style.from], ['scss:copy']);
  gulp.watch(
    [paths.e2e.from, paths.e2e.templates, paths.e2e.react.single, paths.e2e.react.all],
    ['demoSingle:compile:react', 'demoAll:compile:react']
  );
});

// Serves files via `gulp serve`
gulp.task('serve:angularjs', function(callback){
  isWatching = true;
  return runSequence(
    ['src:compile:angularjs', 'scss:copy', 'demoSingle:compile:angularjs', 'demoAll:compile:angularjs'],
    ['server'],
    callback);
});

gulp.task('serve:react', function(callback){
  isWatching = true;
  return runSequence(
    ['src:compile:react', 'scss:copy', 'demoSingle:compile:react', 'demoAll:compile:react'],
    ['server'],
    callback);
});

// Builds the library and runs unit tests
gulp.task('build', function(callback) {
  return runSequence(
    ['clean:source', 'clean:test'],
    ['src:compile:angularjs', 'src:compile:react', 'scss:copy'],
    ['unit:test'],
  callback);
});

// Builds the library, runs unit and integration tests
// and reports the coverage to Coveralls
gulp.task('travis:angularjs', function(callback) {
  return runSequence(
    ['clean:source', 'clean:test'],
    ['src:compile:angularjs', 'scss:copy'],
    ['unit:test'],
    ['e2e:test:angularjs'],
    'coveralls',
  callback);
});

gulp.task('travis:react', function(callback) {
  return runSequence(
    ['clean:source', 'clean:test'],
    ['src:compile:react', 'scss:copy'],
    ['unit:test'],
    ['e2e:test:react'],
    'coveralls',
  callback);
});

// Workaround to stop gulp after async task
// https://github.com/gulpjs/gulp/issues/167
gulp.on('stop', function() {
  if (!isWatching) {
    process.nextTick(function() {
      process.exit(0);
    });
  }
});

// Default task running `gulp`
gulp.task('default', ['build']);
