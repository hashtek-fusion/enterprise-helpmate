/**
 * Created by Rajesh on 7/3/2017.
 */
'use strict';

//Estimates controller to manage estimates associated with a specific project
angular.module('estimates').controller('EstimatesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Estimates', 'EstimatesSvc', 'ConfigSvc',
    function ($scope, $stateParams, $location, Authentication, Estimates, EstimatesSvc, ConfigSvc) {

        $scope.authentication = Authentication;

        $scope.init = function (mode) {
            $scope.projectId = $stateParams.pmtId;
            $scope.estType = $stateParams.estType;
            $scope.application = $stateParams.application;
            var config = {};
            config = JSON.parse(angular.toJson(ConfigSvc.getProjectConfiguration()));
            $scope.complexity = config.complexity;
            $scope.impactedWorkstreams = config.workstream;
            if (mode === 'CREATE') {
                $scope.selWorkstream = [];
            }
            if (mode === 'MODIFY') {
                //set the default values for drop down
                $scope.selComplexity = $scope.complexity.find(function (comp) {
                    return comp.key === $scope.estimate.estimates.complexity.key;
                });
                $scope.selWorkstream = $scope.impactedWorkstreams.filter(function (ws) {
                    for (var i = 0; i < $scope.estimate.estimates.impactedWorkstreams.length; i++) {
                        if (ws.key === $scope.estimate.estimates.impactedWorkstreams[i].key) return true;
                    }
                });
            }
        };
        // Create new Estimate for a project
        $scope.create = function () {
            // Create new Estimate object
            var workstreams = [];
            for (var i = 0; i < $scope.selWorkstream.length; i++) {
                workstreams[i] = {key: $scope.selWorkstream[i].key, value: $scope.selWorkstream[i].value};
            }
            var estimate = new Estimates({
                projectId: $stateParams.projectId,
                estimates:{
                    estType:{
                        key:$scope.estType,
                        value:$scope.estType
                    },
                    hours: this.hours,
                    assumptions: this.assumptions,
                    dependencies: this.dependencies,
                    additionalNotes: this.additionalNotes,
                    complexity: {
                        key: this.selComplexity.key,
                        value: this.selComplexity.value
                    },
                    impactedWorkstreams: workstreams,
                    sanityCheckOnEstimate: this.sanityCheckOnEstimate
                }

            });

            // Redirect after save
            estimate.$save(function (response) {
                $location.path('projects/' + $stateParams.projectId);
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Find existing Estimate
        $scope.findOne = function (mode) {
            $scope.showSpinner = true;
            $scope.estimate = Estimates.get({
                estimateId: $stateParams.estimateId
            }, function () {
                $scope.showSpinner = false;
                if (mode === 'EDIT')
                    $scope.init('MODIFY');
            });
        };

        // Update existing Estimate associated with project
        $scope.update = function () {
            $scope.showSpinner = true;
            var estimate = $scope.estimate;
            //Explicitly setting the modified drop down values...
            $scope.estimate.estimates.complexity = $scope.selComplexity;
            $scope.estimate.estimates.impactedWorkstreams = $scope.selWorkstream;
            estimate.$update(function () {
                $scope.showSpinner = false;
                $location.path('projects/' + estimate.projectId);
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };
    }
]);
