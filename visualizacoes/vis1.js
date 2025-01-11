document.addEventListener('DOMContentLoaded', function (e) {
    // set the dimensions and margins of the graph
    var margin = { top: 10, right: 100, bottom: 30, left: 30 },
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#vis1")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Read the data
    d3.csv("athlete_events.csv", function (data) {
        var groupSports = data.filter(d => d.Sport !== "NA");
        var groupTeams = data.filter(d => d.Team !== "NA");

        // Remove duplicate teams
        var uniqueTeams = Array.from(new Set(groupTeams.map(d => d.Team))).map(team => {
            return { Team: team };
        });

        console.log(uniqueTeams);

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

        // Function to update the data based on selections
        function updateSelectedData() {
            var selectedSport = document.getElementById("selectSports").value;
            var selectedTeam = document.getElementById("selectTeams").value;

            // Check if both dropdowns have valid selections
            if (selectedSport && selectedTeam) {
                // Filter data by selections and remove pre-1916 results (only 100 years of data)
                var filteredData = data.filter(d => d.Sport === selectedSport && d.Team === selectedTeam && d.Year >= 1916);

                // Show only medalists athletes inside filtered data
                filteredData = filteredData.filter(d => d.Medal !== "NA");

                // Counting the number of medals per athlete ordered by the year of the event
                var medalCount = filteredData.reduce((acc, curr) => {
                    if (!acc[curr.Name]) {
                        acc[curr.Name] = {};
                    }
                    if (acc[curr.Name][curr.Year]) {
                        acc[curr.Name][curr.Year]++;
                    } else {
                        acc[curr.Name][curr.Year] = 1;
                    }
                    return acc;
                }, {});

                // Transform the medalCount object into an array of entries and sort by year
                var sortedMedalCount = [];
                for (let athlete in medalCount) {
                    for (let year in medalCount[athlete]) {
                        sortedMedalCount.push({
                            athlete: athlete,
                            year: year,
                            medals: medalCount[athlete][year]
                        });
                    }
                }

                sortedMedalCount.sort((a, b) => a.year - b.year);

                // Store the sortedMedalCount as an array of objects
                var medalData = sortedMedalCount.map(entry => ({
                    athlete: entry.athlete,
                    year: entry.year,
                    medals: entry.medals
                }));

                console.log('Medalists data', medalData);

                // Knowledge check
                var medalistAthletes = new Set(filteredData.map(d => d.Name));
                var totalMedals = filteredData.length;
                console.log(`${selectedTeam} has won ${totalMedals} total medals in ${selectedSport} with ${medalistAthletes.size} athletes`);

                // Number of medals won by the selected country in the selected sport, grouped by year
                var medalsByYear = filteredData.reduce((acc, curr) => {
                    if (!acc[curr.Year]) {
                        acc[curr.Year] = 0;
                    }
                    acc[curr.Year]++;
                    return acc;
                }, {});

                for (let year in medalsByYear) {
                    console.log(`${medalsByYear[year]} medals in ${year}`);
                }
            }
        }

        // Add event listeners to the dropdowns
        document.getElementById("selectSports").addEventListener("change", updateSelectedData);
        document.getElementById("selectTeams").addEventListener("change", updateSelectedData);

        // Add X axis --> it is a date format
        var x = d3.scaleLinear()
            .domain([0, 10])
            .range([0, width]);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([0, 20])
            .range([height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y));

        // Initialize line with group a
        var line = svg
            .append('g')
            .append("path")
            .datum(data)
            .attr("d", d3.line()
                .x(function (d) { return x(+d.time) })
                .y(function (d) { return y(+d.valueA) })
            )
            .attr("stroke", "black")
            .style("stroke-width", 4)
            .style("fill", "none");

        // Initialize dots with group a
        var dot = svg
            .selectAll('circle')
            .data(data)
            .enter()
            .append('circle')
            .attr("cx", function (d) { return x(+d.time) })
            .attr("cy", function (d) { return y(+d.valueA) })
            .attr("r", 7)
            .style("fill", "#69b3a2");

        // A function that updates the chart
        function update(selectedGroup) {

            // Create new data with the selection?
            var dataFilter = data.map(function (d) { return { time: d.time, value: d[selectedGroup] }; });

            // Give these new data to update line
            line
                .datum(dataFilter)
                .transition()
                .duration(1000)
                .attr("d", d3.line()
                    .x(function (d) { return x(+d.time); })
                    .y(function (d) { return y(+d.value); })
                );

            // Update dots with new data
            dot
                .data(dataFilter)
                .transition()
                .duration(1000)
                .attr("cx", function (d) { return x(+d.time); })
                .attr("cy", function (d) { return y(+d.value); });
        }

        // When the button is changed, run the updateChart function
        d3.select("#selectButton").on("change", function (d) {
            // recover the option that has been chosen
            var selectedOption = d3.select(this).property("value");
            // run the updateChart function with this selected option
            update(selectedOption);
        });

    });
});