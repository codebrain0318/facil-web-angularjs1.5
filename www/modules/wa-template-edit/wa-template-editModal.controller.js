(function () {
    'use strict';
    
     angular.module('foneClub').controller('WATemplateEditModalController', WATemplateEditModalController);
    
     WATemplateEditModalController.inject = ['ViewModelUtilsService',
      'FoneclubeService',
      'DialogFactory',
      'UtilsService',
      '$stateParams', '$filter'];

      function WATemplateEditModalController(ViewModelUtilsService,
        FoneclubeService,
        DialogFactory,
        UtilsService,
        $stateParams, $filter) {
            var vm = this;
            vm.selectedRecord = ViewModelUtilsService.modalData;
            vm.isEdit = ViewModelUtilsService.modalData == null? false: true;
            vm.addTemplate = addTemplate;
            vm.editTemplate = editTemplate;
            vm.sendTemplate = sendTemplate;
            vm.AddEdit = vm.isEdit ? "Edit" : "Add";

            loadTemplates();
            console.log('-- WA TemplateEditController --');

            function loadTemplates(){
                 FoneclubeService.getWATemplates().then(function (result) {
                     vm.templates = result;
                     console.log(vm.templates);
                 });
            }

            function addTemplate() {
                console.log('-- WA Add --');
                if(vm.selectedRecord)
                {
                    var sendData = JSON.parse(JSON.stringify(vm.selectedRecord));
                    sendData.Id = -1;
                    sendData.Trigger = vm.selectedRecord.Trigger.split(',');
                    sendData.Buttons = (vm.selectedRecord.Buttons != undefined && vm.selectedRecord.Buttons != '') ? vm.selectedRecord.Buttons: null;
                    sendData.Urls = (vm.selectedRecord.Urls != undefined && vm.selectedRecord.Urls != '') ? vm.selectedRecord.Urls: null;
                    sendData.ListButton = vm.selectedRecord.ListButton != undefined  ? vm.selectedRecord.ListButton : "";
                    sendData.ListSections = (vm.selectedRecord.ListSections != undefined && vm.selectedRecord.ListSections != '') ? vm.selectedRecord.ListSections : null;
                    sendData.ListSectionRows = (vm.selectedRecord.ListSectionRows != undefined && vm.selectedRecord.ListSectionRows != '') ? vm.selectedRecord.ListSectionRows : null;
                    FoneclubeService.saveWATemplates(sendData).then(function (result) {
                        if(result){
                            alert("Data Saved Successfully");
                            //location.reload();
                        }
                    });
                    
                }
            }
  
            function editTemplate() 
            {
               var employeeToEdit = vm.templates.find(x => x.Id === vm.selectedRecord.Id);
               console.log('-- WA Edit --');
               
               if(employeeToEdit){
                var sendData = JSON.parse(JSON.stringify(vm.selectedRecord));
                sendData.Trigger = vm.selectedRecord.Trigger.split(',');
                sendData.Buttons = (vm.selectedRecord.Buttons != undefined && vm.selectedRecord.Buttons != '') ? vm.selectedRecord.Buttons: null;
                sendData.Urls = (vm.selectedRecord.Urls != undefined && vm.selectedRecord.Urls != '') ? vm.selectedRecord.Urls: null;
                sendData.ListButton = vm.selectedRecord.ListButton != undefined  ? vm.selectedRecord.ListButton : "";
                sendData.ListSections = (vm.selectedRecord.ListSections != undefined && vm.selectedRecord.ListSections != '') ? vm.selectedRecord.ListSections : null;
                sendData.ListSectionRows = (vm.selectedRecord.ListSectionRows != undefined && vm.selectedRecord.ListSectionRows != '') ? vm.selectedRecord.ListSectionRows : null;
                FoneclubeService.saveWATemplates(sendData).then(function (result) {
                    if(result){
                        alert("Data Saved Successfully");
                        //location.reload();
                    }
                });
               }
               else{
                addTemplate();
               }
             }

             function sendTemplate(){
                var sendData = JSON.parse(JSON.stringify(vm.selectedRecord));
                sendData.Trigger = vm.selectedRecord.Trigger.split(',');
                sendData.Buttons = (vm.selectedRecord.Buttons != undefined && vm.selectedRecord.Buttons != '') ? vm.selectedRecord.Buttons: null;
                sendData.Urls = (vm.selectedRecord.Urls != undefined && vm.selectedRecord.Urls != '') ? vm.selectedRecord.Urls: null;
                sendData.ListButton = vm.selectedRecord.ListButton != undefined  ? vm.selectedRecord.ListButton : "";
                sendData.ListSections = (vm.selectedRecord.ListSections != undefined && vm.selectedRecord.ListSections != '') ? vm.selectedRecord.ListSections : null;
                sendData.ListSectionRows = (vm.selectedRecord.ListSectionRows != undefined && vm.selectedRecord.ListSectionRows != '') ? vm.selectedRecord.ListSectionRows : null;
            
                var data = {
                  PersonId : 1,
                  PhoneNumbers : "5521982008200,5521981908190,919665353881",
                  Template : sendData
                };
         
                FoneclubeService.sendGenericMsg(data).then(function(result)
                {
                    if(result == "Sent")
                    {
                        DialogFactory.showMessageDialog({mensagem:'Message sent successfully via whatsapp'});
                    }
                    else if(result == "Partial")
                    {
                        DialogFactory.showMessageDialog({mensagem:'Message partially sent to via whatsapp'});
                    }         
                    else
                    {
                        DialogFactory.showMessageDialog({mensagem:'Error occured while sending WhatsApp Message'});
                    }
                });
             }
        }
})();
    