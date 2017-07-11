/**
 * Created by Rajesh on 6/28/2017.
 */
'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    path = require('path'),
    mongoose = require('mongoose'),
    ChangeRequest = mongoose.model('ChangeRequest'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a Change Request
 */
exports.create = function (req, res) {
    var changeReq = new ChangeRequest(req.body);
    changeReq.createdBy=req.user;
    changeReq.createdOn=Date.now();
    changeReq.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(changeReq);
        }
    });
};

/**
 * Show the current Change Request detail
 */
exports.read = function (req, res) {
    res.json(req.changeReq);
};


/**
 * Update Change Request
 */

exports.update = function (req, res){
    var changeReq = req.changeReq;
    changeReq.modifiedBy=req.user;
    changeReq.modifiedOn=Date.now();
    // Merge existing ChangeRequest
    changeReq = _.extend(changeReq, req.body);
    changeReq.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(changeReq);
        }
    });
};

/**
 * List Change Request for a specific project
 */

exports.listCR = function (req, res){
    var projectId = req.body.projectId;
    ChangeRequest.find({projectId:projectId})
        .sort({createdOn:-1})
        .exec(function (err, changeRequests) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.json(changeRequests);
            }
        });
};

/**
 * Delete Change Request
 */
exports.delete = function (req, res) {
    var changeReq = req.changeReq;
    changeReq.remove(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(changeReq);
        }
    });
};


/**
 * ChangeRequest middleware
 */
exports.crByID = function (req, res, next, id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({
            message: 'Change Request is invalid'
        });
    }

    ChangeRequest.findById(id).exec(function (err, changeReq) {
        if (err) {
            return next(err);
        } else if (!changeReq) {
            return res.status(404).send({
                message: 'No Change Request with that identifier has been found'
            });
        }
        req.changeReq = changeReq;
        next();
    });
};
