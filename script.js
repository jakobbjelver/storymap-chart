// Function to process CSV data
function processData(data) {
    try {
        // Assuming the first row is headers
        var headers = data[0].slice(1); // Remove 'geo' from headers
        var lines = data.slice(1); // Remove the header row

        var portugalData = [];
        var swedenData = [];
        var portugalRegions = ['PT11', 'PT15', 'PT16', 'PT17', 'PT18', 'PT20', 'PT30'];
        var swedenRegions = ['SE11', 'SE12', 'SE21', 'SE22', 'SE23', 'SE31', 'SE32', 'SE33'];

        lines.forEach(function(line) {
            var geo = line[0];
            var values = line.slice(1).map(Number);
            if (portugalRegions.includes(geo)) {
                portugalData.push(values);
            } else if (swedenRegions.includes(geo)) {
                swedenData.push(values);
            }
        });

        // Calculate mean values for each year for Portugal and Sweden
        var portugalMean = [], swedenMean = [];
        for (var year = 0; year < headers.length - 1; year++) {
            var portugalSum = 0, swedenSum = 0;
            var portugalCount = 0, swedenCount = 0;
            portugalData.forEach(function(region) {
                if (!isNaN(region[year])) {
                    portugalSum += region[year];
                    portugalCount++;
                }
            });
            swedenData.forEach(function(region) {
                if (!isNaN(region[year])) {
                    swedenSum += region[year];
                    swedenCount++;
                }
            });
            portugalMean.push(portugalSum / portugalCount);
            swedenMean.push(swedenSum / swedenCount);
        }

        return { portugalMean, swedenMean, headers };
    } catch (error) {
        console.error('Error processing data:', error);
        alert('An error occurred while processing the data.');
        return null;
    }
}

// Load CSV file and create the chart
Papa.parse('LabourSlackDifferences.csv', {
    download: true,
    complete: function(results) {
        if (results && results.data) {
            var processedData = processData(results.data);
            if (processedData) {
                // Define the chart data
                var options = {
                    chart: {
                        type: 'line',
                        toolbar: {
                            show: false
                        },
                        fontFamily: 'Open Sans, sans-serif', // Set the font family to Open Sans
                    },
                    stroke: {
                        curve: 'smooth'
                    },
                    colors: ['#DF2A43', '#81C8CF'], // Red, Yellow for Sweden, Blue, Green for Portugal
                    series: [
                        {
                            name: 'Portugal',
                            data: processedData.portugalMean
                        },
                        {
                            name: 'Sweden',
                            data: processedData.swedenMean
                        }
                    ],
                    xaxis: {
                        categories: processedData.headers.map(header => "20" + header.split(' ')[2]), // Extract year from the header
                        labels: {
                            formatter: function(value) {
                                return value; // Format X-axis labels to display only the year
                            }
                        }
                    },
                    yaxis: {
                        labels: {
                            formatter: function(value) {
                                return value.toFixed(2); // Round Y-axis values to two decimals
                            }
                        }
                    },
                };

                // Create the chart
                var chart = new ApexCharts(document.querySelector("#chart"), options);
                chart.render();
            }
        } else {
            console.error('Error loading CSV file.');
            alert('Failed to load the CSV file.');
        }
    },
    error: function(error) {
        console.error('Error loading CSV file:', error);
        alert('An error occurred while loading the CSV file.');
    }
});
