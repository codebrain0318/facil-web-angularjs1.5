(function() {
    'use strict';
    
        angular
            .module('foneClub')
            .controller('RepeatBoletoModalController', RepeatBoletoModalController);
    
    
        RepeatBoletoModalController.inject = ['ViewModelUtilsService', '$scope','PagarmeService', 'MainUtils', 'FoneclubeService', 'DialogFactory', 'UtilsService'];
        function RepeatBoletoModalController(ViewModelUtilsService, $scope,PagarmeService, MainUtils, FoneclubeService, DialogFactory, UtilsService) {

    
            var vm = this;
            // debugger;
            var customer = ViewModelUtilsService.modalBoletoData;
            var payment = ViewModelUtilsService.modalRepeatBoletoData;
           
            
            vm.customer = customer;
            vm.payment=payment;
             
            var newCustomer;
            var BOLETO = 2;
            
            
            vm.etapaDados = true;
            vm.cobrancaRealizada = false;
            //vm.amount = vm.customer.CacheIn ? vm.customer.CacheIn : '';
            vm.comment = '';
            console.log('RepeatBoletoModalController');
            vm.onTapPagar = onTapPagar;
            vm.onTapConfirmarPagamento = onTapConfirmarPagamento;
            vm.onTapCancel = onTapCancel;
            vm.onTapPaymentHistoryDetail = onTapPaymentHistoryDetail;
            vm.enviaEmail = true;
            
            vm.amount=vm.payment.txtAmmountPayment/100;
            vm.commentBoleto='cobrando boleto de '+ (vm.payment.txtAmmountPayment/100);
            vm.comment='cobrando boleto de '+ (vm.payment.txtAmmountPayment/100);

            var customerId = customer.Id;
            var existentCustomer = {
                        'name' : customer.Name,
                        'document_number' : customer.DocumentNumber,
                        'email' : customer.Email,
                        'address' : getAddress(customer),
                        'phone' : getContactPhone(customer)
    
                 }
            /*function RepeatBoletoModalController($scope) {
                // debugger;
                $scope.vm.amount = 121;
                $scope.vm.commentBoleto="0123";
                $scope.vm.comment="123";
            }*/
    
            function onTapConfirmarPagamento() {
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
            
            function onTapPagar(){
    // debugger;
                console.log('tap pagar boleto')
                console.log(parseInt(vm.amount))
                if(parseInt(vm.amount) < 100)
                {
                    DialogFactory.showMessageDialog({titulo: 'Aviso', mensagem: 'Não é permitido cobranças a baixo de 1 Real'});                
                    return;
                }
    
                vm.disableTapPay = true;
                vm.message = 'Iniciando transação';
                vm.instructions = 'FoneClub - 2017'
                // debugger;
                // PagarmeService.postBoleto(vm.amount, vm.commentBoleto, existentCustomer)
                //  .then(function(result){
                //     console.log(result);

                if(!vm.expirationDateField)
                {
                    vm.expirationDateField = 5; 
                }
                else{
                   if(vm.expirationDateField <= 0)
                   {
                    vm.expirationDateField = 5; 
                   } 
                }

                     PagarmeService.postBoletoDirect(vm.amount, vm.commentBoleto, existentCustomer, addExpirationDays(vm.expirationDateField)).then(function(resultCapture){
    
                            
                            
                        try{
                            var chargingLog = {
                                'customer': existentCustomer,
                                'ammount': vm.amount,
                                'pagarmeResponse': resultCapture,
                                'boletoComment':vm.commentBoleto,
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

                            // debugger;
                            if(vm.enviaEmail)
                            {
                                // debugger;
                                var emailObject = {
                                    'To': existentCustomer.email, //existentCustomer.email
                                    'TargetName' : existentCustomer.name,
                                    'TargetTextBlue': resultCapture.boleto_url,
                                    'TargetSecondaryText' : vm.commentBoleto,
                                    'TemplateType' : 2
                                }
        
                                FoneclubeService.postSendEmail(emailObject).then(function(result){
                                    console.log('FoneclubeService.postHistoryPayment');
                                    console.log(result);
                                })
                                .catch(function(error){
                                    console.log('catch error');
                                    console.log(error);
                                });
                            }
                            
    
                            try{
                                vm.TransactionId = resultCapture.tid;
                                PagarmeService.notifyCustomerBoleto(resultCapture.id, existentCustomer.email).then(function(resultNotify){
                                vm.message = 'Boleto gerado com sucesso'
                                vm.cobrancaRealizada = true;
                                vm.disableTapPay = false;
                                    })
                                    .catch(function(error){
                                    try{
                                        vm.message = 'Boleto gerado com sucesso. Sem envio de notificação'
                                        vm.cobrancaRealizada = true;
                                        vm.disableTapPay = false;                                    
                                    }
                                    catch(erro){
                                        vm.message = 'Boleto gerado com sucesso. Sem envio de notificação'
                                        vm.cobrancaRealizada = true;
                                        vm.disableTapPay = false;                                    
                                    }
                                    console.log(error);
    
                                });
    
                            }
                            catch(erro){
    
                            }
    
    
                        saveHistoryPayment(resultCapture.id, resultCapture.acquirer_id);
    
                            vm.message = 'Boleto gerado com sucesso'
                        })
                        .catch(function(error){
                            try{
                                DialogFactory.showMessageDialog({mensagem: 'Erro na captura da transação' + error.status});                             
                            }
                            catch(erro){
                                DialogFactory.showMessageDialog({mensagem:'Erro na captura da transação'});                             
                            }
                            console.log(error);
                        });
                // }, function (error) {
                //     DialogFactory.showMessageDialog({titulo: 'Aviso', mensagem: 'Erro ao realizar transação, verifique os dados do cliente. ' + "(" + error.data.errors[0].message + ")"});
                //     vm.disableTapPay = false;
                // }).catch(function (error) {
                //     DialogFactory.showMessageDialog({titulo: 'Aviso', mensagem: 'Erro ao realizar transação, verifique os dados do cliente. ' + "(" + error.data.errors[0].message + ")"});
                //     vm.disableTapPay = false;
                // });
    
            }
    
            function saveHistoryPayment(idBoleto, acquirer_id){
    
                var customerCharging = {
                    Id: vm.customer.Id,
                    Charging:{
                        Comment:vm.comment,
                        Ammount: vm.amount,
                        CollectorName: MainUtils.getAgent(),
                        PaymentType: BOLETO,
                        BoletoId: idBoleto,
                        AcquireId: acquirer_id,
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
                if (!address || address.length == 0) {
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
            
            function onTapPaymentHistoryDetail(history) {
                ViewModelUtilsService.showModalPaymentHistoryDetail(history, vm.customer);
            }

            function addExpirationDays(days) {
                var dat = new Date();
                dat.setDate(dat.getDate() + days);
                return dat.toISOString();
              }
    
        }
    })();