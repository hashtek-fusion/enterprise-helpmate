/**
 * Created by Rajesh on 7/5/2017.
 */
'use strict';

/**
 * Module dependencies.
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Project module Permissions
 */
exports.invokeRolesPolicies = function () {
    acl.allow([{
        roles: ['user'],
        allows: [{
            resources: '/api/projects',
            permissions: ['get']
        }, {
            resources: '/api/projects/:projectId',
            permissions: ['get']
        }, {
            resources: '/api/project/configuration',
            permissions: ['get']
        }, {
            resources: '/api/project/archive',
            permissions: ['get']
        }]
    },{
        roles: ['editor'],
        allows:[{
            resources: '/api/projects',
            permissions: ['post']
        },{
            resources: '/api/projects/:projectId',
            permissions: ['put']
        },{
            resources: '/api/project/mailtemplates',
            permissions: ['post']
        },{
            resources: '/api/project/document/upload',
            permissions: ['post']
        },{
            resources: '/api/project/document/download',
            permissions: ['get']
        }]
    },{
        roles: ['dm_editor','tfa_editor'],
        allows:[{
            resources: '/api/projects/:projectId',
            permissions: ['put']
        },{
            resources: '/api/project/mailtemplates',
            permissions: ['post']
        },{
            resources: '/api/project/document/upload',
            permissions: ['post']
        },{
            resources: '/api/project/document/download',
            permissions: ['get']
        }]
    },{
        roles: ['admin'],
        allows:[{
            resources: '/api/project/report/download',
            permissions: ['get']
        }]
    }
    ]);
};

/**
 * Check If Project Policy Allows
 */
exports.isAllowed = function (req, res, next) {
    var roles = (req.user) ? req.user.roles : ['guest'];

    // Check for user roles
    acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
        if (err) {
            // An authorization error occurred.
            return res.status(500).send('Unexpected authorization error');
        } else {
            if (isAllowed) {
                // Access granted! Invoke next middleware
                return next();
            } else {
                return res.status(403).json({
                    message: 'User is not authorized'
                });
            }
        }
    });
};
