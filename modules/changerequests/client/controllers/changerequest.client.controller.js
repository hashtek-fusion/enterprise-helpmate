/**
 * Created by Rajesh on 6/28/2017.
 */
'use strict';

//Change Request controller to manage change requests
angular.module('changeRequests').controller('ChangeRequestController', ['$scope', '$stateParams', '$location', 'Authentication', 'ChangeRequests', 'ChangeReqSvc', 'ConfigSvc',
    function ($scope, $stateParams, $location, Authentication, ChangeRequests, ChangeReqSvc, ConfigSvc) {

        $scope.authentication = Authentication;

        $scope.init = function (mode) {
            $scope.projectId = $stateParams.pmtId;
            var config = {};
            config = JSON.parse(angular.toJson(ConfigSvc.getProjectConfiguration()));
            $scope.reasons = config.changeRequestReasons;
            $scope.requestStatus = config.status;
            if (mode === 'MODIFY') {
                //set the default values for drop down
                $scope.selRequestStatus = $scope.requestStatus.find(function (req) {
                    return req.key === $scope.request.status.key;
                });
                $scope.selReason = $scope.reasons.find(function (reason) {
                    return reason.key === $scope.request.reason.key;
                });
            }
        };
        // Create new Change Request
        $scope.create = function () {
            // Create new Change Request object
            var changeReq = new ChangeRequests({
                crNumber: this.requestId,
                description: this.description,
                status: {
                    key: this.status.key,
                    value: this.status.value
                },
                reason: {
                    key: this.reason.key,
                    value: this.reason.value
                },
                otherReason: this.otherReason,
                additionalNotes: this.additionalNotes,
                projectId: $stateParams.projectId
            });

            // Redirect after save
            changeReq.$save(function (response) {
                $location.path('projects/' + $stateParams.projectId);
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Find existing Change Request
        $scope.findOne = function (mode) {
            $scope.showSpinner = true;
            $scope.request = ChangeRequests.get({
                changeReqId: $stateParams.changeReqId
            }, function () {
                $scope.showSpinner = false;
                if (mode === 'EDIT')
                    $scope.init('MODIFY');
            });
        };

        // Update existing Change Request
        $scope.update = function () {
            $scope.showSpinner = true;
            var changeRequest = $scope.request;
            //Explicitly setting the modified drop down values...
            $scope.request.status = $scope.selRequestStatus;
            $scope.request.reason = $scope.selReason;
            changeRequest.$update(function () {
                $scope.showSpinner = false;
                $location.path('projects/' + changeRequest.projectId);
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };
    }
]);
