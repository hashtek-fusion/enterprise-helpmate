/**
 * Created by Rajesh on 11/03/2017.
 */
'use strict';

/**
 * Module dependencies.
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Estimates module Permissions
 */
exports.invokeRolesPolicies = function () {
    acl.allow([{
        roles: ['editor'],
        allows:[{
            resources: '/api/thirdparty/dsp/projects/detail',
            permissions: ['post']
        }]
    },{
        roles: ['admin'],
        allows:[{
            resources: '/api/thirdparty/dsp/projects/list',
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
