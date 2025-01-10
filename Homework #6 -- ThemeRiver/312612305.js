// set the dimensions and margins of the graph
const margin = { top: 20, right: 50, bottom: 30, left: 50 },
    width = 600 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        `translate(${margin.left}, ${margin.top})`);

const data_path = "http://vis.lab.djosix.com:2024/data/ma_lga_12345.csv"

// Parse the Data
d3.csv(data_path).then(function (data) {
    // console.log("data:", data)

    var data_1 = {}
    for (let i = 0; i < data.length; i++) {
        if (!(data[i]["saledate"] in data_1)) {
            data_1[data[i]["saledate"]] = {
                "house with 2 bedrooms": 0,
                "house with 3 bedrooms": 0,
                "house with 4 bedrooms": 0,
                "house with 5 bedrooms": 0,
                "unit with 1 bedrooms": 0,
                "unit with 2 bedrooms": 0,
                "unit with 3 bedrooms": 0,
            }
        }
        class_str = data[i]["type"] + " with " + data[i]["bedrooms"] + " bedrooms"
        data_1[data[i]["saledate"]][class_str] = +data[i]["MA"]
    }
    // console.log("data_1:", data_1)

    var data_2 = []
    for (const [key, value] of Object.entries(data_1)) {
        value["date"] = moment(key, "DD/MM/YYYY").toDate();
        data_2.push(value)
    }
    // console.log("data_2:", data_2)
    
    data_2.sort(function (a, b) {
        return a["date"] - b["date"];
    });
    data = data_2
    // console.log("data:", data)

    // List of groups = header of the csv files
    var keys = Object.keys(data[0]).slice(0, -1)
    // console.log("keys:", keys)

    // color palette
    const color = d3.scaleOrdinal()
        .domain(keys)
        .range(["#CE0000","#FF9224","#FFD306","#00BB00","#00E3E3","#0080FF","#8600FF"])

    var blocks = document.getElementById('blocks');
    let html = ""
    for (let i = 0; i < keys.length; i++) {
        html += '<div class="list-group-item" style="background-color:' + color(keys[i]) + '">' + keys[i] + '</div>'
    }
    blocks.innerHTML = html
    // console.log("blocks:", blocks)
    var sortable = new Sortable(blocks, {
        animation: 150,
        onChange: function (evt) {
            evt.newIndex
            let blocks_divs = blocks.getElementsByTagName("div");
            let keys = []
            for (let i = 0; i < blocks_divs.length; i++) {
                keys.push(blocks_divs[i].textContent)
            }
            render(keys)
        }
    });

    render(keys)

    function render(keys) {
        svg.selectAll('*').remove();
        // console.log("keys:", keys)
        let new_keys = Array.from(keys)
        new_keys.reverse()
        // Add X axis
        const x = d3.scaleLinear()
            .domain(d3.extent(data, function (d) { return d["date"]; }))
            .range([0, width]);
        svg.append("g")
            .attr("transform", `translate(0, ${height * 0.8})`)
            .call(d3.axisBottom(x).ticks(4).tickFormat(d3.utcFormat("%B %d, %Y")).tickSize(-height * 0.7))
            .select(".domain").remove()
        // Customization
        svg.selectAll(".tick line").attr("stroke", "#b8b8b8")

        // Add X axis label:
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height -30)
            .text("Date");

        // Add Y axis
        const y = d3.scaleLinear()
            .domain([-4000000, 4000000])
            .range([height, 0]);

        //stack the data
        const stackedData = d3.stack()
            .offset(d3.stackOffsetSilhouette)
            .keys(new_keys)
            (data)

        // 创建两个 tooltip
        const tooltipCurrent = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "5px")
            .style("padding", "3px")
            .style("pointer-events", "none");

        const tooltipOthers = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "5px")
            .style("padding", "3px")
            .style("pointer-events", "none");

        // Three function that change the tooltip when user hover / move / leave a cell
        const mouseover = function(event, d) {
            tooltipCurrent.style("opacity", 1);
            tooltipOthers.style("opacity", 1);
            d3.selectAll(".myArea").style("opacity", .35);
            d3.select(this)
                .style("stroke", "#ffffff")
                .style("opacity", 1);
        }
        const mousemove = function(event, d) {
            const [xPos, yPos] = d3.pointer(event);
            const date = x.invert(xPos);
            const bisectDate = d3.bisector(d => d.date).left;
            const index = bisectDate(data, date, 1);
            const selectedData = data[index - 1];
            
            const formattedDate = d3.timeFormat("%Y-%m-%d")(selectedData.date);
            
            let currentContent = `Date: ${formattedDate}<br>${d.key}: ${d3.format(",")(selectedData[d.key])}`;
            
            let othersContent = "Others:<br>";
            keys.forEach(key => {
                if (key !== d.key) {
                    othersContent += `${key}: ${d3.format(",")(selectedData[key])}<br>`;
                }
            });
            
            tooltipCurrent.html(currentContent)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY + 10) + "px");

            tooltipOthers.html(othersContent)
                .style("left", margin.left + "px")
                .style("top", (height + margin.top + margin.bottom + 30) + "px");

            tooltipCurrent.raise();
            tooltipOthers.raise();
        }
        const mouseleave = function(event, d) {
            tooltipCurrent.style("opacity", 0);
            tooltipOthers.style("opacity", 0);
            d3.selectAll(".myArea").style("opacity", 1).style("stroke", "none");
        }

        // 添加水平虚线
        const yAxisGrid = d3.axisLeft(y)
            .tickSize(-width)
            .tickFormat('')
            .ticks(10);

        svg.append('g')
            .attr('class', 'y axis-grid')
            .call(yAxisGrid)
            .lower(); // 确保网格线在最底层

        // 设置虚线样式
        svg.selectAll(".axis-grid line")
            .style("stroke", "#e0e0e0")
            .style("stroke-dasharray", "3,3");

        svg.selectAll(".axis-grid .domain").remove(); // 移除轴线

        // Area generator
        const area = d3.area()
            .x(function (d) { return x(d.data["date"]); })
            .y0(function (d) { return y(d[0]); })
            .y1(function (d) { return y(d[1]); })

        // 绘制区域
        svg
            .selectAll("mylayers")
            .data(stackedData)
            .join("path")
            .attr("class", "myArea")
            .style("fill", function (d) { return color(d.key); })
            .attr("d", area)
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)

        // 添加Y轴
        svg.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(y)
                .tickFormat(d => {
                    if (d === 0) return "0";
                    return d3.format(".1s")(d).replace("G", "B");
                })
                .ticks(7)
            )
            .attr("transform", `translate(${width}, 0)`); // 将Y轴移到右侧

        // 添加Y轴标签
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", width + 40)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Price");
    }
})
