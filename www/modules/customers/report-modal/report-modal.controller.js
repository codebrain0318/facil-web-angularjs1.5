(function() {
    'use strict';

        angular
            .module('foneClub')
            .controller('ReportModalController', ReportModalController);


        ReportModalController.inject = ['ViewModelUtilsService', 'FoneclubeService', 'DialogFactory', 'UtilsService', 'localStorageService', '$filter'];

        function ReportModalController(ViewModelUtilsService, FoneclubeService, DialogFactory, UtilsService, localStorageService, $filter) {

            console.log('--- ReportModalController ---');
            var vm = this;
            vm.fontcolor = "red";
            var customer = ViewModelUtilsService.modalData;
            vm.customer = customer;
            vm.templates = [];
            vm.userphone = "";
            vm.invitee = "";
            vm.isSelected = true;
            vm.selectedtemplate = "";
            vm.query = "";
            vm.choices = [
              {Id: 4, Choice : "Generic message" },
              {Id: 1, Choice : "Renviar ultima Cobrança"},
              {Id: 2, Choice : "t.marketing1" },
              {Id: 3, Choice : "t.markeging2" }
            ];
            vm.templateNames = [];
            vm.onTapSubmit = onTapSubmit;
            vm.validatePhone = validatePhone;
            vm.showTemplateModal = showTemplateModal;
            vm.selectItem = selectItem;
            init();

            function init(){
                 localStorageService.set("SelectedTemplate", null);
                 if(vm.customer.DefaultWAPhones == undefined || vm.customer.DefaultWAPhones == null)
                   vm.userphone = customer.Phones.filter(x=>!x.IsFoneclube)[0].DDD + customer.Phones.filter(x=>!x.IsFoneclube)[0].Number;
                 else
                   vm.userphone = vm.customer.DefaultWAPhones;

                 validatePhone();
                 FoneclubeService.getWATemplates().then(function (result) {
                     debugger;
                     if(result)
                     {
                        vm.templates = result;
                        vm.templateNames = result.map(x=> x.TemplateName).filter(onlyUnique).sort((a,b) => (a > b) ? 1 : ((b > a) ? -1 : 0));
                        vm.templates = vm.templates.sort((a,b) => (a.TemplateName > b.TemplateName) ? 1 : ((b.TemplateName > a.   TemplateName) ? -1 : 0));
                     }
                 });  
            }

            function onlyUnique(value, index, self) {
              return self.indexOf(value) === index;
            }

            function selectItem(item){
              vm.isSelected = false;
            }

            function validatePhone(){
              if(vm.userphone){
                try{
                vm.customersInvalidPhones = "";
                var checkPhoneNums = vm.userphone.replace(/[^0-9\.,]/g, "");
                FoneclubeService.validatePhoneForWA(checkPhoneNums).then(function(result){
                  if(result){
                    var validNumbers = result.split('|')[0];
                    var invalidNumbers = result.split('|')[1];
                    vm.userphone = validNumbers;
                    if(invalidNumbers){
                      vm.customersInvalidPhones = "Invlaid number(s) : "+ invalidNumbers;
                      vm.fontcolor = "font-red";
                    }
                    else{
                      vm.customersInvalidPhones ="Validated";
                      vm.fontcolor = "font-green";
                    }
                  }
                  else{
                    DialogFactory.showMessageDialog({mensagem:'Error occured while validating phone numbers'});
                  }
                });
              }
              catch(ex){
                DialogFactory.showMessageDialog({mensagem:'Error occured while validating phone numbers'});
              }
              }
            }

            function showTemplateModal(templateName){
              vm.selectedtemplate = templateName;
              vm.query = templateName;
              vm.isSelected = true

              debugger;
              var selectedTemplate = vm.templates.find(x=>x.TemplateName == vm.selectedtemplate);
              if(selectedTemplate){
              
                var data = {
                  Customer: vm.customer,
                  PhoneNumbers : vm.userphone,
                  SelectedRecord: selectedTemplate
                }
                ViewModelUtilsService.showModalWATemplateEdit(data);
              }
            }

            function onTapSubmit(eventSelected)
            {
              debugger;
              switch(eventSelected)
              {
                case 1: // Send Last charge summary
                  {
                    FoneclubeService.getChargeAndServiceOrderHistory(customer.Id).then(function (result) {

		              	if(result)
		              	{
		              		var history = result[0];
		              		if(history){
		              			if(history.Charges.PaymentStatusDescription != "Paid")
		              			{
                          FoneclubeService.sendChargeSummary(history.Charges.Id, vm.userphone).then(function(result){
                            if(result == "Sent")
                                DialogFactory.showMessageDialog({mensagem:'Message sent successfully to '+ customer.Name +' via whatsapp'});
                            else if(result == "Partial")
                                DialogFactory.showMessageDialog({mensagem:'Message partially sent to '+ customer.Name +' via whatsapp'});
                            else
                                DialogFactory.showMessageDialog({mensagem:'Error occured while sending message to '+ customer.Name +' via whatsapp'});
                          });
		              			}
		              			else{
		              				DialogFactory.showMessageDialog({mensagem:'User already paid his last charge'});
		              			}
		              		}
		              	}
		              });
                  }
                  break;
                  case 2:
                  case 3:
                    {
                      var selectedTemplate = localStorageService.get("SelectedTemplate");
                      
                      var data = {
                        PersonId : vm.customer.Id,
                        TypeId : parseInt(eventSelected) - 1 ,
                        PhoneNumbers : vm.userphone,
                        Invitee : vm.invitee == undefined ? null: vm.invitee,
                        Template : selectedTemplate == null ? null: selectedTemplate
                      };
                   
                      FoneclubeService.sendMarketingMsg(data).then(function(result){
                        if(result == "Sent")
                          DialogFactory.showMessageDialog({mensagem:'Message sent successfully to '+ customer.Name +' via whatsapp'});
                        else if(result == "Partial")
                          DialogFactory.showMessageDialog({mensagem:'Message partially sent to '+ customer.Name +' via whatsapp'});
                        else
                          DialogFactory.showMessageDialog({mensagem:'Error occured while sending message to '+ customer.Name +' via whatsapp'});
                      });
                    
                  }
                  break;
                  case 4:
                    {
                      var selectedTemplate = vm.templates.find(x=>x.Trigger == "##1MensagemGenerica");
                      if(selectedTemplate){
                        var data = {
                          Customer: vm.customer,
                          PhoneNumbers : vm.userphone,
                          SelectedRecord: selectedTemplate
                        }
                        ViewModelUtilsService.showModalWATemplateEdit(data);
                      }
                    }
              }
              localStorageService.set("SelectedTemplate",null);
              vm.query = "";
            }
        }
    })();
