(function() {

    'use strict';

    angular.module('foneClub').service('SessionStorageUtilsService', SessionStorageUtilsService);

    SessionStorageUtilsService.inject = ['$q'];

    function SessionStorageUtilsService($q) {
        return {
            getSession : getSession,
            setSession : setSession,
            setGridObject : setGridObject
        }

        
        function getSession(key){
            return sessionStorage.getItem(key);
        }

        function setSession(key, data){
            sessionStorage.setItem(key, JSON.stringify(data));
        }

        function setGridObject(gridName, api, filterText){
            var data = {
                ColumnState : JSON.stringify(api.columnApi.getColumnState()),
    		    FilterModel : JSON.stringify(api.api.getFilterModel()),
    		    SortModel : JSON.stringify(api.api.getSortModel()),
                FilterText : filterText
            };
            setSession(gridName, data);
        }
    }
})();