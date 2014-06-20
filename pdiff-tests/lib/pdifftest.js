var base64 = require('./base64'),
    fs = require('fs');

function makeid(n) {
  var text = "";
  var possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < n; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

function _randomTempDir() {
  return '/tmp/' + makeid(8);
}

// Decode a "data:" URL and write it to disk.
function _dataUrlToDisk(dataUrl, destinationPath) {
  var pngHeader = 'data:image/png;base64,';
  if (dataUrl.substr(0, pngHeader.length) != pngHeader) {
    throw "data URL lacked PNG header: " + dataUrl.substr(0, 20);
  }
  var data64 = dataUrl.substr(pngHeader.length);
  var rawPngStr = base64.decodeToString(data64);
  fs.write(destinationPath, rawPngStr, 'wb');
}

/**
 * @param {string} actual_data data: URL for actual screenshot
 * @param {string} expected_data data: URL for expected screenshot
 * @param {string} diff_data data: URL for the perceptual diff.
 * @return {string} Path to index.html for viewing the diff.
 */
function writeDiffFamily(actual_data, expected_data, diff_data) {
  var dir = _randomTempDir();
  fs.makeDirectory(dir);
  var base = dir + fs.separator;

  _dataUrlToDisk(actual_data, base + 'actual.png');
  _dataUrlToDisk(expected_data, base + 'expected.png');
  _dataUrlToDisk(diff_data, base + 'diff.png');

  var index = base + 'index.html';
  fs.copy('pdiff-tests/lib/diff-viewer.html', index);
  return index;
}

module.exports = {
  startTest: function(casper, relativePath, cb) {
    casper.start(relativePath, function() {
      // TODO(danvk): find a copy of this in NPM
      phantom.injectJs('pdiff-tests/lib/pdiffy.js');

      casper.page.evaluate(function() {
        document.body.bgColor = 'white';
      });

      cb();
    });
  },

  takeScreenshot: function(casper, area) {
    // To capture a screenshot to a file, use this:
    actual_screenshot = 'data:image/png;base64,' + casper.captureBase64('png', area);
    return actual_screenshot;
  },

  checkAgainstGolden: function(casper, actual_screenshot, goldenPath) {
    var results, expected_screenshot;

    // compare the screenshot against a known baseline
    casper.then(function() {
      var absPath = fs.absolute(goldenPath);
      var xhr = new XMLHttpRequest();
      xhr.open('GET', 'file://' + absPath, false);
      xhr.responseType = 'arraybuffer';
      xhr.onload = function(e) {
        var data64 = base64.base64ArrayBuffer(e.currentTarget.response);
        expected_screenshot = 'data:image/png;base64,' + data64;

        pdiffy(actual_screenshot)
          .compareTo(expected_screenshot)
          .onComplete(function(data) {
            results = data;
          });
      };
      xhr.send();
    });

    // Wait for the async compareTo(...) to return, then do assertion check
    // for test results
    casper.waitFor(function check() {
      return (results !== undefined);
    }, function then() {
      if (results.misMatchPercentage != "0.00") {
        var indexFile = writeDiffFamily(actual_screenshot, expected_screenshot, results.getImageDataUrl());
        console.log('Actual screenshot did not match expected.');
        console.log('See ' + indexFile + ' for diffs');
      }

      casper.test.assertEquals(results.misMatchPercentage, "0.00",
          "Expected and actual screenshots match");
    });
  }
};
