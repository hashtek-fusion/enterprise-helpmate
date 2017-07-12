/**
 * Created by Rajesh on 6/8/2017.
 */
'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    mongoose = require('mongoose'),
    Project = mongoose.model('Project'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Search project based on filter Criteria
 */
exports.filterProjects = function (req, res) {
    var pmtId= req.body.pmtId,
        complexity=req.body.complexity,
        projStatus=req.body.status,
        release=req.body.release,
        impApp=req.body.impactedApplication,
        solStat=req.body.solutionStatus;

    var query= Project.find();
    if(req.body.pmtId!==null) query.where('pmtId').equals(req.body.pmtId);
    if(req.body.complexity!==null) query.where('complexity.key').equals(req.body.complexity);
    if(req.body.status!==null) query.where('status.key').equals(req.body.status);
    if(req.body.release!==null) query.where('release').equals(req.body.release);
    if(req.body.impactedApplication!==null) query.where('impactedApplication.value').equals(req.body.impactedApplication);
    if(req.body.solutionStatus!==null) query.where('aisDetail.solutionStatus.key').equals(req.body.solutionStatus);

    query.select('-impactedWorkstreams -additionalNotes -hldDetail -riskAndIssues -estimates -dependencies')
        .sort({createdOn:-1})
        .exec(function(err, projects){
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.json(projects);
            }
        });
};

exports.listMyProjects = function (req, res) {
    var architect= req.body.detsArchitect;
    var limit = 5;
    if(req.body.limit) limit= 500;
    Project.find({'roles.detsArchitect':{$elemMatch:{key:architect}},'status.key':'ACTIVE'}).select('-impactedWorkstreams -additionalNotes -riskAndIssues -estimates -dependencies')
        .sort({createdOn:-1})
        .limit(limit)
        .exec(function (err, projects) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.json(projects);
            }
        });
};

exports.summaryReportBySolution = function  (req, res){ // Report summary based on complexity of the project & respective release
    var solStatus=req.body.status;
    Project.aggregate([
        {
            $match:{
                'status.key': 'ACTIVE',
                'aisDetail.solutionStatus.key': solStatus
            }

        },
        {
            $group:{
                _id: {impactedApplication:'$impactedApplication.value'},
                count: {$sum: 1}
            }
        }
    ],function(err,projects){
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            var toReturn={};
            var statusSummary=[];
            var totalCount=0;
            projects.forEach(function(project, index){
                statusSummary[index]={application:project._id.impactedApplication, count:project.count};
                totalCount+=project.count;
            });
            toReturn.summary=statusSummary;
            toReturn.totalCount=totalCount;
            res.json(toReturn);
        }
    } );
};

exports.summaryReportByStatus = function  (req, res){ // Report summary based on complexity of the project & respective release
    Project.aggregate([
        {
            $match:{
                'status.key': 'ACTIVE'
            }
        },
        {
            $group:{
                _id: {impactedApplication:'$impactedApplication.value'},
                count: {$sum: 1}
            }
        }
    ],function(err,projects){
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            var toReturn={};
            var statusSummary=[];
            var totalCount=0;
            projects.forEach(function(project, index){
                statusSummary[index]={application:project._id.impactedApplication, count:project.count};
                totalCount+=project.count;
            });
            toReturn.summary=statusSummary;
            toReturn.totalCount=totalCount;
            res.json(toReturn);
        }
    } );
};

exports.summaryReportByComplexity = function  (req, res){ // Report summary based on complexity of the project & respective release
    Project.aggregate([
        {
            $match:{
                'status.key': 'ACTIVE'
            }
        },
        {
            $group:{
                _id: {projectRelease:'$release' ,projectComplexity:'$complexity.key'},
                count: {$sum: 1}
            }
        }
    ],function(err,projects){
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(projects);
        }
    } );
};

exports.summaryReportBySolutionStatus = function  (req, res){ // Report summary based on AIS Solution status
    Project.aggregate([
        {
            $match:{
                'status.key': 'ACTIVE'
            }
        },
        {
            $group:{
                _id: {solutionStatus:'$aisDetail.solutionStatus.key'},
                count: {$sum: 1}
            }
        }
    ],function(err,projects){
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(projects);
        }
    } );
};

exports.summaryReportByResource = function  (req, res){//Report summary based on complexity of the project & respective release for each architect and architect load
    var architect= req.param('architect');
    Project.aggregate([
        {
            $match:{
                'status.key': 'ACTIVE'
            }
        },
        {$unwind:'$roles.detsArchitect' },
        {
            $group:{
                _id: {architect:'$roles.detsArchitect.key'},
                count: {$sum: 1}
            }
        }
    ],function(err,projects){
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(projects);
        }
    } );
};
