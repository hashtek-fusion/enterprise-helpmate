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
            $scope.getProjectIssuesReport();
            $scope.getProjectLoadReport('DETS');
            $scope.getProjectLoadReport('TFA');
            $scope.getProjectLoadReport('DM');
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
                    $scope.series = ['EASY', 'MODERATE', 'DIFFICULT', 'COMPLEX'];
                    $scope.labels = resp.labels;
                    $scope.data= resp.data;
                }, function (err) {
                    console.log('Not able to retrieve report::' + err);
                });
        };

        $scope.getProjectIssuesReport = function () {
            $scope.lineChartOptions = {
                legend: {
                    display: true
                },
                tooltips: {
                    enabled: true
                }
            };
            DashboardSvc.getReleaseIssueReport()
                .then(function (response) {
                    var resp = JSON.parse(angular.toJson(response.data));
                    $scope.riSeries = ['HIGH', 'MEDIUM', 'LOW'];
                    $scope.riLabels = resp.labels;
                    $scope.riData= resp.data;
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
                        if (obj._id.solutionStatus === 'RED') {
                            ssdata.splice(0, 1, obj.count);
                        }
                        else if (obj._id.solutionStatus === 'GREEN')
                            ssdata.splice(1, 1, obj.count);
                        else if (obj._id.solutionStatus === 'AMBER')
                            ssdata.splice(2, 1, obj.count);
                    }
                    $scope.ssdata = ssdata;
                }, function (err) {
                    console.log('Not able to retrieve report::' + err);
                });
        };

        $scope.getProjectLoadReport = function (role) {
           $scope.showPCR = false;
           $scope.showSSR = false;
           $scope.showPLR = true;
           DashboardSvc.getArchitectAssignmentReport(role)
               .then(function (response) {
                   var resp = JSON.parse(angular.toJson(response.data));
                   var activeResources = getActiveArchitects(role);
                   var labels = new Array(activeResources.length);
                   var data = new Array(activeResources.length);
                   for (var i = 0; i < activeResources.length; i++) {
                       var obj= resp.find(function(o){
                           return (o._id.architect===activeResources[i].key);
                       });
                       if(obj){
                           labels.splice(i, 0, activeResources[i].value);
                           data.splice(i, 0, obj.count);
                       }
                   }
                   if(role==='DETS'){
                       $scope.aalabels = labels;
                       $scope.aadata = data;
                   }else if(role==='TFA'){
                       $scope.aaTFAlabels = labels;
                       $scope.aaTFAdata = data;
                   }else if(role==='DM'){
                       $scope.aaDMTFAlabels = labels;
                       $scope.aaDMTFAdata = data;
                   }
               }, function (err) {
                   console.log('Not able to retrieve report::' + err);
               });
        };

        $scope.getChartinfo = function (points, evt) {
            var userName=getArchitectUserName(points[0]._model.label,'DETS');
            $state.go('projects.list', {username:userName, from:'dashboard', displayname: points[0]._model.label, jobTitle:'DETS'} );
        };

        $scope.getTFAChartinfo = function (points, evt) {
            var userName=getArchitectUserName(points[0]._model.label,'TFA');
            $state.go('projects.list', {username:userName, from:'dashboard', displayname: points[0]._model.label,jobTitle:'TFA'} );
        };

        $scope.getDMTFAChartinfo = function (points, evt) {
            var userName=getArchitectUserName(points[0]._model.label,'DM');
            $state.go('projects.list', {username:userName, from:'dashboard', displayname: points[0]._model.label,jobTitle:'DM'} );
        };

        $scope.getProjChartinfo = function(points, evt){
            var release = points[0]._model.label;
            $state.go('projects.list', {status:'ACTIVE', from:'dashboard', release: release} );
        };

        $scope.getIssueChartinfo = function (points, evt) {
            var release = points[0]._model.label;
            $state.go('issues.list', {release:release, from:'dashboard'} );
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
            DashboardSvc.listMyProjects({detsArchitect:$scope.authentication.user.username,onHold:'NO',jobTitle:$scope.authentication.user.jobTitle.key})
                .then(function(response){
                    $scope.myProjects = response.data;
                    $scope.reverseSort = false;
                    $scope.showSpinner = false;
                },function(err){
                    console.log('Not able to retrieve my projects--' + err);
                });
        };

        var getArchitectUserName=function(displayName, role){
            if(ConfigSvc.getProjectConfiguration()) {
                var config = JSON.parse(angular.toJson(ConfigSvc.getProjectConfiguration()));
                var users = {};
                if(role==='DETS') users = config.detsArchitect;
                if(role==='TFA') users = config.assignedTFA;
                if(role==='DM') users = config.assignedDMTFA;
                var userObj = users.find(function (user) {
                    return user.value === displayName;
                });
                if (userObj)
                    return userObj.key;
                else
                    return displayName;
            }else
                return displayName;
        };

        var getActiveArchitects = function(role){
            if(ConfigSvc.getProjectConfiguration()) {
                var config = JSON.parse(angular.toJson(ConfigSvc.getProjectConfiguration()));
                var users = [];
                if(role==='DETS') users = config.detsArchitect;
                if(role==='TFA') users = config.assignedTFA;
                if(role==='DM') users = config.assignedDMTFA;
                return users;
            }
        };

    }
]);
