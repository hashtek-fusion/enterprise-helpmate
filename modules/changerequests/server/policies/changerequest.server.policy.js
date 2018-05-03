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
 * Invoke Change Request module Permissions
 */
exports.invokeRolesPolicies = function () {
    acl.allow([{
        roles: ['user'],
        allows: [{
            resources: '/api/changeRequests/:changeReqId',
            permissions: ['get']
        }, {
            resources: '/api/changeRequest/list',
            permissions: ['post']
        }]
    },{
        roles: ['editor','tfa_editor'],
        allows:[{
            resources: '/api/changeRequests',
            permissions: ['post']
        },{
            resources: '/api/changeRequests/:changeReqId',
            permissions: ['put']
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
