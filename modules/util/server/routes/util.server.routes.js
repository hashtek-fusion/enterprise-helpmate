/**
 * Created by Rajesh on 8/7/2017.
 */
'use strict';

/**
 * Module dependencies.
 */
var utilPolicy = require('../policies/util.server.policy'),
    util = require('../controllers/util.server.controller');

module.exports = function (app) {
    //Project Import
    app.route('/api/util/import/projects')
        .post(utilPolicy.isAllowed,util.importProjects);

    //Change Requests Import
    app.route('/api/util/import/requests')
        .post(utilPolicy.isAllowed,util.importRequests);

    //Project Estimates Import
    app.route('/api/util/import/estimates')
        .post(utilPolicy.isAllowed,util.importEstimates);

};
