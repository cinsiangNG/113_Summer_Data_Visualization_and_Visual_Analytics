let data;

const render = (dimensions) => {
	const margin = {top: 30, right: 10, bottom: 10, left: 0},
  width = 1000 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;
  d3.select("svg").remove();
const svg = d3.select("#dataset")
.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform",
        `translate(${margin.left},${margin.top})`);
  const y = {};
  
  console.log("dimensions:",dimensions);
  for (let i in dimensions) {
    name = dimensions[i];
    y[name] = (name!="class") ? (d3.scaleLinear()
      .domain( d3.extent(data, function(d) { return +d[name]; }) )
      .range([height, 0])) : (d3.scaleBand()
      .domain(['Iris-setosa','Iris-versicolor','Iris-virginica'] )
      .range([height, 0])).padding(1);
  }

  const x = d3.scalePoint()
    .range([0, width])
    .padding(1)
    .domain(dimensions);

  function path(d) {
      return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
  }

  svg
    .selectAll("myPath")
    .data(data)
    .join("path")
    .attr("d",  path).attr('class', d => 'connection '+d.class);

  svg.selectAll("myAxis")
    .data(dimensions).enter()
    .append("g")
    .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
    .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
    .append("text")
      .style("text-anchor", "middle")
      .attr("y", -9)
      .text(function(d) { return d; })
      .style("fill", "black");

}

// Parse the Data
// csv("http://vis.lab.djosix.com:2024/data/iris.csv")
d3.csv("http://vis.lab.djosix.com:2024/data/iris.csv").then( function(loadeddata) {
	data = loadeddata;
  console.log("mm:",data[0]);
  const dimensions = Object.keys(data[0]);
	render(dimensions)
  
})