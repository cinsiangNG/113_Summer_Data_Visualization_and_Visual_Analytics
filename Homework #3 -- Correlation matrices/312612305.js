const width = window.innerWidth;
const height = window.innerHeight;
const svg1 = d3.select('#svg1').attr('height',height*0.8).attr('width',width*0.3);
const svg2 = d3.select('#svg2').attr('height',height*0.8).attr('width',width*0.3);
const svg3 = d3.select('#svg3').attr('height',height*0.8).attr('width',width*0.3);
const Lgd = d3.select('#Lgd').attr('height',height*0.8).attr('width',width*0.1);
const Text = d3.select('#Text').attr('height',height*0.2).attr('width',width);
var color = d3.scaleLinear()
.domain([-1,0,1])
.range(["#EE5B11", "#fff", "#46886F"]); 


const margin = { top: height*0.2, 
          right: width*0.05,
          bottom: 0,
          left: width*0.05};


const Txt1 = Text.append('text').text('Hover on cell to compare')
.attr("transform", `translate(${margin.left},30)`)
.attr("alignment-baseline", "middle");

const Txt2 = Text.append('text').text('')
.attr("transform", `translate(${margin.left},60)`)
.attr("alignment-baseline", "middle");
const Txt3 = Text.append('text').text('')
.attr("transform", `translate(${margin.left},90)`)
.attr("alignment-baseline", "middle");

const Legend = () => {
const innerW = width*0.1-margin.left-margin.right;
const innerH = width*0.3-margin.left-margin.right;
var aS = d3.scaleLinear()
     .range([ 0, innerH-10])
     .domain([1, -1]);
     
var yA = d3.axisRight()
     .scale(aS)
     .tickPadding(7);

var aG = Lgd.append("g")
.attr("class", "y axis")
.call(yA)
.attr("transform", "translate(" + (innerW + margin.right / 2) + "," + (margin.top-40) + ")");

var iR = d3.range(-1, 1.01, 0.01);
var h = innerH / iR.length + 3;
iR.forEach(function(d){
 aG.append('rect')
   .style('fill',color(d))
   .style('stroke-width', 0)
   .style('stoke', 'none')
   .attr('height', h)
   .attr('width', 10)
   .attr('x', 0)
   .attr('y', aS(d))
});

};


const render = (parent,data,col,title) =>{
var corr = jz.arr.correlationMatrix(data, col);

const innerW = width*0.3-margin.left-margin.right;
const innerH = width*0.3-margin.left-margin.right;

const g = parent.append('g')
.attr('transform',`translate(${margin.left+45}, ${margin.top-40})`);


var x = d3.scaleBand()
.domain(col)
.range([0,innerW]);

var y = d3.scaleBand()
.domain(col)
.range([0,innerH]);

var num = Math.sqrt(data.length)

g.append("text")
.attr("x", innerW/2)
.attr("y", -15)
.attr("text-anchor", "middle")
.style("font-size", "1.2em")
.text(title);

var cor = g.selectAll(".cor")
.data(corr)
.enter()
.append("g")
.attr("class", "cor")
.attr("transform", function(d) {
 return "translate(" + x(d.column_x) + "," + y(d.column_y) + ")";
})
.on('mouseover', function() {
  const data = d3.select(this).datum();

  if (data) {
      d3.select(this)
          .select("rect")
          .attr("stroke", "red")
          .attr("stroke-width", 2);
      mouseOver(data.column_x, data.column_y, data.correlation);
  } else {
      console.error('未找到数据:', data);
      Txt1.text('无法获取特征');
      Txt2.text('');
      Txt3.text('');
  }
})
.on('mouseout', function(d){
 d3.select(this)
   .select("rect")
   .attr("stroke", "none"); 
 Txt1.text('Hover on the cell you want to compare');
 Txt2.text('');
 Txt3.text('');
});

cor.append('rect')
.attr('width', innerW/9)
.attr('height', innerH/9)
.attr('fill', "#FAFAFA")

cor.filter(function(d){
   var ypos = col.indexOf(d.column_y);
   var xpos = col.indexOf(d.column_x);
   for (var i = (ypos + 1); i < num; i++){
     if (i === xpos) return false;
   }
   return true;
 })
 .append("text")
 .attr('x', innerW/18) 
 .attr('y', innerH/18) 
 .attr('text-anchor', 'middle') 
 .attr('alignment-baseline', 'middle')
 .text((d) => {
   if (d.column_x === d.column_y) {
     // return d.column_x;
   } else {
     return d.correlation.toFixed(2);
   }
 })
 .style("fill", function(d){
   if (d.value === 1) {
     return "#000";
   } else {
     return color(d.correlation);
   }
 });

 cor.filter(function(d){
   var ypos = col.indexOf(d.column_y);
   var xpos = col.indexOf(d.column_x);
   for (var i = (ypos + 1); i < num; i++){
     if (i === xpos) return true;
   }
   return false;
 })
 .append("circle")
 .attr('cx', innerW/18) 
 .attr('cy', innerH/18) 
 .attr("r", function(d){
   return (width / (num * 3)) * (Math.abs(d.correlation) + 0.1);
 })
 .style("fill", function(d){
   if (d.value === 1) {
     return "#000";
   } else {
     return color(d.correlation);
   }
 });

g.append("g")
.selectAll(".left-label")
.data(col)
.enter()
.append("text")
.attr("class", "left-label")
.attr("x", -5)
.attr("y", (d) => y(d) + y.bandwidth() / 2)
.attr("text-anchor", "end")
.attr("alignment-baseline", "middle")
.text((d) => d);

g.append("g")
.selectAll(".bottom-label")
.data(col)
.enter()
.append("text")
.attr("class", "bottom-label")
.attr("x", (d) => x(d) + x.bandwidth() / 2)
.attr("y", innerH + 10)
.attr("transform", (d) => `rotate(45, ${x(d) + x.bandwidth() / 2}, ${innerH + 10})`) 
.text((d) => d);



};

const columnNames = ['Sex','Length','Diameter','Height','Whole_weight','Shucked_weight','Viscera_weight','Shell_weight','Rings'];

d3.text('http://vis.lab.djosix.com:2024/data/abalone.data').then((data) => {
    var rows = data.trim().split('\n');
    var result = [];
    rows.forEach(function(r) {
        var values = r.split(',');
        var obj = {};
        columnNames.forEach((key, index)=>{
            if(key==='Sex'){
                obj[key] = values[index];
            }
            else{
                obj[key] = +values[index];
            };
        });
        result.push(obj);
    });
    const data_M = result.filter(item => item['Sex'] === 'M');
    const data_F = result.filter(item => item['Sex'] === 'F');
    const data_I = result.filter(item => item['Sex'] === 'I');
    
    const cols = columnNames.filter(col => col !== 'Sex');
    render(svg1, data_M, cols, 'Male');
    render(svg2, data_F, cols, 'Female');
    render(svg3, data_I, cols, 'Infant');
    Legend();
});



const mouseOver = (x,y,v) => {
Txt1.text(`Feature x: ${x}`);
Txt2.text(`Feature y: ${y}`);
d3.text('http://vis.lab.djosix.com:2024/data/abalone.data').then((data) => {
  var rows = data.trim().split('\n');
  var result = [];
  rows.forEach(function(r) {
      var values = r.split(',');
      var obj = {};
      columnNames.forEach((key, index)=>{
          if(key==='Sex'){
              obj[key] = values[index];
          }
          else{
              obj[key] = +values[index];
          };
      });
      result.push(obj);
  });
  const data_M = result.filter(item => item['Sex'] === 'M');
  const data_F = result.filter(item => item['Sex'] === 'F');
  const data_I = result.filter(item => item['Sex'] === 'I');
  const cols = columnNames.filter(col => col !== 'Sex');
  var corr_M = jz.arr.correlationMatrix(data_M, cols);
  var corr_F = jz.arr.correlationMatrix(data_F, cols);
  var corr_I = jz.arr.correlationMatrix(data_I, cols);
  //console.log(corr_M);
  var val_M = corr_M.find(function(d) {
  return d.column_x === x && d.column_y === y;
  }).correlation;
  var val_F = corr_F.find(function(d) {
  return d.column_x === x && d.column_y === y;
  }).correlation;
  var val_I = corr_I.find(function(d) {
  return d.column_x === x && d.column_y === y;
  }).correlation;
  Txt3.text(`Correlation in Male:${val_M.toFixed(2)}, Female:${val_F.toFixed(2)}, Infant:${val_I.toFixed(2)}`);
});
};
