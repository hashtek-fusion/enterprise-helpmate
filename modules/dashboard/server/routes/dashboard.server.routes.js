/**
 * Created by Rajesh on 6/29/2017.
 */
'use strict';

/**
 * Module dependencies.
 */
var dashboardPolicy = require('../policies/dashboard.server.policy'),
    projects = require('../controllers/dashboard.server.controller');

module.exports = function (app) {
    //Search & filter Project routes
    app.route('/api/project/search')
        .post(dashboardPolicy.isAllowed,projects.filterProjects);
    app.route('/api/project/myprojects')
        .post(dashboardPolicy.isAllowed,projects.listMyProjects);

    //Dashboard summary & reports routes
    app.route('/api/project/report/releaseAndComplexity')
        .get(dashboardPolicy.isAllowed,projects.summaryReportByComplexity);
    app.route('/api/project/report/resourceLoad')
        .get(dashboardPolicy.isAllowed,projects.summaryReportByResource);
    app.route('/api/project/report/solutionStatus')
        .get(dashboardPolicy.isAllowed,projects.summaryReportBySolutionStatus);
    app.route('/api/project/report/solutionSummary')
        .post(dashboardPolicy.isAllowed,projects.summaryReportBySolution);
    app.route('/api/project/report/statusSummary')
        .get(dashboardPolicy.isAllowed,projects.summaryReportByStatus);
    app.route('/api/project/report/releaseRiskAndIssues')
        .get(dashboardPolicy.isAllowed,projects.issueReportByPriority);

};
