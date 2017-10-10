/**
 * Created by Rajesh on 09/20/2017.
 */
'use strict';

//Discussions controller to manage Discussion Threads associated with a specific project
angular.module('discussions').controller('DiscussionsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Discussions', 'DiscussionsSvc', 'ConfigSvc','$state','$modal','$sce',
    function ($scope, $stateParams, $location, Authentication, Discussions, DiscussionsSvc, ConfigSvc,$state,$modal,$sce) {

        $scope.authentication = Authentication;

        $scope.init = function (mode) {
            $scope.projectId = $stateParams.pmtId;
            var config = {};
            config = JSON.parse(angular.toJson(ConfigSvc.getProjectConfiguration()));
            $scope.discussionStatus = config.discussionStatus;
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
        $scope.renderHtml = function(html_code)
        {
            return $sce.trustAsHtml(html_code);
        };
        // Update existing Discussion Thread associated with project
        $scope.update = function () {
            $scope.showSpinner = true;
            var discussion = $scope.discussion;
            discussion.$update(function () {
                $scope.showSpinner = false;
                $location.path('discussions/' + discussion._id);
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.openDiscussion= function(){
            $scope.discussionMode='EDIT';
            var modalInstance = $modal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'modules/discussions/views/modal/manage-discussion.client.view.html',
                controller: 'ModalInstanceDiscussionCtrl',
                size: 'lg',
                scope:$scope
            });
            modalInstance.result.then(function () {
                $scope.update();// Modal popup made changes and update the discussion thread
            }, function () {
                $scope.findOne('EDIT');//Modal popup cancelled. reload the page without any changes
            });
        };

        $scope.openNotes= function(mode,index,selNote){
            $scope.notesMode=mode;
            $scope.selNoteIndex=index;
            $scope.selectedNote=selNote;
            var notesModalInstance = $modal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'modules/discussions/views/modal/manage-notes.client.view.html',
                controller: 'ModalInstanceNotesCtrl',
                size: 'lg',
                scope:$scope
            });
            notesModalInstance.result.then(function () {
                $scope.update();// Modal popup made changes and update the discussion thread
            }, function () {
                $scope.findOne('EDIT');//Modal popup cancelled. reload the page without any changes
            });
        };

        $scope.removeNotes=function(index){
            $scope.discussion.notes.splice(index,1);//Remove the selected note content from Notes array
            $scope.update();
        };

        $scope.openActionItem= function(mode,index,item){
            $scope.actionMode=mode;
            $scope.selActionIndex=index;
            $scope.selectedActionItem=item;
            var itemModalInstance = $modal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'modules/discussions/views/modal/manage-actionitems.client.view.html',
                controller: 'ModalInstanceActionItemCtrl',
                size: 'lg',
                scope:$scope
            });
            itemModalInstance.result.then(function () {
                $scope.update();// Modal popup made changes and update the discussion thread
            }, function () {
                $scope.findOne('EDIT');//Modal popup cancelled. reload the page without any changes
            });
        };

        $scope.removeActionItem=function(index){
            $scope.discussion.actionItems.splice(index,1);//Remove the selected Action Item from Action Items array
            $scope.update();
        };
    }
]);
