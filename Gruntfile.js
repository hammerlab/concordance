/*global module*/
module.exports = function(grunt) {
  'use strict';

  var jsSources = [
    'Gruntfile.js',
    'viewer/**/*.js',
    'test/**/*.js',
    '!viewer/concordance-data.js'
  ];

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    qunit: {
      src: ['test/index.html']
    },
    jshint: {
      all: jsSources,
      options: {
        jshintrc: '.jshintrc',
        ignores: ['viewer/concordance-data.js']
      }
    },
    jscs: {
      src: jsSources
    }
  });

  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jscs-checker');

  grunt.registerTask('test', 'qunit:src');
  grunt.registerTask('travis', ['test', 'jshint', 'jscs']);
};
