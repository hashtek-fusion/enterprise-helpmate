/**
 * Created by Rajesh on 6/9/2017.
 */
'use strict';

// Configuring the Projects module
angular.module('projects').run(['Menus',
    function (Menus) {
        // Add the projects dropdown item
        Menus.addMenuItem('topbar', {
            title: 'Projects',
            state: 'projects',
            type: 'dropdown'
        });

        // Add the dropdown list item
        Menus.addSubMenuItem('topbar', 'projects', {
            title: 'List Projects',
            state: 'projects.list'
        });

        // Add the dropdown create item
        Menus.addSubMenuItem('topbar', 'projects', {
            title: 'Create Project',
            state: 'projects.create',
            roles: ['editor']
        });

        // Add the dropdown create item
        Menus.addSubMenuItem('topbar', 'projects', {
            title: 'Project Archive',
            state: 'archive'
        });
    }
]);