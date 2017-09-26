/**
 * Created by Rajesh on 09/20/2017.
 */
'use strict';

//Discussions service used for communicating with the estimates REST endpoints in node server
angular.module('discussions')
    .factory('Discussions', ['$resource',
        function ($resource) {
            return $resource('api/discussions/:discussionId', {
                discussionId: '@_id'
            }, {
                update: {
                    method: 'PUT'
                }
            });
        }
    ])
    .factory('DiscussionsSvc', ['$http',function($http) {

        var discussionsFactory = {};
        discussionsFactory.getListOfDiscussions=function(data){
            return $http({
                url: '/api/discussion/list',
                method: 'POST',
                data: data
            });
        };
        return discussionsFactory;
    }
    ]);
