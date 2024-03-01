(function () {
  'use strict';

  angular.module('foneClub').controller('FacilAddNewController', FacilAddNewController);

  FacilAddNewController.inject = ['ViewModelUtilsService', 'MainUtils', 'FoneclubeService', 'DialogFactory', '$scope'];

  function FacilAddNewController(ViewModelUtilsService, MainUtils, FoneclubeService, DialogFactory, $scope) {
    var vm = this;
    vm.addNewIntlUser = addNewIntlUser;

    function addNewIntlUser(){
      var data = {
        Name : vm.Name,
        DocumentNumber: vm.CPF,
        DefaultWAPhones : vm.Phone,
        Email: vm.Email,
        Password: vm.Password
      }
      FoneclubeService.postRegisterIntlCustomer(data).then(function (result) {
        DialogFactory.showMessageDialog({ mensagem: result });
      });
    }

  }
})();
