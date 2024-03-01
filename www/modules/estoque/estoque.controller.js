(function() {
    'use strict';
    
        angular
            .module('foneClub')
            .controller('EstoqueController', EstoqueController);
    
      EstoqueController.inject = ['FlowManagerService', 'FoneclubeService', 'PagarmeService', 'NgTableParams', '$scope', 'DialogFactory'];
      function EstoqueController(FlowManagerService, FoneclubeService, PagarmeService, NgTableParams, $scope, DialogFactory) {
            
        var vm = this;
        vm.result;
        vm.onConfirmaEditcao = onConfirmaEditcao;
        vm.proprietarias = ["FC", "RM", "RM (FC)"]

        // https://codepen.io/cardozo/pen/QVYXeX    
        FoneclubeService.getLinhasEstoque().then(function(result){

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
                        }
                    }
                }

                vm.result
                // debugger;
                
            })
            

            for(var i in result){
                if(result[i].operadora == 1)
                    result[i].operadoraDescription = 'CLARO'
                else
                    result[i].operadoraDescription = 'VIVO'
            }

            vm.result = result

            vm.initialParams = {
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
            // debugger
        })

        
        $scope.$watch("vm.tableParams", function () {
            
            console.log('Works')
        });

        function onConfirmaEditcao(linha){
            console.log('onConfirmaEditcao')
            console.log(linha)

            //public int IdLinha { get; set; }
            // public string linhaLivreOperadora { get; set; }
            // public int? operadora { get; set; }
            // public string descricao { get; set; }
            // public string propriedadeInterna { get; set; }
            // public int propriedadeInternaId { get; set; }

            var estoquePhone = {
                'IdLinha': linha.IdLinha,
                'operadora': 0,
                'propriedadeInternaId': 0,
                'propriedadeInterna': linha.selectedpropriedadeInterna
            }

            FoneclubeService.postPropriedadeIterna(estoquePhone).then(function (result) {
                if(result == true){
                    DialogFactory.showMessageDialog({ mensagem: 'Associação realizada' });
                }
                else{
                    DialogFactory.showMessageDialog({ mensagem: 'Associação com problema' });
                }
            })
        }
        
    
      }
    })();
    