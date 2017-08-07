/**
 * Created by Rajesh on 8/7/2017.
 */
'use strict';
// Setting up route
angular.module('util').config(['$stateProvider',
    function ($stateProvider) {
        // Users state routing
        $stateProvider
            .state('util', {
                abstract: true,
                url: '/util',
                templateUrl: 'modules/util/views/utilities.client.view.html',
                data: {
                    roles: ['admin']
                }
            })
            .state('util.templates', {
                url: '/templates',
                templateUrl: 'modules/util/views/util-template.client.view.html'
            })
            .state('util.projects', {
                url: '/projects',
                templateUrl: 'modules/util/views/util-projects.client.view.html'
            })
            .state('util.requests', {
                url: '/requests',
                templateUrl: 'modules/util/views/util-requests.client.view.html'
            })
            .state('util.estimates', {
                url: '/estimates',
                templateUrl: 'modules/util/views/util-estimates.client.view.html'
            });
    }
]);
