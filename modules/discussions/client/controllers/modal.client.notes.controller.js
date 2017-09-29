/**
 * Created by Rajesh on 09/26/2017.
 */
'use strict';

// Discussion Notes Modal controller
angular.module('discussions').controller('ModalInstanceNotesCtrl', ['$scope','Authentication','$modalInstance',
    function ($scope,Authentication,$modalInstance) {

        $scope.authentication = Authentication;

        if($scope.notesMode==='EDIT'){//Setting the default value while editing the notes in a modal window
            $scope.notes=$scope.selectedNote.content;
        }

        $scope.manageNotes=function(){
            if($scope.notesMode==='CREATE') {
                var notes={
                    content: this.notes,
                    createdBy:  $scope.authentication.user.displayName,
                    createdOn: Date.now()
                };
                $scope.discussion.notes.push(notes);
                $modalInstance.close();
            } else if($scope.notesMode==='EDIT'){
                var modNotes={
                    content: this.notes,
                    lastModifiedBy:  $scope.authentication.user.displayName,
                    modifiedOn: Date.now(),
                    createdBy:$scope.selectedNote.createdBy,//Keep the original values
                    createdOn:$scope.selectedNote.createdOn //Keep the original values
                };
                $scope.discussion.notes.splice($scope.selNoteIndex,1,modNotes);//Push the modified value into same position in Notes array
                $modalInstance.close();
            }
        };

        $scope.cancel=function(){
            $modalInstance.dismiss('cancel');
        };
    }
]);
