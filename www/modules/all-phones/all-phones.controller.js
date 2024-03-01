(function() {
    'use strict';
    
        angular
            .module('foneClub')
            .controller('AllPhonesController', AllPhonesController);
    
      AllPhonesController.inject = ['FlowManagerService', 'FoneclubeService', 'PagarmeService', 'NgTableParams', '$scope'];
      function AllPhonesController(FlowManagerService, FoneclubeService, PagarmeService, NgTableParams, $scope) {
            
        var vm = this;
        vm.planOptions;
        vm.result;
        vm.filtroCliente = false;

        vm.changeFilterCliente = changeFilterCliente;
        vm.onClickDesassociar = onClickDesassociar; 
        vm.changeSelectPlan = changeSelectPlan;
        vm.onClickTrocaPlano = onClickTrocaPlano;

        FoneclubeService.getAllPhonesStatus().then(function(result){

            FoneclubeService.getPlanOptios().then(function(result){

                vm.planOptions = result;
                // vm.planOptions.forEach(plan => {
                //     console.log(plan)
                // });

            FoneclubeService.getStatusTelefonesOperadora().then(function (result) {

                

                for(var i in vm.result)
                {
                    var telefone = vm.result[i].linhaLivreOperadora;
                    vm.result[i].usoLinha = "Sem dados na SP";
                    vm.result[i].plano = "Sem dados na SP";
                    vm.result[i].divergente = -1;

                    for(var r in result){
                        if(telefone == result[r].phone){

                            var operadora; 
                            if(result[r].operadora == 1)
                            {
                                operadora = 'CLARO'
                            } 
                            else if(result[r].operadora == 2)
                            {
                                operadora = 'VIVO'
                            }

                            vm.result[i].plano = operadora + " " + result[r].plano;
                            vm.result[i].usoLinha = result[r].usoLinha ? "Sim" : "Não";

                            // console.log('telefone')
                            // console.log(vm.result[i])
                            
                            // var phoneLine = vm.result[i];
                            // var planoFoneclube = phoneLine.txtPlanoFoneclube;
                            // var planoOperadora = phoneLine.plano;                            
                        }
                    }
                }

                // console.log('tentando getStatusDivergencia')
                FoneclubeService.getStatusDivergencia().then(function (result) {
                    
                    // console.log('getStatusDivergencia')
                    for(var l in vm.result){
                        
                        // debugger;
                        vm.result[l].divergente = 'Não';
                        for(var i in result){
                            if(vm.result[l].linhaLivreOperadora == result[i].phone){
                                
                                if((result[i].bitOperatorDivergent || result[i].bitPlanDivergent)) {
                                    vm.result[l].divergente = 'Sim';
                                    vm.result[l].operatorDivergent = result[i].bitOperatorDivergent
                                    vm.result[l].planDivergent = result[i].bitOperatorDivergent
                                }
                            }
                        }

                        if(vm.result[l].plano == 'Sem dados na SP' || vm.result[l].plano == 'VIVO Sem Plano deinido na SP'){
                            vm.result[l].divergente = 'Sem dados na SP';  
                        }
                    }

                })
                
                vm.result
                
            })

        })
            

            for(var i in result){
                result[i].desativada = false;

                if(result[i].operadora == 1)
                    result[i].operadoraDescription = 'CLARO'
                else
                    result[i].operadoraDescription = 'VIVO'

                if(result[i].idPhone == null)
                    result[i].PhoneText = 'Não'
                else
                    result[i].PhoneText = 'Sim'

            }

            vm.result = result

            vm.initialParams = {
                filter: { desativada: false },
                count: 1000 // initial page size
              };
            vm.initialSettings = {
            // page size buttons (right set of buttons in demo)
            counts: [50,100,500, 1000],
            // determines the pager buttons (left set of buttons in demo)
            paginationMaxBlocks: 10,
            paginationMinBlocks: 1,
             
            dataset: vm.result
            
            };

            vm.tableParams = new NgTableParams(vm.initialParams, vm.initialSettings)
            
        })

        $scope.$watch("vm.tableParams", function () {            
            // console.log('Works')
        });

        function changeFilterCliente(){
            // console.log('changeFilterCliente')
            vm.filtroCliente = !vm.filtroCliente;

            // remonta lista e atualiza componente

            //filtra direto na tabela
        }

        function onClickDesassociar(linha){
            
            var confirmation = confirm("Deseja desativar essa linha?");
            if (confirmation) {
                FoneclubeService.postDesassociarLinha(linha.idPhone).then(function(result){
                    if(result){
                        alert('Telefone desativado com sucesso')

                        linha.idPhone = null;
                        linha.txtName = ''
                        linha.txtNickname = ''
                        linha.intIdPerson = ''
                        linha.txtPlanoFoneclube = ''
                        linha.PhoneText = 'Não'
                        
                        // caso seja pra limpar
                        // linha.desativada = true;
                        // vm.tableParams.reload();
                    }
                    else{
                        alert('Não foi possível desativar essa linha do cliente')
                    }
                })
                .catch(function (error) {
                    alert('Não foi possível desativar essa linha do cliente')
                });
            }  
        }

        function changeSelectPlan(linha){
            // console.log('changeSelectPlan')
            
            var confirmation = confirm("Deseja trocar o plano da linha " + linha.linhaLivreOperadora + " para, " +  linha.selectedPlan.Description + ' ?');
            if (confirmation) {
                FoneclubeService.postUpdatePhonePlan({Id:linha.idPhone, IdPlanOption:linha.selectedPlan.Id}).then(function(result){
                    if(result)
                    {
                        alert('Plano alterado com sucesso')
                        linha.txtPlanoFoneclube = linha.selectedPlan.Description;
                        linha.editPlan = false; 
                        linha.divergente = 'Pendente Refresh';
                        FoneclubeService.getStatusDivergencia().then(function (result) {
                            
                            for(var i in result){
                                if(result[i].phone == linha.linhaLivreOperadora){
                                    // debugger;
                                    if(result[i].bitOperatorDivergent || result[i].bitPlanDivergent) {
                                        linha.divergente = 'Sim';
                                        linha.operatorDivergent = result[i].bitOperatorDivergent
                                        linha.planDivergent = result[i].bitOperatorDivergent
                                    }
                                    else{
                                        linha.divergente = 'Não';
                                        linha.operatorDivergent = result[i].bitOperatorDivergent
                                        linha.planDivergent = result[i].bitOperatorDivergent
                                    }
                                }
                            }
                        })
                    }
                    else{
                        alert('Não foi possível alterar o plano dessa linha')
                        linha.editPlan = false; 
                    }
                    
                })
                
            }
            else{
                linha.editPlan = false; 
            }
        }

        function onClickTrocaPlano(linha){
            // console.log("onClickTrocaPlano")
            // debugger
            if(linha.txtPlanoFoneclube == null)
            {
                alert('Essa linha não tem cliente associado por isso não é possível trocar plano foneclube')
            }
            else
                linha.editPlan = true;
        }

        $scope.$watch("vm.searchUser", function () {
            try{
                var search = vm.searchUser.replace(/[!#$%&'()*+,-./:;?@[\\\]_`{|}~]/g, '');
                var isnum = /^\d+$/.test(search.replace(' ', ''));
                
                if(isnum)
                    vm.searchIgnoreAccent = search.replace(' ', '');
                else    
                    vm.searchIgnoreAccent = search;
    
                vm.tableParams.filter({ $: vm.searchIgnoreAccent });
                vm.tableParams.reload();
            }
            catch(e){}
            
         });
        
        
      }
    })();
    