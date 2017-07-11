/**
 * Created by Rajesh on 6/27/2017.
 */
'use strict';

//Dashboard controller to handle and render dashboard
angular.module('dashboard').controller('DashboardController', ['$scope', '$stateParams', '$location', 'Authentication', 'DashboardSvc',
    function ($scope, $stateParams, $location, Authentication,DashboardSvc) {

        $scope.authentication = Authentication;

        $scope.renderDashboard=function(){
            $scope.filter={
                pmtId:'',
                status:'',
                complexity:'',
                release:'',
                impactedApplication:'',
                solutionStatus:''
            };
            $scope.displayProjStatSummary();
            $scope.displaySolStatSummary('GREEN');
            $scope.displaySolStatSummary('RED');
            $scope.displaySolStatSummary('AMBER');
            $scope.getProjectComplexityReport();
            $scope.getProjectLoadReport();
            $scope.getMyProjects();
        };

       /* $scope.filterProjects=function(){
            $scope.filter.status='ACTIVE';
            $stateParams.filterCriteria=$scope.filter;
            $state.go('projects.list', {status:'ACTIVE', from:$state.current.name} );
        };*/

        $scope.getProjectComplexityReport = function () {
            $scope.options = {
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
            $scope.showPCR = true;
            $scope.showSSR = false;
            $scope.showPLR = false;
            DashboardSvc.getReleaseComplexityReport()
                .then(function (response) {
                    var resp = JSON.parse(angular.toJson(response.data));
                    var labels = [];
                    $scope.series = ['EASY', 'MODERATE', 'DIFFICULT', 'COMPLEX'];
                    $scope.data = [];
                    var easy = new Array(resp.length),
                        moderate = new Array(resp.length),
                        difficult = new Array(resp.length),
                        complex = new Array(resp.length);
                    for (var i = 0; i < resp.length; i++) {
                        var obj = JSON.parse(angular.toJson(resp[i]));
                        //console.log('Object in loop ::' + obj._id.projectRelease + '|' + obj._id.projectComplexity);
                        if (labels.indexOf(obj._id.projectRelease) === -1)
                            labels.push(obj._id.projectRelease);
                        var index = labels.indexOf(obj._id.projectRelease);
                        //console.log('Index of the item found::' + index);
                        if (obj._id.projectComplexity === 'EA')
                            easy.splice(index, 1, obj.count);
                        else if (obj._id.projectComplexity === 'MO')
                            moderate.splice(index, 1, obj.count);
                        else if (obj._id.projectComplexity === 'DI')
                            difficult.splice(index, 1, obj.count);
                        else if (obj._id.projectComplexity === 'CO')
                            complex.splice(index, 1, obj.count);
                    }
                    $scope.data.push(easy);
                    $scope.data.push(moderate);
                    $scope.data.push(difficult);
                    $scope.data.push(complex);
                    //console.log('Data series::' + $scope.data + '|' + moderate.toString() + '|' + difficult);
                    $scope.labels = labels;
                    //console.log('Labels:' + labels);
                    //console.log('Response returned from report API ::' + angular.toJson(response.data));
                }, function (err) {
                    console.log('Not able to retrieve report::' + err);
                });
        };

        $scope.getSolStatusReport = function () {
            $scope.showPCR = false;
            $scope.showSSR = true;
            $scope.showPLR = false;
            $scope.sslabels = ['RED', 'GREEN', 'AMBER'];
            DashboardSvc.getSolutionStatusReport()
                .then(function (response) {
                    var ssdata = new Array(3);
                    var resp = JSON.parse(angular.toJson(response.data));
                    for (var i = 0; i < resp.length; i++) {
                        var obj = JSON.parse(angular.toJson(resp[i]));
                        //console.log('Solution status ::' + obj._id.solutionStatus + '|' + obj.count);
                        if (obj._id.solutionStatus === 'RED') {
                            ssdata.splice(0, 1, obj.count);
                            //console.log('Inside Red loop:::' + ssdata.toString());
                        }
                        else if (obj._id.solutionStatus === 'GREEN')
                            ssdata.splice(1, 1, obj.count);
                        else if (obj._id.solutionStatus === 'AMBER')
                            ssdata.splice(2, 1, obj.count);
                    }
                    $scope.ssdata = ssdata;
                    // console.log('Solution data array::' + $scope.ssdata.toString());
                    //console.log('Response returned from report API ::' + angular.toJson(response.data));
                }, function (err) {
                    console.log('Not able to retrieve report::' + err);
                });
        };

        $scope.getProjectLoadReport = function () {
            $scope.showPCR = false;
            $scope.showSSR = false;
            $scope.showPLR = true;
            DashboardSvc.getArchitectAssignmentReport()
                .then(function (response) {
                    var resp = JSON.parse(angular.toJson(response.data));
                    var labels = new Array(resp.length);
                    var data = new Array(resp.length);
                    for (var i = 0; i < resp.length; i++) {
                        var obj = JSON.parse(angular.toJson(resp[i]));
                        //console.log('Solution status ::' + obj._id.architect + '|' + obj.count);
                        labels.splice(i, 0, obj._id.architect);
                        // labels.push(obj._id.architect);
                        data.splice(i, 0, obj.count);
                        //data.push(obj.count);
                        //console.log('Architect inside loop::' + labels);
                    }
                    $scope.aalabels = labels;
                    $scope.aadata = data;
                    //console.log('Architect label::' + $scope.aalabels.toString());
                    // console.log('Response returned from report API ::' + angular.toJson(response.data));
                }, function (err) {
                    console.log('Not able to retrieve report::' + err);
                });
        };

        $scope.plrClick = function (points, evt) {
            console.log(points, evt);
        };

        $scope.displayProjStatSummary = function(){
            DashboardSvc.getProjectStatusSummary()
                .then(function(response){
                    $scope.projectSummary=response.data;
                },function(err){
                    console.log('Not able to retrieve status summary::' + err);
                });
        };

        $scope.displaySolStatSummary = function(status){
            DashboardSvc.getSolutionStatusSummary({status:status})
                .then(function(response){
                    if(status==='GREEN')
                        $scope.greenProjects=response.data;
                    else if(status==='RED')
                        $scope.redProjects=response.data;
                    else if(status==='AMBER')
                        $scope.amberProjects=response.data;

                },function(err){
                    console.log('Not able to retrieve solution summary::' + err);
                });
        };

        $scope.getMyProjects = function(){
            DashboardSvc.listMyProjects({detsArchitect:$scope.authentication.user.attUID})
                .then(function(response){
                    $scope.myProjects = response.data;
                    $scope.reverseSort = false;
                    $scope.showSpinner = false;
                },function(err){
                    console.log('Not able to retrieve my projects--' + err);
                });
        };

    }
]);
