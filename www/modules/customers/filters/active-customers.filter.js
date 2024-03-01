(function() {
  'use strict';

  function ActiveCustomersFilter() {
    return function(customers) {
      return customers.filter(customers, _isActive);
    };
  }

  function _isActive(c) {
    return !c.Desativo;
  }

  angular.module('foneClub').filter('activeCustomers', ActiveCustomersFilter);
})();
