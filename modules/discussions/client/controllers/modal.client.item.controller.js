/**
 * Created by Rajesh on 09/26/2017.
 */
'use strict';

// Discussions Action Item Modal controller
angular.module('discussions').controller('ModalInstanceActionItemCtrl', ['$scope', '$stateParams', '$location', 'Authentication', 'Projects', 'ConfigSvc','$window','$state','Discussions',
    function ($scope, $stateParams, $location, Authentication, Projects, ConfigSvc,$window,$state,Discussions) {

        $scope.authentication = Authentication;
    }
]);
