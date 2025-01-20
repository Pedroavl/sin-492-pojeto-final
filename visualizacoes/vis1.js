document.addEventListener('DOMContentLoaded', function (e) {
    // set the dimensions and margins of the graph
    var margin = { top: 10, right: 100, bottom: 30, left: 30 },
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select(".vis1")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    var line, dots;

    // Read the data
    d3.csv("athlete_events.csv", function (data) {
        var groupSports = data.filter(d => d.Sport !== "NA");
        var groupTeams = data.filter(d => d.Team !== "NA");

        // Remove duplicate teams
        var uniqueTeams = Array.from(new Set(groupTeams.map(d => d.Team))).map(team => {
            return { Team: team };
        });

        // Remove duplicate Sports
        var uniqueSports = Array.from(new Set(groupSports.map(d => d.Sport))).map(sport => {
            return { Sport: sport };
        });

        // add the options to the sports button
        d3.select("#selectSports")
            .selectAll('myOptions')
            .data(uniqueSports.slice(0, 20))
            .enter()
            .append('option')
            .text(function (d) { return d.Sport; }) // text showed in the menu
            .attr("value", function (d) { return d.Sport; }) // corresponding value returned by the button

        // Add the options to the teams button
        d3.select("#selectTeams")
            .selectAll('myOptions')
            .data(uniqueTeams.slice(0, 20))
            .enter()
            .append('option')
            .text(function (d) { return d.Team; }) // text showed in the menu
            .attr("value", function (d) { return d.Team; }) // corresponding value returned by the button

        // Define the exception cases: sports and gymnastics team events
        const teamSports = ["Basketball", "Football", "Tug of War", "Ice Hockey", "Handball", "Water Polo"];
        const gymnasticsTeamEvents = ["Gymnastics Women's Team All-Around", "Gymnastics Men's Team All-Around"];

        // Function to update the data based on selections
        function filterSelectedData() {
            // Get selected sport and team from dropdowns
            var selectedSport = document.getElementById("selectSports").value;
            var selectedTeam = document.getElementById("selectTeams").value;

            // Check if both dropdowns have valid selections
            if (selectedSport && selectedTeam) {
                // Filter the data based on the selected values and remove results before 1916
                var filteredData = data.filter(d => d.Sport === selectedSport && d.Team === selectedTeam && d.Year >= 1916);

                // Show only medalist athletes inside filtered data
                filteredData = filteredData.filter(d => d.Medal !== "NA");
                console.log('Filtered medalist athletes:', filteredData);

                // Count the number of unique medalist athletes
                var medalistAthletes = new Set(filteredData.map(d => d.Name));
                console.log(`${selectedTeam} has ${medalistAthletes.size} medalist athletes in ${selectedSport}`);

                // Count the number of medals won by the selected country in the selected sport, grouped by year
                var medalsByYear = {};
                filteredData.forEach(d => {
                    if (!medalsByYear[d.Year]) {
                        medalsByYear[d.Year] = 0;
                    }
                    if (teamSports.includes(selectedSport) || gymnasticsTeamEvents.includes(d.Event)) {
                        if (medalsByYear[d.Year] === 0) {
                            medalsByYear[d.Year] = 1;
                        }
                    } else {
                        medalsByYear[d.Year]++;
                    }
                });

                // Log the number of medals won by year
                for (let year in medalsByYear) {
                    console.log(`${selectedTeam} has won ${medalsByYear[year]} medals in ${selectedSport} in ${year}`);
                }

                // Calculate the total number of medals won by the selected country in the selected sport
                var totalMedals = 0;
                if (teamSports.includes(selectedSport) || gymnasticsTeamEvents.includes(selectedSport)) {
                    totalMedals = Object.keys(medalsByYear).length;
                } else {
                    totalMedals = filteredData.length;
                }
                console.log(`${selectedTeam} has won ${totalMedals} total medals in ${selectedSport}`);

                // Prepare the final array for visualization
                var medalsByYearForTeams = {};
                var dataForVis1 = [];
                var uniqueEntries = new Set();
                var aggregatedMedals = {};

                // Process filtered data to create the final array
                filteredData.forEach(d => {
                    if (teamSports.includes(selectedSport) || gymnasticsTeamEvents.includes(d.Event)) {
                        // Handle team sports and gymnastics team events
                        if (!medalsByYearForTeams[d.Year]) {
                            medalsByYearForTeams[d.Year] = { men: false, women: false };
                        }
                        if (gymnasticsTeamEvents.includes(d.Event)) {
                            if (d.Sex === "M" && !medalsByYearForTeams[d.Year].men) {
                                medalsByYearForTeams[d.Year].men = true;
                                console.log(`1 medal(s) from the gymnastics team of ${selectedTeam} in ${d.Year}`);
                                dataForVis1.push({
                                    year: d.Year,
                                    medals: 1,
                                    team: `${d.Year} ${selectedTeam} Men's Gymnastics Team`,
                                    event: d.Event
                                });
                            } else if (d.Sex === "F" && !medalsByYearForTeams[d.Year].women) {
                                medalsByYearForTeams[d.Year].women = true;
                                console.log(`1 medal(s) from the gymnastics team of ${selectedTeam} in ${d.Year}`);
                                dataForVis1.push({
                                    year: d.Year,
                                    medals: 1,
                                    team: `${d.Year} ${selectedTeam} Women's Gymnastics Team`,
                                    event: d.Event
                                });
                            }
                        } else {
                            if (d.Sex === "M" && !medalsByYearForTeams[d.Year].men) {
                                medalsByYearForTeams[d.Year].men = true;
                                console.log(`1 medal(s) from the ${selectedSport} team of ${selectedTeam} in ${d.Year}`);
                                dataForVis1.push({
                                    year: d.Year,
                                    medals: 1,
                                    team: `${d.Year} ${selectedTeam} Men's ${selectedSport} Team`,
                                    event: d.Event
                                });
                            } else if (d.Sex === "F" && !medalsByYearForTeams[d.Year].women) {
                                medalsByYearForTeams[d.Year].women = true;
                                console.log(`1 medal(s) from the ${selectedSport} team of ${selectedTeam} in ${d.Year}`);
                                dataForVis1.push({
                                    year: d.Year,
                                    medals: 1,
                                    team: `${d.Year} ${selectedTeam} Women's ${selectedSport} Team`,
                                    event: d.Event
                                });
                            }
                        }
                    } else {
                        // Handle individual sports
                        const entryKey = `${d.Name}-${d.Year}`;
                        if (!aggregatedMedals[entryKey]) {
                            aggregatedMedals[entryKey] = {
                                year: d.Year,
                                medals: 0,
                                team: d.Name,
                                event: d.Event
                            };
                        }
                        aggregatedMedals[entryKey].medals += 1;
                    }
                });

                // Add aggregated individual medals to the final array
                Object.values(aggregatedMedals).forEach(entry => {
                    dataForVis1.push({
                        year: entry.year,
                        medals: entry.medals,
                        team: entry.team,
                        event: entry.event
                    });
                });

                

                // Final array for visualization
                console.log('dataForVis1:', dataForVis1);

                // Sort dataForVis1 by year (oldest first)
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

        // Add event listeners to the dropdowns
        document.getElementById("selectSports").addEventListener("change", filterSelectedData);
        document.getElementById("selectTeams").addEventListener("change", filterSelectedData);

    });
});