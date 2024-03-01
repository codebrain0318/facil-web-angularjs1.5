(function () {
    'use strict';
    
     angular.module('foneClub').controller('AddNewPhoneModalController', AddNewPhoneModalController);
    
     AddNewPhoneModalController.inject = ['ViewModelUtilsService',
      'FoneclubeService',
      'DialogFactory',
      'UtilsService',
      '$stateParams', '$filter'];

      function AddNewPhoneModalController(ViewModelUtilsService,
        FoneclubeService,
        DialogFactory,
        UtilsService,
        $stateParams, $filter) {
            var vm = this;
            vm.chargeForm = {};
            vm.amounts = {};
            vm.chargeForm.Nome = "";
            vm.isCustomerSelected = true;
            vm.customerNames = [];
            vm.plans = [];
            vm.phones = [];
            vm.gridHeight = 300;
            
            vm.selectCustomerItem = selectCustomerItem;
            vm.setSelectedCustomerName = setSelectedCustomerName;
            vm.onTapSaveLine = onTapSaveLine;
            vm.updatePrice = updatePrice;
            
            vm.gridOptions = {
                columnDefs: [ 
                  { field: 'Contel', headerName:'Contel', width: 150 },
                  { field: 'Port', headerName:'Portar', width: 150 },
                  { field: 'ICCID', headerName:'ICCID', width: 150 },
                  { field: 'NickName', headerName:'Apelido', width: 150 },
                  { field: 'Active', headerName:'Ativo', width: 80  ,cellRenderer: function (params) {
    					var cellHtml ='<a ng-click="" ><img class="imgWhatsapp link" style="max-width:15px;margin:10px 5px" src="content/img/'+(params.value == true ? 'customeron.png' : 'customeroff.png') + '" /></a>';
    					return cellHtml;
    				}
                  },
                  { field: 'PrecoFC', headerName:'PrecoFC', width: 120 },
                  { field: 'VIPPrice', headerName:'R$ VIP', width: 100 }
                ],
                defaultColDef: {
                  //flex: 1,
                  sortable: true,
                  filter: true,
                  resizable: true
                },
                singleClickEdit:true,
                enableCellTextSelection: true,
                autoSizeColumns: true,
                rowHeight: 30,
                headerHeight: 120,
                onCellClicked: onCellClicked,
                onGridReady: function(params) {
                    this.gridApi = params.api;
                    this.gridColumnApi = params.columnApi;
                    bindAgGrid(vm.phones);
                }
            }

            init();

            function init(){
                FoneclubeService.getPlansById(4).then(function (result) {
                    vm.plans = result.filter(x=>x.IdOperator != 1).sort((a,b) => (a.IdOperator > b.IdOperator) ? -1 : ((b.IdOperator > a.IdOperator) ? 1 : 0));
                });

                FoneclubeService.getAllCustomersMinimal().then(function(result){
                    vm.customerNames = result;
                });
            }

            function selectCustomerItem(val){
              vm.isCustomerSelected = val;
            }

            function setSelectedCustomerName(item){
                vm.isCustomerSelected = true;
                vm.chargeForm.Id = item.Id;
                vm.chargeForm.Nome = item.Name;
                LoadUserLines(item.DocumentNumber);
            }

            function updatePrice(plano){
                vm.chargeForm.PlanId=plano;
                var amount = vm.plans.find(x=>x.Id == plano).Value / 100;
                vm.chargeForm.Price = "R$" + amount.toFixed(2);
            }

            function LoadUserLines(cpf){
                FoneclubeService.getCustomerByCPF(cpf).then(function (result) {
                    bindAgGrid(result.Phones);
                });
            }

            function onCellClicked(params) {
                UtilsService.clipBoardCopy(params.value);
            }

            function bindAgGrid(data) {
                var rowData = convertToViewModel(data);
                if (vm.gridOptions.api) {
                    vm.gridOptions.api.setRowData(rowData);
                } 
            }

            function convertToViewModel(data){
                var templateDataList = [];
                for (var i = 0; i < data.length; i++) {
                    var datamodel = data[i];
                    templateDataList.push({
                        'Contel': datamodel.DDD + "" + datamodel.Number,
                        'Port': datamodel.PortNumber,
                        'ICCID': datamodel.ICCID,
                        'Active': datamodel.LinhaAtiva,
                        'PrecoFC': vm.plans.find(x=>x.Id == datamodel.IdPlanOption) == undefined ? "" : vm.plans.find(x=>x.Id == datamodel.IdPlanOption).Description,
                        'VIPPrice': datamodel.AmmountPrecoVip,
                        'NickName': datamodel.NickName,
                    });
                }
                return templateDataList;
            }

            function onTapSaveLine(){
                var phone = UtilsService.clearPhoneNumber(vm.chargeForm.Contel);
                var phones = [];
                var data = {
                    intDDD : phone.substr(0,2),
                    intPhone : phone.substr(2),
                    intIdOperator : 4,
                    intIdPerson : vm.chargeForm.Id,
                    txtPortNumber :  UtilsService.clearPhoneNumber(vm.chargeForm.Port), 
                    txtICCID: vm.chargeForm.ICCID,
                    intIdPlan : vm.chargeForm.PlanId,
                    txtNickname : vm.chargeForm.Apelido,
                    intAmmoutPrecoVip : vm.chargeForm.Price.replace("R$","").replace(".","")
                }
                phones.push(data);
                FoneclubeService.saveInstaPhoneClient(phones).then(function (result) {
                    if(result)
                        DialogFactory.showMessageDialog({mensagem:'Linha salva com sucesso'});
                    else
                        DialogFactory.showMessageDialog({mensagem:'A linha já existe ou ocorreu um erro ao adicionar esta linha'});
                });
            }
    }
})();