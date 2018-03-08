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
 * Invoke Dashboard module Permissions
 */
exports.invokeRolesPolicies = function () {
    acl.allow([{
        roles: ['user'],
        allows: [{
            resources: '/api/project/search',
            permissions: ['post']
        }, {
            resources: '/api/project/myprojects',
            permissions: ['post']
        }, {
            resources: '/api/project/report/releaseAndComplexity',
            permissions: ['get']
        }, {
            resources: '/api/project/report/resourceLoad',
            permissions: ['get']
        }, {
            resources: '/api/project/report/resourceTFALoad',
            permissions: ['get']
        }, {
            resources: '/api/project/report/solutionStatus',
            permissions: ['get']
        }, {
            resources: '/api/project/report/solutionSummary',
            permissions: ['post']
        }, {
            resources: '/api/project/report/statusSummary',
            permissions: ['get']
        }, {
            resources: '/api/project/report/releaseRiskAndIssues',
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
