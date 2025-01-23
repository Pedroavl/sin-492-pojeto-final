document.addEventListener('DOMContentLoaded', function () {
    var margin = { top: 10, right: 30, bottom: 50, left: 50 },
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    var svg2 = d3.select(".vis2")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    var tooltip = d3.select(".vis2")
        .append("div")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "solid 1px #ccc")
        .style("border-radius", "5px")
        .style("padding", "10px");

    d3.csv("athlete_events.csv", function (data) {
        var filteredData = data.filter(d => d.Weight !== "NA" && d.Height !== "NA");
        filteredData.forEach(d => {
            d.Weight = +d.Weight;
            d.Height = +d.Height;
            d.Year = +d.Year;
        });


        // Criar opções no dropdown de anos
        var years = Array.from(new Set(filteredData.map(d => d.Year))).sort((a, b) => a - b);
        var selectYear = d3.select("#selectYear");

        selectYear.selectAll("option")
            .data(years)
            .enter()
            .append("option")
            .text(d => d)
            .attr("value", d => d);

        function update(year, name) {
            var yearData = filteredData.filter(d => d.Year === year);
            var nameData = filteredData.filter(d => d.Name === name);

            console.log("Nome:",nameData);
            

            x.domain(d3.extent(yearData, d => d.Weight));
            y.domain(d3.extent(yearData, d => d.Height));

            svg2.selectAll("*").remove();

            svg2.append("g")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x))
                .append("text")
                .attr("text-anchor", "middle")
                .attr("x", width / 2)
                .attr("y", margin.bottom - 10)
                .text("Peso (kg)");

            svg2.append("g")
                .call(d3.axisLeft(y))
                .append("text")
                .attr("text-anchor", "middle")
                .attr("transform", "rotate(-90)")
                .attr("x", -height / 2)
                .attr("y", -margin.left + 15)
                .text("Altura (cm)");

            svg2.selectAll("circle")
                .data(yearData)
                .enter()
                .append("circle")
                .attr("cx", d => x(d.Weight))
                .attr("cy", d => y(d.Height))
                .attr("r", 5)
                .style("fill", "#69b3a2")
                .on("mouseover", function (event, d) {
                    console.log("Teste tooltip: ", d);
                    tooltip
                        .html('<strong>'+nameData+'</strong><br>'+'País: '+d.Team+'<br>Esporte:'+d.Sport)
                        .style("opacity", 1)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 10) + "px");
                })
                .on("mousemove", function (event) {
                    tooltip
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 10) + "px");
                })
                .on("mouseout", function () {
                    tooltip.style("opacity", 0);
                });

            // Identificar esportes com atletas de mesmo peso/altura
            var groupedByWeightHeight = d3.nest()
                .key(d => `${d.Weight}-${d.Height}`)
                .entries(yearData);

            groupedByWeightHeight.forEach(group => {
                if (group.values.length > 1) {
                    console.log(`Mesmos Peso/Altura (${group.key}):`, group.values.map(g => g.Sport));
                }
            });

            var maxHeight = d3.max(yearData, d => d.Height);
            var minHeight = d3.min(yearData, d => d.Height);
            var maxWeight = d3.max(yearData, d => d.Weight);
            var minWeight = d3.min(yearData, d => d.Weight);

            console.log("Esportes com os maiores atletas por altura:", yearData.filter(d => d.Height === maxHeight));
            console.log("Esportes com os menores atletas por altura:", yearData.filter(d => d.Height === minHeight));
            console.log("Esportes com os maiores atletas por peso:", yearData.filter(d => d.Weight === maxWeight));
            console.log("Esportes com os menores atletas por peso:", yearData.filter(d => d.Weight === minWeight));
        }

        d3.select("#selectYear").on("change", function () {
            var selectedYear = +this.value;
            if (!isNaN(selectedYear)) {
                update(selectedYear);
            }
        });

        update(years[0]);
    });
});
