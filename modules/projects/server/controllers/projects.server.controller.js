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
    versionHandler = require(path.resolve('./modules/version/server/controllers/version.server.controller')),
    ProjectConfiguration = mongoose.model('Configuration'),
    json2xls = require('json2xls'),
    format = require('string-template'),
    fs = require('fs'),
    config = require(path.resolve('./config/config')),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a Project
 */
exports.create = function (req, res) {
    var project = new Project(req.body);
    project.createdBy=req.user;
    project.createdOn=Date.now();
    project.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            versionHandler.createProjectHistory(project, req.user);
            res.json(project);
        }
    });
};

/**
 * Show the current project detail
 */
exports.read = function (req, res) {
    res.json(req.project);
};

/**
* List of Projects Overview
*/
exports.listProjectOverview = function (req, res) {
    Project.find({'status.key':{$nin:['CANCELLED','COMPLETED']}}).select('-impactedWorkstreams -additionalNotes -hldDetail -riskAndIssues -estimates -dependencies').sort({createdOn:-1}).exec(function (err, projects) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(projects);
        }
    });
};

/**
 * List of Archived Projects
 */
exports.listProjectArchive = function (req, res) {
    Project.find({'status.key':{$in:['CANCELLED','COMPLETED']}}).select('-impactedWorkstreams -additionalNotes -hldDetail -riskAndIssues -estimates -dependencies').sort({createdOn:-1}).exec(function (err, projects) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(projects);
        }
    });
};

/**
 * Delete Project
 */
exports.delete = function (req, res) {
    var project = req.project;

    project.remove(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(project);
        }
    });
};

/**
 * Update Project detail
 */
exports.update = function (req, res) {
    var project = req.project;
    project.modifiedBy=req.user;
    project.modifiedOn=Date.now();
    // Merge existing project
    project = _.extend(project, req.body);
    console.log('Status of the project (post merge):' + project.status.key + '|' + project.additionalNotes);
    project.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            versionHandler.addProjectVersion(project, req.user);
            res.json(project);
        }
    });
};


/**
 * Project middleware
 */
exports.projectByID = function (req, res, next, id) {

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({
            message: 'Project is invalid'
        });
    }

    Project.findById(id).exec(function (err, project) {
        if (err) {
            return next(err);
        } else if (!project) {
            return res.status(404).send({
                message: 'No project with that identifier has been found'
            });
        }
        req.project = project;
        next();
    });
};

exports.getMailTemplate = function (req, res) {
    var templateKey = req.param('key');
    var id = req.param('id');
    var compiledTemplate = {};
    ProjectConfiguration.findOne({configName: 'DETS'})
        .select('mailTemplates')
        .exec(function (err, config) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                var mailTemplates = config.mailTemplates;
                Project.findById(id)
                    .select('pmtId description roles.detsArchitect')
                    .exec(function (err, project) {
                        if (err) {
                            return res.status(400).send({
                                message: errorHandler.getErrorMessage(err)
                            });
                        } else {
                            var to = '';
                            var mailTpl =[];
                            mailTpl = mailTemplates.find(function (templ) {
                                return templ.key === templateKey;
                            });
                            var architects = project.roles.detsArchitect;
                            architects.forEach(function (architect, index) {
                                if (index === 0)
                                    to+=architect.key+'@'+mailTpl.content.domain;
                                else
                                    to += ';' + architect.key + '@'+ mailTpl.content.domain;
                            });
                            compiledTemplate.to = to;
                            compiledTemplate.subject = format(mailTpl.content.subject, {pmtId:project.pmtId });
                            compiledTemplate.from = mailTpl.content.from;
                            var link ='http://'+ req.headers.host + '/projects/'+project._id;
                            var desc=project.description;
                            if(desc!==null && desc.length > 1000) desc= desc.substr(0, 1000);
                            desc= desc.replace(/&/gi,'');
                            compiledTemplate.body = format(mailTpl.content.body,{description:desc , link: link,pmtId:project.pmtId });
                            compiledTemplate.domain = mailTpl.content.domain;
                            res.json(compiledTemplate);
                        }
                    });
            }
        });
};

/**
 * Get Project Configuration data
 */
exports.getProjectConfiguration = function  (req, res){
    var query= ProjectConfiguration.where({configName:'DETS'});
    query.findOne(function(err,config){
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(config);
        }
    });
};

exports.exportToExcel = function(req, res){
    Project.find().select('-estimates -dependencies').sort({createdOn:-1}).exec(function (err, projects) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            var projectReport=[];
            projects.forEach(function(proj){
                var architects = proj.roles.detsArchitect;
                var assignedArchitects='';
                architects.forEach(function (architect, index){
                    if(index===0)
                        assignedArchitects+=architect.value;
                    else
                        assignedArchitects+=','+architect.value;
                });
                var tempArr={
                    ProjectID: proj.pmtId,
                    Description: proj.description,
                    'Target Release': proj.release,
                    Status: proj.status.value,
                    'Impacted Application': proj.impactedApplication.value,
                    'DETS Architects':  assignedArchitects,
                    'Enterprise Architect': proj.roles.enterpriseArchitect,
                    'Lead Project Manager': proj.roles.lpm,
                    'Technology Solution Manager': proj.roles.tsm,
                    'Current AIS Phase': proj.aisDetail.currentPhase.value,
                    'Phase1 AIS Status': proj.aisDetail.phase1Status.value,
                    'Phase2 AIS Status': proj.aisDetail.phase2Status.value,
                    'AIS Solution Status': proj.aisDetail.solutionStatus.value,
                    'AIS Solution Aligned': proj.aisDetail.solutionAligned.value,
                    'Project Impact': proj.impact.value,
                    'Project Complexity': proj.complexity.value,
                    'Risk & Issues': proj.riskAndIssues.comments,
                    'Additional Notes': proj.additionalNotes

                };
                projectReport.push(tempArr);
            });
            res.xls('dets-projects-list.xlsx',projectReport);
        }
    });
};

/**
 * Upload HLD Document associated with project
 */
exports.uploadDocument = function (req, res) {
    var user = req.user;
    var message = null;
    console.log('Upload base path::' + config.uploadPath);
    var folderPath=config.uploadPath + req.body.application + '/'+ req.body.release + '/' + req.body.projectId + '/';
    console.log('Folder Path ::' + folderPath);
    if (user) {
        if(!fs.existsSync(path.join(config.uploadPath , req.body.application))){
            fs.mkdirSync(path.join(config.uploadPath , req.body.application));
        }
        if(!fs.existsSync(config.uploadPath + req.body.application + '/' + req.body.release )){
            fs.mkdirSync(config.uploadPath + req.body.application + '/' + req.body.release );
        }
        if(!fs.existsSync(folderPath)){
            fs.mkdirSync(folderPath);
        }
        fs.writeFile(folderPath + req.files.file.originalname, req.files.file.buffer, function (uploadError) {
            if (uploadError) {
                return res.status(400).send({
                    message: 'Error occurred while uploading document'
                });
            } else {
                return res.status(200).send({messsage: 'Document uploaded successfully..'});
            }
        });
    } else {
        res.status(400).send({
            message: 'User is not signed in'
        });
    }
};