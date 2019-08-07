// Highcharts.chart('container', {
//     chart: {
//       type: 'pie',
//       options3d: {
//         enabled: true,
//         alpha: 50,
//         beta: 0
//       }
//     },
//     title: {
//       text: 'DIMM Defects Breakdown'
//     },
//     tooltip: {
//       pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
//     },
//     plotOptions: {
//       pie: {
//         allowPointSelect: true,
//         cursor: 'pointer',
//         depth: 35,
//         dataLabels: {
//           enabled: true,
//           format: '{point.name}'
//         }
//       }
//     },
//     series: [{
//       type: 'pie',
//       name: 'DIMM Defect',
//       data: [
//         ['Solder on gold', 45.0],
//         ['Missing component', 26.8],
//         {
//           name: 'Damaged component',
//           y: 12.8,
//           sliced: true,
//           selected: true
//         },
//         ['Bridging', 8.5],
//         ['Extra component', 6.7],
//         // ['Others', 0.7]
//       ]
//     }]
//   });

// Make monochrome colors
var pieColors = (function () {
  var colors = [],
    base = Highcharts.getOptions().colors[0],
    i;

  for (i = 0; i < 10; i += 1) {
    // Start out with a darkened base color (negative brighten), and end
    // up with a much brighter color
    colors.push(Highcharts.Color(base).brighten((i - 3) / 7).get());
  }
  return colors;
}());

// Build the chart
Highcharts.chart('container', {
  chart: {
    plotBackgroundColor: null,
    plotBorderWidth: null,
    plotShadow: false,
    type: 'pie'
  },
  title: {
    text: 'DIMM Defects Breakdown'
  },
  tooltip: {
    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
  },
  plotOptions: {
    pie: {
      allowPointSelect: true,
      cursor: 'pointer',
      colors: pieColors,
      dataLabels: {
        enabled: true,
        format: '<b>{point.name}</b><br>{point.percentage:.1f} %',
        distance: -50,
        filter: {
          property: 'percentage',
          operator: '>',
          value: 4
        }
      }
    }
  },
  series: [{
    name: 'Share',
    data: [
      { name: 'Solder on gold', y: 61.41 },
      { name: 'Missing component', y: 11.84 },
      { name: 'Damaged component', y: 10.85 },
      { name: 'Extra component', y: 4.67 },
      { name: 'Bridging', y: 4.18 },
      { name: 'Other', y: 7.05 }
    ]
  }]
});

//   var chart = Highcharts.chart('container2', {

//     chart: {
//         type: 'column'
//     },

//     title: {
//         text: 'Defect per Station'
//     },


//     // subtitle: {
//     //     text: 'Resize the frame or click buttons to change appearance'
//     // },

//     legend: {
//         align: 'right',
//         verticalAlign: 'middle',
//         layout: 'vertical'
//     },

//     xAxis: {
//         categories: ['January', 'February', 'March'],
//         labels: {
//             x: -10
//         }
//     },

//     yAxis: {
//         allowDecimals: false,
//         title: {
//             text: 'Amount'
//         }
//     },

//     series: [{
//         name: 'Station1',
//         data: [1, 4, 3]
//     }, {
//         name: 'Station2',
//         data: [6, 4, 2]
//     }, {
//         name: 'Station3',
//         data: [8, 4, 3]
//     }],

//     responsive: {
//         rules: [{
//             condition: {
//                 maxWidth: 500
//             },
//             chartOptions: {
//                 legend: {
//                     align: 'center',
//                     verticalAlign: 'bottom',
//                     layout: 'horizontal'
//                 },
//                 yAxis: {
//                     labels: {
//                         align: 'left',
//                         x: 0,
//                         y: -5
//                     },
//                     title: {
//                         text: null
//                     }
//                 },
//                 subtitle: {
//                     text: null
//                 },
//                 credits: {
//                     enabled: false
//                 }
//             }
//         }]
//     }
// });

// // $('#small').click(function () {
// //     chart.setSize(400, 300);
// // });

// // $('#large').click(function () {
// //     chart.setSize(600, 300);
// // });

Highcharts.chart('container2', {
  chart: {
    type: 'spline'
  },
  title: {
    text: 'Defects per Station'
  },
  // subtitle: {
  //   text: 'Irregular time data in Highcharts JS'
  // },
  xAxis: {
    type: 'datetime',
    dateTimeLabelFormats: { // don't display the dummy year
      month: '%e. %b',
      year: '%b'
    },
    title: {
      text: 'Date'
    }
  },
  // yAxis: {
  //   title: {
  //     text: 'Snow depth (m)'
  //   },
  //   min: 0
  // },
  tooltip: {
    headerFormat: '<b>{series.name}</b><br>',
    pointFormat: '{point.x:%e. %b}: {point.y:.2f} m'
  },

  plotOptions: {
    spline: {
      marker: {
        enabled: true
      }
    }
  },

  colors: ['#6CF', '#39F', '#06C', '#036', '#000'],

  // Define the data points. All series have a dummy year
  // of 1970/71 in order to be compared on the same x axis. Note
  // that in JavaScript, months start at 0 for January, 1 for February etc.
  series: [{
    name: "Station1",
    data: [
      [Date.UTC(1970, 10, 25), 0],
      [Date.UTC(1970, 11,  6), 0.25],
      [Date.UTC(1970, 11, 20), 1.41],
      [Date.UTC(1970, 11, 25), 1.64],
      [Date.UTC(1971, 0,  4), 1.6],
      [Date.UTC(1971, 0, 17), 2.55],
      [Date.UTC(1971, 0, 24), 2.62],
      [Date.UTC(1971, 1,  4), 2.5],
      [Date.UTC(1971, 1, 14), 2.42],
      [Date.UTC(1971, 2,  6), 2.74],
      [Date.UTC(1971, 2, 14), 2.62],
      [Date.UTC(1971, 2, 24), 2.6],
      [Date.UTC(1971, 3,  1), 2.81],
      [Date.UTC(1971, 3, 11), 2.63],
      [Date.UTC(1971, 3, 27), 2.77],
      [Date.UTC(1971, 4,  4), 2.68],
      [Date.UTC(1971, 4,  9), 2.56],
      [Date.UTC(1971, 4, 14), 2.39],
      [Date.UTC(1971, 4, 19), 2.3],
      [Date.UTC(1971, 5,  4), 2],
      [Date.UTC(1971, 5,  9), 1.85],
      [Date.UTC(1971, 5, 14), 1.49],
      [Date.UTC(1971, 5, 19), 1.27],
      [Date.UTC(1971, 5, 24), 0.99],
      [Date.UTC(1971, 5, 29), 0.67],
      [Date.UTC(1971, 6,  3), 0.18],
      [Date.UTC(1971, 6,  4), 0.8]
    ]
  }, {
    name: "Station2",
    data: [
      [Date.UTC(1970, 10,  9), 0],
      [Date.UTC(1970, 10, 15), 0.23],
      [Date.UTC(1970, 10, 20), 0.25],
      [Date.UTC(1970, 10, 25), 0.23],
      [Date.UTC(1970, 10, 30), 0.39],
      [Date.UTC(1970, 11,  5), 0.41],
      [Date.UTC(1970, 11, 10), 0.59],
      [Date.UTC(1970, 11, 15), 0.73],
      [Date.UTC(1970, 11, 20), 0.41],
      [Date.UTC(1970, 11, 25), 1.07],
      [Date.UTC(1970, 11, 30), 0.88],
      [Date.UTC(1971, 0,  5), 0.85],
      [Date.UTC(1971, 0, 11), 0.89],
      [Date.UTC(1971, 0, 17), 1.04],
      [Date.UTC(1971, 0, 20), 1.02],
      [Date.UTC(1971, 0, 25), 1.03],
      [Date.UTC(1971, 0, 30), 1.39],
      [Date.UTC(1971, 1,  5), 1.77],
      [Date.UTC(1971, 1, 26), 2.12],
      [Date.UTC(1971, 3, 19), 2.1],
      [Date.UTC(1971, 4,  9), 1.7],
      [Date.UTC(1971, 4, 29), 0.85],
      [Date.UTC(1971, 5,  7), 0.9]
    ]
  }, {
    name: "Target",
    data: [
      [Date.UTC(1970, 9, 15), 0.8],
      [Date.UTC(1970, 9, 31), 0.8],
      [Date.UTC(1970, 10, 15), 0.8],
      [Date.UTC(1970, 10, 30), 0.8],
      [Date.UTC(1970, 11, 15), 0.8],
      [Date.UTC(1970, 11, 30), 0.8],
      // [Date.UTC(1970, 11, 16), 0.8],
      // [Date.UTC(1970, 11, 19), 0.8],
      // [Date.UTC(1970, 11, 22), 0.8],
      // [Date.UTC(1970, 11, 25), 0.8],
      // [Date.UTC(1970, 11, 28), 0.8],
      [Date.UTC(1971, 0, 15), 0.8],
      [Date.UTC(1971, 0, 30), 0.8],
      // [Date.UTC(1971, 0, 22), 0.8],
      // [Date.UTC(1971, 0, 25), 0.8],
      // [Date.UTC(1971, 0, 28), 0.8],
      // [Date.UTC(1971, 0, 31), 0.8],
      // [Date.UTC(1971, 1,  4), 0.8],
      // [Date.UTC(1971, 1,  7), 0.8],
      [Date.UTC(1971, 1, 15), 0.8],
      [Date.UTC(1971, 1, 30), 0.8],
      // [Date.UTC(1971, 1, 16), 0.8],
      // [Date.UTC(1971, 1, 19), 0.8],
      // [Date.UTC(1971, 1, 22), 0.8],
      // [Date.UTC(1971, 1, 25), 0.8],
      // [Date.UTC(1971, 1, 28), 0.8],
      // [Date.UTC(1971, 2,  4), 0.8],
      // [Date.UTC(1971, 2,  7), 0.8],
      // [Date.UTC(1971, 2, 10), 0.8],
      // [Date.UTC(1971, 2, 13), 0.8],
      [Date.UTC(1971, 2, 15), 0.8],
      // [Date.UTC(1971, 2, 19), 0.8],
      // [Date.UTC(1971, 2, 22), 0.8],
      // [Date.UTC(1971, 2, 25), 0.8],
      // [Date.UTC(1971, 2, 27), 0.8],
      [Date.UTC(1971, 2, 30), 0.8],
      // [Date.UTC(1971, 3,  3), 0.8],
      // [Date.UTC(1971, 3,  6), 0.8],
      // [Date.UTC(1971, 3,  9), 0.8],
      // [Date.UTC(1971, 3, 12), 0.8],
      [Date.UTC(1971, 3, 15), 0.8],
      // [Date.UTC(1971, 3, 18), 0.8],
      // [Date.UTC(1971, 3, 21), 0.8],
      // [Date.UTC(1971, 3, 24), 0.8],
      // [Date.UTC(1971, 3, 27), 0.8],
      [Date.UTC(1971, 3, 30), 0.8],
      // [Date.UTC(1971, 4,  3), 0.8],
      // [Date.UTC(1971, 4,  6), 0.8],
      // [Date.UTC(1971, 4,  9), 0.8],
      // [Date.UTC(1971, 4, 12), 0.88],
      [Date.UTC(1971, 4, 15), 0.8],
      // [Date.UTC(1971, 4, 18), 0.8],
      [Date.UTC(1971, 4, 30), 0.8],
      [Date.UTC(1971, 6, 4), 0.8]
    ]
  }]
});