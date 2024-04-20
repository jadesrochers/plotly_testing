const urlGeojsonCounties = 'https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json'
const urlGeojsonStates = ''

async function fetchUrl(url){
    let response = await fetch(url)
    let data = await response.json()
    return data
}

d3.csv('./bimonthly_covid19_confirmed_US.csv', plotCsvData)

function unpackData(rows, key) {
    return rows.map(function(row) { return row[key]; });
}

function extractData(rows, geoJson) {
    // Data includes the geojson, 
    // and is termed 'choropleth traces' in their API, if you
    // are trying to find it in a search.
    let data = [{
        type: 'choropleth',
        geojson: geoJson,
        locationmode: 'US Counties',
        locations: unpackData(rows, 'GEO_ID'),
        z: unpackData(rows, '4/1/20'),
        text: unpackData(rows, 'Admin2'),
        colorscale: 'Jet',
        colorbar: {
            title: 'Confirmed Infections'
        }
    }];
    return data
}

function setupLayout() {
    let layout = {
      title: 'Covid19 Confirmed cases, 4/1/20',
      // Projection data goes here if you are using it
      geo: {
          scope: 'usa',
          countrycolor: 'rgb(255, 255, 255)',
          showland: true,
          landcolor: 'rgb(217, 217, 217)',
          showlakes: true,
          lakecolor: 'rgb(255, 255, 255)',
          subunitcolor: 'rgb(255, 255, 255)'
      }
    };
    return layout
}

// async function plotCsvData(err, rows) {
async function plotCsvData(err, rows) {
    let countyData = await fetchUrl(urlGeojsonCounties)
    let data = extractData(rows, countyData);
    let layout = setupLayout()
    Plotly.newPlot("plotTarget", data, layout);
}

