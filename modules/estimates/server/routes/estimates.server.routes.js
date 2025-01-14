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

    //Retrieve list of estimates for a project based on pmtId
    app.route('/api/estimate/dde')
        .post(estimates.getDDEEstimateByPID);

    app.route('/api/estimate/mailtemplates')
        .post(estimatesPolicy.isAllowed,estimates.getMailTemplate);

    //Retrieve list of estimates for a project
    app.route('/api/estimate/report/download')
        .get(estimatesPolicy.isAllowed,estimates.exportEstimatesToExcel);

    // Finish by binding the Change Request middleware
    app.param('estimateId',estimates.estimateByID);

};
