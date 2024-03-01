(function() {
'use strict';

    angular
        .module('foneClub')
        .controller('ExistentCardPaymentModalController', ExistentCardPaymentModalController);

    ExistentCardPaymentModalController.inject = ['ViewModelUtilsService', 'PagarmeService', 'MainComponents', 'FoneclubeService', 'MainUtils', 'UtilsService', '$scope', 'DialogFactory', '$filter', '$timeout'];
    function ExistentCardPaymentModalController(ViewModelUtilsService, PagarmeService, MainComponents, FoneclubeService, MainUtils, UtilsService, $scope, DialogFactory, $filter, $timeout) {

        console.log('ExistentCardPaymentModalController');
        var vm = this;
        var newCustomer;
        var cardData;
        var CARTAO = 1;
        var customer = ViewModelUtilsService.modalExistentCardPaymentData;
        var card = ViewModelUtilsService.modalExistentCardData;

        vm.etapaDados = true;
        vm.customer = customer;
        vm.card = card;
        vm.amount = '';
        vm.comment = '';
        vm.customerComment = '';
        vm.cobrancaRealizada = false;
        vm.chargeDisabled = true;
        vm.parcelasCount = 1;
        vm.checkOne = checkOne;
        vm.onTapPagar = onTapPagar;
        vm.onTapConfirmarPagamento = onTapConfirmarPagamento;
        vm.copyForWhatsapp = copyForWhatsapp;
        vm.copyForTelegram = copyForTelegram;

        vm.vigenciaField = moment().subtract(1, 'day').format("YYYY MM");
        vm.scheduledField = moment().subtract(1, 'day').format("YYYY MM DD");
        vm.onTapAddComment = onTapAddComment;
        vm.onTapCancel = onTapCancel;
        vm.changeTextValue = changeTextValue;
        vm.copyForWhatsapp = copyForWhatsapp;
        vm.copyForTelegram = copyForTelegram;
        vm.onTapPaymentHistoryDetail = onTapPaymentHistoryDetail;
        vm.generateAndPasteDefaults = generateAndPasteDefaults;
        vm.incrementBothPP = incrementBothPP;
        vm.decrementBothPP = decrementBothPP;
        vm.validatePhone = validatePhone;
        vm.customerPhones="";
        vm.date_time = new Date().getFullYear().toString();
        vm.calculate = calculate;
        vm.showCopyButtons = true;
        vm.amount = 0;
        vm.amountTemp = 0;
        vm.amountTemp1 = 0;
        vm.bonus = 0;
        vm.bothPP = 1;
        vm.AdditionalComment = "";
        vm.multiVigencia = false;
        vm.finalSelected = [];
        vm.selectDays = UtilsService.getNext12Months(moment(new Date()).format('MM-DD-YYYY'));
        vm.selectedList = {};
        vm.btnclass = "btn btn-success";
        vm.defaultTemplateText = `🤖 FoneClube: FoneBot
Prezado *|namevariable|*,

Segue resumo da sua última cobrança que que será enviada por email e whatsapp.  
*|Detalhes.Cobrança|*

Vigencia:*|vigenciavariable|* 
Total:*R$|amountvariable|*

Caso tenha alguma dúvida envie um *whatsapp para* 

*${'https://wa.me/5521981908190'}*

ou email para 

*financeiro@foneclube.com.br*.  

Obrigado pela Atenção: 
*FoneClube*  👍`;
        
        if (vm.customer.CacheIn) {
          vm.amount = vm.customer.CacheIn;
          vm.amountTemp = vm.amount.toFixed(2);
          vm.amountTemp1 = vm.amount.toFixed(2);
        }
        
        // debugger;
        var customerId = customer.Id;
        var existentCustomer = {
            'name' : customer.Name,
            'document_number' : customer.DocumentNumber,
            'email' : customer.Email,
            'address' : getAddress(customer),
            'phone' : getContactPhone(customer)
        }

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
                vm.vigenciaField = moment(result.Validity).format("YYYY MM");
                vm.selectDays = UtilsService.getNext12Months(moment(result.Validity).format('MM-DD-YYYY'));
                vm.amount = result.txtAmmountPayment/100;
                vm.amountTemp = vm.amount.toFixed(2);
                vm.amountTemp1 = vm.amount.toFixed(2);
                vm.scheduledField = UtilsService.formatDate(new Date(result.dteDueDate
).getFullYear() == 2000 ? moment(UtilsService.addDays(1)).format("DD MMMM YYYY"): moment(result.dteDueDate).format("DD MMMM YYYY")); 

                calculate();

                if(result.txtWAPhones == undefined || result.txtWAPhones == null)
                   vm.customerPhones = customer.Phones.filter(x=>!x.IsFoneclube)[0].DDD + customer.Phones.filter(x=>!x.IsFoneclube)[0].Number;
                 else
                    vm.customerPhones=result.txtWAPhones;
                  validatePhone();
            })
        }

        vm.Padrão = false;
        vm.Excepcional = false;
        vm.existentCustomer = existentCustomer;

        // listener when clicking Schedule button
        function onTapAddComment(data, isBothPPClick){
            // debugger;
            data.intIdPerson=customer.Id;
            data.txtDescription = "Cartao nao passou R$" + data.amount +" on " + moment(vm.scheduledField).format("YYYY/MM/DD");
            // data.dteRegister = ""
            data.bitPendingInteraction = true;
            var em = vm.amount.toString().split(".");
            if (em[1] != undefined) {
              vm.amount = vm.amount.toString().replace(".", "")

            }

                  FoneclubeService.postCustomerComment(data).then(function(result){
                    var chargeDataArray = [];

                    var bothPPValue = 0;
                      
                    if(vm.bothPP == 0 || vm.bothPP == 1) 
                      bothPPValue = 0;
                    else
                      bothPPValue = isBothPPClick ? vm.bothPP : 0;
                    var completeCount = 1;
                    var strMessage = 'Favor confirmar agendamento abaixo: <br/>Numero total de cobranças: '+ (bothPPValue == 0 ? 1 : bothPPValue) +'<br/>'; 
                    for(var ibothcount = bothPPValue == 0 ? 0 : 1; ibothcount <= bothPPValue; ibothcount++)
                    {
                      var expiryDate = moment(vm.scheduledField).add(ibothcount, 'month').format("DD MMMM YYYY");
                      var vigenciaYear = parseInt(vm.vigenciaField.split(" ")[0]);
                      var vigenciaMonth = parseInt(vm.vigenciaField.split(" ")[1]);
                 
                      var vy = vigenciaMonth + ibothcount <= 12? vigenciaYear + " " + (vigenciaMonth + ibothcount): vigenciaYear + 1 + " " + ((vigenciaMonth + ibothcount) - 12);
                      
                      strMessage += '<br/><label>' + (ibothcount == 0 ? 1: ibothcount) + '. Vencimento:<strong>' + moment(expiryDate).format("DD/MMM/YYYY")+'</strong></label>';
                      strMessage += '<label>Vigencia:<strong>' + vy.split(" ")[1] + '/' + vy.split(" ")[0]+'</strong></label>';
                      strMessage += '<label>Total:<strong>R$' + vm.amount/100 +'</strong></label>';


                      var customerCharging = {
                      Id: vm.customer.Id,
                      Charging:{
                          Comment: vm.bothPP == 1 ? encodeURIComponent(vm.comment) : encodeURIComponent(vm.defaultTemplateText),
                          CommentEmail: vm.bothPP == 1 ? encodeURIComponent(vm.customerComment) : encodeURIComponent(vm.defaultTemplateText),
                          Ammount: vm.amount,
                          CollectorName: MainUtils.getAgent(),
                          PaymentType: CARTAO,
                          AnoVingencia: vy.split(" ")[0],
                          MesVingencia: vy.split(" ")[1],
                          ChargeStatus: vm.chargeStatus,
                          TransactionId: vm.TransactionId,
                          ScheduledMonth:moment(expiryDate).format("MM"),
                          ScheduledYear:moment(expiryDate).format("YYYY"),
                          ScheduledDay:moment(expiryDate).format("DD"),
                          TransactionComment: card.id,
                          ChargingComment: vm.AdditionalComment,
                      }
                    }
                    console.log(customerCharging);
                      chargeDataArray.push(customerCharging); 
                  }

                  DialogFactory.dialogConfirm({ title: 'Atenção!', mensagem: strMessage, btn1: 'Yes', btn2: 'No, edit Charge' }).then(function(confirm) {
                    if(confirm==0)
                    {
                        for(var cc = 0 ; cc< chargeDataArray.length; cc++){
                        //posso colocar na lista de cobranças e ser o primeiro com vingencia
                        FoneclubeService.postSchedulePayment(chargeDataArray[cc]).then(function(result){
                        
                        if(completeCount == chargeDataArray.length)
                        {
                          DialogFactory.showAlertDialog({message: 'Inserido com sucesso'});
                          return;
                        }
                        completeCount++;  
                        })
                        .catch(function(error){
                            console.log('catch error');
                            console.log(error);
                        });
                      }
                    }
                })
                .catch(function(error){
                    console.log('catch error');
                    console.log(error);
                });
            });
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
            vm.selectDays = UtilsService.getNext12Months(moment(vm.vigenciaField).format('MM-DD-YYYY'));
      }

      function autoRepalceText(match, start, changeValue, end, offset, string) {
        GetVigencias();
        var resStr = "";

            if(vm.replaceIndex == 0){
              resStr = vm.customer.Name;
            }
            if(vm.replaceIndex == 1){
              vm.AdditionalComment = changeValue;
              resStr = changeValue;
            }
            if(vm.replaceIndex == 2){
              var rrresStr = vm.finalSelected.map(function(dd) { return (new Date(moment(dd)).toLocaleDateString('pt-br', { month: 'long', year:"numeric"}).replace(' de ', '-')) });
              resStr = rrresStr.join();
            }
            if(vm.replaceIndex == 3){
              resStr =  vm.amountTemp1;
            }
            vm.replaceIndex++;

            return start + resStr + end;
          }

        function calculate() {
            // debugger
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

        function GetVigencias()
            {
              vm.finalSelected = [];
              var selList = Object.keys(vm.selectedList).map((key) => [key, vm.selectedList[key]]);
              for(var io=0; io < selList.length; io++ ){
                if(selList[io][1] == true)
                 vm.finalSelected.push(selList[io][0]);
              }
              if(!vm.finalSelected.includes(moment(vm.vigenciaField).format("MMM-YYYY")))
                vm.finalSelected.push(moment(vm.vigenciaField).format("MMM-YYYY"));

              vm.finalSelected = vm.finalSelected.filter(function( item, index, inputArray ) {
                  return inputArray.indexOf(item) == index;
                });

              var MONTHS = MONTHS = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };

              vm.finalSelected = vm.finalSelected.sort(function (a, b) {
                  var aa = a.split('-'),
                  bb = b.split('-');

                  return aa[1] - bb[1] || MONTHS[aa[0]] - MONTHS[bb[0]];
              });
            }

        function onTapConfirmarPagamento() {
            // debugger;
            if (!getAddress(vm.customer) || !getContactPhone(vm.customer)) {
                return;
            }

            if (parseInt(vm.amount) < 1) {
              DialogFactory.showMessageDialog({ titulo: 'Aviso', mensagem: 'Não é possível criar uma cobrança com valor inferior a R$1.00. Por favor corrija o valor ou opte por criar uma ordem de serviço com os detalhes desta cobrança.' });
              return;
            }

            GetVigencias();
            var strSel = vm.finalSelected.join();
            if(vm.finalSelected!=null && vm.finalSelected.length > 1)
                {
                  ViewModelUtilsService.showConfirmDialog('Atenção!', 'Confirme os vários vigencias desta cobrança <br/>'+ strSel).then(function(confirm) 
                    {
			                if (confirm) 
                      {
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
                    });
                }
                else{
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
        }
        
        function onTapCancel(number){
            // debugger;
            vm.etapaDados = true;
            vm.etapaConfirmacao = false;
            vm.chargeStatusDiv = false;
            if (number == 1){
                vm.amount = 0;
                vm.comment = '';
                vm.cobrancaRealizada = false;   
            }
        }

        function onTapPagar(){
            vm.btnclass = "btn btn-success";
            SaveDefaults();
            // debugger;
            console.log('tap pagar existente')
            console.log(parseInt(vm.amount))
            console.log(card.id)
            var em = vm.amount.toString().split(".");
            if (em[1] != undefined) {
              vm.amount = vm.amount.toString().replace(".", "")

            }

            var vigencias = vm.finalSelected.map(function(dd) { return moment(moment(dd).format('MMM-YYYY')).format("YYYY MM"); });

                      vm.disableTapPay = true;
                      vm.message = 'Iniciando transação';
                      PagarmeService.postTransactionExistentCard(vm.amount, card.id, existentCustomer, vm.parcelasCount).then(function(result){
                        if(result.status=="refused")
                        {
                          $timeout(function(){
                          vm.btnclass = "btn btn-danger";
                          FoneclubeService.getLastTransactionIdByCustomer(vm.customer.DocumentNumber).then(function(result){
                            //debugger;
                            vm.message = 'Transação recusada';
                            var customerCharging = {
                              Id: vm.customer.Id,
                                Charging: {
                                Comment:encodeURIComponent(vm.comment),
                                CommentEmail:encodeURIComponent(vm.customerComment),
                                Ammount: vm.amount,
                                CollectorName: MainUtils.getAgent(),
                                PaymentType: CARTAO,
                                AnoVingencia: vm.vigenciaField.split(" ")[0],
                                MesVingencia: vm.vigenciaField.split(" ")[1].trim(),
                                ChargeStatus: vm.chargeStatus,
                                TransactionId: result != ""? parseInt(result) : 0,
                                DueDate: moment().toDate(),
                                TransactionComment: card.id,
                                Token:result.token,
                                ChargingComment: vm.AdditionalComment,
                                TxtWAPhones:vm.customerPhones,
                                Installments : vm.parcelasCount,
                                MutliVigencias: vigencias
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
                          });
                        }, 10000);
                        }
                        else
                        {
                          //vm.message = 'Transação efetuada';
                          // debugger;
                          //PagarmeService.postCaptureTransaction(result.token, vm.amount).then(function(result){

                            vm.message = 'Transação concluída';
                            vm.TransactionId = result.id;

                            if(vm.customerComment == undefined)
                                vm.customerComment = '';
    
                            var emailObject = {
                                'Id':vm.customer.Id,
                                'To': vm.existentCustomer.email, //vm.existentCustomer
                                'TargetName' : vm.existentCustomer.name,
                                'TargetTextBlue' : $filter('currency')(vm.amount / 100, ""),
                                // 'CustomerComment':vm.customerComment,
                                'TargetSecondaryText' : vm.customerComment,
                                'TemplateType' : 1
                            }
    

                            if(vm.pagar && vm.bonus != '0.00')
                            {
                                emailObject.DiscountPrice = ($filter('currency')(vm.bonus / 100, "")).replace('.',',')
                            }
    
                            try{
                                var chargingLog = {
                                    'customer': existentCustomer,
                                    'ammount': vm.amount,
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
                                    alert("Alerta a cobrança não pode ser salva, se possível pare a tela aqui sem atualizar nada e entre em    contato com cardozo")
                                });
                            }
                            catch(erro){
                                var teste1 = emailObject;
                                var teste2 = existentCustomer;
                                var teste3 = vm.amount;
                                alert("Alerta a cobrança não pode ser salva, se possível pare a tela aqui sem atualizar nada e entre em    contato com cardozo")
                            }
    
    
                            FoneclubeService.postSendEmail(emailObject).then(function(result){
                                console.log('FoneclubeService.postHistoryPayment');
                                console.log(result);
                            })
                            .catch(function(error){
                                console.log('catch error');
                                console.log(error);
                            });
    
                            saveHistoryPayment(vigencias);
                            vm.disableTapPay = false;
                            vm.cobrancaRealizada = true;                        
                          // })
                          // .catch(function(error){
                          //   vm.disableTapPay = false;
                          //   try{
                          //       vm.message = 'Erro na captura da transação' + error.status;
                          //   }
                          //   catch(erro){
                          //       vm.message = 'Erro na captura da transação'
                          //   }
                          //   console.log(error);
                          // });
                        }
                }, function(error) {
                DialogFactory.showMessageDialog({titulo: 'Aviso', mensagem: 'Erro ao realizar transação, verifique os dados do cliente. ' + "(" + error.data.errors[0].message + ")"});
                vm.disableTapPay = false;
            }).catch(function (error) {
                DialogFactory.showMessageDialog({titulo: 'Aviso', mensagem: 'Erro ao realizar transação, verifique os dados do cliente. ' + "(" + error.data.errors[0].message + ")"});
                vm.disableTapPay = false;
            });
          
        }

        function SaveDefaults()
            {
             // debugger;
              var paymentInfo = {
                Id : vm.customer.Id,
                DefaultWAPhones : vm.customerPhones
              };
              FoneclubeService.saveDefaultPaymentInfo(paymentInfo).then(function (result) {
                    return false;
              });
            }

        function saveHistoryPayment(vigencias){
            
            var customerCharging = {
                Id: vm.customer.Id,
                Charging:{
                    Comment:encodeURIComponent(vm.comment),
                    CommentEmail:encodeURIComponent(vm.customerComment),
                    Ammount: vm.amount,
                    CollectorName: MainUtils.getAgent(),
                    PaymentType: CARTAO,
                    AnoVingencia: vm.vigenciaField.split(" ")[0],
                    MesVingencia: vm.vigenciaField.split(" ")[1].trim(),
                    ChargeStatus: vm.chargeStatus,
                    TransactionId: vm.TransactionId,
                    TransactionComment: card.id,
                    ChargingComment: vm.AdditionalComment,
                    TxtWAPhones:vm.customerPhones,
                    DueDate: moment().toDate(),
                    Installments : vm.parcelasCount,
                    MutliVigencias: vigencias
                }
            }
            FoneclubeService.postHistoryPayment(customerCharging).then(function(result){
                
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
                        + ' ecc333'
                        )
                console.log('catch error');
                console.log(error);
            });

        }

        function getContactPhone(customer){
            // debugger;
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
            if (!contacts || contacts.length == 0 || contacts[0].DDD == '' || contacts[0].Number == '') {
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
            // debugger;
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

        function incrementBothPP(){
            vm.bothPP++;
        }

        function decrementBothPP(){
            vm.bothPP--;
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
