/**
 * Created by Rajesh on 7/18/2017.
 */
'use strict';

/**
 * Module dependencies.
 */
var versionPolicy = require('../policies/version.server.policy'),
    version = require('../controllers/version.server.controller');

module.exports = function (app) {
    //Retrieve Project versions
    app.route('/api/project/versions')
        .post(versionPolicy.isAllowed,version.getProjectVersions);
};
