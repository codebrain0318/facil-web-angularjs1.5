(function() {
  'use strict';

  function CustomerByFilter() {
    return function(customers, type) {
      switch (type) {
        case 'active':
          return customers.filter(_isActive);
        case 'inactive':
          return customers.filter(_isInactive);
        case 'regerror':
          return customers.filter(_hasRegerror);
        default:
          return customers;
      }
    };
  }

  function _isActive(c) {
    return !c.Desativo;
  }

  function _isInactive(c) {
    return c.Desativo;
  }

  function _hasRegerror(c) {
    return c.Orphan;
  }

  angular.module('foneClub').filter('customerBy', CustomerByFilter);
})();
