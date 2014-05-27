/**
 * This is a test helper which loads all the relevant JS into a new context.
 */

var vm = require("vm"),
    fs = require("fs"),
    jsdom = require("jsdom");

// In dependency order.
var js_files = [
  "node_modules/d3/d3.min.js",
  "node_modules/underscore/underscore-min.js",
  "viewer/d3.stacked-bar-chart.js"
];

var concatenatedJs = js_files.map(function(path) {
  return fs.readFileSync(path);
}).join("\n");

/** @constructor */
var d3sandbox = function() {
  this.document = jsdom.jsdom("<html><head></head><body></body></html>");
  this.sandbox = {
    console: console,
    Date: Date,
    document: this.document,
    window: this.document.createWindow()
  };

  vm.runInNewContext(concatenatedJs, this.sandbox);

  // convenience accessors
  this.d3 = this.sandbox.d3;
  this.window = this.sandbox.window;
}

module.exports = {
  create: function() {
    return new d3sandbox();
  }
};
