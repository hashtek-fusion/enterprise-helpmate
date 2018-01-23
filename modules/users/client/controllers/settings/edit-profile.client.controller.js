'use strict';

angular.module('users').controller('EditProfileController', ['$scope', '$http', '$location', 'Users', 'Authentication','ConfigSvc',
  function ($scope, $http, $location, Users, Authentication,ConfigSvc) {
    $scope.user = Authentication.user;

   $scope.initConfig= function(){
       //Configuring the dropdown values fetched from DB
       var config = {};
       config = JSON.parse(angular.toJson(ConfigSvc.getProjectConfiguration()));
       $scope.workstream = config.workstream;
       $scope.supportedProducts = config.supportedProducts;
       $scope.applications=config.applicationAndPrograms;
       //set the default values for multi-select dropdown
       $scope.selWorkstream = $scope.workstream.filter(function (ws) {
           for (var i = 0; i < $scope.user.skillset.workstreams.length; i++) {
               if (ws.key === $scope.user.skillset.workstreams[i].key) return true;
           }
       });
       $scope.selServices = $scope.supportedProducts.filter(function (prod) {
           for (var k = 0; k < $scope.user.skillset.products.length; k++) {
               if (prod.key === $scope.user.skillset.products[k].key) return true;
           }
       });
       $scope.selApplication = $scope.applications.filter(function (app) {
           for (var j = 0; j < $scope.user.skillset.programs.length; j++) {
               if (app.key === $scope.user.skillset.programs[j].key) return true;
           }
       });
   }

    // Update a user profile
    $scope.updateUserProfile = function (isValid) {
      if (isValid) {
        $scope.success = $scope.error = null;
        var user = new Users($scope.user);

        user.$update(function (response) {
          $scope.success = true;
          Authentication.user = response;
        }, function (response) {
          $scope.error = response.data.message;
        });
      } else {
        $scope.submitted = true;
      }
    };

      // Update a user skillset
      $scope.updateUserSkillset = function (isValid) {
          if (isValid) {
              $scope.success = $scope.error = null;
              $scope.user.skillset.workstreams=$scope.selWorkstream;
              $scope.user.skillset.products=$scope.selServices;
              $scope.user.skillset.programs=$scope.selApplication;
              var user = new Users($scope.user);
              user.$update(function (response) {
                  $scope.success = true;
                  Authentication.user = response;
              }, function (response) {
                  $scope.error = response.data.message;
              });
          } else {
              $scope.submitted = true;
          }
      };
  }
]);
