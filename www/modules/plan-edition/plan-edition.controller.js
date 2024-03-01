(function() {
    'use strict';
    
        angular
            .module('foneClub')
            .controller('PlanEditionController', PlanEditionController);
    
      PlanEditionController.inject = ['FlowManagerService', 'FoneclubeService', 'PagarmeService'];
      function PlanEditionController(FlowManagerService, FoneclubeService, PagarmeService) {
            var vm = this;
            vm.ativacao = [true,false];
            vm.planOperator = ['CLARO','VIVO']
            vm.onClickEditPlan = onClickEditPlan;
            vm.onClickEditService = onClickEditService;
            vm.onClickAddService = onClickAddService;
            vm.onClickAddPlan = onClickAddPlan;
            // vm.operator = [{id:1, operator:'CLARO'},{id:2, operator:'VIVO'}]
            
            console.log('-- Plan Edition --')

            FoneclubeService.getAllPlanOptios().then(function (result) {
                console.log('result')
                
                vm.allPlans = result;
                debugger;

                // vm.allPlans.push({
                //     'Active': true,
                //     'Cost': 0,
                //     'Description': "",
                //     'Id': -1,
                //     'IdOperator': 1,
                //     'Value': 0
                // })
                
                for(var i in vm.allPlans){
                    if(vm.allPlans[i].IdOperator == 1)
                        vm.allPlans[i].currentPlan = 'CLARO'
                    else
                        vm.allPlans[i].currentPlan = 'VIVO'
                    
                }

                console.log(result)
            })

            

            FoneclubeService.getAllServices().then(function (result) {
                console.log('result services')
                console.log(result)
                
                debugger
                for(var i in result){
                    if(result[i].Editavel == null){
                        result[i].Editavel = false;
                    }  
                }

                vm.services = result;

                // vm.services.push({
                //     'AmountFoneclube': '',
                //     'AmountOperadora': '',
                //     'Assinatura': false,
                //     'Descricao': '',
                //     'Editavel': false,
                //     'ExtraOption': false,
                //     'Id': -1
                // })
            })

            function onClickEditService(service){
                console.log('edit service:')
                console.log(service)
                debugger
                service.Assinatura = service.selectedAssinatura
                service.Editavel = service.selectedEditavel
                service.ExtraOption = service.selectedExtraOption

                FoneclubeService.postUpdateServiceFoneclube(service).then(function (result) {
                    console.log('result services postUpdateServiceFoneclube')
                    console.log(result)
                    if(result)
                        alert('Serviço atualizado')
                    else{
                        alert('Serviço não atualizado')
                    }    
                })
            }

            function onClickEditPlan(plan){
                
                plan.Active = plan.selectedActive;
                
                if(plan.selectedPlan == 'CLARO')
                    plan.IdOperator = 1
                else
                    plan.IdOperator = 2

                
                FoneclubeService.postUpdatePhonePlan(plan).then(function (result) {
                    console.log('result services postUpdatePhonePlan')
                    console.log(result)
                    if(result)
                        alert('Plano atualizado')
                    else{
                        alert('Plano não atualizado')
                    } 
                    
                })
            }

            function onClickAddService(service){
                debugger
            }

            function onClickAddPlan(plan){
                debugger
            }

        }
    })();
    