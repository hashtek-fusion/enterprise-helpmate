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
                    displayname:null,
                    jobTitle:null
                }
            })
            .state('projects.create', {
                url: '/create',
                templateUrl: 'modules/projects/views/create-project.client.view.html',
                data: {
                    roles: ['editor']
                }
            })
            .state('projects.view', {
                url: '/:projectId',
                templateUrl: 'modules/projects/views/view-project.client.view.html'
            })
            .state('projects.edit', {
                url: '/:projectId/edit',
                templateUrl: 'modules/projects/views/edit-project.client.view.html',
                data: {
                    roles: ['editor']
                }
            })
            .state('projects.dmedit', {
                url: '/:projectId/edit',
                templateUrl: 'modules/projects/views/edit-dm-project.client.view.html',
                data: {
                    roles: ['dm_editor']
                }
            })
            .state('projects.tfaedit', {
                url: '/:projectId/edit',
                templateUrl: 'modules/projects/views/edit-tfa-project.client.view.html',
                data: {
                    roles: ['tfa_editor']
                },
                controller: 'ProjectEditController',
                resolve: {
                  project: ['$stateParams', 'Projects', function ($stateParams, Projects) {
                    return Projects.get({
                        projectId: $stateParams.projectId
                    });
                  }]
                }
            })
            .state('archive', {
                url: '/project/archive',
                templateUrl: 'modules/projects/views/list-projects.client.view.html',
            })
            .state('owner', {
                url: '/project/owner',
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
            });
    }
]);
