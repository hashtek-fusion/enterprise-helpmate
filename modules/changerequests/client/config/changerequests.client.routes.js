/**
 * Created by Rajesh on 6/29/2017.
 */
'use strict';

// Setting up route
angular.module('changeRequests').config(['$stateProvider',
    function ($stateProvider) {
        // Projects state routing
        $stateProvider
            .state('request', {
                url: '/request',
                abstract: true,
                template: '<ui-view/>',
                data: {
                    roles: ['user']
                },
            })
            .state('request.create', {
                url: '/create',
                templateUrl: 'modules/changerequests/views/create-changerequest.client.view.html',
                params:{
                    projectId: null,
                    pmtId: null
                }
            })
            .state('request.edit', {
                url: '/:changeReqId/edit',
                templateUrl: 'modules/changerequests/views/edit-changerequest.client.view.html',
                params:{
                    pmtId: null,
                    changeReqId: null
                }
            });
    }
]);
