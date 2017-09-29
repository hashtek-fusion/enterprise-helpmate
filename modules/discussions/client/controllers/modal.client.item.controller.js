/**
 * Created by Rajesh on 09/26/2017.
 */
'use strict';

// Discussion Action Item Modal controller
angular.module('discussions').controller('ModalInstanceActionItemCtrl', ['$scope','Authentication','ConfigSvc','$modalInstance',
    function ($scope,Authentication,ConfigSvc,$modalInstance) {

        $scope.authentication = Authentication;

        $scope.init = function (mode) {
            var config = {};
            config = JSON.parse(angular.toJson(ConfigSvc.getProjectConfiguration()));
            $scope.issueStatus = config.issueStatus;

            $scope.selStatus=$scope.issueStatus.find(function (disc) {
                if($scope.selectedActionItem && $scope.selectedActionItem.status) return disc.key === $scope.selectedActionItem.status.key;
            });
        };

        $scope.manageActionItem=function(){
            if($scope.actionMode==='CREATE') {
                $scope.selectedActionItem.status=this.selStatus;
                $scope.selectedActionItem.createdBy=$scope.authentication.user.displayName;
                $scope.selectedActionItem.createdOn=Date.now();
                $scope.discussion.actionItems.push($scope.selectedActionItem);
                $modalInstance.close();
            } else if($scope.actionMode==='EDIT'){
                $scope.selectedActionItem.status=this.selStatus;
                $scope.selectedActionItem.lastModifiedBy=$scope.authentication.user.displayName;
                $scope.selectedActionItem.modifiedOn=Date.now();
                $scope.discussion.actionItems.splice($scope.selActionIndex,1,$scope.selectedActionItem);//Push the modified value into same position in Action Items array
                $modalInstance.close();
            }
        };

        $scope.cancel=function(){
            $modalInstance.dismiss('cancel');
        };
    }
]);
