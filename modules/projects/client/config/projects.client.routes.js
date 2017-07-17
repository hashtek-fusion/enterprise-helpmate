/**
 * Created by Rajesh on 6/9/2017.
 */
'use strict';

// Setting up route
angular.module('projects').config(['$stateProvider',
    function ($stateProvider) {
        // Projects state routing
        $stateProvider
            .state('projects', {
                abstract: true,
                url: '/projects',
                template: '<ui-view/>',
                data: {
                    roles: ['user']
                }
            })
            .state('projects.list', {
                url: '',
                templateUrl: 'modules/projects/views/list-projects.client.view.html',
                params:{
                    pmtId:null,
                    status:null,
                    complexity:null,
                    release:null,
                    impactedApplication:null,
                    solutionStatus:null,
                    from:null,
                    username:null,
                    displayname:null
                }
            })
            .state('projects.create', {
                url: '/create',
                templateUrl: 'modules/projects/views/create-project.client.view.html',
            })
            .state('projects.view', {
                url: '/:projectId',
                templateUrl: 'modules/projects/views/view-project.client.view.html'
            })
            .state('projects.edit', {
                url: '/:projectId/edit',
                templateUrl: 'modules/projects/views/edit-project.client.view.html'
            })
            .state('archive', {
                url: '/project/archive',
                templateUrl: 'modules/projects/views/list-projects.client.view.html',
            });
    }
]);
