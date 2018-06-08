'use strict';

angular.module('valueLossPerMonth')
    .component('valueLossPerMonth', {
        templateUrl: 'app/valueLossPerMonth/valueLossPerMonth.html',
        controller: ('valueLossPerMonthnController', ['$scope', '$timeout', '$window', 'graph', 'fileReader', function($scope, $timeout, $window, graph, fileReader) {

            //Bug - When you change the toDate (and the toDate only) and change it
            //back to December it reads as undefined. Very confusing
            $scope.fromDate = new Date('January 1, 2010 03:24:00'); //From date on filter
            $scope.toDate = new Date('December 1, 2013 03:24:00'); //To date on filter
            $scope.seriesType = 'airline'; //Signifies series type (airline or airport)
            $scope.lastClaimEntered = "N/A"; //LastClaimEntered
            $scope.colors = ['#0e5293', '#cf455e', '#ffa500'] //Colors for graph

            //Options for graph
            $scope.options = {
                scales: {
                    yAxes: [{
                        id: 'y-axis-1',
                        type: 'linear',
                        display: true,
                        position: 'left',
                        scaleLabel: {
                            display: true,
                            labelString: "Value Loss Per Month in $"
                        }
                    }],
                    xAxes: [{
                        id: 'x-axis-1',
                        scaleLabel: {
                            display: true,
                            labelString: "2010-2013 In Months"
                        }

                    }],
                },
                title: {
                    display: true,
                    text: 'TSA Data 2010-2013 Value Loss Per Month',
                    position: 'top'
                }
            };

            //Update function runs all getters in graph.service.js
            $scope.update = function() {
                $scope.labels = graph.getLabels(); //Labels (x axis) for the graph
                $scope.series = graph.getSeries(); //Series (airline/airport) for graph
                $scope.data = graph.getData(); //Data for graph - in arrays
                $scope.totalValLoss = graph.calcTotal(); //Total value or num claims
                $scope.lastClaimEntered = graph.getLastClaimEntered(); //Last claim entered
                $scope.listOfAirlines = graph.getListOfAirlines(); //Get list of airlines
                $scope.listOfAirports = graph.getListOfAirports(); //Get list of airports
            }

            //Run update to initalize variables
            $scope.update();

            //Give app time to loadCSV, initialize graph with averages
            $timeout(function() {
                graph.findAverage($scope.seriesType);
                $scope.update();
            }, 150)

            //Update function
            $scope.updateSeries = function() {
                graph.updateSeries($scope.selectedSeries, $scope.seriesType, $scope.fromDate, $scope.toDate)
                $scope.update();
            }

            //Add Claim
            $scope.addClaim = function() {
                graph.addClaim($scope.claimInputDate, $scope.airportClaim, $scope.airlineClaim, $scope.inputCost)
                graph.updateSeries($scope.selectedSeries, $scope.seriesType, $scope.fromDate, $scope.toDate)
                $scope.update();
            }

        }])
    })
