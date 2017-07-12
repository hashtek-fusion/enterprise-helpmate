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
  /*  .factory('ConfigSvc', ['$http',function($http) {
        var configFactory = {};

        configFactory.getProjectConfiguration=function(){
            return $http.get('/api/session/configuration');
        };
        configFactory.getMailTemplate=function(data){
            return $http({
                url: '/api/project/mailtemplates',
                method: 'POST',
                params: data
            });
        };
        return configFactory;
    }
])*/
    .factory('ConfigSvc', ['$http','localStorageService',function($http,localStorageService) {
        var configFactory = {};

        configFactory.getProjectConfiguration=function(){
            var configuration = localStorageService.get('configuration');
            if(configuration && configuration!==null && configuration!== undefined)
                return configuration;
            else{
                configuration={};
                $http.get('/api/project/configuration').success(function (response) {
                    console.log('Project config loaded');
                    configuration= response;
                    $http.get('/api/user/editors').success(function (response) {
                        console.log('Project editors loaded');
                        configuration.detsArchitect= response;
                        localStorageService.set('configuration', configuration);
                        return localStorageService.get('configuration');
                    });
                });
            }
        };
        configFactory.setProjectConfiguration=function(config){
            return localStorageService.set('configuration', config);
        };
        configFactory.getMailTemplate=function(data){
            return $http({
                url: '/api/project/mailtemplates',
                method: 'POST',
                params: data
            });
        };
        return configFactory;
    }
]);
