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

//Bulk import projects from spreadsheet
exports.importProjects = function(req, res){
    return res.status(500).send({
        message: errorHandler.getErrorMessage({'err.code':500})
    });
};

//Bulk import Change Requests from spreadsheet
exports.importRequests = function(req, res){
    return res.status(500).send({
        message: errorHandler.getErrorMessage({'err.code':500})
    });
};

//Bulk import Estimates from spreadsheet
exports.importEstimates = function(req, res){
    return res.status(500).send({
        message: errorHandler.getErrorMessage({'err.code':500})
    });
};
