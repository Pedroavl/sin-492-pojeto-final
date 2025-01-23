document.addEventListener('DOMContentLoaded', function () {
    // Seleciona o contêiner e cria elementos básicos
    var container = d3.select(".vi3");
    container.append("h2").text("Total de Atletas x Medalhas por País");

    // Adiciona o título dinâmico do ano
    var yearTitle = container.append("h3")
        .attr("id", "year-title")
        .style("text-align", "center")
        .text("Ano: Carregando...");

    var svg = container.append("svg")
        .attr("width", 800)
        .attr("height", 400);

    var margin = { top: 20, right: 20, bottom: 60, left: 60 };
    var width = svg.attr("width") - margin.left - margin.right;
    var height = svg.attr("height") - margin.top - margin.bottom;

    var chart = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Carrega os dados CSV
    d3.csv("athlete_events.csv", function (data) {
        // Extrai os anos únicos e os ordena
        var years = Array.from(new Set(data.map(function (d) { return d.Year; }))).sort();
        var yearIndex = 0;

        function update(year) {
            // Atualiza o título do ano
            yearTitle.text("Ano: " + year);

            // Filtra os dados pelo ano atual
            var yearData = data.filter(function (d) { return d.Year == year; });

            // Agrega os dados de atletas e medalhas por país
            var athletes = d3.nest()
                .key(function (d) { return d.Team; })
                .rollup(function (v) { return v.length; })
                .entries(yearData);

            var medals = d3.nest()
                .key(function (d) { return d.Team; })
                .rollup(function (v) { return v.filter(function (d) { return d.Medal; }).length; })
                .entries(yearData);

            // Combina os dados de atletas e medalhas
            var combined = athletes.map(function (a) {
                var medal = medals.find(function (m) { return m.key === a.key; });
                return {
                    team: a.key,
                    athletes: a.value,
                    medals: medal ? medal.value : 0
                };
            });

            // Define as escalas
            var x = d3.scaleLinear()
                .domain([0, d3.max(combined, function (d) { return d.athletes; })])
                .range([0, width]);

            var y = d3.scaleLinear()
                .domain([0, d3.max(combined, function (d) { return d.medals; })])
                .range([height, 0]);

            // Limpa o gráfico antes de redesenhar
            chart.selectAll("*").remove();

            // Adiciona os círculos
            chart.selectAll("circle")
                .data(combined)
                .enter()
                .append("circle")
                .attr("cx", function (d) { return x(d.athletes); })
                .attr("cy", function (d) { return y(d.medals); })
                .attr("r", 5)
                .attr("fill", "green")
                .append("title")
                .text(function (d) { return "País: " + d.team + "\nAtletas: " + d.athletes + "\nMedalhas: " + d.medals; });

            // Adiciona o eixo X
            chart.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x).ticks(5).tickSize(5))
                .append("text")
                .attr("x", width / 2)
                .attr("y", 40)
                .style("text-anchor", "middle")
                .text("Número de Atletas");

            // Adiciona o eixo Y
            chart.append("g")
                .call(d3.axisLeft(y).ticks(5).tickSize(5))
                .append("text")
                .attr("x", -40)
                .attr("y", height / 2)
                .style("text-anchor", "middle")
                .attr("transform", "rotate(-90)")
                .text("Número de Medalhas");
        }

        function animate() {
            update(years[yearIndex]);
            yearIndex = (yearIndex + 1) % years.length;
            setTimeout(animate, 1500);
        }

        // Inicia a animação
        animate();
    });
});
