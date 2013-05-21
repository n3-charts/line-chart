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
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> Angular D3;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    // Task configuration.
    watch: {
      options: {
        livereload: true
      },
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      test: {
        files: ['<%= jshint.test.src %>'],
        tasks: [ 'jshint:test', 'karma:unit:run' ],
        options: {
          livereload: false
        }
      }
    },
    karma: {
      options: testConfig('karma.conf.js'),
      unit: {
        background: true
      },
      continuous: {
        singleRun: true
      }
    },

    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      js: {
        src: ['lib/<%= pkg.name %>.js'],
        dest: 'dist/<%= pkg.name %>.js'
      },
      css: {
        src: ['lib/<%= pkg.name %>.css'],
        dest: 'dist/<%= pkg.name %>.css'
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      js: {
        src: '<%= concat.js.dest %>',
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
        src: ['lib/**/*.js', 'test/**/*.js']
      }
    }
  });

  // Default task.
  grunt.registerTask('default', ['jshint', 'karma:continuous', 'concat', 'uglify']);

  grunt.registerTask('fast-build', ['concat', 'uglify']);

  grunt.registerTask('test', ['karma:unit', 'watch:test']);

};
