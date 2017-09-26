/**
 * Created by Rajesh on 09/20/2017.
 */
'use strict';

//Discussions controller to manage Discussion Threads associated with a specific project
angular.module('discussions').controller('DiscussionsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Discussions', 'DiscussionsSvc', 'ConfigSvc','$state','$modal',
    function ($scope, $stateParams, $location, Authentication, Discussions, DiscussionsSvc, ConfigSvc,$state,$modal) {

        $scope.authentication = Authentication;

        $scope.init = function (mode) {
            $scope.projectId = $stateParams.pmtId;
            var config = {};
            config = JSON.parse(angular.toJson(ConfigSvc.getProjectConfiguration()));
            $scope.discussionStatus = config.discussionStatus;
        };
        // Create new Discussion Thread for a project
        $scope.create = function () {
            // Create new Discussion object
            var discussion = new Discussions({
                projectId: $stateParams.projectId,
                pmtId:$stateParams.pmtId,//Auto populated field for metrics
                topic: this.topic,
                subTopic:this.subTopic,
                description: this.description,
                status: {
                    key: this.selStatus.key,
                    value: this.selStatus.value
                }
            });

            // Redirect after save
            discussion.$save(function (response) {
                $location.path('projects/' + $stateParams.projectId);
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Find existing Discussion Thread
        $scope.findOne = function (mode) {
            $scope.showSpinner = true;
            $scope.discussion = Discussions.get({
                discussionId: $stateParams.discussionId
            }, function () {
                $scope.showSpinner = false;
                if (mode === 'EDIT')
                    $scope.init('MODIFY');
            });
        };

        // Update existing Discussion Thread associated with project
        $scope.update = function () {
            $scope.showSpinner = true;
            var discussion = $scope.discussion;
            discussion.$update(function () {
                $scope.showSpinner = false;
                $location.path('projects/' + discussion.projectId);
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.openDiscussion= function(mode){
            var modalInstance = $modal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'modules/discussions/views/modal/manage-discussion.client.view.html',
                controller: 'ModalInstanceDiscussionCtrl',
                size: 'lg',
                scope:$scope
            });
        };

        $scope.openNotes= function(mode){
            var modalInstance = $modal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'modules/discussions/views/modal/manage-actionitems.client.view.html',
                controller: 'ModalInstanceNotesCtrl',
                controllerAs: '$ctrl',
                size: 'lg',
                resolve: {
                    items: function () {
                        return '';
                    }
                }
            });
        };

        $scope.openActionItem= function(mode){
            var modalInstance = $modal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'modules/discussions/views/modal/manage-notes.client.view.html',
                controller: 'ModalInstanceActionItemCtrl',
                controllerAs: '$ctrl',
                size: 'lg',
                resolve: {
                    items: function () {
                        return '';
                    }
                }
            });
        };

    }
]);
