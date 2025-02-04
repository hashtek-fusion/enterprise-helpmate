'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider','localStorageServiceProvider',
  function ($stateProvider, $urlRouterProvider, localStorageServiceProvider) {

    //Local Storage settings
      localStorageServiceProvider
          .setPrefix('helpmate')
          .setStorageType('localStorage')
          .setDefaultToCookie(false);
    // Redirect to 404 when route not found
    $urlRouterProvider.otherwise('not-found');

    // Home state routing
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'modules/core/views/home.client.view.html'
      })
      .state('not-found', {
        url: '/not-found',
        templateUrl: 'modules/core/views/404.client.view.html'
      });
  }
]);
