/**
 * Created by Rajesh on 6/27/2017.
 */
'use strict';

//Dashboard controller to handle and render dashboard
angular.module('dashboard').controller('DashboardController', ['$scope', '$stateParams', '$location', 'Authentication', 'DashboardSvc','ConfigSvc','$state',
    function ($scope, $stateParams, $location, Authentication,DashboardSvc,ConfigSvc,$state) {

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
                    var easy = [],
                        moderate = [],
                        difficult = [],
                        complex = [];
                    var len=resp.length;
                    while(len--){
                        easy[len] =0;
                        moderate[len]=0;
                        difficult[len]=0;
                        complex[len]=0;
                    }
                    for (var i = 0; i < resp.length; i++) {
                        var obj = JSON.parse(angular.toJson(resp[i]));
                        var release= parseInt(obj._id.projectRelease);
                        if (labels.indexOf(release) === -1)
                            labels.push(release);
                        var index = labels.indexOf(release);
                        if (obj._id.projectComplexity === 'EA') {
                            var eaCnt=(isNaN(easy[index])? 0 : parseInt(easy[index]));
                            eaCnt+= parseInt(obj.count);
                            easy.splice(index, 1, eaCnt);
                        }
                        else if (obj._id.projectComplexity === 'MO') {
                            var modCnt=(isNaN(moderate[index])? 0 : parseInt(moderate[index]));
                            modCnt+= parseInt(obj.count);
                            moderate.splice(index, 1, modCnt);
                        }
                        else if (obj._id.projectComplexity === 'DI') {
                            var diCnt=(isNaN(difficult[index])? 0 : parseInt(difficult[index]));
                            diCnt+= parseInt(obj.count);
                            difficult.splice(index, 1, diCnt);
                        }
                        else if (obj._id.projectComplexity === 'CO') {
                            var coCnt=(isNaN(complex[index])? 0 : parseInt(complex[index]));
                            coCnt+= parseInt(obj.count);
                            complex.splice(index, 1, coCnt);
                        }
                    }
                    $scope.data.push(easy);
                    $scope.data.push(moderate);
                    $scope.data.push(difficult);
                    $scope.data.push(complex);
                    //console.log('Data series::' + $scope.data + '|' + moderate.toString() + '|' + difficult);
                    $scope.labels = labels;
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
                        labels.splice(i, 0, getArchitectName(obj._id.architect));
                        data.splice(i, 0, obj.count);
                    }
                    $scope.aalabels = labels;
                    $scope.aadata = data;
                }, function (err) {
                    console.log('Not able to retrieve report::' + err);
                });
        };

        $scope.getChartinfo = function (points, evt) {
            var userName=getArchitectUserName(points[0]._model.label);
            $state.go('projects.list', {username:userName, from:'dashboard', displayname: points[0]._model.label} );
        };

        $scope.getProjChartinfo = function(points, evt){
            var release = points[0]._model.label;
            $state.go('projects.list', {status:'ACTIVE', from:'dashboard', release: release} );
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
            DashboardSvc.listMyProjects({detsArchitect:$scope.authentication.user.username})
                .then(function(response){
                    $scope.myProjects = response.data;
                    $scope.reverseSort = false;
                    $scope.showSpinner = false;
                },function(err){
                    console.log('Not able to retrieve my projects--' + err);
                });
        };

        var getArchitectName=function(key){
            if(ConfigSvc.getProjectConfiguration()) {
                var config = JSON.parse(angular.toJson(ConfigSvc.getProjectConfiguration()));
                var users = config.detsArchitect;
                var userObj = users.find(function (user) {
                    return user.key === key;
                });
                if (userObj) return userObj.value;
                else
                    return key;
            }else
                return key;
        };

        var getArchitectUserName=function(displayName){
            if(ConfigSvc.getProjectConfiguration()) {
                var config = JSON.parse(angular.toJson(ConfigSvc.getProjectConfiguration()));
                var users = config.detsArchitect;
                var userObj = users.find(function (user) {
                    return user.value === displayName;
                });
                if (userObj) return userObj.key;
                else
                    return displayName;
            }else
                return displayName;
        };

    }
]);
