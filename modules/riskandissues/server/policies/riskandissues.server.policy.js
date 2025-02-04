/**
 * Created by Rajesh on 9/7/2017.
 */
'use strict';

/**
 * Module dependencies.
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Risk and Issues module Permissions
 */
exports.invokeRolesPolicies = function () {
    acl.allow([{
        roles: ['user'],
        allows: [{
            resources: '/api/riskandissues/:issueId',
            permissions: ['get']
        },{
            resources: '/api/riskandissues',
            permissions: ['get']
        }, {
            resources: '/api/riskandissues/list',
            permissions: ['post']
        }, {
            resources: '/api/riskandissue/filter',
            permissions: ['post']
        }]
    },{
        roles: ['editor','dm_editor','tfa_editor'],
        allows:[{
            resources: '/api/riskandissues',
            permissions: ['post']
        },{
            resources: '/api/riskandissues/:issueId',
            permissions: ['put']
        }]
    }
    ]);
};

/**
 * Check If RiskAndIssue Policy Allows
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
