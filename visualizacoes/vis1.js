document.addEventListener('DOMContentLoaded', function(e) {
    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 100, bottom: 30, left: 30},
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
    d3.csv("athlete_events.csv", function(data) {
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

        // add the options to the teams button
        d3.select("#selectTeams")
            .selectAll('myOptions')
            .data(uniqueTeams.slice(0, 20))
            .enter()
            .append('option')
            .text(function (d) { return d.Team; }) // text showed in the menu
            .attr("value", function (d) { return d.Team; }) // corresponding value returned by the button

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
                .x(function(d) { return x(+d.time) })
                .y(function(d) { return y(+d.valueA) })
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
            .attr("cx", function(d) { return x(+d.time) })
            .attr("cy", function(d) { return y(+d.valueA) })
            .attr("r", 7)
            .style("fill", "#69b3a2");

        // A function that updates the chart
        function update(selectedGroup) {

            // Create new data with the selection?
            var dataFilter = data.map(function(d) { return { time: d.time, value: d[selectedGroup] }; });

            // Give these new data to update line
            line
                .datum(dataFilter)
                .transition()
                .duration(1000)
                .attr("d", d3.line()
                    .x(function(d) { return x(+d.time); })
                    .y(function(d) { return y(+d.value); })
                );

            // Update dots with new data
            dot
                .data(dataFilter)
                .transition()
                .duration(1000)
                .attr("cx", function(d) { return x(+d.time); })
                .attr("cy", function(d) { return y(+d.value); });
        }

        // When the button is changed, run the updateChart function
        d3.select("#selectButton").on("change", function(d) {
            // recover the option that has been chosen
            var selectedOption = d3.select(this).property("value");
            // run the updateChart function with this selected option
            update(selectedOption);
        });
        
    });
});