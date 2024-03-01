(function () {
  'use strict';

  angular.module('foneClub').controller('WhatsappController', WhatsappController);

  WhatsappController.inject = ['ViewModelUtilsService', 'PagarmeService', 'MainUtils', 'FoneclubeService', 'DialogFactory', 'UtilsService', '$filter', '$interval', '$scope'];

  function WhatsappController(ViewModelUtilsService, PagarmeService, MainUtils, FoneclubeService, DialogFactory, UtilsService, $filter, $interval, $scope) {
    var vm = this;
    // debugger;
    vm.onSend = onSend;


    var customer = ViewModelUtilsService.modalData;
    vm.customer = customer;
    vm.name = vm.customer.Name;
    vm.text = '';
    vm.sendButtonText = 'Send';
    vm.messages = [];
    vm.currentUser = MainUtils.getAgent();
    init();

    function init() {
      FoneclubeService.getClientMessages(vm.customer.WClient.ClientId, false).then(function (result) {
        if (result) {
          vm.messages = result;
          if (vm.customer.WClient) {
            vm.customer.WClient.UnreadMessages = 0;
          }
        }
      });
    }

    function onSend() {
      if (!vm.text) {
        return;
      }
      var data = {
        ClientId: vm.customer.WClient.ClientId,
        Text: vm.text
      };

      if (vm.currentUser) {
        data.Text = vm.currentUser + ": " + data.Text;
        data.SendBy = vm.currentUser;
      }

      vm.sendButtonText = 'Sending..';
      FoneclubeService.postSendWhatsappMessage(data).then(function (result) {
        console.log(result);
        vm.sendButtonText = 'Send';
        if (result) {
          vm.text = "";
          init();
        } else {
          DialogFactory.showAlertDialog({ message: 'Message not sent' });
        }
      }); /* 
              .catch(function(error){
                  console.log('catch error');
                  console.log(error);
              }); */
    }

    var awaitingResponse = false;
    var stop = null;//$interval(loadClientMessages, 5000);
    function loadClientMessages() {
      if (!awaitingResponse) {
        awaitingResponse = true;
        FoneclubeService.getClientMessages(vm.customer.WClient.ClientId, true).then(function (result) {
          vm.messages = result;
          awaitingResponse = false;
          // console.log(result);
          if (result) {

          }
        });
      }
    }
    $scope.$on('$destroy', function () {
      // Make sure that the interval is destroyed too
      console.log("Scop destroyed");
      if (angular.isDefined(stop)) {
        $interval.cancel(stop);
        stop = undefined;
      }
    });
  }
})();
