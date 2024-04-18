const urlGeojsonCounties = 'https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json'

async function fetchUrl(url){
    let response = await fetch(url)
    let data = await response.json()
    return data
}

let blah = d3.csv('time_series_covid19_confirmed_US.csv').data()

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

async function plotCsvData(err, rows) {
    let countyData = await fetchUrl(urlGeojsonCounties)
    let data = extractData(rows);
    let layout = setupLayout()
    Plotly.newPlot("plotTarget", data, layout, {showLink: false});
}



