var webdriver = require('gulp-protractor').webdriver;
var webdriverUpdate = require('gulp-protractor').webdriver_update;

module.exports = function(gulp, $, paths) {
  // Update webdriver and selenium
  gulp.task('webdriver', webdriver);
  gulp.task('webdriver:update', webdriverUpdate);

  // Serve the static files
  gulp.task('server', $.serve({
      root: ['.tmp', 'node_modules'],
      port: 1234
    })
  );
};
