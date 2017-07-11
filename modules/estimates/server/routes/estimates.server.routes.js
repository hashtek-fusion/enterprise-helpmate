/**
 * Created by Rajesh on 7/3/2017.
 */
'use strict';

/**
 * Module dependencies.
 */
var estimatesPolicy = require('../policies/estimates.server.policy'),
     estimates = require('../controllers/estimates.server.controller');

module.exports = function (app) {
    app.route('/api/estimates')
        .post(estimatesPolicy.isAllowed,estimates.create);

    // Single Change routes
    app.route('/api/estimates/:estimateId').all(estimatesPolicy.isAllowed)
        .get(estimates.read)
        .put(estimates.update)
        .delete(estimates.delete);

    //Retrieve list of estimates for a project
    app.route('/api/estimate/list')
        .post(estimatesPolicy.isAllowed,estimates.listEstimates);

    // Finish by binding the Change Request middleware
    app.param('estimateId',estimates.estimateByID);

};
