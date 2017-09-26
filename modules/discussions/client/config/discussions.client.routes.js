/**
 * Created by Rajesh on 09/20/2017.
 */
'use strict';

// Setting up route
angular.module('discussions').config(['$stateProvider',
    function ($stateProvider) {
        // Discussions state routing
        $stateProvider
            .state('discussions', {
                url: '/discussions',
                abstract: true,
                template: '<ui-view/>',
                data: {
                    roles: ['user']
                },
            })
            .state('discussions.view', {
                url: '/:discussionId',
                templateUrl: 'modules/discussions/views/view-discussions.client.view.html'
            });
    }
]);
