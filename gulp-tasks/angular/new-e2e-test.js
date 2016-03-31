var path = require('path');
var fs = require('fs');
var argv = require('yargs').argv;

module.exports = function(gulp, $, paths) {
  gulp.task('new-e2e-test', function(done) {
    if (!argv.name) {
      throw new Error('Please give a name to this new test (usage : gulp new-e2e-test --name=my_awesome_test)');
    }

    // var target = path.join('e2e/templates/', argv.name, '.hjson');

    fs.stat(path.join('e2e/templates/', argv.name, '.hjson'), function(err, stat) {
      if(err == null) {
        throw new Error(argv.name + ' already exists !');
      } else if(err.code == 'ENOENT') {
        gulp.src('e2e/*.tpl')
          .pipe($.template({name: argv.name}))
          .pipe($.rename(function(file) {
            file.basename = file.basename.replace('new_test', argv.name);
            file.extname = '';
          }))
          .pipe(gulp.dest('e2e/templates/'))
          .on('end', done);
      } else {
        throw err;
      }
    });

  });
};
