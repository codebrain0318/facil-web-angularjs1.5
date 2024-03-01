(function () {
    'use strict';
  
    angular
      .module('foneClub')
      .component('foneHeader', {
        templateUrl: '../components/header-page/header-page.html',
        bindings: {
          title: "@"
          },
          controller: headerController,
          controllerAs: 'vm'
      });        
  
    headerController.$inject = ['$rootScope'];
  
    function headerController($rootScope) {
      var vm = this;      
      vm.clickMenuHamburguer = function() {
        $rootScope.$broadcast('menu-hamburguer');
      }
    }

  })();
  