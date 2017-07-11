/**
 * Created by Rajesh on 6/29/2017.
 */
'use strict';

// Setting up route
angular.module('dashboard').config(['$stateProvider',
    function ($stateProvider) {
        // Dashboard & Report state routing
        $stateProvider
            .state('report', {
                url: '/report',
                templateUrl: 'modules/dashboard/views/report-project.client.view.html',
                data: {
                    roles: ['user']
                }
            })
            .state('dashboard', {
                url: '/dashboard',
                templateUrl: 'modules/dashboard/views/dashboard-project.client.view.html',
                data: {
                    roles: ['user']
                }
            });
    }
]);
