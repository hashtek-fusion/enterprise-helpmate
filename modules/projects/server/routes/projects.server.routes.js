/**
 * Created by Rajesh on 6/8/2017.
 */
'use strict';

/**
 * Module dependencies.
 */
var projectPolicy = require('../policies/projects.server.policy'),
    projects = require('../controllers/projects.server.controller');

module.exports = function (app) {
    // Projects collection routes
    app.route('/api/projects').all(projectPolicy.isAllowed)
        .get(projects.listProjectOverview)
        .post(projects.create);

    // Single project routes
    app.route('/api/projects/:projectId').all(projectPolicy.isAllowed)
        .get(projects.read)
        .put(projects.update)
        .delete(projects.delete);

    // Retrieve project settings & utility routes
    app.route('/api/project/configuration')
        .get(projectPolicy.isAllowed,projects.getProjectConfiguration);
    app.route('/api/project/mailtemplates')
        .post(projectPolicy.isAllowed,projects.getMailTemplate);
    app.route('/api/project/report/download')
        .get(projectPolicy.isAllowed,projects.exportToExcel);

    //File upload
    app.route('/api/project/document/upload')
        .post(projectPolicy.isAllowed,projects.uploadDocument);

    // Finish by binding the project middleware
    app.param('projectId', projects.projectByID);
};
