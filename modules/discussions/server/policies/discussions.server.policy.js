/**
 * Created by Rajesh on 09/20/2017.
 */
'use strict';

/**
 * Module dependencies.
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Discussions module Permissions
 */
exports.invokeRolesPolicies = function () {
    acl.allow([{
        roles: ['user'],
        allows: [{
            resources: '/api/discussions/:discussionId',
            permissions: ['get']
        },{
            resources: '/api/discussions',
            permissions: ['get']
        }, {
            resources: '/api/discussion/list',
            permissions: ['post']
        }]
    },{
        roles: ['editor','dm_editor','tfa_editor'],
        allows:[{
            resources: '/api/discussions',
            permissions: ['post']
        },{
            resources: '/api/discussions/:discussionId',
            permissions: ['put']
        }]
    }
    ]);
};

/**
 * Check If Discussion Policy Allows
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
