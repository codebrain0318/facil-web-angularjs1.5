(function() {
  'use strict';

  angular.module('foneClub').controller('ChargeSummaryController', ChargeSummaryController);

 ChargeSummaryController.inject = [
    'ViewModelUtilsService',
    'PagarmeService',
    'MainUtils',
    'FoneclubeService',
    'DialogFactory',
    'UtilsService',
    '$stateParams',
  ];

  function ChargeSummaryController(
    ViewModelUtilsService,
    PagarmeService,
    MainUtils,
    FoneclubeService,
    DialogFactory,
    UtilsService,
    $stateParams
  ) {
    var vm = this;
    vm.customerName = "";
    vm.isPix = false;
    vm.isBoleto = false
    vm.vigencia="";
    vm.vencimento ="";
    vm.pixCode="";
    vm.boletoUrl ="";
    vm.boletoBarcode = "";
    vm.imgUrl="";
    vm.chargeId = $stateParams.chargeId;
    vm.personId = $stateParams.personId;
    vm.AdditionalComments = "";
    vm.showSummary = false;
    vm.urlApi = 'https://api.foneclube.com.br/api';
    //vm.urlApi = 'http://localhost:57078/api'

    init();

    function init(){
      vm.displayTooltip = false;
      FoneclubeService.getChargingById(vm.personId,vm.chargeId).then(function (result) {
        vm.customerName = result.Name;
        if(result.Charging){
          vm.vigencia = result.Charging.MesVingencia +"/"+result.Charging.AnoVingencia;
          vm.vencimento = result.Charging.DueDate.split('T')[0];
          vm.qrcode = result.Charging.Id;
          vm.pixCode = result.Charging.PixCode;
          vm.price =  result.Charging.Ammount;
          vm.boletoUrl = result.Charging.BoletoUrl;
          vm.boletoBarcode = result.Charging.boletoBarcode;
          vm.AdditionalComments = result.Charging.ChargingComment;
          if(result.Charging.PixCode != undefined || result.Charging.PixCode != null){
              vm.isPix = true;
              vm.imgUrl = vm.urlApi + "/pagarme/pix/qrcode/"+vm.qrcode;
          }
          if(result.Charging.BoletoUrl != undefined || result.Charging.BoletoUrl != null){
            vm.isBoleto = true;
        }
        
          vm.showSummary=true;
        }
      });
    }
  }
})();
