(function() {
    'use strict';

        angular
            .module('foneClub')
            .controller('InstaAddNewLineController', InstaAddNewLineController);



        function InstaAddNewLineController($scope, ViewModelUtilsService, PagarmeService, FoneclubeService, DialogFactory, UtilsService, $filter, localStorageService) {

            var vm = this;
            vm.scope = $scope;
            vm.ParentData = ViewModelUtilsService.modalData;
            vm.Plans = vm.ParentData.Plans;
            vm.Name = vm.ParentData.Client.Nome;
            vm.Address = vm.ParentData.Client.Address;
            vm.ESIMs = ["SIM", "NÃO"];
            vm.WhatsAppNum = "";
            vm._Amount = 0;
            vm.Charge = true;
            vm.SubTotal = "0.00";
            vm.TotalShipment = "0.00";
            vm.TotalAmount = "0.00";
            vm.ICCID = "";
            vm.Plan = 42;
            vm.SelectedCardId = "";
            vm.DDD = "";
            vm.Linha = "";
            vm.ESIM = "NÃO";
            vm.Amount = 0;
            vm.Port = "";
            vm.paymentType = 3;
            vm.IsActivateBeforePayment = false;
            vm.IsActivate = true;
            vm.ActivateDDD = "";
            vm.ActivateCPF = "";
            vm.Senha = "";
            vm.shipmentType = 1;
            vm.updateShipment = updateShipment;
            vm.selectedPlanChange = selectedPlanChange;
            vm.ActivateLine = ActivateLine;
            vm.calculate = calculate;
            vm.AddToCart = AddToCart;
            vm.validateCEP = validateCEP;
            vm.onTapCard = onTapCard;
            vm.phones = [];
            vm.cartItems = [];
            vm.ShowGrid = false;
            vm.loopCount = 1;
            vm.gridApi = {};
            vm.gridColumnApi = {};

            init();

            vm.gridOptions = {
                columnDefs: [
                    { field: 'Id', hide: true },
                    { field: 'PlanId', hide: true},
                    { field: 'IsActivate', headerName:"Ativação?", width: 50},
                    { field: 'Plano', headerName:"Plano", width: 200},
                    { field: 'ESim', headerName:"eSim", width: 80},
                    { field: 'DDD', headerName:"DDD da Ativação", width: 80,editable: true, cellEditor: "agTextCellEditor"},
                    { field: 'Contel', headerName:"Contel", width: 100,editable: true, cellEditor: "agTextCellEditor"},
                    { field: 'ICCID', headerName:"ICCID", width: 180,editable: true, cellEditor: "agTextCellEditor"},
                    { field: 'PortDDD', headerName:"DDD da Port", width: 80,editable: true, cellEditor: "agTextCellEditor"},
                    { field: 'Port', headerName:"Port", width: 100,editable: true, cellEditor: "agTextCellEditor"},
                    { field: 'Amount', headerName:"Plano R$", width: 80, editable: true, cellEditor: "agTextCellEditor",
                        onCellValueChanged: function (event) {
                            updateTotal();
                            updateShipment();
                        }
                    },
                    { field: 'Shipment', headerName:"CHIP R$", width: 80, editable: true, cellEditor: "agTextCellEditor",     onCellValueChanged: function (event) {
                        updateTotal();
                        updateShipment();
                    }},
                    { field: 'Action', width: 50, editable: false, cellRenderer: function (params) {
                        if(params.value != null){
                            return '<a title="ff"><img class="imgWhatsapp link" style="max-width:15px;margin:10px 5px" src="content/img/Cancel.png" /></a>';
                        }
                        else return "";
                        },
                        suppressMenu: true,
                        floatingFilter: false,
                        onCellClicked:function(data)
                        {
                            var index = vm.cartItems.map(x => {  return x.Id;}).indexOf(data.data.Id);
                            vm.cartItems.splice(index, 1);
                            if (vm.gridOptions.api) {
                                vm.gridOptions.api.setRowData(vm.cartItems);
                                updateTotal();
                                updateShipment();
                            }
                        }
                    }
                ],
                 defaultColDef: {
                    sortable: true,
                    filter: true,
                    enableFilter: true,
                    resizable: true,
                    editable: false,
                },
                stopEditingWhenGridLosesFocus: true,
                enableCellTextSelection: true,
                autoSizeColumns: true,
                rowHeight: 30,
                headerHeight: 75,
                onGridReady: function (params) {
                    LoadNewLines();
                    vm.gridApi = params.api;
                    vm.gridColumnApi = params.columnApi;
                },
            };

            function init()
            {
                selectedPlanChange();
                initCardList(vm.ParentData.Client.IdPagarme);
                //initCardList(30660846);
            }

            function AddToCart(){
                vm.ShowGrid = true;
                var selectedPlan = vm.Plans.find(x=>x.Id == vm.Plan);
                vm.cartItems.push({
                    Id: vm.loopCount,
                    Plano : selectedPlan.Description,
                    PlanId: selectedPlan.Id,
                    ESim : vm.ESIM,
                    DDD : vm.ActivationDDD,
                    Contel: vm.Linha,
                    ICCID: vm.ICCID,
                    PortDDD: vm.PortDDD,
                    Port: vm.Port,
                    Amount: selectedPlan.Value,
                    Shipment : vm.ESIM == "SIM" ? 500 : 1000, 
                    Action : "N",
                    IsActivate : vm.IsActivate
                });
                if (vm.gridOptions.api) {
                    vm.gridOptions.api.setRowData(vm.cartItems);
                    updateTotal();
                    vm.loopCount++;
                }
            }

            function updateTotal(){
                vm.gridOptions.api.refreshCells();
                let pinnedBottomData = generatePinnedBottomData();
                vm.gridApi.setPinnedBottomRowData([pinnedBottomData])
                vm.gridOptions.api.refreshCells();
                updateShipment();
                vm.scope.$apply();
            }


            function generatePinnedBottomData(){
                // generate a row-data with null values
                let result = {};

                vm.gridColumnApi.getAllGridColumns().forEach(item => {
                    result[item.colId] = null;
                });
                return calculatePinnedBottomData(result);
            }

            function calculatePinnedBottomData(target){
                //console.log(target);
                //**list of columns fo aggregation**
                let columnsWithAggregation = ['Shipment', 'Amount']
                columnsWithAggregation.forEach(element => {
                console.log('element', element);
                vm.gridApi.forEachNodeAfterFilter((rowNode) => {
                    if (rowNode.data[element])
                        target[element] += parseInt(rowNode.data[element]);
                    });
                if (target[element])
                    target[element] = `${target[element]}`;
                })
                return target;
            }

            function updateShipment()
            {
                var amounts = vm.cartItems.reduce((n, {Amount,  Shipment}) => n + parseInt(Amount) + parseInt(Shipment), 0);
                var totalShip = vm.cartItems.reduce((n, {Shipment}) => n + parseInt(Shipment), 0);
                var totalAmount = amounts;
                if(vm.shipmentType == 2)
                {
                    vm.Amount =  "R$" + ((totalAmount  + 500) / 100).toFixed(2);
                    totalShip = totalShip + 500;
                }
                else if(vm.shipmentType == 3)
                {
                    vm.Amount =  "R$" + ((totalAmount  + 1000) / 100).toFixed(2);
                    totalShip = totalShip + 1000;
                }
                else
                {
                    vm.Amount =  "R$" + ((totalAmount) / 100).toFixed(2);
                }
                var items = vm.cartItems.reduce((n, {Amount}) => n + parseInt(Amount), 0);
                vm.SubTotal = ((items) / 100).toFixed(2);
                vm.TotalShipment = ((totalShip) / 100).toFixed(2);
                vm.TotalAmount = ((items + totalShip) / 100).toFixed(2);

            }
            
            function LoadNewLines()
            {
                if (vm.gridOptions.api) {
                    vm.gridOptions.api.setRowData([]);
                }
            }

            function selectedPlanChange(){
                //vm._Amount =  (vm.Plans.find(x=>x.Id == vm.Plan).Value/ 100).toFixed(2);
                //vm.Amount =  "R$" + (vm.Plans.find(x=>x.Id == vm.Plan).Value/ 100).toFixed(2);
            }

            function validateCEP() {
                var cep = vm.Address.Cep.replaceAll("-", "").replaceAll("_", "").replaceAll(".", "");
                if(cep.length == 8)
                {
                    FoneclubeService.validateCEP(cep).then(function (data) {
                    if (data != "error") {
                      //vm.address.CEP= cep;
                      vm.Address.Street = data.logradouro;
                      vm.Address.StreetNumber = "";
                      vm.Address.Complement = "";
                      vm.Address.Neighborhood = data.bairro;
                      vm.Address.City = data.localidade;
                      vm.Address.State = data.uf;
                      vm.Address.Cep = cep;
                    }
                    });
                }
            }

            function calculate() 
            {
                var amount = vm.Amount.toString().indexOf('.') > -1 ? parseFloat(vm.Amount) : parseFloat(vm.Amount) / 100;
                vm.Amount = "R$" + parseFloat(amount).toFixed(2);
            }

            function initCardList(customerId) {
                PagarmeService.getCard(customerId)
                  .then(function (result) {
                    vm.cards = result.sort(function (a, b) {
                      return new Date(b.date_updated) > new Date(a.date_updated) ? 1 : -1;
                    });
                  })
                  .catch(function (error) {
                    console.log(error);
                    vm.message = 'falha ao recuperar cartão';
                  });
            }

             function onTapCard(card) 
             {
                vm.SelectedCardId = card.id;
                DialogFactory.showMessageDialog({mensagem: "You have selected card ending :" + card.last_digits});
             }

            function ActivateLine()
            {
                if(vm.paymentType == "1" && vm.SelectedCardId == ""){
                    DialogFactory.showMessageDialog({mensagem: "You have not selected any card"});
                    return;
                }
                vm.phones = [];
                if(vm.cartItems != null && vm.cartItems.length > 0)
                {
                   vm.cartItems.forEach(function(cart){
                   var data = {
                            DDD: cart.DDD == undefined || cart.DDD == "" ? 21 : cart.DDD,
                            Number: cart.Contel != "" ||  cart.Contel != undefined ? cart.Contel: "",
                            IdOperator: 4,
                            Activate : vm.IsActivate, 
                            Owner: vm.ParentData.Id,
                            PortDDD: cart.PortDDD  != undefined ? cart.PortDDD : "" ,
                            PortNumber: cart.Port != "" ||  cart.Port != undefined ? cart.Port : "" ,
                            ICCID: cart.ICCID != undefined ? cart.ICCID : "",
                            IdPlanOption: cart.PlanId,
                            ESIM: cart.ESim == "SIM" ? true : false,
                            Amount : cart.Amount,
                        };
                    vm.phones.push(data);
                   });
                }
                console.log(vm.phones);
                
                var client = vm.ParentData.Client;

                if(vm.Charge)
                {
                        var planselectionComment = vm.phones.map((x) => "ICCID: " + x.ICCID + ", Phone: " + x.Number+ ", Plan:" + x.IdPlanOption + ",  Port: " + x.Port).join('\r\n');

                        var planselection =  vm.phones.map((x) => x.ICCID + "|" + x.IdPlanOption + "|" + x.Amount + "|" + x.DDD +
                        "|" + (x.Number != 0 ? x.Number :  "" ) + "|" + x.PortDDD + "|" + (x.PortNumber != 0 ? x.PortNumber : "") + "|" + vm.IsActivate + "|" + vm.Charge + "|" + x.ESIM + "|" + vm.shipmentType).join('#');

                        var requestData = { 
                            Register:{
                                Person : {
                                    CPF : client.CPF.replaceAll(".","").replaceAll("-",""),
                                    CPFType : client.CpfType,
                                    Nome : client.Nome,
                                    WhatsAppNumber: vm.WhatsAppNum == "" ? UtilsService.getPhoneNumberFromStringToJson(client.WhatsAppNumber).DDD + ""+ UtilsService.getPhoneNumberFromStringToJson(client.WhatsAppNumber).Number : vm.WhatsAppNum,
                                    Email: client.Email,
                                    Parent: client.Parent,
                                },
                                CustomerPhone: {
                                    DDD: vm.WhatsAppNum == "" ? UtilsService.getPhoneNumberFromStringToJson(client.WhatsAppNumber).DDD : UtilsService.getPhoneNumberFromStringToJson(vm.WhatsAppNum).DDD,
                                    Number: vm.WhatsAppNum == "" ? UtilsService.getPhoneNumberFromStringToJson(client.WhatsAppNumber).Number: UtilsService.getPhoneNumberFromStringToJson(vm.WhatsAppNum).Number,
                                    IsFoneclube: false,
                                    LinhaAtiva: true,
                                    ESim : false
                                },
                                Phones: vm.phones,
                                Address: client.Address,
                                IsActivateBeforePayment : vm.IsActivateBeforePayment,
                                ActivationPwd : vm.Senha,
                                ActivationCPF : vm.ActivateCPF.replaceAll(".","").replaceAll("-",""),
                                ShipmentType : vm.shipmentType,
                            },
                            ChargeData : {
                                Comment: client.Comment.replace("planvariable", planselectionComment).replace("amountvariable", vm.Amount),
                                DueDate : moment(client.Vencimento).format("DD/MM/YYYY"),
                                AnoVingencia: client.Vigencia.split(" ")[0],
                                MesVingencia: client.Vigencia.split(" ")[1].trim(),
                                InstaRegsiterData : planselection,
                                PaymentType: parseInt(vm.paymentType),
                                Ammount: vm.Amount.replace('R$','').replace('.',''),
                                CardId : vm.SelectedCardId
                            }
                        };
                        console.log(requestData);
                        var showLoader = DialogFactory.showLoader("Por favor, aguarde");
                        FoneclubeService.saveInstaRegisterClientOrLineWithCharge(requestData).then(function (result1) {
                            showLoader.close();
                            if(result1 == "sucesso")
                                DialogFactory.showMessageDialog({mensagem:'Cliente/Linha registado com sucesso'});
                            else
                                DialogFactory.showMessageDialog({mensagem: result1});
                            });
                   
                }
                else
                {
                            var client = vm.ParentData.Client;
                            var requestData = {
                                Person : {
                                    CPF : client.CPF.replaceAll(".","").replaceAll("-",""),
                                    CPFType : client.CpfType,
                                    Nome : client.Nome,
                                    WhatsAppNumber: vm.WhatsAppNum == "" ? UtilsService.getPhoneNumberFromStringToJson(client.WhatsAppNumber).DDD + ""+ UtilsService.getPhoneNumberFromStringToJson(client.WhatsAppNumber).Number : vm.WhatsAppNum,
                                    Email: client.Email,
                                    Parent: client.Parent,
                                },
                                CustomerPhone: {
                                    DDD: vm.WhatsAppNum == "" ? UtilsService.getPhoneNumberFromStringToJson(client.WhatsAppNumber).DDD : UtilsService.getPhoneNumberFromStringToJson(vm.WhatsAppNum).DDD,
                                    Number: vm.WhatsAppNum == "" ? UtilsService.getPhoneNumberFromStringToJson(client.WhatsAppNumber).Number: UtilsService.getPhoneNumberFromStringToJson(vm.WhatsAppNum).Number,
                                    IsFoneclube: false,
                                    LinhaAtiva: true,
                                    ESim : false
                                },
                                Phones: vm.phones,
                                Address: vm.Address,
                                IsActivateBeforePayment : vm.IsActivateBeforePayment,
                                ActivationPwd : vm.Senha,
                                ActivationCPF : vm.ActivateCPF.replaceAll(".","").replaceAll("-",""),
                                ShipmentType : vm.shipmentType,
                            };
                             console.log(requestData);
                            var showLoader = DialogFactory.showLoader("Por favor, aguarde");
                            FoneclubeService.saveInstaRegisterClientOrLine(requestData).then(function (result1) {
                                showLoader.close();
                                if(result1 == "sucesso")
                                    DialogFactory.showMessageDialog({mensagem:'Cliente/Linha registado com sucesso'});
                                else
                                    DialogFactory.showMessageDialog({mensagem: result1});
                            });
                        
                   }
               
            }
        }
         InstaAddNewLineController.inject = ['$scope', 'ViewModelUtilsService', 'PagarmeService', 'FoneclubeService', 'DialogFactory', 'UtilsService', 'localStorageService', '$filter'];
})();

           