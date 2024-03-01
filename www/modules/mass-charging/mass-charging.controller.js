(function() {
'use strict';

    angular
        .module('foneClub')
        .controller('MassChargingController', MassChargingController);

    MassChargingController.inject = ['$scope', 'FoneclubeService', 'PagarmeService', '$q', 'UtilsService', '$timeout', 'MainUtils'];

    function MassChargingController($scope, FoneclubeService, PagarmeService, $q, UtilsService, $timeout, MainUtils) {
        
        var vm = this;
        var prefixoMoetario = 'R$';
        const cartao = 1;
        const boleto = 2;
        vm.viewName = "Cobrança em massa";
 
        vm.plans = [];
        vm.year = new Date().getFullYear();
        vm.month = new Date().getMonth() + 1;
        vm.onSearchMassCharging = onSearchMassCharging;
        vm.loading = false;
        vm.onClickCobrar = onClickCobrar;
        vm.onChangeCheckboxSoma = onChangeCheckboxSoma;
        vm.onChangeCheckboxLastPayment = onChangeCheckboxLastPayment;
        vm.onChangeCheckboxCharged = onChangeCheckboxCharged;
        vm.paymentMethod = [
            { id:'boleto', description: 'Boleto' },
            { id:'cartao', description: 'Cartão de Crédito' }
        ]
        vm.getLinkBoleto = getLinkBoleto;

        vm.showCharged = true;
        vm.showRisk = true;
        vm.showSemPagamento = true;
        vm.onChangePaymentCheckboxCharged = onChangePaymentCheckboxCharged;
        vm.onChangeRiskCheckboxCharged = onChangeRiskCheckboxCharged;
        vm.onChangeCheckboxCharged = onChangeCheckboxCharged;
        
        function onSearchMassCharging(){

            vm.loading = true;
            FoneclubeService.getMassChargingFull(vm.month,vm.year).then(function (result) {
                // debugger;
                vm.massList = result.MassCharging;

                for(var i in result.MassCharging){

                    result.MassCharging[i].idTypeCharging = boleto;
                    result.MassCharging[i].typeCharging = 'boleto'

                    if(result.MassCharging[i].HasCard && result.MassCharging[i].LastCharging.PaymentType == cartao){
                        result.MassCharging[i].idTypeCharging = cartao;
                        result.MassCharging[i].typeCharging = 'cartao'
                    }

                    result.MassCharging[i].chargingAmmount = result.MassCharging[i].PrecoUnico;
                    result.MassCharging[i].enviarEmail = true;

                    if(result.MassCharging[i].ChargeDoMes != null){
                        
                        if(result.MassCharging[i].ChargeDoMes.TransactionId > 0){
                            
                            PagarmeService.getBoletoUrl(result.MassCharging[i].ChargeDoMes.TransactionId, result.MassCharging, i)
                            .then(function (result) {
                                
                                if(result[0].boleto_url != null){
                                    result.chargesAndOrders[result.index].linkBoletoAnterior = result[0].boleto_url;
                                }
                            })
                        }   
                    }
                    
                    if(result.MassCharging[i].Charged)
                        setMessageInfoCharged(result.MassCharging[i], "Cliente Cobrado no mês vingente definido. " )

                    result.MassCharging[i].showed = true;

                    if(result.MassCharging[i].LastCharging){

                        var dataCriacao = new Date(result.MassCharging[i].LastCharging.CreateDate)
                        var dataCompare = new Date(result.MassCharging[i].LastCharging.CreateDate);
                        dataCompare.setDate(dataCompare.getDate() + 35);

                        if(dataCompare <= new Date()){
                            result.MassCharging[i].tempoLongoCobrado = true;
                        }
                    }
                }
            })

            FoneclubeService.getMassChargingData(vm.month,vm.year).then(function (result) {
                vm.lista = result;
                
                vm.lista.forEach(customer => {
                    
                    if(!customer.Charged)
                        customer.infoMessage = 'Cliente não cobrado no mês vingente definido.';

                    if(customer.LastCharge)
                    {
                        customer.lastPayment = true;
                        onChangeCheckboxLastPayment(customer, false)
                    }
                        
                    customer.defaultCharging = true;
                    customer.enviarEmail = true;
                });
                vm.loading = false;
            }).catch(function(error){
                alert('Aviso: o watcher pegou uma exceção, por favor, tire um print para companhamento: mcc5')
            })
        }


        function onClickCobrar(customer){

            // debugger
            setMessageInfo(customer, "Iniciando cobrança, validando campos preenchidos")
            var valorTotalCobrar = customer.chargingAmmount;
            valorTotalCobrar = parseInt(valorTotalCobrar.replace('.','').replace(prefixoMoetario, ''))
            
            if(customer.typeCharging == 'boleto'){
                customer.idTypeCharging = boleto
            }
            else{
                customer.idTypeCharging = cartao
            }

            if(!validationCharge(customer))
                return;

            if(!customer.requesting)
            {

                if(customer.LastChargingPaid == null)
                {
                    customer.LastChargingPaid = {};
                    customer.LastChargingPaid.Comment = undefined;
                }

                var customerSend = {
                    Id: customer.IdPerson,
                    Charging:{
                        Comment: customer.LastChargingPaid.Comment ,
                        CommentEmail:customer.emailComment,
                        CommentBoleto: customer.boletoComment, 
                        Ammount: valorTotalCobrar,
                        CollectorName: MainUtils.getAgent(),
                        PaymentType: customer.idTypeCharging,
                        AnoVingencia:vm.year,
                        MesVingencia: vm.month,
                        TransactionId: null
                    }
                }

                setMessageInfo(customer, "Iniciando envio de transação, aguarde, esperando retorno do gateway de pagamento")
                FoneclubeService.postGeraCobrancaIntegrada(customerSend).then(function (result) {
                    
                    // debugger
                    var linkBoleto = '';
                    if(customerSend.Charging.PaymentType == boleto)
                        linkBoleto = result.LinkBoleto

                    if(result.StatusPaid){
                        setMessageInfo(customer, "Cliente Cobrado no mês vingente definido, finalizando procedimentos. " + linkBoleto)
                    }
                    else{
                        setMessageInfo(customer, result.DescriptionMessage);
                        customer.requesting = false;
                        return
                    }
                    
                    // debugger
                    if(customer.typeCharging == "boleto")
                    {
                        if(customer.enviarEmail)
                        {
                            if(result.StatusPaid){

                                
                                var emailObject = {
                                    To: customer.Email,
                                    TargetName : customer.Name,
                                    TargetTextBlue: result.LinkBoleto,
                                    DiscountPrice: customer.chargingAmmount.replace('R$','').replace('.',','),
                                    TargetSecondaryText : customer.emailComment,
                                    TemplateType : 2
                                }
                                
                                // debugger
                                FoneclubeService.postSendEmail(emailObject).then(function(result){
                                    console.log('FoneclubeService.postHistoryPayment');
                                    console.log(result);

                                    customer.requesting = false;

                                    if(result){
                                        customer.Charged = true
                                    } 
                                    else{
                                        setMessageInfo(customer, "Cliente cobrado, histórico salvo, mas email não enviado, importante. " + linkBoleto)
                                    }
                                })
                                .catch(function(error){
                                    console.log('catch error');
                                    console.log(error);
                                    customer.requesting = false;
                                    setMessageInfo(customer, "Cliente cobrado, histórico salvo, mas email não enviado, importante. " + linkBoleto)
                                });
                                
                            }
                                
                        }
                        else{
                            console.log('Cobrado sem email concluído ' + linkBoleto)
                            setMessageInfo(customer, "Cliente Cobrado no mês vingente definido. " + linkBoleto)
                            customer.requesting = false;
                            customer.Charged = true
                        }
                    }
    
                    if(customer.typeCharging == "cartao")
                    {
                        console.log('cobrado cartao, enviar email');

                        var emailObject = {
                            'To': customer.Email, 
                            'TargetName' : customer.Name,
                            'TargetTextBlue' : customer.chargingAmmount.replace('R$','').replace('.',','),
                            // 'CustomerComment':vm.customerComment,
                            'TargetSecondaryText' : customer.emailComment,
                            'TemplateType' : 1
                        }

                        FoneclubeService.postSendEmail(emailObject).then(function(result){
                            console.log('FoneclubeService.postHistoryPayment');
                            console.log(result);
                            // debugger
                            customer.requesting = false;

                            if(result){
                                customer.Charged = true
                                setMessageInfo(customer, "Cliente Cobrado no mês vingente definido. " + linkBoleto)
                            } 
                            else{
                                setMessageInfo(customer, "Cliente cobrado, histórico salvo, mas email não enviado, importante. " +  linkBoleto)
                            }
                                
                        })
                        .catch(function(error){
                            console.log('catch error');
                            console.log(error);
                            customer.requesting = false;
                            setMessageInfo(customer, "Cliente cobrado, histórico salvo, mas email não enviado, importante.")
                        });
                    }

                    
                })  
            }

            customer.requesting = true;  
        }

        function validationCharge(customer){
            if(customer.typeCharging == undefined )
            {
                alert('Escolha um tipo de cobrança');
                return false;
            }

            if(customer.chargingAmmount == undefined )
            {
                alert('Escolha um valor de cobrança');
                return false;
            }

            if(customer.chargingAmmount < 100)
            {
                alert('Escolha um valor válido de cobrança');
                return false;
            }

            return true;
        }

        function onChangeCheckboxSoma(customer){
            console.log(`onChangeCheckboxSoma ` + customer.soma);

            customer.lastPayment = false;

            // if(!customer.soma)    
            customer.chargingAmmount =  prefixoMoetario + '0.00';

            if(customer.soma && customer.TotalAmountCustomer > 0)
            {
                customer.chargingAmmount = prefixoMoetario + (customer.TotalAmountCustomer / 100).toFixed(2);
                
            }
                
        }

        function onChangeCheckboxLastPayment(customer, ajusteCampoMonetario){
            console.log(`onChangeCheckboxLastPayment`)
            customer.soma = false

            // if(!customer.lastPayment)    
            customer.chargingAmmount =  prefixoMoetario + '0.00';

            if(customer.lastPayment && customer.LastCharge.Amount > 0)
            {
                customer.chargingAmmount = prefixoMoetario + (customer.LastCharge.Amount / 100).toFixed(2);
                
                customer.boletoComment = customer.LastCharge.CommentBoleto
                customer.emailComment = customer.LastCharge.CommentEmail
                customer.foneclubeComment = customer.LastCharge.CommentFoneclube

                if(customer.LastCharge.ChargeType == boleto)
                {
                    customer.typeCharging = 'boleto'
                    customer.idTypeCharging = boleto
                }
                if(customer.LastCharge.ChargeType == cartao)
                {
                    customer.typeCharging = 'cartao'
                    customer.idTypeCharging = cartao
                }
            }
                
            

        }

        function enviaEmailBoleto(customer){
            var emailObject = {
                'To': existentCustomer.email, //existentCustomer.email
                'TargetName' : existentCustomer.name,
                'TargetTextBlue': resultCapture.boleto_url,
                'TargetSecondaryText' : vm.commentBoleto,
                'TemplateType' : 2
            }

            FoneclubeService.postSendEmail(emailObject).then(function(result){
                console.log(result);
            })
            .catch(function(error){
                console.log('catch error');
                console.log(error);
            });
        }

        function enviaEmailCartao(customer){
            var emailObject = {
                'To': vm.existentCustomer.email, //vm.existentCustomer
                'TargetName' : vm.existentCustomer.name,
                'TargetTextBlue' : $filter('currency')(vm.amount / 100, ""),
                // 'CustomerComment':vm.customerComment,
                'TargetSecondaryText' : vm.customerComment,
                'TemplateType' : 1
            }

            FoneclubeService.postSendEmail(emailObject).then(function(result){
                console.log(result);
            })
            .catch(function(error){
                console.log('catch error');
                console.log(error);
            });
        }

        function setMessageInfo(customer, message){
            customer.infoMessage = message;
            customer.Charged = false;
        }

        function setMessageInfoCharged(customer, message){
            customer.infoMessage = message;
        }

        function onChangeCheckboxCharged(){
            console.log('teste');
            debugger
            vm.showSemPagamento = true;
            vm.showRisk = true;

            for(var i in vm.massList){

                vm.massList[i].showed = true;
                
                if(vm.showCharged){
                    vm.massList[i].showed = true; 
                }
                else{
                    if(vm.massList[i].Charged){
                        vm.massList[i].showed = false;
                    }
                }

                // if(vm.showRisk){
                //     vm.massList[i].showed = true;
                // }
                // else{
                //     if(!vm.massList[i].GoodToCharge && !vm.massList[i].Charged){
                //         vm.massList[i].showed = false; 
                //     }
                // }

                // if(vm.showSemPagamento){
                //     vm.massList[i].showed = true;
                // }
                // else{
                //     if(vm.massList[i].tempoLongoCobrado){
                //         vm.massList[i].showed = false;
                //     }
                // }
                
                // vm.massList[i].showed = false;
                
            }
        }

        function  onChangePaymentCheckboxCharged(){

            vm.showCharged = true;
            vm.showRisk = true;
            
            for(var i in vm.massList){

                vm.massList[i].showed = true;

                if(vm.showSemPagamento){
                    vm.massList[i].showed = true;
                }
                else{
                    if(vm.massList[i].tempoLongoCobrado){
                        vm.massList[i].showed = false;
                    }
                }
            }

        };

        function  onChangeRiskCheckboxCharged(){
            vm.showCharged = true;
            vm.showSemPagamento = true;

            for(var i in vm.massList){

                vm.massList[i].showed = true;

                if(vm.showRisk){
                    vm.massList[i].showed = true;
                }
                else{
                    if(!vm.massList[i].GoodToCharge && !vm.massList[i].Charged){
                        vm.massList[i].showed = false; 
                    }
                }

               
                
                // vm.massList[i].showed = false;
                
            }

        };

        function getLinkBoleto(lastCharging){
            // debugger
            // var id
            // PagarmeService.getBoletoUrl(idBoleto, null, null).then(function (result) {
            //     console.log(result)
            // })
        }
    }
})();