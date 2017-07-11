/**
 * Created by Rajesh on 7/3/2017.
 */
'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    path = require('path'),
    mongoose = require('mongoose'),
    Estimates = mongoose.model('Estimates'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create an estimate
 */
exports.create = function (req, res) {
    var estimate = new Estimates(req.body);
    estimate.createdBy=req.user;
    estimate.createdOn=Date.now();
    estimate.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(estimate);
        }
    });
};

/**
 * Show the current Estimate detail
 */
exports.read = function (req, res) {
    res.json(req.estimate);
};


/**
 * Update existing estimates
 */

exports.update = function (req, res){
    var estimate = req.estimate;
    estimate.modifiedBy=req.user;
    estimate.modifiedOn=Date.now();
    //Modify don't allow to change the estimation type field
    delete req.body.estimates.estType;
    // Merge existing Estimates
    estimate = _.extend(estimate, req.body);
    estimate.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(estimate);
        }
    });
};

/**
 * List estimates associated with specific project
 */

exports.listEstimates = function (req, res){
    var projectId = req.body.projectId;
    Estimates.find({projectId:projectId})
        .sort({createdOn:-1})
        .exec(function (err, estimates) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.json(estimates);
            }
        });
};

/**
 * Delete Estimates
 */
exports.delete = function (req, res) {
    var estimate = req.estimate;
    estimate.remove(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(estimate);
        }
    });
};


/**
 * ChangeRequest middleware
 */
exports.estimateByID = function (req, res, next, id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({
            message: 'Change Request is invalid'
        });
    }

    Estimates.findById(id).exec(function (err, estimate) {
        if (err) {
            return next(err);
        } else if (!estimate) {
            return res.status(404).send({
                message: 'No estimates with that identifier has been found'
            });
        }
        req.estimate = estimate;
        next();
    });
};
