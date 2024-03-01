(function() {
'use strict';

    angular
        .module('foneClub')
        .controller('NewCardPaymentModalController', NewCardPaymentModalController);


    NewCardPaymentModalController.inject = ['ViewModelUtilsService', 'PagarmeService', 'MainUtils', 'FoneclubeService', 'DialogFactory', 'UtilsService', '$filter' ,'$timeout'];
    function NewCardPaymentModalController(ViewModelUtilsService, PagarmeService, MainUtils, FoneclubeService, DialogFactory, UtilsService, $filter, $timeout) {


        var vm = this;
        var customer = ViewModelUtilsService.modalNewCardPaymentData;
        vm.customer = customer;
        var newCustomer;
        var cardData;
        var CARTAO = 1;
        var cardToken = "";
        vm.onTapPagar = onTapPagar;
        vm.onTapConfirmarPagamento = onTapConfirmarPagamento;
        vm.onTapCancel = onTapCancel;
        vm.onTapPaymentHistoryDetail = onTapPaymentHistoryDetail;

        vm.calculate = calculate;

        vm.amount = 0;
        vm.amountTemp = 0;
        vm.amountTemp1 = 0;
        vm.bonus = 0;
        vm.vigenciaField = moment().subtract(1, 'day').format("YYYY MM");
        vm.validatePhone = validatePhone;
        vm.customerPhones="";
        vm.showCopyButtons = true;
        vm.etapaDados = true;
        vm.chargeDisabled = true;
        vm.checkOne = checkOne;
        vm.changeTextValue = changeTextValue;
        vm.copyForWhatsapp = copyForWhatsapp;
        vm.copyForTelegram = copyForTelegram;
        vm.generateAndPasteDefaults = generateAndPasteDefaults;

        vm.chargeStatusfirst = false;
        vm.chargeStatusSecond = false;

        vm.AdditionalComment = "";
        vm.defaultTemplateText = `🤖 FoneClube: FoneBot
Prezado *|clientname|*,

Segue resumo da sua última cobrança que que será enviada por email e whatsapp.  
*|Detalhes.Cobrança|*

Vigencia:*|mes|* 
Total:*R$|total|*

Caso tenha alguma dúvida envie um *whatsapp para* 

*${'https://wa.me/5521981908190'}*

ou email para 

*financeiro@foneclube.com.br*.  

Obrigado pela Atenção: 
*FoneClube*  👍`;
        

        init();

        function init() {
        vm.chargeStatusfirst = true;
        vm.chargeStatus = 1;
        FoneclubeService.getTotaisComissoes(customer.Id).then(function (result) {
            console.log('FoneclubeService.getTotaisComissoes')
            console.log(result)
            //debugger
            vm.bonus = parseFloat(result.ValorTotalLiberadoParaPagarCliente/ 100).toFixed(2);

          })

            FoneclubeService.getLastPersonCharging(customer.Id).then(function (result) {
                // debugger
                
                if(result.txtCommentEmail !=undefined)
                vm.customerComment = decodeURIComponent(result.txtCommentEmail);
                else{
                    vm.customerComment =  vm.defaultTemplateText;
                }
                if(result.txtComment !=undefined){
                    vm.comment = decodeURIComponent(result.txtComment);
                }
                else
                vm.comment =  vm.defaultTemplateText;
                if(result.dteValidity!=null)
                    vm.vigenciaField = moment(result.dteValidity).format("YYYY MM");
                vm.amount = result.txtAmmountPayment/100;
                vm.amountTemp = vm.amount.toFixed(2);
                vm.amountTemp1 = vm.amount.toFixed(2);

                 if(result.txtWAPhones == undefined || result.txtWAPhones == null)
                    vm.customerPhones = customer.Phones.filter(x=>!x.IsFoneclube)[0].DDD + customer.Phones.filter(x=>!x.IsFoneclube)[0].Number;
                  else
                    vm.customerPhones=result.txtWAPhones;
                  validatePhone();
            })
        }

        function checkOne(val) {
          //alert('xx');
          vm.chargeDisabled = false;
          if (val == '1') {
            vm.chargeStatusfirst = true;
            vm.chargeStatusSecond = false;
            vm.chargeStatus = 1;
          }
          if (val == '2') {
            vm.chargeStatusSecond = true;
            vm.chargeStatusfirst = false;
            vm.chargeStatus = 2;
          }
        }

        function changeTextValue(){
            if(vm.customerComment!=undefined){
            vm.replaceIndex = 0;
            vm.customerComment = vm.customerComment.replace(/([\|(])(.+?)([\|)])/g, autoRepalceText);
            vm.replaceIndex = 0;
            }
      }

      function autoRepalceText(match, start, changeValue, end, offset, string) {
        var resStr = "";

        if(vm.replaceIndex == 0){
          resStr = vm.customer.Name;
        }
        if(vm.replaceIndex == 1){
          vm.AdditionalComment = changeValue;
          resStr = changeValue;
        }
        if(vm.replaceIndex == 2){
          resStr = vm.vigenciaField.split(" ")[1] ? new Date(0,parseInt(vm.vigenciaField.split(" ")[1]),0).toLocaleDateString('pt-br', { month: 'long'}) : '';
        }
        if(vm.replaceIndex == 3){
          resStr =  vm.amountTemp1;
        }
        vm.replaceIndex++;

        return start + resStr + end;
      }


        function calculate() {
          var amount = vm.amountTemp.toString().indexOf('.') > -1 ? parseFloat(vm.amountTemp) : parseFloat(vm.amountTemp) / 100;
          var bonus = vm.bonus.toString().indexOf('.') > -1 ? parseFloat(vm.bonus) : parseFloat(vm.bonus) / 100;
          vm.amountTemp1 = vm.pagar ? parseFloat(amount - bonus) : amount;
          if (vm.pagar) {
            vm.amount = parseFloat(vm.amountTemp1).toFixed(2);
          }
          else {
            vm.amount = parseFloat(amount).toFixed(2);
          }

          if (isNaN(vm.amount)) {
            vm.amount = 0;
          }

          vm.amountTemp1 = vm.amount;
          changeTextValue();
        }

        function onTapConfirmarPagamento() {
            // debugger
            if (!getAddress(vm.customer) || !getContactPhone(vm.customer)) {
                return;
            }

            if (parseInt(vm.amount) < 1) {
              DialogFactory.showMessageDialog({ mensagem: 'Não é possível criar uma cobrança com valor inferior a R$1.00. Por favor corrija o valor ou opte por criar uma ordem de serviço com os detalhes desta cobrança.', titulo: 'Aviso' });
              return;
            }

            if (!vm.chargeStatus) {
              vm.chargeStatusDiv = true;
              vm.etapaDados = false;
              vm.etapaConfirmacao = false;
            }
            else {
              vm.etapaDados = false;
              vm.etapaConfirmacao = true;
              vm.chargeStatusDiv = false;
            }
        }
        
        function onTapCancel(number){
            vm.etapaDados = true;
            vm.etapaConfirmacao = false;
            vm.chargeStatusDiv = false;
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

        console.log('NewCardPaymentModalController');

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

            paymentNewCustomer();
        }

        function getContactPhone(customer){

            try{
                return {
                    'ddd' : customer.Phones[0].DDD.toString(),
                    'number' : customer.Phones[0].Number.toString()
                }
            }
            catch(e){
                return {
                    'ddd' : '21',
                    'number' : '997865645'
                }
            }
            
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
          SaveDefaults();
          var em = vm.amount.toString().split(".");
          if (em[1] != undefined) {
            vm.amount = vm.amount.toString().replace(".", "")

          }

            vm.disableTapPay = true;

            PagarmeService.generateCardHash(cardData).then(function(cardHash){

                vm.statusTransaction = 'Criptografando dados cartão';
                // debugger;
                PagarmeService.postTransactionCard(vm.amount, cardHash, newCustomer)
                .then(function(result){

                    if(result.status=="refused"){
                          $timeout(function(){
                        FoneclubeService.getLastTransactionIdByCustomer(vm.customer.DocumentNumber).then(function(result){
      
                            vm.message = 'Transação recusada';
                            var customerCharging = {
                                Id: vm.customer.Id,
                                Charging:{
                                    Comment:encodeURIComponent(vm.comment),
                                    CommentEmail:encodeURIComponent(vm.customerComment),
                                    Ammount: vm.amount,
                                    CollectorName: MainUtils.getAgent(),
                                    PaymentType: CARTAO,
                                    AnoVingencia: moment(vm.vigenciaField).format("YYYY"),
                                    MesVingencia: moment(vm.vigenciaField).format("MM"),
                                    ChargeStatus: vm.chargeStatus,
                                    TransactionId: result != ""? parseInt(result) : 0,
                                    TransactionComment: card.id,
                                    Token:result.token,
                                    ChargingComment: vm.AdditionalComment,
                                    TxtWAPhones:vm.customerPhones,
                                    DueDate: moment().toDate(),
                                    MutliVigencias: [vm.vigenciaField]
                                }
                            }
                            FoneclubeService.sendWhatsAppMessageCCRefused(customerCharging).then(function(result){
                              FoneclubeService.postHistoryPayment(customerCharging).then(function(result){
                                console.log('FoneclubeService.postHistoryPayment');
                                console.log(result);
                                vm.statusTransaction = 'Transação recusada';
                                vm.disableTapPay = false;
                                vm.cobrancaRealizada = true; 
                            });
                            });
                          
                        })
                    }, 10000);
                      }
                    else
                    {

                    // debugger;
                    vm.statusTransaction = 'Transação em andamento';

                    cardToken = result.token;
                    PagarmeService.postCaptureTransaction(result.token, vm.amount).then(function(result){
                      // debugger;
                      vm.TransactionId = result.tid;
                        var customCustomer = {
                            Id:vm.customer.Id,
                            IdPagarme:result.customer.id
                        }

                        if(vm.customerComment == undefined)
                            vm.customerComment = ''

                        var emailObject = {
                            'Id':vm.customer.Id,
                            'To': vm.newCustomer.email, //vm.newCustomer.email
                            'TargetName' : vm.newCustomer.name,
                            'TargetTextBlue' : $filter('currency')(vm.amount / 100, ""),
                            // 'CustomerComment':vm.customerComment,
                            'TargetSecondaryText' : vm.customerComment,
                            // 'TargetSecondaryText' : vm.commentBoleto,
                            'TemplateType' : 1
                        }

                        
                        if(vm.pagar && vm.bonus != '0.00')
                        {
                            emailObject.DiscountPrice = ($filter('currency')(vm.bonus / 100, "")).replace('.',',')
                        }

                        
                        try{
                            var chargingLog = {
                                'customer': newCustomer,
                                'ammount': vm.amount,
                                'email':emailObject,
                                'pagarmeResponse': result,
                                'customerComment':vm.customerComment,
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
                    }

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

        function SaveDefaults()
            {
              //debugger;
              var paymentInfo = {
                Id : vm.customer.Id,
                DefaultWAPhones : vm.customerPhones
              };
              FoneclubeService.saveDefaultPaymentInfo(paymentInfo).then(function (result) {
                    return false;
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
                        Comment:encodeURIComponent(vm.comment),
                        CommentEmail:encodeURIComponent(vm.customerComment),
                        Ammount: vm.amount,
                        CollectorName: MainUtils.getAgent(),
                        PaymentType: CARTAO,
                        AnoVingencia:vm.vigenciaField.split(" ")[0],
                        MesVingencia: vm.vigenciaField.split(" ")[1],
                        ChargeStatus: vm.chargeStatus,
                        TransactionId: vm.TransactionId,
                        ComissionConceded: vm.pagar,
                        TransactionComment: cardToken,
                        ChargingComment: vm.AdditionalComment,
                        TxtWAPhones:vm.customerPhones,
                        DueDate: moment().toDate(),
                    }
                }


                FoneclubeService.postHistoryPayment(customerCharging).then(function(result){
                    console.log('FoneclubeService.postHistoryPayment');
                    console.log(result);

                    if(vm.pagar)
                    {   FoneclubeService.dispatchedCommision(vm.customer.Id).then(function (result) {
                        //alert('success!!');
                      })
                        .catch(function (error) {
  
                        })
                    }
                    
                })
                .catch(function(error){
                    alert('Aviso em verificação secundária, printar tela - ' 
                        + '_' + customerCharging.Id
                        + '_' + customerCharging.ChargeStatus
                        + '_' + customerCharging.TransactionId
                        + '_' + customerCharging.ComissionConceded
                        + '_' + customerCharging.Charging.Comment
                        + '_' + customerCharging.Charging.CommentEmail
                        + '_' + customerCharging.Charging.CommentBoleto
                        + '_' + customerCharging.Charging.Ammount
                        + '_' + customerCharging.Charging.CollectorName
                        + '_' + customerCharging.Charging.PaymentType
                        + '_' + customerCharging.Charging.BoletoId
                        + '_' + customerCharging.Charging.AcquireId
                        + '_' + customerCharging.Charging.AnoVingencia
                        + '_' + customerCharging.Charging.MesVingencia
                        + ' ncpc442' 
                        )
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

        function copyForWhatsapp(){
            ClipBoardCopy(vm.customerComment.replace(/\|/g, ''));
          }

          function copyForTelegram(){
            ClipBoardCopy(vm.customerComment.replace(/\|/g, '').replace(/\*/g, '**'));
          }
          function ClipBoardCopy(text_to_share) {
            // create temp element
            var copyElement = document.createElement("pre");
            copyElement.appendChild(document.createTextNode(text_to_share));
            copyElement.id = 'tempCopyToClipboard';
            angular.element(document.body.append(copyElement));
      
            // select the text
            var range = document.createRange();
            range.selectNode(copyElement);
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);
      
            // copy & cleanup
            document.execCommand('copy');
            window.getSelection().removeAllRanges();
            copyElement.remove();
          }

          function generateAndPasteDefaults(){
            vm.customerComment = vm.defaultTemplateText;
            changeTextValue();
            ClipBoardCopy(vm.customerComment);
          }

           function validatePhone(){
              var checkPhoneNums = vm.customerPhones.replace(/[^0-9\.,]/g, "");
              FoneclubeService.validatePhoneForWA(checkPhoneNums).then(function(result){
                if(result){
                  var validNumbers = result.split('|')[0];
                  var invalidNumbers = result.split('|')[1];
                  vm.customerPhones = validNumbers;
                  if(invalidNumbers)
                    vm.customersInvalidPhones = "Invlaid numbers : "+ invalidNumbers;
                  else
                    vm.customersInvalidPhones ="Ok";
                }
              });
            }
    }
})();
