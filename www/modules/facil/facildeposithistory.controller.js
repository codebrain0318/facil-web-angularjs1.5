(function () {
  'use strict';

  angular.module('foneClub').controller('FacilDepositHistoryController', FacilDepositHistoryController);

  FacilDepositHistoryController.inject = ['ViewModelUtilsService',
    'FoneclubeService',
    'DialogFactory',
    'UtilsService',
    '$stateParams', '$filter'];

  function FacilDepositHistoryController(ViewModelUtilsService,
    FoneclubeService,
    DialogFactory,
    UtilsService,
    $stateParams, $filter) {
    var vm = this;

    vm.history = ViewModelUtilsService.modalData;
    vm.gridWidth = ($(window).width() - 20) + "px";
    vm.gridHeight = 300;

    vm.gridOptions = {
      columnDefs: [
        {
          field: 'Date', headerName: 'DATA', width: 200, filterParams: filterDateParams, comparator: DateComparatorHistory, filter: "agDateColumnFilter",
          cellRenderer: function (params) {
              return moment(params.data.Date).format("DD MMM YYYY HH:mm:ss");
          }
        },
        { field: 'ClientName', headerName: 'Cliente Nome', width: 150 },
        { field: 'USDAmount', headerName: 'USD Amount', width: 100 },
        { field: 'HandlingCharge', headerName: 'Handling Charge', width: 100 },
        { field: 'FinalAmount', headerName: 'Final Amount', width: 100 },
        { field: 'Source', headerName: 'Source', width: 200 },
        { field: 'IsRefund', headerName: 'Is Refund?', width: 100 },
        { field: 'Comment', headerName: 'Comment', width: 250 }
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
      onGridReady: function (params) {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        bindAgGrid(vm.history);
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
          'Date': datamodel.Date,
          'ClientName': datamodel.ClientName,
          'FinalAmount': datamodel.FinalAmount,
          'USDAmount': datamodel.USDAmount,
          'HandlingCharge':datamodel.HandlingCharge,
          'IsRefund':datamodel.IsRefund,
          'Source': datamodel.Source,
          'Comment' : datamodel.Comment
        });
      }
      return templateDataList;
    }

    init();


    function init() {
      
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
  }
})();
