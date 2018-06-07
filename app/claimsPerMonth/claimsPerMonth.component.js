'use strict';

angular.module('claimsPerMonth')
  .component('claimsPerMonth', {
    templateUrl: 'app/claimsPerMonth/claimsPerMonth.html',
    controller: ('claimsPerMonth', ['$scope', '$window', '$timeout', 'graph', function($scope, $window, $timeout, graph) {

      //Bug - When you change the toDate (an the toDate only) and change it
      //back to December it reads as undefined. Very confusing
      $scope.fromDate = new Date('January 1, 2010 03:24:00');       //From date on filter
      $scope.toDate = new Date('December 1, 2013 03:24:00');        //To date on filter
      $scope.seriesType = 'airport';                                //Signifies series type (airline or airport)
      $scope.lastClaimEntered = "N/A";                              //LastClaimEntered


      //Options
      $scope.options = {
		    scales: {
		      yAxes: [
		        {
		          id: 'y-axis-1',
		          type: 'linear',
		          display: true,
		          position: 'left',
							scaleLabel: {
								display: true,
								labelString: "# of Claims Per Month"
							}
		        }],
					xAxes: [
						{
							id: 'x-axis-1',
							scaleLabel: {
								display: true,
								labelString: "2010-2013 In Months"
							}

					}],
		  	},
				title: {
						display: true,
						text: 'TSA Data 2010-2013 Claims Per Month',
						position: 'top'
				}
		};

    //Update function runs all getters in graph.service.js
    $scope.update = function() {
      $scope.listOfSeriesNames = graph.getListOfSeriesNames();    //List of series names (airline or airport). Used to calculate avgs & total num
      $scope.labels = graph.getLabels();                          //Labels (x axis) for the graph
      $scope.series = graph.getSeries();                          //Series (airline/airport) for graph
      $scope.data = graph.getData();                              //Data for graph - in arrays
      $scope.totalValLoss = graph.calcTotal();                    //Total value or num claims
      $scope.lastClaimEntered = graph.getLastClaimEntered();      //Last claim entered
    }

    $scope.update();

    //Give app time to loadCSV, initialize graph with averages
    $timeout( function() {
      graph.findAverage($scope.seriesType)
      $scope.update();
    }, 200)

    //Update function
    $scope.updateSeries = function() {
        console.log($scope.toDate)
        graph.updateSeries($scope.selectedSeries, $scope.seriesType, $scope.fromDate, $scope.toDate)
        $scope.update();
    }

    //Add Claim
    $scope.addClaim = function() {
      graph.addClaim($scope.claimInputDate, $scope.inputClaim, $scope.inputCost, $scope.seriesType)
      graph.updateSeries($scope.selectedSeries, $scope.seriesType, $scope.fromDate, $scope.toDate)
      $scope.update();
    }


  }])
  });
