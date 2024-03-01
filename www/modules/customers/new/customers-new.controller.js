angular.module('foneClub').controller('CustomersControllerNew', CustomersControllerNew).directive('setFocus', function () {
  return {
    link: function (scope, element, attrs) {
      element.bind('click', function () {
        //alert(element.attr('id'));
        document.querySelector('#' + attrs.setFocus).focus();
      })
    }
  }
})

//CustomersControllerNew.inject = ['localStorageService']

function CustomersControllerNew($interval, FoneclubeService, PagarmeService, FlowManagerService, $filter, ViewModelUtilsService, localStorageService, DialogFactory, UtilsService) {

  var vm = this;
  var CARTAO = 1;
  var BOLETO = 2;
  var PIX = 3;
  var updateGrid = false;
  vm.isMobile = UtilsService.mobileCheck();
  var cpfregex = /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/;
  vm.month = new Date().getMonth() + 1;
  vm.year = new Date().getFullYear();
  vm.diffDays = diffDays;
  vm.hidefilters = true;
  vm.statusType = {
    COBRADO: 1,
    NAO_COBRADO: 2,
    PAGO: 3,
    REFUNDED: 4,
    VENCIDO: 5
  };
  vm.PagamentosType = {
    BOLETO: 1,
    CARTAO: 2
  };
  vm.AtivoType = {
    ATIVA: 2,
    CANCELADA: 1
  }
  vm.tiposStatus = [
    { id: "", title: "" },
    { id: 1, title: 'COBRADO' },
    { id: 2, title: 'NÃO COBRADO' },
    { id: 3, title: 'PAGO' },
    { id: 4, title: 'REFUNDED' },
    { id: 5, title: 'VENCIDO' }
  ];
  vm.tiposPagamento = [
    { id: "", title: "" },
    { id: 1, title: 'BOLETO' },
    { id: 2, title: 'CARTÃO' }
  ];
  vm.tipoAtiva = [
    { id: "", title: "" },
    { id: 1, title: 'CANCELADA' },
    { id: 2, title: 'ATIVA' }
  ]
  vm.tipoAcao = [
    { id: "", title: "" },
    { id: 1, title: 'A' },
    { id: 2, title: 'C' }
  ]
  vm.includeActive = true;
  vm.includeInActive = false;
  vm.excludeProblema = false;
  vm.excludeFlag = false;
  vm.loading = false;
  vm.excludeFather = false;
  vm.excludeAddress = false;
  vm.excludeWhatsappUsers = false;
  vm.includeWhatsappUsers = false;
  vm.includeStatusGreen = false;
  vm.includeStatusYellow = false;
  vm.includeStatusRed = false;
  vm.includeStatusGray = false;
  vm.includeStatusNan = false;
  vm.filterTextInAllCols = false;
  vm.filterTextInNameOnly = false;
  vm.searchText = "";
  vm.clipBoardCopiedText = "";
  vm.agGridStates = ["All"];
  vm.customerDataSource;
  vm.customerViewModel;
  vm.selectedState = {};
  vm.defaultGridState = {};
  // vm.customerGridOptions;

  vm.filterClients = filterClients;
  vm.onTapSwitchActivate = onTapSwitchActivate;
  vm.onTapCustomer = onTapCustomer;
  vm.onTapCustomerEdit = onTapCustomerEdit;
  vm.onTapMessage = onTapMessage;
  vm.onTapFlag = onTapFlag;
  vm.onTapComment = onTapComment;
  vm.onTapBoletoPayment = onTapBoletoPayment;
  vm.onTapBoleto = onTapBoleto;
  vm.onTapDebito = onTapDebito;
  vm.onDeleteCustomer = onDeleteCustomer;
  vm.onUnDeleteCustomer = onUnDeleteCustomer;
  vm.onPageLoad = onPageLoad;
  vm.exportToExcel = exportToExcel;
  vm.filterText = filterText;
  vm.refreshPage = refreshPage;
  vm.checkRepeatOrder = checkRepeatOrder;
  vm.onTapPix = onTapPix;
  vm.onTapNewCardPayment = onTapNewCardPayment;
  vm.pasteCliboardText = pasteCliboardText;
  vm.onClipBoardSuccess = onClipBoardSuccess;
  vm.testWhatsApp = testWhatsApp;
  vm.importDrCelular = importDrCelular;
  vm.saveState = saveState;
  vm.deleteState = deleteState;
  vm.updateState = updateState;
  vm.getAgGridState = getAgGridState;
  vm.BlockUnlockLine = BlockUnlockLine;
  vm.showFilterSection = showFilterSection;


  const customNumberComparator = (valueA, valueB) => {
    if (valueA == "OFF" || valueB == "OFF") {
      valueA = valueA;
    }
    valueA = (valueA == null || valueA == "" || valueA == "OFF") ? "-1" : valueA.replace(" GB", "").replace(",", "").replace("R$", "");
    valueB = (valueB == null || valueB == "" || valueB == "OFF") ? "-1" : valueB.replace(" GB", "").replace(",", "").replace("R$", "");
    if (parseInt(valueA) == parseInt(valueB)) return 0;
    return (parseInt(valueA) > parseInt(valueB)) ? 1 : -1;
  };

  vm.gridOptions = {
    components: {
      personComponent: PersonComponent,
      customDateComponent: CustomDateComponent
    },
    columnDefs: setColumnDefs(),
    onCellValueChanged: function (event) {
      if (event != null && event.data != null) {
        var nextAction =
        {
          Id: event.data.CustomerId,
          NextActionDate: new Date(event.data.NextActionDate),
          NextActionText: event.data.NextActionText
        }
        FoneclubeService.postPersonNextAction(nextAction).then(function (result) {
        });
      }
    }
    ,
    rowData: [],
    defaultColDef: {
      sortable: true,
      filter: true,
      resizable: true,
      // supressMenuHide: true,
    },
    rowHeight: UtilsService.mobileCheck() ? 40 : 30,
    headerHeight: UtilsService.mobileCheck() ? 50 : 100,
    angularCompileRows: true,
    onGridReady: function (params) {
      this.gridApi = params.api;
      this.gridColumnApi = params.columnApi;
      var sort = [
        {
          colId: 'Ult. Pag. Dias',
          sort: 'desc',
        }
      ];
      this.gridApi.setSortModel(sort);
      if (updateGrid) {
        //vm.gridOptions.api.setRowData(vm.customers);
        bindAgGrid(vm.customers);
        vm.includeActive = true;
        filterClientsData();
        updateGrid = false;
        UpdateLastSelected();
      }
    },
    autoSizeColumns: true
  };


  vm.gridHeight = $(window).height() - 150;

  vm.resultText = "";

  function StringComparator(valueA, valueB) {
    const valueALower = valueA.toLowerCase().trim();
    const valueBLower = valueB.toLowerCase().trim();
    return valueALower.localeCompare(valueBLower, 'en', { numeric: true });
  }

  function showFilterSection() {
    vm.hidefilters = !vm.hidefilters;
  }


  //BEGIN: New Functions
  //BEGIN: AG-Grid
  function setColumnDefs() {
    var columnDefs = [
      { hide: true, field: 'CustomerId' },
      { hide: true, field: 'TipoLink' },
      { hide: true, field: 'StatusId' },
      { hide: true, field: 'Status2' },
      { hide: true, field: 'Acao' },
      { hide: true, field: 'AcaoBool' },
      { hide: true, field: 'customerSelectedCharge' },
      { hide: true, field: 'customerChargeId' },

      // On/Off color
      {
        headerName: '',
        field: 'Desativo',
        width: 45,
        pinned: 'left',
        cellRenderer: function (params) {
          var cellHtml = "";
          var customer = findCustomerById(params.node.data.CustomerId);
          cellHtml = '<a title="' + (!customer.Desativo ? "Desativar cliente" : "Ativar cliente") + '" ng-click="vm.onTapSwitchActivate(' + params.node.data.CustomerId + ', ' + params.node.id + ')" ><img class="imgOnOff link" src="content/img/' + (!customer.Desativo ? 'customeron.png' : 'customeroff.png') + '" /></a>';
          return cellHtml;
        },
        filter: true,
      },
      // payment color
      {
        headerName: '$',
        field: 'PaymentStatusColor',
        width: 30,
        pinned: 'left',
        cellRenderer: function (params) {
          if (params.value == "green")
            return "<img class='imgWhatsapp link' src='content/img/dollar-green.png' />";
          else if (params.value == "red")
            return "<img class='imgWhatsapp link' src='content/img/dollar-red.png' />";
          else if (params.value == "yellow")
            return "<img class='imgWhatsapp link' src='content/img/dollar-yellow.png' />";
          else
            return "<img class='imgWhatsapp link' src='content/img/dollar-grey.png' />";
        },
        filter: false
      },
      // whatsApp
      {
        headerName: '',
        field: 'WhatsappImage',
        width: 45,
        pinned: 'left',
        cellRenderer: function (params) {
          if (params.value == '../../content/img/message-red.png') {
            return "<a ng-click='vm.onTapMessage(" + params.node.data.CustomerId + ")' title='UnRegistered'><img class='imgWhatsapp link' src=" + params.value + " /></a>";
          } else {
            return "<a ng-click='vm.onTapMessage(" + params.node.data.CustomerId + ")' title='Registered'><img class='imgWhatsapp link' src=" + params.value + " /></a>";
          }

        },
        filter: false
      },
      // customer name
      {
        headerName: 'Name',
        field: 'CustomerName',
        width: 180,
        pinned: 'left',
        cellRenderer: function (params) {
          return "<a ng-click='vm.onTapCustomerEdit(" + params.node.data.CustomerId + ")' class='black-link'>" + params.value + "</a>";
        },
        filter: 'personComponent',
        // filterParams: {
        // 	filterOptions: [
        // 		{
        // 			displayKey: 'containString',
        // 			displayName: 'Contains String',
        // 			test: function (filterValue, cellValue) {
        // 				return checkContains(RemoveAccents(cellValue).toLowerCase(), RemoveAccents(filterValue).toLowerCase());
        // 			}
        // 		},
        // 	],
        // 	suppressAndOrCondition: true
        // }
      },
      // buttons
      {
        headerName: '',
        field: '',
        width: 340,
        cellRenderer: function (params) {
          var cellHtml = "";
          var customer = findCustomerById(params.node.data.CustomerId);

          cellHtml += '<a ng-click="vm.onTapCustomer(' + params.node.data.CustomerId + ')" title="Financeiro"><img class="imgUsd link" src="content/img/usd.jpeg" /></a>';
          cellHtml += '&nbsp;&nbsp;<a ng-click="vm.checkRepeatOrder(' + params.node.data.CustomerId + ')" title="Repetir Última Cobrança"><img class="imgrepeatcharge link" src="content/img/repeatcharge.png" /></a>';
          cellHtml += '&nbsp;<a ng-click="vm.onTapPix(' + params.node.data.CustomerId + ')" title="PIX"><img class="imgPix link" src="content/img/pix.png" /></a>';
          cellHtml += '&nbsp;<a ng-click="vm.onTapBoleto(' + params.node.data.CustomerId + ')" title="BOLETO"><img class="imgBoleto link" src="content/img/BoletoIcon.png" /></a>';
          cellHtml += '&nbsp;<a ng-click="vm.onTapNewCardPayment(' + params.node.data.CustomerId + ')" title="Credit Card"><img class="imgcc link" src="../../content/img/creditcard.png" /></a>';
          cellHtml += '&nbsp;<a ng-click="vm.onTapFlag(' + params.node.data.CustomerId + ')" title="Criar Flag"><img class="imgcc link" src="content/img/pflag.png" /></a>';
          cellHtml += '&nbsp;<a title="Soft delete" ng-click="vm.onDeleteCustomer(' + params.node.data.CustomerId + ', ' + params.node.id + ');$event.preventDefault();"><img class="imgPix link" src="content/img/cancel.png" /></a>';
          cellHtml += '&nbsp;<a title="Un delete" ng-click="vm.onUnDeleteCustomer(' + params.node.data.CustomerId + ', ' + params.node.id + ')"><img class="imgPix link" src="content/img/undelete.jpg" /></a>';
          cellHtml += '&nbsp;<a ng-click="vm.onTapComment(' + params.node.data.CustomerId + ')" title="Ordem de Serviço" ><img class="imgPix link" src="content/img/serviceorder.png" /></a>';
          if (customer.PendingFlagInteraction) {
            cellHtml += '&nbsp;<a title="Cliente com flag pendente!" class="btn btn-warning"><i>&#9873;</i></a>';
          }
          if (customer.Orphan) {
            cellHtml += '&nbsp;<button title="Cliente com problema no cadastro!" class="btn btn-warning"><i class="glyphicon glyphicon-exclamation-sign"></i></button>';
          }

          /*
          cellHtml += '&nbsp;<button ng-click="vm.onTapBoletoPayment(' + params.node.data.CustomerId + ')" title="Boleto" class="btn btn-primary"><i class="glyphicon glyphicon-retweet"></i></button>';
          cellHtml += '&nbsp;<button ng-click="vm.onTapCustomer(' + params.node.data.CustomerId + ')" title="Credit Card" class="btn btn-primary"><i class="glyphicon glyphicon-credit-card"></i></button>';
          cellHtml += '&nbsp;<button class="btn btn-primary" ng-click="vm.onTapBoleto(' + params.node.data.CustomerId + ')" title="boleto"><img src="./content/img/Boleto.png" width="15px" height="15px" /></button>';
          cellHtml += '&nbsp;<button class="btn btn-primary" ng-click="vm.onTapDebito(' + params.node.data.CustomerId + ')" title="Debit card"><img src="./content/img/debito.png" width="15px" height="15px" /></button>';
          */

          return cellHtml;
        },
        filter: false
      },
      {
        headerName: 'Agendado',
        field: 'Agendado',
        width: 85,
        editable: true,
        cellRenderer: function (params) {
          return "<label>" + params.value + "</label>";
        },
        filter: false
      },
      {
        headerName: 'Ult. Mens',
        field: 'WhatsAppStatus',
        width: 115,
        cellRenderer: function (params) {
          return "<label>" + params.value + "</label>";
        },
        filter: false
      },
      // Ult Pag Dias
      {
        headerName: 'Ult. $ Dias',
        field: 'Dias2',
        colId: 'Ult. Pag. Dias',
        width: 105,
        cellRenderer: function (params) {
          if (params.value >= 0)
            return "<div>" + params.value + "</div>";
          else
            return "<div>-</div>";
        },
        filterParams: {
          filterOptions: [
            {
              displayKey: 'largerThan',
              displayName: 'Larger than',
              test: function (filterValue, cellValue) {
                return parseInt(cellValue) > parseInt(filterValue);
              }
            },
            {
              displayKey: 'smallerThan',
              displayName: 'Smaller than',
              test: function (filterValue, cellValue) {
                return parseInt(cellValue) < parseInt(filterValue);
              }
            },
            'equals',
            'notEqual'
          ]
        }
      },
      // Status Cob   (Select Filter)
      {
        headerName: 'Linha',
        field: 'LineStatus',
        width: 95,
        cellRenderer: function (params) {
          if (params.value == "A") {
            return '<a ng-click="vm.BlockUnlockLine(' + params.value + ', ' + params.node.data.CustomerId + ', ' + params.node.id + ')" href="javascript:void(0);" title="Ativa"><img class="imgUsd link" style="max-width:16px" src="content/img/phone-green.png" /></a>';
          }
          else if (params.value == "C") {
            return '<a ng-click="vm.BlockUnlockLine(' + params.value + ', ' + params.node.data.CustomerId + ', ' + params.node.id + ')" href="javascript:void(0);" title="Cancelada"><img class="imgUsd link" style="max-width:16px" src="content/img/phone-black.png" /></a>';
          } else if (params.value == "B") {
            return '<a ng-click="vm.BlockUnlockLine(' + params.value + ', ' + params.node.data.CustomerId + ', ' + params.node.id + ')"  title="Bloqueada" style=""><img class="imgUsd link" style="max-width:16px" src="content/img/phone-red.png" /></a>';
          }
          else {
            return '<a class="circle_red1" ng-click="vm.BlockUnlockLine(' + params.value + ', ' + params.node.data.CustomerId + ', ' + params.node.id + ')" href="javascript:void(0);"/>';
          }
        }
      },
      // Status Cob   (Select Filter)
      {
        headerName: 'Status $',
        field: 'Status2',
        width: 95,
        cellRenderer: function (params) {
          if (params.value == 'Atrasado') {
            return "<label style='color:red;font-weight:bold'>" + params.value + "</label>";
          } else {
            return "<label>" + params.value + "</label>";
          }
        },
        filter: 'agTextColumnFilter',
        filterParams: {
          buttons: ['clear', 'apply'],
        },
      },
      // Ultima Cob
      {
        headerName: 'Ultima Cob.',
        field: 'Dias',
        width: 80,
        cellRenderer: function (params) {
          if (params.value == -1) {
            return '<div>Nan</div>'
          } else {
            return '<div>' + params.value + '</div>';
          }

        },
        filterParams: {
          filterOptions: [
            {
              displayKey: 'largerThan',
              displayName: 'Larger than',
              test: function (filterValue, cellValue) {
                return parseInt(cellValue) > parseInt(filterValue);
              }
            },
            {
              displayKey: 'smallerThan',
              displayName: 'Smaller than',
              test: function (filterValue, cellValue) {
                return parseInt(cellValue) < parseInt(filterValue);
              }
            },
            'equals',
            'notEqual'
          ]
        }
      },
      {
        headerName: '$ VIP',
        field: 'SumVIP',
        width: 120,
        cellRenderer: function (params) {
          return "<label>" + params.value + "</label>";
        },
        comparator: customNumberComparator
      },
      {
        headerName: 'Next Action',
        field: 'NextActionDate',
        editable: true,
        width: 120,
        cellRenderer: 'customDateComponent',
        filter: false
      },
      // payment color
      {
        headerName: 'Envio $',
        field: 'Verificar1',
        width: 80,
        cellRenderer: function (params) {
          if (params.value == 'Atrasado') {
            return "<label style='color:red;font-weight:bold'>" + params.value + "</label>";
          } else {
            return "<label>" + params.value + "</label>";
          }
        },
        filter: false
      },
      {
        headerName: 'Action',
        field: 'NextActionText',
        editable: true,
        width: 100,
        cellRenderer: function (params) {
          return params.value;
        },
        filter: false
      },
      {
        headerName: 'Ult. Agenda.',
        field: 'LastAgendado',
        width: 80,
        cellRenderer: function (params) {
          return "<label>" + params.value + "</label>";
        },
        filter: false
      },

      // Vecimento
      {
        headerName: 'Venc',
        field: 'Vencimento',
        width: 100,
        cellRenderer: function (params) {
          return renderDate(params.value);
        },
        filter: 'agDateColumnFilter',
        filterParams: {
          filterOptions: [
            {
              displayKey: 'olderThan',
              displayName: 'After than',
              test: function (filterValue, cellValue) {
                var origin = new Date(cellValue);
                return origin < filterValue;
              }
            },
            {
              displayKey: 'youngerThan',
              displayName: 'Before than',
              test: function (filterValue, cellValue) {
                var origin = new Date(cellValue);
                return filterValue < origin;
              }
            },
            {
              displayKey: 'specifics',
              displayName: 'Specific date',
              test: function (filterValue, cellValue) {
                var origin = new Date(cellValue);
                return filterValue == cellValue;
              }
            }]
        }
      },
      // Tip (Select Filter)
      {
        headerName: 'Tipo',
        field: 'Tipo',
        width: 100,
        cellRenderer: function (params) {
          if (params.value != 'BOLETO') {
            return "<label>" + params.value + "</label>";
          } else {
            return "<a href=" + params.node.data.TipoLink + " target='_blank'>" + params.value + "</a>";
          }
        },
        filter: 'agTextColumnFilter',
        filterParams: {
          buttons: ['clear', 'apply'],
        },
      },
      // Vigencia
      {
        headerName: 'Vigencia',
        field: 'Vigencia',
        width: 100,
        cellRenderer: function (params) {
          return params.value;
        },
        filter: 'agDateColumnFilter',
        filterParams: {
          filterOptions: [
            {
              displayKey: 'olderThan',
              displayName: 'After than',
              test: function (filterValue, cellValue) {
                var origin = new Date(cellValue);
                return origin < filterValue;
              }
            },
            {
              displayKey: 'youngerThan',
              displayName: 'Before than',
              test: function (filterValue, cellValue) {
                var origin = new Date(cellValue);
                return filterValue < origin;
              }
            },
            {
              displayKey: 'specifics',
              displayName: 'Specific date',
              test: function (filterValue, cellValue) {
                var origin = new Date(cellValue);
                return filterValue == cellValue;
              }
            }]
        }
      },
      // Ult Pag Data
      {
        headerName: 'Ult. Pago',
        field: 'Ultimopag',
        width: 100,
        cellRenderer: function (params) {
          return renderDate(params.value);
        },
        filter: 'agDateColumnFilter',
        filterParams: {
          filterOptions: [
            {
              displayKey: 'olderThan',
              displayName: 'After than',
              test: function (filterValue, cellValue) {
                var origin = new Date(cellValue);
                return origin < filterValue;
              }
            },
            {
              displayKey: 'youngerThan',
              displayName: 'Before than',
              test: function (filterValue, cellValue) {
                var origin = new Date(cellValue);
                return filterValue < origin;
              }
            },
            {
              displayKey: 'specifics',
              displayName: 'Specific date',
              test: function (filterValue, cellValue) {
                var origin = new Date(cellValue);
                return filterValue == cellValue;
              }
            }]
        }

      },
      // Ult Pag R$
      {
        headerName: 'Ult. Pago $',
        field: 'RPago',
        width: 100,
        cellRenderer: function (params) {
          return params.value ? (Math.round(params.value * 100) / 100).toFixed(2) : '';
        },
        filterParams: {
          filterOptions: [
            {
              displayKey: 'largerThan',
              displayName: 'Larger than',
              test: function (filterValue, cellValue) {
                return parseInt(cellValue) > parseInt(filterValue);
              }
            },
            {
              displayKey: 'smallerThan',
              displayName: 'Smaller than',
              test: function (filterValue, cellValue) {
                return parseInt(cellValue) < parseInt(filterValue);
              }
            },
            'equals',
            'notEqual'
          ]
        }
      },

      // Ultima cobranca
      {
        headerName: 'Ultima Cob.',
        field: 'UltimaCob',
        width: 100,
        cellRenderer: function (params) {
          return renderDate(params.value);
        },
        filter: 'agDateColumnFilter',
        filterParams: {
          filterOptions: [
            {
              displayKey: 'olderThan',
              displayName: 'After than',
              test: function (filterValue, cellValue) {
                var origin = new Date(cellValue);
                return origin < filterValue;
              }
            },
            {
              displayKey: 'youngerThan',
              displayName: 'Before than',
              test: function (filterValue, cellValue) {
                var origin = new Date(cellValue);
                return filterValue < origin;
              }
            },
            {
              displayKey: 'specifics',
              displayName: 'Specific date',
              test: function (filterValue, cellValue) {
                var origin = new Date(cellValue);
                return filterValue == cellValue;
              }
            }]
        }
      },
      // Ult Cob R$
      {
        headerName: 'Ult. Cob. R$',
        field: 'RCobrado',
        width: 100,
        cellRenderer: function (params) {
          return params.value ? (Math.round(params.value * 100) / 100).toFixed(2) : '';
        },
        filterParams: {
          filterOptions: [
            {
              displayKey: 'largerThan',
              displayName: 'Larger than',
              test: function (filterValue, cellValue) {
                return parseInt(cellValue) > parseInt(filterValue);
              }
            },
            {
              displayKey: 'smallerThan',
              displayName: 'Smaller than',
              test: function (filterValue, cellValue) {
                return parseInt(cellValue) < parseInt(filterValue);
              }
            },
            'equals',
            'notEqual'
          ]
        }
      }
    ];

    return columnDefs;
  }

  function bindAgGrid(data) {
    var rowData = convertToViewModel(data);

    if (vm.gridOptions.api) {
      vm.gridOptions.api.setRowData(rowData);
    } else {
      updateGrid = true;
    }

    vm.loading = false;
  }

  function filterClients() {
    vm.loading = true;
    sessionStorage.setItem('searchTextMain', vm.searchText);
    filterClientsData();
  }
  function filterText() {
    if (vm.searchText) {
      filterClientsData();
    }
  }
  function filterClientsData() {
    vm.loading = true;
    var filteredData = $filter('filter')(vm.customers, function (data) {
      if (data.fullData) {
        return ((excludeAllFilters()) ||
          (filterByText(data)) &&
          ((!vm.includeActive && !vm.includeInActive) ||
            (vm.includeActive ? data.fullData.Desativo == undefined ? true : data.fullData.Desativo == false : false) ||
            (vm.includeInActive ? data.fullData.Desativo == undefined ? false : data.fullData.Desativo == true : false)) &&

          (vm.excludeProblema ? !data.fullData.Orphan : true) &&
          (vm.excludeFlag ? !data.fullData.PendingFlagInteraction : true) &&
          (vm.excludeFather ? !data.fullData.NameParent : true) &&
          (vm.excludeAddress ? !data.fullData.Adresses.length : true) &&

          ((!vm.excludeWhatsappUsers && !vm.includeWhatsappUsers) ||
            (vm.excludeWhatsappUsers ? (!data.fullData.WClient || !data.fullData.WClient.IsRegisteredWithChat2Desk) : false) ||
            (vm.includeWhatsappUsers ? (data.fullData.WClient && data.fullData.WClient.IsRegisteredWithChat2Desk) : false)) &&

          ((!vm.includeStatusGreen && !vm.includeStatusYellow && !vm.includeStatusRed && !vm.includeStatusGray && !vm.includeStatusNan) ||
            (vm.includeStatusGreen ? filterStatusColor(data, "green") : false) ||
            (vm.includeStatusYellow ? filterStatusColor(data, "yellow") : false) ||
            (vm.includeStatusRed ? filterStatusColor(data, "red") : false) ||
            (vm.includeStatusGray ? filterStatusColor(data, "grey") : false) ||
            (vm.includeStatusNan ? filterStatusColor(data, "nan") : false)));
      }
      else {
        return false;
      }
    });
    vm.resultText = filteredData.length + " of " + vm.customers.length + " items";
    bindAgGrid(filteredData);
    UpdateLastSelected();
    vm.loading = false;
  }

  function filterByText(data) {
    if (vm.searchText) {
      vm.searchText = vm.searchText.replace(".", "").replace("-", "");
      var tempsearchText = vm.searchText.replace("(", "").replace(")", "").replaceAll(" ", "");
      if (!isNaN(tempsearchText)) {
        vm.searchText = tempsearchText;
      }

      vm.searchText = vm.searchText.toLowerCase();

      if (vm.filterTextInAllCols && !vm.filterTextInNameOnly) {
        return data.Id.toString().toLowerCase().indexOf(vm.searchText) > -1 ||
          data.Name.toLowerCase().indexOf(vm.searchText) > -1 ||
          data.Email.toLowerCase().indexOf(vm.searchText) > -1 ||
          (data.fullData.DocumentNumber ? data.fullData.DocumentNumber.toLowerCase().indexOf(vm.searchText) > -1 : false) ||
          (data.fullData.NickName ? data.fullData.NickName.toLowerCase().indexOf(vm.searchText) > -1 : false) ||
          (data.fullData.Born ? data.fullData.Born.toLowerCase().indexOf(vm.searchText) > -1 : false) ||
          (data.fullData.IdPagarme ? data.fullData.IdPagarme.toString().indexOf(vm.searchText) > -1 : false) ||
          matchPhone(data.Phones, vm.searchText) ||
          matchPhoneNickName(data.fullData.Phones, vm.searchText) ||
          matchICCID(data.Phones, vm.searchText) ||
          matchPortNumber(data.Phones, vm.searchText) ||
          (data.fullData.NameParent ? data.fullData.NameParent.toLowerCase().indexOf(vm.searchText) > -1 : false);
      } else {
        return data.Name.toLowerCase().indexOf(vm.searchText) > -1 || (data.fullData.DocumentNumber ? data.fullData.DocumentNumber.toLowerCase().indexOf(vm.searchText) > -1 : false) || matchPhone(data.Phones, vm.searchText) || matchICCID(data.Phones, vm.searchText) || UtilsService.checkContains(UtilsService.removeAccents(data.Name.toLowerCase()), UtilsService.removeAccents(vm.searchText));
        //return data.Name.toLowerCase().indexOf(vm.searchText) > -1;
      }
    } else {
      return true;
    }
  }

  function filterStatusColor(data, color) {
    if (color != "nan") {
      return (data.ChargeAndServiceOrderHistory &&
        data.ChargeAndServiceOrderHistory.Charges &&
        data.ChargeAndServiceOrderHistory.Charges.PaymentStatusColor == color)
    } else {
      return (data.ChargeAndServiceOrderHistory &&
        data.ChargeAndServiceOrderHistory.Charges == null)
    }

  }

  function excludeAllFilters() {
    return !vm.includeActive
      && !vm.includeInActive
      && !vm.excludeProblema
      && !vm.excludeFlag
      && !vm.excludeFather
      && !vm.excludeAddress
      && !vm.excludeWhatsappUsers
      && !vm.includeWhatsappUsers
      && !vm.includeStatusGreen
      && !vm.includeStatusYellow
      && !vm.includeStatusRed
      && !vm.includeStatusGray
      && !vm.includeStatusNan
      && !vm.searchText;
  }

  function matchPhone(phones, numberToCompare) {
    numberToCompare = numberToCompare.replace(/[!#$%&'()*+,-./:;?@[\\\]_`{|}~' 'éá]/g, '');
    if (phones && phones.length > 0) {
      if (phones[0] == null) {
        return false;
      } else {
        var phone = $filter('filter')(phones, function (data) {
          return (data.Number ? ("55" + data.DDD + data.Number.toString()).indexOf(numberToCompare) > -1 : false);
        });

        return phone.length > 0;
      }
    }

    return false;
  }

  function matchICCID(phones, numberToCompare) {
    if (phones && phones.length > 0) {
      if (phones[0] == null) {
        return false;
      } else {
        var phone = $filter('filter')(phones, function (data) {
          return (data.ICCID ? data.ICCID.indexOf(numberToCompare) > -1 : false);
        });

        return phone.length > 0;
      }
    }

    return false;
  }

  function matchPortNumber(phones, numberToCompare) {
    if (phones && phones.length > 0) {
      if (phones[0] == null) {
        return false;
      } else {
        var phone = $filter('filter')(phones, function (data) {
          return (data.PortNumber ? data.PortNumber.replace("-", "").replace("(", "").replace(")", "").replaceAll(" ", "").indexOf(numberToCompare) > -1 : false);
        });

        return phone.length > 0;
      }
    }

    return false;
  }

  function matchPhoneNickName(phones, nickname) {
    if (phones && phones.length > 0) {
      if (phones[0] == null) {
        return false;
      } else {
        var phone = $filter('filter')(phones, function (data) {
          return (data.NickName ? data.NickName.toLowerCase().indexOf(nickname) > -1 : false);
        });

        return phone.length > 0;
      }
    }

    return false;
  }

  function onTapSwitchActivate(id, nodeId) {
    var c = findCustomerById(id);
    var oldValue = angular.copy(c.Desativo);

    var customer = {
      Id: c.Id,
      Desativo: !c.Desativo
    };

    var confirmMessage = `
        <span class="text-center">
          Tem certeza que deseja ${c.Desativo ? 'ativar' : 'desativar'} esse cliente?
        </span>
      `;

    // TODO: confirm dialog
    ViewModelUtilsService.showConfirmDialog('Atenção!', confirmMessage).then(function (
      confirm
    ) {
      if (confirm) {
        c.Desativo = customer.Desativo;

        FoneclubeService.postPersonAtivity(customer).then(function (result) {
          if (!result) {
            customer.Desativo = oldValue;
          } else {
            // update ag-grid
            let row = vm.gridOptions.api.getRowNode(nodeId);
            var index = vm.customers.indexOf(vm.customers.filter(v => v.Id == id)[0]);
            if (index >= 0) {
              vm.customers[index].Desativo = c.Desativo;
              var res = vm.gridOptions.api.redrawRows({ rowNodes: [row] });
              sessionStorage.setItem('lastClickedRowClient', id);
              UpdateLastSelected();
            }
          }
        });
      }
    });
  }

  function GenerateSummaryMessage(chargeMsg, custName, custId) {
    var addComment = chargeMsg.ChargingComment != undefined && chargeMsg.ChargingComment != null ? "*" + chargeMsg.ChargingComment + "*" : "";
    var chargesummaryurl = window.location.origin + "/#/chargesummary/" + custId + "/" + chargeMsg.Id;

    return `🤖 FoneClube: *FoneBot*
Prezado *${custName}*,

Segue resumo da sua última cobrança que que será enviada por email e whatsapp.
${addComment}

*Vencimento:${moment(chargeMsg.DueDate).format("DD/MM")}*
*Vigencia:${chargeMsg.MesVingencia + "/" + chargeMsg.AnoVingencia}*
*Total:R$${chargeMsg.Ammount / 100}*

*Detalhes para pagamento no link abaixo.*

${chargesummaryurl}

*Para visualizar seu QrCode siga o link abaixo*

http://api.foneclube.com.br/api/pagarme/pix/qrcode/${chargeMsg.Id}

Caso tenha alguma dúvida envie um *whatsapp para*

*${'https://wa.me/5521981908190'}*

ou email para

*financeiro@foneclube.com.br*.

Obrigado pela Atenção:
*FoneClube*  👍`;
  }

  function SetSessionForRowClick(id) {
    sessionStorage.setItem('lastClickedRowClient', id);
    UpdateLastSelected();
  }

  function onTapCustomerEdit(id) {
    var customer = findCustomerById(id);
    customer.view = 1;
    SetSessionForRowClick(id);
    FlowManagerService.changeEdicaoView(customer);
  }
  function onTapMessage(id) {
    SetSessionForRowClick(id);
    var customer = findCustomerById(id);
    ViewModelUtilsService.showModalReport(customer);
  }
  function onTapFlag(id) {
    var customer = findCustomerById(id);
    SetSessionForRowClick(id);
    ViewModelUtilsService.showModalFlag(customer);
  }
  function onTapComment(id) {
    var customer = findCustomerById(id);
    SetSessionForRowClick(id);
    ViewModelUtilsService.showModalComment(customer);
  }
  function onTapNewCardPayment(id) {
    var customer = findCustomerById(id);
    SetSessionForRowClick(id);
    ViewModelUtilsService.showModalNewCardPayment(customer);
  }
  function onTapPix(id) {
    var customer = findCustomerById(id);
    SetSessionForRowClick(id);
    ViewModelUtilsService.showModalPIX(customer);
  }
  function onTapBoletoPayment(id) {
    var customer = findCustomerById(id);
    SetSessionForRowClick(id);
    ViewModelUtilsService.showModalBoletoPayment(customer);
  }
  function onTapBoleto(id) {
    var customer = findCustomerById(id);
    SetSessionForRowClick(id);
    ViewModelUtilsService.showModalBoleto(customer);
  }
  function onTapDebito(id) {
    var customer = findCustomerById(id);
    SetSessionForRowClick(id);
    ViewModelUtilsService.showModalDebito(customer);
  }
  function onTapCustomer(id, index) {
    var customer = findCustomerById(id);
    SetSessionForRowClick(id);
    ViewModelUtilsService.showModalCustomer(customer, index);
  }
  function importDrCelular() {
    ViewModelUtilsService.showDrCelularImportTemplate();
  }
  function onUnDeleteCustomer(id, nodeId) {
    SetSessionForRowClick(id);
    var r = confirm('Deseja desfazer a exclusão deste cliente?');
    if (r == true) {
      var customer = findCustomerById(id);////
      FoneclubeService.postUnDeleteCustomer(customer).then(function (result) {
        if (result) {
        }
      });
    }
  }
  //var customerIdClicked = [];
  function onDeleteCustomer(id, nodeId) {
    //  if(customerIdClicked.filter(x=>x==id).length > 0){
    // 	return;
    // }
    // customerIdClicked.push(id);
    //var r = confirm('Deseja fazer um soft delete nesse cliente?');
    //if (r == true) {
    var customer = findCustomerById(id);////
    SetSessionForRowClick(id);
    FoneclubeService.postSoftDeleteCustomer(customer).then(function (result) {
      if (result) {
        var index = vm.customers.indexOf(vm.customers.filter(v => v.Id == id)[0]);
        if (index >= 0) {
          vm.customers.splice(index, 1);
          var row = vm.gridOptions.api.getRowNode(nodeId);
          vm.gridOptions.api.updateRowData({ remove: [row.data] });
        }
      }
    });
    //} else {
    //}
  }

  //END: New Functions

  function convertToViewModel(sourceData) {
    var customerDataList = [];
    var date = new Date();
    var dateNowString = date.toISOString().split('T')[0];

    date.setDate(date.getDate() - 30);
    var dateString = date.toISOString().split('T')[0];

    for (var i = 0; i < sourceData.length; i++) {
      var customer = sourceData[i];
      var RCobrado = customer.ammoutIntFormat;
      var customerSelectedCharge = '';
      var Desativo = false;
      var Tipo = '';
      var TipoLink = '';
      var Acao = '';
      var AcaoBool = false;
      var Vencimento = '-'
      var Vigencia = '';
      var Ultimopag = customer.LastPaidDate;
      var Dias2 = diffDays(customer.LastPaidDate);
      var RPago = customer.LastPaidAmount;
      var CustomerName = customer.Name;
      var SumVIP = "OFF";
      var Status2 = '';
      var LineStatus = 2;
      var customerChargeId = '';
      var UltimaCob = '';
      var Dias = 0;
      var Status = '';//customer.descricaoStatus;
      var PaymentStatusColor = '';
      var Verificar1 = '';
      var NextActionDate = '';
      var NextActionText = '';
      var Agendado = '';
      var LastAgendado = '';
      var whatsAppStatus = '';
      var WhatsappImage = '../../content/img/message-red.png';
      if (isNaN(Dias2)) {
        Dias2 = -1;
      }
      ///////////////
      if (customer.fullData.WClient && customer.fullData.WClient.IsRegisteredWithChat2Desk) {
        if (customer.fullData.WClient.ProfilePicUrl) {
          WhatsappImage = customer.fullData.WClient.ProfilePicUrl;
        }
        else {
          WhatsappImage = '../../content/img/message-green.png';
        }
      }

      if (customer.ChargeAndServiceOrderHistory && customer.ChargeAndServiceOrderHistory.Charges) {
        var charge = customer.ChargeAndServiceOrderHistory.Charges;
        //RPago = charge.Ammount;

        var dataCobranca = charge.CreationDate;
        var dataConvertida = new Date(dataCobranca).toISOString().split('T')[0].replace('-', '/').replace('-', '/');
        var mes = dataConvertida.substring(5, 7);
        var ano = dataConvertida.substring(0, 4);

        customer.chargingDate = charge.CreationDate;
        customer.chargingDateDiffDays = diffDays(dataConvertida);
        Status = charge.PaymentStatusDescription;
        Vigencia = charge.MesVingencia != undefined && charge.AnoVingencia != undefined ? renderMonthAndYearDate(new Date(charge.AnoVingencia, charge.MesVingencia, 0)) : '';

        //BEGIN: Set status color
        var charges = customer.ChargeAndServiceOrderHistory.Charges;
        charges.descriptionType = charges.PaymentType == CARTAO ? 'Cartão de crédito' : 'Boleto';
        if (charges.BoletoExpires) {
          var expiryDate = new Date(charges.ExpireDate);
          var expiryDateAfter3 = new Date(charges.ExpireDate);
          expiryDateAfter3.setDate(expiryDateAfter3.getDate() + 3);

          var currentDate = new Date();
          if (charges.PaymentStatusDescription == "Paid") {
            PaymentStatusColor = "green";
          }
          else if (charges.descriptionType == "Boleto" && charges.PaymentStatusDescription == "WaitingPayment" && currentDate <= expiryDate) {
            PaymentStatusColor = "green";
          }
          else if (charges.descriptionType == "Boleto" && charges.PaymentStatusDescription == "WaitingPayment" && currentDate < expiryDateAfter3) {
            PaymentStatusColor = "yellow";
          }
          else if (charges.descriptionType == "Boleto" && charges.PaymentStatusDescription == "WaitingPayment" && currentDate > expiryDateAfter3) {
            PaymentStatusColor = "red";
          }
          else {
            PaymentStatusColor = "grey";
          }

        } else {
          if (charges.PaymentStatusDescription == "Paid") {
            PaymentStatusColor = "green";
          }
          else {
            PaymentStatusColor = "grey";
          }
        }

        charges.PaymentStatusColor = PaymentStatusColor;
        //END
      }

      var selecionado = new Date(vm.year.toString() + '/' + vm.month.toString()).toISOString().split('T')[0].replace('-', '/').replace('-', '/');
      var mesSelecionado = selecionado.substring(5, 7);
      var anoSelecionado = selecionado.substring(0, 4);

      if (mesSelecionado == mes && anoSelecionado == ano) {
        customer.dataIgual = true;
      }
      customer.LastPaidDateDiffDays = diffDays(customer.LastPaidDate);
      UltimaCob = customer.chargingDate ? customer.chargingDate : "";
      ///////////////

      // if (customer.descricaoStatus == '2') { Status = 'NÃO COBRADO'; }
      // if (customer.descricaoStatus == '3') { Status = 'PAGO' };
      // if (customer.descricaoStatus == '4') { Status = 'REFUNDED' };
      // if (customer.descricaoStatus == '5') { Status = 'VENCIDO' };

      // if(customerChargingInfo.PaymentStatusType!=undefined)
      // {
      // 		var venciNextDay = new Date(Vencimento).setDate(new Date(Vencimento).getDate() + 1);
      // 		if(customerChargingInfo.PaymentStatusType != "Paid" &&  venciNextDay < new Date())
      // 		{
      // 			Status2 = "Atrasado"
      // 		}

      // 		else{
      // 			//Status2 = customerChargingInfo.Canceled ? 'Cancelada' : 'Ativa'
      // 				Status2 = customerChargingInfo.PaymentStatusType != undefined ? customerChargingInfo.PaymentStatusType : customerChargingInfo.Canceled ? 'Cancelada' : 'Ativa';
      // 		}
      // }

      if (customer.ChargingValidity == undefined) {
        Status2 = "Nan";
      }
      else {
        Vencimento = customer.ChargingValidity[customer.ChargingValidity.length - 1].DueDate;
        var statusFlag = customer.ChargingValidity[customer.ChargingValidity.length - 1].PaymentStatusType;
        if (statusFlag != "Paid") {
          var dueDate = customer.ChargingValidity[customer.ChargingValidity.length - 1].DueDate;
          if (dueDate != undefined) {
            if (dueDate.split('T')[0] < dateNowString) {
              Status2 = "Atrasado";
            }
            else
              Status2 = statusFlag;
          }
        }
        else {
          if (Status2 == undefined)
            Status2 = "Paid";
          else
            Status2 = statusFlag;
        }
      }

      var last30DaysCharging = customer.ChargingValidity != null ? customer.ChargingValidity.filter(x => x.CreateDate != undefined ? x.CreateDate.split(' ')[0] >= dateString : false) : [];
      var isActive = customer.ChargingValidity != null ? customer.ChargingValidity.filter(x => x.IsActive == true ? true : false) : false;
      if (last30DaysCharging.length == 0 && isActive) {
        Verificar1 = "Atrasado";
      }
      else {
        Verificar1 = "OK";
      }
      NextActionDate = customer.NextActionDate;
      NextActionText = customer.NextActionText;
      Agendado = customer.SchduleCount;
      LastAgendado = customer.LastScheduleDate;

      if (customer.WhatsAppStatus != 0) {
        if (customer.WhatsAppStatus == 1)
          whatsAppStatus = '<img class="imgWhatsappStatus link" src="content/img/whatsApp-Sent.png" />' + ' ' + customer.WhatsAppStatusDate;
        if (customer.WhatsAppStatus == 2)
          whatsAppStatus = '<img class="imgWhatsappStatus link" src="content/img/whatsApp-Delivered.png" />' + ' ' + customer.WhatsAppStatusDate;
        if (customer.WhatsAppStatus == 3)
          whatsAppStatus = '<img class="imgWhatsappStatus link" src="content/img/whatsApp-Read.png" />' + ' ' + customer.WhatsAppStatusDate;
      }

      if (customer.ChargingValidity != undefined) {

        var lastChargingRec = (customer.ChargingValidity.length - 1);
        var customerChargingInfo = customer.ChargingValidity[lastChargingRec];

        customerSelectedCharge = customerChargingInfo;
        customerChargeId = customerChargingInfo.Id;
        if (customerChargingInfo.CreateDate != null && customerChargingInfo.CreateDate != undefined) {
          //UltimaCob = customerChargingInfo.CreateDate;
        }
        if (customerChargingInfo.PaymentType == 1) {
          Tipo = 'CARTÃO';
        }
        else {
          Tipo = 'BOLETO';
          TipoLink = customerChargingInfo.BoletoUrl;
        }
        if (customerChargingInfo.PixCode != undefined && customerChargingInfo.PixCode != null && customerChargingInfo.PixCode != '') {
          Tipo = 'PIX';
        }

        if (customerChargingInfo.Canceled) {
          Acao = 'A';
          AcaoBool = true;
        }
        if (!customerChargingInfo.Canceled) {
          Acao = 'C';
        }
      }

      if (UltimaCob != undefined && UltimaCob != null && UltimaCob != '') { Dias = diffDays(UltimaCob); }

      if (customer.Name == 'Rodrigo Cardozo Pinto') {
        //debugger;

      }
      if (RPago) {
        RPago = parseFloat(RPago / 100);//.toString().replace('.', ',');
      }
      Desativo = customer.Desativo ? true : false;
      LineStatus = customer.fullData.LineStatus;
      SumVIP = customer.fullData.VIPSum;

      customerDataList.push({
        'PaymentStatusColor': PaymentStatusColor,
        'WhatsappImage': WhatsappImage,
        'LineStatus': LineStatus,
        'CustomerName': CustomerName,
        'CustomerId': customer.Id,
        'UltimaCob': UltimaCob,
        'Dias': (Dias == 0 && UltimaCob == '') ? -1 : Dias,
        'RCobrado': RCobrado,
        'Tipo': Tipo,
        'TipoLink': TipoLink,
        'Status': Status,
        'StatusId': customer.descricaoStatus,
        'Status2': Status2,
        'Acao': Acao,
        'AcaoBool': AcaoBool,
        'customerSelectedCharge': customerSelectedCharge,
        'customerChargeId': customerChargeId,
        'Vencimento': Vencimento,
        'Ultimopag': Ultimopag,
        'Dias2': Dias2,
        'RPago': RPago,
        'Vigencia': Vigencia,
        'Verificar1': Verificar1,
        'SumVIP': SumVIP,
        'NextActionDate': NextActionDate,
        'NextActionText': NextActionText,
        "Agendado": Agendado,
        "LastAgendado": LastAgendado,
        "WhatsAppStatus": whatsAppStatus,
        "Desativo": Desativo
      });
    }

    vm.customerViewModel = customerDataList;
    return customerDataList;
  }

  function onPageLoad() {
    var customers = sessionStorage.getItem('customers') == null ? null : LZString.decompress(sessionStorage.getItem('customers'));
    vm.searchText = sessionStorage.getItem('searchTextMain') == null ? "" : sessionStorage.getItem('searchTextMain');
    if (customers == undefined || customers == null || customers == 'none') {
      loadCustomers();
    } else {
      vm.customers = JSON.parse(customers);
      handleData(vm.customers);
      bindAgGrid(vm.customers);
    }
    GetDefaultState();
    var allphonelines = sessionStorage.getItem('allphonelines') == null ? null : LZString.decompress(sessionStorage.getItem('allphonelines'));
    if (allphonelines == undefined || allphonelines == null || allphonelines == 'none') {
      LoadAllPhoneLinesInBackground();
    }
  }

  function LoadAllPhoneLinesInBackground() {
    FoneclubeService.getAllPhoneLinesNew().then(function (data) {
      var str = JSON.stringify(data);
      sessionStorage.setItem('allphonelines', LZString.compress(str));
    });
  }

  function GetDefaultState() {
    FoneclubeService.getAgGridStates("Customers").then(function (result) {
      if (result != null) {
        vm.agGridStates = result.sort((a, b) => (a.txtStateName > b.txtStateName) ? 1 : ((b.txtStateName > a.txtStateName) ? -1 : 0));
        var default1 = result.find(x => x.IsDefault == true);
        if (default1) {
          vm.defaultGridState = default1;
          getAgGridState(default1);
        }
      }
    });
  }

  function loadCustomers() {
    vm.loading = true;

    vm.totalReceivedReady = false;
    hasUpdate = false;
    var ativos = vm.somenteAtivos ? 1 : 0;

    var newflow = true;
    if (newflow) {
      console.time('NewApiCall');
      FoneclubeService.getClientDashboardData(vm.month, vm.year, vm.somenteAtivos ? 1 : 0).then(function (res) {
        console.timeEnd('NewApiCall');
        var data = res[0];
        var result = res[1];

        vm.customers = [];
        for (var i in result) {
          let c = result[i];
          const customer = data.find(d => d.Id == c.Id);
          if (customer) {
            c.fullData = customer;
            // if(customer.Desativo == undefined) {
            //     vm.customers[i].fullData.Desativo = false;
            // }
            c.allChargingsCanceled = false;

            for (var o in c.ChargingValidity) {
              c.ChargingValidity[o].display = true;
            }
            vm.customers.push(c);
          } else {
            //c.fullData = {};
          }
        }
        handleData(vm.customers);
        //var gridData = vm.customers;
        //initDataProperties(gridData);
        bindAgGrid(vm.customers);
        var str = JSON.stringify(vm.customers);
        sessionStorage.setItem('customers', LZString.compress(str));
        filterClientsData();
      });
    }
    else {
      console.time('OldApiCall');
      getAllCustomers(function (data) {
        FoneclubeService.getStatusCharging(vm.month, vm.year, ativos).then(function (result) {
          console.timeEnd('OldApiCall');
          //vm.customers = result;
          vm.customers = [];
          for (var i in result) {
            let c = result[i];
            const customer = data.find(d => d.Id == c.Id);
            if (customer) {
              c.fullData = customer;
              // if(customer.Desativo == undefined) {
              //     vm.customers[i].fullData.Desativo = false;
              // }
              c.allChargingsCanceled = false;

              for (var o in c.ChargingValidity) {
                c.ChargingValidity[o].display = true;
              }
              vm.customers.push(c);
            } else {
              //c.fullData = {};
            }
          }
          handleData(vm.customers);
          //var gridData = vm.customers;
          //initDataProperties(gridData);
          bindAgGrid(vm.customers);
          var str = JSON.stringify(vm.customers);
          sessionStorage.setItem('customers', LZString.compress(str));
        });
      });
    }
  }

  function exportToExcel() {
    $('.k-grid-excel').trigger("click")
  }

  function findCustomerById(id) {

    for (var customer in vm.customers) {
      if (vm.customers[customer].Id == id) {
        return vm.customers[customer].fullData;
      }
    }
  }

  function getAllCustomers(callback) {
    FoneclubeService.getAllCustomers(false).then(function (result) {
      //debugger;
      var customers = result.map(function (user) {
        user.Phones = user.Phones.map(function (phone) {
          if (phone) {
            phone.phoneFull = phone.CountryCode + phone.DDD.concat(phone.Number);
          }
          return phone;
        });
        return user;
      });
      //var customersSemSoftDelete = [];
      for (var i in customers) {
        var customer = customers[i];
        if (!customer.SoftDelete) {
          customer.PhoneDDDParent = null;
          customer.PhoneNumberParent = null;
          for (var j in customer.Phones) {
            if (customer.Phones[j]) {
              if (!customer.Phones[j].IsFoneclube) {
                customer.Phones.splice(j, 1);
              }
            }
          }
          customers[i] = customer;
          //customersSemSoftDelete.push(customer);
        } else {
        }
      }
      if (!vm.filterTextInAllCols)
        customers = customers.filter(x => (x.SoftDelete == null || x.SoftDelete == false));
      callback(customers);
    });
  }

  function handleData(customers) {
    vm.callbackCount = 0;
    vm.totalBoletoCharges = 0;
    vm.totalReceived = 0;
    vm.totalCharged = 0;
    vm.totalCustomers = customers.length;
    vm.totalCustomersCharged = customers.filter(v => v.Charged == true).length;
    vm.totalCustomersNotCharged = customers.filter(v => v.Charged == false).length;

    try {
      vm.totalBoletoCharges = customers[0].TotalBoletoCharges;
    }
    catch (erro) {
      //sem clientes
    }

    for (var index in customers) {

      var customer = customers[index];
      if (customer.Name == '1 Antonia Maria da Silva Barboza') {

      }
      try {
        customer.phone = customer.Phones[0].DDD + customer.Phones[0].Number;
        var operadora = customer.Phones[0].IdOperator == 1 ? 'Claro' : 'Vivo'
        customer.phoneDetail = operadora + ' - ' + customer.Phones[0].PlanDescription;
      }
      catch (erro) { }

      if (customer.Charged) {
        customer.statusType = vm.statusType.CARREGANDO;
        customer.registerPayd = false;
        for (var i in customer.ChargingValidity) {
          var charge = customer.ChargingValidity[i];
          try {
            customer.ChargingValidity[i].BoletoExpires = new Date(customer.ChargingValidity[i].BoletoExpires).toISOString().split('T')[0].replace('-', '/').replace('-', '/');
            customer.boletoExpires = customer.ChargingValidity[i].BoletoExpires;
          }
          catch (erro) { }

          if (charge.PaymentType == 1 && charge.StatusDescription != 'Refunded') {
            customer.ChargingValidity[i].StatusDescription = 'PAGO';
            customer.descricaoStatus = vm.statusType.PAGO;
            customer.descricaoTipo = vm.PagamentosType.CARTAO;
            customer.ammoutIntPaid = parseFloat(customer.ChargingValidity[i].Ammount / 100);
            customer.ammoutPaidFormat = customer.ammoutIntPaid.toString().replace('.', ',');
          }

          if (charge.PaymentType == 2 && charge.BoletoId != 0) {
            customer.descricaoTipo = vm.PagamentosType.BOLETO;
            PagarmeService.getStatusBoletoRecursivo(charge.BoletoId, customer, vm, index, i).then(function (result) {
              if (!result.length) {
                return;
              }
              //result[0].vm.customers[result[0].indexCustomer].ChargingValidity[result[0].indexCharge].descricaoTipo = vm.PagamentosType.BOLETO;
              result[0].vm.customers[result[0].indexCustomer].ChargingValidity[result[0].indexCharge].StatusDescription = 'INVÁLIDO'



              if (result[0].status == "waiting_payment") {
                result[0].vm.customers[result[0].indexCustomer].ammoutIntPaid = 0;
                result[0].vm.customers[result[0].indexCustomer].descricaoStatus = 'PENDENTE';
                result[0].vm.customers[result[0].indexCustomer].ChargingValidity[result[0].indexCharge].StatusDescription = 'PENDENTE'
                if (!result[0].elemento.registerPayd) {
                  result[0].elemento.status = result[0].vm.customers[result[0].indexCustomer].ChargingValidity[result[0].indexCharge].StatusDescription;
                }

                if (!result[0].vm.customers[result[0].indexCustomer].ChargingValidity[result[0].indexCharge].Expired) {
                  result[0].vm.customers[result[0].indexCustomer].descricaoStatus = vm.statusType.COBRADO;
                } else {
                  result[0].vm.customers[result[0].indexCustomer].descricaoStatus = vm.statusType.VENCIDO;
                }
              }
              else if (result[0].status == "paid") {
                result[0].vm.customers[result[0].indexCustomer].ammoutIntPaid = parseFloat(result[0].vm.customers[result[0].indexCustomer].ChargingValidity[result[0].indexCharge].Ammount / 100);
                result[0].vm.customers[result[0].indexCustomer].descricaoStatus = vm.statusType.PAGO;
                result[0].vm.customers[result[0].indexCustomer].ChargingValidity[result[0].indexCharge].StatusDescription = 'PAGO'
                try {

                }
                catch (erro) { }

                result[0].elemento.registerPayd = true;
                result[0].elemento.status = charge.StatusDescription;
                result[0].vm.totalRecebidoBoleto += parseInt(result[0].vm.customers[result[0].indexCustomer].ChargingValidity[result[0].indexCharge].Ammount, 10)
                result[0].vm.totalReceived += parseInt(result[0].vm.customers[result[0].indexCustomer].ChargingValidity[result[0].indexCharge].Ammount, 10)
              }
              else {
                // ;
              }
              charge.StatusDescription = result[0].vm.customers[result[0].indexCustomer].ChargingValidity[result[0].indexCharge].StatusDescription;

              result[0].vm.callbackCount++;

              if (result[0].vm.callbackCount == result[0].vm.totalBoletoCharges) {
                result[0].vm.totalReceived = parseFloat(result[0].vm.totalReceived / 100).toString().replace('.', ',');
                vm.totalReceivedReady = true;
              }
            })
          }

          if (charge.PaymentType == 1 && charge.StatusDescription == 'Refunded') {
            customer.descricaoStatus = vm.statusType.REFUNDED;
            customer.ChargingValidity[i].StatusDescription = 'REFUNDED'
          }

          if (charge.BoletoId == 0 && charge.PaymentType == 2) {
            if (vm.customers[index].ChargingValidity[i].StatusDescription == 'CARREGANDO') {
              vm.customers[index].ChargingValidity[i].StatusDescription = 'INVÁLIDO';
              customer.descricaoStatus = 'INVÁLIDO';
            }

          }
        }

        var chargValInd = customer.ChargingValidity != undefined ? customer.ChargingValidity.length - 1 : 0;

        vm.totalCharged += parseInt(customer.ChargingValidity[chargValInd].Ammount);

        if (customer.ChargingValidity[0].Payd == true) {
          vm.totalReceived += parseInt(customer.ChargingValidity[chargValInd].Ammount)
        }

        customer.ammout = parseFloat(parseInt(customer.ChargingValidity[chargValInd].Ammount) / 100);
        customer.ammoutFormat = customer.ammout.toString().replace('.', ',');
        customer.descricaoCharge = charge.Canceled ? vm.AtivoType.CANCELADA : vm.AtivoType.ATIVA;
        customer.descricaoAcao = charge.Canceled ? vm.AtivoType.CANCELADA : vm.AtivoType.ATIVA;
        customer.ammoutInt = parseFloat(customer.ammout);
        customer.ammoutIntFormat = customer.ammoutInt;//.toString().replace('.', ',');
      }
      else {
        customer.status = 'NÃO COBRADO';
        customer.descricaoStatus = vm.statusType.NAO_COBRADO;
        customer.ammoutInt = 0;
        customer.ammoutIntPaid = 0;
      }
    }
    vm.totalCharged = parseFloat(vm.totalCharged / 100).toString().replace('.', ',');

  }

  var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  var secondDate = new Date();

  function diffDays(date) {
    var firstDate = new Date(date);
    return Math.floor(Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay)));
  }

  vm.onDesativarBoleto = onDesativarBoleto;
  vm.onAtivarBoleto = onAtivarBoleto;

  function onDesativarBoleto(chargeId) {
    DialogFactory.dialogConfirm({ mensagem: 'Tem certeza que seja cancelar essa cobrança?' })
      .then(function (value) {
        if (value) {
          FoneclubeService.postChargingUpdate(chargeId, true)
            .then(function (value) {
              if (value) {
                charge.Canceled = true;
              }
            })
        }
      })
  }

  function onAtivarBoleto(chargeId) {
    DialogFactory.dialogConfirm({ mensagem: 'Tem certeza que seja ativar essa cobrança?' })
      .then(function (value) {
        if (value) {
          FoneclubeService.postChargingUpdate(chargeId, false)
            .then(function (value) {
              if (value) {
                charge.Canceled = false;
              }
            })
        }
      })
  }
  function refreshPage() {
    // sessionStorage.setItem('customers', LZString.compress('none'));
    loadCustomers()
    loading = true
    // location.reload();
  }

  function renderDate(value) {
    if (value != '' && value && value != '-') {
      var str = new Date(value);
      str = str.toLocaleDateString('en-us', { month: 'short', day: '2-digit', year: 'numeric' });
      return '<div>' + str + '</div>';
    }
    return '<div></div>';
  }

  function renderMonthAndYearDate(value) {
    if (value != '' && value && value != '-') {
      var str = new Date(value);
      str = str.toLocaleDateString('en-us', { month: 'short', year: 'numeric' }).replace(' ', ', ');
      return '<div>' + str + '</div>';
    }
    return '<div></div>';
  }

  function onClipBoardSuccess(event) {
    //debugger;
    vm.clipBoardCopiedText = event.text;
  }

  function pasteCliboardText(event) {
    //debugger;
    vm.searchText = vm.clipBoardCopiedText;
    var $activeElement = angular.element(document.getElementById('filterCustomers'));
    $activeElement.attr('focused', 'yes'); // Example usage
  }

  function checkRepeatOrder(customerId) {
    vm.loading = true;
    FoneclubeService.getChargeAndServiceOrderHistory(customerId).then(function (result) {

      //debugger;
      var customer = findCustomerById(customerId);
      if (result != undefined && result[0] != undefined && result[0].Charges != undefined) {
        if (result[0].Charges.PaymentType == PIX && result[0].Charges.PixCode != undefined) {

          ViewModelUtilsService.showModalPIX(customer);
        }
        else if (result[0].Charges.PaymentType == BOLETO) {
          ViewModelUtilsService.showModalBoleto(customer);
        }
        else if (result[0].Charges.PaymentType == CARTAO) {
          var custId = "";
          var cardId = result[0].Charges.TransactionComment;
          if (!customer.IdPagarme) {
            custId = customer.DocumentNumber;
            PagarmeService.getCustomer(custId)
              .then(function (result) {
                try {
                  var pagarmeID = result[0].id;
                  PagarmeService.getCard(pagarmeID)
                    .then(function (result) {
                      var cardsResult = result.sort(function (a, b) {
                        return new Date(b.date_updated) > new Date(a.date_updated) ? 1 : -1;
                      });
                      var lastCard = cardsResult.find(x => x.id == cardId);
                      if (lastCard) {
                        ViewModelUtilsService.showModalExistentCardPayment(customer, lastCard);
                      }
                      else
                        ViewModelUtilsService.showModalNewCardPayment(customer);
                    })
                    .catch(function (error) {
                      ViewModelUtilsService.showModalNewCardPayment(customer);
                    });
                } catch (erro) {
                  ViewModelUtilsService.showModalNewCardPayment(customer);
                }
              })
              .catch(function (error) {
                ViewModelUtilsService.showModalNewCardPayment(customer);
              });
          }
          else {
            custId = customer.IdPagarme;

            PagarmeService.getCard(custId)
              .then(function (result) {
                var cardsResult = result.sort(function (a, b) {
                  return new Date(b.date_updated) > new Date(a.date_updated) ? 1 : -1;
                });
                var lastCard = cardsResult.find(x => x.id == cardId);
                if (lastCard) {
                  ViewModelUtilsService.showModalExistentCardPayment(customer, lastCard);
                }
                else
                  ViewModelUtilsService.showModalNewCardPayment(customer);
              })
              .catch(function (error) {
                ViewModelUtilsService.showModalNewCardPayment(customer);
              });
          }

        }
      }
      vm.loading = false;
    });
  }

  function testWhatsApp() {
    var dataMessage = {
      ClientIds: "5521982008200,5521981908190",
      Message: vm.searchText.replace(/\|/g, '')
    };

    FoneclubeService.postSendWhatsAppMessageNew(dataMessage).then(function (result) {
      if (result == true)
        alert("Message sent successfully");
      else
        alert("Error occured while sending message");
    });
  }


  function saveState() {
    var retVal = prompt("Enter save state name : ", "state name here");
    var saveStateData = {
      intId: -1,
      txtStateName: retVal,
      txtAgidName: 'Customers',
      txtColumnState: JSON.stringify(vm.gridOptions.columnApi.getColumnState()),
      txtFilterModel: JSON.stringify(vm.gridOptions.api.getFilterModel()),
      txtSortModel: JSON.stringify(vm.gridOptions.api.getSortModel())
    }
    if (retVal != "null" && retVal != null) {
      FoneclubeService.saveAgGridState(saveStateData).then(function (result) {
        alert('Saved successfully')
      });
    }
  }

  function updateState() {
    var retVal = prompt("Enter save state name to update: ", vm.defaultGridState.txtStateName);
    var saveStateData = {
      intId: vm.defaultGridState.intId,
      txtStateName: retVal,
      txtAgidName: 'Customers',
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
          txtAgidName: 'Customers'
        }
        FoneclubeService.deleteAgGridState(deleteStateData).then(function (result) {
          alert('Deleted successfully')
        });
      }
    });
  }

  function BlockUnlockLine(value, custId, nodeId) {
    var custName = vm.customers.find(x => x.Id == custId).Name;
    if (value == "A") {
      DialogFactory.dialogConfirm({ titulo: 'Bloqueio de linhas', mensagem: '<span>Deseja bloquear <strong>TODAS</strong> as linhas do ' + custName + '</span>', btn1: 'SIM', btn2: 'Temporariamente' })
        .then(function (result) {
          if (!result) {
            DialogFactory.dialogConfirm({ titulo: 'Bloqueio de linhas', mensagem: 'Tem Certeza', btn1: 'SIM', btn2: 'NÃO' })
              .then(function (result) {
                var showLoader = DialogFactory.showLoader("Um momento estamos desbloqueando as linhas.");
                if (!result) {
                  var data = {
                    PersonId: custId
                  }
                  FoneclubeService.permanentBlockLineForCustomer(data).then(function (result) {
                    if (result != null) {
                      showLoader.close();
                      var resDisplay = "";
                      for (var ir = 0; ir < result.length; ir++) {
                        resDisplay += "Linha: " + result[ir].Linha + " Status: " + result[ir].BlockLineResponse.status + " Mensagem: " + result[ir].BlockLineResponse.mensagem + "<br/>";
                      }

                      ViewModelUtilsService.showConfirmDialog('Success!', resDisplay).then(function (confirm) {
                        if (confirm) {

                          let row = vm.gridOptions.api.getRowNode(nodeId);
                          var index = vm.customers.indexOf(vm.customers.filter(v => v.Id == custId)[0]);
                          if (index >= 0) {
                            vm.customers[index].fullData.LineStatus = 2;
                            vm.gridOptions.api.redrawRows({ rowNodes: [row] });
                          }
                          var str = JSON.stringify(vm.customers);
                          sessionStorage.setItem('customers', LZString.compress(str));
                          bindAgGrid(vm.customers);
                          GetDefaultState();

                          var resDisplay = "";

                          sessionStorage.setItem('lastClickedRowClient', custId);
                          UpdateLastSelected();
                        }
                        else {
                          showLoader.close();
                        }
                      });
                    }
                    else {
                      showLoader.close();
                      DialogFactory.showMessageDialog({ mensagem: 'Error occured: ' + result });
                    }
                  });
                }
              });
          }
          else {

          }
        });
    }
    else if (value == "B") {
      DialogFactory.dialogConfirm({ titulo: 'Desbloquear linhas', mensagem: '<span>Deseja desbloquear todas as linhas para ' + custName + '</span>', btn1: 'SIM', btn2: 'Temporariamente' })
        .then(function (result) {
          if (!result) {
            var showLoader = DialogFactory.showLoader("Um momento estamos desbloqueando as linhas.");
            var data = {
              PersonId: custId
            }
            FoneclubeService.permanentUnBlockLineForCustomer(data).then(function (result) {
              if (result != null) {
                var resDisplay = "";
                showLoader.close();
                for (var ir = 0; ir < result.length; ir++) {
                  resDisplay += "Linha: " + result[ir].Linha + " Status: " + result[ir].BlockLineResponse.status + " Mensagem: " + result[ir].BlockLineResponse.mensagem + "<br/>";
                }

                ViewModelUtilsService.showConfirmDialog('Success!', resDisplay).then(function (confirm) {
                  if (confirm) {
                    let row = vm.gridOptions.api.getRowNode(nodeId);
                    var index = vm.customers.indexOf(vm.customers.filter(v => v.Id == custId)[0]);
                    if (index >= 0) {
                      vm.customers[index].fullData.LineStatus = 1;
                      vm.gridOptions.api.redrawRows({ rowNodes: [row] });
                    }
                    var str = JSON.stringify(vm.customers);
                    sessionStorage.setItem('customers', LZString.compress(str));
                    bindAgGrid(vm.customers);
                    GetDefaultState();
                    sessionStorage.setItem('lastClickedRowClient', custId);
                    UpdateLastSelected();
                  }
                  else {
                    showLoader.close();
                  }
                });
              }
              else {
                DialogFactory.showMessageDialog({ mensagem: 'Error occured: ' + result });
              }
            });
          }
          else {

          }
        });
    }
    else {
      alert('Selected customer does not have any contel lines')
    }
  }

  function UpdateLastSelected() {
    let IDofRowToSelect = parseInt(sessionStorage.getItem('lastClickedRowClient'));
    if (IDofRowToSelect != null && vm.gridOptions.api != null) {
      vm.gridOptions.api.forEachNode((node) => {
        node.setSelected(node.data.CustomerId == IDofRowToSelect);
        if (node.data.CustomerId == IDofRowToSelect) {
          vm.gridOptions.api.ensureIndexVisible(node.rowIndex, 'middle');
        }
      });
    }
  }

  function getAgGridState(stateName) {
    var res = vm.agGridStates.find(x => x.txtStateName == vm.defaultGridState.txtStateName);
    if (res != null && res.txtFilterModel != undefined && res.txtColumnState != undefined) {
      vm.gridOptions.api.setFilterModel(JSON.parse(res.txtFilterModel));
      vm.gridOptions.columnApi.setColumnState(JSON.parse(res.txtColumnState));
      vm.gridOptions.api.setSortModel(JSON.parse(res.txtSortModel));
    }

    var saveStateData = {
      intId: vm.defaultGridState.intId,
      txtAgidName: 'Customers',
    }
    FoneclubeService.updateDefaultGridState(saveStateData).then(function (result) {
    });
  }

  function PersonComponent() {
  }


  PersonComponent.prototype.init = function (params) {
    this.valueGetter = params.valueGetter;
    this.filterText = null;
    this.setupGui(params);
  }

  // not called by AG Grid, just for us to help setup
  PersonComponent.prototype.setupGui = function (params) {
    this.gui = document.createElement('div');
    this.gui.innerHTML = `<div style="padding: 4px; width: 200px;">
					<div style="font-weight: bold;">Name Filter</div>
					<div>
						<input style="margin: 4px 0 4px 0;" type="text" id="filterText" placeholder="Enter Name"/>
					</div>
				</div>
			`;

    const listener = (event) => {
      this.filterText = event.target.value;
      params.filterChangedCallback();
    };

    this.eFilterText = this.gui.querySelector('#filterText');
    this.eFilterText.addEventListener('changed', listener);
    this.eFilterText.addEventListener('paste', listener);
    this.eFilterText.addEventListener('input', listener);
    // IE doesn't fire changed for special keys (eg delete, backspace), so need to
    // listen for this further ones
    this.eFilterText.addEventListener('keydown', listener);
    this.eFilterText.addEventListener('keyup', listener);
  }

  PersonComponent.prototype.getGui = function () {
    return this.gui;
  }

  PersonComponent.prototype.doesFilterPass = function (params) {
    // make sure each word passes separately, ie search for firstname, lastname
    let passed = true;
    this.filterText
      .toLowerCase()
      .split(' ')
      .forEach((filterWord) => {
        const value = this.valueGetter(params);

        if (value.toString().toLowerCase().indexOf(filterWord) < 0) {
          passed = false;
        }
      });

    return passed;
  }

  PersonComponent.prototype.isFilterActive = function () {
    return this.filterText != null && this.filterText !== '';
  }

  PersonComponent.prototype.getModel = function () {
    return { value: this.filterText.value };
  }

  PersonComponent.prototype.setModel = function (model) {
    this.eFilterText.value = model.value;
  }


  function CustomDateComponent() {
  }

  CustomDateComponent.prototype.init = function (params) {
    const template = `
           <input type="text" data-input style="width: 100%;" />
           <a class="input-button" title="clear" data-clear>
               <i class="fa fa-times"></i>
           </a>`;

    this.params = params;

    this.eGui = document.createElement('div');
    this.eGui.setAttribute('role', 'presentation');
    this.eGui.classList.add('ag-input-wrapper');
    this.eGui.classList.add('custom-date-filter');
    this.eGui.innerHTML = template;

    this.eInput = this.eGui.querySelector('input');

    this.picker = flatpickr(this.eGui, {
      onChange: this.onDateChanged.bind(this),
      dateFormat: 'd/m/Y',
      wrap: true
    });

    this.picker.calendarContainer.classList.add('ag-custom-component-popup');

    if (params.data.NextActionDate != undefined) {
      this.setDate(new Date(params.data.NextActionDate));
    }
    else
      this.date = null;
  }

  CustomDateComponent.prototype.getGui = function () {
    return this.eGui;
  }

  CustomDateComponent.prototype.onDateChanged = function (selectedDates) {
    this.date = selectedDates[0] || null;
    this.params.data.NextActionDate = this.date;
  }

  CustomDateComponent.prototype.getDate = function () {
    return this.date;
  }

  CustomDateComponent.prototype.setDate = function (date) {
    this.picker.setDate(date);
    this.date = date;
  }

  CustomDateComponent.prototype.setInputPlaceholder = function (placeholder) {
    this.eInput.setAttribute('placeholder', placeholder);
  }

};


StatusChargingController.$inject = ['$interval', 'FoneclubeService', 'PagarmeService', 'FlowManagerService', '$filter', 'ViewModelUtilsService', 'DialogFactory', 'UtilsService'];
