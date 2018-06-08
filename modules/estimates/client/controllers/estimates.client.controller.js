/**
 * Created by Rajesh on 7/3/2017.
 */
'use strict';

//Estimates controller to manage estimates associated with a specific project
angular.module('estimates').controller('EstimatesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Estimates', 'EstimatesSvc', 'ConfigSvc',
    function ($scope, $stateParams, $location, Authentication, Estimates, EstimatesSvc, ConfigSvc) {

        $scope.authentication = Authentication;

        $scope.init = function (mode) {
            $scope.projectId = $stateParams.projectId;
            $scope.pmtId = $stateParams.pmtId;
            $scope.estType = $stateParams.estType;
            $scope.application = $stateParams.application;
            var config = {};
            config = JSON.parse(angular.toJson(ConfigSvc.getProjectConfiguration()));
            $scope.complexity = config.complexity;
            $scope.impactedWorkstreams = config.workstream;
            if (mode === 'CREATE') {
                $scope.selWorkstream = [];
            }
            if (mode === 'MODIFY') {
                //set the default values for drop down
                $scope.selComplexity = $scope.complexity.find(function (comp) {
                   if($scope.estimate.estimates.complexity) return comp.key === $scope.estimate.estimates.complexity.key;
                });
                $scope.selWorkstream = $scope.impactedWorkstreams.filter(function (ws) {
                    for (var i = 0; i < $scope.estimate.estimates.impactedWorkstreams.length; i++) {
                        if (ws.key === $scope.estimate.estimates.impactedWorkstreams[i].key) return true;
                    }
                });
            }
        };
        // Create new Estimate for a project
        $scope.create = function () {
            var complexity ={};
            if(this.selComplexity){
                complexity.key = this.selComplexity.key;
                complexity.value=this.selComplexity.value;
            }
            // Create new Estimate object
            var workstreams = [];
            for (var i = 0; i < $scope.selWorkstream.length; i++) {
                workstreams[i] = {key: $scope.selWorkstream[i].key, value: $scope.selWorkstream[i].value};
            }
            var estimate = new Estimates({
                projectId: $stateParams.projectId,
                pmtId:$stateParams.pmtId,
                estimates:{
                    estType:{
                        key:$scope.estType,
                        value:$scope.estType
                    },
                    hours: this.hours,
                    cost: this.cost,
                    assumptions: this.assumptions,
                    dependencies: this.dependencies,
                    additionalNotes: this.additionalNotes,
                    complexity: {
                        key: complexity.key,
                        value: complexity.value
                    },
                    impactedWorkstreams: workstreams,
                    sanityCheckOnEstimate: this.sanityCheckOnEstimate,
                    estimateValid: this.estimateValid,
                    reasonForEstimateFailure: this.reasonForEstimateFailure
                }

            });

            // Redirect after save
            estimate.$save(function (response) {
                $location.path('projects/' + $stateParams.projectId);
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Find existing Estimate
        $scope.findOne = function (mode) {
            $scope.showSpinner = true;
            $scope.estimate = Estimates.get({
                estimateId: $stateParams.estimateId
            }, function () {
                $scope.showSpinner = false;
                if (mode === 'EDIT')
                    $scope.init('MODIFY');
            });
        };

        // Update existing Estimate associated with project
        $scope.update = function () {
            $scope.showSpinner = true;
            //Explicitly setting the modified drop down values...
            $scope.estimate.pmtId=$stateParams.pmtId;
            $scope.estimate.estimates.complexity = $scope.selComplexity;
            $scope.estimate.estimates.impactedWorkstreams = $scope.selWorkstream;
            $scope.estimate.estimates.estType={key:$stateParams.estType,value:$stateParams.estType};
            //$scope.estimate.estimates.estType.value=$stateParams.estType;
            var estimate = $scope.estimate;
            estimate.$update(function () {
                $scope.showSpinner = false;
                $location.path('projects/' + estimate.projectId);
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.trackEfforts = function(){//Retrieve project monthly efforts
            $scope.projectId = $stateParams.projectId;
            $scope.pmtId = $stateParams.pmtId;
            EstimatesSvc.getProjectMonthlyEfforts({pmtId:$stateParams.pmtId ,projectId:$stateParams.projectId ,complexity:$stateParams.complexity,detsDDE:$stateParams.detsDDE,tfaDDE:$stateParams.tfaDDE})
                .then(function(response){
                    $scope.showSpinner = false;
                    $scope.trackEfforts= response.data.trackEfforts;
                    $scope.effortsSummary = response.data.effortsSummary;
                    if($scope.trackEfforts.length > 0){//Sort the efforts array based on year and respective months
                        $scope.trackEfforts = Sugar.Array.sortBy($scope.trackEfforts,['year','month.key']);
                    }
                    $scope.getTeamEffortsComparison();
                    if($scope.effortMonths.length > 0){//Invoke the charts only efforts available in the source
                        $scope.selDETSForMonth = $scope.effortMonths[$scope.effortMonths.length-1];//Set the initial value to load DETS utilization
                        $scope.selTFAForMonth = $scope.effortMonths[$scope.effortMonths.length-1];//Set the initial value to load TFA utilization
                        $scope.getResourceUtilization('DETS');
                        $scope.getResourceUtilization('TFA');
                        $scope.getBurnDownReport();
                    }
                },function(err){
                    console.log('Not able to retrieve my projects--' + err);
                });
        };

        $scope.getTeamEffortsComparison = function () {
            $scope.barOptions = {
                legend: {
                    display: true
                },
                gridLines: {
                    display: true
                },
                tooltips: {
                    enabled: true
                }
            };
            $scope.series = ['DETS', 'TFA'];
            $scope.labels = $scope.getLabels();
            $scope.data= $scope.getTeamEfforts();
        };

        $scope.getLabels= function(){//For Team efforts comparison chart
            var labels =[];
            $scope.effortMonths =[];
            angular.forEach($scope.trackEfforts,function(obj){
                var label= obj.month.value+'-'+ obj.year;
                labels.push(label);
                $scope.effortMonths.push({key:label, value: label});
            })
            return labels;
        };

        $scope.getTeamEfforts = function(){
            var teamEfforts=[];
            var detsTeamEfforts=[];
            var tfaTeamEfforts=[];
            angular.forEach($scope.trackEfforts,function(obj){
                var detsEffort=0;
                angular.forEach(obj.resources.dets, function(res){
                    detsEffort+=parseFloat(res.actualEfforts);
                });
                detsTeamEfforts.push(detsEffort);
                var tfaEffort=0;
                angular.forEach(obj.resources.tfa, function(res){
                    tfaEffort+=parseFloat(res.actualEfforts);
                });
                tfaTeamEfforts.push(tfaEffort);
            })
            teamEfforts.push(detsTeamEfforts,tfaTeamEfforts);
            return teamEfforts;
        };

        $scope.getResourceUtilization = function (team) {
            if(team==='DETS'){
                var matchStr =  $scope.selDETSForMonth.value.split('-');
                var selectedMonth={};
                selectedMonth = $scope.trackEfforts.find(function(mon){
                    return(mon.month.value === matchStr[0] && mon.year === matchStr[1]);
                });
                $scope.labelsDETS=[];
                $scope.dataDETS =[];
                angular.forEach(selectedMonth.resources.dets,function(obj){
                    $scope.labelsDETS.push(obj.person);
                    $scope.dataDETS.push(obj.actualEfforts);
                });
            }else if(team==='TFA'){
                var matchStr =  $scope.selTFAForMonth.value.split('-');
                var selectedTFAMonth = $scope.trackEfforts.find(function(mon){
                    return(mon.month.value === matchStr[0]  && mon.year === matchStr[1]);
                });
                $scope.labelsTFA=[];
                $scope.dataTFA =[];
                angular.forEach(selectedTFAMonth.resources.tfa,function(obj){
                    $scope.labelsTFA.push(obj.person);
                    $scope.dataTFA.push(obj.actualEfforts);
                });
            }
        };

        $scope.getBurnDownReport = function () {
            $scope.options = {
                legend: {
                    display: false
                },
                gridLines: {
                    display: true
                },
                tooltips: {
                    enabled: true
                },
                elements:{
                    line:{
                        tension: 0,// disables bezier curves
                        fill: false
                    }
                },
                title:{
                    display: true,
                    fontColor: 'red',
                    text:['DETS Hours Burn: 300 Hours','Remaining Hours: 100 Hours.']
                }
            };
            //TO-DO: Logic to write to get data from Estimate object retrieved
            $scope.seriesBD = ['DETS Hours'];
            $scope.labelsBD = ['MAY-2018','JUN-2018','JUL-2018','AUG-2018','SEP-2018'];
            $scope.dataBD= [
                [400,350,310,240,100],//DETS
            ];
        };
    }
]);
