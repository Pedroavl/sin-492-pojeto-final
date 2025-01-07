// set the dimensions and margins of the graph
var margin = {top: 50, right: 150, bottom: 100, left: 100},
    width = 900 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#vis1")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Define cores para as medalhas
var color = { Gold: "#FFD700", Silver: "#C0C0C0", Bronze: "#CD7F32" };

// Read the data
d3.csv("./athlete_events.csv", function(data) {

  // Filtra os dados para incluir apenas registros com medalhas e agrupa por país e tipo de medalha
  var medalData = data.filter(d => d.Medal !== "NA");

  // Agrupa os dados por país e tipo de medalha e conta as medalhas
  var medalsByCountry = d3.nest()
    .key(function(d) { return d.Team; })
    .rollup(function(v) {
      return {
        Gold: v.filter(d => d.Medal === "Gold").length,
        Silver: v.filter(d => d.Medal === "Silver").length,
        Bronze: v.filter(d => d.Medal === "Bronze").length
      };
    })
    .entries(medalData);

  // Limita aos 10 países com mais medalhas
  medalsByCountry = medalsByCountry.sort((a, b) => 
    (b.value.Gold + b.value.Silver + b.value.Bronze) - 
    (a.value.Gold + a.value.Silver + a.value.Bronze)
  ).slice(0, 10);

  // Prepara os dados para o gráfico de barras empilhadas
  var stackedData = medalsByCountry.map(d => ({
    Team: d.key,
    Gold: d.value.Gold,
    Silver: d.value.Silver,
    Bronze: d.value.Bronze
  }));

  // Define escalas para o gráfico
  var escalaX = d3.scaleBand()
      .domain(stackedData.map(d => d.Team))
      .range([0, width])
      .padding(0.3);

  var escalaY = d3.scaleLinear()
      .domain([0, d3.max(stackedData, d => d.Gold + d.Silver + d.Bronze)])
      .nice()
      .range([height, 0]);

  // Adiciona o eixo X
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(escalaX))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")
      .style("font-size", "12px");

  // Adiciona o eixo Y
  svg.append("g")
      .call(d3.axisLeft(escalaY).ticks(10))
      .style("font-size", "12px");

  // Cria a pilha para o gráfico de barras empilhadas
  var stack = d3.stack()
    .keys(["Gold", "Silver", "Bronze"]);

  // Aplica a pilha nos dados
  var series = stack(stackedData);

  // Adiciona as barras empilhadas
  svg.selectAll(".serie")
    .data(series)
    .enter()
    .append("g")
      .attr("fill", d => color[d.key])
      .selectAll("rect")
      .data(d => d)
      .enter()
      .append("rect")
        .attr("x", d => escalaX(d.data.Team))
        .attr("y", d => escalaY(d[1]))
        .attr("height", d => escalaY(d[0]) - escalaY(d[1]))
        .attr("width", escalaX.bandwidth());

  // Adiciona a legenda
  var legend = svg.selectAll(".legend")
    .data(["Gold", "Silver", "Bronze"])
    .enter()
    .append("g")
      .attr("class", "legend")
      .attr("transform", (d, i) => "translate(" + (width + 20) + "," + (i * 25) + ")");

  legend.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", d => color[d]);

  legend.append("text")
    .attr("x", 24)
    .attr("y", 13)
    .style("font-size", "12px")
    .text(d => d);

});
