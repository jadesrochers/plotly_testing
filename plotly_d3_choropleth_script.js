d3.csv('https://raw.githubusercontent.com/plotly/datasets/master/2010_alcohol_consumption_by_country.csv', plotCsvData)

function unpackData(rows, key) {
    return rows.map(function(row) { return row[key]; });
}

function extractData(rows) {
    let data = [{
        type: 'choropleth',
        locationmode: 'country names',
        locations: unpackData(rows, 'location'),
        z: unpackData(rows, 'alcohol'),
        text: unpackData(rows, 'location'),
        autocolorscale: true
    }];
    return data
}

function setupLayout() {
    let layout = {
      title: 'Pure alcohol consumption<br>among adults (age 15+) in 2010',
      geo: {
          projection: {
              type: 'robinson'
          }
      }
    };
    return layout
}

function plotCsvData(err, rows) {
    let data = extractData(rows);
    let layout = setupLayout()
    Plotly.newPlot("plotTarget", data, layout, {showLink: false});
}



      // function unpack(rows, key) {
      //     return rows.map(function(row) { return row[key]; });
      // }

    // let data = [{
      //   type: 'choropleth',
      //   locationmode: 'country names',
      //   locations: unpack(rows, 'location'),
      //   z: unpack(rows, 'alcohol'),
      //   text: unpack(rows, 'location'),
      //   autocolorscale: true
    // }];

    // let layout = {
      // title: 'Pure alcohol consumption<br>among adults (age 15+) in 2010',
      // geo: {
      //     projection: {
      //         type: 'robinson'
      //     }
      // }
    // };

    // Plotly.newPlot("plotTarget", data, layout, {showLink: false});

// });

