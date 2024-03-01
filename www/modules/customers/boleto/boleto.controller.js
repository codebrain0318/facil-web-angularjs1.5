(function() {
    'use strict';

        angular
            .module('foneClub')
            .controller('BoletoModalController', BoletoModalController);


        BoletoModalController.inject = ['ViewModelUtilsService', 'PagarmeService', 'MainUtils', 'FoneclubeService', 'DialogFactory', 'UtilsService', '$filter'];
        function BoletoModalController(ViewModelUtilsService, PagarmeService, MainUtils, FoneclubeService, DialogFactory, UtilsService, $filter) {


            console.log('--- BoletoModalController ---');
            var vm = this;
            vm.date = new Date();
            var customer = ViewModelUtilsService.modalBoletoData;
            vm.customer = customer;
            var newCustomer;
            vm.etapaDados = true;
            vm.chargeDisabled = true;
            vm.cobrancaRealizada = false;
            vm.amount = vm.customer.CacheIn ? vm.customer.CacheIn : '';
            vm.padroaValue = vm.customer.DefaultPaymentDay!= undefined ? vm.customer.DefaultPaymentDay : 25;
            vm.comment = '';
            vm.onTapPagar = onTapPagar;
            vm.onTapConfirmarPagamento = onTapConfirmarPagamento;
            vm.onTapCancel = onTapCancel;
            vm.onTapPaymentHistoryDetail = onTapPaymentHistoryDetail;
            vm.checkOne = checkOne;
            vm.enviaEmail = true;
            vm.enviaWhatsapp = true;
            vm.calculate = calculate;
            vm.amount = 0;
            vm.amountTemp = 0;
            vm.amountTemp1 = 0;
            vm.bonus = 0;
            vm.bothPP = 1;
 	          vm.showCopyButtons = true;
            vm.totaisComissoes = {};
            vm.totaisComissoes.ValorTotalLiberadoParaPagarCliente = 0;
            vm.expirationDateField =  moment().subtract(1, 'day').format("DD MMMM YYYY");
            vm.vigenciaField = moment().subtract(1, 'day').format("YYYY MM");
            vm.changeTextValue = changeTextValue;
            vm.changeTextValueChange = changeTextValueChange;
            vm.incrementPadroa=incrementPadroa;
            vm.decrementPadroa=decrementPadroa;
            vm.incrementBothPP = incrementBothPP;
            vm.decrementBothPP = decrementBothPP;
            vm.refreshVencimento = refreshVencimento;
            vm.upDateCalendar = upDateCalendar;
            vm.CopyBoletoMsg = CopyBoletoMsg;
            vm.copyForWhatsapp = copyForWhatsapp;
            vm.copyForTelegram = copyForTelegram;
            vm.generateAndPasteDefaults = generateAndPasteDefaults;
            vm.validatePhone = validatePhone;
            var customerId = customer.Id;
            var botImage = "🤖";
            var thumbsImage = "👍";
            var existentCustomer = {
                        'name' : customer.Name,
                        'document_number' : customer.DocumentNumber,
                        'email' : customer.Email,
                        'address' : getAddress(customer),
                        'phone' : getContactPhone(customer)

            }

            vm.Padrão = false;
            vm.Excepcional = false;
            vm.customerPhones="";
            vm.customersInvalidPhones = "";
            vm.AdditionalComment = "";
            vm.defaultBoletoText = `Vigencia: *|vigenciavariable|*
Vencimento: *|vencimentovariable|*
Total: *R$|amountvariable|*
`;
            vm.defaultTemplateText = `🤖 FoneClube: FoneBot
Prezado *|namevariable|*, 

Segue resumo da sua última cobrança que que esta sendo enviada por email e whatsapp.
*|Detalhes.Cobrança|*

Vigencia:*|vigenciavariable|* 
Vencimento:*|vencimentovariable|*
Total:*R$|amountvariable|* 

Caso tenha alguma dúvida envie um *whatsapp para* 

*${'https://wa.me/5521981908190'}* 

ou email para 

*financeiro@foneclube.com.br*.  

Obrigado pela Atenção: 
FoneClube  👍`;

            var CARTAO = 1;
            var BOLETO = 2;

            init();
            refreshVencimento();

          function init() {
            vm.chargeStatusfirst = true;
            vm.chargeStatus = 1;
            FoneclubeService.getHistoryPayment(customer.Id).then(function (result) {
              vm.histories = result;
              for (var i in vm.histories) {
                var history = vm.histories[i];
                history.descriptionType = (history.PaymentType == CARTAO) ? 'Cartão de crédito' : 'Boleto';
                if (i == 0) {
                  if(history.CommentEmail !=undefined)
                  {
                    vm.customerComment = decodeURIComponent(history.CommentEmail);
                  }
                  else{
                    vm.customerComment =  vm.defaultTemplateText;
                  }
                  if(history.Comment !=undefined){
                    vm.comment = decodeURIComponent(history.Comment);
                  }
                  else{
                    vm.comment = vm.defaultTemplateText;
                  }
                  if(history.commentBoleto !=undefined){
                    vm.commentBoleto = decodeURIComponent(history.commentBoleto);
                  }
                  else{
                    vm.commentBoleto = vm.defaultBoletoText;
                  }
                  vm.amount = history.Ammount / 100;
                  vm.vigenciaField = moment(history.AnoVingencia + " " + history.MesVingencia).format("YYYY MM");
                  vm.expirationDateField = UtilsService.formatDate(new Date(history.DueDate).getFullYear() == 2000 ? moment(UtilsService.addDays(1)).format("DD MMMM YYYY"): moment(history.DueDate).format("DD MMMM YYYY"));
                  vm.amountTemp = vm.amount.toFixed(2);
                  vm.amountTemp1 = vm.amount.toFixed(2);
                  vm.padroaValue = history.DefaultPaymentDay;
                  vm.verificarValue = history.VerficarDay;
                  calculate();
                  refreshVencimento(true);

                  if(history.TxtWAPhones == undefined || history.TxtWAPhones == null)
                    vm.customerPhones = customer.Phones.filter(x=>!x.IsFoneclube)[0].DDD + customer.Phones.filter(x=>!x.IsFoneclube)[0].Number;
                else
                  vm.customerPhones=history.TxtWAPhones;
                validatePhone();
                }
                if (history.PaymentType == BOLETO) {
                  PagarmeService.getStatusBoleto(history.BoletoId).then(function (result) {
                    if (result.length > 0) {
                      history.StatusPayment = result[0].status;
                    }
                  })
                }
              }
              customer.histories = vm.histories;
            })
            .catch(function (error) {

            });

            FoneclubeService.getTotaisComissoes(customer.Id).then(function (result) {
              console.log('FoneclubeService.getTotaisComissoes')
              console.log(result)
              vm.totaisComissoes = result;

            })


            FoneclubeService.getCommision(customer.Id).then(function (result) {
              vm.bonus = parseFloat(result.Ammount / 100).toFixed(2);
              calculate();
              changeTextValue();
            })
              .catch(function (error) {

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
            //refreshVencimento(true);
            if(vm.customerComment!=undefined){
            vm.replaceIndex = 0;
            vm.customerComment = vm.customerComment.replace(/([\|(])(.+?)([\|)])/gs, autoRepalceText);
            vm.replaceIndex = 0;

            vm.replaceIndexBoleto = 0;
            vm.commentBoleto = vm.commentBoleto.replace(/([\|(])(.+?)([\|)])/gs, autoRepalceTextBoleto);
            vm.replaceIndexBoleto = 0;
            }
      }

      function changeTextValueChange(){
        refreshVencimento(false);
        if(vm.customerComment!=undefined){
            vm.replaceIndex = 0;
            vm.customerComment = vm.customerComment.replace(/([\|(])(.+?)([\|)])/gs, autoRepalceText);
            vm.replaceIndex = 0;

            vm.replaceIndexBoleto = 0;
            vm.commentBoleto = vm.commentBoleto.replace(/([\|(])(.+?)([\|)])/gs, autoRepalceTextBoleto);
            vm.replaceIndexBoleto = 0;
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
          var dat = new Date(vm.expirationDateField);
          dat.setDate(dat.getDate());
          var expirationDt = dat.toLocaleDateString('pt-br', { day: '2-digit', month: 'long'});
          resStr = expirationDt.replace(' ',', ')
        }
        if(vm.replaceIndex == 4){
          resStr =  vm.amount;
        }
        vm.replaceIndex++;

        return start + resStr + end;
      }

      function autoRepalceTextBoleto(match, start, changeValue, end, offset, string) {
        var resStr = "";
        if(vm.replaceIndexBoleto == 0){
          resStr = vm.vigenciaField.split(" ")[1] ? new Date(0,parseInt(vm.vigenciaField.split(" ")[1]),0).toLocaleDateString('pt-br', { month: 'long'}) : '';
        }
        if(vm.replaceIndexBoleto == 1){
          var dat = new Date(vm.expirationDateField);
          dat.setDate(dat.getDate());
          var expirationDt = dat.toLocaleDateString('pt-br', { day: '2-digit', month: 'long'});
          resStr = expirationDt.replace(' ',', ')
        }
        if(vm.replaceIndexBoleto == 2){
          resStr =  vm.amount;
        }
        vm.replaceIndexBoleto++;

        return start + resStr + end;
      }

          function calculate() {
            var amount = vm.amountTemp.toString().indexOf('.') > -1 ? parseFloat(vm.amountTemp) : parseFloat(vm.amountTemp) / 100;
            var bonus = vm.totaisComissoes.ValorTotalLiberadoParaPagarCliente.toString().indexOf('.') > -1 ? parseFloat(vm.totaisComissoes.ValorTotalLiberadoParaPagarCliente) : parseFloat(vm.totaisComissoes.ValorTotalLiberadoParaPagarCliente) / 100;
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
            //alert(vm.Excepcional);
            //if (!vm.claro) {
            //  vm.Excepcional
                if (!getAddress(vm.customer) || !getContactPhone(vm.customer)) {
                    return;
                }

                if (parseInt(vm.amount) < 1) {
                  DialogFactory.showMessageDialog({ titulo: 'Aviso', mensagem: 'Não é possível criar uma cobrança com valor inferior a R$1.00. Por favor corrija o valor ou opte por criar uma ordem de serviço com os detalhes desta cobrança.' });
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

            function SaveDefaults()
            {
              //debugger;
              var paymentInfo = {
                Id : vm.customer.Id,
                DefaultPaymentDay : vm.padroaValue,
                DefaultVerificar : vm.verificarValue,
                DefaultWAPhones : vm.customerPhones
              };
              FoneclubeService.saveDefaultPaymentInfo(paymentInfo).then(function (result) {
                    return false;
              });
            }

            function onTapPagar(isScheduled, isBothPPClick){
              //debugger;
              var process = true;
              if(isScheduled){
                  if(!isBothPPClick)
                  {
                      if(moment(new Date()).add(5, 'day') > moment(vm.expirationDateField))
                      {
                        ViewModelUtilsService.showConfirmDialog('Atenção!', 'A data é inferior a 5 dias no futuro, clique OK para criar e   enviar a cobrança agora ou "CANCELA" para trocar a data').then(function(confirm) {
			                    if (confirm) {
                            vm.etapaDados = false;
                            vm.etapaConfirmacao = true;
                            vm.chargeStatusDiv = false;
                            ProcessCharging(false, isBothPPClick);
                          }
                          else
                          {
                            return;
                          }
                        });
                      }
                  else
                    ProcessCharging(true, isBothPPClick);
                }
                else
                  ProcessCharging(true, isBothPPClick);
              }
              else{
                ProcessCharging(isScheduled, isBothPPClick);
              }
            }

            function ProcessCharging(isScheduled, isBothPPClick){
              SaveDefaults();
              console.log('tap pagar boleto')
              console.log(parseInt(vm.amount))
              var em = vm.amount.toString().split(".");
              console.log(em[0]);
              if (em[1] != undefined) {
                vm.amount = vm.amount.toString().replace(".", "")
              }

                vm.disableTapPay = true;
                vm.message = 'Iniciando transação';
                vm.instructions = 'FoneClub - 2017'
                // debugger;
                // PagarmeService.postBoleto(vm.amount, vm.commentBoleto, existentCustomer)
                //  .then(function(result){
                //     console.log(result);

                // if(!vm.expirationDateField)
                // {
                //     vm.expirationDateField = 5;
                // }
                // else{
                //    if(vm.expirationDateField <= 0)
                //    {
                //     vm.expirationDateField = 5;
                //    }
                // }


                    if(isScheduled)
                    {
                      if(moment(new Date()).add(5, 'day') > moment(vm.expirationDateField))
                      {
                          vm.disableTapPay = false;
                          DialogFactory.showMessageDialog({mensagem:'a data é inferior a 5 dias no futuro, iremos criar e enviar esta cobrança agora'});
                          return;
                      }
                      vm.etapaDados = false;
                      vm.etapaConfirmacao = true;
                      vm.chargeStatusDiv = false;
                      var chargeDataArray = [];
                      var bothPPValue = 0;
                      
                      if(vm.bothPP == 0 || vm.bothPP == 1) 
                        bothPPValue = 0;
                      else
                        bothPPValue = isBothPPClick ? vm.bothPP : 0;

                      var completeCount = 1;
                      var strMessage = 'Favor confirmar agendamento abaixo: <br/>Numero total de cobranças: ' + (bothPPValue == 0 ? 1 : bothPPValue) +'<br/>'; 
                      for(var ibothcount = bothPPValue == 0 ? 0 : 1; ibothcount <= bothPPValue; ibothcount++)
                      {
                          var expiryDate = moment(vm.expirationDateField).add(ibothcount, 'month').format("DD MMMM YYYY");
                          var vigenciaYear = parseInt(vm.vigenciaField.split(" ")[0]);
                          var vigenciaMonth = parseInt(vm.vigenciaField.split(" ")[1]);
                          var vy = vigenciaMonth + ibothcount <= 12? vigenciaYear + " " + (vigenciaMonth + ibothcount): vigenciaYear + 1 + " " + ((vigenciaMonth + ibothcount) - 12);

                          strMessage += '<br/><label>' + (ibothcount == 0 ? 1: ibothcount) + '. Vencimento:<strong>' + moment(expiryDate).format("DD/MMM/YYYY")+'</strong></label>';
                          strMessage += '<label>Vigencia:<strong>' + vy.split(" ")[1] + '/' + vy.split(" ")[0]+'</strong></label>';
                          strMessage += '<label>Total:<strong>R$' + vm.amount/100 +'</strong></label>';

                         
                          var customerCharging = {
                            Id: vm.customer.Id,
                            Charging:{
                                Comment: vm.bothPP == 1 ? encodeURIComponent(vm.comment): encodeURIComponent(vm.defaultTemplateText),
                                CommentEmail: vm.bothPP == 1 ? encodeURIComponent(vm.customerComment) : encodeURIComponent(vm.defaultTemplateText),
                                CommentBoleto: vm.bothPP == 1 ? encodeURIComponent(vm.commentBoleto): encodeURIComponent(vm.defaultBoletoText),
                                Ammount: vm.amount,
                                CollectorName: MainUtils.getAgent(),
                                PaymentType: BOLETO,
                                AnoVingencia: vy.split(" ")[0],
                                MesVingencia: vy.split(" ")[1],
                                ChargeStatus: vm.chargeStatus,
                                ScheduledMonth:moment(expiryDate).format("MM"),
                                ScheduledYear:moment(expiryDate).format("YYYY"),
                                ScheduledDay:moment(expiryDate).format("DD"),
                                TxtWAPhones:vm.customerPhones,
                                ChargingComment: vm.AdditionalComment
                            }
                          }

                          console.log(customerCharging);
                          chargeDataArray.push(customerCharging); 
                      }
                      DialogFactory.dialogConfirm({ title: 'Atenção!', mensagem: strMessage, btn1: 'Yes', btn2: 'No, edit Charge' }).then(function(confirm) {
                        if(confirm==0){
                          for(var cc = 0 ; cc< chargeDataArray.length; cc++){
                            //posso colocar na lista de cobranças e ser o primeiro com vingencia
                            FoneclubeService.postSchedulePayment(customerCharging).then(function(result){
                            
                               if(completeCount == chargeDataArray.length)
                                {
                                    vm.message = 'Agendamento feito com sucesso';
                                    vm.showCopyButtons = false;
                                    vm.cobrancaRealizada = true;
                                    vm.disableTapPay = false;
                                }
                              completeCount++;        
                            })
                            .catch(function(error){
                                console.log('catch error');
                                console.log(error);
                            });
                          }
                        }
                        else{
                          vm.etapaDados = true;
                          vm.etapaConfirmacao = false;
                          vm.chargeStatusDiv = false;
                          vm.disableTapPay = false;
                        }
                        });
                  return;
                }

                     PagarmeService.postBoletoDirect(vm.amount, vm.commentBoleto, existentCustomer, UtilsService.formatDateYYYYmmDD(addExpirationDays(vm.expirationDateField))).then(function(resultCapture){

                      vm.boleto_url = resultCapture.boleto_url;
                      vm.boleto_code = resultCapture.boleto_barcode;

                        try{
                            var chargingLog = {
                                'customer': existentCustomer,
                                'ammount': vm.amount,
                                'pagarmeResponse': resultCapture,
                                'boletoComment':vm.commentBoleto,
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
                        catch(erro)
                        {
                            var teste1 = emailObject;
                            var teste2 = existentCustomer;
                            var teste3 = vm.amount;
                            alert("Alerta a cobrança não pode ser salva, se possível pare a tela aqui sem atualizar nada e entre em contato com cardozo")
                        }

                        // debugger;
                            if(vm.enviaEmail)
                            {
                                // debugger;
                                if(vm.customerComment == undefined)
                                    vm.customerComment = ''

                                //debugger;
                                var emailObject = {
                                    'Id': customerId,
                                    'To': existentCustomer.email, //existentCustomer.email
                                    'TargetName' : existentCustomer.name,
                                    'TargetTextBlue': resultCapture.boleto_url,
                                    'TargetSecondaryText' : vm.customerComment,
                                    // 'CustomerComment':vm.customerComment,
                                    'TemplateType' : 2
                                }


                                // debugger;

                                if(vm.pagar && vm.totaisComissoes.ValorTotalLiberadoParaPagarCliente != '0.00')
                                {
                                    emailObject.DiscountPrice = ($filter('currency')(vm.totaisComissoes.ValorTotalLiberadoParaPagarCliente / 100, "")).replace('.',',')
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

                            if(vm.enviaWhatsapp){
                               // debugger;
                              //Send message to whatsapp
                              if(vm.customerComment == undefined)
                                    vm.customerComment = ''

                                var messageObject = {
                                    'ClientId': vm.customer.Id, //existentCustomer.email
                                    'ClientName' : vm.customer.Name,
                                    'CurrentYear': vm.vigenciaField.split(" ")[0],
                                    'CurrentMonth' : vm.vigenciaField.split(" ")[1].trim(),
                                    'CurrentDate' : parseInt(moment(vm.expirationDateField).format("DD")),
                                    'AmountTemp':vm.amountTemp,
                                    'ValorTotalLiberadoParaPagarCliente':vm.totaisComissoes.ValorTotalLiberadoParaPagarCliente,
                                    'AmountTemp1':vm.amountTemp1,
                                    'CustomerComment':vm.customerComment,
                                    'CommentBoleto':vm.commentBoleto,
                                    'Comment':vm.comment
                                }
                                FoneclubeService.postSendChargeMessage(messageObject).then(function(result){
                                    console.log('Whatsapp Message sent');
                                    console.log(result);
                                })
                                .catch(function(error){
                                    console.log('Whats app message could not sent. See error log bellow:');
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


                        saveHistoryPayment(resultCapture.id, resultCapture.acquirer_id, resultCapture.boleto_expiration_date, resultCapture.boleto_url, resultCapture.boleto_barcode);

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

            function saveHistoryPayment(idBoleto, acquirer_id, boleto_expiration_date, boleto_url, boleto_barcode){

                var customerCharging = {
                    Id: vm.customer.Id,
                    Charging:{
                        Comment:encodeURIComponent(vm.comment),
                        CommentEmail:encodeURIComponent(vm.customerComment),
                        CommentBoleto:encodeURIComponent(vm.commentBoleto),
                        Ammount: vm.amount,
                        CollectorName: MainUtils.getAgent(),
                        PaymentType: BOLETO,
                        BoletoId: idBoleto,
                        AcquireId: acquirer_id,
                        AnoVingencia: vm.vigenciaField.split(" ")[0],
                        MesVingencia: vm.vigenciaField.split(" ")[1],
                        ChargeStatus: vm.chargeStatus,
                        TransactionId: vm.TransactionId,
                        ComissionConceded: vm.pagar, // need to see the property nameComissionConceded
                        ExpireDate:boleto_expiration_date,
                        DueDate: moment(vm.expirationDateField).add(1, "days").toDate(),
                        TxtWAPhones:vm.customerPhones,
                        ChargingComment: vm.AdditionalComment,
                        BoletoUrl : boleto_url,
                        BoletoBarcode: boleto_barcode
                    }
                }

                FoneclubeService.postHistoryPayment(customerCharging).then(function (result) {

                   FoneclubeService.getLastPersonCharging(customer.Id).then(function (res) {
                              // debugger
                   vm.customerChargingPaymentInfo = res;
                   vm.cobrancaRealizada = true;
                   vm.disableTapPay = false;

                  //  if(vm.enviaWhatsapp){
                  //       var dataMessage = {
                  //         ClientIds: vm.customerPhones,
                  //         Message: CopyBoletoMsgCopy(),
                  //         Buttons: ["Ok Recebi", "Problema"]
                  //       };
                      
                  //       FoneclubeService.postSendWhatsappMessageWithButton(dataMessage).then(function(result){
                  //           DialogFactory.showMessageDialog({mensagem:'Mensagem enviada ao usuário via WhatsApp'});
                  //       });
                  //   }
                            
                    if(vm.pagar)
                    {
                        FoneclubeService.dispatchedCommision(vm.customer.Id).then(function (result) {
                          if(!result)
                            alert('Não foi possível dar baixa em comissão');


                            // FoneclubeService.dispatchedBonus(vm.customer.Id).then(function (result) {

                            //   debugger
                            //   if(!result)
                            //     alert('Não foi possível dar baixa em comissão');

                            // })
                            // .catch(function (error) {
                            //   alert('Não foi possível dar baixa em comissão');
                            // })

                        })
                        .catch(function (error) {
                          alert('Não foi possível dar baixa em comissão');
                        })
                    }
                  })

                    })
                    .catch(function(error){
                        // debugger
                        alert('Aviso em verificação secundária, printar tela -  '
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
                        + '  bc372'
                        )
                        console.log('catch error');
                        console.log(error);
                    });


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
                    // debugger
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
              var dat = new Date(days);
              if(vm.addVencimentoDays)
                dat.setDate(dat.getDate());
              return dat.toISOString();
              }

              function incrementPadroa(){
                vm.padroaValue++;
                refreshVencimento(true);
                changeTextValue();
              }
  
              function decrementPadroa(){
                vm.padroaValue--;
                refreshVencimento(true);
                changeTextValue();
              }
  
              function refreshVencimento(blnVal){ 
                var foDate = '';
                var currentDate = new Date();
                var selectedDt = new Date(new Date().getFullYear().toString(), vm.vigenciaField.split(" ")[1] - 1, vm.padroaValue);
                if(!blnVal){
                  selectedDt = new Date(vm.expirationDateField);
                }
                if(currentDate >= selectedDt){
                  foDate = UtilsService.formatDate(UtilsService.addDays(1));
                }
                else{
                  var datediff = UtilsService.diffBtDays(currentDate, selectedDt);
                  foDate = UtilsService.formatDate(UtilsService.addDays(datediff));
                }
                console.log("foDate: " + foDate);
                upDateCalendar(foDate);
            }

            function upDateCalendar(date){
              vm.expirationDateField = moment(date).format("DD MMMM YYYY");
            }

          
            function CopyBoletoMsgCopy() {
              var infoPay = vm.customerChargingPaymentInfo;
              var addComment = infoPay.txtChargingComment !=undefined && infoPay.txtChargingComment!=null?"*"+infoPay.txtChargingComment+"*":"";
              var chargesummaryurl = window.location.origin+"/#/resumocobranca/"+vm.customer.Id+"/"+infoPay.intId;
              return `🤖 FoneClube: *FoneBot*
              
*Prezado Cliente FoneClube*,
              
Segue resumo da sua última cobrança que que esta sendo enviada por email e whatsapp.
${addComment}

*Vencimento:${moment(infoPay.dteDueDate).format("DD/MM")}*
*Vigencia:${moment(infoPay.dteValidity).format("MM") + "/" + moment(infoPay.dteValidity).format("YYYY")}*
*Total:R$${infoPay.txtAmmountPayment / 100}*
              
*Detalhes para pagamento no link abaixo.*
              
${chargesummaryurl}
              
Caso tenha alguma dúvida envie um *whatsapp para* 

*${'https://wa.me/5521981908190'}* 

ou email para 
*financeiro@foneclube.com.br*.
              
Obrigado pela Atenção:
*FoneClube*  👍`;
        
            }

            function CopyBoletoMsg(){
              var text_to_share = CopyBoletoMsgCopy();
              ClipBoardCopy(text_to_share);
        
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

            function incrementBothPP(){
              vm.bothPP++;
            }

            function decrementBothPP(){
              vm.bothPP--;
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
