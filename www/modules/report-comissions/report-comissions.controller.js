(function() {
    'use strict';
    
        angular
            .module('foneClub')
            .controller('ReportComissionController', ReportComissionController);
    
      ReportComissionController.inject = ['FlowManagerService', 'FoneclubeService', 'PagarmeService'];
      function ReportComissionController(FlowManagerService, FoneclubeService, PagarmeService) {

            var vm = this;            
            vm.onSearchHistory = onSearchHistory;
            vm.changeFilterComissionHistory = changeFilterComissionHistory;
            vm.changeFilterBonusHistory = changeFilterBonusHistory;
            vm.changeFilterLogBonus = changeFilterLogBonus;
            vm.exportToExcel = exportToExcel;
            vm.comissionHistory = true;
            
            console.log('-- report comission Edition --');

            function onSearchHistory(){

                vm.resultBonus = []
                vm.resultComission = []
                vm.resultBonusLog = []

                console.log('onSearchHistory');
                
                vm.loading = true;

                if(vm.total == undefined || vm.total == null){
                    vm.total = 1000;
                }

                debugger;
                if(vm.comissionHistory){
                    FoneclubeService.getComissionsOrderHistory(vm.total).then(function (result) {
                        console.log('getComissionsOrderHistory result');
                        console.log(result);

                        vm.resultComission = result;
                        vm.loading = false;
                    })
                }

                if(vm.bonusHistory){
                    FoneclubeService.getBonusOrderHistory(vm.total).then(function (result) {
                        console.log('getBonusOrderHistory result');
                        console.log(result);

                        vm.resultBonus = result;
                        vm.loading = false;
                    })
                }

                if(vm.logBonus){

                    FoneclubeService.getBonusLog().then(function (result) {
                        console.log('getBonusLog result');
                        console.log(result);

                        vm.resultBonusLog = result;
                        vm.loading = false;  
                    })

                }
            }

            function changeFilterComissionHistory(){
                vm.comissionHistory = true;
                vm.bonusHistory = false
                vm.logBonus = false
            }

            function changeFilterBonusHistory(){
                vm.comissionHistory = false;
                vm.bonusHistory = true
                vm.logBonus = false
            }

            function changeFilterLogBonus(){
                vm.comissionHistory = false;
                vm.bonusHistory = false
                vm.logBonus = true
            }

            function exportToExcel(){
                $('.k-grid-excel').trigger("click")
            }
        }
    })();
    