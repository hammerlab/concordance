// Initialise Casper, and instruct it to do lots of logging
var fs = require('fs');
var base64 = require('./lib/base64');

casper.test.begin('Concordance example', 1, function(test) {
  // NOTE: Paths are relative to the directory where you run casperjs, not
  // relative to this test.
  casper.start('viewer/concordance.html', function() {
    // TODO(danvk): find a copy of this in NPM
    phantom.injectJs('pdiff-tests/lib/pdiffy.js');

    casper.page.evaluate(function() {
      document.body.bgColor = 'white';
    });

    // To capture a screenshot to a file, use this:
    this.capture('/tmp/actual.png');
    actual_screenshot = 'data:image/png;base64,' + this.captureBase64('png');
  });

  var results;

  // compare the screenshot against a known baseline
  casper.then(function() {

    var absPath = fs.absolute('pdiff-tests/golden/concordance.png');
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'file://' + absPath, false);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function(e) {
      var data64 = base64.base64ArrayBuffer(e.currentTarget.response);
      expected_screenshot = 'data:image/png;base64,' + data64;

      pdiffy(actual_screenshot).compareTo(expected_screenshot).onComplete(function(data){
        results = data;
      });
    };
    xhr.send();
  });

  // Wait for the async compareTo(...) to return, then do assertion check for test results
  casper.waitFor(function check() {
    return (results!== undefined);
  }, function then() {
    if (results.misMatchPercentage != "0.00") {
      var dataUrl = results.getImageDataUrl();
      var pngHeader = 'data:image/png;base64,';
      test.assertEquals(dataUrl.substr(0, pngHeader.length), pngHeader);
      var data64 = dataUrl.substr(pngHeader.length);
      var rawPngStr = base64.decodeToString(data64);

      fs.write('/tmp/diff.png', rawPngStr, 'wb');
    }

    test.assertEquals(results.misMatchPercentage, "0.00", "Expected and actual screenshots match");
  });

  casper.run(function() {
    test.done();
  });
});

