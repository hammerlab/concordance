/*global module*/
module.exports = function (grunt) {
  'use strict';

  var gruntConfig = {};
  grunt.loadNpmTasks('grunt-contrib-qunit');
  gruntConfig.qunit = {
    src: ['test/index.html']
  };

  grunt.loadNpmTasks('grunt-contrib-jshint');
  gruntConfig.jshint = {
    options: {
      jshintrc: '.jshintrc'
    },
    allFiles: [
      'Gruntfile.js',
      'viewer/**/*.js',
      'test/**/*.js'
    ]
  };

  grunt.registerTask('test', 'qunit:src');
  grunt.registerTask('travis', ['lint', 'test']);
  grunt.initConfig(gruntConfig);
};
