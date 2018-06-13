/**
 * Created by Rajesh on 7/3/2017.
 */
'use strict';

//Estimates service used for communicating with the estimates REST endpoints in node server
angular.module('estimates')
    .factory('Estimates', ['$resource',
        function ($resource) {
            return $resource('api/estimates/:estimateId', {
                estimateId: '@_id'
            }, {
                update: {
                    method: 'PUT'
                }
            });
        }
    ])
    .factory('EstimatesSvc', ['$http',function($http) {

        var estimatesFactory = {};
        estimatesFactory.getListOfEstimates=function(data){
            return $http({
                url: '/api/estimate/list',
                method: 'POST',
                data: data
            });
        };
        estimatesFactory.getProjectMonthlyEfforts=function(data){
            return $http({
                url: '/api/effort/list',
                method: 'POST',
                data: data
            });
        };
        estimatesFactory.getResourceMonthlyEfforts=function(data){
            return $http({
                url: '/api/effort/resource',
                method: 'POST',
                data: data
            });
        };

        return estimatesFactory;
    }
    ]);
