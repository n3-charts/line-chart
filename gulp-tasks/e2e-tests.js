var protractor = require('gulp-protractor').protractor;
var webdriver = require('gulp-protractor').webdriver;
var webdriverUpdate = require('gulp-protractor').webdriver_update;

module.exports = function(gulp, $, paths) {

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
};
