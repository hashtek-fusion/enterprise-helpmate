/**
 * Created by Rajesh on 11/02/2017.
 */
'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash');
var path = require('path'),
    fs = require('fs'),
    config = require(path.resolve('./config/config')),
    request = require('request'),
    async= require('async'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));


/**
 * Get Project List from DSP platform
 */
exports.getDSPProjectList = function(req, res){
    var dspAPIBase = config.dspAPIBaseURL;
    var projectListURL = dspAPIBase + '/getFilterWorkRequestData';
    var options = {
        url: projectListURL,
        method:'POST',
        headers: {
            'content-type': 'application/json'
        },
        body:JSON.stringify({arch: "'-1'", coarch: "'-1'", worktype: '-1', status: '1', program: "'-1'"})
    };
    request(options,function(err, response){
        if(!err){
            fs.writeFile(config.dspProjectsPath +'dsp_projects.json',Buffer.from(response.body), function(error){
                if (error) {
                    return res.status(400).send({
                        message: 'Error occurred while fetching list of projects from DSP platform'
                    });
                } else {
                    var obj=JSON.parse(response.body);
                    console.log(obj.projectCount);
                    return res.status(200).send({messsage: 'DSP Projects ' +obj.projectCount +' and work request ' + obj.workRequestCount + ' retrieved and written as JSON file successfully..'});
                }
            });
        }else{
            return res.status(400).send({
                message: 'Error occurred while fetching list of projects from DSP platform'
            });
        }
    });
};

/**
 * Get Project detail from Digital Solution Platform
 */
exports.getDSPProjectDetail = function(req, res){
    var projId= req.body.pmtId,
        userId= req.body.userId;
    request(config.dspAPIBaseURL +'/searchDspProjects?searchString='+projId+'&attuid='+userId+'&searchIdOnly=false', function(err, response){//Search the DSP platform with Project Id
       if(!err){
           var projectBasicInfo= JSON.parse(response.body);
           var aisId=(projectBasicInfo === undefined || projectBasicInfo.length===0 ?'':projectBasicInfo[0].aisID);
           if(aisId===''){
               return res.status(400).send({
                   message: 'This Project not available in DSP Platform',code:40000
               });
           }
           var options = {
               url: config.dspAPIBaseURL + '/getATOSolutionData?aisID='+aisId+'&userId='+userId,
               method:'GET',
               headers: {
                   'content-type': 'application/json'
               }
           };
           request(options, function(err, response){ // Retrieve the Project Solution Detail from DSP platform
               if(!err){
                   var resp=JSON.parse(response.body);
                   var obj= resp.atoSolDataList[0];
                   console.log(obj.targetRelease);
                   var relFormat=(obj.targetRelease!=='' && obj.targetRelease!== undefined)?obj.targetRelease.substr(2,2)+obj.targetRelease.substr(5,2):'';
                   var project={
                       pmtId: obj.projectId,
                       description: obj.workDescription,
                       projectName: obj.projectName,
                       aisID: obj.aisID,
                       currentPhase: obj.phaseId,
                       mdeEstimate: obj.mdeEstimate,
                       tsm: (obj.tsm!==undefined && obj.tsm.length > 0 ? obj.tsm[0].fullName:''),
                       leadArchitect: (obj.leadArch!==undefined && obj.leadArch.length >0? obj.leadArch[0].fullName:''),
                       release: relFormat,
                       program: obj.initiativeProgram,
                       sponsoringBU: obj.sponsoringBU,
                       solutionDetails: obj.solutionDetails,
                       solutionOverview: obj.solutionOverview
                   };
                   res.json(project);
               }else{
                   return res.status(400).send({
                       message: 'Error occurred while fetching project detail from DSP platform. Try Later',code:40001
                   });
               }
           });
       }else{
           return res.status(400).send({
               message: 'Error occurred while fetching project detail from DSP platform, Try Later', code:40001
           });
       }

    });
};

/**
 * Get Project detail from Digital Solution Platform with multiple calls
 */
exports.getDSPProjectDetailAsync = function (req, res){
    var projId= req.body.pmtId,
        userId= req.body.userId;
    request(config.dspAPIBaseURL +'/searchDspProjects?searchString='+projId+'&attuid='+userId+'&searchIdOnly=false', function(err, response) {//Search the DSP platform with Project Id
        if(!err){
            var projectBasicInfo= JSON.parse(response.body);
            var aisId=(projectBasicInfo === undefined || projectBasicInfo.length===0 ?'':projectBasicInfo[0].aisID);
            if(aisId===''){
                return res.status(400).send({
                    message: 'This Project not available in DSP Platform',code:40000
                });
            }
            var solOptions = {
                url: config.dspAPIBaseURL + '/getATOSolutionData?aisID='+aisId+'&userId='+userId,
                method:'GET',
                headers: {
                    'content-type': 'application/json'
                }
            };
            var devImpactOptions = {
                url: config.dspAPIBaseURL + '/e2eMangement/getImpactedAppsDetails?aisId='+ aisId+'&impactType=11&removeMSComp=true&viewMode=0',
                method:'GET',
                headers: {
                    'content-type': 'application/json'
                }
            };
            var nonDevImpactOptions = {
                url: config.dspAPIBaseURL + '/e2eMangement/getImpactedAppsDetails?aisId='+ aisId+'&impactType=12&removeMSComp=true&viewMode=0',
                method:'GET',
                headers: {
                    'content-type': 'application/json'
                }
            };
            async.parallel([
                function(cb){
                    request(solOptions, function(err, response) { // Retrieve the Project Solution Detail from DSP platform
                        cb(err,response.body);
                    });
                },function(cb){
                    request(devImpactOptions, function(err, response) { // Retrieve the Project Solution Detail from DSP platform
                        cb(err,response.body);
                    });
                },function(cb){
                    request(nonDevImpactOptions, function(err, response) { // Retrieve the Project Solution Detail from DSP platform
                        cb(err,response.body);
                    });
                }
            ], function(err, results){
                if(!err){
                    var project={};
                    var response=results;
                    var solData = JSON.parse(response[0]);
                    var devImpactData = JSON.parse(response[1]);
                    var nonDevImpactData = JSON.parse(response[2]);
                    //Parsing Solution Data
                    var solObj= solData.atoSolDataList[0];
                    var relFormat=(solObj.targetRelease!=='' && solObj.targetRelease!== undefined)?solObj.targetRelease.substr(2,2)+solObj.targetRelease.substr(5,2):'';

                    var leadArchitects = solObj.leadArch;
                    var leadArchitectStr='';
                    leadArchitects.forEach(function (architect, index) {
                        if (index === 0)
                            leadArchitectStr+=(architect.fullName===null?architect.attUid:architect.fullName);
                        else
                            leadArchitectStr += ',' + (architect.fullName===null?architect.attUid:architect.fullName);
                    });

                    var coLeadArchitects = solObj.coLeadArch;
                    var coLeadArchitectStr='';
                    coLeadArchitects.forEach(function (arch, index) {
                        if (index === 0)
                            coLeadArchitectStr+=(arch.fullName===null?arch.attUid:arch.fullName);
                        else
                            coLeadArchitectStr += ',' + (arch.fullName===null?arch.attUid:arch.fullName);
                    });

                    if(coLeadArchitectStr!=='') leadArchitectStr += ';' + coLeadArchitectStr;

                    project={
                        pmtId: solObj.projectId,
                        description: solObj.workDescription,
                        projectName: solObj.projectName,
                        aisID: solObj.aisID,
                        currentPhase: solObj.phaseId,
                        mdeEstimate: solObj.mdeEstimate,
                        tsm: (solObj.tsm!==undefined && solObj.tsm.length > 0 ? solObj.tsm[0].fullName:''),
                        leadArchitect: leadArchitectStr,
                        release: relFormat,
                        program: solObj.initiativeProgram,
                        sponsoringBU: solObj.sponsoringBU,
                        solutionDetails: solObj.solutionDetails,
                        solutionOverview: solObj.solutionOverview,
                        impactNotes:'',
                        impactType:'',
                        excludeMDE:'',
                        loe:'',
                        msLoe:'',
                        vpmoOverview:'',
                        vpmoDetail:'',
                        devImpactApps:'',
                        nonDevImpactApps:''
                    };
                    //Parsing Development & Non-Dev Impact data for Business Center Application
                    var impactObj=_.find(devImpactData.impactedAppsList, {motsAppID:'23015'});//Filter out only Business Center impact
                    if(impactObj=== undefined) _.find(nonDevImpactData.impactedAppsList, {motsAppID:'23015'});

                    var devImpactApplications = devImpactData.impactedAppsList;
                    var devImpactAppsStr='<ul>';
                    devImpactApplications.forEach(function (app, index) {
                        devImpactAppsStr +='<ol>'+ app.appAcronym + ' (MOTS ID:' + app.motsAppID + ')</ol>';
                    });
                    devImpactAppsStr +='</ul>';
                    var nonDevImpactApplications = nonDevImpactData.impactedAppsList;
                    var nonDevImpactAppsStr='<ul>';
                    nonDevImpactApplications.forEach(function (ap, index) {
                        nonDevImpactAppsStr +='<ol>'+ ap.appAcronym + ' (MOTS ID:' + ap.motsAppID + ')</ol>';
                    });
                    nonDevImpactAppsStr +='</ul>';

                    if(impactObj!==undefined){//Set these values only in case of Business Center got impacted by the project
                        project.impactNotes=impactObj.impactNotes;
                        project.impactType=impactObj.impactType;
                        project.loe=impactObj.loe;
                        project.msLoe=impactObj.msLoe;
                        project.excludeMDE=impactObj.excludeMDE;
                        project.vpmoOverview=impactObj.vpmoOverview;
                        project.vpmoDetail=impactObj.vpmoDetail;
                        project.devImpactApps =devImpactAppsStr;
                        project.nonDevImpactApps=nonDevImpactAppsStr;
                    }
                    res.json(project);
                }else{
                    return res.status(400).send({
                        message: 'Error occurred while fetching project detail from DSP platform, Try Later', code:40001
                    });
                }
            });

        }else{
            return res.status(400).send({
                message: 'Error occurred while fetching project detail from DSP platform, Try Later', code:40001
            });
        }
    });
};
