(function() {
    'use strict';

        angular
            .module('foneClub')
            .controller('InstaChargeConfirmation', InstaChargeConfirmation);


            InstaChargeConfirmation.inject = ['ViewModelUtilsService', 'FoneclubeService', 'DialogFactory', 'UtilsService', 'localStorageService', '$filter'];

        function InstaChargeConfirmation(ViewModelUtilsService, FoneclubeService, DialogFactory, UtilsService, $filter, localStorageService) {

            var vm = this;
            vm.ParentData = ViewModelUtilsService.modalData;
            vm.Senha = "";
            vm.ActivateDDD = "";
            vm.ActivateCPF = "";
            vm.Message = "";
            vm.MessageAddress = "";
            vm.IsActivate = false;
            vm.amounts = {};
            vm.plans = [];
            vm.Amount = 0;
            vm.shipmentType = 2;
            vm.paymentType = 3;
            vm.index = 1;
            vm.phones = [];
            vm.showCharge = false;

            vm.updatePrice = updatePrice;
            vm.updateShipment = updateShipment;
            vm.registerAndChargeClient = registerAndChargeClient;
            vm.registerClientLine = registerClientLine;

            init();

            function init(){
                vm.phones = [];

                var msg = "<div class='row'>Você adicionou as linhas abaixo, clique em confirmar para salvar</div>";
                var msgPhone = "<div class='row'>";
                var phones = [];
                var filterNewRows = vm.ParentData.Selected;
                for(var i=0; i < filterNewRows.length; i++)
                {
                    msgPhone += "<div class='col-md-4'>Contel: " + filterNewRows[i].Contel + "<br/>Port: " + filterNewRows[i].Port + "<br/>ICCID: " + filterNewRows[i].ICCID + '<br/>Plano: ' + filterNewRows[i].PrecoFC + "<br/>Plano: " + "R$" + (filterNewRows[i].VIPPrice.replace("R$","").replace(".","")/100).toFixed(2) + "<br/>eSIM: " + filterNewRows[i].ESim + "<br/></div>"; 
                    var plan = vm.ParentData.Plans.find(x=>x.Description == filterNewRows[i].PrecoFC);
                    var data = {
                        DDD: filterNewRows[i].Contel != null ? filterNewRows[i].Contel.substr(0,2) : 0,
                        Number: filterNewRows[i].Contel != null ? filterNewRows[i].Contel.substr(2) : 0,
                        IdOperator: plan.IdOperator,
                        Owner: vm.ParentData.Id,
                        PortNumber: filterNewRows[i].Port != null ? filterNewRows[i].Port : "",
                        NickName:  filterNewRows[i].NickName,
                        ICCID: filterNewRows[i].ICCID,
                        IdPlanOption: plan.Id,
                        AmmountPrecoVip: filterNewRows[i].VIPPrice
                    };
                    vm.phones.push(data);
                    vm.ActivateCPF = vm.ParentData.Client.CPF;

                    if(vm.ParentData.IsCharge)
                    {
                        updatePrice(plan.Id, i, data.AmmountPrecoVip);
                        vm.showCharge = true;
                    }
                }
                
                 vm.Message = msg + msgPhone + "</div>";
                 
                 vm.MessageAddress += "<div>" ;
                 vm.MessageAddress += "<span style='color:red'>Shipment Address:</span><br/>" ;
                 vm.MessageAddress += "CEP: " + vm.ParentData.Client.Address.Cep + "<br />"
                 vm.MessageAddress += "StreetNumber: " + vm.ParentData.Client.Address.StreetNumber + "<br />"
                 vm.MessageAddress += "Street: " + vm.ParentData.Client.Address.Street + "<br />"
                 vm.MessageAddress += "Complement: " + vm.ParentData.Client.Address.Complement + "<br />"
                 vm.MessageAddress += "Neighborhood: " + vm.ParentData.Client.Address.Neighborhood + "<br />"
                 vm.MessageAddress += "City: " + vm.ParentData.Client.Address.City + "<br />"
                 vm.MessageAddress += "State: "  + vm.ParentData.Client.Address.State + "<br />"
                 vm.MessageAddress += "</div>" ;
            }

            function registerClientLine()
            {
                if(vm.ActivateDDD == "")
                {
                    DialogFactory.showMessageDialog({mensagem:'É obrigatório informar DDD do SIM card (chip) a ser ativado.'});
                }
                else{   
                var client = vm.ParentData.Client;
                var requestData = {
                    Person : {
                        CPF : client.CPF.replaceAll(".","").replaceAll("-",""),
                        CPFType : client.CpfType,
                        Nome : client.Nome,
                        WhatsAppNumber: UtilsService.getPhoneNumberFromStringToJson(client.WhatsAppNumber).DDD + ""+ UtilsService.getPhoneNumberFromStringToJson(client.WhatsAppNumber).Number,
                        Email: client.Email,
                        Parent: client.Parent,
                    },
                    CustomerPhone: {
                        DDD: UtilsService.getPhoneNumberFromStringToJson(client.WhatsAppNumber).DDD,
                        Number: UtilsService.getPhoneNumberFromStringToJson(client.WhatsAppNumber).Number,
                        IsFoneclube: false,
                        LinhaAtiva: true,
                        ESim : false
                    },
                    Phones: vm.phones,
                    Address: client.Address,
                    IsActivate : vm.IsActivate,
                    ActivationPwd : vm.Senha,
                    ActivationDDD : vm.ActivateDDD,
                    ActivationCPF : vm.ActivateCPF.replaceAll(".","").replaceAll("-",""),
                };
                // var showLoader = DialogFactory.showLoader("Por favor, aguarde");
                // FoneclubeService.saveInstaRegisterClientOrLine(requestData).then(function (result1) {
                //     showLoader.close();
                //     if(result1 == "sucesso")
                //         DialogFactory.showMessageDialog({mensagem:'Cliente/Linha registado com sucesso'});
                //     else
                //         DialogFactory.showMessageDialog({mensagem: result1});
                // });
                }
            }

            function registerAndChargeClient()
            {
                debugger;
                if(vm.ActivateDDD == "")
                {
                    DialogFactory.showMessageDialog({mensagem:'É obrigatório informar DDD do SIM card (chip) a ser ativado.'});
                }
                else{ 
                var client = vm.ParentData.Client;
                var planselectionComment = vm.ParentData.Selected.map((x) => "ICCID: " + x.ICCID + ", Phone: " + x.Contel + ", Plan:" + x.PrecoFC + ",  Port: " + x.Port).join('\r\n');

                var planselection = vm.phones.map((x) => x.ICCID + "|" + x.IdPlanOption + "|" + x.AmmountPrecoVip + "|" + (x.DDD ? x.DDD : "") + "" + (x.Number ? x.Number : "") + "|" +  (x.PortNumber != 0 ? UtilsService.getPhoneNumberFromStringToJson(x.PortNumber).DDD : "" + "|" + x.PortNumber != 0 ? UtilsService.getPhoneNumberFromStringToJson(x.PortNumber).Number : "")).join('#');

                var requestData = {
                        Register:{
                            Person : {
                                CPF : client.CPF.replaceAll(".","").replaceAll("-",""),
                                CPFType : client.CpfType,
                                Nome : client.Nome,
                                WhatsAppNumber: UtilsService.getPhoneNumberFromStringToJson(client.WhatsAppNumber).DDD + ""+ UtilsService.getPhoneNumberFromStringToJson(client.WhatsAppNumber).Number,
                                Email: client.Email,
                                Parent: client.Parent,
                            },
                            CustomerPhone: {
                                DDD: UtilsService.getPhoneNumberFromStringToJson(client.WhatsAppNumber).DDD,
                                Number: UtilsService.getPhoneNumberFromStringToJson(client.WhatsAppNumber).Number,
                                IsFoneclube: false,
                                LinhaAtiva: true,
                                ESim : false
                            },
                            Phones: vm.phones,
                            Address: client.Address,
                            IsActivate : vm.IsActivate,
                            ActivationPwd : vm.Senha,
                            ActivationDDD : vm.ActivateDDD,
                            ActivationCPF : vm.ActivateCPF.replaceAll(".","").replaceAll("-",""),
                        },
                        Charge : {
                            Comment: client.Comment.replace("planvariable", planselectionComment).replace("amountvariable", vm.Amount),
                            DueDate : moment(client.Vencimento).format("DD/MM/YYYY"),
                            AnoVingencia: client.Vigencia.split(" ")[0],
                            MesVingencia: client.Vigencia.split(" ")[1].trim(),
                            InstaRegsiterData : planselection,
                            PaymentType: parseInt(vm.paymentType),
                        }
                    };
                    // var showLoader = DialogFactory.showLoader("Por favor, aguarde");
                    // FoneclubeService.saveInstaRegisterClientOrLineWithCharge(requestData).then(function (result1) {
                    //     showLoader.close();
                    //     if(result1 == "sucesso")
                    //         DialogFactory.showMessageDialog({mensagem:'Cliente/Linha registado com sucesso'});
                    //     else
                    //         DialogFactory.showMessageDialog({mensagem: result1});
                    //     });
                    }
            }

            function updatePrice(index, id, amount){
                var amount = amount / 100;
                vm.amounts[id] = amount;
                var totalAmount = Object.values(vm.amounts).reduce((a, b) => a + b);
                vm.Amount =  "R$" + totalAmount.toFixed(2);
                updateShipment();
            }

            function updateShipment(){
                if(Object.values(vm.amounts).length > 0)
                {
                    var totalCount = Object.values(vm.amounts).length * 7;
                    var totalAmount = Object.values(vm.amounts).reduce((a, b) => a + b);
                    if(vm.shipmentType == 1){
                        vm.Amount =  "R$" + ((totalAmount + totalCount + 8)).toFixed(2);
                    }
                    else if(vm.shipmentType == 2){
                        vm.Amount =  "R$" + ((totalAmount + totalCount)).toFixed(2);
                    }
                }
            }
        }
})();