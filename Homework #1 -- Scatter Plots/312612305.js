// Read the data
d3.csv("http://vis.lab.djosix.com:2024/data/iris.csv", function (data) {
    // Remove the last element if necessary
    data = data.slice(0, -1);

    // Set the dimensions and margins of the graph
    var margin = { top: 20, right: 20, bottom: 90, left: 50 },
        width = 520 - margin.left - margin.right,
        height = 560 - margin.top - margin.bottom;

    let x_label = "sepal length";
    let y_label = "sepal width";

    function scatter() {
        // Clean svg
        d3.select("#my_dataviz").select('svg').remove();

        // Append the svg object to the body of the page
        var svg = d3.select("#my_dataviz")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Add the grey background
        svg.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("height", height)
            .attr("width", width)
            .style("fill", "white");

        // Find the max and min values for X and Y
        let x_max = d3.max(data, d => +d[x_label]);
        let y_max = d3.max(data, d => +d[y_label]);
        let x_min = d3.min(data, d => +d[x_label]);
        let y_min = d3.min(data, d => +d[y_label]);

        // Add X axis
        var x = d3.scaleLinear()
            .domain([Math.floor(x_min), Math.ceil(x_max)])
            .range([0, width]);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).tickSize(-height * 1.3).ticks(10))
            .select(".domain").remove();

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([Math.floor(y_min), Math.ceil(y_max)])
            .range([height, 0])
            .nice();
        svg.append("g")
            .call(d3.axisLeft(y).tickSize(-width * 1.3).ticks(7))
            .select(".domain").remove();

        // Add X axis label
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height + margin.top + 20)
            .text(x_label);

        // Add X axis label text
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width)
            .attr("y", height + margin.top + 20)
            .text("X axis");

        // Y axis label
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 20)
            .attr("x", -height / 2)
            .text(y_label);

        // Y axis label text
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 20)
            .attr("x", 0)
            .text("Y axis");

        // Color scale
        var color = d3.scaleOrdinal()
            .domain(["Iris-setosa", "Iris-versicolor", "Iris-virginica"])
            .range(["#ff000080", "#00ff0080", "#0000ff80"]);

        // Add legend
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("x", width / 2 - 100)
            .attr("y", height + margin.top + 50)
            .text("Iris-setosa")
            .style("fill", "#ff000080");
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height + margin.top + 50)
            .text("Iris-versicolor")
            .style("fill", "#00ff0080");
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("x", width / 2 + 100)
            .attr("y", height + margin.top + 50)
            .text("Iris-virginica")
            .style("fill", "#0000ff80");

        // Add dots
        svg.append('g')
            .selectAll("dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", d => x(+d[x_label]))
            .attr("cy", d => y(+d[y_label]))
            .attr("r", 5)
            .style("fill", d => color(d["class"]));
    }

    // Add event listener for radio buttons
    const radioButtons = document.querySelectorAll('input[name="X_axis"], input[name="Y_axis"]');
    for (const radioButton of radioButtons) {
        radioButton.addEventListener('change', showSelected);
    }

    function showSelected(e) {
        if (this.checked) {
            if (this.name == "X_axis") {
                x_label = this.value;
                scatter();
            }
            if (this.name == "Y_axis") {
                y_label = this.value;
                scatter();
            }
        }
    }

    scatter();
});
