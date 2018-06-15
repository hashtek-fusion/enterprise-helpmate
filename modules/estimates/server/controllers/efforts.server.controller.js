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
                                var resourceExists= detsEffortForMonth.find(function(res){
                                    return(res.attUID===effort.attUID);
                                });
                                if(resourceExists === undefined) detsEffortForMonth.push(resourceEffort);
                                else{
                                    resourceExists.actualEfforts=parseFloat(resourceExists.actualEfforts)+parseFloat(effort.hours);
                                }
                            }
                            if(roleKey === 'TFA'){
                                effortsSummary.totalTFAHoursBurn += parseFloat(effort.hours);
                                var tfaResourceExists= tfaEffortForMonth.find(function(res){
                                    return(res.attUID===effort.attUID);
                                });
                                if(tfaResourceExists === undefined)  tfaEffortForMonth.push(resourceEffort);
                                else{
                                    tfaResourceExists.actualEfforts=parseFloat(tfaResourceExists.actualEfforts)+parseFloat(effort.hours);
                                }
                            }
                        });
                    });
                    trackEfforts.push(monthEffortObj);//Adding each month effort into response object
                });

                //Effort Summary calculation
                var defaultDETSDDE= 0,
                    defaultTFADDE= 0,
                    ddeEffort =0;

                if(complexity === null || complexity==='' || complexity===undefined) complexity = 'Moderate';
                var findDETSEffort = defaultEffortByComplexity.find(function(obj){
                    return (obj.role=== 'DETS' && obj.complexity=== complexity);
                });
                defaultDETSDDE=findDETSEffort.effort;

                var findTFAEffort = defaultEffortByComplexity.find(function(obj){
                    return (obj.role=== 'TFA' && obj.complexity=== complexity);
                });
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
                var effortExists = false;
                var chartLabels=[];
                var chartSeries=['DETS','TFA'];
                var chartData=[];
                var effortMonths=[];
                var detsTeamEfforts=[];
                var tfaTeamEfforts=[];
                if(trackEfforts.length > 0){
                    effortExists = true;
                    trackEfforts= _.sortBy(trackEfforts,function(o){
                        return o.year && o.month.key;
                    });
                    _.forEach(trackEfforts, function(effort, index){
                        var label= effort.month.value+'-'+ effort.year;
                        chartLabels.push(label);
                        effortMonths.push({key: label, value: label});
                        var detsEffort=0;
                        _.forEach(effort.resources.dets, function(res){
                            detsEffort+=parseFloat(res.actualEfforts);
                        });
                        detsTeamEfforts.push(detsEffort);
                        var tfaEffort=0;
                        _.forEach(effort.resources.tfa, function(res){
                            tfaEffort+=parseFloat(res.actualEfforts);
                        });
                        tfaTeamEfforts.push(tfaEffort);
                    });
                    chartData.push(detsTeamEfforts,tfaTeamEfforts);
                }
                responseObj.trackEfforts= trackEfforts;
                responseObj.effortsSummary =effortsSummary;
                responseObj.ddeExists=ddeExists;
                responseObj.effortExists = effortExists;
                responseObj.chartSeries = chartSeries;
                responseObj.chartLabels = chartLabels;
                responseObj.chartData = chartData;
                responseObj.effortMonths = effortMonths;
                res.json(responseObj);
            }
        });
};

/**
 * List Efforts associated with specific resource
 */
exports.listResourceEfforts = function (req, res){
    var userId = req.body.userId;
    Efforts.find({attUID: userId})
        .sort({createdOn:-1})
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
                var responseObj ={};
                var trackResourceEfforts=[];
                var effortExists = false;
                var NOT_PAID_PID='126739';//TO-DO:: change it to read from config file
                var SUSTAINMENT_PID='278973';//TO-DO:: change it to read from config file
                var groupByMonth=_.groupBy(efforts, 'month');
                _.forEach(groupByMonth,function(monthEfforts, key){
                    var monthEffortObj={};//Get added to response object
                    var monthArr=key.split('/');
                    var projectEfforts =0,
                        sustainmentEfforts =0,
                        notPaidEfforts=0;
                    monthEffortObj.year=monthArr[0];
                    monthEffortObj.month= monthList.find(function(mon){
                        return (mon.key === parseInt(monthArr[1]-1));
                    });
                    monthEffortObj.projects=[];
                    _.forEach(monthEfforts, function(effort, index){
                        var project={};
                        project.pmtId= effort.prismId;
                        project.hours= effort.hours;
                        project.title = effort.projectTitle;
                        project.workItem = effort.workItem;
                        project.application = effort.application;
                        project.department = effort.department;
                        var projectExists= monthEffortObj.projects.find(function(proj){
                            return(proj.pmtId===effort.prismId);
                        });
                        if(projectExists === undefined && effort.prismId!==NOT_PAID_PID && effort.prismId!==SUSTAINMENT_PID)  monthEffortObj.projects.push(project);//Only add the project efforts
                        if(projectExists){//Project already added into collection then update the project hours
                            projectExists.hours=parseFloat(projectExists.hours)+parseFloat(effort.hours);
                        }
                        if(effort.prismId!==NOT_PAID_PID && effort.prismId!==SUSTAINMENT_PID) projectEfforts+=parseFloat(effort.hours);
                        if(effort.prismId===NOT_PAID_PID) notPaidEfforts+=parseFloat(effort.hours);
                        if(effort.prismId===SUSTAINMENT_PID) sustainmentEfforts+=parseFloat(effort.hours);
                    });
                    monthEffortObj.projectEfforts = projectEfforts;
                    monthEffortObj.sustainmentEfforts = sustainmentEfforts;
                    monthEffortObj.notPaidEfforts = notPaidEfforts;
                    trackResourceEfforts.push(monthEffortObj);//Added monthly resource efforts
                });

                //Construct response object to return
                var projectEffortData=[];
                var sustainmentEffortData=[];
                var notPaidEffortData=[];
                var compareChartData=[];
                var compareChartSeries=['Project-Efforts','Sustainment-Efforts','Holiday/Furlough'];
                var chartLabels=[];
                var effortMonths=[];
                compareChartData.push(projectEffortData,sustainmentEffortData,notPaidEffortData);
                if(trackResourceEfforts.length > 0){
                    effortExists = true;
                    trackResourceEfforts= _.sortBy(trackResourceEfforts,function(o){
                        return o.year && o.month.key;
                    });
                    _.forEach(trackResourceEfforts, function(effort, index){
                        projectEffortData.push(effort.projectEfforts);
                        sustainmentEffortData.push(effort.sustainmentEfforts);
                        notPaidEffortData.push(effort.notPaidEfforts);
                        var label= effort.month.value+'-'+ effort.year;
                        chartLabels.push(label);
                        effortMonths.push({key: label, value: label});
                    });
                }
                responseObj.trackEfforts = trackResourceEfforts;
                responseObj.effortExists = effortExists;
                responseObj.compareChartData=compareChartData;
                responseObj.compareChartSeries=compareChartSeries;
                responseObj.chartLabels = chartLabels;
                responseObj.effortMonths = effortMonths;
                res.json(responseObj);
            }
        });
};
