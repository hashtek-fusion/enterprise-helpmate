'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider',
    function ($locationProvider) {
        $locationProvider.html5Mode(true).hashPrefix('!');
    }
]);

angular.module(ApplicationConfiguration.applicationModuleName).run(function ($rootScope, Authentication, $transitions, $state) {
    // Check authentication before changing state
    $transitions.onStart({}, function (trans) {
        var fromState = trans.from(),
            toState = trans.to();
        //console.log(toState);
        if (toState.data && toState.data.roles && toState.data.roles.length > 0) {
            var allowed = false;
            toState.data.roles.forEach(function (role) {
                if (Authentication.user.roles !== undefined && Authentication.user.roles.indexOf(role) !== -1) {
                    allowed = true;
                    return true;
                }
            });
            if (!allowed) {
                $state.from = 'AUTH';
                return $state.target('authentication.signin');
            }
        }
    });
    // Record previous state
    $transitions.onSuccess({}, function (trans) {
        var fromState = trans.from();
        var toState = trans.to();
        if ($state.from && $state.from === 'AUTH') fromState = trans.originalTransition().to();//To handle the deep link URL redirect
        var params = trans.originalTransition().params();
        //console.log(params);
        $state.previous = {
            state: fromState,
            params: params,
            href: $state.href(fromState, params)
        };
    });
});

//Then define the init function for starting up the application
angular.element(document).ready(function () {
    //Fixing facebook bug with redirect
    if (window.location.hash === '#_=_') {
        window.location.hash = '#!';
    }

    //Then init the app
    angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});
