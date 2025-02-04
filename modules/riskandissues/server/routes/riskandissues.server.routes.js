/**
 * Created by Rajesh on 9/7/2017.
 */
'use strict';

/**
 * Module dependencies.
 */
var riskAndIssuesPolicy = require('../policies/riskandissues.server.policy'),
    riskAndIssues = require('../controllers/riskandissues.server.controller');

module.exports = function (app) {
    app.route('/api/riskandissues')
        .post(riskAndIssuesPolicy.isAllowed,riskAndIssues.create)
        .get(riskAndIssuesPolicy.isAllowed,riskAndIssues.listAllRisksAndIssues);

    // Single Change routes
    app.route('/api/riskandissues/:issueId')
        .get(riskAndIssuesPolicy.isAllowed,riskAndIssues.read)
        .put(riskAndIssuesPolicy.isAllowed,riskAndIssues.update)
        .delete(riskAndIssuesPolicy.isAllowed,riskAndIssues.delete);

    //Retrieve list of Risk and Issues for a project
    app.route('/api/riskandissues/list')
        .post(riskAndIssuesPolicy.isAllowed,riskAndIssues.listRiskAndIssues);

    //Filter Risk and Issues based on filter criteria
    app.route('/api/riskandissue/filter')
        .post(riskAndIssuesPolicy.isAllowed,riskAndIssues.filterRiskAndIssues);

    // Finish by binding the Risk & Issues middleware
    app.param('issueId',riskAndIssues.issueByID);

};
