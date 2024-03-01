(function() {
'use strict';

    angular
        .module('foneClub')
        .controller('OrdemServico', OrdemServico);

    OrdemServico.inject = ['$scope', 'ViewModelUtilsService', 'FoneclubeService', 'MainUtils', '$stateParams', 'FlowManagerService'];
    function OrdemServico($scope, ViewModelUtilsService, FoneclubeService, MainUtils, $stateParams, FlowManagerService) {
        var vm = this;
        vm.cpf = $stateParams.data ? $stateParams.data.DocumentNumber : '';
        vm.requesting = true;
        vm.onTapSendOS = onTapSendOS;
        vm.goBack = goBack;
        
        init();
        function init() {
            if (!vm.cpf) {
                FlowManagerService.changeCustomersView();
                return;
            }
            vm.data = {
                warn: true,
                text: ''
            };
            FoneclubeService.getCustomerByCPF(vm.cpf).then(function(result){
                vm.customer = result;
                vm.requesting = false;
            });
        }
        
        function onTapSendOS() {
            MainUtils.setAgent('Cardozo');
            var order = {
                "Id": vm.customer.Id,
                "ServiceOrder": {
                    "AgentName": MainUtils.getAgent(),
                    "AgentId": 1,
                    "PendingInteraction": vm.data.warn,
                    "Description": vm.data.text
                }
            }
            FoneclubeService.postOrderServicePerson(order).then(function(data){
                vm.requesting = false;
                if(result) {
                    FlowManagerService.changeCustomersView();                    
                    DialogFactory.showMessageConfirm({titulo:'Aviso', mensagem:'Ordem de serviço adicionada com sucesso.'})
                    .then(function(result) {
                        if(result) {
                            FoneclubeService.getCustomerByCPF(vm.cpf).then(function(result){
                                ViewModelUtilsService.showModalCustomer(result);
                            });
                        }
                    })                    
                }
            }).catch(function(error) {
                FlowManagerService.changeCustomersView();                   
                DialogFactory.showMessageDialog({mensagem:'Houve um erro.', titulo: 'Aviso'});                                           
            });
        }
        
        function goBack() {
            FlowManagerService.goBack();
            FoneclubeService.getCustomerByCPF(vm.cpf).then(function(result){
                ViewModelUtilsService.showModalCustomer(result);
            });
        }
    }
})();