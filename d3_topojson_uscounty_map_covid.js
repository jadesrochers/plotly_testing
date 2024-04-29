//// This was supposed to be a d3 sample of creating a US county map. 
// The environment it is supposed to run in is the observablehq
// plotting environment, so I need to work out how to port this 
// to a plain html/js/css setup and see what that can do.
// It was wrapped in a chart = {} object, but I am near certain that 
// tells Observable what to plot, so I would likely instead select
// an element in my html and add that instead.


const { select, json, geoPath, geoNaturalEarth1 } = d3;
const urlGeojsonCounties = 'https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json'
// const urlGeojsonStates = './geojson_us_states_5m.json'
const urlTopojsonStates = './topojson_us_states_5m.json'
// d3.csv('./bimonthly_covid19_confirmed_US.csv', plotCsvData)

async function fetchUrl(url){
    let response = await fetch(url)
    let data = await response.json()
    return data
}

let val = 0.05
let vals = []
while (val <=1) {
    vals.push(val.toPrecision(2))
    val += 0.05
}
let turbos = vals.map(d3.interpolateTurbo)
// const color = d3.scaleQuantize([1, 500000], turbos);
let powColors = ['#1E51B7', '#33C1A0', '#E0A73A', '#BE2525']
const color = d3.scalePow().exponent(0.4).domain([0, 5000, 25000, 500000]).range(powColors);
const path = d3.geoPath();
const format = d => `${d}%`;

let reColor;

// The statemesh is just the internal borders between states, i.e.,
// everything but the coastlines and country borders. This avoids an
// additional stroke on the perimeter of the map, which would 
// mask intricate features such as islands and inlets. (Try removing
// the last argument to topojson.mesh below to see the effect.)
// const statemesh = topojson.mesh(us, us.objects.states, (a, b) => a !== b);


const createTooltip = function() {
    let Tooltip = d3.select("div.mapContainer")
   .append("div")
    .classed("tooltip", true)
    .classed("tooltipOff", true)
    return Tooltip
}

const mouseover = function(d) {
    // Make the tooltip visible
   Tooltip
    .classed("tooltipOff", false)
    .classed("tooltipOn", true)
    // highlight the county
    d3.select(this)
    .style("stroke", "black")
    .style("stroke-width", 1.5)
    .style("opacity", 1)
}

const mousemove = function(e, d, stateMap, valueMap) {
    // VERY important: using this / window as the argument
    // to the d3.pointer will determine whether position
    // is relative or absolute
    Tooltip
    .style("left", (d3.pointer(e, window)[0]+25) + "px")
    .style("top", (d3.pointer(e, window)[1]-25) + "px")
    .html(`${d.properties.NAME}, ${stateMap.get(d.properties.STATE).NAME} <br> ${valueMap.get(d.id)} Cases`)
}

const mouseleave = function(e) {
    Tooltip
      // .style("opacity", 0)
      .classed("tooltipOff", true)
      .classed("tooltipOn", false)
    d3.select(this)
      .style("stroke", "none")
      .style("opacity", 0.9)
}

function configureSvg(svgElement) {
    svgElement
        .attr("width", 975)
        .attr("height", 610)
        .attr("viewBox", [0, 0, 975, 610])
        .attr("style", "max-width: 100%; height: auto;");
    return svgElement
}

function legendElement(svgElement) {
    svgElement.append("g")
        .attr("transform", "translate(610,20)")
        .attr("width", 960)
        .attr("height", 600)
        // .append(() => Legend(color, {title: "Covid Confirmed Infections", width: 260}));
    return svgElement
}

function appendUsStates(svgElement, stateMesh, geoGenerator) {
    svgElement.append("path")
        .datum(stateMesh)
        .attr("fill", "none")
        .attr("stroke", "#c9d9dc")
        .attr("class", "statesOutline")
        .attr("stroke-width", 1.2)
        .attr("stroke-linejoin", "round")
        .attr("d", geoGenerator);
    return svgElement
}

function appendUsCounties(svgElement, countyFeature, stateMap, valueMap, geoGenerator) {
    svgElement.append("g")
        .selectAll("path")
        .data(countyFeature.features)
        .join("path")
        .on("mouseover", mouseover)
        .on("mousemove", (e, d) => mousemove(e, d, stateMap, valueMap))
        .on("mouseleave", mouseleave)
        .attr("class", "countyDataPath")
        .attr("fill", d => color(valueMap.get(d.id)))
        .attr("stroke-width", 0.3)
        .attr("stroke", "#c9d9dc")
        .attr("d", geoGenerator)
        .style("opacity", 0.9)
        .append("title")
    return svgElement
}

let colorByDate = (covidData, stateMap) => (date) => {
    let valueMap = new Map(covidData.map(d => [d.GEO_ID, Number(d[date])]));
    d3.selectAll("path.countyDataPath")
    .attr("fill", d => color(valueMap.get(d.id)))
    .on("mousemove", (e, d) => mousemove(e, d, stateMap, valueMap))
}

function getSelectedDate() {
    let covidYear = document.getElementById("covidYear").value;
    let covidMonth = document.getElementById("covidMonth").value;
    let covidDay = document.getElementById("covidDay").value;
    let selectDate = new Date(covidYear, covidMonth, covidDay);
    let formattedDate = `${selectDate.getMonth() + 1}/${selectDate.getDate()}/${selectDate.getFullYear() % 100}`
    console.log('Current Selected Date: ', formattedDate);
    return formattedDate
}

function dateFormChange() {
    const formattedDate = getSelectedDate()
    reColor(formattedDate)
}

async function plotCsvData() {
    // Get the initial default selected date and use it to 
    // populate the map
    let selectedDate = getSelectedDate()
    let covidData = await d3.csv('./bimonthly_covid19_confirmed_US.csv')
    const valueMap = new Map(covidData.map(d => [d.GEO_ID, Number(d[selectedDate])]));
    // I created the us-states topojson using this cli command: 
    // geo2topo us-states=geojson_us_states_5m.json > topojson_us_states_5m.json
    // Get it on system with: npm install -g topojson-server
    const countyGeojson = await fetchUrl(urlGeojsonCounties)
    // const stateGeojson = await fetchUrl(urlGeojsonStates)
    // It works just fine as a plain JS object, no parsing
    // needed. Then for html, I suppose it would be inlined?
    const stateGeojson = stateGeojsonRaw
    debugger;
    const stateTopojson = await fetchUrl(urlTopojsonStates)

    const projection = d3.geoAlbersUsa();
    const geoGenerator = d3.geoPath().projection(projection);
    // Get individual coordinate conversion to see if things line up
    let coord = projection(stateGeojson.features[36].geometry.coordinates[0][0][0])
    // Get the feature path from the feature
    // let pathy = generator(stateGeojson.features[36])

    const stateMap = new Map(stateGeojson.features.map(d => [d.id, d.properties]));
    const statemesh = topojson.mesh(stateTopojson, stateTopojson.objects.usStates, (a, b) => a !== b);
    let svg = d3.select("svg.usaCountyMap")
    svg = configureSvg(svg)
    // Not working atm, this was observable based. Source code 
    // could be pulled and used however.
    // svg = legendElement(svg)
    svg = appendUsCounties(svg, countyGeojson, stateMap, valueMap, geoGenerator)
    svg = appendUsStates(svg, statemesh, geoGenerator)
    reColor = colorByDate(covidData, stateMap)
    console.log('intial coloring done')

    // Yes, this works. The previous data binding (county data)
    // is still usable, you don't need to refresh it.
    // If I could not pass a new map that would be even better.
    // valueMap = new Map(covidData.map(d => [d.GEO_ID, Number(d['4/1/20'])]));
    // reColor(stateMap, valueMap)
    console.log('Play with time')
}

const Tooltip = createTooltip() 

export { plotCsvData, dateFormChange }

