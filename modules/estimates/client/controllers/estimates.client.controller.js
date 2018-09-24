/**
 * Created by Rajesh on 7/3/2017.
 */
'use strict';

//Estimates controller to manage estimates associated with a specific project
angular.module('estimates').controller('EstimatesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Estimates', 'EstimatesSvc', 'ConfigSvc','$modal','$window',
    function ($scope, $stateParams, $location, Authentication, Estimates, EstimatesSvc, ConfigSvc, $modal, $window) {

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
                $scope.selOriginalComplexity = $scope.complexity.find(function (comp) {
                    if($scope.estimate.estimates.originalComplexity) return comp.key === $scope.estimate.estimates.originalComplexity.key;
                });
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
            var originalComplexity ={};
            if(this.selOriginalComplexity){
                originalComplexity.key = this.selOriginalComplexity.key;
                originalComplexity.value=this.selOriginalComplexity.value;
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
                    originalComplexity: {
                        key: originalComplexity.key,
                        value: originalComplexity.value
                    },
                    complexity: {
                        key: complexity.key,
                        value: complexity.value
                    },
                    impactedWorkstreams: workstreams,
                    sanityCheckOnEstimate: this.sanityCheckOnEstimate,
                    estimateValid: this.estimateValid,
                    reasonForEstimateFailure: this.reasonForEstimateFailure,
                    teamHours:{
                        dets: this.detsHours,
                        tfa: this.tfaHours,
                        dm: this.dmHours
                    }
                }

            });

            // Redirect after save
            estimate.$save(function (response) {
                $location.path('projects/' + $stateParams.projectId);
                var roles= $scope.authentication.user.roles;
                if(roles.indexOf('editor')!==-1 && $scope.estType==='MDE' && estimate.estimates.estimateValid === 'NO' && estimate.estimates.originalComplexity.key!==estimate.estimates.complexity.key) $scope.sendMail(response._id, 'MDE_ESTIMATE');
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.sendMail=function(id, mode){
            ConfigSvc.getEstimateMailTemplate({id:id , key: mode})
                .then(function(response){
                    var template=JSON.parse(angular.toJson(response.data));
                    var mailToString='mailto:'+ template.to+'?cc='+template.cc +'&subject='+template.subject+'&body='+template.body;
                    $window.open(mailToString);
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
            $scope.estimate.estimates.originalComplexity = $scope.selOriginalComplexity;
            $scope.estimate.estimates.complexity = $scope.selComplexity;
            $scope.estimate.estimates.impactedWorkstreams = $scope.selWorkstream;
            $scope.estimate.estimates.estType={key:$stateParams.estType,value:$stateParams.estType};
            //$scope.estimate.estimates.estType.value=$stateParams.estType;
            var estimate = $scope.estimate;
            estimate.$update(function () {
                $scope.showSpinner = false;
                $location.path('projects/' + estimate.projectId);
                var roles= $scope.authentication.user.roles;
                if(roles.indexOf('editor')!==-1 && $scope.estType==='MDE' && estimate.estimates.estimateValid === 'NO' && estimate.estimates.originalComplexity.key!==estimate.estimates.complexity.key) $scope.sendMail(estimate._id, 'MDE_ESTIMATE');
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.trackEfforts = function(mode){//Retrieve project monthly efforts
            $scope.showSpinner = true;
            $scope.projectId = $stateParams.projectId;
            var complexity=$stateParams.complexity;
            var detsDDE = $stateParams.detsDDE;
            var tfaDDE=$stateParams.tfaDDE;
            if(mode==='PROJECT_EFFORTS'){//This is to display the efforts in modal popup-window
                complexity =($scope.ddeEstimate)?$scope.ddeEstimate.projectId.complexity.value:null;
                detsDDE=($scope.ddeEstimate && $scope.ddeEstimate.estimates.teamHours)?$scope.ddeEstimate.estimates.teamHours.dets:null;
                tfaDDE=($scope.ddeEstimate && $scope.ddeEstimate.estimates.teamHours)?$scope.ddeEstimate.estimates.teamHours.tfa:null;
                $scope.projectId = ($scope.ddeEstimate)?$scope.ddeEstimate.projectId._id:null;
            }else{
                $scope.pmtId = $stateParams.pmtId;
            }
            EstimatesSvc.getProjectMonthlyEfforts({pmtId:$scope.pmtId ,projectId:$scope.projectId ,complexity:complexity,detsDDE:detsDDE,tfaDDE:tfaDDE})
                .then(function(response){
                    $scope.showSpinner = false;
                    $scope.efforts = response.data;
                    if($scope.efforts.effortExists){//Invoke the charts only efforts available in the source
                        $scope.selDETSForMonth = $scope.efforts.effortMonths[$scope.efforts.effortMonths.length-1];//Set the initial value to load DETS utilization
                        $scope.selTFAForMonth = $scope.efforts.effortMonths[$scope.efforts.effortMonths.length-1];//Set the initial value to load TFA utilization
                        $scope.getTeamEffortsComparison();
                        $scope.getResourceUtilization('DETS');
                        $scope.getResourceUtilization('TFA');
                        $scope.getBurnDownReport();
                        if(mode==='PROJECT_EFFORTS') $scope.displayProjectEfforts();
                    }
                },function(err){
                    $scope.showSpinner = false;
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
        };

        $scope.getResourceUtilization = function (team) {
            var matchStr =[];
            if(team==='DETS'){
                matchStr =  $scope.selDETSForMonth.value.split('-');
                var selectedMonth={};
                selectedMonth = $scope.efforts.trackEfforts.find(function(mon){
                    return(mon.month.value === matchStr[0] && mon.year === matchStr[1]);
                });
                $scope.labelsDETS=[];
                $scope.dataDETS =[];
                angular.forEach(selectedMonth.resources.dets,function(obj){
                    $scope.labelsDETS.push(obj.person);
                    $scope.dataDETS.push(obj.actualEfforts);
                });
            }else if(team==='TFA'){
                matchStr =  $scope.selTFAForMonth.value.split('-');
                var selectedTFAMonth = $scope.efforts.trackEfforts.find(function(mon){
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
            var teamEfforts = $scope.efforts.chartData;
            var detsEffortsEachMonth = teamEfforts[0];
            var tfaEffortsEachMonth= teamEfforts[1];
            var originalDETSDDE=$scope.efforts.effortsSummary.originalDETSHours;
            var originalTFADDE = $scope.efforts.effortsSummary.originalTFAHours;
            var burnDownDETS=[];
            var burnDownTFA =[];
            angular.forEach(detsEffortsEachMonth,function(val){
                originalDETSDDE=parseFloat(originalDETSDDE)-parseFloat(val);
                burnDownDETS.push(originalDETSDDE);
            });
            angular.forEach(tfaEffortsEachMonth,function(val){
                originalTFADDE=parseFloat(originalTFADDE)-parseFloat(val);
                burnDownTFA.push(originalTFADDE);
            });
            $scope.seriesBD = $scope.efforts.chartSeries;
            $scope.labelsBD = $scope.efforts.chartLabels;
            $scope.dataBD= [];
            $scope.dataBD.push(burnDownDETS,burnDownTFA);
            $scope.options = {
                legend: {
                    display: true
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
                    fontColor: 'GREEN',
                    text:['DETS Hours Burn:'+$scope.efforts.effortsSummary.totalDETSHoursBurn,' Remaining Hours: ' + $scope.efforts.effortsSummary.remainingDETSHours + ' ',
                        'TFA Hours Burn:'+$scope.efforts.effortsSummary.totalTFAHoursBurn,' Remaining Hours: ' + $scope.efforts.effortsSummary.remainingTFAHours
                    ]
                }
            };
        };

        $scope.trackResourceEfforts = function(){//Retrieve project monthly efforts
            $scope.showSpinner = true;
            EstimatesSvc.getResourceMonthlyEfforts({userId:$scope.authentication.user.userId})
                .then(function(response){
                    $scope.showSpinner = false;
                    $scope.resourceEfforts = response.data;
                    if($scope.resourceEfforts.effortExists){//Invoke the charts only efforts available in the source
                        $scope.getTeamEffortsComparison();//Set the chart bar options
                        $scope.selProjectMonth = $scope.resourceEfforts.effortMonths[$scope.resourceEfforts.effortMonths.length-1];//Set the initial month to load project efforts utilization
                        $scope.getProjectUtilization();
                    }
                },function(err){
                    $scope.showSpinner = false;
                    console.log('Not able to retrieve my Project Efforts--' + err);
                });
        };

        $scope.getProjectUtilization = function (team) {
            var matchStr =[];
            matchStr =  $scope.selProjectMonth.value.split('-');
            var selectedMonth={};
            selectedMonth = $scope.resourceEfforts.trackEfforts.find(function(mon){
                return(mon.month.value === matchStr[0] && mon.year === matchStr[1]);
            });
            $scope.projectLabels=[];
            $scope.projectData =[];
            $scope.projectChartOptions={
                legend: {
                    display: true
                },
                tooltips: {
                    enabled: true
                }
            };
            angular.forEach(selectedMonth.projects,function(obj){
                $scope.projectLabels.push(obj.pmtId + '-' + obj.title);
                $scope.projectData.push(obj.hours);
            });

        };

        $scope.getChartInfo = function(points,evt){
            var selectedVal=points[0]._model.label;
            var pmtId=selectedVal.split('-');
            $scope.pmtId=pmtId[0];
            $scope.showSpinner = true;
            EstimatesSvc.getDDEEstimate({pmtId:pmtId[0]})
                .then(function(response){
                    $scope.showSpinner = false;
                    $scope.ddeEstimate = response.data;
                    $scope.trackEfforts('PROJECT_EFFORTS');
                },function(err){
                    $scope.showSpinner = false;
                    console.log('Not able to retrieve my Project Efforts--' + err);
                });
        };

        $scope.displayProjectEfforts = function(){//To open up the modal window to view the project specific efforts
            var modalInstance = $modal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'modules/estimates/views/modal/project-efforts.client.view.html',
                size: 'lg',
                scope:$scope
            });
            modalInstance.result.then(function () {
               // console.log('Content viewed');
            },function(){
                //console.log('Project specific efforts viewed');
            });
        };

    }
]);
