/*global module*/
module.exports = function (grunt) {
  'use strict';
 
  var gruntConfig = {};
  grunt.loadNpmTasks('grunt-contrib-qunit');
  gruntConfig.qunit = {
      src: ['test/index.html']
  };
  grunt.registerTask('test', 'qunit:src');
  grunt.registerTask('travis', [/*'lint',*/'test']);
  grunt.initConfig(gruntConfig);
};
