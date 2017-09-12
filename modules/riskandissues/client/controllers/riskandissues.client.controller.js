/**
 * Created by Rajesh on 9/7/2017.
 */
'use strict';

//RiskAndIssues controller to manage estimates associated with a specific project
angular.module('riskAndIssues').controller('RiskAndIssuesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Issues', 'IssuesSvc', 'ConfigSvc','$state',
    function ($scope, $stateParams, $location, Authentication, Issues, IssuesSvc, ConfigSvc,$state) {

        $scope.authentication = Authentication;

        $scope.init = function (mode) {
            $scope.projectId = $stateParams.pmtId;
            var config = {};
            config = JSON.parse(angular.toJson(ConfigSvc.getProjectConfiguration()));
            $scope.issueStatus = config.issueStatus;
            $scope.issuePriority = config.priority;
            $scope.currentPhase = config.currentPhase;
            if (mode === 'MODIFY') {
                //set the default values for drop down
                $scope.selIssueStatus = $scope.issueStatus.find(function (stat) {
                    return stat.key === $scope.issueModel.issueStatus.key;
                });
                $scope.selIssuePriority = $scope.issuePriority.find(function (priority) {
                    return priority.key === $scope.issueModel.priority.key;
                });
                $scope.selCurrentPhase = $scope.currentPhase.find(function (phase) {
                   if($scope.issueModel.designPhase) return phase.key === $scope.issueModel.designPhase.key;
                });
            }
        };
        // Create new RiskAndIssue for a project
        $scope.create = function () {
            var designPhase ={};
            if(this.selCurrentPhase){
                designPhase.key = this.selCurrentPhase.key;
                designPhase.value=this.selCurrentPhase.value;
            }
            // Create new RiskAndIssue object
            var riskAndIssue = new Issues({
                projectId: $stateParams.projectId,
                pmtId:$stateParams.pmtId,//Auto populated field for metrics
                riskAndIssue: this.riskAndIssueDesc,
                raisedOn:this.raisedOn,
                raisedBy: this.raisedBy,
                resolution: this.resolution,
                closedOn: this.closedOn,
                reason: this.reason,
                comments: this.comments,
                issueStatus: {
                    key: this.selIssueStatus.key,
                    value: this.selIssueStatus.value
                },
                priority: {
                    key: this.selIssuePriority.key,
                    value: this.selIssuePriority.value
                },
                designPhase: {
                    key: designPhase.key,
                    value: designPhase.value
                },
                ownedBy: this.ownedBy,
                release: $stateParams.release//Auto populated field for metrics
            });

            // Redirect after save
            riskAndIssue.$save(function (response) {
                $location.path('projects/' + $stateParams.projectId);
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Find existing Risk and Issue
        $scope.findOne = function (mode) {
            $scope.showSpinner = true;
            $scope.issueModel = Issues.get({
                issueId: $stateParams.issueId
            }, function () {
                if($scope.issueModel.raisedOn) $scope.raisedOnDate = new Date( $scope.issueModel.raisedOn);
                else
                    $scope.raisedOnDate ='';
                if($scope.issueModel.closedOn) $scope.closedOnDate = new Date( $scope.issueModel.closedOn);
                else
                    $scope.closedOnDate ='';
                $scope.showSpinner = false;
                if (mode === 'EDIT')
                    $scope.init('MODIFY');
            });
        };

        // Update existing Risk & Issue associated with project
        $scope.update = function () {
            $scope.showSpinner = true;
            //Explicitly setting the modified date input fields
            $scope.issueModel.raisedOn=$scope.raisedOnDate;
            $scope.issueModel.closedOn=$scope.closedOnDate;
            //Explicitly setting the modified drop down values...
            $scope.issueModel.issueStatus = $scope.selIssueStatus;
            $scope.issueModel.priority = $scope.selIssuePriority;
            $scope.issueModel.designPhase = $scope.selCurrentPhase;
            $scope.issueModel.release = $stateParams.release;//Auto populated field for metrics
            $scope.issueModel.pmtId = $stateParams.pmtId;//Auto populated field for metrics
            var riskAndIssue = $scope.issueModel;
            riskAndIssue.$update(function () {
                $scope.showSpinner = false;
                $location.path('projects/' + riskAndIssue.projectId);
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        //List all Risk & Issues
        $scope.find = function(){
            $scope.showSpinner=true;
            if($stateParams.from==='dashboard'){
                IssuesSvc.filterIssues({release: $stateParams.release , from:'dashboard'})
                    .then(function(response){
                        $scope.appliedfilters=getFilterStrToDisplay();
                        $scope.filterCriteria = true;
                        $scope.issueModel = response.data;
                        $scope.orderByField='createdOn';
                        $scope.reverseSort = true;
                        $scope.showSpinner = false;
                    }, function(err){
                        console.log('Not able to retrieve Risk & Issues::' + err);
                    });
            }else{
                $scope.issueModel = Issues.query(function () {
                    $scope.orderByField='createdOn';
                    $scope.reverseSort = true;
                    $scope.showSpinner = false;
                    $scope.filterCriteria = false;
                });
            }
        };

        var getFilterStrToDisplay= function(){
            var str='|';
            if ($stateParams.pmtId!==null) str+=$stateParams.pmtId + '|';
            if ($stateParams.priority!==null) str+=$stateParams.priority + '|';
            if ($stateParams.status!==null) str+=$stateParams.status + '|';
            if ($stateParams.release!==null) str+=$stateParams.release + '|';

            return str;
        };

        //reload the list page to clear the filters applied
        $scope.reload= function(){
            $state.go($state.current, {from:null}, {reload: true});
        };
    }
]);
