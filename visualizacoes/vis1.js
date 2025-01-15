document.addEventListener('DOMContentLoaded', function () {
    var margin = { top: 10, right: 100, bottom: 30, left: 30 },
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    var svg = d3.select(".vis1")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    var line, dots;

    d3.csv("athlete_events.csv", function (data) {
        // Remove duplicates and limite the 20 entries for spots and teams
        var uniqueSports = Array.from(new Set(data.map(d => d.Sport))).slice(0, 20).map(sport => ({ Sport: sport }));
        var uniqueTeams = Array.from(new Set(data.map(d => d.Team))).slice(0, 20).map(team => ({ Team: team }));

        d3.select("#selectSports")
            .selectAll('option')
            .data(uniqueSports)
            .enter()
            .append('option')
            .text(d => d.Sport)
            .attr("value", d => d.Sport);

        d3.select("#selectTeams")
            .selectAll('option')
            .data(uniqueTeams)
            .enter()
            .append('option')
            .text(d => d.Team)
            .attr("value", d => d.Team);

        function filterSelectedData() {
            // get values select tag sports and teams
            var selectedSport = d3.select("#selectSports").property("value");
            var selectedTeam = d3.select("#selectTeams").property("value");

            if (selectedSport && selectedTeam) {
                var filteredData = data.filter(d => d.Sport === selectedSport && d.Team === selectedTeam && d.Year >= 1916 && d.Medal !== "NA");

                var dataForVis1 = [];
                filteredData.forEach(d => {
                    const year = +d.Year;
                    const existingEntry = dataForVis1.find(entry => entry.year === year);
                    if (existingEntry) {
                        existingEntry.medals++;
                    } else {
                        dataForVis1.push({ year: year, medals: 1 });
                    }
                });

                dataForVis1.sort((a, b) => a.year - b.year);

                x.domain(d3.extent(dataForVis1, d => d.year));
                y.domain([0, d3.max(dataForVis1, d => d.medals)]);

                svg.selectAll(".x-axis").remove();
                svg.selectAll(".y-axis").remove();

                svg.append("g")
                    .attr("class", "x-axis")
                    .attr("transform", `translate(0,${height})`)
                    .call(d3.axisBottom(x));

                svg.append("g")
                    .attr("class", "y-axis")
                    .call(d3.axisLeft(y));

                if (!line) {
                    line = svg.append("path")
                        .attr("class", "line")
                        .style("stroke", "black")
                        .style("stroke-width", 2)
                        .style("fill", "none");
                }

                line.datum(dataForVis1)
                    .transition()
                    .duration(1500)
                    .attr("d", d3.line()
                        .x(d => x(d.year))
                        .y(d => y(d.medals)));

                if (!dots) {
                    dots = svg.selectAll("circle")
                        .data(dataForVis1)
                        .enter()
                        .append("circle")
                        .attr("r", 5)
                        .style("fill", "#69b3a2");
                }

                dots = svg.selectAll("circle")
                    .data(dataForVis1);

                dots.enter()
                    .append("circle")
                    .merge(dots)
                    .transition()
                    .duration(1550)
                    .attr("cx", d => x(d.year))
                    .attr("cy", d => y(d.medals))
                    .attr("r", 5)
                    .style("fill", "#69b3a2");

                dots.exit()
                .remove()
                .transition()
                .duration(1000);
            }
        }

        d3.select("#selectSports").on("change", filterSelectedData);
        d3.select("#selectTeams").on("change", filterSelectedData);
    });
});
