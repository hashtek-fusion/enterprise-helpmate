/**
 * Created by Rajesh on 6/9/2017.
 */
'use strict';

//Projects service used for communicating with the projects REST endpoints in node server
angular.module('projects')
    .factory('Projects', ['$resource',
    function ($resource) {
        return $resource('api/projects/:projectId', {
            projectId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
])
    .factory('ConfigSvc', ['$http','localStorageService','$q',function($http,localStorageService,$q) {
        var configFactory = {};
        configFactory.loadProjectConfiguration=function(){
            var deferred = $q.defer();
            localStorageService.remove('configuration');//Remove the existing cache each time loading the config during sign-in
            var configuration={};
            $http.get('/api/project/configuration').then(function (response) {
                console.log('Project config loaded');
                configuration= response.data;
                $http.get('/api/user/editors').then(function (response) {
                    console.log('Project editors loaded');
                    var activeTFA = response.data.filter(function(d){
                        return (d.role==='TFA');
                    });
                    var activeDataMapTFA = response.data.filter(function(d){
                        return (d.role==='DM');
                    });
                    var activeDETS = response.data.filter(function(d){
                        return (d.role==='DETS');
                    });
                    configuration.assignedTFA= activeTFA;
                    configuration.detsArchitect= activeDETS;
                    configuration.assignedDMTFA= activeDataMapTFA;
                    localStorageService.set('configuration', configuration);
                    deferred.resolve(configuration);
                });
            });
            return deferred.promise;
        };
        configFactory.setProjectConfiguration=function(config){
            return localStorageService.set('configuration', config);
        };
        configFactory.getProjectConfiguration=function(){
            return localStorageService.get('configuration');
        };
        configFactory.getMailTemplate=function(data){
            return $http({
                url: '/api/project/mailtemplates',
                method: 'POST',
                params: data
            });
        };
        configFactory.getProjectArchive=function(){
            return $http({
                url: '/api/project/archive',
                method: 'GET'
            });
        };
        configFactory.getProjectUpdateFromDSP=function(data){
            return $http({
                url: '/api/thirdparty/dsp/projects/detail',
                method: 'POST',
                data: data
            });
        };
        return configFactory;
    }
]);
