(function () {

  angular
    .module('foneClub')
    .controller('SelectPlanoModalController', SelectPlanoModalController);


  SelectPlanoModalController.inject = ['ViewModelUtilsService', 'FoneclubeService', 'DialogFactory', 'UtilsService', 'localStorageService', '$filter'];

  function SelectPlanoModalController(ViewModelUtilsService, FoneclubeService, DialogFactory, UtilsService, $filter, localStorageService) {

    var vm = this;
    vm.Message = 0;
    vm.PhoneLines = [];
    vm.ParentData = ViewModelUtilsService.modalData;
    vm.Invitation = "";
    vm.CustomeName = "";
    vm.CustomerPhone = "";
    vm.CpfType = 0;
    vm.CustomeCPF = "";
    vm.CustomeEmail = "";
    vm.originalRows = [];
    vm.agGridStates = ["All"];
    vm.defaultGridState = {};
    vm.gridHeight = 50;
    vm.phones = [];
    vm.plans = [];
    vm.plansDes = [];
    vm.address = {};
    vm.showAlert = {};
    vm.isParentSelected = true;
    vm.SoftDelete = false;
    vm.parentNames = [];
    vm.selectedParent = null;
    vm.copyToClipboard = copyToClipboard
    vm.saveNewLinesToExistingCustomer = saveNewLinesToExistingCustomer;
    vm.saveClientAndLine = saveClientAndLine;
    vm.saveClientAndLineWithCharge = saveClientAndLineWithCharge;
    vm.addNewLineRow = addNewLineRow;
    vm.saveUserSettings = saveUserSettings;
    vm.exportToExcel = exportToExcel;
    vm.setSelectedParentName = setSelectedParentName;
    vm.selectParentItem = selectParentItem;
    vm.UpdateActiveStatus = UpdateActiveStatus;
    vm.OpenChargeHistory = OpenChargeHistory;
    vm.OpenTopup = OpenTopup;
    vm.OpenTopupHistory = OpenTopupHistory;
    vm.OpenWhatsApp = OpenWhatsApp;
    vm.refreshPhones = refreshPhones;
    vm.onQuickFilterChanged = onQuickFilterChanged;
    vm.clearFilter = clearFilter;
    vm.getAgGridState = getAgGridState;
    vm.saveState = saveState;
    vm.deleteState = deleteState;
    vm.updateState = updateState;
    vm.onlyActive = onlyActive;
    vm.addNewLinePopup = addNewLinePopup;

    const filterParamsNumber = {
      filterOptions: [
        {
          displayKey: 'largerThan',
          displayName: 'Larger than',
          test: function (filterValue, cellValue) {
            cellValue = cellValue.replace(" GB").replace("R$", "").replace("OFF", "");
            return parseInt(cellValue) > parseInt(filterValue);
          }
        },
        {
          displayKey: 'smallerThan',
          displayName: 'Smaller than',
          test: function (filterValue, cellValue) {
            cellValue = cellValue.replace(" GB").replace("R$", "").replace("OFF", "");
            return parseInt(cellValue) < parseInt(filterValue);
          }
        },
        'equals',
        'notEqual'
      ]
    };

    var filterDateParams = {
      comparator: function (filterLocalDateAtMidnight, cellValue) {
        var dateAsString = new Date(cellValue);
        if (dateAsString == null) return -1;

        if (dateAsString < filterLocalDateAtMidnight) {
          return -1;
        }

        if (dateAsString > filterLocalDateAtMidnight) {
          return 1;
        }
      },
      browserDatePicker: true,
      minValidYear: 2000,
      filterOptions: [
        'lessThan',
        {
          displayKey: 'lessThanWithNulls',
          displayName: 'Less Than with Nulls',
          predicate: ([filterValue], cellValue) => cellValue == null || cellValue < filterValue,
        },
        'greaterThan',
        {
          displayKey: 'greaterThanWithNulls',
          displayName: 'Greater Than with Nulls',
          predicate: ([filterValue], cellValue) => cellValue == null || cellValue > filterValue,
        },
        {
          displayKey: 'betweenExclusive',
          displayName: 'Between (Exclusive)',
          predicate: ([fv1, fv2], cellValue) => cellValue == null || fv1 < cellValue && fv2 > cellValue,
          numberOfInputs: 2,
        }
      ]
    };

    const customNumberComparator = (valueA, valueB) => {
      valueA = valueA ? valueA.toString() : "";
      valueB = valueB ? valueB.toString() : "";
      valueA = (valueA == null || valueA == "" || valueA == "OFF") ? "-1" : valueA.replace(" GB", "").replace(",", "").replace("R$", "");
      valueB = (valueB == null || valueB == "" || valueB == "OFF") ? "-1" : valueB.replace(" GB", "").replace(",", "").replace("R$", "");
      if (parseInt(valueA) == parseInt(valueB)) return 0;
      return (parseInt(valueA) > parseInt(valueB)) ? 1 : -1;
    };

    vm.gridOptions = {
      columnDefs: [
        { field: 'Id', hide: true },
        { field: 'Mode', hide: true },
        {
          field: 'TopUpHistory',
          headerName: 'Top Up Hst',
          width: 60,
          cellRenderer: function (params) {
            var cellHtml = '<a ng-click="vm.openTopupPopup(' + params.node.data.Contel + ')" ><img class="imgWhatsapp link" style="max-width:20px;margin:10px 5px" src="content/img/topup-history.png" /></a>';
            return cellHtml;
          },
          onCellClicked: function (params) {
            var showLoader = DialogFactory.showLoader("Aguarde enquanto buscamos o histórico de recarga.");
            FoneclubeService.getTopupHistory(params.node.data.Contel).then(function (result) {
              showLoader.close();
              if (result != null && result.Person != null) {
                ViewModelUtilsService.showModalPhoneTopUpHistoryTemplate(result);
              }
              else {
                alert('A linha selecionada não é um contel');
              }
            }, function (error) {
              showLoader.close();
              DialogFactory.showMessageDialog({ mensagem: 'Error occured: ' + error });
            });
          }
        },
        {
          field: 'TopUp',
          headerName: 'Top Up', width: 60,
          cellRenderer: function (params) {
            var cellHtml = '<a ng-click="vm.openTopupPopup(' + params.node.data.Contel + ')" ><img class="imgWhatsapp link" style="max-width:20px;margin:10px 5px" src="content/img/topup.png" /></a>';
            return cellHtml;
          },
          onCellClicked: function (params) {
            var showLoader = DialogFactory.showLoader("Aguarde enquanto buscamos as informações da linha.");
            FoneclubeService.getContelDetailByPhone(params.node.data.Contel).then(function (result) {
              showLoader.close();
              if (result != null) {
                var resultData = {
                  result: result,
                  plans: JSON.parse(sessionStorage.getItem('contelplans') == null ? null : sessionStorage.getItem('contelplans'))
                };
                ViewModelUtilsService.showModalPhoneTopUpTemplate(resultData);
              }
              else {
                alert('A linha selecionada não é um contel');
              }
            }, function (error) {
              showLoader.close();
              DialogFactory.showMessageDialog({ mensagem: 'Error occured: ' + error });
            });
          }
        },
        {
          field: 'ContelBlockStatus',
          headerName: 'Contel Status',
          width: 80,
          cellRenderer: function (params) {
            if (params.value == "A") {
              return '<a ng-click="vm.BlockUnlockLine(\'' + params.value + '\', ' + params.node.data.IdPerson + ', ' + params.node.id + ', \'' + params.node.data.Nome_FC + '\')" title="Ativa"  href="javascript:void(0);"><img class="imgUsd link" style="max-width:16px; alt="Ativa" margin-top:10px" src="content/img/phone-green.png" /></a>';
            } else if (params.value == "B") {
              return '<a ng-click="vm.BlockUnlockLine(\'' + params.value + '\', ' + params.node.data.IdPerson + ', ' + params.node.id + ',\'' + params.node.data.Nome_FC + '\')" title="Bloqueada"  style=""><img class="imgUsd link" style="max-width:16px; margin-top:10px" src="content/img/phone-red.png" /></a>';
            }
            else if (params.value == "C") {
              return '<a ng-click="vm.BlockUnlockLine(\'' + params.value + '\', ' + params.node.data.IdPerson + ', ' + params.node.id + ',\'' + params.node.data.Nome_FC + '\')" title="Cancelada"  style=""><img class="imgUsd link" style="max-width:16px; alt="Cancelada" margin-top:10px" src="content/img/phone-black.png" /></a>';
            }
            else {
              return '<div class="circle_red"><a ng-click="vm.BlockUnlockLine(\'' + params.value + '\', ' + params.node.data.IdPerson + ', \'' + params.node.data.Nome_FC + '\')" href="javascript:void(0);" title="Outras Operadoras" /></div>';
            }

          },
          onCellClicked: function (params) {
            if (params.node.data.ContelStatus != "CANCELADO") {
              BlockUnlockLine(params.value, params.node.data.IdPerson, params.node.id, params.node.data.Nome_FC, params.node.data.PhoneNumber);
            }
          }
        },
        {
          field: 'Contel', headerName: 'Contel', width: 150, cellEditor: NumericEditor,
          valueGetter: (params) => {
            var phone = UtilsService.clearPhoneNumber(params.data.Contel);
            var rowData = GetGridData();
            var filterRow = rowData.find(x => x.ActionId == params.node.data.ActionId);
            filterRow.Contel = phone;
            return phone != "" ? parseInt(phone) : "";
          },
          onCellValueChanged: (params) => {
            var rowData = GetGridData();
            var filterRow = rowData.find(x => x.ActionId == params.node.data.ActionId);
            filterRow.Contel = params.newValue;
            vm.gridOptions.api.updateRowData({ update: [filterRow] });
            vm.gridOptions.api.refreshCells({ columns: ["Contel"] });
            vm.gridOptions.api.stopEditing();
          },
          editable: true,
        },
        { field: 'Port', headerName: 'Portar', width: 150, editable: true, cellEditor: NumericEditor },
        {
          field: 'ICCID', headerName: 'ICCID', width: 180, editable: true, cellEditor: NumericEditor,
          onCellValueChanged: (params) => {
            if (params.newValue != undefined && params.newValue.length == 19) {
              FoneclubeService.validateICCID(params.newValue).then(function (data) {
                if (data != null) {
                  if (data.retorno) {
                    if (data.info != null) {
                      vm.currentPlan = data.info.plano_nome;
                      vm.Message = 1;
                    }
                  }
                  else {
                    vm.Message = 2;
                  }
                }
                else {
                  vm.Message = 4;
                }
              });
            }
            else {
              vm.Message = 3;
            }
          }
        },
        { field: 'NickName', headerName: 'Apelido', editable: true, width: 200 },
        {
          field: 'Active', headerName: 'Ativo', width: 80, editable: false, cellRenderer: function (params) {
            var cellHtml = '<a title="ff" ng-click="" ><img class="imgWhatsapp link" style="max-width:15px;margin:10px 5px" src="content/img/' + (params.value == "T" ? 'customeron.png' : 'customeroff.png') + '" /></a>';
            return cellHtml;
          },
        },
        {
          field: 'PrecoFC', headerName: 'Plano FC', editable: true, width: 150,
          cellRenderer: function (params) {
            return params.value;
          },
          cellEditor: 'agSelectCellEditor',
          cellEditorParams: {
            values: vm.plansDes
          },
          onCellValueChanged: (params) => {
            const delivery = vm.plans.find(x => x.Description == params.newValue);
            var rowData = GetGridData();
            var filterRow = rowData.find(x => x.ActionId == params.node.data.ActionId);
            filterRow.VIPPrice = 'R$' + (delivery.Value / 100).toFixed(2);
            filterRow.FCPrice = 'R$' + (delivery.Value / 100).toFixed(2);
            vm.gridOptions.api.updateRowData({ update: [filterRow] });
            //vm.gridOptions.api.setRowData(rowData);
            vm.gridOptions.api.refreshCells({ columns: ["VIPPrice"] });
            vm.gridOptions.api.refreshCells({ columns: ["FCPrice"] });
            var activeRows = rowData.filter(x => x.Active == "T");
            vm.PrecoFCSum = "R$" + (activeRows.reduce((a, { FCPrice }) => a + parseInt(FCPrice.replace('R$', '').replace('.', '')), 0) / 100).toFixed(2);
            vm.PrecoVIPum = "R$" + (activeRows.reduce((a, { VIPPrice }) => a + parseInt(VIPPrice.replace('R$', '').replace('.', '')), 0) / 100).toFixed(2);
            vm.gridOptions.api.stopEditing();
          }
        },
        {
          field: 'FCPrice', headerName: 'R$ FC', width: 80, editable: true,
          onCellValueChanged: (params) => {
            var rowData = GetGridData();
            var filterRow = rowData.find(x => x.ActionId == params.node.data.ActionId);
            filterRow.FCPrice = params.newValue;
            vm.gridOptions.api.setRowData(rowData);
            vm.gridOptions.api.refreshCells({ columns: ["FCPrice"] });
            var activeRows = rowData.filter(x => x.Active == "T");
            vm.PrecoFCSum = "R$" + (activeRows.reduce((a, { FCPrice }) => a + parseInt(FCPrice.replace('R$', '').replace('.', '')), 0) / 100).toFixed(2);
          },
        },
        {
          field: 'VIPPrice', headerName: 'R$ VIP', width: 80, editable: true,
          onCellValueChanged: (params) => {
            var rowData = GetGridData();
            var filterRow = rowData.find(x => x.ActionId == params.node.data.ActionId);
            filterRow.VIPPrice = params.newValue;
            vm.gridOptions.api.setRowData(rowData);
            vm.gridOptions.api.refreshCells({ columns: ["VIPPrice"] });
            var activeRows = rowData.filter(x => x.Active == "T");
            vm.PrecoVIPum = "R$" + (activeRows.reduce((a, { VIPPrice }) => a + parseInt(VIPPrice.replace('R$', '').replace('.', '')), 0) / 100).toFixed(2);
          }
        },
        {
          field: 'ESim', headerName: 'eSim', width: 70, editable: true,
          editable: function (params) {
            return params.data.Mode == "Add" ? true : false;
          },
          cellEditor: 'agSelectCellEditor',
          cellEditorParams: {
            values: ['SIM', 'NÃO']
          },
          cellRenderer: function (params) {
            var cellHtml = '<a title="ff" ng-click="" ><img class="imgWhatsapp link" style="max-width:15px;margin:10px 5px" src="content/img/' + (params.value == true ? 'customeron.png' : 'customeroff.png') + '" /></a>';
            return cellHtml;
          }
        },
        {
          field: 'Plano_Contel', headerName: 'P. Contel', width: 100, filterParams: filterParamsNumber,
          comparator: customNumberComparator
        },
        {
          field: 'Saldo', headerName: 'Saldo GB', width: 80,
          filterParams: filterParamsNumber,
          cellRenderer: function (params) {
            if (params.value != null) {
              return params.value == null ? "" : params.value.replace(" GB", "");
            }
          },
          comparator: customNumberComparator
        },
        {
          field: 'FimPlano', headerName: 'Fim Plano', width: 80, filter: 'agDateColumnFilter',
          filterParams: filterDateParams,
          comparator: DateComparator
        },
        {
          field: 'Cancelation_Date',
          headerName: 'Perde Numero',
          width: 100,
          filter: 'agDateColumnFilter',
          filterParams: filterDateParams,
          comparator: DateComparator,
          cellStyle: function (params) {
            var dataAtual = new Date();
            var dataFimPlano = new Date(params.value);
            var diffEmDias = Math.floor((dataFimPlano - dataAtual) / (1000 * 60 * 60 * 24));

            if (diffEmDias <= 10 && diffEmDias >= 0) {
              return { 'font-weight': 'bold', 'color': 'red' };
            }
            return null;
          },
        },
        {
          field: 'Ativacao',
          headerName: 'Ativação',
          width: 100,
          filter: 'agDateColumnFilter',
          filterParams: filterDateParams,
          comparator: DateComparator,
          cellRenderer: function (params) {
            // Verifica se a data está disponível
            if (params.value) {
              // Converte a data para o formato desejado
              const dataFormatada = convertDate(params.value);

              // Retorna a data formatada
              return dataFormatada;
            }
            return params.value; // Retorna o valor original se não houver data
          },
        },
        {
          field: 'InicioPlano',
          headerName: 'Plano Inicio',
          width: 100,
          filter: 'agDateColumnFilter',
          filterParams: filterDateParams,
          comparator: DateComparator
        },
        {
          field: 'AutoRec',
          headerName: 'Auto-Rec',
          width: 100,
          filter: 'agDateColumnFilter',
          filterParams: filterDateParams,
          comparator: DateComparator
        },
        {
          field: 'ValorPago', width: 80, headerName: '$ Cob. Contel', filterParams: filterParamsNumber,
          comparator: customNumberComparator
        },
        {
          field: 'RecAutFCFlag',
          headerName: 'Rec. FC',
          width: 100,
          cellRenderer: function (params) {
            if (params.value != null) {
              var cellHtml = '<a ng-click="" ><img class="imgWhatsapp link" style="max-width:15px;margin:10px" src="content/img/' + (params.value == false ? 'customeroff.png' : 'customeron.png') + '" /></a>';
              return cellHtml;
            }
          },
        },
        {
          field: 'RecAutFC',
          headerName: 'Rec.Aut.FC',
          width: 100,
          filter: 'agDateColumnFilter',
          filterParams: filterDateParams,
          comparator: DateComparator
        },

        {
          field: 'ContelStatus',
          headerName: 'Status',
          width: 100,
        },
        ,
        {
          field: 'PortIn',
          headerName: 'Port In',
          width: 100,
        },
        {
          field: 'Bloqueada',
          headerName: 'Bloq.',
          width: 100,
        },
        {
          field: 'UltPagDias',
          headerName: 'Ult. $',
          width: 100, filterParams: filterParamsNumber, comparator: customNumberComparator
        },
        {
          field: 'DaysSinceLastTopup',
          headerName: 'Dias ult. Rec.',
          width: 100, filterParams: filterParamsNumber, comparator: customNumberComparator
        },
        {
          field: 'LastPaidAmount',
          headerName: 'Ult. Pago $',
          width: 100, filterParams: filterParamsNumber, comparator: customNumberComparator
        },
        {
          field: 'StatusCob',
          headerName: 'Status $',
          width: 100,
        },
        { field: 'Propriedade', headerName: 'Dono', width: 120 },
        { field: 'CPF_FC', headerName: 'CPF FC', width: 120 },
        { field: 'CPF_DR', headerName: 'CPF Dr', width: 120 },
        { field: 'DocContel', headerName: 'Doc Contel', width: 120 },
        { field: 'Nome_DR', headerName: 'Nome Dr', width: 150 },
        { field: 'LinhaSemUso', width: 120, headerName: 'Sem Uso' },
        { field: 'Linha_DR', width: 120 },
        { field: 'Total_DR', headerName: 'Total Dr', width: 80, filterParams: filterParamsNumber, comparator: customNumberComparator },
        { field: 'PrecoUnico', headerName: '$ Unico', width: 80 },
        { field: 'Total_FC', headerName: 'Total FC', width: 80, filterParams: filterParamsNumber },
        { field: 'VIPSum', width: 80, headerName: 'VIP Sum', filterParams: filterParamsNumber, comparator: customNumberComparator },
        { field: 'FCSum', width: 80, headerName: '$ FC Sum', filterParams: filterParamsNumber, comparator: customNumberComparator },
        { field: 'Plugin_DR', headerName: 'Plano Dr', width: 150 },
        { field: 'Plano_DR', width: 150 },
        { field: 'Roaming', width: 80 },
        { field: 'PlanoContel', headerName: 'P. Contel', width: 150, editable: false },
        { field: 'FimPlano', headerName: 'Fim Plano', width: 150, editable: false },
        {
          field: 'AutoContel', headerName: 'Auto Contel', width: 80,
          cellRenderer: function (params) {
            if (params.value != null) {
              var cellHtml = '<a ng-click="" ><img class="imgWhatsapp link" style="max-width:15px;" src="content/img/' + (params.value == false ? 'customeroff.png' : 'customeron.png') + '" /></a>';
              return cellHtml;
            }
          },
        },
        { field: 'AutoRecFC', headerName: 'Auto Rec FC', width: 150, editable: false },
        { field: 'ContelStatus', headerName: 'Contel Status', width: 150, editable: false },
        { field: 'Cancela', headerName: 'Perde Numero', width: 150, editable: false },
        {
          field: 'Action', width: 50, editable: false, cellRenderer: function (params) {
            if (params.data.Delete) {
              return '<a title="ff"><img class="imgWhatsapp link" style="max-width:18px;margin:5px 2px" src="content/img/undelete.png" /></a>';
            }
            else {
              return '<a title="ff"><img class="imgWhatsapp link" style="max-width:15px;margin:10px 5px" src="content/img/Cancel.png" /></a>';
            }
          },
          suppressMenu: true,
          floatingFilter: false,
        }
      ],
      defaultColDef: {
        //flex: 1,
        sortable: true,
        filter: true,
        enableFilter: true,
        //floatingFilter: true,
        resizable: true,
        editable: false,
      },
      editType: 'fullRow',
      //stopEditingWhenGridLosesFocus: true,
      enableCellTextSelection: true,
      autoSizeColumns: true,
      rowHeight: 30,
      headerHeight: 75,
      onGridReady: function (params) {
        LoadUserLines();
      },
      //rowData: [],
      //rowData: LoadUserLines(),
      onFilterChanged: function () {
        vm.resultText = vm.gridOptions.api.getDisplayedRowCount() + " of " + vm.PhoneLines.length + " items";
      },
      onRowValueChanged: onRowValueChanged,
      onCellClicked: onCellClicked,
      getRowStyle: function (params) {
        if (params.data.Mode === "Delete") {
          return { 'background-color': '#FFCCCB' }
        }
        if (params.data.Delete) {
          return { 'background-color': '#FFCCCB' }
        }
        return null;
      }
    }

    init();


    function onlyActive() {

      const filterCheckbox = document.getElementById('filterCheckboxModal');

      if (!filterCheckbox.checked) {
        vm.gridOptions.api.setRowData(vm.originalRows);
        vm.resultText = vm.gridOptions.api.getDisplayedRowCount() + " of " + vm.PhoneLines.length + " items";

        return;
      }


      const phoneLinesAtivas = vm.originalRows.filter((phone) => phone.Active === 'T');

      vm.gridOptions.api.setRowData(phoneLinesAtivas);

      vm.resultText = vm.gridOptions.api.getDisplayedRowCount() + " of " + vm.PhoneLines.length + " items";

    }

    function convertDate(dataString) {
      // Mapeamento de abreviações de meses para números
      const months = {
        Jan: '01', Feb: '02', Mar: '03',
        Apr: '04', May: '05', Jun: '06',
        Jul: '07', Aug: '08', Sep: '09',
        Oct: '10', Nov: '11', Dec: '12'
      };

      // Quebrar a string em partes (dia, mês, ano)
      const partes = dataString.split(' ');

      // Obter o ano, mês e dia
      const year = partes[2];
      const month = months[partes[1]];
      const day = partes[0];

      // Formar a data no formato "aaaa-mm-dd hh:mm"
      const finalDate = `${year}-${month}-${day} 00:00`;

      return finalDate;
    }


    function init() {
      vm.showAlert = DialogFactory.showLoader("Aguarde enquanto obtemos os detalhes da linha do cliente");
      vm.Use2Prices = vm.ParentData.Use2Prices;
      vm.IsVIP = vm.ParentData.IsVIP;
      vm.Referral = vm.ParentData.Referral;
      vm.CustomeName = vm.ParentData.Nome;
      vm.CpfType = vm.ParentData.CPF.length == 11 ? 0 : 1;
      vm.CustomeCPF = vm.ParentData.CPF;
      vm.CustomeEmail = vm.ParentData.Email;
      vm.SoftDelete = vm.ParentData.SoftDelete;
      vm.ParentNome = vm.ParentData.Parent != null ? vm.ParentData.Parent.Name : "";

      for (var i in vm.ParentData.Phones) {
        if (vm.ParentData.Phones[i].IsFoneclube != true) {
          vm.CustomerPhone = vm.ParentData.Phones[i].DDD + vm.ParentData.Phones[i].Number;
        }
      }

      FoneclubeService.getAgGridStates("CustomerDetail").then(function (result) {
        if (result != null)
          vm.agGridStates = result;
        var default1 = result.find(x => x.IsDefault == true);
        if (default1) {
          vm.defaultGridState = default1;

        }
      });

      FoneclubeService.getPlansById(4).then(function (result) {
        var rss = result.filter(x => x.IdOperator != 1).sort((a, b) => (a.IdOperator > b.IdOperator) ? -1 : ((b.IdOperator > a.IdOperator) ? 1 : 0));
        vm.plans = rss;
        onlyActive()

        var plans = rss.map(x => x.Description);
        plans.forEach(element => {
          vm.plansDes.push(element);
        });
      });
      FoneclubeService.getContelPlans().then(function (result) {
        sessionStorage.setItem('contelplans', JSON.stringify(result));
      });
      FoneclubeService.getAllCustomersMinimal().then(function (result) {
        vm.parentNames = result;
      });

    }

    function selectParentItem(val) {
      vm.isParentSelected = val;
    }

    function setSelectedParentName(item) {
      console.log(item);
      vm.isParentSelected = true;
      vm.selectedParent = item;
      vm.ParentCPF = item.DocumentNumber;
      vm.ParentNome = item.Name;
      vm.ParentWhatsAppNumber = item.Telefone;
    }

    function OpenChargeHistory() {
      vm.showAlert = DialogFactory.showLoader("Por favor, aguarde...");
      FoneclubeService.getCustomerByCPF(vm.CustomeCPF).then(function (result) {
        vm.showAlert.close();
        ViewModelUtilsService.showModalCustomer(result);
      });
    }

    function OpenWhatsApp(cpf) {
      vm.showAlert = DialogFactory.showLoader("Por favor, aguarde...");
      FoneclubeService.getCustomerByCPF(vm.CustomeCPF).then(function (result) {
        vm.showAlert.close();
        ViewModelUtilsService.showModalReport(result);
      });
    }

    function refreshPhones() {
      vm.showAlert = DialogFactory.showLoader("Aguarde enquanto obtemos os detalhes da linha mais recente");
      LoadUserLines();
    }

    function onQuickFilterChanged() {
      var filterText = vm.filterText.replace("(", "").replace(")", "").replaceAll(" ", "").replace("-", "");
      vm.filterText = isNaN(filterText) ? vm.filterText : filterText;
      vm.gridOptions.api.setQuickFilter(vm.filterText);
      vm.resultText = vm.gridOptions.api.getDisplayedRowCount() + " of " + vm.PhoneLines.length + " items";
    }

    function clearFilter() {
      vm.filterText = "";
      vm.gridOptions.api.setQuickFilter(null);
    }

    function OpenTopup(phone) {
      var showLoader = DialogFactory.showLoader("Aguarde enquanto buscamos as informações da linha.");
      FoneclubeService.getContelDetailByPhone(phone).then(function (result) {
        showLoader.close();
        if (result != null) {
          var resultData = {
            result: result,
            plans: JSON.parse(sessionStorage.getItem('contelplans') == null ? null : sessionStorage.getItem('contelplans'))
          };
          ViewModelUtilsService.showModalPhoneTopUpTemplate(resultData);
        }
        else {
          alert('Selected line is not available in Contel');
        }
      }, function (error) {
        showLoader.close();
        DialogFactory.showMessageDialog({ mensagem: 'Error occured: ' + error });
      });
    }

    function OpenTopupHistory(phone) {
      var showLoader = DialogFactory.showLoader("Aguarde enquanto buscamos o histórico de recarga.");
      FoneclubeService.getTopupHistory(phone).then(function (result) {
        showLoader.close();
        if (result != null && result.Person != null) {
          ViewModelUtilsService.showModalPhoneTopUpHistoryTemplate(result);
        }
        else {
          alert('Information not available');
        }
      }, function (error) {
        showLoader.close();
        DialogFactory.showMessageDialog({ mensagem: 'Error occured: ' + error });
      });
    }

    function LoadUserLines() {
      FoneclubeService.getCustomerPhonesByCPF(vm.ParentData.CPF).then(function (result) {
        if (result != null) {
          //result.Phones = result.Phones.filter(x=>x.Delete == null || x.Delete == false);
          var phones = result.sort(function (x, y) {
            return (x.Ativa === y.Ativa) ? 0 : x.Ativa ? -1 : 1;
          }).sort(function (x, y) {
            return (x.Delete === y.Delete) ? 0 : x.Delete ? 1 : -1;
          });
          vm.PhoneLines = phones;
          convertToViewModelOriginal(phones);
          bindAgGrid(phones);
          getAgGridState();
          vm.resultText = phones.length + " of " + phones.length + " items";
        }
        vm.showAlert.close();
      }, function (error) {
        vm.showAlert.close();
      });
    }

    function bindAgGrid(data) {
      var rowData = convertToViewModel(data);
      if (vm.gridOptions.api) {
        vm.gridOptions.api.setRowData(rowData);
      }
    }

    function convertToViewModelOriginal(data) {
      var templateDataList = [];
      if (data != null) {
        for (var i = 0; i < data.length; i++) {
          var datamodel = data[i];
          templateDataList.push({
            'ActionId': datamodel.Id.toString(),
            'Id': datamodel.Id,
            'Contel': datamodel.PhoneNumber,
            'Port': datamodel.PortNumber,
            'ICCID': datamodel.ICCID,
            'Active': datamodel.Ativa,
            'PrecoFC': datamodel.Plano_FC,
            'VIPPrice': datamodel.PrecoVIP,
            'FCPrice': datamodel.Preco_FC,
            'NickName': datamodel.Apelido,
            'Esim': datamodel.Esim == "SIM" ? true : false,
            'Plano_Contel': datamodel.Plano_Contel,
            'FimPlano': datamodel.FimPlano,
            'AutoContel': datamodel.Recarga_Automatica,
            'Ativacao': datamodel.Ativacao,
            'AutoRecFC': datamodel.RecAutFC,
            'ContelStatus': datamodel.ContelStatus,
            'Cancelation_Date': datamodel.Cancelation_Date,
            'Delete': datamodel.Delete,
            'ContelBlockStatus': datamodel.ContelBlockStatus,
            'PortIn': datamodel.PortIn,
            'Bloqueada': datamodel.Bloqueada,
            'Saldo': datamodel.Saldo,
            'InicioPlano': datamodel.InicioPlano,
            'AutoRec': datamodel.AutoRec,
            'ValorPago': datamodel.ValorPago,
            'RecAutFCFlag': datamodel.RecAutFCFlag,
            'RecAutFC': datamodel.RecAutFC,
            'UltPagDias': datamodel.UltPagDias,
            'DaysSinceLastTopup': datamodel.DaysSinceLastTopup,
            'LastPaidAmount': datamodel.LastPaidAmount,
            'StatusCob': datamodel.StatusCob,
            'Propriedade': datamodel.Propriedade,
            'CPF_FC': datamodel.CPF_FC,
            'CPF_DR': datamodel.CPF_DR,
            'DocContel': datamodel.DocContel,
            'Nome_DR': datamodel.Nome_DR,
            'LinhaSemUso': datamodel.LinhaSemUso,
            'Linha_DR': datamodel.Linha_DR,
            'Total_DR': datamodel.Total_DR,
            'PrecoUnico': datamodel.PrecoUnico,
            'VIPSum': datamodel.VIPSum,
            'FCSum': datamodel.FCSum,
            'Plugin_DR': datamodel.Plugin_DR,
            'Plano_DR': datamodel.Plano_DR,
            'Roaming': datamodel.Roaming,
            'Mode': 'Update',
            'Edited': 0,
            'Action': ''
          });
          // templateDataList.push({
          //     'ActionId': datamodel.Id.toString(),
          //     'Id': datamodel.Id,
          //     'Contel': datamodel.DDD + "" + datamodel.Number,
          //     'Port': datamodel.PortNumber,
          //     'ICCID': datamodel.ICCID,
          //     'Active': datamodel.LinhaAtiva,
          //     'PrecoFC': vm.plans.find(x=>x.Id == datamodel.IdPlanOption) == undefined ? "" : vm.plans.find(x=>x.Id == datamodel.IdPlanOption).Description,
          //     'VIPPrice': datamodel.AmmountPrecoVip ? datamodel.AmmountPrecoVip : 0,
          //     'FCPrice': datamodel.OperatorChargedPrice ? datamodel.OperatorChargedPrice : 0,
          //     'NickName': datamodel.NickName,
          //     'Esim': datamodel.Esim == "SIM" ? true : false,
          //     'PlanoContel': datamodel.Plano_Contel,
          //     'FimPlano': datamodel.FimPlano,
          //     'AutoContel': datamodel.Recarga_Automatica,
          //     'AutoRecFC': datamodel.RecAutFC,
          //     'ContelStatus': datamodel.ContelStatus,
          //     'Cancela': datamodel.Cancela,
          //     'Delete' : datamodel.Delete,
          //     'Mode': 'Update',
          //     'Edited': 0,
          //     'Action':''
          // });
        }
      }
      vm.originalRows = templateDataList;

      var activeRows = templateDataList.filter(x => x.Active == "T");
      vm.PrecoFCSum = "R$" + (activeRows.reduce((a, { FCPrice }) => a + parseInt(FCPrice.replace('R$', '').replace('.', '')), 0) / 100).toFixed(2);
      vm.PrecoVIPum = "R$" + (activeRows.reduce((a, { VIPPrice }) => a + parseInt(VIPPrice.replace('R$', '').replace('.', '')), 0) / 100).toFixed(2);
    }

    function convertToViewModel(data) {
      var templateDataList = [];
      if (data != null) {
        for (var i = 0; i < data.length; i++) {
          var datamodel = data[i];
          templateDataList.push({
            'ActionId': datamodel.Id.toString(),
            'Id': datamodel.Id,
            'Contel': datamodel.PhoneNumber,
            'Port': datamodel.PortNumber,
            'ICCID': datamodel.ICCID,
            'Active': datamodel.Ativa,
            'PrecoFC': datamodel.Plano_FC,
            'VIPPrice': datamodel.PrecoVIP,
            'FCPrice': datamodel.Preco_FC,
            'NickName': datamodel.Apelido,
            'Esim': datamodel.Esim == "SIM" ? true : false,
            'Plano_Contel': datamodel.Plano_Contel,
            'FimPlano': datamodel.FimPlano,
            'InicioPlano': datamodel.InicioPlano,
            'AutoContel': datamodel.Recarga_Automatica,
            'AutoRecFC': datamodel.RecAutFC,
            'ContelStatus': datamodel.ContelStatus,
            'Cancelation_Date': datamodel.Cancelation_Date,
            'Ativacao': datamodel.Ativacao,
            'Delete': datamodel.Delete,
            'Saldo': datamodel.Saldo,
            'AutoRec': datamodel.AutoRec,
            'ValorPago': datamodel.ValorPago,
            'RecAutFCFlag': datamodel.RecAutFCFlag,
            'RecAutFC': datamodel.RecAutFC,
            'ContelBlockStatus': datamodel.ContelBlockStatus,
            'PortIn': datamodel.PortIn,
            'Bloqueada': datamodel.Bloqueada,
            'UltPagDias': datamodel.UltPagDias,
            'DaysSinceLastTopup': datamodel.DaysSinceLastTopup,
            'LastPaidAmount': datamodel.LastPaidAmount,
            'StatusCob': datamodel.StatusCob,
            'Propriedade': datamodel.Propriedade,
            'CPF_FC': datamodel.CPF_FC,
            'CPF_DR': datamodel.CPF_DR,
            'DocContel': datamodel.DocContel,
            'Nome_DR': datamodel.Nome_DR,
            'LinhaSemUso': datamodel.LinhaSemUso,
            'Linha_DR': datamodel.Linha_DR,
            'Total_DR': datamodel.Total_DR,
            'PrecoUnico': datamodel.PrecoUnico,
            'VIPSum': datamodel.VIPSum,
            'FCSum': datamodel.FCSum,
            'Plugin_DR': datamodel.Plugin_DR,
            'Plano_DR': datamodel.Plano_DR,
            'Roaming': datamodel.Roaming,
            'Mode': 'Update',
            'Edited': 0,
            'Action': ''
          });
        }
      }
      return templateDataList;
    }

    function addNewLinePopup()
    {
      var data = {
          Plans: vm.plans,
          Client: vm.ParentData,
      };
      ViewModelUtilsService.showInstaAddNewLinePopup(data);
    }


    function addNewLineRow() {
      if (vm.gridOptions.api) {
        var rowData = GetGridData();
        var datt = {
            'ActionId': rowData.length + 1,
            'Id': -1,
            'Contel': "",
            'Port': "",
            'ICCID': "",
            'Active': "T",
            'PrecoFC': "",
            'VIPPrice': "",
            'FCPrice': "",
            'NickName':"",
            'Esim': false,
            'Plano_Contel': "",
            'FimPlano': "",
            'InicioPlano': "",
            'AutoContel':"",
            'AutoRecFC': "",
            'ContelStatus': "",
            'Cancelation_Date': "",
            'Ativacao': "",
            'Saldo': "",
            'AutoRec': "",
            'ValorPago': "",
            'RecAutFCFlag': "",
            'RecAutFC': "",
            'ContelBlockStatus': "",
            'PortIn': "",
            'Bloqueada': "",
            'UltPagDias': "",
            'DaysSinceLastTopup': "",
            'LastPaidAmount': "",
            'StatusCob': "",
            'Propriedade': "",
            'CPF_FC': "",
            'CPF_DR': "",
            'DocContel': "",
            'Nome_DR': "",
            'LinhaSemUso':"",
            'Linha_DR': "",
            'Total_DR': "",
            'PrecoUnico': "",
            'VIPSum': "",
            'FCSum': "",
            'Plugin_DR': "",
            'Plano_DR': "",
            'Roaming': "F",
            'Mode': 'Add',
            'Delete': false,
            'Edited': 0,
            'Action': ''
          };
        const newItems = [datt];
        vm.gridOptions.api.setFilterModel(null);
        vm.gridOptions.api.applyTransaction({
          add: newItems,
          addIndex: rowData.length
        });
        
        setTimeout(function () {
          var firstEditableColumn = 'Contel' || vm.gridOptions.columnDefs[2].field;
          vm.gridOptions.api.startEditingCell({
            rowIndex: rowData.length,
            colKey: firstEditableColumn
          });
        }, 100);
      }
    }

    function copyToClipboard() {
      var valor = document.querySelector('button[data-valor]').getAttribute('data-valor');
      var copyText = document.createElement('textarea');
      copyText.value = valor;
      document.body.appendChild(copyText);
      copyText.select();
      document.execCommand('copy');
      document.body.removeChild(copyText);
      alert('Link copiado para a área de transferência!');
    };


    function DateComparator(valueA, valueB) {
      var defDate = new Date(1900, 1, 1);
      valueA = valueA == "" ? defDate : new Date(valueA);
      valueB = valueB == "" ? defDate : new Date(valueB);
      if (valueA == valueB) return 0;
      return (valueA > valueB) ? 1 : -1;
    }

    function onCellClicked(event) {
      var rowData = GetGridData();
      if (event.column.getColId() == 'Action') {
        if (event.data.Delete) {
          ViewModelUtilsService.showConfirmDialog('Atenção!', "Tem certeza de que deseja recuperar a linha - " + event.data.Contel).then(function (confirm) {
            if (confirm) {
              var data = {
                Id: event.data.Id,
                Delete: false
              };
              FoneclubeService.softDeleteLine(data).then(function (result) {
                if (result) {
                  DialogFactory.showMessageDialog({ titulo: 'Sucesso', mensagem: "Linha " + event.dataContel + " incluída com sucesso" });
                  LoadUserLines();
                }
              });
            }
          });
        }
        else {
          ViewModelUtilsService.showConfirmDialog('Atenção!', "Tem certeza que deseja excluir a linha - " + event.data.Contel).then(function (confirm) {
            if (confirm) {
              if (vm.gridOptions.api) {
                if (event.data.Mode == "Update") {
                  var filterRow = rowData.find(x => x.ActionId == event.data.ActionId);
                  filterRow.Mode = "Delete";

                  var data = {
                    Id: event.data.Id,
                    Delete: true
                  };
                  FoneclubeService.softDeleteLine(data).then(function (result) {
                    if (result) {
                      DialogFactory.showMessageDialog({ titulo: 'Sucesso', mensagem: "Linha " + event.data.Contel + " excluída com sucesso" });
                      LoadUserLines();
                    }
                  });
                }
                else {
                  var filterRow = rowData.filter(x => x.ActionId != event.data.ActionId);
                  vm.gridOptions.api.setRowData(filterRow);
                }
              }
            }
          });
        }
      }
      else if (event.column.getColId() == 'Active') {
        var filterRow = rowData.find(x => x.ActionId == event.data.ActionId);
        filterRow.Active = event.data.Active == "T" ? "F" : "T";
        vm.gridOptions.api.setRowData(rowData);
        vm.gridOptions.api.refreshCells({ columns: ["Active"] });

        var planId = 0;
        if (vm.plans.find(x => x.Description == filterRow.PrecoFC + ' - Contel') == undefined) {
          planId = vm.plans.find(x => x.Description == filterRow.PrecoFC).Id;
        }
        else {
          planId = vm.plans.find(x => x.Description == filterRow.PrecoFC + ' - Contel').Id;
        }

        var data = {
          Id: filterRow.Id,
          DDD: filterRow.Contel.substr(0, 2),
          Number: filterRow.Contel.substr(2),
          PortNumber: filterRow.Port,
          LinhaAtiva: filterRow.Active == "T" ? true : false,
          NickName: filterRow.NickName,
          ICCID: filterRow.ICCID,
          IdPlanOption: planId,
          AmmountPrecoVip: parseInt(filterRow.VIPPrice.replace("R$", "").replace(".", ""))
        };
        FoneclubeService.updateInstaEditClientLine(data).then(function (result) {
          var activeRows = rowData.filter(x => x.Active == "T");
          vm.PrecoFCSum = "R$" + (activeRows.reduce((a, { FCPrice }) => a + parseInt(FCPrice.replace('R$', '').replace('.', '')), 0) / 100).toFixed(2);
          vm.PrecoVIPum = "R$" + (activeRows.reduce((a, { VIPPrice }) => a + parseInt(VIPPrice.replace('R$', '').replace('.', '')), 0) / 100).toFixed(2);


          //DialogFactory.showMessageDialog({ titulo: 'Sucesso', mensagem: "Linha editada atualizada com sucesso" });
        });
      } else if (event.column.getColId() == "Saldo") {
        var showLoader = DialogFactory.showLoader(
          "Aguarde enquanto obtém o saldo mais recente"
        );
        FoneclubeService.getContelDetailBySaldoPhone(
          event.data.Contel
        ).then(
          function (result) {
            showLoader.close();
            if (result != null && result.data != null) {
              var saldo = parseFloat(
                result.data.restante_dados / 1024
              ).toFixed(2);
              const itemsToUpdate = [];
              let rowData = [];
              vm.gridOptions.api.forEachNodeAfterFilterAndSort(function (
                rowNode,
                index
              ) {
                if (rowNode.data.Id == event.data.Id) {
                  rowNode.data.Saldo = saldo;
                  rowNode.setSelected(true);
                  vm.gridOptions.api.refreshCells({ columns: ["Saldo"] });
                  vm.gridOptions.api.ensureIndexVisible(index, "middle");
                }
              });

            }
          },
          function (error) {
            showLoader.close();
          }
        );
      }
    }

    function GetGridData() {
      let rowData = [];
      vm.gridOptions.api.forEachNode(node => rowData.push(node.data));
      return rowData;
    }

    const objectsEqual = (o1, o2) =>
      typeof o1 === 'object' && o1 != null && Object.keys(o1).length > 0
        ? Object.keys(o1).length === Object.keys(o2).length
        && Object.keys(o1).every(p => objectsEqual(o1[p], o2[p]))
        : o1 === o2;

    function onRowValueChanged(event) {
      var rowData = GetGridData();
      var filterRow = vm.originalRows.find(x => x.ActionId == event.data.ActionId);
      var isEdited = objectsEqual(filterRow, event.node.data);
      if (!isEdited) {
        if (vm.gridOptions.api) {
          if (event.data.Mode == "Update") {
            var valid = ValidatePhoneNumbers(event.data);
            if (valid) {
              var filterRow = rowData.find(x => x.ActionId == event.data.ActionId);
              filterRow.Edited = 1;
              vm.gridOptions.api.setRowData(rowData);
              vm.gridOptions.api.refreshCells({ columns: ["Edited"] });

              var data = {
                Id: event.data.Id,
                DDD: event.data.Contel.substr(0, 2),
                Number: event.data.Contel.substr(2),
                PortNumber: event.data.Port,
                LinhaAtiva: event.data.Active == "T" ? true : false,
                NickName: event.data.NickName,
                ICCID: event.data.ICCID,
                IdPlanOption: vm.plans.find(x => x.Description == event.data.PrecoFC).Id,
                AmmountPrecoVip: parseInt(event.data.VIPPrice.replace("R$", "").replace(".", ""))
              };
              FoneclubeService.updateInstaEditClientLine(data).then(function (result) {
                if (result) {
                  DialogFactory.showMessageDialog({ titulo: 'Sucesso', mensagem: "Linha editada atualizada com sucesso" });
                }
              });
            }
            else {
              vm.Message = valid;
            }
          }
          else {
            var valid = ValidatePhoneNumbers(event.data);
            if (valid) {
              vm.gridOptions.api.setRowData(rowData);
            }
            else {
              vm.Message = valid;
            }
          }
        }
      }
    }

    function exportToExcel() {
      var params = {
        skipHeader: false,
        skipFooters: true,
        skipGroups: true,
        fileName: vm.ParentData.Nome + ".csv"
      };
      var csvContent = vm.gridOptions.api.getDataAsCsv(params);
      let hiddenElement = document.createElement("a");
      let csvData = new Blob([csvContent], { type: "text/csv" });
      let csvUrl = URL.createObjectURL(csvData);
      hiddenElement.href = csvUrl;
      hiddenElement.target = "_blank";
      hiddenElement.download = vm.ParentData.Nome + ".csv";
      hiddenElement.click();
    }

    function BlockUnlockLine(value, custId, nodeId, custName, linha) {
      if (value == "A") {
        DialogFactory.dialogConfirm({ titulo: 'Bloqueio de linhas', mensagem: '<span>Deseja bloquear <strong>TODAS</strong> as linhas do Cliente ou apenas a linha selecionada' + custName + '</span>', btn1: 'TODAS', btn2: 'Selecionado' }).then(function (result) {
          if (result == 0) {
            DialogFactory.dialogConfirm({ titulo: 'Bloqueio de linhas', mensagem: '<span>Deseja bloquear <strong>TODAS</strong> as linhas do ' + custName + '</span>', btn1: 'SIM', btn2: 'Temporariamente' }).then(function (result) {
              if (!result) {
                DialogFactory.dialogConfirm({ titulo: 'Bloqueio de linhas', mensagem: 'Tem Certeza', btn1: 'SIM', btn2: 'NÃO' }).then(function (result) {
                  var showLoader = DialogFactory.showLoader("Um momento estamos bloqueando as linhas.");
                  if (!result) {
                    var data = {
                      PersonId: custId
                    }
                    FoneclubeService.permanentBlockLineForCustomer(data).then(function (result) {
                      if (result != null) {
                        showLoader.close();
                        var resDisplay = "";
                        for (var ir = 0; ir < result.length; ir++) {
                          resDisplay += "Linha: " + result[ir].Linha + " Status: " + result[ir].BlockLineResponse.mensagem + "<br/>";
                        }
                        DialogFactory.showMessageDialog({ mensagem: 'Success:' + resDisplay });

                      }
                      else {
                        DialogFactory.showMessageDialog({ mensagem: 'Error occured: ' + result });
                      }
                    }, function (error) {
                      showLoader.close();
                      DialogFactory.showMessageDialog({ mensagem: 'Error occured: ' + error });
                    });
                  }
                  else
                    showLoader.close();
                });
              }
            });
          }
          else {
            var showLoader = DialogFactory.showLoader("Um momento estamos bloqueando as linhas.");
            var data = { numero: linha };
            FoneclubeService.permanentBlockLine(data).then(function (result) {
              if (result != null) {
                showLoader.close();
                var resDisplay = "Linha: " + linha + " Status: " + result.mensagem + "<br/>";
                DialogFactory.showMessageDialog({ mensagem: 'Success:' + resDisplay });
              }
              else {
                DialogFactory.showMessageDialog({ mensagem: 'Error occured: ' + result });
              }
            }, function (error) {
              showLoader.close();
              DialogFactory.showMessageDialog({ mensagem: 'Error occured: ' + error });
            });
          }
        });
      }
      else {
        DialogFactory.dialogConfirm({ titulo: 'Desbloqueio de linha', mensagem: '<span>Deseja desbloquear <strong>TODAS</strong> as linhas de Cliente ou apenas a linha selecionada' + custName + '</span>', btn1: 'TODAS', btn2: 'Selecionado' }).then(function (result) {
          if (result == 0) {
            DialogFactory.dialogConfirm({ titulo: 'Desbloqueio de linha', mensagem: '<span>Deseja desbloquear <strong>TODOS</strong> de acordo com as linhas do ' + custName + '</span>', btn1: 'SIM', btn2: 'Temporariamente' }).then(function (result) {
              if (!result) {
                DialogFactory.dialogConfirm({ titulo: 'Desbloqueio de linhas', mensagem: 'Tem Certeza', btn1: 'SIM', btn2: 'NÃO' }).then(function (result) {
                  if (!result) {
                    var showLoader = DialogFactory.showLoader("Um momento estamos desbloqueando as linhas.");
                    var data = {
                      PersonId: custId
                    }
                    FoneclubeService.permanentUnBlockLineForCustomer(data).then(function (result) {
                      if (result != null) {
                        showLoader.close();
                        var resDisplay = "";
                        for (var ir = 0; ir < result.length; ir++) {
                          resDisplay += "Linha: " + result[ir].Linha + " Status: " + result[ir].BlockLineResponse.mensagem + "<br/>";
                        }

                        DialogFactory.showMessageDialog({ mensagem: 'Success:' + resDisplay });
                      }
                      else {
                        DialogFactory.showMessageDialog({ mensagem: 'Error occured: ' + result });
                      }
                    }, function (error) {
                      showLoader.close();
                      DialogFactory.showMessageDialog({ mensagem: 'Error occured: ' + error });
                    });
                  }
                });
              }
            });
          }
          else {
            var showLoader = DialogFactory.showLoader("Um momento estamos desbloqueando as linhas.");
            var data = { numero: linha };
            FoneclubeService.permanentUnBlockLine(data).then(function (result) {
              if (result != null) {
                showLoader.close();
                var resDisplay = "Linha: " + linha + " Status: " + result.mensagem + "<br/>";

                DialogFactory.showMessageDialog({ mensagem: 'Success:' + resDisplay });
              }
              else {
                DialogFactory.showMessageDialog({ mensagem: 'Error occured: ' + result });
              }
            }, function (error) {
              showLoader.close();
              DialogFactory.showMessageDialog({ mensagem: 'Error occured: ' + error });
            });
          }
        });
      }
    }

    function ValidatePhoneNumbers(rowData) {
      if (rowData.Contel != undefined && rowData.Contel != "" && rowData.Contel.length < 11) {
        DialogFactory.showMessageDialog({ titulo: 'Aviso', mensagem: "Por favor, insira o número de telefone de 11 dígitos do contel" });
        return false;
      }
      // else if (rowData.Port != undefined && rowData.Port != "" && rowData.Port.length < 11) {
      //   DialogFactory.showMessageDialog({ titulo: 'Aviso', mensagem: "Por favor, insira o número de telefone de 11 dígitos do portar" });
      //   return false;
      // }
      else if (rowData.ICCID != undefined && rowData.ICCID != "" && rowData.ICCID.length != 19) {
        DialogFactory.showMessageDialog({ titulo: 'Aviso', mensagem: "ICCID inserido com comprimento inválido" });
        return false;
      }
      return true;
    }

    function saveClientAndLineWithCharge() {
      vm.gridOptions.api.stopEditing();
      setTimeout(function(){
      var rowData = GetGridData();
      var filterNewRows = rowData.filter(x => x.Mode == "Add");
      var isInValid = false;
      filterNewRows.forEach(element => {
        var valid = ValidatePhoneNumbers(element);
        if (!valid)
          isInValid = true;
      });

      if (!isInValid) {
        if (filterNewRows != null && filterNewRows.length > 0) {
          var data = {
            Selected: filterNewRows,
            Plans: vm.plans,
            Client: vm.ParentData,
            IsCharge: true
          };
          ViewModelUtilsService.showInstaChargeConfirPopup(data);
        }
        else {
          DialogFactory.showMessageDialog({ titulo: 'Aviso', mensagem: "Você não adicionou novas linhas" });
        }
      }
      }, 1000);
    }

    function saveClientAndLine() {
      vm.gridOptions.api.stopEditing();
      var rowData = GetGridData();
      var filterNewRows = rowData.filter(x => x.Mode == "Add");
      var isInValid = false;
      filterNewRows.forEach(element => {
        var valid = ValidatePhoneNumbers(element);
        if (!valid)
          isInValid = true;
      });

      if (!isInValid) {

        if (filterNewRows != null && filterNewRows.length > 0) {
          var data = {
            Selected: filterNewRows,
            Plans: vm.plans,
            Client: vm.ParentData,
            IsCharge: false
          };
          ViewModelUtilsService.showInstaChargeConfirPopup(data);
        }
        else {
          DialogFactory.showMessageDialog({ titulo: 'Aviso', mensagem: "Você não adicionou novas linhas" });
        }
      }
    }

    function UpdateActiveStatus(status) {
      vm.SoftDelete = !status;
      var clientData = GetClientRequest();
      FoneclubeService.updateInstaEditClient(clientData).then(function (res) {

      });
    }

    function GetClientRequest() {
      return {
        Id: vm.ParentData.Id,
        Name: vm.CustomeName,
        Email: vm.CustomeEmail,
        DocumentNumber: vm.CustomeCPF,
        Telefone: UtilsService.clearPhoneNumber(vm.CustomerPhone),
        ParentId: vm.selectedParent == null ? vm.ParentData.Parent.Id : vm.selectedParent.Id,
        Desativo: vm.SoftDelete
      };
    }

    function saveNewLinesToExistingCustomer() {
      var clientData = GetClientRequest();
      FoneclubeService.updateInstaEditClient(clientData).then(function (res) {
        DialogFactory.showMessageDialog({ titulo: 'Aviso', mensagem: "Dados alterados com sucesso." });
      });

      vm.gridOptions.api.stopEditing();
      var rowData = GetGridData();
      var filterNewRows = rowData.filter(x => x.Mode == "Add");


      var isInValid = false;
      filterNewRows.forEach(element => {
        var valid = ValidatePhoneNumbers(element);
        if (!valid)
          isInValid = true;
      });

      if (!isInValid) {
        if (filterNewRows != null && filterNewRows.length > 0) {
          var msg = "Você adicionou as linhas abaixo, clique em confirmar para salvar<br/>";
          var msgPhone = "";
          var phones = [];
          for (var i = 0; i < filterNewRows.length; i++) {
            msgPhone += "<br/>Contel: " + filterNewRows[i].Contel + "<br/>Port: " + filterNewRows[i].Port + "<br/>ICCID: " + filterNewRows[i].ICCID + '<br/>Plano: ' + filterNewRows[i].PrecoFC + "<br/>";
            var plan = vm.plans.find(x => x.Description == filterNewRows[i].PrecoFC);
            var data = {
              intDDD: filterNewRows[i].Contel.substr(0, 2),
              intPhone: filterNewRows[i].Contel.substr(2),
              intIdOperator: plan.IdOperator,
              intIdPerson: vm.ParentData.Id,
              txtPortNumber: filterNewRows[i].Port,
              txtNickname: filterNewRows[i].NickName,
              txtICCID: filterNewRows[i].ICCID,
              intIdPlan: plan.Id,
              intAmmoutPrecoVip: filterNewRows[i].VIPPrice
            };
            phones.push(data);
          }
          msg = msg + msgPhone;
          DialogFactory.dialogConfirm({ title: 'Atenção!', mensagem: msg })
            .then(function (result) {
              if (result) {
                FoneclubeService.saveInstaPhoneClient(phones).then(function (result1) {
                  if (result1)
                    DialogFactory.showMessageDialog({ mensagem: 'Linhas salva com sucesso' });
                  else
                    DialogFactory.showMessageDialog({ mensagem: 'A linha já existe ou ocorreu um erro ao adicionar esta linha' });
                });
              }
            });
        }
        else {

        }
      }
    }

    function saveUserSettings() {
      var data = {
        IntIdPerson: vm.ParentData.Id,
        IsPrecoPromoSum: true,
        IsPrecoFCSum: true,
        IsUse2Prices: vm.Use2Prices,
        IsVIP: vm.IsVIP,
      };

      FoneclubeService.saveUserSettings(data).then(function (result) {
        console.log('Saved Usar2Preços');
      });
    }

    function getAgGridState() {
      var res = vm.agGridStates.find(x => x.txtStateName == vm.defaultGridState.txtStateName);
      if (res != null && res.txtFilterModel != undefined && res.txtColumnState != undefined) {
        vm.gridOptions.api.setFilterModel(JSON.parse(res.txtFilterModel));
        vm.gridOptions.columnApi.setColumnState(JSON.parse(res.txtColumnState));
        if (res.txtSortModel != '{}')
          vm.gridOptions.api.setSortModel(JSON.parse(res.txtSortModel));
      }
      var saveStateData = {
        intId: vm.defaultGridState.intId,
        txtAgidName: 'CustomerDetail',
      }
      FoneclubeService.updateDefaultGridState(saveStateData).then(function (result) {
      });
    }

    function saveState() {
      var retVal = prompt("Enter save state name : ", "state name here");
      var saveStateData = {
        intId: -1,
        txtStateName: retVal,
        txtAgidName: 'CustomerDetail',
        txtColumnState: JSON.stringify(vm.gridOptions.columnApi.getColumnState()),
        txtFilterModel: JSON.stringify(vm.gridOptions.api.getFilterModel()),
        txtSortModel: JSON.stringify(vm.gridOptions.api.getSortModel())
      }

      if (retVal != "null" && retVal != null) {
        FoneclubeService.saveAgGridState(saveStateData).then(function (result) {
          alert('Saved successfully');
          FoneclubeService.getAgGridStates("CustomerDetail").then(function (result) {
            if (result != null)
              vm.agGridStates = result;
            var default1 = result.find(x => x.IsDefault == true);
            if (default1) {
              vm.defaultGridState = default1;
            }
          });
        });
      }
    }

    function updateState() {
      var retVal = prompt("Enter save state name to update: ", vm.defaultGridState.txtStateName);
      var saveStateData = {
        intId: vm.defaultGridState.intId,
        txtStateName: retVal,
        txtAgidName: 'CustomerDetail',
        txtColumnState: JSON.stringify(vm.gridOptions.columnApi.getColumnState()),
        txtFilterModel: JSON.stringify(vm.gridOptions.api.getFilterModel()),
        txtSortModel: JSON.stringify(vm.gridOptions.api.getSortModel())
      }
      FoneclubeService.saveAgGridState(saveStateData).then(function (result) {
        alert('Updated successfully')
      });
    }

    function deleteState() {
      ViewModelUtilsService.showConfirmDialog('Atenção!', 'Are you sure, you want to delete?').then(function (confirm) {
        if (confirm) {
          var deleteStateData = {
            intId: vm.defaultGridState.intId,
            txtAgidName: 'CustomerDetail'
          }
          FoneclubeService.deleteAgGridState(deleteStateData).then(function (result) {
            alert('Deleted successfully')
          });
        }
      });
    }

  }
})();
