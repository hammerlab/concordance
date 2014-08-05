  //////////////////////
 // Pre-process data //
//////////////////////

var faData = _.reduce(dpfaBinning, function(acc, val, caller) {
  for (var depth in val) {
    for (var fa in val[depth]) {
      acc.push({caller: caller, dp: depth, fa: fa, calls: val[depth][fa]});
    }
  }
  return acc;
}, []);


var concData = _.reduce(concordanceCounts, function(acc, val, key) {
  for (var k in val) {
    acc.push({caller: key, calls: val[k], numConc: k});
  }
  return acc;
}, []);

var scores = _.reduce(window.scores, function(scores, val, key) {
  var scoref1 = {caller: key, val: val.f1score, type: 'f1score'};
  var scorePrecision = {caller: key, val: val.precision, type: 'precision'};
  var scoreRecall = {caller: key, val: val.recall, type: 'recall'};
  scores.push(scoref1);
  scores.push(scorePrecision);
  scores.push(scoreRecall);
  return scores;
}, []);


// Helper comparitor to order strings representing tuples of numbers.
function reverseStringTupleComparator(a,b) {
  a = a.replace(/\(|\)|\s/g, "").split(",").map(parseFloat);
  b = b.replace(/\(|\)|\s/g, "").split(",").map(parseFloat);
  if (a.length !== b.length)  throw TypeError("Tuples must be of the same length.");
  for (var i = 0; i < a.length; i++) {
    if (a[i] === b[i]) {
      continue;
    } else if (a[i] > b[i]) { // a > b
      return 1;
    } else { // b > a
      return -1;
    }
  }
  return 0; // a == b
}


  ////////////////////////////////////////////////////
 // Construct the charts we'll be rendering later. //
////////////////////////////////////////////////////

var barChart = d3.chart.bars()
  .barValue('calls')
  .groupBy('caller')
  .colorBy('fa')
  .stackBy('dp')
  .colors(['#ededed', '#2d2d2d'])
  .stackLabel(function(vals, key, idx){ return vals[0].dp; })
  .legendLabeler(function(val) { return val + " variant allele freq."})
  .yLabel("Calls")
  .xLabel("Caller")
  .intraGroupPadding(.1)
  .interGroupPadding(.3)
  .interStackSorter(function(a,b) { return reverseStringTupleComparator(a.dp, b.dp) } )
  .intraStackSorter(reverseStringTupleComparator) // sorts on the key of the
                                                  // stack TODO (maybe should
                                                  // pass in d.values to this as
                                                  // well)
  .width(1000)
  .yTickFormatter(d3.format(".2s"));

var scoreChart = d3.chart.bars()
  .interGroupPadding(.3)
  .barLabel(function(d, i) { return d.val.toFixed(3); })
  .yLabel('Score')
  .barValue('val')
  .groupBy('type')
  .colorBy('caller')
  .colors(["#98abc5", "#ff8c00"]);
var sch = scoreChart.height() - scoreChart.margin().top - scoreChart.margin().bottom;
scoreChart = scoreChart   // We're making a sort of extended scale (there's a name for this) to better show scores.
  .yScale(d3.scale.linear().domain([0, 0.4, 0.8, 1]).range([sch, sch/1.25, sch/1.8, 0]));

var concordanceChart = d3.chart.bars()
  .interGroupPadding(.3)
  .stackLabel(function(vals, key, idx) { return d3.sum(vals, function(d) { return d.calls; }); })
  .stackLabelPosition('top')
  .interStackSorter(function(a,b) { return a.numConc < b.numConc;  } )
  .legendLabeler(function(val) { return val + " caller(s) in concordance."})
  .colors(['#FBA6FC', '#410078'])
  .yLabel('Number Variants Called')
  .barValue('calls')
  .groupBy('caller')
  .stackBy('caller')
  .colorBy('numConc');


  ///////////////////////////////////////////////////
 //  Call the charts with the data to render them //
///////////////////////////////////////////////////

d3.select("#bars")
  .datum(faData)
  .call(barChart);

d3.select("#bars-scores")
  .datum(scores)
  .call(scoreChart);

d3.select("#bars-conc")
  .datum(concData)
  .call(concordanceChart);
