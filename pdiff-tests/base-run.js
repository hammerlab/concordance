// Initialise Casper, and instruct it to do lots of logging
var casper = require('casper').create({	
  verbose:true,
  logLevel: "debug"
});
var fs = require('fs');
var base64 = require('./base64');

// NOTE: Paths are relative to the directory where you run casperjs, not
// relative to this test.
casper.start('viewer/concordance.html', function() {
  // TODO(danvk): find a copy of this in NPM
  phantom.injectJs('pdiffy/pdiffy.js');

  // To capture a screenshot to a file, use this:
  // this.capture('concordance.png');
  actual_screenshot = 'data:image/png;base64,' + this.captureBase64('png');

  fs.write('/tmp/screenshot2.txt', actual_screenshot, 'w');
});

var results;

// compare the screenshot against a known baseline
casper.then(function() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'file:///Users/danvk/github/concordance/concordance.png', false);
  xhr.responseType = 'arraybuffer';
  xhr.onload = function(e) {
      var data64 = base64.base64ArrayBuffer(e.currentTarget.response);
      expected_screenshot = 'data:image/png;base64,' + data64;
      fs.write('/tmp/screenshot.txt', expected_screenshot, 'w');
      console.log('len(actual_screenshot)', actual_screenshot.length);
      console.log('len(expected_screenshot)', expected_screenshot.length);

      pdiffy(actual_screenshot).compareTo(expected_screenshot).onComplete(function(data){
        console.log('compare returned');
        results = data;
        console.log(JSON.stringify(results));
      });

  };
  xhr.send();
});

// Wait for the async compareTo(...) to return, then do assertion check for test results
casper.waitFor(function check() {
  return (results!== undefined);
}, function then() {
  // this.test.assertEquals(results.misMatchPercentage, "0.00", "Expected and actual screenshots match");
  // The following will return the base64 representation of the pdiff results - highlighting areas 
  // that are different
  //results.getImageDataUrl();
});

casper.run();
