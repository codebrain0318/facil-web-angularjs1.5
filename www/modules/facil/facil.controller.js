(function () {

  angular.module('foneClub').controller('FacilController', FacilController);

  FacilController.inject = ['ViewModelUtilsService', 'MainUtils', 'FoneclubeService', 'DialogFactory', '$scope'];

  function FacilController(ViewModelUtilsService, MainUtils, FoneclubeService, DialogFactory, $scope) {
    var vm = this;
    vm.chargeForm = {};
    vm.isLoad = false;
    vm.LoadData = {};
    vm.chargeForm.Nome = "";
    vm.startDate = moment().startOf('month').format('YYYY-MM-DD');
    vm.endDate = moment().endOf('month').format('YYYY-MM-DD');
    vm.isSelected = true;
    vm.selected = null;
    vm.gridWidth = $(window).width() - 150;
    vm.gridHeight = $(window).height() - 150;
    vm.Operations = ["RECARGA", "ATIVAÇÃO", "VENDA DE FICHAS"];
    vm.Operation = "ATIVAÇÃO";
    vm.Choices = ["ENTRADA", "SAÍDA"];
    vm.Choice = "SAÍDA";
    vm.selectItem = selectItem;
    vm.setSelectedName = setSelectedName;
    vm.clearSelectedName = clearSelectedName;
    vm.addNewIntlUser = addNewIntlUser;
    vm.LoadUserData = LoadUserData;
    vm.DepositHistory = DepositHistory;
    vm.AddBalance = AddBalance;
    vm.history1 = {};

    vm.gridOptions1 = {
            columnDefs: [ 
              { field: "Id", hide: true },
              { field: 'DeductedDate', headerName:'DATA', width: 200 ,
                cellRenderer: function (params) {
    				        return moment(params.data.DeductedDate).format("DD MMM YYYY HH:mm:ss");
    			      },
                filter:"agDateColumnFilter",
                filterParams: {
                  filterOptions: ['equals', 'lessThan', 'lessThanOrEqual', 'greaterThan', 'greaterThanOrEqual'],
                },
                comparator: function(filterLocalDateAtMidnight, cellValue) {
                    //using moment js
                    var dateAsString = moment(cellValue).format('DD/MM/YYYY');
                    var dateParts = dateAsString.split("/");
                    var cellDate = new Date(Number(dateParts[2]), Number(dateParts[1]) - 1, Number(dateParts[0]));
                  
                    if (filterLocalDateAtMidnight.getTime() == cellDate.getTime()) {
                      return 0
                    }
                  
                    if (cellDate < filterLocalDateAtMidnight) {
                      return -1;
                    }
                  
                    if (cellDate > filterLocalDateAtMidnight) {
                      return 1;
                    }
                  }
              },
              { field: 'Category', headerName:'Categoria', width: 150 },
              { field: 'AmountDeducted', headerName:'VALOR', width: 100 },
              { field: 'Phone', headerName:'Linha', width: 200 },
              { field: 'Plan', headerName:'Plano', width: 150 },
              { field: 'IsRefund', headerName:'Is Refund', width: 100 ,
                cellRenderer: function (params) {
                  if (params.value != null) {
                    var cellHtml = '<a ng-click="" ><img class="imgWhatsapp link" style="max-width:15px;margin:10px" src="content/img/' +  (!params.value ? "customeroff.png" : "customeron.png") + '" /></a>';
                    return cellHtml;
                  }
                },
                onCellClicked:function(data)
                {
                  var enableRefund = false;
                  if(!data.value)
                  {
                    enableRefund = true;
                  }
                  var data1 = {
                    Id : data.data.Id,
                    Phone: data.data.Phone,
                    IsRefund : enableRefund,
                    Action: 'Refund'
                  };

                  ViewModelUtilsService.showConfirmDialog('Atenção!', 'Tem certeza de que deseja reembolsar o valor da linha:'+ data.data.Phone).then(function(confirm) 
                    {
			                if (confirm) 
                      {

                        FoneclubeService.updateRefundInfo(data1).then(function(result){
                          DialogFactory.showMessageDialog({mensagem: result});

                          vm.LoadData.Purchases[data.rowIndex].IsRefund = enableRefund;
                          bindAgGrid1(data);
                        });
                      }
                    });
                }
              },
              { field: 'Comment', headerName:'Comment', width: 400,  editable: true, cellEditor: "agLargeTextCellEditor",
              onCellValueChanged: function(data){
                  if(data.value)
                  {
                    var data1 = {
                      Id : data.data.Id,
                      Phone: data.data.Phone,
                      IsRefund : data.data.IsRefund,
                      Comment : data.value,
                      Action: 'Comment'
                    };
                    FoneclubeService.updateRefundInfo(data1).then(function(result){
                      vm.LoadData.Purchases[data.rowIndex].Comment = data.value;
                      bindAgGrid1(data);
                  });
                }
              }}
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
            onGridReady: function(params) {
                this.gridApi = params.api;
                this.gridColumnApi = params.columnApi;
                bindAgGrid1(vm.history1);
            }
        }

    init();

    function init(){
        var showLoader1 = DialogFactory.showLoader("aguarde enquanto buscamos os dados");
        FoneclubeService.getAllInternationUsers().then(function(result){
            vm.Names = result;
            //vm.gridOptions1.api.setRowData(null);
            showLoader1.close();
        });
    }

    function bindAgGrid1(data) {
       
        var rowData = convertToViewModel1(vm.LoadData.Purchases);
        if (vm.gridOptions1.api) {
            vm.gridOptions1.api.setRowData(rowData);
        } 
                
    }

    function convertToViewModel1(data){
            var templateDataList = [];
            for (var i = 0; i < data.length; i++) {
                var datamodel = data[i];
                templateDataList.push({
                    'Id' : datamodel.Id,
                    'AmountDeducted': datamodel.Amount,
                    'Category': datamodel.Category,
                    'DeductedDate': datamodel.Date,
                    'Phone': datamodel.Line,
                    'Plan': datamodel.Plan,
                    'IsRefund': datamodel.IsRefund,
                    'Comment': datamodel.Comment
                });
            }
            return templateDataList;
        }

    function selectItem(val){
        vm.isSelected = val;
    }
    
    function setSelectedName(item){
        vm.isSelected = true;
        vm.selected = item;
        vm.chargeForm.Nome = item.Name;
    }

    function clearSelectedName(){
      vm.chargeForm.Nome = "";
    }

    function addNewIntlUser(){
      ViewModelUtilsService.showIntlAddUserModalTemplate(null);
    }

    function LoadUserData()
    {
      if(vm.selected.Id!=null)
      {
        vm.LoadData.Purchases = [];
        var data = {
          Id : vm.selected.Id,
          StartDate : vm.startDate,
          EndDate : vm.endDate,
          Operation : vm.Operation,
          Choice : vm.Choice
        };
        var showLoader1 = DialogFactory.showLoader("aguarde enquanto buscamos os dados");
        FoneclubeService.getAllInternationUserData(data).then(function(result){
            showLoader1.close();
            vm.isLoad= true;

            vm.LoadData = result;

            vm.LoadData.TotalPurchaseAmount = (parseInt(vm.LoadData.TotalPurchaseAmount.replace(",","")) / 100).toLocaleString('pt-br');
            vm.LoadData.CurrentBalance = (parseInt(vm.LoadData.CurrentBalance.replace(",","")) / 100).toLocaleString('pt-br');
            vm.LoadData.TotalDeposits = (parseInt(vm.LoadData.TotalDeposits.replace(",","")) / 100).toLocaleString('pt-br');

            var rowData = convertToViewModel1(vm.LoadData.Purchases);
            if (vm.gridOptions1.api) {
              vm.gridOptions1.api.setRowData(rowData);
            } 
        });
      }
    }

    function AddBalance()
    {
      var customer = {
        Name : vm.LoadData.PersonInfo.Name,
        Id: vm.LoadData.IdPerson
      };
      ViewModelUtilsService.showInternationDeposits(customer);
    }

    function DepositHistory(){
      ViewModelUtilsService.showFacilDeposits(vm.LoadData.Deposits);
    }
  }
})();
