/**
 * Created by Rajesh on 6/28/2017.
 */

'use strict';

/**
 * Module dependencies.
 */
var changeRequestPolicy = require('../policies/changerequest.server.policy'),
    changeRequests = require('../controllers/changerequest.server.controller');

module.exports = function (app) {
    app.route('/api/changeRequests')
        .post(changeRequestPolicy.isAllowed,changeRequests.create);

    // Single Change routes
    app.route('/api/changeRequests/:changeReqId').all(changeRequestPolicy.isAllowed)
        .get(changeRequests.read)
        .put(changeRequests.update)
        .delete(changeRequests.delete);

    //Retrieve list of CRs for a project
    app.route('/api/changeRequest/list')
        .post(changeRequestPolicy.isAllowed,changeRequests.listCR);

    // Finish by binding the Change Request middleware
    app.param('changeReqId',changeRequests.crByID);

};
