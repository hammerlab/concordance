/*global module*/
module.exports = function (grunt) {
  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    qunit: {
      src: ['test/index.html']
    },
    jshint: {
      all: [
        'Gruntfile.js',
        'viewer/**/*.js',
        'test/**/*.js'
      ],
      options: {
        jshintrc: '.jshintrc',
        ignores: ['viewer/concordance-data.js'],
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('test', 'qunit:src');
  grunt.registerTask('travis', ['lint', 'test']);
};
