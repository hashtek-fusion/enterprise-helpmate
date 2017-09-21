/**
 * Created by Rajesh on 9/7/2017.
 */
'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    path = require('path'),
    mongoose = require('mongoose'),
    RiskAndIssues = mongoose.model('RiskAndIssues'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create an Risk and Issue
 */
exports.create = function (req, res) {
    var riskAndIssue = new RiskAndIssues(req.body);
    riskAndIssue.createdBy=req.user;
    riskAndIssue.createdOn=Date.now();
    riskAndIssue.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(riskAndIssue);
        }
    });
};

/**
 * Show the current Risk and Issue detail
 */
exports.read = function (req, res) {
    res.json(req.riskAndIssue);
};


/**
 * Update existing Risk and Issue
 */

exports.update = function (req, res){
    var riskAndIssue = req.riskAndIssue;
    riskAndIssue.modifiedBy=req.user;
    riskAndIssue.modifiedOn=Date.now();
    // Merge existing RiskAndIssue
    riskAndIssue = _.extend(riskAndIssue, req.body);
    riskAndIssue.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(riskAndIssue);
        }
    });
};

/**
 * List RiskAndIssues associated with specific project
 */

exports.listRiskAndIssues = function (req, res){
    var projectId = req.body.projectId;
    console.log('Project Id passed::' + projectId);
    RiskAndIssues.find({projectId:projectId})
        .sort({createdOn:-1})
        .exec(function (err, riskAndIssues) {
            if (err) {
                console.log(err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.json(riskAndIssues);
            }
        });
};

/**
 * List RiskAndIssues across the releases
 */
exports.listAllRisksAndIssues = function (req, res){
    RiskAndIssues.find().select('-resolution -reason -comments -designPhase').sort({createdOn:-1}).exec(function (err, issues) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(issues);
        }
    });
};

/**
 * Delete RiskAndIssue
 */
exports.delete = function (req, res) {
    var riskAndIssue = req.riskAndIssue;
    riskAndIssue.remove(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(riskAndIssue);
        }
    });
};

/**
 * Search Risk & Issues based on filter Criteria
 */
exports.filterRiskAndIssues = function (req, res) {
    var release=req.body.release,
        pmtId = req.body.pmtId,
        status = req.body.status,
        priority = req.body.priority;
    var query= RiskAndIssues.find();
    if(pmtId!==null && pmtId!== undefined) query.where('pmtId').equals(pmtId);
    if(release!==null && release !== undefined)  query.where('release').equals(parseInt(release));
    if(status!==null && status !== undefined)  query.where('issueStatus.key').equals(status);
    if(priority!==null && priority !== undefined)  query.where('priority.key').equals(priority);
    if(req.body.from!==null && req.body.from==='dashboard')  query.where('issueStatus.key').in(['OPEN','IN_PROGRESS','BLOCKED']);
    query.select('-resolution -reason -comments -designPhase')
        .sort({createdOn:-1})
        .exec(function(err, issues){
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.json(issues);
            }
        });
};
/**
 * RiskAndIssue middleware
 */
exports.issueByID = function (req, res, next, id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({
            message: 'Risk and Issue is invalid'
        });
    }

    RiskAndIssues.findById(id).exec(function (err, riskAndIssue) {
        if (err) {
            return next(err);
        } else if (!riskAndIssue) {
            return res.status(404).send({
                message: 'No RiskandIssue with that identifier has been found'
            });
        }
        req.riskAndIssue = riskAndIssue;
        next();
    });
};
