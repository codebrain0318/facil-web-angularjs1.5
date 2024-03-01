(function() {
'use strict';

    angular
        .module('foneClub')
        .controller('RepeatCardController', RepeatCardController);

    RepeatCardController.inject = ['ViewModelUtilsService', 'PagarmeService', 'MainUtils', 'FoneclubeService', 'DialogFactory', 'UtilsService', '$filter'];
    function RepeatCardController(ViewModelUtilsService, PagarmeService, MainUtils, FoneclubeService, DialogFactory, UtilsService, $filter) {
        
        var vm = this;
        var customer = ViewModelUtilsService.modalCardData;  
        vm.customer = customer;
        var payment=ViewModelUtilsService.modalRepeatCardData;
        var newCustomer;
        var cardData;
        var CARTAO = 1;
        
        vm.onTapPagar = onTapPagar;
        vm.onTapConfirmarPagamento = onTapConfirmarPagamento;
        vm.onTapCancel = onTapCancel;
        vm.onTapPaymentHistoryDetail = onTapPaymentHistoryDetail;

        vm.years = [2021, 2020,2019,2018,2017,2016,2015,2014,2013,2012,2011,2010];
        vm.months = [1,2,3,4,5,6,7,8,9,10,11,12];
        
        vm.year = new Date().getFullYear().toString();
        vm.month = (new Date().getMonth() + 1).toString();

        vm.etapaDados = true;
        

        function onTapConfirmarPagamento() {
            // debugger
            if (!getAddress(vm.customer) || !getContactPhone(vm.customer)) {
                return;
            }
            vm.etapaDados = false;
            vm.etapaConfirmacao = true;
        }
        
        function onTapCancel(number){
            vm.etapaDados = true;
            vm.etapaConfirmacao = false;
            if (number == 1){
                vm.amount = 0;
                vm.comment = '';
                vm.cobrancaRealizada = false;   
            }
        }
        
        vm.cardHolderName = '';
        vm.cardNumber = '';
        vm.cardExpirationMonth = '';
        vm.cardExpirationYear = '';
        vm.cardCVV = '';
        vm.amount = '';
        vm.statusTransaction = ''
        vm.comment = '';
        vm.cobrancaRealizada = false;
        if (vm.customer.CacheIn) {
            vm.amount = vm.customer.CacheIn;
        }

        console.log('RepeatCardController');

        var customerId = customer.Id;
        newCustomer = {
                    'name' : customer.Name,
                    'document_number' : customer.DocumentNumber,
                    'email' : customer.Email,
                    'address' : getAddress(customer),
                    'phone' : getContactPhone(customer)
        }

        vm.newCustomer = newCustomer;


        if(!customer.IdPagarme)
        {
            console.log('não tem conta no pagarme >>>');
            //não tem conta no pagarme ainda
        }
        else
        {
            //tem conta no pagarme
            //customer.IdPagarme
        }

        function onTapPagar(){
            // debugger
            cardData = getCardData();

             console.log("-----------------------")
             console.log(newCustomer)
             console.log(cardData)
             console.log(vm.amount);

            if(parseInt(vm.amount) < 100)
            {
                DialogFactory.showMessageDialog({mensagem:'Não é permitido cobranças a baixo de 1 Real', titulo: 'Aviso'});                            
                return;
            }

            paymentNewCustomer();
        }

        function getContactPhone(customer){
            var contacts = UtilsService.getContactPhoneFromPhones(customer.Phones);
            if (!contacts || contacts.length == 0  || contacts[0].DDD == '' || contacts[0].Number == '') {
                DialogFactory.showMessageDialog({titulo: 'Aviso', mensagem: 'É necessário cadastrar Telefone de Contato para este cliente.'});
                return null;
            } else {
                return {
                    'ddd' : contacts[0].DDD.toString(),
                    'number' : contacts[0].Number.toString()
                }
            }
        }
        
        function getAddress(customer) {
            var address = customer.Adresses;
            if (!address || address.length == 0 ) {
                DialogFactory.showMessageDialog({titulo: 'Aviso', mensagem: 'É necessário cadastrar um Endereço para este cliente.'});
                return null;
            } else {
                return {
                    'street' : address[0].Street,
                    'street_number' : address[0].StreetNumber,
                    'neighborhood' : address[0].Neighborhood,
                    'zipcode' : address[0].Cep,
                    'city': address[0].City,
                    'uf': address[0].State
                }
            }
        }

        function getCardData(){
            var expirationMonth = vm.cardExpirationMonth;

            return {
                cardHolderName: vm.cardHolderName.toUpperCase(),
                cardExpirationMonth: expirationMonth,
                cardExpirationYear: vm.cardExpirationYear,
                cardNumber: vm.cardNumber,
                cardCVV:vm.cardCVV
            }
        }

        function paymentNewCustomer(){

            // debugger;
            vm.disableTapPay = true;

            PagarmeService.generateCardHash(cardData).then(function(cardHash){

                vm.statusTransaction = 'Criptografando dados cartão';
                // debugger;
                PagarmeService.postTransactionCard(vm.amount, cardHash, newCustomer)
                .then(function(result){

                    // debugger;
                    vm.statusTransaction = 'Transação em andamento';


                    PagarmeService.postCaptureTransaction(result.token, vm.amount).then(function(result){
                      // debugger;
                      vm.TransactionId = result.tid;

                        var customCustomer = {
                            Id:vm.customer.Id,
                            IdPagarme:result.customer.id
                        }

                        var emailObject = {
                            'Id':vm.customer.Id,
                            'To': vm.newCustomer.email, //vm.newCustomer.email
                            'TargetName' : vm.newCustomer.name,
                            'TargetTextBlue' : $filter('currency')(vm.amount / 100, ""),
                            // 'TargetSecondaryText' : vm.commentBoleto,
                            'TemplateType' : 1
                        }

                        try{
                            var chargingLog = {
                                'customer': newCustomer,
                                'ammount': vm.amount,
                                'pagarmeResponse': result,
                                'foneclubeComment' : vm.comment
                            };
                            
                            // debugger
                            FoneclubeService.postChargingLog(JSON.stringify(chargingLog), customerId).then(function(result){
                                console.log(result);
                            })
                            .catch(function(error){
                                console.log('catch error');
                                console.log(error);
                                var teste1 = emailObject;
                                var teste2 = existentCustomer;
                                var teste3 = vm.amount;
                                alert("Alerta a cobrança não pode ser salva, se possível pare a tela aqui sem atualizar nada e entre em contato com cardozo")
                            });
                        }
                        catch(erro){
                            var teste1 = emailObject;
                            var teste2 = existentCustomer;
                            var teste3 = vm.amount;
                            alert("Alerta a cobrança não pode ser salva, se possível pare a tela aqui sem atualizar nada e entre em contato com cardozo")
                        }

                        FoneclubeService.postSendEmail(emailObject).then(function(result){
                            console.log('FoneclubeService.postHistoryPayment');
                            console.log(result);
                        })
                        .catch(function(error){
                            console.log('catch error');
                            console.log(error);
                        });
                        
                        FoneclubeService.postUpdatePagarmeID(customCustomer).then(function(result){
                            console.log('FoneclubeService.postUpdatePagarmeID');
                            console.log(result);

                            vm.statusTransaction = 'Transação concluída';
                            vm.disableTapPay = false;
                            vm.cobrancaRealizada = true;  
                            saveHistoryPayment();
                        })
                        .catch(function(error){
                            console.log('catch error');
                            console.log(error);

                            vm.statusTransaction = 'Transação concluída sem associar ID pagarme, guarde o ID: result.customer.id , e informe o desenvolvimento';
                            vm.disableTapPay = false;
                            vm.cobrancaRealizada = true; 
                            saveHistoryPayment();
                            
                        });
                        // result.customer.id


                        
                    })
                    .catch(function(error){
                        try{        
                            DialogFactory.showMessageDialog({mensagem:'Erro na captura da transação' + error.status, titulo: 'Aviso'});                                                  

                        }
                        catch(erro){  
                            DialogFactory.showMessageDialog({mensagem:'Erro na captura da transação', titulo: 'Aviso'});                                                        
                        }
                        console.log(error);

                    });


                })
                .catch(function(error){
                    try{
                        console.log(error.data.errors)
                        vm.etapaDados = true;
                        vm.disableTapPay = false;
                        vm.etapaConfirmacao = false;
                        error.data.errors.forEach(function(erro) {
                            DialogFactory.showMessageDialog({mensagem:'Erro na transação: ' + erro.message, titulo: 'Aviso'});                              
                        }, this);

                    }
                    catch(erro){
                        vm.etapaDados = true;
                        vm.disableTapPay = false;
                        vm.etapaConfirmacao = false;
                        DialogFactory.showMessageDialog({mensagem:'Erro na transação', titulo: 'Aviso'});                                                      
                    }

                    console.log(error);
                });


            })
            .catch(function(error){
                var erro;
                for(var i in error)
                {

                    erro = error[i];
                }
                vm.etapaDados = true;
                vm.disableTapPay = false;
                vm.etapaConfirmacao = false;
                DialogFactory.showMessageDialog({mensagem:'Erro na transação '+ erro, titulo: 'Aviso'});                 

            });
        }

        function saveHistoryPayment(){

            try
            {
                console.log('saveHistoryPayment');
                console.log(MainUtils.getAgent());
                console.log(vm.comment);
                //vm.comment
                var customerCharging = {
                    Id: vm.customer.Id,
                    Charging:{
                        Comment:vm.comment,
                        Ammount: vm.amount,
                        CollectorName: MainUtils.getAgent(),
                        PaymentType: CARTAO,
                        TransactionId: vm.TransactionId
                    }
                }


                FoneclubeService.postHistoryPayment(customerCharging).then(function(result){
                    console.log('FoneclubeService.postHistoryPayment');
                    console.log(result);
                })
                .catch(function(error){
                    console.log('catch error');
                    console.log(error);
                });

            }
            catch(erro){

            }


        }
        
        function onTapPaymentHistoryDetail(history) {
            ViewModelUtilsService.showModalPaymentHistoryDetail(history, vm.customer);
        }


    }
})();