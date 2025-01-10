const data_path = "http://vis.lab.djosix.com:2024/data/air-pollution.csv"

d3.csv(data_path).then(function (data) { 
    // console.log("data:", data)

    roundTo = function (num, decimal) { return Math.round((num + Number.EPSILON) * Math.pow(10, decimal)) / Math.pow(10, decimal); }

    function aggregate(data, type) {
        var sums = data.reduce(function (acc, obj) {
            var date = obj["Measurement date"].split(" ")[0];
            var station = obj["Station code"];
            if (!acc[date]) {
                acc[date] = {};
            }
            if (!acc[date][station]) {
                acc[date][station] = { sum: 0, count: 0 };
            }
            acc[date][station].sum += +obj[type];
            acc[date][station].count++;
            return acc;
        }, Object.create(null));

        return Object.keys(sums).map(function (date) {
            // console.log("sums:", sums)
            // console.log("sums[date]:", sums[date])
            return Object.keys(sums[date]).map(function (station) {
                // console.log("date:", date)
                // console.log("station:", station)
                return {
                    "ts": new Date(date),
                    "series": station,
                    "val": roundTo(sums[date][station].sum / sums[date][station].count, 4),
                };
            });
        });
    }

    // add an event listener for the change event
    const radioButtons = document.querySelectorAll('input[name="type"]');
    for (const radioButton of radioButtons) {
        radioButton.addEventListener('change', showSelected);
    }

    function showSelected(e) {
        // console.log(e);
        if (this.checked) {
            render(this.value)
        }
    }
    
    function render(type) {
        var data_2 = aggregate(data, type)
        var data_3 = [].concat(...data_2);

        // 添加数据统计信息
        displayStatistics(data_3, type);

        // 添加数据过滤功能
        var filteredData = filterData(data_3);

        HorizonTSChart()(document.getElementById('horizon-chart'))
            .data(filteredData)
            .series('series')
            .width(window.innerWidth * 0.9)
            .height(600)
            .title(type)
            .tooltipContent((d) => `
                日期: ${d.ts.toLocaleDateString('zh-CN')}
                <br>站点: ${d.series}
                <br>${type}: ${d.val.toFixed(2)}
            `)
            .enableTooltip(true)  // 确保启用 tooltip
            .tooltipTrigger('mousemove')  // 使用 mousemove 触发 tooltip
            .tooltipPosition('closest')  // 将 tooltip 定位到最近的数据点
            // ... 其他设置 ...
    }

    function displayStatistics(data, type) {
        const stats = calculateStatistics(data);
        const statsDiv = document.getElementById('statistics');
        statsDiv.innerHTML = `
            <h3>${type} Statistics</h3>
            <p>Mean: ${stats.mean.toFixed(2)}</p>
            <p>Maximum: ${stats.max.toFixed(2)}</p>
            <p>Minimum: ${stats.min.toFixed(2)}</p>
            <p>Standard Deviation: ${stats.stdDev.toFixed(2)}</p>
        `;
    }

    function calculateStatistics(data) {
        const values = data.map(d => d.val);
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const max = Math.max(...values);
        const min = Math.min(...values);
        const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);
        return { mean, max, min, stdDev };
    }

    function filterData(data) {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const selectedStations = Array.from(document.querySelectorAll('input[name="station"]:checked')).map(el => el.value);

        return data.filter(d => {
            const date = d.ts;
            return (!startDate || date >= new Date(startDate)) &&
                   (!endDate || date <= new Date(endDate)) &&
                   (selectedStations.length === 0 || selectedStations.includes(d.series));
        });
    }

    // 在初始化时添加日期选择器和站点复选框
    function initializeFilters() {
        const stations = [...new Set(data.map(d => d["Station code"]))];
        const filterDiv = document.getElementById('filters');
        filterDiv.innerHTML = `
            <label>开始日期: <input type="date" id="startDate"></label>
            <label>结束日期: <input type="date" id="endDate"></label>
            <div id="stationFilters">
                ${stations.map(station => `
                    <label><input type="checkbox" name="station" value="${station}"> ${station}</label>
                `).join('')}
            </div>
        `;

        // 添加过滤器变化事件监听器
        document.getElementById('startDate').addEventListener('change', () => render(getCurrentType()));
        document.getElementById('endDate').addEventListener('change', () => render(getCurrentType()));
        document.querySelectorAll('input[name="station"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => render(getCurrentType()));
        });
    }

    function getCurrentType() {
        return document.querySelector('input[name="type"]:checked').value;
    }

    // 在初始化时调用
    initializeFilters();
    render("SO2");
});




