/**
 * Created by Rajesh on 09/20/2017.
 */
'use strict';

/**
 * Module dependencies.
 */
var discussionsPolicy = require('../policies/discussions.server.policy'),
    discussions = require('../controllers/discussions.server.controller');

module.exports = function (app) {
    app.route('/api/discussions')
        .post(discussionsPolicy.isAllowed,discussions.create);

    // Single Change routes
    app.route('/api/discussions/:discussionId')
        .get(discussionsPolicy.isAllowed,discussions.read)
        .put(discussionsPolicy.isAllowed,discussions.update)
        .delete(discussionsPolicy.isAllowed,discussions.delete);

    //Retrieve list of Discussion threads for a project
    app.route('/api/discussion/list')
        .post(discussionsPolicy.isAllowed,discussions.listDiscussions);

    // Finish by binding the Discussion Thread middleware
    app.param('discussionId',discussions.discussionByID);

};
