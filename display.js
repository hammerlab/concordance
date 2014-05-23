  ///////////////
 // Utilities //
///////////////

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
_.sum = function(list) { return list.reduce(function(a,b){return a + b;}, 0); };



  ////////////////////
 //       ETL      //
////////////////////

// We have globals concordanceCounts, dpfaBinner, and callerNames from output.js

// Raw data is in the form `{bar1: {stack1: val, stack2: val, ..}, .. }`, need
// to transform into array of bars (arrays) of sections (objects with value &
// name).

// Munge the FA data.
var FA_data = {};
callerNames.forEach(function(name) {
  var data = _.map(dpfaBinning[name], function(sectionMap, barName) {
    var sections = _.map(_.keys(sectionMap), function(name) {
      return {name: name, value: sectionMap[name]};
    });
    sections.name = barName;
    return sections;
  });
  FA_data[name] = data;
});

var concordance_data = _.map(concordanceCounts, function(sectionMap, barName) {
    var sections = _.map(_.keys(sectionMap), function(name) {
        return {name: name, value: sectionMap[name]};
    });
    sections.name = barName;
    return sections;
});



  ////////////////////
 // Visualizations //
////////////////////

var fa_chart = d3.chart.stackedBars()
    .xAxisTitle("Read Depth Range")
    .yAxisTitle("Number of Variants Called")
    .sectionBinDesc("frequency of allele")
    .showBarTotals(false)
    .width(200)
    .height(150)
    .barComparator(function(a,b) {
        return reverseStringTupleComparator(a.name, b.name);
    })
    .sectionComparator(function(a,b) {
        return reverseStringTupleComparator(a.name, b.name);
    });

// Display the FA charts.
callerNames.forEach(function(name) {
  d3.select("#"+name)
    .datum(FA_data[name])
    .call(fa_chart.title(name));
});

var concordance_chart = d3.chart.stackedBars()
    .title("Caller Concordance")
    .yAxisTitle("Number of Variants Called")
    .sectionBinDesc("callers in concordance")
    .stackColors(['#410078', '#FBA6FC'])
    .sectionComparator(function(a,b) {
       return parseInt(b.name) > parseInt(a.name);
    })
    .barComparator(function(a, b) {
        var totalA = _.sum(a.map(function(s){ return s.value; }));
        var totalB = _.sum(b.map(function(s){ return s.value; }));
        return totalA - totalB;
    });

d3.select("#conc").style("margin-top", "47px")
  .datum(concordance_data)
  .call(concordance_chart);

displayScores(scores);
