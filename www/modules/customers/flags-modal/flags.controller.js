(function() {
  'use strict';

  angular.module('foneClub').controller('FlagController', FlagController);

  FlagController.inject = [
    'ViewModelUtilsService',
    'PagarmeService',
    'MainUtils',
    'FoneclubeService',
    'DialogFactory',
    'UtilsService'
  ];

  function FlagController(
    ViewModelUtilsService,
    PagarmeService,
    MainUtils,
    FoneclubeService,
    DialogFactory,
    UtilsService
  ) {

    console.log('--- FlagController ---')
    var vm = this;
    vm.onTapAddComment = onTapAddComment;
    vm.changeFlag = changeFlag;
    vm.changeSelectedPhone = changeSelectedPhone;

    var customer = ViewModelUtilsService.modalFlagData;
    vm.customer = customer;

    vm.customerPhones = null;
    vm.flagsTypes = null;
    vm.txtDescription = '';
    vm.showPhones = true;
    vm.changePlan = changePlan;

    if(customer.flagPhone)
      vm.showPhones = false;

    if(customer.selectedPhone != null){
      debugger
      vm.selectedPhone = customer.selectedPhone.Id
    }
        

    FoneclubeService.getFlagsTypes(!vm.showPhones).then(function(result){
      vm.flagsTypes = result;
    })

    FoneclubeService.getPlans().then(function(result){
      vm.allPlans = result;
    })

    FoneclubeService.getPersonPhones(customer.Id).then(function(result){
      vm.customerPhones = result;
    })

    function changeSelectedPhone(phone){
      console.log('changeSelectedPhone = ')
      vm.selectedPhone = phone.PersonPhoneId;
    }

    function changeFlag(flag){
      
      vm.hasEmailTosend = false;
      var selectedFlag;
      vm.selectedFlag = flag;

      for(var i in vm.flagsTypes){
        if(flag.IdType == vm.flagsTypes[i].IdType)
        {
          selectedFlag = vm.flagsTypes[i]
        }
      }

      vm.hasEmailTosend = (selectedFlag.FullEmail.Title != "")
      

      debugger
      
      vm.email = selectedFlag.FullEmail.To
      vm.body = selectedFlag.FullEmail.Body
      vm.subject = selectedFlag.FullEmail.Title
      vm.cc = selectedFlag.FullEmail.Cc
      vm.bcc = selectedFlag.FullEmail.Bcc

      if(vm.selectedFlag.IdType == 1 || vm.selectedFlag.IdType == 2 || vm.selectedFlag.IdType == 11)
        vm.showPlanList = true;
      else
        vm.showPlanList = false;

    }

    function onTapAddComment(data, closeThisDialog) {

      debugger;
      if(vm.selectedFlag == null){
        alert('Não é possível atribuir flag sem selecionar qual')
        return;
      }
      else if((vm.selectedplan == null || vm.selectedplan == undefined) && (vm.selectedFlag.IdType == 1 || vm.selectedFlag.IdType == 2)){
        alert('Não é possível atribuir flag desse tipo sem selecionar qual plano')
        return;
      }
      else if(vm.hasEmailTosend && (vm.selectedPhone == null || vm.selectedPhone == undefined)){
        alert('Não é possível atribuir flag e enviar email sem selecionar telefone')
        return;
      }
      else {

        closeThisDialog(0)
        var showLoader = DialogFactory.showLoader('Fazendo envio...');

        var fullEmail = { 
          To: vm.email,
          Title: vm.subject, 
          Body: vm.body, 
          Cc: vm.cc, 
          Bcc: vm.bcc 
        };
          
        var flag;
  
        if(vm.selectedPhone == null){
          flag = {
            'IdFlagType' : vm.selectedFlag.IdType,
            'Description': vm.txtDescription,
            'PendingInteraction': vm.bitPendingInteraction == true,
            'IdPerson': customer.Id,
            'FullEmail':fullEmail
          };
        }
        else{
          flag = {
            'IdFlagType' : vm.selectedFlag.IdType,
            'Description': vm.txtDescription,
            'PendingInteraction': vm.bitPendingInteraction == true,
            'IdPhone': vm.selectedPhone,
            'FullEmail':fullEmail
          };
          
        }
  
        if(vm.showPlanList){
          flag.PlanId = vm.selectedplan.Id
        }

        FoneclubeService.postPersonFlag(flag).then(function(result) {
          debugger
          console.log(result);
          if(result.EmailSuccess &&  result.FlagSuccess)
          {
            DialogFactory.showAlertDialog({ message: 'Flag inserida com sucesso e email enviado' });
          }
          else if(result.EmailSuccess && !result.FlagSuccess){
            DialogFactory.showAlertDialog({ message: 'Inserção de flag falhou' });
          }
          else if(!result.EmailSuccess && result.FlagSuccess){
            DialogFactory.showAlertDialog({ message: 'Flag inserida com sucesso' });
          }
  
          showLoader.close();
  
        }); 
      }


    }

    function changePlan(plan){
      console.log('changePlan')
      console.log(plan)
      debugger
      vm.selectedplan = plan
    }

  }
})();
