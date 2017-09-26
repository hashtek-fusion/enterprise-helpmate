/**
 * Created by Rajesh on 09/26/2017.
 */
'use strict';

// Discussion Notes Modal controller
angular.module('discussions').controller('ModalInstanceNotesCtrl', ['$scope', '$stateParams', '$location', 'Authentication', 'Projects', 'ConfigSvc','$window','$state','Discussions',
    function ($scope, $stateParams, $location, Authentication, Projects, ConfigSvc,$window,$state,Discussions) {

        $scope.authentication = Authentication;
    }
]);
