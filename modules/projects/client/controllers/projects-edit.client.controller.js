/**
 * Created by Rajesh on 6/19/2018.
 */
'use strict';

// Projects Edit controller
angular.module('projects').controller('ProjectEditController', ['$scope', '$stateParams','Authentication', 'Projects', 'ConfigSvc','$state','project','$window','$location','$timeout',
    function ($scope, $stateParams, Authentication, Projects, ConfigSvc,$state, project, $window, $location, $timeout) {

        $scope.authentication = Authentication;
        $scope.project = project;//Setting the resolved project object retrieved from routes config
        $scope.showSpinner=true;
        //Configuring the dropdown values fetched from DB and set the already selected value of dropdown
        $scope.initConfig=function(){
            var config = {};
            //Scope variables to hold the dynamic form input parameters captured
            $scope.regTFATypes={};
            $scope.invTFATypes={};
            $scope.ordTFATypes={};
            $scope.premierTFATypes={};

            config = JSON.parse(angular.toJson(ConfigSvc.getProjectConfiguration()));
            $scope.assignedTFA = config.assignedTFA;
            $scope.assignedDMTFA = config.assignedDMTFA;

            $scope.ws={};//Holder for selected TFA architects from TAB SET control. This Object used to push the parent scope to tabset and access the child scope from there
            $scope.assignedRegTFA =$scope.assignedTFA.filter($scope.filterByRegWS);//Fiter the list of TFAs based on specific workstream
            $scope.ws.selTFAArchitect = $scope.assignedRegTFA.filter(function (arch) {
                for (var m = 0; m < $scope.project.roles.assignedTFA.length; m++) {
                    if (arch.key === $scope.project.roles.assignedTFA[m].key){
                        $scope.regTFATypes[arch.key]=($scope.project.roles.assignedTFA[m].primaryResource==='YES')?true:false;
                        return true;
                    }
                }
            });
            $scope.assignedOrdTFA =$scope.assignedTFA.filter($scope.filterByOrdWS);//Fiter the list of TFAs based on specific workstream
            $scope.ws.selOrdTFAArchitect = $scope.assignedOrdTFA.filter(function (arch) {//setting this to duplicate TFA based on Workstream
                for (var m = 0; m < $scope.project.roles.assignedTFA.length; m++) {
                    if (arch.key === $scope.project.roles.assignedTFA[m].key) {
                        $scope.ordTFATypes[arch.key]=($scope.project.roles.assignedTFA[m].primaryResource==='YES')?true:false;
                        return true;
                    }
                }
            });
            $scope.assignedInvTFA =$scope.assignedTFA.filter($scope.filterByInvWS);//Fiter the list of TFAs based on specific workstream
            $scope.ws.selInvTFAArchitect = $scope.assignedInvTFA.filter(function (arch) {//setting this to duplicate TFA based on Workstream
                for (var m = 0; m < $scope.project.roles.assignedTFA.length; m++) {
                    if (arch.key === $scope.project.roles.assignedTFA[m].key){
                        $scope.invTFATypes[arch.key]=($scope.project.roles.assignedTFA[m].primaryResource==='YES')?true:false;
                        return true;
                    }
                }
            });
            $scope.assignedPremierTFA =$scope.assignedTFA.filter($scope.filterByPremierWS);//Fiter the list of TFAs based on specific workstream
            $scope.ws.selPremierArchitect = $scope.assignedPremierTFA.filter(function (arch) {//setting this to duplicate TFA based on Workstream
                for (var m = 0; m < $scope.project.roles.assignedTFA.length; m++) {
                    if (arch.key === $scope.project.roles.assignedTFA[m].key){
                        $scope.premierTFATypes[arch.key]=($scope.project.roles.assignedTFA[m].primaryResource==='YES')?true:false;
                        return true;
                    }
                }
            });
            $scope.selDMTFAArchitect = $scope.assignedDMTFA.filter(function (arch) {
                for (var n = 0; n < $scope.project.roles.assignedDMTFA.length; n++) {
                    if (arch.key === $scope.project.roles.assignedDMTFA[n].key) return true;
                }
            });
        };
        $timeout(function () {//Delay the page load until get the project object from Route config resolve
            $scope.initConfig();
            $scope.showSpinner=false;
        }, 4000);
        $scope.filterByRegWS = function(architect){
            for(var i=0; i < architect.workstreams.length; i ++){
                return(architect.workstreams[i].key==='REG' || architect.workstreams[i].key==='DB');
            }
        };

        $scope.filterByOrdWS = function(architect){
            for(var i=0; i < architect.workstreams.length; i ++){
                return(architect.workstreams[i].key==='ORD' || architect.workstreams[i].key==='ORST' || architect.workstreams[i].key==='UP');
            }
        };

        $scope.filterByInvWS = function(architect){
            for(var i=0; i < architect.workstreams.length; i ++){
                return(architect.workstreams[i].key==='INV' || architect.workstreams[i].key==='TKT' || architect.workstreams[i].key==='REP');
            }
        };

        $scope.filterByPremierWS = function(architect){
            for(var i=0; i < architect.workstreams.length; i ++){
                return(architect.workstreams[i].key==='POS' || architect.workstreams[i].key==='POC' || architect.workstreams[i].key==='PCC' || architect.workstreams[i].key==='POB');
            }
        };

        $scope.setPrimaryProjectResource = function(){
            //Setting up the Registration TFA Primary Resource selection before update
            if($scope.ws.selTFAArchitect.length===1) $scope.ws.selTFAArchitect[0].primaryResource='YES';
            else{
                angular.forEach($scope.ws.selTFAArchitect, function(arch){
                    if($scope.regTFATypes[arch.key]!==undefined && $scope.regTFATypes[arch.key]=== true) {
                        arch.primaryResource='YES';
                    }else{
                        arch.primaryResource='NO';
                    }
                });
            }
            //Setting up the Inventory TFA Primary Resource selection before update
            if($scope.ws.selInvTFAArchitect.length===1) $scope.ws.selInvTFAArchitect[0].primaryResource='YES';
            else{
                angular.forEach($scope.ws.selInvTFAArchitect, function(arch){
                    if($scope.invTFATypes[arch.key]!==undefined && $scope.invTFATypes[arch.key]=== true) {
                        arch.primaryResource='YES';
                    }else{
                        arch.primaryResource='NO';
                    }
                });
            }
            //Setting up the Ordering TFA Primary Resource selection before update
            if($scope.ws.selOrdTFAArchitect.length===1) $scope.ws.selOrdTFAArchitect[0].primaryResource='YES';
            else{
                angular.forEach($scope.ws.selOrdTFAArchitect, function(arch){
                    if($scope.ordTFATypes[arch.key]!==undefined && $scope.ordTFATypes[arch.key]=== true) {
                        arch.primaryResource='YES';
                    }else{
                        arch.primaryResource='NO';
                    }
                });
            }
            //Setting up the Premier Interface Architect Primary Resource selection before update
            if($scope.ws.selPremierArchitect.length===1) $scope.ws.selPremierArchitect[0].primaryResource='YES';
            else{
                angular.forEach($scope.ws.selPremierArchitect, function(arch){
                    if($scope.premierTFATypes[arch.key]!==undefined && $scope.premierTFATypes[arch.key]=== true) {
                        arch.primaryResource='YES';
                    }else{
                        arch.primaryResource='NO';
                    }
                });
            }
        };

        // Update existing Project
        $scope.update = function () {
            $scope.showSpinner=true;
            var project = $scope.project;
            $scope.project.dataMapping.staticTest.plannedStartDate= $scope.stPlannedStartDate;
            $scope.project.dataMapping.staticTest.plannedEndDate = $scope.stPlannedEndDate;
            $scope.project.dataMapping.staticTest.actualStartDate = $scope.stActualStartDate;
            $scope.project.dataMapping.staticTest.actualEndDate = $scope.stActualEndDate;
            $scope.project.dataMapping.dynamicTest.plannedStartDate = $scope.dyPlannedStartDate;
            $scope.project.dataMapping.dynamicTest.plannedEndDate = $scope.dyPlannedEndDate;
            $scope.project.dataMapping.dynamicTest.actualStartDate = $scope.dyActualStartDate;
            $scope.project.dataMapping.dynamicTest.actualEndDate = $scope.dyActualEndDate;
            $scope.setPrimaryProjectResource();
            //concatenate selected TFA values from more than one work stream and set it in single field
            var workStreamTFAs=[];
            workStreamTFAs=workStreamTFAs.concat($scope.ws.selTFAArchitect,$scope.ws.selOrdTFAArchitect,$scope.ws.selInvTFAArchitect,$scope.ws.selPremierArchitect);
            $scope.project.roles.assignedTFA =workStreamTFAs;
            $scope.project.roles.assignedDMTFA = $scope.selDMTFAArchitect;
            project.$update(function () {
                $scope.showSpinner=false;
                $location.path('projects/' + project._id);
                var roles= $scope.authentication.user.roles;
                if(roles.indexOf('editor')!==-1) $scope.sendMail(project._id, 'MODIFY_PROJECT');
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.sendMail=function(id, mode){
            ConfigSvc.getMailTemplate({id:id , key: mode})
                .then(function(response){
                    var template=JSON.parse(angular.toJson(response.data));
                    var mailToString='mailto:'+ template.to+'?cc='+template.from +'&subject='+template.subject+'&body='+template.body;
                    $window.open(mailToString);
                });
        };
    }
]);
