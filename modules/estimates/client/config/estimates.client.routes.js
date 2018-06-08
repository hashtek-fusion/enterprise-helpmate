/**
 * Created by Rajesh on 7/3/2017.
 */
'use strict';

// Setting up route
angular.module('estimates').config(['$stateProvider',
    function ($stateProvider) {
        // Projects state routing
        $stateProvider
            .state('estimates', {
                url: '/estimates',
                abstract: true,
                template: '<ui-view/>',
                data: {
                    roles: ['user']
                },
            })
            .state('estimates.create', {
                url: '/create',
                templateUrl: 'modules/estimates/views/create-estimates.client.view.html',
                params:{
                    projectId: null,
                    pmtId: null,
                    estType: null,
                    application: null
                },
                data: {
                    roles: ['editor']
                }
            })
            .state('estimates.edit', {
                url: '/:estimateId/edit',
                templateUrl: 'modules/estimates/views/edit-estimates.client.view.html',
                params:{
                    pmtId: null,
                    estimateId: null,
                    estType: null,
                    application: null
                },
                data: {
                    roles: ['editor']
                }
            })
            .state('efforts', {
                url: '/estimate/efforts',
                templateUrl: 'modules/estimates/views/track-efforts.client.view.html',
                params:{
                    pmtId: null,
                    estimateId: null,
                    projectId: null,
                    application: null,
                    complexity: null,
                    detsDDE: null,
                    tfaDDE: null
                },
                data: {
                    roles: ['editor']
                }
            });
    }
]);
