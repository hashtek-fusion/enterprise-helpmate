/**
 * Created by Rajesh on 9/7/2017.
 */
'use strict';

// Setting up route
angular.module('riskAndIssues').config(['$stateProvider',
    function ($stateProvider) {
        // RiskAndIssues state routing
        $stateProvider
            .state('issues', {
                url: '/issues',
                abstract: true,
                template: '<ui-view/>',
                data: {
                    roles: ['user']
                },
            })
            .state('issues.list', {
                url: '',
                templateUrl: 'modules/riskandissues/views/list-issues.client.view.html',
                params:{
                    from: null,
                    release: null,
                    pmtId: null,
                    status: null,
                    priority: null
                }
            })
            .state('issues.create', {
                url: '/create',
                templateUrl: 'modules/riskandissues/views/create-issues.client.view.html',
                params:{
                    projectId: null,
                    pmtId: null,
                    release: null
                },
                data: {
                    roles: ['editor','tfa_editor','dm_editor']
                }
            })
            .state('issues.edit', {
                url: '/:issueId/edit',
                templateUrl: 'modules/riskandissues/views/edit-issues.client.view.html',
                params:{
                    pmtId: null,
                    issueId: null,
                    release: null
                },
                data: {
                    roles: ['editor','tfa_editor','dm_editor']
                }
            });
    }
]);
