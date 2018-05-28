angular.module('app', ['chart.js'])
	.controller('ctrl', ['$scope', function($scope, $filter) {
		var years = [2010, 2011, 2012, 2013];										//Array for building object
		var months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];		//Array for building object
/*******************************************
		Make an object with this structure
		 obj = {
		 		year: {
					month: []
				}
		 }
********************************************/
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
//Same idea, slight variance with the month as we need to get track of integers
		var yearMonthStructureTwo = function() {
			var structure = {}
			years.forEach(function(year) {
				months.forEach(function(month) {
					structure[year] = structure[year] || {};
					structure[year][month] = 0;
				})
			});
			return structure;
		}

		//SHARED VARIABLES
		$scope.FromMonth = new Date('January 1, 2010 03:24:00'); //Time window from for filtering
		$scope.ToMonth = new Date('December 1, 2013 03:24:00'); //Time window to for filtering
		//Labels for both graphs -- same timescale (Value Loss Per Month)
		$scope.graphlabels = ['Jan10', "Feb10", "Mar10", "Apr10", "May10", "Jun10", "Jul10", "Aug10", "Sep10", "Oct10", "Nov10", "Dec10",
		"Jan11", "Feb11", "Mar11", "Apr11", "May11", "Jun11", "Jul11", "Aug11", "Sep11", "Oct11", "Nov11", "Dec11",
		"Jan12", "Feb12", "Mar12", "Apr12", "May12", "Jun12", "Jul12", "Aug12", "Sep12", "Oct12", "Nov12", "Dec12",
		"Jan13", "Feb13", "Mar13", "Apr13", "May13", "Jun13", "Jul13", "Aug13", "Sep13", "Oct13", "Nov13", "Dec13"]

		//Set the labels that will display. Initialze as the whole list
		$scope.graphDisplayLabels = $scope.graphlabels;

		//GRAPH 1 Variables
		$scope.rawDataGraph1 = {};								//Scope variable to store raw data gathered from csv for graph1
		$scope.graph1series = []									//Variable to store series names for first graph (Delta, American Airlines etc.)
		$scope.graph1DisplaySeries = []  					//To store the series that will be presented in the graph
		$scope.graph1data =  []										//Variable to store first graph's data. Should be an array of arrays of length 48 (48 months from 2010-2013)
		$scope.graph1DisplayData = [] 						//To store the data that will be displayed
		$scope.myIndex = [];											//Variable to filter through Airlines
		$scope.airlineInputDate = new Date('January 1, 2010 03:24:00'); //Time selection from for form input
		$scope.inputCost = 0; 										//Input for the value loss in the form
		$scope.inputAirline; 											//To store the airline that the value loss claim will be input into

		//GRAPH 2 Variables
		$scope.rawDataGraph2 = {}; 								//Scope variable to store raw data gathered from csv for graph2
		$scope.graph2series = [] 									//Variable to store series name for second graph (SEA, BOS etc.)
		$scope.graph2DisplaySeries = []; 					//Variable to store the series that will be presented in the graph
		$scope.graph2data = []										//To store the total graph2data
		$scope.graph2DisplayData = []; 						//Display data graph 2
		$scope.inputAirport; 											//Airport selection for inputing a new claim
		$scope.myIndex2 = [] 											//Varialbe to filter through AirportCodes

		//Sets options for first graph. See ChartJS documentation.
		$scope.graph1options = {
		    scales: {
		      yAxes: [
		        {
		          id: 'y-axis-1',
		          type: 'linear',
		          display: true,
		          position: 'left',
							scaleLabel: {
								display: true,
								labelString: "Value Loss Per Month in $"
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
						text: 'TSA Data 2010-2013 Value Loss Per Month',
						position: 'top'
				}
		}

/*
*
*
*													FUNCTIONS FOR GRAPH 1 (VALUE LOSS PER MONTH)
*
*
*/
		//Function to input csv data file
		function csvData(file) {
		  d3.csv(file, function(data, index) {
				captureRawDataGraph1(data, index);
		  }).then(function(data) {

				/************* GRAPH 1 DATA MANIPULATION ************************************/
				var numAirlines = 0;														//Keep track of numAirlines to calculate averages
				var averageArray = new Array(48).fill(0);				//Make an array of length 48 of 0's to hold averages

				//Go through each airline object as an array
				Object.entries($scope.rawDataGraph1).forEach(function(airline, airlineIndex) {
						//Make the series name the airline name
						$scope.graph1series.push(airline[0]);
						//Index for the average array
						var avgIndex = 0;
						//Array for graph1 data
						var dataArray = new Array();
						//Loop through the year keys as arrays
						Object.entries(airline[1]).forEach(function(year, yearIndex) {
							//Loop through the month keys as arrays
								Object.entries(year[1]).forEach(function(month, monthIndex) {
									//If the array is undefined or its length is not zero
										if (month[1] != undefined && month[1].length != 0) {
											 //Sum the month array, push it into the temporary array
											 dataArray.push(month[1].reduce((total, amount) => total + amount));
											 //Add the sum of the month array to the average correct average array slot
											 averageArray[avgIndex] += month[1].reduce((total, amount) => total + amount);
											 //Increment avg array index
											 avgIndex++;
										 }
										//Otherwise push in a zero
										else {
											dataArray.push(0);
										}
									}); //Brackets for month loop
								}); //Brackets for year loop

						//Push data array into the graph1data scope variable
						$scope.graph1data.push(dataArray)

						//Increment numAirlines
						numAirlines++;

					}); //Brackets for airline loop

					//Add the average series name at the *END*
					$scope.graph1series.push("Average All Airlines");

					//Calculate averages using numAirlines
					averageArray.forEach(function(month, index) {
						 	averageArray[index] = month / ($scope.graph1series.length - 1);
					})

					//Push the average into graph1data
					$scope.graph1data.push(averageArray);


				/*************************** GRAPH 2 DATA MANIPULATION ***********************/

				averageArray = new Array(48).fill(0);
				var numOfAirports = 0;

				Object.entries($scope.rawDataGraph2).forEach(function(airport, airportIndex) {

					avgIndex = 0;
					numOfAirports++;

					var dataArray = new Array();

					$scope.graph2series.push(airport[0])

					Object.entries(airport[1]).forEach(function(year, yearIndex) {
						Object.entries(year[1]).forEach(function(month, monthIndex) {
								averageArray[avgIndex] += month[1];
								dataArray.push(month[1]);
								avgIndex++;
						}); //Brackets for month loop
					});//Brackets for year loop

					$scope.graph2data.push(dataArray);

				}); //Brackets for airport loop

				averageArray.forEach(function(month, index) {
					averageArray[index] = month / ($scope.graph2series.length - 1)
				});

				$scope.graph2series.push("Average");
				$scope.graph2data.push(averageArray);

				$scope.graph1DisplayData.push($scope.graph1data[$scope.graph1data.length - 1]);
				$scope.graph1DisplaySeries.push($scope.graph1series[$scope.graph1series.length - 1])

				$scope.graph2DisplayData.push($scope.graph2data[$scope.graph2data.length - 1]);
				$scope.graph2DisplaySeries.push($scope.graph2series[$scope.graph2series.length - 1])

				debugger
				$scope.$apply();

			}); //Brackets for .then function
		}; //Brackets for csv function

		//Convert my number string to an integer
		function convertDollarToInteger(dollar) {
			return Number(dollar.replace(/[^0-9\.-]+/g,""));
		}

		//Capture raw data from csv
		function captureRawDataGraph1(data, index) {
					var d = new Date(data.IncidentDate)		//Convert CSV date into a real date
					var month = d.getMonth();							//Get month
					var year = d.getFullYear();						//Get year

					//If the close amount is a '-', return
					if (data.CloseAmount === '-') return;

					//Convert value to dollar
					value = convertDollarToInteger(data.CloseAmount);

					//If there's no value return
					if (!value) return;

					//Trim spaces off the airline name
					var airlineName = data.AirlineName.trim();

					//Airpot code variable
					var airportCode = data.AirportCode

					//Raw data variable [airlineName] is either itself or is the result of the yearMonthStructure function
					$scope.rawDataGraph1[airlineName] = $scope.rawDataGraph1[airlineName] || Object.assign({}, yearMonthStructure());

					//Push the value into month array
					$scope.rawDataGraph1[airlineName][year][month].push(value);

					//Raw data variable airport code is either itself or the result of the yearMonthStructure function
					$scope.rawDataGraph2[airportCode] = $scope.rawDataGraph2[airportCode] || Object.assign({}, yearMonthStructureTwo());

					//Increment num of claims by 1
					$scope.rawDataGraph2[airportCode][year][month] += 1;

					//Return!
					return;
			}

		//Run csvData funciton
		csvData("data/claims.csv");

		//Generic function for adding data from the form
		function add(data, series, date, inputIndicator, inputAmount) {
			//Turn date string into a usable date
			date = new Date(date)

			//Get month & year
			var month = date.getMonth();
			var year = date.getFullYear();

			//Get index
			var index = series.indexOf(inputIndicator)

			//Add to data
			data[index][(year % 10 * 12) + month] += inputAmount

		}


		//Graph 1 add function
		$scope.addG1 = function () {
			add($scope.graph1data, $scope.graph1series, $scope.airlineInputDate, $scope.inputAirline, $scope.inputCost);
			$scope.refreshG1();
		};

		//Graph 2 add function
		$scope.addG2 = function() {
			add($scope.graph2data, $scope.graph2series, $scope.airportInputDate, $scope.inputAirport, 1);
			$scope.refreshG2();
		}

		// $scope.refreshG1 = function() {
		// 	refresh($scope.graph1data, $scope.graph1series, $scope.graph1DisplaySeries, $scope.graph1DisplayData, $scope.myIndex);
		// 	console.log($scope.graph1DisplaySeries);
		// 	console.log($scope.graph1DisplayData);
		// };

		// function refresh(data, series, displaySeries, displayData, index) {
		//
		// 		//Reset the display series and data
		// 		displaySeries = [];
		// 		displayData = []
		//
		// 		//Get the from date from a string to a date
		// 		$scope.FromMonth = new Date($scope.FromMonth);
		//
		// 		//Get the beggining of the time window
		// 		var monthBegin = $scope.FromMonth.getMonth();
		// 		var yearBegin = $scope.FromMonth.getFullYear();
		//
		// 		//Get the to date from a string to a date
		// 		$scope.ToMonth = new Date($scope.ToMonth)
		//
		// 		//Get the end of the time window
		// 		var monthEnd = $scope.ToMonth.getMonth();
		// 		var yearEnd = $scope.ToMonth.getFullYear();
		//
		// 		//Convert years to months
		// 		yearBegin = yearBegin % 10 * 12;
		// 		yearEnd = yearEnd % 10 * 12;
		//
		// 		//Create indexes
		// 		var beginIndex = monthBegin + yearBegin;
		// 		var endIndex = monthEnd + yearEnd + 1;
		//
		// 		//Turn display labels into appropriate window
		// 		$scope.graphDisplayLabels = $scope.graphlabels.slice(beginIndex,endIndex)
		//
		// 		//Make sure average is always in chart
		// 		var tempArray = data[data.length -1].slice(beginIndex,endIndex);
		// 		displayData.push(tempArray);
		//
		// 		//Get the appropriate slices of info according to the time window
		// 		for (i = 0; i < index.length; i++)
		// 		{
		// 				tempArray = data[parseInt(index[i])].slice(beginIndex, endIndex)
		// 				displaySeries.push(series[parseInt(index[i])]);
		// 				displayData.push(tempArray);
		// 		}
		//
		// 		$scope.$apply();

		// };
		$scope.refreshG2 = function() {
		
			$scope.graph2DisplaySeries = [];
			$scope.graph2DisplayData = [];

			$scope.FromMonth = new Date($scope.FromMonth)

			var monthBegin = $scope.FromMonth.getMonth();
			var yearBegin = $scope.FromMonth.getFullYear();

			$scope.ToMonth = new Date($scope.ToMonth)

			var monthEnd = $scope.ToMonth.getMonth();
			var yearEnd = $scope.ToMonth.getFullYear();

			yearBegin = yearBegin % 10 * 12;
			yearEnd = yearEnd % 10 * 12;

			var beginIndex = monthBegin + yearBegin;
			var endIndex = monthEnd + yearEnd + 1;

			$scope.graphDisplayLabels = $scope.graphlabels.slice(beginIndex,endIndex)

			var tempArray = $scope.graph2data[$scope.graph2data.length -1].slice(beginIndex,endIndex);
			$scope.graph2DisplayData.push(tempArray);

			for (i = 0; i < $scope.myIndex2.length; i++)
			{
					tempArray = $scope.graph2data[parseInt($scope.myIndex2[i])].slice(beginIndex, endIndex)
					$scope.graph2DisplaySeries.push($scope.graph2series[parseInt($scope.myIndex2[i])]);
					$scope.graph2DisplayData.push(tempArray);
			}

		};
		// //Filter function
		$scope.refreshG1 = function (){

				$scope.graph1DisplaySeries = [];
				$scope.graph1DisplayData = [];

				$scope.FromMonth = new Date($scope.FromMonth)

				var monthBegin = $scope.FromMonth.getMonth();
				var yearBegin = $scope.FromMonth.getFullYear();

				$scope.ToMonth = new Date($scope.ToMonth)

				var monthEnd = $scope.ToMonth.getMonth();
				var yearEnd = $scope.ToMonth.getFullYear();

				yearBegin = yearBegin % 10 * 12;
				yearEnd = yearEnd % 10 * 12;

				var beginIndex = monthBegin + yearBegin;
				var endIndex = monthEnd + yearEnd + 1;

				$scope.graphDisplayLabels = $scope.graphlabels.slice(beginIndex,endIndex)

				//Make sure average vl/m is included in every chart

				var tempArray = $scope.graph1data[$scope.graph1data.length -1].slice(beginIndex,endIndex);
				$scope.graph1DisplayData.push(tempArray);

				$scope.graph1DisplaySeries.push($scope.graph1series[$scope.graph1series.length - 1])

				//Iterate over number of entries in my index. Give correct data to display
				for (i = 0; i < $scope.myIndex.length; i++)
				{
						tempArray = $scope.graph1data[parseInt($scope.myIndex[i])].slice(beginIndex, endIndex)
						$scope.graph1DisplaySeries.push($scope.graph1series[parseInt($scope.myIndex[i])]);
						$scope.graph1DisplayData.push(tempArray);
				}
		};
	}])
