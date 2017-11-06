/**
 * Created by Rajesh on 6/9/2017.
 */
'use strict';

// Projects controller
angular.module('projects').controller('ProjectsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Projects', 'ConfigSvc','$window','ChangeReqSvc','DashboardSvc','EstimatesSvc','IssuesSvc','DiscussionsSvc','FileUploader','$timeout','$state','$modal','$sce',
    function ($scope, $stateParams, $location, Authentication, Projects, ConfigSvc,$window,ChangeReqSvc,DashboardSvc,EstimatesSvc,IssuesSvc,DiscussionsSvc,FileUploader,$timeout,$state,$modal,$sce) {

        // Toggle the menu items for Side Navigation bar
        $scope.toggled = false;
        $scope.toggle = function () {
            $scope.toggled = !$scope.toggled;
        };
        $scope.authentication = Authentication;
        var initializeReportParams=function(){
            //Initialize Report Parameter Values
            $scope.repArchitect=null;
            $scope.repStatus=null;
            $scope.repRelease=null;
            $scope.repApplication=null;
            $scope.repComplexity=null;
            $scope.repSolStatus=null;
            $scope.repMode=null;
        };
        initializeReportParams();
        //Initialize the project form with configured value
        $scope.initProject = function (mode) {
            var config = {};
            //Configuring the dropdown values fetched from DB
            config = JSON.parse(angular.toJson(ConfigSvc.getProjectConfiguration()));
            $scope.projectStatus = config.status;
            $scope.impactedApplication = config.applications;
            $scope.projectImpact = config.projectImpact;
            $scope.complexity = config.complexity;
            $scope.workstream = config.workstream;
            $scope.detsArchitect = config.detsArchitect;
            $scope.currentPhase = config.currentPhase;
            $scope.phaseStatus = config.phaseStatus;
            $scope.solStatus = config.solutionStatus;
            $scope.solAligned = config.solutionAligned;
            $scope.supportedProducts = config.supportedProducts;
            if (mode === 'CREATE') {
                $scope.selWorkstream = [];
                $scope.selServices = [];
            }
            if (mode === 'MODIFY') {
                //set the default values for drop down
                $scope.selProjectStatus = $scope.projectStatus.find(function (proj) {
                    return proj.key === $scope.project.status.key;
                });
                $scope.selImpactedApplication = $scope.impactedApplication.find(function (proj) {
                    if($scope.project.impactedApplication) return proj.key === $scope.project.impactedApplication.key;
                });
                $scope.selProjectImpact = $scope.projectImpact.find(function (proj) {
                    if($scope.project.impact)return proj.key === $scope.project.impact.key;
                });
                $scope.selProjectComplexity = $scope.complexity.find(function (proj) {
                    if($scope.project.complexity)return proj.key === $scope.project.complexity.key;
                });
                $scope.selCurrentPhase = $scope.currentPhase.find(function (proj) {
                    if($scope.project.aisDetail && $scope.project.aisDetail.currentPhase)return proj.key === $scope.project.aisDetail.currentPhase.key;
                });
                $scope.selPhase1Status = $scope.phaseStatus.find(function (proj) {
                    return proj.key === $scope.project.aisDetail.phase1Status.key;
                });
                $scope.selPhase2Status = $scope.phaseStatus.find(function (proj) {
                    return proj.key === $scope.project.aisDetail.phase2Status.key;
                });
                $scope.selSolStatus = $scope.solStatus.find(function (proj) {
                    return proj.key === $scope.project.aisDetail.solutionStatus.key;
                });
                $scope.selSolAligned = $scope.solAligned.find(function (proj) {
                    return proj.key === $scope.project.aisDetail.solutionAligned.key;
                });
                $scope.selHldStatus = $scope.phaseStatus.find(function (proj) {
                    return proj.key === $scope.project.hldDetail.hldStatus.key;
                });
                //set the default values for multi-select dropdown
                $scope.selWorkstream = $scope.workstream.filter(function (ws) {
                    for (var i = 0; i < $scope.project.impactedWorkstreams.length; i++) {
                        if (ws.key === $scope.project.impactedWorkstreams[i].key) return true;
                    }
                });
                $scope.selDetsArchitect = $scope.detsArchitect.filter(function (arch) {
                    for (var j = 0; j < $scope.project.roles.detsArchitect.length; j++) {
                        if (arch.key === $scope.project.roles.detsArchitect[j].key) return true;
                    }
                });
                $scope.selServices = $scope.supportedProducts.filter(function (prod) {
                    for (var k = 0; k < $scope.project.supportedProducts.length; k++) {
                        if (prod.key === $scope.project.supportedProducts[k].key) return true;
                    }
                });
            }
        };

        $scope.clearFormValues = function () {
            // Clear form fields from the scope after project gets created
            $scope.pmtId = '';
            $scope.description = '';
            $scope.selProjectStatus = '';
            $scope.selImpactedApplication = '';
            $scope.selProjectImpact = '';
            $scope.release = '';
            $scope.dependencies = '';
            $scope.selWorkstream = '';
            $scope.selProjectComplexity = '';
            $scope.selDetsArchitect = '';
            $scope.enterpriseArchitect = '';
            $scope.tsm = '';
            $scope.lpm = '';
            $scope.tfa = '';
            $scope.selCurrentPhase = '';
            $scope.selPhase1Status = '';
            $scope.selPhase2Status = '';
            $scope.selSolStatus = '';
            $scope.selSolAligned = '';
            $scope.selHldStatus = '';
            $scope.hldDeliveredOn = '';
            $scope.riskAndIssues = '';
            $scope.addtlNotes = '';
            $scope.selServices = '';
        };
        // Create new Project
        $scope.create = function () {
            // Create new Project object
            var workstreams = [];
            for (var i = 0; i < $scope.selWorkstream.length; i++) {
                workstreams[i] = {key: $scope.selWorkstream[i].key, value: $scope.selWorkstream[i].value};
            }
            var architect = [];
            for (var j = 0; j < $scope.selDetsArchitect.length; j++) {
                architect[j] = {key: $scope.selDetsArchitect[j].key, value: $scope.selDetsArchitect[j].value};
            }
            var services = [];
            for (var k = 0; k < $scope.selServices.length; k++) {
                services[k] = {key: $scope.selServices[k].key, value: $scope.selServices[k].value};
            }
            var impactApp={};
            if(this.selImpactedApplication){
                impactApp.key = this.selImpactedApplication.key;
                impactApp.value=this.selImpactedApplication.value;
            }
            var projImpact ={};
            if(this.selProjectImpact){
                projImpact.key = this.selProjectImpact.key;
                projImpact.value=this.selProjectImpact.value;
            }
            var projComplexity ={};
            if(this.selProjectComplexity){
                projComplexity.key = this.selProjectComplexity.key;
                projComplexity.value=this.selProjectComplexity.value;
            }
            var curPhase ={};
            if(this.selCurrentPhase){
                curPhase.key = this.selCurrentPhase.key;
                curPhase.value=this.selCurrentPhase.value;
            }
            var phase1Status ={};
            if(this.selPhase1Status){
                phase1Status.key = this.selPhase1Status.key;
                phase1Status.value=this.selPhase1Status.value;
            }
            var phase2Status ={};
            if(this.selPhase2Status){
                phase2Status.key = this.selPhase2Status.key;
                phase2Status.value=this.selPhase2Status.value;
            }
            var solStatus ={};
            if(this.selSolStatus){
                solStatus.key = this.selSolStatus.key;
                solStatus.value=this.selSolStatus.value;
            }
            var solAligned ={};
            if(this.selSolAligned){
                solAligned.key = this.selSolAligned.key;
                solAligned.value=this.selSolAligned.value;
            }
            var hldStatus ={};
            if(this.selHldStatus){
                hldStatus.key = this.selHldStatus.key;
                hldStatus.value=this.selHldStatus.value;
            }

            var project = new Projects({
                pmtId: this.pmtId,
                description: this.description,
                status: {
                    key: this.selProjectStatus.key,
                    value: this.selProjectStatus.value
                },
                impactedApplication: {
                    key: impactApp.key,
                    value: impactApp.value
                },
                impact: {
                    key: projImpact.key,
                    value: projImpact.value
                },
                release: this.release,
                dependencies: this.dependencies,
                impactedWorkstreams: workstreams,
                supportedProducts: services,
                complexity: {
                    key: projComplexity.key,
                    value: projComplexity.value
                },
                roles: {
                    detsArchitect: architect,
                    enterpriseArchitect: this.enterpriseArchitect,
                    tsm: this.tsm,
                    lpm: this.lpm,
                    leadTFA: this.tfa
                },
                aisDetail: {
                    currentPhase: {
                        key: curPhase.key,
                        value: curPhase.value
                    },
                    phase1Status: {
                        key: phase1Status.key,
                        value: phase1Status.value
                    },
                    phase2Status: {
                        key: phase2Status.key,
                        value: phase2Status.value
                    },
                    solutionStatus: {
                        key: solStatus.key,
                        value: solStatus.value
                    },
                    solutionAligned: {
                        key: solAligned.key,
                        value:solAligned.value
                    }
                },
                hldDetail: {
                    hldStatus: {
                        key: hldStatus.key,
                        value: hldStatus.value
                    },
                    deliveredOn: this.hldDeliveredOn
                },
                additionalNotes: this.addtlNotes,
                riskAndIssues: {
                    raisedOn: Date.now(),
                    comments: this.riskAndIssues
                },
                fundedOrganization: this.fundedOrganization,
                initiativeProgram: this.initiativeProgram
            });

            // Redirect after save
            project.$save(function (response) {
                $location.path('projects/' + response._id);
                var roles= $scope.authentication.user.roles;
                if(roles.indexOf('editor')!==-1) $scope.sendMail(response._id, 'CREATE_PROJECT');
                $scope.clearFormValues();
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

        // Remove existing Project
        $scope.remove = function (project) {
            if (project) {
                project.$remove();

                for (var i in $scope.projects) {
                    if ($scope.projects[i] === project) {
                        $scope.projects.splice(i, 1);
                    }
                }
            } else {
                $scope.project.$remove(function () {
                    $location.path('projects');
                });
            }
        };

        //Update project object with modified values
        $scope.updateProjectDetail = function () {
            //console.log('Modified Project status:' + angular.toJson($scope.selProjectStatus));
            //Assigning Modified dropdown UI element values to Project model
            $scope.project.status = $scope.selProjectStatus;
            $scope.project.impactedApplication = $scope.selImpactedApplication;
            $scope.project.impact = $scope.selProjectImpact;
            $scope.project.complexity = $scope.selProjectComplexity;
            $scope.project.aisDetail.currentPhase = $scope.selCurrentPhase;
            $scope.project.aisDetail.phase1Status = $scope.selPhase1Status;
            $scope.project.aisDetail.phase2Status = $scope.selPhase2Status;
            $scope.project.aisDetail.solutionStatus = $scope.selSolStatus;
            $scope.project.aisDetail.solutionAligned = $scope.selSolAligned;
            $scope.project.hldDetail.hldStatus = $scope.selHldStatus;
            $scope.project.hldDetail.deliveredOn = $scope.hldDate;
            //multiple values
            $scope.project.impactedWorkstreams = $scope.selWorkstream;
            $scope.project.supportedProducts = $scope.selServices;
            $scope.project.roles.detsArchitect = $scope.selDetsArchitect;
        };

        // Update existing Project
        $scope.update = function () {
            $scope.showSpinner=true;
            var project = $scope.project;
            $scope.updateProjectDetail();
            project.$update(function () {
                $scope.showSpinner=false;
                $location.path('projects/' + project._id);
                var roles= $scope.authentication.user.roles;
                if(roles.indexOf('editor')!==-1) $scope.sendMail(project._id, 'MODIFY_PROJECT');
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Find a list of Projects
        $scope.find = function () {
            $scope.showSpinner=true;
            if($stateParams.from==='dashboard'){
                setReportParams('ACTIVE');
                if($stateParams.username){
                    DashboardSvc.listMyProjects({detsArchitect:$stateParams.username, limit:'NO'})
                        .then(function(response){
                            $scope.appliedfilters=getFilterStrToDisplay();
                            $scope.filterCriteria = true;
                            $scope.projects = response.data;
                            $scope.orderByField='createdOn';
                            $scope.reverseSort = true;
                            $scope.showSpinner = false;
                        },function(err){
                            console.log('Not able to retrieve my projects--' + err);
                        });
                }else{
                    setReportParams('ACTIVE');
                    DashboardSvc.filterProjects($stateParams)
                        .then(function(response){
                            $scope.appliedfilters=getFilterStrToDisplay();
                            $scope.filterCriteria = true;
                            $scope.projects = response.data;
                            $scope.orderByField='createdOn';
                            $scope.reverseSort = true;
                            $scope.showSpinner = false;
                        },function(err){
                            console.log('Not able to retrieve projects with filter criteria::' + err);
                        });
                }
            }else if($state.current.name==='archive') {
                setReportParams('ARCHIVE');
                    ConfigSvc.getProjectArchive()
                        .then(function(response){
                            $scope.archiveHeader=true;
                            $scope.projects = response.data;
                            $scope.orderByField='createdOn';
                            $scope.reverseSort = true;
                            $scope.showSpinner = false;
                        },function(err){
                            console.log('Not able to retrieve projects archive::' + err);
                        });
            }else if($state.current.name==='owner') {
                setReportParams('ACTIVE');
                DashboardSvc.listMyProjects({detsArchitect:$scope.authentication.user.username, limit:'NO'})
                    .then(function(response){
                        $scope.appliedfilters=getFilterStrToDisplay();
                        $scope.myProjectsHeader = true;
                        $scope.projects = response.data;
                        $scope.orderByField='createdOn';
                        $scope.reverseSort = true;
                        $scope.showSpinner = false;
                    },function(err){
                        console.log('Not able to retrieve projects archive::' + err);
                    });
            }else {
                setReportParams('ACTIVE');
                $scope.projects = Projects.query(function () {
                    $scope.filterCriteria = false;
                    $scope.archiveHeader=false;
                    $scope.orderByField='createdOn';
                    $scope.reverseSort = true;
                    $scope.showSpinner = false;
                });
            }
        };

        //List change requests associated with project
        $scope.listChangeRequest = function(){
            ChangeReqSvc.getListOfCRs({projectId:$stateParams.projectId})//Retrieve the change requests
                .then(function(response){
                    $scope.requests=response.data;
                },function(err){
                    console.log('Not able to retrieve change requests::' + err);
                });
        };

        //List various Estimates associated with project
        $scope.displayEstimates = function(){
            EstimatesSvc.getListOfEstimates({projectId:$stateParams.projectId})//Retrieve the estimates
                .then(function(response){
                    $scope.estimates=response.data;
                    var resp = JSON.parse(angular.toJson(response.data));
                    for (var i = 0; i < resp.length; i++) {
                        var obj = JSON.parse(angular.toJson(resp[i]));
                        if(obj.estimates.estType.key==='MDE'){
                            $scope.mdeExists = true;
                            $scope.mde = resp[i];
                        } else if(obj.estimates.estType.key==='DDE1'){
                            $scope.dde1Exists = true;
                            $scope.dde1=resp[i];
                        }else if(obj.estimates.estType.key==='DDE2'){
                            $scope.dde2Exists = true;
                            $scope.dde2=resp[i];
                        }
                    }
                },function(err){
                    console.log('Not able to retrieve estimates::' + err);
                });
        };

        //List Risk & Issues associated with project
        $scope.listRiskAndIssues = function(){
            IssuesSvc.getListOfIssues({projectId:$stateParams.projectId})//Retrieve the Risk & Issues
                .then(function(response){
                    $scope.riskAndIssuesList=response.data;
                },function(err){
                    console.log(err);
                });
        };
        // Find existing Projects
        $scope.findOne = function (mode) {
            if (mode === 'VIEW'){
                $scope.dde1Exists = false;
                $scope.dde2Exists = false;
                $scope.mdeExists = false;
            }
            $scope.showSpinner=true;
            $scope.listChangeRequest();
            $scope.displayEstimates();
            $scope.listRiskAndIssues();
            $scope.listDiscussions();
            $scope.project = Projects.get({
                projectId: $stateParams.projectId
            }, function () {
                if($scope.project.hldDetail.deliveredOn) $scope.hldDate = new Date( $scope.project.hldDetail.deliveredOn);
                else
                    $scope.hldDate ='';
                $scope.showSpinner=false;
                if (mode === 'VIEW') $scope.updateFromDSP('VIEW',$scope.project.pmtId);
                if (mode === 'EDIT')
                    $scope.initProject('MODIFY');
            });
        };

        // Create file uploader instance
        $scope.docUploader = new FileUploader({
            url: 'api/project/document/upload'
        });

        // Set file uploader document filter
        $scope.docUploader.filters.push({
            name: 'documentFilter',
            fn: function (item, options) {
                var type =  item.type.slice(item.type.lastIndexOf('/') + 1);
                var supportedFileTypes =['pdf','msword','vnd.ms-powerpoint','vnd.ms-excel',
                                        'vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                                        'vnd.openxmlformats-officedocument.wordprocessingml.document',
                                        'vnd.openxmlformats-officedocument.presentationml.presentation'];
                $scope.progressVisible= false;
                $scope.success = false;
                if(supportedFileTypes.indexOf(type)===-1) $scope.uploadError ='Unsupported Document type to upload';
                return supportedFileTypes.indexOf(type)!==-1;
            }
        });
        $scope.docUploader.filters.push({
            name: 'documentSizeFilter',
            fn: function (item, options) {
                var docSizeinMB=Math.floor(item.size/(1024*1024));
                $scope.progressVisible= false;
                $scope.success = false;
                if(docSizeinMB > 4) $scope.uploadError ='Document size greater than 5 MB not allowed';
                return docSizeinMB <=4;
            }
        });

        // Called after the user selected a document to upload
        $scope.docUploader.onAfterAddingFile = function (fileItem) {
            if ($window.FileReader) {
                var fileReader = new FileReader();
                fileReader.readAsDataURL(fileItem._file);
                $scope.uploadError ='';//Clear the validation error message
                $scope.progressVisible= false;
                fileReader.onload = function (fileReaderEvent) {
                    $timeout(function () {
                        $scope.docName = fileItem._file.name;
                    }, 0);
                };
            }
        };

        $scope.docUploader.onBeforeUploadItem= function(item){
           item.formData.push({projectId: $scope.project.pmtId});
           item.formData.push({release: $scope.project.release});
            item.formData.push({application: $scope.project.impactedApplication.value});
        };

        // Called after the user has successfully uploaded a new document
        $scope.docUploader.onSuccessItem = function (fileItem, response, status, headers) {
            // Show success message
            $scope.success = true;
            // Clear upload buttons
            $scope.cancelUpload();
            $state.go($state.current, {}, {reload: true});
        };

        // Called after the user has failed to uploaded a new document
        $scope.docUploader.onErrorItem = function (fileItem, response, status, headers) {
            // Clear upload buttons
            $scope.cancelUpload();
            $scope.progressVisible= false;
            // Show error message
            $scope.uploadError = response.message;
        };

        //File Upload Progress
        $scope.docUploader.onProgressItem = function(fileItem,progress){
            $scope.progress=progress;
        };

        // Upload HLD document
        $scope.uploadDocument = function () {
            // Clear messages
            $scope.success = $scope.error = null;
            // Start upload
            $scope.docUploader.uploadAll();
            $scope.progressVisible= true;
        };

        // Cancel the upload process
        $scope.cancelUpload = function () {
            $scope.docUploader.clearQueue();
            $scope.docName ='';
        };

        var getFilterStrToDisplay= function(){
            var str='|';
            if ($stateParams.displayname!==null) str+=$stateParams.displayname + '|';
            if ($stateParams.solutionStatus!==null) str+=$stateParams.solutionStatus + '|';
            if ($stateParams.status!==null) str+=$stateParams.status + '|';
            if ($stateParams.release!==null) str+=$stateParams.release + '|';
            if ($stateParams.impactedApplication!==null) str+=$stateParams.impactedApplication + '|';
            if ($state.current.name==='owner') str+=$scope.authentication.user.displayName + '|';
            return str;
        };

        var setReportParams=function(mode){
            //Set Report parameters to download filtered records in excel format
            $scope.repMode=mode;
            if ($stateParams.solutionStatus!==null) $scope.repSolStatus=$stateParams.solutionStatus;
            if ($stateParams.status!==null) $scope.repStatus=$stateParams.status;
            if ($stateParams.release!==null) $scope.repRelease=$stateParams.release;
            if ($stateParams.impactedApplication!==null) $scope.repApplication=$stateParams.impactedApplication;
            if ($state.current.name==='owner') $scope.repArchitect=$scope.authentication.user.username;
            if ($stateParams.displayname!==null) $scope.repArchitect=$stateParams.username;
        };

        //reload the list page to clear the filters applied
        $scope.reload= function(){
          $state.go($state.current, {from:null,solutionStatus:null,status:null,impactedApplication:null,release:null,displayname:null,username:null}, {reload: true});
        };

        //List Discussion Threads associated with project
        $scope.listDiscussions = function(){
            DiscussionsSvc.getListOfDiscussions({projectId:$stateParams.projectId})//Retrieve the Discussion threads
                .then(function(response){
                    $scope.discussions=response.data;
                },function(err){
                    console.log(err);
                });
        };

        $scope.open = function(){
            $scope.discussionMode='CREATE';
            var modalInstance = $modal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'modules/discussions/views/modal/manage-discussion.client.view.html',
                controller: 'ModalInstanceDiscussionCtrl',
                size: 'lg',
                scope:$scope
            });
            modalInstance.result.then(function (discussionId) {
                $location.path('discussions/' + discussionId);// Modal popup made changes and created the discussion thread
            },function(){
                console.log('Discussion thread creation canceled');
            });
        };

        $scope.updateFromDSP= function(mode, pmtId){//Get Project updates from Digital Solution Platform
            $scope.dspSuccess='';
            $scope.dspError='';
            $scope.showSpinner=true;
            ConfigSvc.getProjectUpdateFromDSP({pmtId: pmtId, userId:$scope.authentication.user.username})
                .then(function(response){
                    var dspProject=response.data;
                    if(mode==='EDIT'){
                        $scope.project.description = dspProject.projectName + '. ' + dspProject.description;
                        $scope.project.release=dspProject.release;
                        $scope.selCurrentPhase = $scope.currentPhase.find(function (proj){
                            if(parseInt(proj.key) === parseInt(dspProject.currentPhase)) return proj;
                        });
                        $scope.project.roles.enterpriseArchitect = dspProject.leadArchitect;
                        $scope.project.roles.tsm = dspProject.tsm;
                        $scope.project.initiativeProgram=dspProject.program;
                        $scope.project.fundedOrganization=dspProject.sponsoringBU;
                        $scope.dspStyle={'border-color':'blue'};
                    }else if(mode==='CREATE'){
                        $scope.description = dspProject.projectName + '. ' + dspProject.description;
                        $scope.release=dspProject.release;
                        $scope.enterpriseArchitect = dspProject.leadArchitect;
                        $scope.tsm = dspProject.tsm;
                        $scope.initiativeProgram=dspProject.program;
                        $scope.fundedOrganization=dspProject.sponsoringBU;
                        $scope.selCurrentPhase = $scope.currentPhase.find(function (proj){
                            if(parseInt(proj.key) === parseInt(dspProject.currentPhase)) return proj;
                        });
                        $scope.dspStyle={'border-color':'blue'};
                    }else if(mode==='VIEW'){
                        $scope.solutionDetails=$sce.trustAsHtml(dspProject.solutionDetails);
                        $scope.solutionOverview=$sce.trustAsHtml(dspProject.solutionOverview);
                    }
                    $scope.dspSuccess='Project detail synced from DSP platform. Validate the details & Click Add/Modify Project to keep the changes';
                    $scope.showSpinner=false;
                },function(err){
                    $scope.dspError=err.data!=null?err.data.message:'Error occurred while fetching project detail from DSP platform. Try Later';
                    $scope.showSpinner=false;
                });
        };
    }
]);
