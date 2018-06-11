/**
 * Created by Rajesh on 6/8/2018.
 */
'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    path = require('path'),
    mongoose = require('mongoose'),
    Efforts = mongoose.model('Efforts'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create an Effort
 */
exports.create = function (req, res) {
    var effort = new Efforts(req.body);
    effort.createdBy=req.user;
    effort.createdOn=Date.now();
    effort.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(effort);
        }
    });
};

/**
 * Show the current Effort detail
 */
exports.read = function (req, res) {
    var effort = req.effort;
    res.json(req.effort);
};

/**
 * Update existing efforts
 */

exports.update = function (req, res){
    var effort = req.effort;
    effort.modifiedBy=req.user;
    effort.modifiedOn=Date.now();
    // Merge existing Estimates
    effort = _.extend(effort, req.body);
    effort.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(effort);
        }
    });
};

/**
 * Delete Efforts
 */
exports.delete = function (req, res) {
    var effort = req.effort;
    effort.remove(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(effort);
        }
    });
};

/**
 * Efforts middleware
 */
exports.effortByID = function (req, res, next, id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({
            message: 'Effort is invalid'
        });
    }

    Efforts.findById(id).exec(function (err, effort) {
        if (err) {
            return next(err);
        } else if (!effort) {
            return res.status(404).send({
                message: 'No Effort with that identifier has been found'
            });
        }
        req.effort = effort;
        next();
    });
};

/**
 * List Efforts associated with specific project
 */

exports.listEfforts = function (req, res){
    var pmtId = req.body.pmtId,
        projectId = req.body.projectId,
        complexity = req.body.complexity,
        estimateId = req.body.estimateId,
        detsDDE = req.body.detsDDE,
        tfaDDE = req.body.tfaDDE;

    Efforts.find({prismId: pmtId})
        .exec(function (err, efforts) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                var monthList=[
                    {key:0, value: 'JAN'},
                    {key:1, value: 'FEB'},
                    {key:2, value: 'MAR'},
                    {key:3, value: 'APR'},
                    {key:4, value: 'MAY'},
                    {key:5, value: 'JUN'},
                    {key:6, value: 'JUL'},
                    {key:7, value: 'AUG'},
                    {key:8, value: 'SEP'},
                    {key:9, value: 'OCT'},
                    {key:10, value: 'NOV'},
                    {key:11, value: 'DEC'},
                ];
                var defaultEffortByComplexity = [
                    {complexity: 'Easy', effort: 100, role:'DETS'},
                    {complexity: 'Moderate', effort: 250, role:'DETS'},
                    {complexity: 'Difficult', effort: 540, role:'DETS'},
                    {complexity: 'Complex', effort: 800, role:'DETS'},
                    {complexity: 'Easy', effort: 250, role:'TFA'},
                    {complexity: 'Moderate', effort: 450, role:'TFA'},
                    {complexity: 'Difficult', effort: 800, role:'TFA'},
                    {complexity: 'Complex', effort: 1400, role:'TFA'},
                ];
                var responseObj ={};
                var trackEfforts=[];// Response to return to client
                var groupByMonth=_.groupBy(efforts, 'month');
                var effortsSummary={
                    totalDDEHoursBurn: 0,// Sum of all resources efforts till date
                    totalDETSHoursBurn: 0,// Sum up all DETS efforts till date
                    totalTFAHoursBurn: 0,// Sum up all TFA efforts till date
                    remainingDDEHours: 0, // (DDE Hours - Sum of all resources efforts till date) (teamHours- totalDDEHoursBurn)
                    remainingDETSHours: 0,// (Original DETS DDE Hours - Sum up all DETS efforts till date)
                    remainingTFAHours: 0,// (Original TFA DDE Hours - Sum up all TFA efforts till date)
                    originalDDEHours:0
                };
                _.forEach(groupByMonth,function(value, key){// value arg here is an array obj (monthly efforts)
                    var monthEffortObj={};//Get added to response object
                    var monthArr=key.split('/');
                    monthEffortObj.year=monthArr[0];
                    monthEffortObj.month= monthList.find(function(mon){
                       return (mon.key === parseInt(monthArr[1]-1));
                    });
                    var monthEffortGroupByRole= _.groupBy(value,'role');// value arg here is an array obj (monthly efforts per role)
                    var detsEffortForMonth=[];
                    var tfaEffortForMonth =[];
                    monthEffortObj.resources ={};
                    monthEffortObj.resources.dets=detsEffortForMonth;
                    monthEffortObj.resources.tfa=tfaEffortForMonth;
                    _.forEach(monthEffortGroupByRole, function(efforts, roleKey){
                        _.forEach(efforts, function(effort, index){//Iterate the monthly efforts of resources associated to specific role (DETS, TFA)
                            var resourceEffort={};
                            resourceEffort.person= effort.firstName+ ' ' + effort.lastName;
                            resourceEffort.actualEfforts = effort.hours;
                            resourceEffort.attUID = effort.attUID;
                            if(roleKey === 'DETS'){
                                effortsSummary.totalDETSHoursBurn+=parseFloat(effort.hours);
                                detsEffortForMonth.push(resourceEffort);
                            }
                            if(roleKey === 'TFA'){
                                effortsSummary.totalTFAHoursBurn += parseFloat(effort.hours);
                                tfaEffortForMonth.push(resourceEffort);
                            }
                        });
                    });
                    trackEfforts.push(monthEffortObj);//Adding each month effort into response object
                });

                //Effort Summary calculation
                var defaultDETSDDE= 0,
                    defaultTFADDE= 0,
                    ddeEffort =0;

                if(complexity === null || complexity==='' || complexity===undefined) complexity = 'MODERATE';
                var findDETSEffort = defaultEffortByComplexity.find(function(obj){
                    return (obj.role=== 'DETS' && obj.complexity=== complexity);
                })
                defaultDETSDDE=findDETSEffort.effort;

                var findTFAEffort = defaultEffortByComplexity.find(function(obj){
                    return (obj.role=== 'TFA' && obj.complexity=== complexity);
                })
                defaultTFADDE =findTFAEffort.effort;

                var detsEffortOriginal = (detsDDE=== null || detsDDE==='' || detsDDE === undefined)?defaultDETSDDE:detsDDE;
                var tfaEffortOriginal = (tfaDDE=== null || tfaDDE==='' || tfaDDE === undefined)?defaultTFADDE:tfaDDE;
                var ddeExists = (detsDDE=== null || detsDDE==='' || detsDDE === undefined || tfaDDE=== null || tfaDDE==='' || tfaDDE === undefined)?false:true;

                ddeEffort = parseInt(detsEffortOriginal) + parseInt(tfaEffortOriginal);

                effortsSummary.totalDDEHoursBurn = parseFloat(effortsSummary.totalDETSHoursBurn) + parseFloat(effortsSummary.totalTFAHoursBurn);
                effortsSummary.remainingDDEHours = parseFloat(ddeEffort) - parseFloat(effortsSummary.totalDDEHoursBurn);
                effortsSummary.remainingDETSHours = parseFloat(detsEffortOriginal) - parseFloat(effortsSummary.totalDETSHoursBurn);
                effortsSummary.remainingTFAHours = parseFloat(tfaEffortOriginal) - parseFloat(effortsSummary.totalTFAHoursBurn);
                effortsSummary.originalDDEHours = ddeEffort;
                effortsSummary.originalDETSHours = detsEffortOriginal;
                effortsSummary.originalTFAHours = tfaEffortOriginal;

                //Construct response object to return
                responseObj.trackEfforts= trackEfforts;
                responseObj.effortsSummary =effortsSummary;
                responseObj.ddeExists=ddeExists;
                res.json(responseObj);
            }
        });
};
