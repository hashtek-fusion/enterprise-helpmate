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
    .factory('ConfigSvc', ['$http',function($http) {
        var configFactory = {};

        configFactory.getProjectConfiguration=function(){
            return $http.get('/api/project/configuration');
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
