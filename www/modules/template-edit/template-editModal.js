(function () {
    'use strict';
    
     angular.module('foneClub').controller('TemplateEditModalController', TemplateEditModalController);
    
     TemplateEditModalController.inject = ['ViewModelUtilsService',
      'FoneclubeService',
      'DialogFactory',
      'UtilsService',
      '$stateParams', '$filter'];

      function TemplateEditModalController(ViewModelUtilsService,
        FoneclubeService,
        DialogFactory,
        UtilsService,
        $stateParams, $filter) {
            var vm = this;
            debugger;
            vm.selectedRecord = ViewModelUtilsService.modalData;
            vm.isEdit = ViewModelUtilsService.modalData == null? false: true;
            vm.addTemplate = addTemplate;
            vm.editTemplate = editTemplate;
            vm.sendTemplate = sendTemplate;
            vm.AddEdit = vm.isEdit ? "Edit" : "Add";

            loadTemplates();
            console.log('-- WA TemplateEditController --');

            function loadTemplates(){
                 FoneclubeService.getTemplates().then(function (result) {
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
                    sendData.Tipo = vm.selectedRecord.Tipo;
                    sendData.From = vm.selectedRecord.From;
                    sendData.To = vm.selectedRecord.To;
                    sendData.Cc = vm.selectedRecord.Cc;
                    sendData.Bcc = vm.selectedRecord.Bcc;
                    sendData.Subject = vm.selectedRecord.Subject;
                    sendData.Description = vm.selectedRecord.Description;
                    sendData.ShowInAction = vm.selectedRecord.ShowInAction;

                    FoneclubeService.saveTemplate(sendData).then(function (result) {
                        if(result){
                            alert("Data Saved Successfully");
                            //location.reload();
                        }
                    });
                    
                }
            }
  
            function editTemplate() 
            {
               debugger;
               var employeeToEdit = vm.templates.find(x => x.Id === vm.selectedRecord.Id);
               console.log('-- WA Edit --');
               
               if(employeeToEdit){
                var sendData = JSON.parse(JSON.stringify(vm.selectedRecord));
                sendData.Tipo = vm.selectedRecord.Tipo;
                sendData.From = vm.selectedRecord.From;
                sendData.To = vm.selectedRecord.To;
                sendData.Cc = vm.selectedRecord.Cc;
                sendData.Bcc = vm.selectedRecord.Bcc;
                sendData.Subject = vm.selectedRecord.Subject;
                sendData.Description = vm.selectedRecord.Description;
                sendData.ShowInAction = vm.selectedRecord.ShowInAction;
                FoneclubeService.saveTemplate(sendData).then(function (result) {
                    if(result){
                        alert("Data Saved Successfully");
                    }
                });
               }
               else{
                addTemplate();
               }
            }

            function sendTemplate(){
                var sendData = JSON.parse(JSON.stringify(vm.selectedRecord));
                sendData.Tipo = vm.selectedRecord.Tipo;
                sendData.From = vm.selectedRecord.From;
                sendData.To = vm.selectedRecord.To;
                sendData.Cc = vm.selectedRecord.Cc;
                sendData.Bcc = vm.selectedRecord.Bcc;
                sendData.Subject = vm.selectedRecord.Subject;
                sendData.Description = vm.selectedRecord.Description;
         
                FoneclubeService.sendTemplate(sendData).then(function(result){
                    if(result)
                    {
                        DialogFactory.showMessageDialog({mensagem:'Message sent successfully via Email'});
                    }
                    else
                    {
                        DialogFactory.showMessageDialog({mensagem:'Error occured while sending Email Message'});
                    }
                });
             }
        
        }
})();
    