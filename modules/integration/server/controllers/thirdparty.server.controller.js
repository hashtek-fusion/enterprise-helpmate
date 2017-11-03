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
                   message: 'Project not available in DSP Platform'
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
                       message: 'Error occurred while fetching project detail from DSP platform'
                   });
               }
           });
       }else{
           return res.status(400).send({
               message: 'Project not available in DSP Platform'
           });
       }

    });
};
