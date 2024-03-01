(function () {

  'use strict';
  agGrid.initialiseAgGridWithAngular1(angular);
  angular.module('foneClub', [

    /* public modules */
    'ionic',
    'firebase',
    'ngCordova',
    'ngMask',
    'LocalStorageModule',
    'ui.bootstrap',
    'ngDialog',
    'ui.router',
    'ui.toggle',
    'autoCompleteModule',
    'smart-table',
    'g1b.datetime-inputs',
    'ngclipboard',
    'ngAnimate',
    'vAccordion',
    'ngTable',
    'kendo.directives',
    'agGrid',
    'moment-picker',
    'ngQuill',
    'ngSanitize',
  ]);

  angular.module('foneClub').controller('globalCtrl', globalCtrl);

  globalCtrl.$inject = ['$interval', 'DataFactory', 'FoneclubeService', '$location'];

  function globalCtrl($interval, DataFactory, FoneclubeService, $location) {
    var vm = this;
    vm.data = DataFactory;

    function init() {
      // FoneclubeService.getCustomers().then(function (result) {
      //     vm.data.customers = result.map(function (user) {
      //         user.Phones = user.Phones.map(function (phone) {
      //             phone.phoneFull = phone.DDD.concat(phone.Number);
      //             return phone;
      //         })
      //         return user;
      //     })
      //     console.log('getCustomers')
      //     console.log(result)
      //     //post realizado com sucesso
      // })
      //     .catch(function (error) {
      //         console.log('catch error');
      //         console.log(error);
      //         console.log(error.statusText); // mensagem de erro para tela, caso precise
      //     });
    }

    //init();

    // $interval(function () {
    //     FoneclubeService.getCustomers().then(function (result) {
    //         vm.data.customersCache = result.map(function (user) {
    //             user.Phones = user.Phones.map(function (phone) {
    //                 phone.phoneFull = phone.DDD.concat(phone.Number);
    //                 return phone;
    //             })
    //             return user;
    //         })
    //         if ($location.$$path !== '/tab/customers') {
    //             vm.data.customers = angular.copy(vm.data.customersCache);
    //         }
    //         console.log('getCustomers')
    //         console.log(result)
    //         //post realizado com sucesso
    //     })
    //         .catch(function (error) {
    //             console.log('catch error');
    //             console.log(error);
    //             console.log(error.statusText); // mensagem de erro para tela, caso precise
    //         });
    // }, 300000);
  }

})();





