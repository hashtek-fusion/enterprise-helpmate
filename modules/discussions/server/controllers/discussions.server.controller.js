/**
 * Created by Rajesh on 09/20/2017.
 */
'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    path = require('path'),
    mongoose = require('mongoose'),
    Discussions = mongoose.model('Discussions'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a Discussion Thread
 */
exports.create = function (req, res) {
    var discussion = new Discussions(req.body);
    discussion.createdBy=req.user;
    discussion.createdOn=Date.now();
    discussion.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(discussion);
        }
    });
};

/**
 * Show the current Discussion Thread
 */
exports.read = function (req, res) {
    res.json(req.discussion);
};


/**
 * Update existing Discussion
 */

exports.update = function (req, res){
    var discussion = req.discussion;
    discussion.modifiedBy=req.user;
    discussion.modifiedOn=Date.now();
    // Merge existing Discussion
    discussion = _.extend(discussion, req.body);
    discussion.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(discussion);
        }
    });
};

/**
 * Delete Discussion Thread
 */
exports.delete = function (req, res) {
    var discussion = req.discussion;
    discussion.remove(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(discussion);
        }
    });
};

/**
 * Discussion middleware
 */
exports.discussionByID = function (req, res, next, id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({
            message: 'Discussion thread is invalid'
        });
    }

    Discussions.findById(id).exec(function (err, discussion) {
        if (err) {
            return next(err);
        } else if (!discussion) {
            return res.status(404).send({
                message: 'No Discussion thread with that identifier has been found'
            });
        }
        req.discussion = discussion;
        next();
    });
};

/**
 * List Discussion Threads associated with specific project
 */

exports.listDiscussions = function (req, res){
    var projectId = req.body.projectId;
    Discussions.find({projectId:projectId})
        .sort({createdOn:-1})
        .select('-notes -actionItems -keywords')
        .exec(function (err, discussions) {
            if (err) {
                console.log(err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.json(discussions);
            }
        });
};
