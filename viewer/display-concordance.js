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
var faData = {};
callerNames.forEach(function(name) {
  var data = _.map(window.dpfaBinning[name], function(sectionMap, barName) {
    var sections = _.map(_.keys(sectionMap), function(name) {
      return {name: name, value: sectionMap[name]};
    });
    sections.name = barName;
    return sections;
  });
  faData[name] = data;
});

var concordanceData = _.map(window.concordanceCounts, function(sectionMap, barName) {
  var sections = _.map(_.keys(sectionMap), function(name) {
    return {name: name, value: sectionMap[name]};
  });
  sections.name = barName;
  return sections;
});

var scoreData = window.scores;

  ////////////////////
 // Visualizations //
////////////////////

var faChart = d3.chart.stackedBars()
    .xAxisTitle("Read Depth Range")
    .yAxisTitle("Number of Variants Called")
    .sectionBinDesc("frequency of allele")
    .showBarTotals(false)
    .width(200)
    .height(150)
    .barComparator(function(a, b) {
      return reverseStringTupleComparator(a.name, b.name);
    })
    .sectionComparator(function(a, b) {
      return reverseStringTupleComparator(a.name, b.name);
    });

// Display the FA charts.
callerNames.forEach(function(name) {
  d3.select("#" + name)
      .datum(faData[name])
      .call(faChart.title(name));
});


var concordanceChart = d3.chart.stackedBars()
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

// Display the Concordance chart.
d3.select("#concordances").style("margin-top", "47px")
    .datum(concordanceData)
    .call(concordanceChart);

displayScores(document.getElementById('scores'), scoreData)

// var scoreChart = d3.chart.groupedBars()

// // Display the scoring chart.
// d3.select("#scores")
//     .datum(scoreData)
//     .call(scoreChart)
//     .yAxisTitle("Score")
//     .groupColors(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56",
//                   "#d0743c", "#ff8c00"]);
