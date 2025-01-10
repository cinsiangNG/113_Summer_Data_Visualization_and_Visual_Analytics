const width = 960;
const margin = {
    top: 50,
    right: 20,
    bottom: 50,
    left: 400,
};
const graphInnerWidth = width - margin.left - margin.right;

const score_group = [
    "scores_teaching",
    "scores_research",
    "scores_citations",
    "scores_industry_income",
    "scores_international_outlook",
];

const color = d3.scaleOrdinal(d3.schemeSet2);

const calScoresSum = (item) => {
    const {
        scores_teaching,
        scores_research,
        scores_citations,
        scores_industry_income,
        scores_international_outlook,
    } = item;

    const scores_sum =
        parseFloat(scores_teaching) +
        parseFloat(scores_research) +
        parseFloat(scores_citations) +
        parseFloat(scores_industry_income) +
        parseFloat(scores_international_outlook);

    const modifiedItem = {
        scores_sum,
        ...item,
    };
    return modifiedItem;
};

const render = (data, sortKey, sortType) => {
    const school_name = data.map((d) => d.name);
    const updatedData = data.map((d) => calScoresSum(d));
    const height = school_name.length * 25 + margin.top + margin.bottom; 

    const svg = d3.select("svg");
    const g = svg
        .append("g")
        .attr("id", "graph")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
    svg.attr("height", height);
    svg.attr("width", width);

    let sortedData;
    if (sortType == "ascending") {
        sortedData = updatedData
            .slice()
            .sort((a, b) => d3.ascending(+a[sortKey], +b[sortKey]));
        console.log(sortKey, "asc", sortedData);
    } else {
        sortedData = updatedData
            .slice()
            .sort((a, b) => d3.descending(+a[sortKey], +b[sortKey]));
        console.log(sortKey, "desc", sortedData);
    }

    const stack = d3
        .stack()
        .keys(score_group)
        .value((obj, key) => obj[key]);
    const stackedData = stack(sortedData);

    const y = d3
        .scaleBand()
        .domain(sortedData.map((d) => d.name))
        .range([margin.top, height - margin.bottom]);

    g.append("g")
        .attr("id", "y-axis-group")
        .call(d3.axisLeft(y).tickSizeInner(10))
        .call((g) => g.selectAll(".domain").remove()); 

    const x = d3.scaleLinear().domain([0, 500]).range([0, graphInnerWidth]);

    g.append("g")
        .attr("id", "x-axis-group")
        .call(d3.axisTop(x).tickArguments([20, "s"]))
        .selectAll("text")
        .call((g) => g.selectAll(".domain").remove()); 

    g.append("text")
        .attr("x", graphInnerWidth / 2)
        .attr("y", `${-margin.top / 2 - 5}`)
        .attr("fill", "black")
        .attr("class", "x-axis-label")
        .text("Scores");

    const tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip")
        .attr("style", "position: absolute; opacity: 0;");

    const mouseover = function (_d) {
        tooltip.style("opacity", 1.0);
        d3.select(this).style("opacity", 0.3);
    };

    const mousemove = function (event, d) {
        const formatter = d3.format(",.2f");
        tooltip
            .html(
                d.data.name +
                    "<br/>" +
                    formatter(d[1] - d[0]) +
                    "<br/>" +
                    `Overall Scores: ${formatter(d.data.scores_sum)}`
            )
            .style("top", event.pageY - 20 + "px")
            .style("left", event.pageX + 20 + "px");
    };

    const mouseleave = function (_d) {
        tooltip.style("opacity", 0);
        d3.select(this).style("opacity", 1);
    };

    const stackedBars = g
        .append("g")
        .attr("id", "whole_stack_bars_chart")
        .selectAll("myStackedBars")
        .data(stackedData)
        .join("g")
        .attr("id", "stack_bar_group")
        .style("fill", (d, index) => {
            switch (index) {
                case 0: return "#BF0060"; // scores_teaching
                case 1: return "#6F00D2"; // scores_research
                case 2: return "#01B468"; // scores_citations
                case 3: return "#FF8000"; // scores_industry_income
                case 4: return "#0066CC"; // scores_international_outlook
            }
        });

    stackedBars
        .selectAll("rect")
        .data((d) => d)
        .join("rect")
        .attr("class", "stack_bar")
        .attr("x", (d) => x(d[0]))
        .attr("y", (d) => y(d.data.name))
        .attr("width", (d) => x(d[1]) - x(d[0]))
        .attr("height", 18)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);
};

d3.csv("http://vis.lab.djosix.com:2024/data/TIMES_WorldUniversityRankings_2024.csv").then((data) => {
    let filteredData = data.filter((d) => {
        return d.rank !== "Reporter"; 
    });
    let sortIndexElement = document.querySelector("#sort-key");
    let sortTypeElement = document.querySelector("#sort-type");

    sortIndexElement.addEventListener("change", (_event) => {
        let sortIndex = sortIndexElement[sortIndexElement.selectedIndex].value;
        let sortType = sortTypeElement[sortTypeElement.selectedIndex].value;
        d3.select("#graph").remove();
        render(filteredData, sortIndex, sortType);
    });

    sortTypeElement.addEventListener("change", (_event) => {
        let sortIndex = sortIndexElement[sortIndexElement.selectedIndex].value;
        let sortType = sortTypeElement[sortTypeElement.selectedIndex].value;
        d3.select("#graph").remove();
        render(filteredData, sortIndex, sortType);
    });

    render(filteredData, "scores_sum", "descending");
});
