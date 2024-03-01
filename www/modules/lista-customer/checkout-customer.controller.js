(function() {
'use strict';

    angular
        .module('foneClub')
        .controller('CheckoutCustomerModalController', CheckoutCustomerModalController);

    CheckoutCustomerModalController.inject = ['ViewModelUtilsService', 'PagarmeService'];
    function CheckoutCustomerModalController(ViewModelUtilsService, PagarmeService) {
        var vm = this;
        var customer = ViewModelUtilsService.modalData;
        vm.onTapCard = onTapCard;
        vm.onTapPagar = onTapPagar;
        vm.cancelarPagamento = etapaEscolhaCartao;        
        initCardList();
        etapaEscolhaCartao();

        function initCardList(){
            console.log(customer.id)
            PagarmeService.getCard(customer.id)
            .then(function(result){
                vm.cards = result;
                console.log(result)
            })
            .catch(function(error){
                console.log(error);
                vm.message = 'falha ao recuperar cartão';
            });

        }

        function onTapCard(card){

            vm.card = card;
            etapaQuantia();

        }

        function onTapPagar(){

            vm.message = 'Transação iniciada';
            var customer;

            if(!vm.customer.address || !vm.customer.phone || !vm.customer.email || !vm.customer.document_number || !vm.customer.name)
            {
                customer = {
                    'name' : vm.customer.name,
                    'document_number' : vm.customer.document_number,
                    'email' : vm.customer.email
                    ,
                    'address' : {
                        'street' : 'empty',
                        'street_number' : '10',
                        'neighborhood' : 'empty',
                        'zipcode' : '01452000'
                    },
                    'phone' : {
                        'ddd' : '00',
                        'number' : '000000000'
                    }
                }
                //vm.message = 'Usuário incompleto';
            }

            console.log('on tap pagar');
            console.log(vm.card.id);
            console.log(vm.customer);
            console.log(vm.amount);
            console.log(customer);

             PagarmeService.postTransactionExistentCard(vm.amount, vm.card.id, customer)
             .then(function(result){
                console.log('nova transac ' + result);
                vm.message = 'Transação efetuada';
                PagarmeService.postCaptureTransaction(result.token, vm.amount).then(function(result){

                        vm.message = 'Transação concluída';
                    })
                    .catch(function(error){
                        try{
                            vm.message = 'Erro na captura da transação' + error.status;
                        }
                        catch(erro){
                            vm.message = 'Erro na captura da transação'
                        }
                        console.log(error);

                    });
             })


            console.log(customer)


        }

        function etapaEscolhaCartao(){
            vm.etapaEscolhaCartao = true;
            vm.etapaQuantia = false;
            vm.amount = '';
        }

        function etapaQuantia(){
            vm.etapaEscolhaCartao = false;
            vm.etapaQuantia = true;
        }
    }
})();