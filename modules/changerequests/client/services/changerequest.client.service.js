/**
 * Created by Rajesh on 6/28/2017.
 */
'use strict';

//Change Request service used for communicating with the change request REST endpoints in node server
angular.module('changeRequests')
    .factory('ChangeRequests', ['$resource',
        function ($resource) {
            return $resource('api/changeRequests/:changeReqId', {
                changeReqId: '@_id'
            }, {
                update: {
                    method: 'PUT'
                }
            });
        }
    ])
    .factory('ChangeReqSvc', ['$http',function($http) {

        var changeReqFactory = {};
        changeReqFactory.getListOfCRs=function(data){
            return $http({
                url: '/api/changeRequest/list',
                method: 'POST',
                data: data
            });
        };

        return changeReqFactory;
    }
    ]);
