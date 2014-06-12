QUnit.test( 'hello test', function( assert ) {
  assert.ok( 1 == '1', 'Passed!' );
});

QUnit.test('d3.stacked-bar-chart should have the right defaults',
function(assert) {
  var chart = d3.chart.stackedBars();
  assert.equal(960, chart.width());
  assert.equal(500, chart.height());
  assert.ok( 1 == '1' );
});

QUnit.test('d3.stacked-bar-chart should be minimally functional',
function(assert) {
  var data = [
    [{'name':'3','value':1325},
     {'name':'2','value':98},
     {'name':'1','value':104}],
    [{'name':'3','value':1325},
     {'name':'2','value':260},
     {'name':'1','value':68}],
    [{'name':'3','value':1325},
     {'name':'2','value':200},
     {'name':'1','value':155}]
  ];
  data[0].name = 'truth.chr20';
  data[1].name = 'mutect.chr20';
  data[2].name = 'somaticsniper.chr20';

  var sum = function(list) {
    return list.reduce(function(a,b){return a + b;}, 0);
  };
  var chart = d3.chart.stackedBars()
      .title('Caller Concordance')
      .yAxisTitle('Number of Variants Called')
      .sectionBinDesc('callers in concordance')
      .stackColors(['#410078', '#FBA6FC'])
      .sectionComparator(function(a,b) {
        return parseInt(b.name, 10) > parseInt(a.name, 10);
      })
      .barComparator(function(a, b) {
        var totalA = sum(a.map(function(s){ return s.value; }));
        var totalB = sum(b.map(function(s){ return s.value; }));
        return totalA - totalB;
      });

  var div = document.createElement('div');
  div.setAttribute('id', 'conc_div');
  document.body.appendChild(div);
  d3.select('#conc_div').datum(data).call(chart);

  var sumTexts =
      $.makeArray($('g.bar text', div)).map(function(x) { return $(x).text();});
  assert.deepEqual(['1,527', '1,653', '1,680'], sumTexts);

  // TODO: add more thorough assertions here.
});
