(function () {

  angular
    .module('foneClub')
    .controller('IntlDepositsModalController', IntlDepositsModalController);


  IntlDepositsModalController.inject = ['ViewModelUtilsService', 'FoneclubeService', 'DialogFactory', 'UtilsService', 'localStorageService', '$filter'];

  function IntlDepositsModalController(ViewModelUtilsService, FoneclubeService, DialogFactory, UtilsService, $filter, localStorageService) {

    var vm = this;
    vm.paymentTypes = [{ Id: 1, Name: "Bank - USA" }, { Id: 2, Name: "Bank - Brazil" }, { Id: 3, Name: "Paypal" }, { Id: 4, Name: "Online Transfer" }, { Id: 5, Name: "Refund" },{ Id: 6, Name: "Other" }];
    vm.Nome = ViewModelUtilsService.customerData.Name;
    vm.PersonId = ViewModelUtilsService.customerData.Id;
    vm.usdAmount = 0;
    vm.ccCharges = 0;
    vm.bramount = 0;
    vm.bankCharges = 0;
    vm.conversionrate = 0;
    vm.finalDeposit = 0;
    vm.handlingCharges = 0;
    vm.Comment = "";
    vm.refund = false;
    vm.PaymentType = 'Bank - USA';
    vm.dataAdded = moment().format("YYYY MM");
    vm.isSaving = false;
    vm.SaveDeposit = SaveDeposit;

    function SaveDeposit() {

      var lastDeposit = JSON.parse(localStorage.getItem('lastDeposit'));

      if(vm.FinalValue != '' && vm.dataAdded != null && vm.usdAmount != null && vm.PaymentType != null)
      {
      vm.isSaving = true;

      var data = {
        IdPerson: vm.PersonId,
        USDAmount: (parseFloat(vm.usdAmount) / 100).toFixed(2),
        BRAmount: (parseFloat(vm.bramount) / 100).toFixed(2),
        CCCharages: (parseFloat(vm.ccCharges) / 100).toFixed(2),
        BankCharges: (parseFloat(vm.bankCharges) / 100).toFixed(2),
        HandlingCharges: (parseFloat(vm.handlingCharges) / 100).toFixed(2),
        ConversionRate: (parseFloat(vm.conversionrate) / 100).toFixed(2),
        PaymentType: vm.PaymentType,
        DateAdded: vm.dataAdded,
        FinalValue: (parseFloat(vm.finalDeposit) / 100).toFixed(2),
        Comment : vm.Comment,
        Refund: vm.refund
      };


      if (lastDeposit) {
        if (lastDeposit.data.FinalValue === data.FinalValue && Date.now() - lastDeposit.timestamp < 60 * 60 * 1000) {
          // Se houver um último depósito dentro da última hora
          var confirmDuplicate = confirm("Você fez um depósito igual nos últimos 60 minutos. Tem certeza que deseja continuar?");
          if (!confirmDuplicate) {
            return; // Se o usuário escolher não continuar, a função termina aqui.
          }
        }
      }


      FoneclubeService.SaveIntlDeposits(data).then(function (result) {
        
        vm.isSaving = false;

        localStorage.setItem('lastDeposit', JSON.stringify({ timestamp: Date.now(), data: data }));

        if(result)
          DialogFactory.showMessageDialog({ mensagem: "Balance updated successfully" });
        else
          DialogFactory.showMessageDialog({ mensagem: "Error occured while updating Balance" });

      });
      vm.isSaving = false;
    }
    else{
      DialogFactory.showMessageDialog({ mensagem: 'Por favor preencha os campos obrigatórios' });
    }


    }

  }
})();
