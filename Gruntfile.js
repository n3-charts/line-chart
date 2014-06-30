/*global module:false, require:false*/
module.exports = function(grunt) {
  'use strict';

  // Load Deps
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  // Travis doesn't have chrome, so we need to overwrite some options
  var testConfig = function(configFile, customOptions) {
    var options = { configFile: configFile, keepalive: true };
    var travisOptions = process.env.TRAVIS && { browsers: ['Firefox'], reporters: 'dots' };
    return grunt.util._.extend(options, customOptions, travisOptions);
  };

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '###\n<%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("dd mmmm yyyy") %>\n' +
      '<%= pkg.homepage ? pkg.homepage + "\\n" : "" %>' +
      'Copyright (c) <%= grunt.template.today("yyyy") %> n3-charts' +
      '\n###\n',

    bannerjs: '/*\n<%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("dd mmmm yyyy") %>\n' +
      '<%= pkg.homepage ? pkg.homepage + "\\n" : "" %>' +
      'Copyright (c) <%= grunt.template.today("yyyy") %> n3-charts' +
      '\n*/\n',

    watch: {
      files: ['lib/**/*.coffee', 'test/unit/**/*.mocha.coffee'],
      // tasks: ['concat', 'coffeelint', 'coffee', 'karma:unminified', 'uglify', 'karma:minified'],
      tasks: ['concat', 'coffee', 'uglify']

    },

    karma: {
      options: testConfig('karma.conf.js'),

      unminified: {
        singleRun: true,
        autoWatch: false,
        browsers: ['Firefox'],
        options: {
          files: [
            'bower_components/angular/angular.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'bower_components/d3/d3.js',
            'dist/line-chart.js',
            'test/unit/**/*.coffee'
          ],
          preprocessors: {
            'dist/line-chart.js': 'coverage',
            'test/unit/**/*.coffee': 'coffee'
          }
        }
      },

      minified: {
        singleRun: true,
        autoWatch: false,
        browsers: ['Firefox'],
        options: {
          files: [
            'bower_components/angular/angular.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'bower_components/d3/d3.js',
            'dist/line-chart.min.js',
            'test/unit/**/*.coffee'
          ],
          preprocessors: {
            'test/unit/**/*.coffee': 'coffee'
          },
          reporters: ['dots'],
        }
      }
    },

    concat: {
      utils: {
        src: ['lib/utils/*.coffee'],
        dest: '/tmp/utils.coffee',
        options: {
          banner: grunt.file.read('lib/utils/utils.coffee.prefix'),
          footer: grunt.file.read('lib/utils/utils.coffee.suffix'),
          separator: '\n\n',
          process: function(src, filepath) {
            return '# ' + filepath + '\n' + src + '\n# ----\n';
          }
        }
      },
      js: {
        options: {
          banner: '<%= banner %>',
          stripBanners: true,
          process: function(src, filepath) {
            return '# ' + filepath + '\n' + src + '\n# ----\n';
          }
        },
        src: ['lib/<%= pkg.name %>.coffee', '/tmp/utils.coffee'],
        dest: 'dist/<%= pkg.name %>.coffee'
      }
    },

    coffeelint: {
      app: ['dist/<%= pkg.name %>.coffee'],
      options: {
        'max_line_length': {
          'level': 'ignore'
        }
      }
    },

    coffee: {
      options: {
        bare: true
      },
      compile: {
        files: {
          'dist/<%= pkg.name %>.js': 'dist/<%= pkg.name %>.coffee'
        }
      }
    },

    uglify: {
      options: {
        banner: '<%= bannerjs %>'
      },
      js: {
        src: 'dist/<%= pkg.name %>.js',
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      test: {
        src: ['lib/*.js']
      }
    },

    shell: {
      visual: {
        options: {},
        command: './test/visual/scripts/run.py'
      }
    }
  });

  // Default task.
  grunt.registerTask('travis', ['default', 'shell:visual']);
  grunt.registerTask('visual', ['concat', 'coffeelint', 'coffee', 'uglify', 'shell:visual']);
  grunt.registerTask('default', ['concat', 'coffeelint', 'coffee', 'uglify', 'karma:minified']);
};
