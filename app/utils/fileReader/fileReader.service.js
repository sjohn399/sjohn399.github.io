'use strict';

angular.module('fileReader')
    .factory('fileReader', ['$window', '$http', function($window, $http) {

        //Conversion functions ($ => int)
        function convertDollarToInteger(dollar) {
            return Number(dollar.replace(/[^0-9\.-]+/g, ""));
        }

        var years = [2010, 2011, 2012, 2013]; //Array for building object
        var months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]; //Array for building object

        //Build an object to store raw data in
        var yearMonthStructure = function() {
            var structure = {}
            years.forEach(function(year) {
                months.forEach(function(month) {
                    structure[year] = structure[year] || {};
                    structure[year][month] = [];
                })
            });
            return structure;
        }

        //Initialize raw data as object
        var rawData = yearMonthStructure();

        //Parse CSV file
        $http.get("data/claims.csv").success(function(response) {

            $window.Papa.parse(response, {
                header: true,
                fastmode: true,
                //Streaming function
                step: function(results, parser) {
                    var data = results.data[0]; //Data object
                    var d = new Date(data['IncidentDate']) //Get the date
                    var month = d.getMonth(); //Get the date's month
                    var year = d.getFullYear(); //Get the date's full year
                    var value = 0; //Initialize value to zero

                    //Create a conditional in case their are empty lines
                    if (data['CloseAmount'] !== undefined) {
                        //If there's not a hypen, convert to integer
                        if (data['CloseAmount'] !== '-') {
                            value = convertDollarToInteger(data['CloseAmount']);
                        }

                        //Create a push object with all neccessary info
                        var pushObj = {
                            airline: data['AirlineName'].trim(),
                            value: value,
                            airport: data['AirportCode']
                        }

                        //Push object into rawData
                        rawData[year][month].push(pushObj);
                    }
                }
            })
        })

        return {
            rawData: rawData
        }
    }])
