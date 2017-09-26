/**
 * Created by Rajesh on 09/25/2017.
 */
'use strict';

// Discussions Modal controller
angular.module('discussions').controller('ModalInstanceDiscussionCtrl', ['$scope', '$stateParams', '$location', 'Authentication', 'Projects', 'ConfigSvc','$window','$state','Discussions',
    function ($scope, $stateParams, $location, Authentication, Projects, ConfigSvc,$window,$state,Discussions) {

        $scope.authentication = Authentication;

        $scope.init = function (mode) {
            var config = {};
            config = JSON.parse(angular.toJson(ConfigSvc.getProjectConfiguration()));
            $scope.discussionStatus = config.discussionStatus;

            $scope.selStatus=$scope.discussionStatus.find(function (disc) {
               if($scope.discussion.status) return disc.key === $scope.discussion.status.key;
            });
        };

        $scope.manageDiscussion=function(){
            console.log('Topic:' + $scope.topic);
            var discussion = new Discussions({
                projectId: $scope.project._id,//Get this value from parent scope
                pmtId:$scope.project.pmtId,//Get this value from parent scope
                topic: this.discussion.topic,
                subTopic:this.discussion.subTopic,
                description: this.discussion.description,
                status: {
                    key: this.selStatus.key,
                    value: this.selStatus.value
                }
            });
            // Redirect after save
            discussion.$save(function (response) {
                $location.path('discussions/' + response._id);
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };
    }
]);
