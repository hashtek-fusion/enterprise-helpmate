/**
 * Created by Rajesh on 8/7/2017.
 */
'use strict';

// Configuring the Projects module
angular.module('util').run(['Menus',
    function (Menus) {
        // Add the projects dropdown item
        Menus.addMenuItem('topbar', {
            title: 'Utilities',
            state: 'util',
            type: 'dropdown',
            roles: ['admin']
        });

        // Add the dropdown list item
        Menus.addSubMenuItem('topbar', 'util', {
            title: 'Download Templates',
            state: 'util.templates',
            roles: ['admin']
        });

        // Add the dropdown create item
        Menus.addSubMenuItem('topbar', 'util', {
            title: 'Import Projects',
            state: 'util.projects',
            roles: ['admin']
        });

        // Add the dropdown create item
        Menus.addSubMenuItem('topbar', 'util', {
            title: 'Import Change Requests',
            state: 'util.requests',
            roles: ['admin']
        });

        // Add the dropdown create item
        Menus.addSubMenuItem('topbar', 'util', {
            title: 'Import Estimates',
            state: 'util.estimates',
            roles: ['admin']
        });
    }
]);
