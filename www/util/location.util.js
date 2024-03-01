(function() {
'use strict';

    angular
        .module('foneClub')
        .service('LocationService', LocationService);

    LocationService.inject = ['$state', 'UtilsService'];
    function LocationService($state, UtilsService) {

        this.change = change;

        function change(value, dataParameters) {
            UtilsService.setRouteData(value)
            $state.go(value, {
                data: dataParameters
            });
        }
    }
})();