(function () {
  'use strict';

  angular
    .module('foneClub')
    .controller('SelectReportModalController', SelectReportModalController);


  SelectReportModalController.inject = ['ViewModelUtilsService', 'FoneclubeService', 'DialogFactory', 'UtilsService', 'localStorageService', '$filter'];

  function SelectReportModalController(ViewModelUtilsService, FoneclubeService, DialogFactory, UtilsService, $filter, localStorageService) {

    console.log('--- SelectReportModalController ---');
    var vm = this;
    vm.templates = [];
    vm.selectedRecord = ViewModelUtilsService.modalReportData.SelectedRecord;
    vm.customer = ViewModelUtilsService.modalReportData.Customer;
    vm.userphone = ViewModelUtilsService.modalReportData.PhoneNumbers;
    vm.saveTemplate = saveTemplate;
    vm.sendTemplate = sendTemplate;
    vm.sendBtn = document.getElementsByClassName('col-md-12 btn btn-success btn_sendTemplate')
    vm.saveBtn = document.getElementsByClassName('col-md-12 btn btn-primary btn_saveTemplate')

    loadTemplates();



    function loadTemplates() {
      localStorageService.set("SelectedTemplate", null);
      if (vm.selectedRecord) {
        vm.selectedRecord.Trigger = !isArray(vm.selectedRecord.Trigger) ? vm.selectedRecord.Trigger : vm.selectedRecord.Trigger.join(',');
        vm.selectedRecord.Buttons = vm.selectedRecord.Buttons;
        vm.selectedRecord.Urls = vm.selectedRecord.Urls;
        vm.selectedRecord.ListButton = vm.selectedRecord.ListButton;
        vm.selectedRecord.ListSections = vm.selectedRecord.ListSections;
        vm.selectedRecord.ListSectionRows = vm.selectedRecord.ListSectionRows;
      }
      FoneclubeService.getWATemplates().then(function (result) {
        vm.templates = result;
      });
    }

    function saveTemplate() {
      var employeeToEdit = vm.templates.find(x => x.Id === vm.selectedRecord.Id);
      console.log('-- WA Edit --');

      vm.saveBtn[0].disabled = true

      if (employeeToEdit) {
        var sendData = JSON.parse(JSON.stringify(vm.selectedRecord));
        sendData.Trigger = vm.selectedRecord.Trigger.split(',');
        sendData.Buttons = vm.selectedRecord.Buttons;
        sendData.Urls = vm.selectedRecord.Urls;
        sendData.ListButton = vm.selectedRecord.ListButton;
        sendData.ListSections = vm.selectedRecord.ListSections;
        sendData.ListSectionRows = vm.selectedRecord.ListSectionRows;
        localStorageService.set("SelectedTemplate", sendData);

        FoneclubeService.saveWATemplates(sendData).then(function (result) {
          if (result) {
            DialogFactory.showMessageDialog({ mensagem: 'Template Saved Successfully' });
            SaveDefaults();
          }
          vm.saveBtn[0].disabled = false

        });
      }
    }


    function sendTemplate() {


      vm.sendBtn[0].disabled = true
      var sendData = JSON.parse(JSON.stringify(vm.selectedRecord));
      sendData.Trigger = vm.selectedRecord.Trigger.split(',');
      sendData.Buttons = vm.selectedRecord.Buttons;
      sendData.Urls = vm.selectedRecord.Urls;
      sendData.ListButton = vm.selectedRecord.ListButton;
      sendData.ListSections = vm.selectedRecord.ListSections;
      sendData.ListSectionRows = vm.selectedRecord.ListSectionRows;

      var data = {
        PersonId: vm.customer.Id,
        PhoneNumbers: vm.userphone,
        Invitee: vm.invitee == undefined ? null : vm.invitee,
        Template: sendData
      };

      FoneclubeService.sendGenericMsg(data).then(function (result) {
        if (result == "Sent") {
          DialogFactory.showMessageDialog({ mensagem: 'Message sent successfully to ' + vm.customer.Name + ' via whatsapp' });
          SaveDefaults();
        }
        else if (result == "Partial") {
          DialogFactory.showMessageDialog({ mensagem: 'Message partially sent to ' + vm.customer.Name + ' via whatsapp' });
        }
        else {
          DialogFactory.showMessageDialog({ mensagem: 'Error occured while sending WhatsApp Message' });
        }
        vm.sendBtn[0].disabled = false
      });

    }

    function SaveDefaults() {
      debugger;
      var paymentInfo = {
        Id: vm.customer.Id,
        DefaultWAPhones: vm.userphone
      };
      FoneclubeService.saveDefaultPaymentInfo(paymentInfo).then(function (result) {
        return true;
      });
    }
  }
})();
