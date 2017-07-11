'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication','ConfigSvc',
  function ($scope, $state, $http, $location, $window, Authentication,ConfigSvc) {
    $scope.authentication = Authentication;

    // Get an eventual error defined in the URL query string:
    $scope.error = $location.search().err;

    // If user is signed in then redirect back home
    if ($scope.authentication.user) {
      $location.path('/');
    }

    $scope.signup = function () {
      $http.post('/api/auth/signup', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;

        // And redirect to the previous or home page
        $state.go($state.previous.state.name || 'home', $state.previous.params);
      }).error(function (response) {
        $scope.error = response.message;
      });
    };

    $scope.signin = function () {
      $http.post('/api/auth/signin', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;
        ConfigSvc.getProjectConfiguration();//Load project configurations into sessionStorage
        // And redirect to the previous or home page
        var goState=($state.previous.state.name==='home'?'dashboard':$state.previous.state.name);
        $state.go(goState, $state.previous.params);
      }).error(function (response) {
        $scope.error = response.message;
      });
    };

   /* $scope.loadConfigurations = function(){//Invoke the REST end point and load the details into session
        var configuration={};
        $http.get('/api/project/configuration').success(function (response) {
           configuration= response;
            $http.get('/api/user/editors').success(function (response) {
                configuration.detsArchitect= response;
                ConfigSvc.setProjectConfiguration(configuration);
            });
        });
    }*/

    // OAuth provider request
    $scope.callOauthProvider = function (url) {
      var redirect_to;

      if ($state.previous) {
        redirect_to = $state.previous.href;
      }

      // Effectively call OAuth authentication route:
      $window.location.href = url + (redirect_to ? '?redirect_to=' + encodeURIComponent(redirect_to) : '');
    };
  }
]);
