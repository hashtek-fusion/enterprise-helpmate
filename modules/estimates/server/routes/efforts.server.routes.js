/**
 * Created by Rajesh on 6/8/2018.
 */
'use strict';

/**
 * Module dependencies.
 */
var effortsPolicy = require('../policies/efforts.server.policy'),
    efforts = require('../controllers/efforts.server.controller');

module.exports = function (app) {
    // Single Change routes
    app.route('/api/efforts/:effortId').all(effortsPolicy.isAllowed)
        .get(efforts.read)
        .put(efforts.update)
        .delete(efforts.delete);

    //Retrieve list of efforts for a project
    app.route('/api/effort/list')
        .post(effortsPolicy.isAllowed,efforts.listEfforts);
    //Retrieve list of efforts for a resource
    app.route('/api/effort/resource')
        .post(effortsPolicy.isAllowed,efforts.listResourceEfforts);

    // Finish by binding the Effort middleware
    app.param('effortId',efforts.effortByID);
};
