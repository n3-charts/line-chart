
var gulp   = require('gulp');
var $ = require('gulp-load-plugins')();
var runSequence = require('run-sequence');
var karma = require('karma').server;
var protractor = require('gulp-protractor').protractor;
var webdriver = require('gulp-protractor').webdriver;
var webdriverUpdate = require('gulp-protractor').webdriver_update;

var isWatching = false;

var paths = {
  source: {
    from: 'src/**/*.ts',
    to: '.tmp/build/',
  },

  style: {
    from: 'src/**/*.scss',
    to: '.tmp/build/',
  },

  test: {
    from: 'test/**/*.ts',
    to: '.tmp/test/',
  },
  spec: {
    config: 'test/config/karma.conf.js',
    from: 'test/**/*.spec.ts',
  },
  e2e: {
    config: 'test/config/protractor.conf.js',
    from: 'test/**/*.e2e.ts',
  },
  coverage: {
    to: '.tmp/coverage/',
  }
};

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

// Compile the source files to JavaScript
gulp.task('ts:compile:source', function () {
  return gulp
  .src(paths.source.from)
  .pipe($.typescript({
    module: 'CommonJS',
    out: 'LineChart.js'
  }))
  .pipe(gulp.dest(paths.source.to));
});

// Copy the style file(s)
gulp.task('scss:copy', function () {
  return gulp
  .src(paths.style.from)
  .pipe($.sass())
  .pipe(gulp.dest(paths.style.to));
});

// Compile the test files to JavaScript
gulp.task('ts:compile:spec', function () {
  return gulp
  .src(paths.spec.from)
  .pipe($.typescript({
    module: 'CommonJS',
    sourcemap: true
  }))
  .pipe(gulp.dest(paths.test.to));
});

gulp.task('ts:compile:e2e', function () {
  return gulp
  .src(paths.e2e.from)
  .pipe($.typescript({
    module: 'CommonJS',
    sourcemap: true
  }))
  .pipe(gulp.dest(paths.test.to));
});

// Run the unit tests with karma
gulp.task('test:spec', ['ts:compile:spec'], function(done) {
  karma.start({
    configFile: __dirname + '/' + paths.spec.config,
    singleRun: true,
    coverageReporter: {
      type: 'lcovonly',
      dir: paths.coverage.to
    }
  }, function() {done()});
});

// Compile the Jinja test templates
gulp.task('jinja:compile:e2e', function() {
  // Configure the Nunjucks options
  $.nunjucksRender.nunjucks.configure(['test']);
  return gulp.src('test/**/*.tpl.html')
    .pipe($.nunjucksRender())
    .pipe($.rename(function(path) {
      pos = path.basename.search('.tpl');
      path.basename = path.basename.substring(0, pos);
    }))
    .pipe(gulp.dest(paths.test.to));
});

// Serve the static files
gulp.task('server', $.serve({
    root: ['.tmp', 'node_modules'],
    port: 1234
  })
);

// Serving files via `gulp serve`
gulp.task('serve', function(callback){
  isWatching = true;
  return runSequence(
    ['ts:compile:source', 'scss:copy', 'jinja:compile:e2e'],
    ['server'],
  callback);
});

// Update webdriver and selenium
gulp.task('webdriver', webdriver);
gulp.task('webdriver:update', webdriverUpdate);

// Run the integration tests with protractor
gulp.task('test:e2e', [
  'webdriver:update', 'webdriver', 'ts:lint:e2e', 'ts:compile:e2e', 'jinja:compile:e2e', 'scss:copy', 'server'
], function() {
  return gulp.src(paths.e2e.from)
    .pipe(protractor({
        configFile: paths.e2e.config,
        keepAlive: false,
    }))
    .on('error', function(err) { throw err; });
});

// Extensive watch on the source and unit test files
var watchTasks = [
  'ts:lint:source', 'ts:lint:spec', 'ts:compile:source', 'test:spec', 'scss:copy'
];
gulp.task('watch', watchTasks, function () {
  isWatching = true;
  gulp.watch([paths.source.from, paths.test.from, paths.style.from], [watchTasks])
});

// Submit code coverage to Coveralls
gulp.task('coveralls', ['clean:coverage'], function() {
  gulp.src(paths.coverage.to + '**/lcov.info')
    .pipe($.coveralls());
});

// Default task running `gulp`
gulp.task('default', ['build']);

// Build the library and run unit tests
gulp.task('build', function(callback) {
  return runSequence(
    ['clean:source', 'clean:test'],
    ['ts:lint:source', 'ts:compile:source', 'scss:copy'],
    ['ts:lint:spec', 'test:spec'],
  callback);
});

// Build the library, run unit and integration tests
// and report the coverage to Coveralls
gulp.task('travis', function(callback) {
  return runSequence(
    ['clean:source', 'clean:test'],
    ['ts:lint:source', 'ts:compile:source', 'scss:copy'],
    ['ts:lint:spec', 'test:spec'],
    ['ts:lint:e2e', 'test:e2e'],
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
