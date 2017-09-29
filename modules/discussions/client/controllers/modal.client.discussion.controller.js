/**
 * Created by Rajesh on 09/25/2017.
 */
'use strict';

// Discussions Modal controller
angular.module('discussions').controller('ModalInstanceDiscussionCtrl', ['$scope',  'Authentication','ConfigSvc','Discussions','$modalInstance',
    function ($scope,Authentication,ConfigSvc,Discussions,$modalInstance) {

        $scope.authentication = Authentication;

        $scope.init = function (mode) {
            var config = {};
            config = JSON.parse(angular.toJson(ConfigSvc.getProjectConfiguration()));
            $scope.discussionStatus = config.discussionStatus;
            $scope.discussionTopics = config.discussionTopics;

            $scope.selStatus=$scope.discussionStatus.find(function (disc) {
               if($scope.discussion && $scope.discussion.status) return disc.key === $scope.discussion.status.key;
            });

            $scope.selTopic=$scope.discussionTopics.find(function (topic) {
                if($scope.discussion && $scope.discussion.topic) return topic.key === $scope.discussion.topic.key;
            });
        };

        $scope.manageDiscussion=function(){
            if($scope.discussionMode==='CREATE'){
                $scope.showSpinner = true;
                var discussion = new Discussions({
                    projectId: $scope.project._id,//Get this value from parent scope
                    pmtId:$scope.project.pmtId,//Get this value from parent scope
                    topic: {
                        key: this.selTopic.key,
                        value: this.selTopic.value
                    },
                    subTopic:this.discussion.subTopic,
                    description: this.discussion.description,
                    status: {
                        key: this.selStatus.key,
                        value: this.selStatus.value
                    }
                });
                // Redirect after save
                discussion.$save(function (response) {
                    $scope.showSpinner = false;
                    $modalInstance.close(response._id);
                }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                });
            }else if($scope.discussionMode==='EDIT'){
                //Explicitly set the drop down values
                $scope.discussion.status=$scope.selStatus;
                $scope.discussion.topic=$scope.selTopic;
                $modalInstance.close();
            }
        };

        $scope.cancel=function(){
            $modalInstance.dismiss('cancel');
        };
    }
]);
