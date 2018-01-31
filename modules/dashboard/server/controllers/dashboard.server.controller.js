/**
 * Created by Rajesh on 6/8/2017.
 */
'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash');
var path = require('path'),
    mongoose = require('mongoose'),
    Project = mongoose.model('Project'),
    RiskAndIssues = mongoose.model('RiskAndIssues'),
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
    if(req.body.release!==null)  query.where('release').equals(parseInt(req.body.release));
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
    if(req.body.onHold) {
        Project.find({
            'roles.detsArchitect': {$elemMatch: {key: architect}},
            'status.key': {$nin: ['CANCELLED', 'COMPLETED', 'CLOSED', 'ON_HOLD']}
        }).select('-impactedWorkstreams -additionalNotes -riskAndIssues -estimates -dependencies')
            .sort({createdOn: -1})
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
    }else{
        Project.find({
            'roles.detsArchitect': {$elemMatch: {key: architect}},
            'status.key': {$nin: ['CANCELLED', 'COMPLETED', 'CLOSED']}
        }).select('-impactedWorkstreams -additionalNotes -riskAndIssues -estimates -dependencies')
            .sort({createdOn: -1})
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
    }
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
            $match:{ $and: [ { 'status.key': 'ACTIVE' }, { 'impactedApplication.value': { $ne: null } } ] }
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
                _id: {projectRelease:'$release',projectComplexity:'$complexity.key'},
                count: {$sum: 1}
            }
        },
        { $sort : { _id : 1} }

    ],function(err,projects){
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            //Response from DB get transformed as expected by chart UI element
            var obj=_.transform(projects, function(result, value, key){
                 result[parseInt(key)] = {release:parseInt(value._id.projectRelease),complexity: value._id.projectComplexity, count: value.count };
            });
            obj= _.groupBy(obj,'release');
            var labels=_.keys(obj),
             easy=_.fill(new Array(labels.length),0),
             moderate=_.fill(new Array(labels.length),0),
             difficult=_.fill(new Array(labels.length),0),
             complex=_.fill(new Array(labels.length),0);
             _.forEach(labels,function(val,index){
                 var tempArr=_.get(obj,val);
                 _.forEach(tempArr, function(value,key){
                    if(value.complexity==='EA') easy[index]+=value.count;
                     if(value.complexity==='MO') moderate[index]+=value.count;
                     if(value.complexity==='DI') difficult[index]+=value.count;
                     if(value.complexity==='CO') complex[index]+=value.count;
                 });
             });
            var returnObj={};
            returnObj.labels = labels;
            returnObj.data=[];
            returnObj.data.push(easy,moderate,difficult,complex);
            res.json(returnObj);
        }
    } );
};

exports.issueReportByPriority = function  (req, res){ // Report summary based on priority of the Risk & Issue for respective releases
    RiskAndIssues.aggregate([
        {
            $match:{
                'issueStatus.key': {$nin:['RESOLVED']}
            }
        },
        {
            $group:{
                _id: {projectRelease:'$release',projectPriority:'$priority.key'},
                count: {$sum: 1}
            }
        },
        { $sort : { _id : 1} }

    ],function(err,issues){
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            //Response from DB get transformed as expected by chart UI element
            var obj=_.transform(issues, function(result, value, key){
                result[parseInt(key)] = {release:parseInt(value._id.projectRelease),priority: value._id.projectPriority, count: value.count };
            });
            obj= _.groupBy(obj,'release');
            var labels=_.keys(obj),
                high=_.fill(new Array(labels.length),0),
                medium=_.fill(new Array(labels.length),0),
                low=_.fill(new Array(labels.length),0);
            _.forEach(labels,function(val,index){
                var tempArr=_.get(obj,val);
                _.forEach(tempArr, function(value,key){
                    if(value.priority==='HIGH') high[index]+=value.count;
                    if(value.priority==='MEDIUM') medium[index]+=value.count;
                    if(value.priority==='LOW') low[index]+=value.count;
                });
            });
            var returnObj={};
            returnObj.labels = labels;
            returnObj.data=[];
            returnObj.data.push(high,medium,low);
            res.json(returnObj);
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
                'status.key': {$nin:['CANCELLED','COMPLETED','CLOSED','ON_HOLD']}
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
