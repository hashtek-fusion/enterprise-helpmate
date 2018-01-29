'use strict';

angular.module('users.admin').controller('UserController', ['$scope', '$state', 'Authentication','ConfigSvc','$stateParams', 'Admin',
  function ($scope, $state, Authentication,ConfigSvc,$stateParams,Admin) {

    $scope.authentication = Authentication;
    $scope.initConfig = function(){
        Admin.get({userId: $stateParams.userId},function(user){
            $scope.user=user;
            //Configuring the dropdown values fetched from DB
            var config = {};
            config = JSON.parse(angular.toJson(ConfigSvc.getProjectConfiguration()));
            $scope.userStatus = config.userStatus;
            $scope.jobTitle = config.jobTitle;
            $scope.selUserStatus = $scope.userStatus.find(function (user) {
                if($scope.user.status) return user.key === $scope.user.status.key;
            });
            $scope.selJobTitle = $scope.jobTitle.find(function (title) {
                if($scope.user.jobTitle) return title.key === $scope.user.jobTitle.key;
            });
        });
    };
    $scope.initConfig();
    $scope.remove = function (user) {
      if (confirm('Are you sure you want to delete this user?')) {
        if (user) {
          user.$remove();

          $scope.users.splice($scope.users.indexOf(user), 1);
        } else {
          $scope.user.$remove(function () {
            $state.go('admin.users');
          });
        }
      }
    };

    $scope.update = function () {
      $scope.user.status=$scope.selUserStatus;
      $scope.user.jobTitle=$scope.selJobTitle;
      var user = $scope.user;
      user.$update(function () {
        $state.go('admin.user', {
          userId: user._id
        });
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
  }
]);
