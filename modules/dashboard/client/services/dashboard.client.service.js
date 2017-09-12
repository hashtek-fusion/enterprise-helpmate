/**
 * Created by Rajesh on 6/29/2017.
 */
'use strict';

//Projects service used for communicating with the articles REST endpoints
angular.module('dashboard')
    .factory('DashboardSvc', ['$http',function($http) {
        var dashboardFactory = {};
        dashboardFactory.getReleaseComplexityReport=function(){
            return $http.get('/api/project/report/releaseAndComplexity');
        };
        dashboardFactory.getReleaseIssueReport=function(){
            return $http.get('/api/project/report/releaseRiskAndIssues');
        };
        dashboardFactory.getSolutionStatusReport=function(){
            return $http.get('/api/project/report/solutionStatus');
        };
        dashboardFactory.getArchitectAssignmentReport=function(){
            return $http.get('/api/project/report/resourceLoad');
        };
        dashboardFactory.getSolutionStatusSummary=function(data){
            return $http({
                url: '/api/project/report/solutionSummary',
                method: 'POST',
                data: data
            });
        };
        dashboardFactory.getProjectStatusSummary=function(){
            return $http.get('/api/project/report/statusSummary');
        };
        dashboardFactory.filterProjects=function(data){
            return $http({
                url: '/api/project/search',
                method: 'POST',
                data: data
            });
        };
        dashboardFactory.listMyProjects=function(data){
            return $http({
                url: '/api/project/myprojects',
                method: 'POST',
                data: data
            });
        };
        return dashboardFactory;
    }
    ]);
