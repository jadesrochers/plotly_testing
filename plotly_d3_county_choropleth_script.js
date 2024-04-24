const urlGeojsonCounties = 'https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json'
const urlGeojsonStates = './geojson_us_states_5m.json'

async function fetchUrl(url){
    let response = await fetch(url)
    let data = await response.json()
    return data
}

d3.csv('./bimonthly_covid19_confirmed_US.csv', plotCsvData)

function unpackData(rows, key) {
    return rows.map(function(row)
        { return row[key]; });
}


function getTickValues(tickValues, power) {
    return tickValues.map(val => Math.pow(val, power))
}


function extractData(rows, countyGeojson, stateGeojson) {
    // Data includes the geojson, 
    // and is termed 'choropleth traces' in their API, if you
    // are trying to find it in a search.
    let power = 3/10
    let min = 0 
    let max = Math.pow(1000000, power)
    let rawData = unpackData(rows, '10/1/21')
    let powData = rawData.map(dat => Math.pow(dat, power)) 
    let tickRaw = [10, 500, 2000, 10000, 30000, 100000, 250000, 500000, 1000000]
    let tickValues = getTickValues(tickRaw, power)
    let tickText = tickRaw.map(num => num.toString())
    let stateGeoid = stateGeojson.features.map(feature => feature.properties.GEOID)
    let statesData = Array.apply(null, Array(56)).map((x,i) => Math.random())
    let testCountyGeoid = unpackData(rows, 'GEO_ID')
    // Have to use 'customdata' trace to do this, you can't 
    // just make up a name like 'raw'
    let traces = [
        {
            type: 'choropleth',
            geojson: stateGeojson,
            locationmode: 'geojson-id',
            // KEY! - the 'id' in the geojson must match the locations specified here
            // or it will not be able to tell what to associate the data with
            locations: stateGeoid,
            z: statesData,
            text: stateGeoid,
            colorscale: [[0, 'rgba(0,0,0,0)'],[1, 'rgba(0,0,0,0)']],
            showscale: false,
            hovertemplate: '<b> %{text}: </b>' + 
                           '%{z}' + 
                           '<extra></extra>',
            marker: {
                line: {
                    color: 'rgba(0, 0, 0, 1)',
                    width: 0.7
                },
                opacity: 1
            },
            geo: 'geo'
        },
        {
            type: 'choropleth',
            geojson: countyGeojson,
            locationmode: 'geojson-id',
            locations: unpackData(rows, 'GEO_ID'),
            customdata: rawData,
            z: powData,
            zmin: min,
            zmax: max,
            hovertemplate: '<b> %{text}: </b>' + 
                           '%{customdata}' + 
                           '<extra></extra>',
            text: unpackData(rows, 'Admin2'),
            colorscale: 'Jet',
            colorbar: {
                title: 'Confirmed Infections',
                tickvals: tickValues,
                ticktext: tickText,
                tickmode: 'array',
            },
            marker: {
                line: {
                    color: 'rgba(100, 100, 100, 0.5)',
                    width: 0.3
                },
                opacity: 0.8,
            },
            geo: 'geo'
        },
    ];
    return traces
}

function setupLayout() {
    let layout = {
      title: 'Covid19 Confirmed cases, 4/1/20',
      // Projection data goes here if you are using it
      geo: {
          scope: 'usa',
          showsubunits: false,
          showland: false,
          landcolor: 'rgb(10, 10, 10)',
          showlakes: false,
          showcoastlines: false,
          lakecolor: 'rgb(255, 255, 255)',
          visible: false,
      },
      // You can make multiple maps, though it seems they do not overlap
      geo2: {
          scope: 'usa',
          showsubunits: true,
          showland: true,
          landcolor: 'rgb(10, 10, 10)',
          showlakes: true,
          lakecolor: 'rgb(255, 255, 255)',
      }

    };
    return layout
}

// async function plotCsvData(err, rows) {
async function plotCsvData(err, rows) {
    debugger;
    let countyData = await fetchUrl(urlGeojsonCounties)
    let stateData = await fetchUrl(urlGeojsonStates)
    let data = extractData(rows, countyData, stateData);
    let layout = setupLayout()
    let blah = await Plotly.newPlot("plotTarget", data, layout);
    console.log('doneish')
}

