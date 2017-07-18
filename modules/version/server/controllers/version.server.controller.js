/**
 * Created by Rajesh on 7/18/2017.
 */
'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash');
var path = require('path'),
    mongoose = require('mongoose'),
    ProjectHistory = mongoose.model('ProjectHistory'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

//Create Project history entry
var createProjectHistory = function(project, user){
    var history = new ProjectHistory();
    history.createdBy=user;
    history.createdOn=Date.now();
    history.pmtId=project.pmtId;
    history.versions.push(project);
    history.save(function (err) {
        if (err) {
            console.log('Error in creating project ' + project.pmtId + 'history :' + err);
        } else {
            console.log('Project' +project.pmtId+ 'history created.');
        }
    });
};

exports.createProjectHistory = function(project, user){
    createProjectHistory(project, user);
};

//Add Project version whenever project content get modified
exports.addProjectVersion = function(project, user){
    ProjectHistory.findOne({pmtId: project.pmtId})
        .exec(function(err, version){
            if(err){
                console.log('Not able to add project version into history collection:' + err);
            }else{
                var history = version;
                if(history){
                    history.modifiedBy=user;
                    history.modifiedOn=Date.now();
                    history.versions.push(project);
                    history.save(function (err) {
                        if (err) {
                            console.log('Error in adding new project ' + history.pmtId + 'version :' + err);
                        } else {
                            console.log('Project' +history.pmtId+ 'version created successfully');
                        }
                    });
                }else{//History not there for already created projects
                   createProjectHistory(project, user);
                }
            }
        });
};

//Expose it to UI layer to render the list of project versions specific to a project
exports.getProjectVersions = function (req, res){
    ProjectHistory.findOne({pmtId: req.body.pmtId})
        .select('versions')
        .exec(function(err, version){
            if(err){
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }else{
                res.json(version);
            }
        });
};
