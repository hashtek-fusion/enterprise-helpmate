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

/**
 * Estimates Excel report
 */
exports.exportEstimatesToExcel = function (req, res) {
    var complexity = req.param('complexity'),
        projStatus = req.param('status'),
        release = req.param('release'),
        impApp = req.param('impApp'),
        solStat = req.param('solStatus'),
        mode = req.param('mode'),
        architect = req.param('architect');

    var query = Estimates.find();
    query.where('estimates.estType.key').equals('MDE');
    query.sort({createdOn: -1})
        .populate({
            path: 'projectId',
            select: 'pmtId description release status roles impact impactedApplication complexity -_id'
        })
        .populate({
            path: 'createdBy',
            select: 'displayName -_id'
        })
        .populate({
            path: 'modifiedBy',
            select: 'displayName -_id'
        })
        .exec(function (err, estimates) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                var estimatesReport = [];
                estimates.forEach(function (estimate, index) {
                    var createdBy = estimate.createdBy ? estimate.createdBy.displayName : '';
                    var modifiedBy = estimate.modifiedBy ? estimate.modifiedBy.displayName : '';
                    var architects = estimate.projectId.roles.detsArchitect;
                    var assignedArchitects = '';
                    architects.forEach(function (architect, index) {
                        if (index === 0)
                            assignedArchitects += architect.value;
                        else
                            assignedArchitects += ',' + architect.value;
                    });
                    var workStreams = estimate.estimates.impactedWorkstreams;
                    var impactedWS='';
                    workStreams.forEach(function (ws, index){
                        if(index===0)
                            impactedWS+=ws.value;
                        else
                            impactedWS+=','+ws.value;
                    });
                    var tempArr = {
                        ProjectID: estimate.projectId.pmtId,
                        Description: estimate.projectId.description,
                        'Target Release': estimate.projectId.release,
                        Status: estimate.projectId.status.value,
                        'Impacted Application': estimate.projectId.impactedApplication.value,
                        'DETS Architects': assignedArchitects,
                        'Project Impact': estimate.projectId.impact.value,
                        'Estimation Type': estimate.estimates.estType.value,
                        'Estimated Hours': estimate.estimates.hours,
                        'Estimated Cost (in USD)': estimate.estimates.cost,
                        'Complexity when Estimate': estimate.estimates.complexity.value,
                        'DETS Architect - Sanity check on Estimate': estimate.estimates.sanityCheckOnEstimate,
                        'Is valid Estimate ': (estimate.estimates.sanityCheckOnEstimate==='NO')?'Yet to validate': estimate.estimates.estimateValid,
                        'Reason for deviation in estimate (if any)': estimate.estimates.reasonForEstimateFailure,
                        'Identified Workstream impacts': impactedWS,
                        'Estimate Assumptions': estimate.estimates.assumptions,
                        'Additional Notes': estimate.estimates.additionalNotes,
                        'Created By': createdBy,
                        'Last Modified By': modifiedBy,

                    };
                    estimatesReport.push(tempArr);
                });
                res.xls('dets-project-estimates-list.xlsx', estimatesReport);
            }
        });
};
