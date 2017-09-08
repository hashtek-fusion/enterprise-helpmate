/**
 * Created by Rajesh on 7/3/2017.
 */
'use strict';

//RiskAndIssues service used for communicating with the estimates REST endpoints in node server
angular.module('riskAndIssues')
    .factory('Issues', ['$resource',
        function ($resource) {
            return $resource('api/riskandissues/:issueId', {
                issueId: '@_id'
            }, {
                update: {
                    method: 'PUT'
                }
            });
        }
    ])
    .factory('IssuesSvc', ['$http',function($http) {

        var issuesFactory = {};
        issuesFactory.getListOfIssues=function(data){
            return $http({
                url: '/api/riskandissues/list',
                method: 'POST',
                data: data
            });
        };

        return issuesFactory;
    }
    ]);
