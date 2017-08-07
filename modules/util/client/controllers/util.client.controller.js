/**
 * Created by Rajesh on 8/7/2017.
 */
'use strict';

angular.module('util').controller('UtilitiesController', ['$scope', '$timeout', '$window', 'Authentication', 'FileUploader',
    function ($scope, $timeout, $window, Authentication, FileUploader) {
        $scope.user = Authentication.user;
        $scope.docURL = '';
        //Initialize file uploader instance based on the context
        $scope.loadUploadInstance = function (mode) {
            if (mode === 'PROJECTS') $scope.uploadURL = '/api/util/import/projects';
            else if (mode === 'REQUESTS') $scope.uploadURL = '/api/util/import/requests';
            else if (mode === 'ESTIMATES') $scope.uploadURL = '/api/util/import/estimates';
            // Create file uploader instance
            $scope.uploader = new FileUploader({
                url: $scope.uploadURL
            });
            // Set file uploader document filter
            $scope.uploader.filters.push({
                name: 'documentFilter',
                fn: function (item, options) {
                    var type = '|' + item.name.slice(item.name.lastIndexOf('.') + 1) + '|';
                    return '|xlsx|'.indexOf(type) !== -1;
                }
            });
            // Called after the user selected a new document to import
            $scope.uploader.onAfterAddingFile = function (fileItem) {
                if ($window.FileReader) {
                    var fileReader = new FileReader();
                    fileReader.readAsDataURL(fileItem._file);

                    fileReader.onload = function (fileReaderEvent) {
                        $timeout(function () {
                            $scope.docURL = fileItem._file.name;
                        }, 0);
                    };
                }
            };
            // Called after the user has successfully imported the data
            $scope.uploader.onSuccessItem = function (fileItem, response, status, headers) {
                // Show success message
                $scope.success = true;
                // Clear upload buttons
                $scope.cancelUpload();
            };

            // Called after the user has failed to import the data
            $scope.uploader.onErrorItem = function (fileItem, response, status, headers) {
                // Clear upload buttons
                $scope.cancelUpload();
                // Show error message
                $scope.error = response.message;
            };
        };

        // Import the bulk project related data
        $scope.uploadDocument = function () {
            // Clear messages
            $scope.success = $scope.error = null;
            // Start upload
            $scope.uploader.uploadAll();
        };

        // Cancel the upload process
        $scope.cancelUpload = function () {
            $scope.uploader.clearQueue();
            $scope.docURL = '';
        };
    }
]);
