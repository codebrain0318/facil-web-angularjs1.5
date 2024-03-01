(function () {
  'use strict';

  angular.module('foneClub').controller('TopupHistoryModalController', TopupHistoryModalController);

  TopupHistoryModalController.inject = ['ViewModelUtilsService',
    'FoneclubeService',
    'DialogFactory',
    'UtilsService',
    '$stateParams', '$filter'];

  function TopupHistoryModalController(ViewModelUtilsService,
    FoneclubeService,
    DialogFactory,
    UtilsService,
    $stateParams, $filter) {
    var vm = this;
    vm.getSaldo = getSaldo;
    vm.OpenChargeHistory = OpenChargeHistory;
    vm.OpenWhatsApp = OpenWhatsApp;
    vm.showAllCheck = showAllCheck;

    vm.personName = "";
    vm.currentSaldo = 0;
    vm.personCPF = "";
    vm.personTitle = "";
    vm.personDoc = "";
    vm.contelLine = {};
    vm.blockedColor = false;
    vm.fimColor = false;
    vm.cancelColor = false;
    vm.history = {};
    vm.history1 = {};
    vm.gridWidth = ($(window).width() - 20) + "px";
    vm.gridHeight = 300;
    vm.selectedLine = ViewModelUtilsService.modalData;
    vm.showAll = false;




    vm.gridOptions = {
      columnDefs: [
        {
          field: 'DataRecarga', headerName: 'DATA RECARGA', width: 200, filterParams: filterDateParams, comparator: DateComparatorHistory, filter: "agDateColumnFilter",
          cellRenderer: function (params) {
            return new Date(params.value).toLocaleDateString('pt-Br', { day: '2-digit', month: 'short', year: "numeric" });
          }
        },
        { field: 'Plano', headerName: 'PLANO', width: 200 },
        { field: 'FormaPagto', headerName: 'FORMA PAGAMENTO', width: 250 },
        { field: 'Solicitante', headerName: 'Solicitante', width: 250 }
      ],
      defaultColDef: {
        //flex: 1,
        sortable: true,
        filter: true,
        resizable: true
      },
      singleClickEdit: true,
      enableCellTextSelection: true,
      autoSizeColumns: true,
      rowHeight: 30,
      headerHeight: 120,
      onCellClicked: onCellClicked,
      onGridReady: function (params) {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        bindAgGrid(vm.history);
      }
    }




    vm.gridOptions1 = {
      columnDefs: [
        {
          field: 'DeductedDate', headerName: 'DATA', width: 200,
          filterParams: filterDateParams, comparator: DateComparatorHistory, filter: "agDateColumnFilter",

        },
        { field: 'Category', headerName: 'Categoria', width: 200 },
        { field: 'AmountDeducted', headerName: 'VALOR', width: 250 },
        { field: 'Phone', headerName: 'Linha', width: 250 },
        { field: 'Plan', headerName: 'Plano', width: 250 }
      ],
      defaultColDef: {
        //flex: 1,
        sortable: true,
        filter: true,
        resizable: true
      },
      singleClickEdit: true,
      enableCellTextSelection: true,
      autoSizeColumns: true,
      rowHeight: 30,
      headerHeight: 120,
      onCellClicked: onCellClicked,
      onGridReady: function (params) {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        bindAgGrid1(vm.history1);
      }
    }

    function bindAgGrid(data) {
      var rowData = convertToViewModel(data);
      if (vm.gridOptions.api) {
        vm.gridOptions.api.setRowData(rowData);
      }
    }

    function convertToViewModel(data) {
      var templateDataList = [];
      for (var i = 0; i < data.length; i++) {
        var datamodel = data[i];
        templateDataList.push({
          'DataRecarga': datamodel.data_recarga,
          'Plano': datamodel.plano,
          'FormaPagto': datamodel.formaPagto,
          'Solicitante': datamodel.solicitado_por
        });
      }
      return templateDataList;
    }

    function bindAgGrid1(data) {
      FoneclubeService.getMMHistory().then(function (result) {
        if (result.Status) {
          vm.currentSaldo = result.Saldo;
          var rowData = convertToViewModel1(result.History);
          if (vm.gridOptions1.api) {
            vm.gridOptions1.api.setRowData(rowData);
          }
        }
      });
    }

    function convertToViewModel1(data) {
      var templateDataList = [];
      for (var i = 0; i < data.length; i++) {
        var datamodel = data[i];
        templateDataList.push({
          'AmountDeducted': datamodel.AmountDeducted,
          'Category': datamodel.Category,
          'DeductedDate': datamodel.DeductedDate,
          'Phone': datamodel.Phone,
          'Plan': datamodel.Plan
        });
      }
      return templateDataList;
    }
    init();


    function init() {
      vm.personName = vm.selectedLine.Person.Name;
      vm.personCPF = vm.selectedLine.Person.DocumentNumber;
      if (vm.selectedLine.ContelLineData != null) {
        vm.selectedLine.ContelLineData.data_ativacao = vm.selectedLine.ContelLineData.data_ativacao == null ? "-" : moment(vm.selectedLine.ContelLineData.data_ativacao, "YY.MM.DD 00:00:00").format("YYYY.MM.DD 00:00:00");
        vm.selectedLine.ContelLineData.bloqueada = vm.selectedLine.ContelLineData.bloqueada != null && vm.selectedLine.ContelLineData.bloqueada.length > 10 ? moment(vm.selectedLine.ContelLineData.bloqueada, "YY.MM.DD 00:00:00").toDate().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: "numeric" }) : vm.selectedLine.ContelLineData.bloqueada;
        vm.selectedLine.ContelLineData.data_renovacao = vm.selectedLine.ContelLineData.data_renovacao == null ? "-" : moment(vm.selectedLine.ContelLineData.data_renovacao, "DD/MM/YYYY").format("YY.MM.DD 00:00:00")
        vm.selectedLine.ContelLineData.data_cancelamento_linha = vm.selectedLine.ContelLineData.data_cancelamento_linha == null ? "-" : moment(vm.selectedLine.ContelLineData.data_cancelamento_linha, "YY.MM.DD 00:00:00").format("YY.MM.DD 00:00:00");
        vm.selectedLine.ContelLineData.data_fim_plano = vm.selectedLine.ContelLineData.data_fim_plano == null ? "-" : moment(vm.selectedLine.ContelLineData.data_fim_plano, "YY.MM.DD 00:00:00").format("YY.MM.DD 00:00:00");
        vm.contelLine = vm.selectedLine.ContelLineData;
        vm.personTitle = vm.selectedLine.ContelLineData.titular;
        vm.personDoc = vm.selectedLine.ContelLineData.documento_titular;
        vm.blockedColor = vm.selectedLine.ContelLineData.bloqueada != null && vm.selectedLine.ContelLineData.bloqueada.length > 10 ? true : false;
        var fimdate = vm.selectedLine.ContelLineData.data_fim_plano != null ? moment(vm.selectedLine.ContelLineData.data_fim_plano) : null;
        var canceldate = vm.selectedLine.ContelLineData.data_cancelamento_linha != null ? moment(vm.selectedLine.ContelLineData.data_cancelamento_linha, "YY.MM.DD 00:00:00") : null;

        vm.fimColor = fimdate != null ? fimdate.diff(moment(new Date(), "DD/MM/YYYY"), 'days') <= 5 ? true : false : false;
        vm.cancelColor = canceldate != null ? canceldate.diff(moment(new Date(), "DD/MM/YYYY"), 'days') <= 30 ? true : false : false;

      }
      if (vm.selectedLine.TopUpHistoryData != null && vm.selectedLine.TopUpHistoryData.historico != null && vm.selectedLine.TopUpHistoryData.historico.length > 0) {
        vm.history = vm.selectedLine.TopUpHistoryData.historico;
      }
      else {
        vm.history = [];
      }
    }

    function onCellClicked(params) {
      UtilsService.clipBoardCopy(params.value);
    }

    function getSaldo(data) {
      if (data == undefined)
        return "";
      return parseFloat(data / 1024).toFixed(1)
    }

    function OpenChargeHistory(cpf) {
      vm.showAlert = DialogFactory.showLoader("Por favor, aguarde...");
      FoneclubeService.getCustomerByCPF(cpf).then(function (result) {
        vm.showAlert.close();
        ViewModelUtilsService.showModalCustomer(result);
      });
    }

    function OpenWhatsApp(cpf) {
      vm.showAlert = DialogFactory.showLoader("Por favor, aguarde...");
      FoneclubeService.getCustomerByCPF(cpf).then(function (result) {
        vm.showAlert.close();
        ViewModelUtilsService.showModalReport(result);
      });
    }

    function DateComparatorHistory(valueA, valueB) {
      var defDate = new Date(1900, 0o1, 0o1);
      valueA = valueA == "" ? defDate : new Date(valueA);
      valueB = valueB == "" ? defDate : new Date(valueB);
      if (valueA == valueB) {
        return 0;
      }
      return valueA > valueB ? 1 : -1;
    }

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
        "lessThan",
        {
          displayKey: "lessThanWithNulls",
          displayName: "Less Than with Nulls",
          predicate: ([filterValue], cellValue) =>
            cellValue == null || cellValue < filterValue,
        },
        "greaterThan",
        {
          displayKey: "greaterThanWithNulls",
          displayName: "Greater Than with Nulls",
          predicate: ([filterValue], cellValue) =>
            cellValue == null || cellValue > filterValue,
        },
        {
          displayKey: "betweenExclusive",
          displayName: "Between (Exclusive)",
          predicate: ([fv1, fv2], cellValue) =>
            cellValue == null || (fv1 < cellValue && fv2 > cellValue),
          numberOfInputs: 2,
        },
      ],
    };


    function showAllCheck() {

    }
  }
})();
