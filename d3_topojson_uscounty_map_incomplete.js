//// This was supposed to be a d3 sample of creating a US county map. 
// The environment it is supposed to run in is the observablehq
// plotting environment, so I need to work out how to port this 
// to a plain html/js/css setup and see what that can do.
// It was wrapped in a chart = {} object, but I am near certain that 
// tells Observable what to plot, so I would likely instead select
// an element in my html and add that instead.
const urlGeojsonCounties = 'https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json'
const urlGeojsonStates = './geojson_us_states_5m.json'
// d3.csv('./bimonthly_covid19_confirmed_US.csv', plotCsvData)

async function fetchUrl(url){
    let response = await fetch(url)
    let data = await response.json()
    return data
}

const color = d3.scaleQuantize([1, 10], d3.schemeBlues[9]);
const path = d3.geoPath();
const format = d => `${d}%`;
// const valuemap = new Map(data.map(d => [d.id, d.rate]));

// The counties feature collection is all U.S. counties, each with a
// five-digit FIPS identifier. The statemap lets us lookup the name of 
// the state that contains a given county; a state’s two-digit identifier
// corresponds to the first two digits of its counties’ identifiers.
// const counties = topojson.feature(us, us.objects.counties);
// const states = topojson.feature(us, us.objects.states);
// const statemap = new Map(states.features.map(d => [d.id, d]));

// The statemesh is just the internal borders between states, i.e.,
// everything but the coastlines and country borders. This avoids an
// additional stroke on the perimeter of the map, which would otherwise
// mask intricate features such as islands and inlets. (Try removing
// the last argument to topojson.mesh below to see the effect.)
// const statemesh = topojson.mesh(us, us.objects.states, (a, b) => a !== b);

// const svg = d3.select("svg.usaCountyMap")
//     .attr("width", 975)
//     .attr("height", 610)
//     .attr("viewBox", [0, 0, 975, 610])
//     .attr("style", "max-width: 100%; height: auto;");

// svg.append("g")
//     .attr("transform", "translate(610,20)")
//     .append(() => Legend(color, {title: "Unemployment rate (%)", width: 260}));

// svg.append("g")
//     .selectAll("path")
//     .data(topojson.feature(us, us.objects.counties).features)
//     .join("path")
//     .attr("fill", d => color(valuemap.get(d.id)))
//     .attr("d", path)
//     .append("title")
//     .text(d => `${d.properties.name}, ${statemap.get(d.id.slice(0, 2)).properties.name}\n${valuemap.get(d.id)}%`);

// svg.append("path")
//     .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
//     .attr("fill", "none")
//     .attr("stroke", "white")
//     .attr("stroke-linejoin", "round")
//     .attr("d", path);

function configureSvg(svgElement) {
    svgElement
        .attr("width", 975)
        .attr("height", 610)
        .attr("viewBox", [0, 0, 975, 610])
        .attr("style", "max-width: 100%; height: auto;");
    return svgElement
}

function topLevelElement(svgElement) {
    svg.append("g")
        .attr("transform", "translate(610,20)")
        .append(() => Legend(color, {title: "Unemployment rate (%)", width: 260}));
}

function appendUsStates(svgElement, stateMesh) {
    svg.append("path")
        .datum(stateMesh)
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-linejoin", "round")
        .attr("d", path);
}

function appendUsCounties(svgElement, countyFeature) {
    svgElement.append("g")
        .selectAll("path")
        .data(countyFeature.features)
        .join("path")
        .attr("fill", d => color(valuemap.get(d.id)))
        .attr("d", path)
        .append("title")
        .text(d => `${d.properties.name}, ${statemap.get(d.id.slice(0, 2)).properties.name}\n${valuemap.get(d.id)}%`);
}

async function plotCsvData() {
    console.log('Attempting to get csv data')
    let covidData = await d3.csv('./bimonthly_covid19_confirmed_US.csv')
    console.log(covidData)
    let svg = d3.select("svg.usaCountyMap")
    let countyData = await fetchUrl(urlGeojsonCounties)
    let stateData = await fetchUrl(urlGeojsonStates)
    const counties = topojson.feature(countyData, countyData);
    const states = topojson.feature(stateData, stateData);
    const statemesh = topojson.mesh(stateData, stateData, (a, b) => a !== b);
    svg = configureSvg(svg)
    svg = topLevelElement(svg)

    // let data = extractData(rows, countyData, stateData);
    // let layout = setupLayout()
    // let blah = await Plotly.newPlot("plotTarget", data, layout);
    console.log('doneish')
}

plotCsvData()
