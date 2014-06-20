// an array of bars = data = [{}, {}, {}]
//
// bars are rectangles can be grouped and/or stacked
//
// if grouped, the data is mapped to the group, and then placed within the group
// if stacked, the data is placed within the stack, and then height is set
//
// chart.bars() maps each bar to a specific rectangle with set width and height
// and x and y position, and fill
//
// it also handles a color legend and labels and titles
//
// hopefully also works with transitions...


var faData = [{"caller":"strelka","dp":"(31, 100)","fa":"(0.6, 0.8)","calls":4},
              {"caller":"strelka","dp":"(31, 100)","fa":"(0.8, 1.0)","calls":52},
              {"caller":"strelka","dp":"(31, 100)","fa":"(0.0, 0.2)","calls":10},
              {"caller":"strelka","dp":"(31, 100)","fa":"(0.4, 0.6)","calls":82},
              {"caller":"strelka","dp":"(31, 100)","fa":"(0.2, 0.4)","calls":539},
              {"caller":"strelka","dp":"(1, 5)","fa":"(0.6, 0.8)","calls":1},
              {"caller":"strelka","dp":"(1, 5)","fa":"(0.8, 1.0)","calls":2},
              {"caller":"strelka","dp":"(1, 5)","fa":"(0.0, 0.2)","calls":0},
              {"caller":"strelka","dp":"(1, 5)","fa":"(0.4, 0.6)","calls":1},
              {"caller":"strelka","dp":"(1, 5)","fa":"(0.2, 0.4)","calls":0},
              {"caller":"strelka","dp":"(11, 20)","fa":"(0.6, 0.8)","calls":10},
              {"caller":"strelka","dp":"(11, 20)","fa":"(0.8, 1.0)","calls":34},
              {"caller":"strelka","dp":"(11, 20)","fa":"(0.0, 0.2)","calls":0},
              {"caller":"strelka","dp":"(11, 20)","fa":"(0.4, 0.6)","calls":32},
              {"caller":"strelka","dp":"(11, 20)","fa":"(0.2, 0.4)","calls":133},
              {"caller":"strelka","dp":"(21, 30)","fa":"(0.6, 0.8)","calls":10},
              {"caller":"strelka","dp":"(21, 30)","fa":"(0.8, 1.0)","calls":45},
              {"caller":"strelka","dp":"(21, 30)","fa":"(0.0, 0.2)","calls":3},
              {"caller":"strelka","dp":"(21, 30)","fa":"(0.4, 0.6)","calls":109},
              {"caller":"strelka","dp":"(21, 30)","fa":"(0.2, 0.4)","calls":488},
              {"caller":"strelka","dp":"(6, 10)","fa":"(0.6, 0.8)","calls":7},
              {"caller":"strelka","dp":"(6, 10)","fa":"(0.8, 1.0)","calls":7},
              {"caller":"strelka","dp":"(6, 10)","fa":"(0.0, 0.2)","calls":0},
              {"caller":"strelka","dp":"(6, 10)","fa":"(0.4, 0.6)","calls":4},
              {"caller":"strelka","dp":"(6, 10)","fa":"(0.2, 0.4)","calls":1},
              {"caller":"somatic-sniper","dp":"(31, 100)","fa":"(0.6, 0.8)","calls":10},
              {"caller":"somatic-sniper","dp":"(31, 100)","fa":"(0.8, 1.0)","calls":88},
              {"caller":"somatic-sniper","dp":"(31, 100)","fa":"(0.0, 0.2)","calls":38},
              {"caller":"somatic-sniper","dp":"(31, 100)","fa":"(0.4, 0.6)","calls":60},
              {"caller":"somatic-sniper","dp":"(31, 100)","fa":"(0.2, 0.4)","calls":667},
              {"caller":"somatic-sniper","dp":"(1, 5)","fa":"(0.6, 0.8)","calls":1},
              {"caller":"somatic-sniper","dp":"(1, 5)","fa":"(0.8, 1.0)","calls":2},
              {"caller":"somatic-sniper","dp":"(1, 5)","fa":"(0.0, 0.2)","calls":0},
              {"caller":"somatic-sniper","dp":"(1, 5)","fa":"(0.4, 0.6)","calls":0},
              {"caller":"somatic-sniper","dp":"(1, 5)","fa":"(0.2, 0.4)","calls":0},
              {"caller":"somatic-sniper","dp":"(11, 20)","fa":"(0.6, 0.8)","calls":9},
              {"caller":"somatic-sniper","dp":"(11, 20)","fa":"(0.8, 1.0)","calls":29},
              {"caller":"somatic-sniper","dp":"(11, 20)","fa":"(0.0, 0.2)","calls":0},
              {"caller":"somatic-sniper","dp":"(11, 20)","fa":"(0.4, 0.6)","calls":39},
              {"caller":"somatic-sniper","dp":"(11, 20)","fa":"(0.2, 0.4)","calls":154},
              {"caller":"somatic-sniper","dp":"(21, 30)","fa":"(0.6, 0.8)","calls":17},
              {"caller":"somatic-sniper","dp":"(21, 30)","fa":"(0.8, 1.0)","calls":52},
              {"caller":"somatic-sniper","dp":"(21, 30)","fa":"(0.0, 0.2)","calls":3},
              {"caller":"somatic-sniper","dp":"(21, 30)","fa":"(0.4, 0.6)","calls":86},
              {"caller":"somatic-sniper","dp":"(21, 30)","fa":"(0.2, 0.4)","calls":513},
              {"caller":"somatic-sniper","dp":"(6, 10)","fa":"(0.6, 0.8)","calls":2},
              {"caller":"somatic-sniper","dp":"(6, 10)","fa":"(0.8, 1.0)","calls":5},
              {"caller":"somatic-sniper","dp":"(6, 10)","fa":"(0.0, 0.2)","calls":0},
              {"caller":"somatic-sniper","dp":"(6, 10)","fa":"(0.4, 0.6)","calls":7},
              {"caller":"somatic-sniper","dp":"(6, 10)","fa":"(0.2, 0.4)","calls":2},
              {"caller":"varscan","dp":"(31, 100)","fa":"(0.6, 0.8)","calls":7},
              {"caller":"varscan","dp":"(31, 100)","fa":"(0.8, 1.0)","calls":51},
              {"caller":"varscan","dp":"(31, 100)","fa":"(0.0, 0.2)","calls":3},
              {"caller":"varscan","dp":"(31, 100)","fa":"(0.4, 0.6)","calls":72},
              {"caller":"varscan","dp":"(31, 100)","fa":"(0.2, 0.4)","calls":623},
              {"caller":"varscan","dp":"(11, 20)","fa":"(0.6, 0.8)","calls":15},
              {"caller":"varscan","dp":"(11, 20)","fa":"(0.8, 1.0)","calls":31},
              {"caller":"varscan","dp":"(11, 20)","fa":"(0.0, 0.2)","calls":1},
              {"caller":"varscan","dp":"(11, 20)","fa":"(0.4, 0.6)","calls":55},
              {"caller":"varscan","dp":"(11, 20)","fa":"(0.2, 0.4)","calls":223},
              {"caller":"varscan","dp":"(21, 30)","fa":"(0.6, 0.8)","calls":12},
              {"caller":"varscan","dp":"(21, 30)","fa":"(0.8, 1.0)","calls":48},
              {"caller":"varscan","dp":"(21, 30)","fa":"(0.0, 0.2)","calls":7},
              {"caller":"varscan","dp":"(21, 30)","fa":"(0.4, 0.6)","calls":102},
              {"caller":"varscan","dp":"(21, 30)","fa":"(0.2, 0.4)","calls":562},
              {"caller":"varscan","dp":"(6, 10)","fa":"(0.6, 0.8)","calls":3},
              {"caller":"varscan","dp":"(6, 10)","fa":"(0.8, 1.0)","calls":5},
              {"caller":"varscan","dp":"(6, 10)","fa":"(0.0, 0.2)","calls":0},
              {"caller":"varscan","dp":"(6, 10)","fa":"(0.4, 0.6)","calls":14},
              {"caller":"varscan","dp":"(6, 10)","fa":"(0.2, 0.4)","calls":5},
              {"caller":"mutect","dp":"(31, 100)","fa":"(0.6, 0.8)","calls":4},
              {"caller":"mutect","dp":"(31, 100)","fa":"(0.8, 1.0)","calls":46},
              {"caller":"mutect","dp":"(31, 100)","fa":"(0.0, 0.2)","calls":33},
              {"caller":"mutect","dp":"(31, 100)","fa":"(0.4, 0.6)","calls":100},
              {"caller":"mutect","dp":"(31, 100)","fa":"(0.2, 0.4)","calls":467},
              {"caller":"mutect","dp":"(1, 5)","fa":"(0.6, 0.8)","calls":2},
              {"caller":"mutect","dp":"(1, 5)","fa":"(0.8, 1.0)","calls":2},
              {"caller":"mutect","dp":"(1, 5)","fa":"(0.0, 0.2)","calls":0},
              {"caller":"mutect","dp":"(1, 5)","fa":"(0.4, 0.6)","calls":3},
              {"caller":"mutect","dp":"(1, 5)","fa":"(0.2, 0.4)","calls":1},
              {"caller":"mutect","dp":"(11, 20)","fa":"(0.6, 0.8)","calls":14},
              {"caller":"mutect","dp":"(11, 20)","fa":"(0.8, 1.0)","calls":31},
              {"caller":"mutect","dp":"(11, 20)","fa":"(0.0, 0.2)","calls":3},
              {"caller":"mutect","dp":"(11, 20)","fa":"(0.4, 0.6)","calls":50},
              {"caller":"mutect","dp":"(11, 20)","fa":"(0.2, 0.4)","calls":232},
              {"caller":"mutect","dp":"(21, 30)","fa":"(0.6, 0.8)","calls":10},
              {"caller":"mutect","dp":"(21, 30)","fa":"(0.8, 1.0)","calls":42},
              {"caller":"mutect","dp":"(21, 30)","fa":"(0.0, 0.2)","calls":17},
              {"caller":"mutect","dp":"(21, 30)","fa":"(0.4, 0.6)","calls":129},
              {"caller":"mutect","dp":"(21, 30)","fa":"(0.2, 0.4)","calls":541},
              {"caller":"mutect","dp":"(6, 10)","fa":"(0.6, 0.8)","calls":4},
              {"caller":"mutect","dp":"(6, 10)","fa":"(0.8, 1.0)","calls":11},
              {"caller":"mutect","dp":"(6, 10)","fa":"(0.0, 0.2)","calls":0},
              {"caller":"mutect","dp":"(6, 10)","fa":"(0.4, 0.6)","calls":11},
              {"caller":"mutect","dp":"(6, 10)","fa":"(0.2, 0.4)","calls":10}];


faData // add to each object "totalCallsAtDepth" and "totalCallsAtFA"
for (var idx in faData) {

}


var concData = [{"caller":"strelka","calls":9,"numConc":"1"},
                {"caller":"strelka","calls":12,"numConc":"2"},
                {"caller":"strelka","calls":27,"numConc":"3"},
                {"caller":"strelka","calls":172,"numConc":"4"},
                {"caller":"strelka","calls":1252,"numConc":"5"},
                {"caller":"somatic-sniper","calls":123,"numConc":"1"},
                {"caller":"somatic-sniper","calls":23,"numConc":"2"},
                {"caller":"somatic-sniper","calls":40,"numConc":"3"},
                {"caller":"somatic-sniper","calls":242,"numConc":"4"},
                {"caller":"somatic-sniper","calls":1252,"numConc":"5"},
                {"caller":"truth","calls":99,"numConc":"1"},
                {"caller":"truth","calls":25,"numConc":"2"},
                {"caller":"truth","calls":70,"numConc":"3"},
                {"caller":"truth","calls":81,"numConc":"4"},
                {"caller":"truth","calls":1252,"numConc":"5"},
                {"caller":"varscan","calls":106,"numConc":"1"},
                {"caller":"varscan","calls":26,"numConc":"2"},
                {"caller":"varscan","calls":91,"numConc":"3"},
                {"caller":"varscan","calls":244,"numConc":"4"},
                {"caller":"varscan","calls":1252,"numConc":"5"},
                {"caller":"mutect","calls":50,"numConc":"1"},
                {"caller":"mutect","calls":36,"numConc":"2"},
                {"caller":"mutect","calls":78,"numConc":"3"},
                {"caller":"mutect","calls":237,"numConc":"4"},
                {"caller":"mutect","calls":1252,"numConc":"5"}];

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
  .intraStackSorter(reverseStringTupleComparator) // sorts on the key of the stack TODO (maybe should pass in d.values to this as well)
  .width(1000)
  .yTickFormatter(d3.format(".2s"));



d3.select("#bars")
  .datum(faData)
  .call(barChart);
