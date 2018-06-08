'use strict'

angular.module('graph')
    .factory('graph', ['fileReader', function(fileReader) {

        //Labels
        var labels = ['Jan10', "Feb10", "Mar10", "Apr10", "May10", "Jun10", "Jul10", "Aug10", "Sep10", "Oct10", "Nov10", "Dec10",
            "Jan11", "Feb11", "Mar11", "Apr11", "May11", "Jun11", "Jul11", "Aug11", "Sep11", "Oct11", "Nov11", "Dec11",
            "Jan12", "Feb12", "Mar12", "Apr12", "May12", "Jun12", "Jul12", "Aug12", "Sep12", "Oct12", "Nov12", "Dec12",
            "Jan13", "Feb13", "Mar13", "Apr13", "May13", "Jun13", "Jul13", "Aug13", "Sep13", "Oct13", "Nov13", "Dec13"
        ];


        var series = []; //Series for graph
        var listOfSeriesNames = []; //List of series names (airline or airport)
        var data = [] //Data for graph
        var lastClaimEntered = "N/A"; //Last claim entered
        var rawData = fileReader.rawData; //rawData from fileReader service
        var listOfAirports = [] //List of airports
        var listOfAirlines = [] //List of airlines


        //Getter functions for respective variables
        var getLabels = function() {
            return labels;
        }
        var getSeries = function() {
            return series;
        };
        var getListOfSeriesNames = function() {
            return listOfSeriesNames;
        }
        var getData = function() {
            return data;
        }
        var getLastClaimEntered = function() {
            return lastClaimEntered;
        }
        var getListOfAirports = function() {
            return listOfAirports;
        }
        var getListOfAirlines = function() {
            return listOfAirlines;
        }


        //Calculate averages
        function findAverage(seriesType) {

            series = [];
            data = [];
            listOfSeriesNames = [];

            //Add average to the series
            series.push('Average');

            //Create a new array for the averages
            var avgArray = new Array(48).fill(0)

            //Loop through the whole raw data object
            Object.entries(rawData).forEach(function(year, yearIndex) {
                Object.entries(year[1]).forEach(function(month, monthIndex) {
                    Object.entries(month[1]).forEach(function(entry, entryIndex) {

                        //Get year in months
                        var yearInMonths = parseInt(year[0]) % 10 * 12;

                        //Get months
                        var months = parseInt(month[0]);

                        //Get value based on graph
                        if (seriesType == 'airline') {
                            var val = parseInt(entry[1]['value']);
                        } else if (seriesType == 'airport') {
                            var val = 1;
                        }

                        //Add it to the appropriate array slot
                        avgArray[yearInMonths + months] += val;

                        //Change '-' identifiers to Not X
                        if (entry[1]['airline'] == '-') {
                            entry[1]['airline'] = "No Airline";
                        }

                        if (entry[1]['airport'] == '-') {
                            entry[1]['airport'] = "No Airport";
                        }


                        //Populate listOfAirlines and listOfAirports
                        if (!listOfAirlines.includes(entry[1]['airline'])) {
                            listOfAirlines.push(entry[1]['airline'])
                        }

                        if (!listOfAirports.includes(entry[1]['airport'])) {
                            listOfAirports.push(entry[1]['airport'])
                        }
                    })
                })
            })

            //Calculate averages
            if (seriesType == 'airline') {
                avgArray.forEach(function(total, totalIndex) {
                    avgArray[totalIndex] = total / listOfAirlines.length;
                });
            } else if (seriesType == 'airport') {
                avgArray.forEach(function(total, totalIndex) {
                    avgArray[totalIndex] = total / listOfAirports.length;
                });
            };

            //Push it! No need to do timeWindow. This only runs by itself on start
            data.push(avgArray);

        }

        //Changes labels and data to reflect selected timeWindow
        function timeWindow(fromDate, toDate) {

            //Reset lablels
            labels = ['Jan10', "Feb10", "Mar10", "Apr10", "May10", "Jun10", "Jul10", "Aug10", "Sep10", "Oct10", "Nov10", "Dec10",
                "Jan11", "Feb11", "Mar11", "Apr11", "May11", "Jun11", "Jul11", "Aug11", "Sep11", "Oct11", "Nov11", "Dec11",
                "Jan12", "Feb12", "Mar12", "Apr12", "May12", "Jun12", "Jul12", "Aug12", "Sep12", "Oct12", "Nov12", "Dec12",
                "Jan13", "Feb13", "Mar13", "Apr13", "May13", "Jun13", "Jul13", "Aug13", "Sep13", "Oct13", "Nov13", "Dec13"
            ];

            //Convert from month to month and year
            var fromMonth = fromDate.getMonth();
            var fromYear = fromDate.getFullYear();

            //Calculate starting index
            var beginIndex = (fromYear % 10 * 12) + fromMonth;

            //Repeat with toMonth
            var toMonth = toDate.getMonth();
            var toYear = toDate.getFullYear();

            //Calculate endIndex
            var endIndex = (toYear % 10 * 12) + toMonth;

            //Slice labels and data
            labels = labels.slice(beginIndex, endIndex + 1);

            data.forEach(function(dataSeries, index) {
                data[index] = dataSeries.slice(beginIndex, endIndex + 1)
            })
        }

        //Add one or more series to the graph
        function updateSeries(selectedSeries, seriesType, fromDate, toDate) {
            //Empty series and data scope variables
            series = [];
            data = [];

            //Initialize average
            findAverage(seriesType);

            //For each series selected in the select multiple box.
            //Check for undefined
            if (selectedSeries !== undefined) {
                selectedSeries.forEach(function(mySeries, index) {

                    //Create an array that will be input into scope data
                    var inputArray = new Array(48).fill(0);

                    //Push the series name into the series
                    series.push(mySeries);

                    //Loop through the whole thing. Per YearMonth filter out all the entries
                    //with the same series(airline or airport). For each object in the new
                    //filter array sum add the object value to the appropraite array slot
                    for (var i = 2010; i < 2014; i++) {
                        for (var j = 0; j < 12; j++) {

                            var filter = rawData[i][j].filter(function(entry) {
                                return entry[seriesType] == mySeries.trim();
                            })

                            if (seriesType == 'airline') {
                                filter.forEach(function(obj, index) {
                                    inputArray[(i % 10 * 12) + j] += obj.value;
                                })
                            } else if (seriesType == 'airport') {
                                inputArray[(i % 10 * 12) + j] += filter.length;
                            }
                        }
                    }

                    //Push the input array
                    data.push(inputArray);
                })
            }

            //Run timeWindow
            timeWindow(fromDate, toDate);

            //Calculate the total value loss
            calcTotal(seriesType);
        }

        //Add a claim
        function addClaim(claimInputDate, claimAirport, claimAirline, inputCost) {

            var month = claimInputDate.getMonth();
            var year = claimInputDate.getFullYear();

            var pushObj = {
                airline: claimAirline.trim(),
                value: inputCost,
                airport: claimAirport.trim()
            }

            lastClaimEntered = claimAirline.trim() + " " + claimAirport.trim() + " " + month + "/" + year + " $" + inputCost;

            rawData[year][month].push(pushObj)

        }

        //Calculate the total number of claims or total value lost
        function calcTotal(seriesType) {
            console.log(seriesType)
            var totalValLoss = 0;

            data.forEach(function(data, index) {

                //Don't add the averages! They'll be in the first index
                if (index !== 0) {
                    totalValLoss += data.reduce((total, amount) => total + amount);
                }
            })

            return totalValLoss = totalValLoss.toFixed(0);
        }

        return {
            getLabels: getLabels,
            getSeries: getSeries,
            getListOfSeriesNames: getListOfSeriesNames,
            getData: getData,
            getLastClaimEntered: getLastClaimEntered,
            getListOfAirlines: getListOfAirlines,
            getListOfAirports: getListOfAirports,
            findAverage: findAverage,
            updateSeries: updateSeries,
            addClaim: addClaim,
            calcTotal: calcTotal
        }
    }])
