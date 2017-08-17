/**
 * Created by Rajesh on 8/7/2017.
 */
'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash');
var path = require('path'),
    mongoose = require('mongoose'),
    Project = mongoose.model('Project'),
    ChangeRequest = mongoose.model('ChangeRequest'),
    Estimates = mongoose.model('Estimates'),
    ProjectConfiguration = mongoose.model('Configuration'),
    json2xls = require('json2xls'),
    XLSX = require('xlsx'),
    format = require('string-template'),
    fs = require('fs'),
    config = require(path.resolve('./config/config')),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

var validateProject = function(project){
    var errorCollection=[];
    var errObj={
        projectId: project.pmtId,
        errors: errorCollection
    };
    if(project.pmtId===null || project.pmtId==='' || project.pmtId=== undefined) errorCollection.push({errMsg:'Project Id can not be empty or null'});
    if(isNaN(project.release)) errorCollection.push({errmsg:'Project Release can not be a string value. It should be in Format YYMM'});
    if(errorCollection.length > 0)
        return errObj;
    else
        return null;
};

var constructProject = function(projects, req){
    var projectCollection=[];
    var errorCollection=[];
    projects.forEach(function(proj){//Constructing the object according to Mongoose model spec
        var tempObj={
            pmtId: proj.ProjectID,
            description: proj.Description,
            release: proj.Release,
            status: {key:'ACTIVE', value: 'Active'},
            impact: {key:'DEV', value: 'Development'},
            complexity: {key:'MO', value: 'Moderate'},
            roles:{
                enterpriseArchitect:proj.EnterpriseArchitect,
                tsm: proj.TechnologySolutionManager,
                lpm: proj.LeadProjectManager
            },
            aisDetail:{
                currentPhase :{key:'0', value:'Phase-0'},
                phase1Status: {key:'NA', value:'N/A'},
                phase2Status: {key:'NA', value:'N/A'},
                solutionStatus: {key:'NA', value:'N/A'},
                solutionAligned: {key:'NA', value:'N/A'}
            },
            additionalNotes: (proj.AdditionalNotes===undefined?'':proj.AdditionalNotes),
            riskAndIssues:{comments: (proj.RiskAndIssues===undefined?'':proj.RiskAndIssues)},
            createdOn: Date.now(),
            createdBy: req.user._id

        };
        var inValidProject=validateProject(tempObj);
        if(!inValidProject)
            projectCollection.push(tempObj);
        else
            errorCollection.push(inValidProject);
    });
    var toReturn={
        projects: projectCollection,
        errors: errorCollection
    };
    return toReturn;
};


var constructChangeRequest = function(changeRequests, project, req){
   var requestCollection =[];
    changeRequests.forEach(function(request){
        var tempObj={
            projectId: project._id,
            createdOn: Date.now(),
            createdBy: req.user,
            crNumber: request.CRNumber,
            description: request.Description,
            reason: {key:'MI', value: request.Reason},
            status: {key:'ACTIVE', value: request.Status},
            otherReason: request.OtherReason,
            additionalNotes: request.AdditionalNotes
        };
        requestCollection.push(tempObj);
    });
    return requestCollection;
};

//Bulk import projects from spreadsheet
exports.importProjects = function(req, res){
    var workbook = XLSX.read(req.files.file.buffer,{type:'buffer'});
    var first_sheet_name = workbook.SheetNames[0];
    var worksheet=workbook.Sheets[first_sheet_name];
    var projects=XLSX.utils.sheet_to_json(worksheet);
    var projectCollection=constructProject(projects, req);
    if(projectCollection.projects.length=== 0){
        var msg={};
        msg={
            result: 'No data available to import and/or fix the validation failures before import',
            errors: projectCollection.errors
        };
       res.json(msg);
    }else{
        Project.collection.insert(projectCollection.projects,{ ordered: false}, function(err, docs){
            if(docs){
                var msg={};
                if(docs.result && docs.insertedCount){
                    msg= {
                        result: 'Out of ' + projects.length + ' Projects ' + docs.insertedCount + ' of them imported successfully. No errors encountered during import',
                    };
                    res.json(msg);
                }else{
                    var writeErrors = docs.getWriteErrors();
                    writeErrors.forEach(function(errObj){//Merging application error and database errors
                        console.log(errObj);
                        var errArray=[];
                        errArray.push({errmsg: errObj.errmsg});
                        var err= {
                            projectId:errObj.getOperation().pmtId,
                            errors:errArray
                        };
                        projectCollection.errors.push(err);
                    });
                    msg= {
                        result: 'Out of ' + projects.length + ' Projects only ' + docs.nInserted + ' of them imported successfully.. Please fix the errors to import again',
                        errors: projectCollection.errors
                    };
                    res.json(msg);
                }
            }else{//Other errors
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
        });
    }
};

//Bulk import Change Requests from spreadsheet
exports.importRequests = function(req, res){
    var workbook = XLSX.read(req.files.file.buffer,{type:'buffer'});
    var first_sheet_name = workbook.SheetNames[0];
    var worksheet=workbook.Sheets[first_sheet_name];
    var requests=XLSX.utils.sheet_to_json(worksheet);
    Project.findOne({pmtId: first_sheet_name}).select('_id').exec(function(err, project){
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            if(project) {
                var requestCollection = constructChangeRequest(requests, project, req);
                ChangeRequest.collection.insert(requestCollection, {ordered: false}, function (err, docs) {
                    if (docs) {
                        var msg = {};
                        if (docs.result && docs.insertedCount) {
                            msg = {
                                result: 'Out of ' + requestCollection.length + ' Change Requests ' + docs.insertedCount + ' of them imported successfully. No errors encountered during import',
                                projectId: project._id,
                                pmtId:first_sheet_name
                            };
                            res.json(msg);
                        } else {
                            msg = {
                                result: 'Out of ' + requestCollection.length + ' Change Requests only ' + docs.nInserted + ' of them imported successfully.. Please fix the errors to import again',
                                projectId: project._id,
                                pmtId:first_sheet_name,
                                errors: docs.getWriteErrors()
                            };
                            res.json(msg);
                        }
                    } else {//Other errors
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    }
                });
            }else{
                return res.status(400).send({
                    message: 'No Project found to import the Change Requests. Please verify the project id'
                });
            }
        }
    });

};

//Bulk import Estimates from spreadsheet
exports.importEstimates = function(req, res){
    return res.status(500).send({
        message: 'Feature not implemented yet.'
    });
};
