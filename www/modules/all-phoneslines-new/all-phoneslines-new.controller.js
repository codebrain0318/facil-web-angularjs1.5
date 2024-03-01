angular
  .module("foneClub")
  .controller("AllPhoneLinesNewController", AllPhoneLinesNewController);

function AllPhoneLinesNewController(
  $scope,
  $interval,
  FoneclubeService,
  DialogFactory,
  UtilsService,
  ViewModelUtilsService,
  FlowManagerService,
  SessionStorageUtilsService
) {
  var vm = this;
  vm.isMobile = UtilsService.mobileCheck();
  vm.agGridStates = ["All"];
  vm.plans = [];
  vm.plansAll = [];
  vm.month = new Date().getMonth() + 1;
  vm.year = new Date().getFullYear();
  vm.defaultGridState = {};
  vm.onQuickFilterChanged = onQuickFilterChanged;
  vm.clearFilter = clearFilter;
  vm.openChargeSummary = openChargeSummary;
  vm.openWhatsApp = openWhatsApp;
  vm.exportToExcel = exportToExcel;
  vm.getAgGridState = getAgGridState;
  vm.saveState = saveState;
  vm.deleteState = deleteState;
  vm.updateState = updateState;
  vm.refreshPage = refreshPage;
  vm.openTopupPopup = openTopupPopup;
  vm.openTopupHistory = openTopupHistory;
  vm.onClipBoardSuccess = onClipBoardSuccess;
  vm.pasteCliboardText = pasteCliboardText;
  vm.BlockUnlockLine = BlockUnlockLine;
  vm.addNewLine = addNewLine;
  vm.addContelLineManually = addContelLineManually;
  vm.importContelTopupHistory = importContelTopupHistory;
  vm.onlyActive = onlyActive;
  vm.toggleModal = toggleModal;
  vm.ResetESIM = ResetESIM;
  vm.isOpen = false;
  vm.loading = true;
  vm.clipBoardCopiedText = "";
  vm.isLoading = false
  vm.filterText = "";
  vm.gridWidth = mobileCheck() ? $(window).width() - 20 + "px" : "100%";
  vm.gridHeight = $(window).height() - 100;

  const customNumberComparator = (valueA, valueB) => {
    valueA = valueA != null ? valueA.toString() : null;
    valueB = valueB != null ? valueB.toString() : null;
    valueA =
      valueA == null || valueA == "" || valueA == "OFF"
        ? "-1"
        : valueA
          .replace(" GB", "")
          .replace(" gb", "")
          .replace(",", "")
          .replace("R$", "");
    valueB =
      valueB == null || valueB == "" || valueB == "OFF"
        ? "-1"
        : valueB
          .replace(" GB", "")
          .replace(" gb", "")
          .replace(",", "")
          .replace("R$", "");
    if (parseInt(valueA) == parseInt(valueB)) return 0;
    return parseInt(valueA) > parseInt(valueB) ? 1 : -1;
    FoneClube.Business.Commons.dll;
    FoneClube.WebAPI.dll;
    FoneClube.DataAccess.dll;
  };

  const filterParamsNumber = {
    filterOptions: [
      {
        displayKey: "largerThan",
        displayName: "Larger than",
        test: function (filterValue, cellValue) {
          cellValue =
            cellValue != null
              ? cellValue
                .replace(" GB", "")
                .replace(" gb", "")
                .replace("R$", "")
                .replace("OFF", "")
              : "-1";
          return parseInt(cellValue) > parseInt(filterValue);
        },
      },
      {
        displayKey: "smallerThan",
        displayName: "Smaller than",
        test: function (filterValue, cellValue) {
          cellValue =
            cellValue != null
              ? cellValue
                .replace(" GB", "")
                .replace(" gb", "")
                .replace("R$", "")
                .replace("OFF", "")
              : "-1";
          return parseInt(cellValue) < parseInt(filterValue);
        },
      },
      "equals",
      "notEqual",
    ],
  };
  // const filterOptions = [
  //   'empty',
  //   {
  //       displayKey: 'blanks',
  //       displayName: 'Blanks',
  //       filterParams: {
  //           suppressAndOrCondition: true
  //         },
  //       test: function (filterValue, cellValue) {
  //           return cellValue == "";
  //       },
  //       hideFilterInput: true,
  //   },
  //   'equals',
  //   'notEqual',
  //   'lessThan',
  //   'lessThanOrEqual',
  //   'greaterThan',
  //   'greaterThanOrEqual',
  //   'inRange'
  // ];
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

  vm.gridOptions = {
    columnDefs: [
      //rowGroup: true,
      { field: "Id", hide: true },
      // { field: 'IsContelLine', headerName: 'Contel',  width: 80 ,
      //   cellRenderer: function (params) {
      //     if(params.value){
      // 			var cellHtml ='<div class="circle_green"></div>';
      // 			return cellHtml;
      // 		}
      //     else{
      // 			var cellHtml ='<div class="circle_red"></div>';
      // 			return cellHtml;
      //     }
      //   },
      //   filterParams: {
      //     suppressAndOrCondition: true
      //   }
      // },
      {
        field: "TopUpHistory",
        headerName: "Top Up History",
        width: 80,
        cellRenderer: function (params) {
          var cellHtml =
            '<a ng-click="vm.openTopupPopup(' +
            params.node.data.PhoneNumber +
            ')" ><img class="imgWhatsapp link" style="max-width:20px;margin:10px 5px" src="content/img/topup-history.png" /></a>';
          return cellHtml;
        },
      },
      {
        headerName: 'Reset',
        field: '',
        cellRenderer: function (params) {
          var cellHtml =
            '<a ng-click="vm.ResetESIM(' +
            params.node.data.PhoneNumber +
            ')" >Reset</a>';
          return cellHtml;
        },
      },
      {
        field: "TopUp",
        headerName: "Top Up",
        width: 80,
        cellRenderer: function (params) {
          var cellHtml =
            '<a ng-click="vm.openTopupPopup(' +
            params.node.data.PhoneNumber +
            ')" ><img class="imgWhatsapp link" style="max-width:20px;margin:10px 5px" src="content/img/topup.png" /></a>';
          return cellHtml;
        },
      },
      {
        field: "Ativa",
        width: 80,
        headerName: "Linha",
        //headerCheckboxSelection: true,
        //headerCheckboxSelectionFilteredOnly: true,
        //checkboxSelection: true,
        cellRenderer: function (params) {
          var cellHtml =
            '<a ng-click="" ><img class="imgWhatsapp link" style="max-width:15px;margin:10px 5px" src="content/img/' +
            (params.value == "T" ? "customeron.png" : "customeroff.png") +
            '" /></a>';
          return cellHtml;
        },
        editable: false,
        filterParams: {
          suppressAndOrCondition: true,
        },
        //filter: false
      },
      {
        field: "PhoneNumber",
        headerName: "Linha",
        width: 160,
        filterParams: filterParamsNumber,
      },
      {
        field: "DteRegistered",
        headerName: "Registro",
        width: 100,
        cellRenderer: function (params) {
           return moment(params.value).format("DD MMM YYYY");
        },
        filter: "agDateColumnFilter",
        filterParams: filterDateParams,
        comparator: DateComparator,
      },
      { field: "PortNumber", headerName: "Port/Line", width: 120 },
      {
        field: "Plano_Contel",
        headerName: "P. Contel",
        width: 100,
        filterParams: filterParamsNumber,
        comparator: customNumberComparator,
      },
      {
        field: "Saldo",
        headerName: "Saldo GB",
        width: 80,
        filterParams: filterParamsNumber,
        cellRenderer: function (params) {
          if (params.value != null) {
            return params.value == null
              ? ""
              : params.value.replace(" GB", "").replace(" gb", "");
          }
        },
        comparator: customNumberComparator,
      },
      {
        field: "FimPlano",
        headerName: "Fim Plano",
        width: 80,
        filter: "agDateColumnFilter",
        filterParams: filterDateParams,
        comparator: DateComparator,
      },
      {
        field: "Recarga_Automatica",
        headerName: "Auto Contel",
        width: 80,
        cellRenderer: function (params) {
          if (params.value != null) {
            var cellHtml =
              '<a ng-click="" ><img class="imgWhatsapp link" style="max-width:15px;margin:10px" src="content/img/' +
              (params.value == 0 ? "customeroff.png" : "customeron.png") +
              '" /></a>';
            return cellHtml;
          }
        },
      },
      {
        field: "Cancelation_Date",
        headerName: "Perde Numero",
        width: 100,
        filter: "agDateColumnFilter",
        filterParams: filterDateParams,
        comparator: DateComparator,
        cellStyle: function (params) {
          var dataAtual = new Date();
          var dataFimPlano = new Date(params.value);
          var diffEmDias = Math.floor(
            (dataFimPlano - dataAtual) / (1000 * 60 * 60 * 24)
          );

          if (diffEmDias <= 10 && diffEmDias >= 0) {
            return { "font-weight": "bold", color: "red" };
          }
          return null;
        },
      },
      {
        field: "Ativacao",
        headerName: "Ativação",
        width: 100,
        filter: "agDateColumnFilter",
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
        field: "InicioPlano",
        headerName: "Plano Inicio",
        width: 100,
        filter: "agDateColumnFilter",
        filterParams: filterDateParams,
        comparator: DateComparator,
      },
      {
        field: "AutoRec",
        headerName: "Auto-Rec",
        width: 100,
        filter: "agDateColumnFilter",
        filterParams: filterDateParams,
        comparator: DateComparator,
      },
      {
        field: "ValorPago",
        width: 80,
        headerName: "$ Cob. Contel",
        filterParams: filterParamsNumber,
        comparator: customNumberComparator,
      },
      {
        field: "RecAutFCFlag",
        headerName: "Rec. FC",
        width: 100,
        cellRenderer: function (params) {
          if (params.value != null) {
            var cellHtml =
              '<a ng-click="" ><img class="imgWhatsapp link" style="max-width:15px;margin:10px" src="content/img/' +
              (params.value == false ? "customeroff.png" : "customeron.png") +
              '" /></a>';
            return cellHtml;
          }
        },
      },
      {
        field: "RecAutFC",
        headerName: "Rec.Aut.FC",
        width: 100,
        filter: "agDateColumnFilter",
        filterParams: filterDateParams,
        comparator: DateComparator,
      },
      {
        field: "ContelBlockStatus",
        headerName: "Contel",
        width: 80,
        cellRenderer: function (params) {

          if (params.value == "A") {
            return (
              "<a ng-click=\"vm.BlockUnlockLine('" +
              params.value +
              "', " +
              params.node.data.IdPerson +
              ", " +
              params.node.id +
              ", '" +
              params.node.data.Nome_FC +
              '\')" title="Ativa"  href="javascript:void(0);"><img class="imgUsd link" style="max-width:16px; alt="Ativa" margin-top:10px" src="content/img/phone-green.png" /></a>'
            );
          } else if (params.value == "B") {
            return (
              "<a ng-click=\"vm.BlockUnlockLine('" +
              params.value +
              "', " +
              params.node.data.IdPerson +
              ", " +
              params.node.id +
              ",'" +
              params.node.data.Nome_FC +
              '\')" title="Bloqueada"  style=""><img class="imgUsd link" style="max-width:16px; margin-top:10px" src="content/img/phone-red.png" /></a>'
            );
          } else if (params.value == "C") {
            return (
              "<a ng-click=\"vm.BlockUnlockLine('" +
              params.value +
              "', " +
              params.node.data.IdPerson +
              ", " +
              params.node.id +
              ",'" +
              params.node.data.Nome_FC +
              '\')" title="Cancelada"  style=""><img class="imgUsd link" style="max-width:16px; alt="Cancelada" margin-top:10px" src="content/img/phone-black.png" /></a>'
            );
          } else {
            return (
              '<div class="circle_red"><a ng-click="vm.BlockUnlockLine(\'' +
              params.value +
              "', " +
              params.node.data.IdPerson +
              ", '" +
              params.node.data.Nome_FC +
              '\')" href="javascript:void(0);" title="Outras Operadoras" /></div>'
            );
          }
        },
      },
      {
        field: "ContelStatus",
        headerName: "Status",
        width: 100,
      },
      ,
      {
        field: "PortIn",
        headerName: "Port In",
        width: 100,
      },
      {
        field: "Bloqueada",
        headerName: "Bloq.",
        width: 100,
      },
      {
        field: "Esim",
        headerName: "Esim",
        width: 100,
        cellRenderer: function (params) {
          return params.value == "SIM" ? "Yes" : "No";
        },
      },
      {
        field: "UltPagDias",
        headerName: "Ult. $",
        width: 100,
        filterParams: filterParamsNumber,
        comparator: customNumberComparator,
      },
      {
        field: "DaysSinceLastTopup",
        headerName: "Dias ult. Rec.",
        cellRenderer: function (params) {
          if (params.value >= 0) return "<div>" + params.value + "</div>";
          else return "<div>-</div>";
        },
        width: 100,
        filterParams: filterParamsNumber,
        comparator: customNumberComparator,
      },
      {
        field: "LastPaidAmount",
        headerName: "Ult. Pago $",
        width: 100,
        filterParams: filterParamsNumber,
        comparator: customNumberComparator,
      },
      {
        field: "StatusCob",
        headerName: "Status $",
        width: 100,
      },
      {
        field: "ChargeHistory",
        width: 40,
        cellRenderer: function (params) {
          return "<a><img class='imgUsd link' src='content/img/usd.jpeg' style='max-width:15px;margin:10px 0px;    '/></a>";
        },
      },
      {
        field: "WhatsApp",
        width: 40,
        cellRenderer: function (params) {
          return "<a><img class='imgUsd link' src='content/img/message-green.png' style='max-width:15px;   margin:10px 0' /></a>";
        },
      },
      {
        field: "ClienteAtivo_FC",
        headerName: "Cliente",
        width: 100,
        cellRenderer: function (params) {
          var cellHtml =
            '<a ng-click="" ><img class="imgWhatsapp link" style="max-width:15px;margin:10px" src="content/img/' +
            (params.value == "T" ? "customeron.png" : "customeroff.png") +
            '" /></a>';
          return cellHtml;
        },
        filterParams: {
          suppressAndOrCondition: true,
        },
      },
      { field: "Nome_FC", editable: false, singleClickEdit: false, width: 250 },
      {
        field: "Apelido",
        editable: true,
        width: 150,
        cellEditor: "agLargeTextCellEditor",
      },
      { field: "ICCID", editable: true },
      { field: "Propriedade", headerName: "Dono", width: 120 },
      { field: "CPF_FC", headerName: "CPF FC", width: 120 },
      { field: "CPF_DR", headerName: "CPF Dr", width: 120 },
      { field: "DocContel", headerName: "Doc Contel", width: 120 },
      { field: "Nome_DR", headerName: "Nome Dr", width: 150 },
      { field: "LinhaSemUso", width: 120, headerName: "Sem Uso" },
      { field: "Linha_DR", width: 120 },
      {
        field: "Total_DR",
        headerName: "Total Dr",
        width: 80,
        filterParams: filterParamsNumber,
        comparator: customNumberComparator,
      },
      { field: "PrecoUnico", headerName: "$ Unico", width: 80 },
      {
        field: "Total_FC",
        headerName: "Total FC",
        width: 80,
        filterParams: filterParamsNumber,
      },
      {
        field: "Preco_FC",
        headerName: "$ FC",
        width: 80,
        filterParams: filterParamsNumber,
        comparator: customNumberComparator,
      },
      {
        field: "PrecoVIP",
        width: 80,
        headerName: "$ VIP",
        editable: true,
        filterParams: filterParamsNumber,
        comparator: customNumberComparator,
      },
      {
        field: "VIPSum",
        width: 80,
        headerName: "VIP Sum",
        filterParams: filterParamsNumber,
        comparator: customNumberComparator,
      },
      {
        field: "FCSum",
        width: 80,
        headerName: "$ FC Sum",
        filterParams: filterParamsNumber,
        comparator: customNumberComparator,
      },
      {
        field: "Plano_FC",
        headerName: "P. FC",
        width: 150,
        editable: true,
        filterParams: {
          includeBlanksInEquals: true,
          includeBlanksInLessThan: true,
          includeBlanksInGreaterThan: true,
          includeBlanksInRange: true,
        },
        cellEditor: "agSelectCellEditor",
        cellEditorParams: {
          values: vm.plans,
        },
      },
      { field: "Plugin_DR", headerName: "Plano Dr", width: 150 },
      { field: "Plano_DR", width: 150 },
      { field: "Roaming", width: 80 },
      {
        field: "Agendado",
        width: 80,
        filterParams: filterParamsNumber,
        comparator: customNumberComparator,
      },
    ],
    defaultColDef: {
      //flex: 1,
      sortable: true,
      filter: true,
      resizable: true,
      filterParams: {
        includeBlanksInEquals: true,
        includeBlanksInLessThan: true,
        includeBlanksInGreaterThan: true,
        includeBlanksInRange: true,
      },
    },
    stopEditingWhenCellsLoseFocus: true,
    copyHeadersToClipboard: true,
    suppressExcelExport: true,
    enableCellTextSelection: true,
    autoSizeColumns: true,
    singleClickEdit: true,
    onFilterChanged: function () {
      vm.resultText =
        vm.gridOptions.api.getDisplayedRowCount() +
        " of " +
        JSON.parse(LZString.decompress(sessionStorage.getItem("allphonelines")))
          .length +
        " items";
    },

    rowSelection: "multiple",
    headerHeight: 100,
    rowHeight: 30,
    onCellClicked: onCellClicked,
    // onSortChanged : function(params){
    //   alert('hi');
    //   params.api.forEachNode((rowNode,index)=>{ rowNode.rowIndex = index; });
    // },
    onCellValueChanged: function (event) {
      setSession(event.data["Id"]);
      if (event != null && event.data != null) {
        if (event.data[event.column.colId] != "Select") {
          console.log(event.column.colId);
          console.log(event.data[event.column.colId]);
          var data = {
            Id: event.data.Id,
            key: event.column.colId,
            value: event.data[event.column.colId],
          };
          FoneclubeService.postAllPhoneLinesAction(data).then(function (
            result
          ) { });
        } else {
          event.data[event.column.colId] = event.oldValue;
          event.api.refreshCells({ columns: ["Plano_FC"] });
        }
      }
      UpdateSession();
    },
  };

  function convertDate(dataString) {
    // Mapeamento de abreviações de meses para números
    const months = {
      Jan: "01",
      Feb: "02",
      Mar: "03",
      Apr: "04",
      May: "05",
      Jun: "06",
      Jul: "07",
      Aug: "08",
      Sep: "09",
      Oct: "10",
      Nov: "11",
      Dec: "12",
    };

    // Quebrar a string em partes (dia, mês, ano)
    const partes = dataString.split(" ");

    // Obter o ano, mês e dia
    const year = partes[2];
    const month = months[partes[1]];
    const day = partes[0];

    // Formar a data no formato "aaaa-mm-dd hh:mm"
    const finalDate = `${year}-${month}-${day} 00:00`;

    return finalDate;
  }

  init();

  function onlyActive() {
    rowData = vm.gridOptions.api.getModel().rowsToDisplay;

    const filterCheckbox = document.getElementById("filterCheckbox");

    console.log(filterCheckbox.checked);
    if (!filterCheckbox.checked) {
      const arr = LZString.decompress(sessionStorage.getItem("allphonelines"));
      const parsedArr = JSON.parse(arr);
      vm.gridOptions.api.setRowData(parsedArr);

      vm.resultText =
        vm.gridOptions.api.getDisplayedRowCount() +
        " of " +
        parsedArr
          .length +
        " items";

      return;


    }

    let arr = [];
    var phoneNumbers = {};

    for (var i = 0; i < rowData.length; i++) {
      var row = rowData[i];
      var phoneNumber = row.data.PhoneNumber;
      var ativa = row.data.Ativa;

      if (phoneNumbers.hasOwnProperty(phoneNumber)) {
        if (ativa !== "F") {
          phoneNumbers[phoneNumber] = row;
        }
      } else {
        phoneNumbers[phoneNumber] = row;
      }
    }

    for (var key in phoneNumbers) {
      arr.push(phoneNumbers[key].data);
    }

    vm.gridOptions.api.setRowData(arr);
    vm.resultText =
      vm.gridOptions.api.getDisplayedRowCount() +
      " of " +
      JSON.parse(LZString.decompress(sessionStorage.getItem("allphonelines")))
        .length +
      " items";

  }

  function refreshGridOptions() {
    vm.gridOptions.columnDefs.filter(
      (x) => x.field == "Plano_FC"
    )[0].cellEditorParams.values = vm.plans;
  }

  // function onCellDoubleClicked(params){
  //   //console.log(params);
  //   if(params.colDef.field != "PhoneNumber")
  //   {
  //     sessionStorage.setItem('lastClickedRow', params.node.data.PhoneNumber);
  //     openCustomerEdit(params.node.data.CPF_FC);
  //   }
  // }

  function openTopupPopup(phone) {
    var showLoader = DialogFactory.showLoader(
      "Aguarde enquanto buscamos as informações da linha."
    );
    FoneclubeService.getContelDetailByPhone(phone).then(
      function (result) {
        showLoader.close();
        if (result != null) {
           FoneclubeService.getContelPlans().then(function (result1) {
            sessionStorage.setItem('contelplans', JSON.stringify(result1));
     
            var resultData = {
              result: result,
              plans: JSON.parse(
                sessionStorage.getItem("contelplans") == null
                  ? null
                  : sessionStorage.getItem("contelplans")
                ),
            };
            ViewModelUtilsService.showModalPhoneTopUpTemplate(resultData);
           });
        } else {
          alert("Selected line is not available in Contel");
        }
      },
      function (error) {
        showLoader.close();
        DialogFactory.showMessageDialog({
          mensagem: "Error occured: " + error,
        });
      }
    );
  }

  function openTopupHistory(phone) {
    var showLoader = DialogFactory.showLoader(
      "Aguarde enquanto buscamos o histórico de recarga."
    );
    FoneclubeService.getTopupHistory(phone).then(
      function (result) {
        showLoader.close();
        if (result != null && result.Person != null) {
          ViewModelUtilsService.showModalPhoneTopUpHistoryTemplate(result);
        } else {
          alert("Information not available");
        }
      },
      function (error) {
        showLoader.close();
        DialogFactory.showMessageDialog({
          mensagem: "Error occured: " + error,
        });
      }
    );
  }

  function onCellClicked(params) {
    setSession(params.node.data.Id);
    switch (params.colDef.field) {
      case "PortNumber":
        ClipBoardCopy(params.value);
        break;
      case "CPF_FC":
        ClipBoardCopy(params.value);
        break;
      case "Saldo":
        {
          var showLoader = DialogFactory.showLoader(
            "Aguarde enquanto obtém o saldo mais recente"
          );
          FoneclubeService.getContelDetailBySaldoPhone(
            params.node.data.PhoneNumber
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
                  if (rowNode.data.Id == params.node.data.Id) {
                    rowNode.data.Saldo = saldo;
                    rowNode.setSelected(true);
                    vm.gridOptions.api.refreshCells({ columns: ["Saldo"] });
                    vm.gridOptions.api.ensureIndexVisible(index, "middle");
                  }
                });
                // debugger;
                // vm.gridOptions.api.forEachNodeAfterFilterAndSort(node => rowData.push(node.data));
                // vm.gridOptions.api.setRowData(rowData);
                // UpdateSession();
              }
            },
            function (error) {
              showLoader.close();
            }
          );
        }
        break;
      case "ChargeHistory":

        vm.openChargeSummary(params.node.data.CPF_FC);
        break;
      case "WhatsApp":
        vm.openWhatsApp(params.node.data.CPF_FC);
        break;
      case "TopUp":
        vm.openTopupPopup(params.node.data.PhoneNumber);
        break;
      case "TopUpHistory":

        vm.openTopupHistory(params.node.data.PhoneNumber);

        break;
      case "Ativa":
        {
          var title =
            params.node.data.Ativa == "T" ? "Desativar linha" : "Ativar linha";
          var msg =
            params.node.data.Ativa == "T"
              ? "Tem certeza que deseja desativar a linha "
              : "Tem certeza que deseja ativar a linha ";
          DialogFactory.dialogConfirm({
            titulo: title,
            mensagem: "<span>" + msg + params.node.data.PhoneNumber + "</span>",
            btn1: "SIM",
            btn2: "NÃO",
          }).then(function (result) {
            if (!result) {
              var data = {
                Id: params.node.data.Id,
                key: params.colDef.field,
                value: params.node.data.Ativa == "F" ? "true" : "false",
              };
              UpdateSelectedData(data, params.node.data.PhoneNumber);
            }
          });
        }
        break;
      case "RecAutFCFlag":
        {
          var data = {
            Id: params.node.data.Id,
            key: params.colDef.field,
            value: params.node.data.RecAutFCFlag == false ? "true" : "false",
          };
          UpdateSelectedData(data, params.node.data.PhoneNumber);
        }
        break;
      case "ClienteAtivo_FC":
        {
          var title =
            params.node.data.Ativa == "T"
              ? "Desativar cliente"
              : "Ativar cliente";
          var msg =
            params.node.data.Ativa == "T"
              ? "Tem certeza que deseja desativar a cliente "
              : "Tem certeza que deseja ativar a cliente ";
          DialogFactory.dialogConfirm({
            titulo: title,
            mensagem: "<span>" + msg + params.node.data.Nome_FC + "</span>",
            btn1: "SIM",
            btn2: "NÃO",
          }).then(function (result) {
            if (!result) {
              var data = {
                Id: params.node.data.Id,
                key: params.colDef.field,
                value:
                  params.node.data.ClienteAtivo_FC == "T" ? "true" : "false",
              };
              UpdateSelectedData(data, params.node.data.PhoneNumber);
            }
          });
        }
        break;
      case "PhoneNumber":
        {
          ClipBoardCopy(params.value);
          // FoneclubeService.syncContelLinesForUser(params.node.data.IdPerson).then(function (result) {
          //   if(result)
          //   {
          //     refreshPage();
          //   }
          // });
        }
        break;
      case "ContelBlockStatus":
        {
          if (params.node.data.ContelStatus != "CANCELADO") {
            vm.BlockUnlockLine(
              params.value,
              params.node.data.IdPerson,
              params.node.id,
              params.node.data.Nome_FC,
              params.node.data.PhoneNumber
            );
          }
        }
        break;
      case "Nome_FC":
        {
          var showLoader = DialogFactory.showLoader(
            "Aguarde enquanto obtém os dados do cliente"
          );

          {
            FoneclubeService.getCustomerByCPF(
              UtilsService.clearDocumentNumber(params.node.data.CPF_FC)
            ).then(function (result) {
              var data = {
                Id: result.Id,
                CPF: result.DocumentNumber,
                Nome: result.Name,
                Use2Prices: result.Use2Prices,
                IsVIP: result.IsVIP,
                Referral: result.Referral,
                Phones: result.Phones,
                Email: result.Email,
                Parent: result.Pai,
                SoftDelete: result.Desativo,
              };
              ViewModelUtilsService.showPlanSelectionModal(data);
              showLoader.close();

            });
          }
        }
        break;
      default:
        {
          ClipBoardCopy(params.value);
        }
        break;
    }
    //UpdateSession();
  }

  function setSession(id) {
    sessionStorage.setItem("lastClickedRow", id);
    SessionStorageUtilsService.setGridObject(
      "AllPhoneLines",
      vm.gridOptions,
      vm.filterText
    );
  }

  function ResetESIM(phone){
    FoneclubeService.resetESIM(phone).then(function (result) {
      DialogFactory.showMessageDialog({
          mensagem: "Resetted ICCID: " + result.iccid + " PDF: " + result.esim_pdf,
      });
    });
  }

  function toggleModal() {
    vm.isOpen = !vm.isOpen;
  }

  function UpdateSession() {
    var session = SessionStorageUtilsService.getSession("AllPhoneLines");
    if (session != null) {
      var ss = JSON.parse(session);
      vm.filterText = ss.FilterText;
      //vm.gridOptions.api.setSortModel(JSON.parse(ss.SortModel));
      vm.gridOptions.columnApi.applyColumnState({
        state: ss.ColumnState,
        applyOrder: true,
      });
    }
    let rowData = [];
    vm.gridOptions.api.forEachNode((node) => rowData.push(node.data));
    let IDofRowToSelect = sessionStorage.getItem("lastClickedRow");

    var index = rowData.findIndex((x) => x.Id == IDofRowToSelect);

    vm.gridOptions.api.getDisplayedRowAtIndex(index).setSelected(true);
    vm.gridOptions.api.ensureIndexVisible(index, "middle");
  }

  function UpdateSelectedData(data, phone) {
    FoneclubeService.postAllPhoneLinesAction(data).then(function (result) {
      let row = vm.gridOptions.api.getRowNode(data.Id);
      var allphonelines =
        sessionStorage.getItem("allphonelines") == null
          ? null
          : LZString.decompress(sessionStorage.getItem("allphonelines"));
      var data1 = JSON.parse(allphonelines);
      var index = data1.indexOf(data1.filter((v) => v.Id == data.Id)[0]);
      if (index >= 0) {
        switch (data.key) {
          case "ClienteAtivo_FC":
            data1[index].ClienteAtivo_FC = data.value == "false" ? "T" : "F";
            break;
          case "Ativa":
            data1[index].Ativa = data.value == "true" ? "T" : "F";
            break;
          case "RecAutFCFlag":
            data1[index].RecAutFCFlag = data.value == "true" ? true : false;
            break;
        }
      }
      var str = JSON.stringify(data1);
      sessionStorage.setItem("allphonelines", LZString.compress(str));
      vm.gridOptions.api.setRowData(data1);
      vm.gridOptions.api.setQuickFilter(vm.filterText);
      getAgGridState();
    });
  }

  function BlockUnlockLine(value, custId, nodeId, custName, linha) {
    if (value == "A") {
      DialogFactory.dialogConfirm({
        titulo: "Bloqueio de linhas",
        mensagem:
          "<span>Deseja bloquear <strong>TODAS</strong> as linhas do Cliente ou apenas a linha selecionada" +
          custName +
          "</span>",
        btn1: "TODAS",
        btn2: "Selecionado",
      }).then(function (result) {
        if (result == 0) {
          DialogFactory.dialogConfirm({
            titulo: "Bloqueio de linhas",
            mensagem:
              "<span>Deseja bloquear <strong>TODAS</strong> as linhas do " +
              custName +
              "</span>",
            btn1: "SIM",
            btn2: "Temporariamente",
          }).then(function (result) {
            if (!result) {
              DialogFactory.dialogConfirm({
                titulo: "Bloqueio de linhas",
                mensagem: "Tem Certeza",
                btn1: "SIM",
                btn2: "NÃO",
              }).then(function (result) {
                var showLoader = DialogFactory.showLoader(
                  "Um momento estamos bloqueando as linhas."
                );
                if (!result) {
                  var data = {
                    PersonId: custId,
                  };
                  FoneclubeService.permanentBlockLineForCustomer(data).then(
                    function (result) {
                      if (result != null) {
                        showLoader.close();
                        var resDisplay = "";
                        for (var ir = 0; ir < result.length; ir++) {
                          resDisplay +=
                            "Linha: " +
                            result[ir].Linha +
                            " Status: " +
                            result[ir].BlockLineResponse.mensagem +
                            "<br/>";
                        }

                        ViewModelUtilsService.showConfirmDialog(
                          "Success!",
                          resDisplay
                        ).then(function (confirm) {
                          if (confirm) {
                            refreshPage();
                          } else {
                          }
                        });
                      } else {
                        DialogFactory.showMessageDialog({
                          mensagem: "Error occured: " + result,
                        });
                      }
                    },
                    function (error) {
                      showLoader.close();
                      DialogFactory.showMessageDialog({
                        mensagem: "Error occured: " + error,
                      });
                    }
                  );
                } else showLoader.close();
              });
            }
          });
        } else {
          var showLoader = DialogFactory.showLoader(
            "Um momento estamos bloqueando as linhas."
          );
          var data = { numero: linha };
          FoneclubeService.permanentBlockLine(data).then(
            function (result) {
              if (result != null) {
                showLoader.close();
                var resDisplay =
                  "Linha: " + linha + " Status: " + result.mensagem + "<br/>";

                ViewModelUtilsService.showConfirmDialog(
                  "Success!",
                  resDisplay
                ).then(function (confirm) {
                  if (confirm) {
                    refreshPage();
                  } else {
                  }
                });
              } else {
                DialogFactory.showMessageDialog({
                  mensagem: "Error occured: " + result,
                });
              }
            },
            function (error) {
              showLoader.close();
              DialogFactory.showMessageDialog({
                mensagem: "Error occured: " + error,
              });
            }
          );
        }
      });
    } else {
      DialogFactory.dialogConfirm({
        titulo: "Desbloqueio de linha",
        mensagem:
          "<span>Deseja desbloquear <strong>TODAS</strong> as linhas de Cliente ou apenas a linha selecionada" +
          custName +
          "</span>",
        btn1: "TODAS",
        btn2: "Selecionado",
      }).then(function (result) {
        if (result == 0) {
          DialogFactory.dialogConfirm({
            titulo: "Desbloqueio de linha",
            mensagem:
              "<span>Deseja desbloquear <strong>TODOS</strong> de acordo com as linhas do " +
              custName +
              "</span>",
            btn1: "SIM",
            btn2: "Temporariamente",
          }).then(function (result) {
            if (!result) {
              DialogFactory.dialogConfirm({
                titulo: "Desbloqueio de linhas",
                mensagem: "Tem Certeza",
                btn1: "SIM",
                btn2: "NÃO",
              }).then(function (result) {
                if (!result) {
                  var showLoader = DialogFactory.showLoader(
                    "Um momento estamos desbloqueando as linhas."
                  );
                  var data = {
                    PersonId: custId,
                  };
                  FoneclubeService.permanentUnBlockLineForCustomer(data).then(
                    function (result) {
                      if (result != null) {
                        showLoader.close();
                        var resDisplay = "";
                        for (var ir = 0; ir < result.length; ir++) {
                          resDisplay +=
                            "Linha: " +
                            result[ir].Linha +
                            " Status: " +
                            result[ir].BlockLineResponse.mensagem +
                            "<br/>";
                        }

                        ViewModelUtilsService.showConfirmDialog(
                          "Success!",
                          resDisplay
                        ).then(function (confirm) {
                          if (confirm) {
                            refreshPage();
                          } else {
                          }
                        });
                      } else {
                        DialogFactory.showMessageDialog({
                          mensagem: "Error occured: " + result,
                        });
                      }
                    },
                    function (error) {
                      showLoader.close();
                      DialogFactory.showMessageDialog({
                        mensagem: "Error occured: " + error,
                      });
                    }
                  );
                }
              });
            }
          });
        } else {
          var showLoader = DialogFactory.showLoader(
            "Um momento estamos desbloqueando as linhas."
          );
          var data = { numero: linha };
          FoneclubeService.permanentUnBlockLine(data).then(
            function (result) {
              if (result != null) {
                showLoader.close();
                var resDisplay =
                  "Linha: " + linha + " Status: " + result.mensagem + "<br/>";

                ViewModelUtilsService.showConfirmDialog(
                  "Success!",
                  resDisplay
                ).then(function (confirm) {
                  if (confirm) {
                    refreshPage();
                  } else {
                  }
                });
              } else {
                DialogFactory.showMessageDialog({
                  mensagem: "Error occured: " + result,
                });
              }
            },
            function (error) {
              showLoader.close();
              DialogFactory.showMessageDialog({
                mensagem: "Error occured: " + error,
              });
            }
          );
        }
      });
    }
  }

  function StringComparator(valueA, valueB) {
    const valueALower = valueA ? valueA.toLowerCase().trim() : "";
    const valueBLower = valueB ? valueB.toLowerCase().trim() : "";
    return valueALower.localeCompare(valueBLower, "en", { numeric: true });
  }
  function DateComparator(valueA, valueB) {
    var defDate = new Date(1900, 01, 01);
    valueA = valueA == "" ? defDate : new Date(valueA);
    valueB = valueB == "" ? defDate : new Date(valueB);
    if (valueA == valueB) return 0;
    return valueA > valueB ? 1 : -1;
  }

  function openChargeSummary(cpf) {
    var showLoader = DialogFactory.showLoader(
      "Aguarde enquanto obtemos o histórico do cliente"
    );
    FoneclubeService.getCustomerByCPF(
      UtilsService.clearDocumentNumber(cpf)
    ).then(function (result) {
      ViewModelUtilsService.showModalCustomer(result);
      showLoader.close()
    });
    showLoader.close()
  }

  function openCustomerEdit(cpf) {
    FoneclubeService.getCustomerByCPF(
      UtilsService.clearDocumentNumber(cpf)
    ).then(function (result) {
      result.view = 2;
      FlowManagerService.changeEdicaoView(result);
    });
  }

  function openWhatsApp(cpf) {
    var showLoader = DialogFactory.showLoader(
      "Aguarde enquanto obtemos os dados do cliente"
    );
    FoneclubeService.getCustomerByCPF(
      UtilsService.clearDocumentNumber(cpf)
    ).then(function (result) {
      ViewModelUtilsService.showModalReport(result);
      showLoader.close()
    });
    showLoader.close()
  }


  function ClipBoardCopy(text_to_share) {
    // create temp element
    var copyElement = document.createElement("pre");
    copyElement.appendChild(document.createTextNode(text_to_share));
    copyElement.id = "tempCopyToClipboard";
    angular.element(document.body.append(copyElement));
    // select the text
    var range = document.createRange();
    range.selectNode(copyElement);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    // copy & cleanup
    document.execCommand("copy");
    window.getSelection().removeAllRanges();
    copyElement.remove();
  }

  function clearFilter() {
    vm.filterText = "";
    sessionStorage.setItem("searchText", vm.filterText);
    vm.gridOptions.api.setQuickFilter(null);
    vm.gridOptions.api.forEachNodeAfterFilter((node) => {
      // select the node
      node.setSelected(false);
    });
  }

  function CustomCombobox(params) {
    //Find RowIndex
    var rowIndex = params.rowIndex;
    //FindColoumn Name
    var Column = params.eGridCell.attributes.colId;
    //FindGridData
    var WeldGridData = $scope.gridOptions.rowData;
    //create select element using javascript
    var eSelect = document.createElement("select");
    //Set attributes
    eSelect.setAttribute("class", "custom-select form-control");
    eSelect.setAttribute("style", "padding:0px");
    eSelect.setAttribute("name", params.colDef.field);
    eSelect.setAttribute("id", params.colDef.field + "_" + rowIndex);
    //get the value of the select option
    var value = params.data.CompanyID;
    //create the default option of the select element
    var eOption = document.createElement("option");
    eOption.text = "Select";
    eOption.value = "";
    eSelect.appendChild(eOption);
    if (params.colDef.field == "Propriedade") {
      CompanyName = $scope.CompanyList;
      var companyid = params.data.CompanyID;
      var eOptionVal = document.createElement("option");
      //Statical set data in grid ComboBox
      eOptionVal.text = "Angra";
      eOptionVal.value = 1;
      eSelect.appendChild(eOptionVal);
      var eOption = document.createElement("option");
      eOption.text = "Navcreation";
      eOption.value = "2";
      eSelect.appendChild(eOption);
    }
    return eSelect;
  }


  function onQuickFilterChanged() {
    sessionStorage.setItem("searchText", vm.filterText);
    var filterText = vm.filterText
      .replace("(", "")
      .replace(")", "")
      .replaceAll(" ", "")
      .replace("-", "");
    vm.filterText = isNaN(filterText) ? vm.filterText : filterText;
    vm.gridOptions.api.setQuickFilter(vm.filterText);
    let IDofRowToSelect = sessionStorage.getItem("lastClickedRow");

    const allLines = JSON.parse(
      LZString.decompress(sessionStorage.getItem("allphonelines"))
    );

    vm.resultText =
      vm.gridOptions.api.getDisplayedRowCount() +
      " of " +
      allLines.length +
      " items";


    let rowData = [];
    vm.gridOptions.api.forEachNodeAfterFilterAndSort((node) =>
      rowData.push(node.data)
    );

    vm.gridOptions.api.forEachNode((node) => {
      node.setSelected(node.data.Id == IDofRowToSelect);
      if (node.data.Id == IDofRowToSelect) {
        vm.gridOptions.api.ensureIndexVisible(node.rowIndex, "middle");
      }
    });
  }

  function refreshPage() {
    vm.loading = true;
    init();
  }

  function onClipBoardSuccess(event) {
    //debugger;
    vm.clipBoardCopiedText = event.text;
  }

  function pasteCliboardText(event) {
    //debugger;
    vm.filterText = vm.clipBoardCopiedText;
    var $activeElement = angular.element(
      document.getElementById("quickFilter")
    );
    $activeElement.attr("focused", "yes"); // Example usage
    onQuickFilterChanged();
  }

  function addContelLineManually() {
    var filterText = vm.filterText
      .replace("(", "")
      .replace(")", "")
      .replaceAll(" ", "")
      .replace("-", "");
    if (!isNaN(filterText)) {
      FoneclubeService.addContelLineManual(filterText).then(function (result) {
        if (result != null) {
          DialogFactory.showMessageDialog({
            mensagem:
              "Line " + filterText + "added successfully to WebFC " + error,
          });
        } else {
          DialogFactory.showMessageDialog({
            mensagem: "Line " + filterText + "not exists in Contel" + error,
          });
        }
      });
    }
  }

  async function getFromSessionStorage(key) {
    let item = sessionStorage.getItem(key);
    return item == null ? null : LZString.decompress(item);
  }

  function setToSessionStorage(key, value) {
    let str = LZString.compress(JSON.stringify(value));
    sessionStorage.setItem(key, str);
  }

  async function init() {

    let customers = await getFromSessionStorage("customers");
    if (!customers) {
      LoadMainGridInBackground();
    }

    let agGridStates = await FoneclubeService.getAgGridStates("AllPhoneLines");
    if (agGridStates != null) {
      vm.agGridStates = agGridStates;
      let default1 = agGridStates.find((x) => x.IsDefault == true);
      if (default1) {
        vm.defaultGridState = default1;
      }
    }

    let plansById = await FoneclubeService.getPlansById(4);
    vm.plansAll = plansById;
    vm.plans = plansById.map((x) => x.Description);

    let allphonelines = await getFromSessionStorage("allphonelines");
    if (allphonelines) {
      let parsedData = JSON.parse(allphonelines);
      vm.resultText = `${parsedData.length} of ${parsedData.length} items`;
      vm.gridOptions.api.setRowData(parsedData);
      getAgGridState();
      refreshGridOptions();
      let IDofRowToSelect = sessionStorage.getItem("lastClickedRow");
      vm.gridOptions.api.forEachNode((node) => {
        node.setSelected(node.data.Id == IDofRowToSelect);
        if (node.data.Id == IDofRowToSelect) {
          vm.gridOptions.api.ensureIndexVisible(node.rowIndex, "middle");
        }
      });
    }

    let newData = await FoneclubeService.getAllPhoneLinesNew();

    let oldData = await getFromSessionStorage("allphonelines");
    if (JSON.stringify(oldData) !== JSON.stringify(newData)) {
      setToSessionStorage("allphonelines", newData);
      vm.gridOptions.api.setRowData(newData);
      vm.resultText = `${newData.length} of ${newData.length} items`;
      getAgGridState();
      refreshGridOptions();

      vm.loading = false;
    }
    vm.loading = false;
    onlyActive();

  }

  function LoadMainGridInBackground() {
    FoneclubeService.getClientDashboardData(vm.month, vm.year, 0).then(
      function (res) {
        var data = res[0];
        var result = res[1];

        var vmcustomers = [];
        for (var i in result) {
          let c = result[i];
          const customer = data.find((d) => d.Id == c.Id);
          if (customer) {
            c.fullData = customer;
            // if(customer.Desativo == undefined) {
            //     vm.customers[i].fullData.Desativo = false;
            // }
            c.allChargingsCanceled = false;

            for (var o in c.ChargingValidity) {
              c.ChargingValidity[o].display = true;
            }
            vmcustomers.push(c);
          } else {
            //c.fullData = {};
          }
        }
        var str = JSON.stringify(vmcustomers);
        sessionStorage.setItem("customers", LZString.compress(str));
      }
    );


  }

  function exportToExcel() {
    var params = {
      skipHeader: false,
      skipFooters: true,
      skipGroups: true,
      fileName: "export.csv",
    };
    var csvContent = vm.gridOptions.api.getDataAsCsv(params);
    let hiddenElement = document.createElement("a");
    let csvData = new Blob([csvContent], { type: "text/csv" });
    let csvUrl = URL.createObjectURL(csvData);
    hiddenElement.href = csvUrl;
    hiddenElement.target = "_blank";
    hiddenElement.download = "AllPhoneLines.csv";
    hiddenElement.click();
  }

  function saveState() {
    var retVal = prompt("Enter save state name : ", "state name here");
    var saveStateData = {
      intId: -1,
      txtStateName: retVal,
      txtAgidName: "AllPhoneLines",
      txtColumnState: JSON.stringify(vm.gridOptions.columnApi.getColumnState()),
      txtFilterModel: JSON.stringify(vm.gridOptions.api.getFilterModel()),
      txtSortModel: JSON.stringify(vm.gridOptions.api.getSortModel()),
    };

    if (retVal != "null" && retVal != null) {
      FoneclubeService.saveAgGridState(saveStateData).then(function (result) {
        alert("Saved successfully");
        FoneclubeService.getAgGridStates("AllPhoneLines").then(function (
          result
        ) {
          if (result != null) vm.agGridStates = result;
          var default1 = result.find((x) => x.IsDefault == true);
          if (default1) {
            vm.defaultGridState = default1;
          }
        });
      });
    }
  }

  function updateState() {
    var retVal = prompt(
      "Enter save state name to update: ",
      vm.defaultGridState.txtStateName
    );
    var saveStateData = {
      intId: vm.defaultGridState.intId,
      txtStateName: retVal,
      txtAgidName: "AllPhoneLines",
      txtColumnState: JSON.stringify(vm.gridOptions.columnApi.getColumnState()),
      txtFilterModel: JSON.stringify(vm.gridOptions.api.getFilterModel()),
      txtSortModel: JSON.stringify(vm.gridOptions.api.getSortModel()),
    };
    FoneclubeService.saveAgGridState(saveStateData).then(function (result) {
      alert("Updated successfully");
    });
  }

  function deleteState() {
    ViewModelUtilsService.showConfirmDialog(
      "Atenção!",
      "Are you sure, you want to delete?"
    ).then(function (confirm) {
      if (confirm) {
        var deleteStateData = {
          intId: vm.defaultGridState.intId,
          txtAgidName: "AllPhoneLines",
        };
        FoneclubeService.deleteAgGridState(deleteStateData).then(function (
          result
        ) {
          alert("Deleted successfully");
        });
      }
    });
  }

  function getAgGridState(stateName) {
    var res = vm.agGridStates.find(
      (x) => x.txtStateName == vm.defaultGridState.txtStateName
    );
    if (
      res != null &&
      res.txtFilterModel != undefined &&
      res.txtColumnState != undefined
    ) {
      vm.gridOptions.api.setFilterModel(JSON.parse(res.txtFilterModel));
      vm.gridOptions.columnApi.setColumnState(JSON.parse(res.txtColumnState));
      if (res.txtSortModel != "{}")
        vm.gridOptions.api.setSortModel(JSON.parse(res.txtSortModel));
    }
    var saveStateData = {
      intId: vm.defaultGridState.intId,
      txtAgidName: "AllPhoneLines",
    };
    FoneclubeService.updateDefaultGridState(saveStateData).then(function (
      result
    ) { });
  }

  function addNewLine() {
    ViewModelUtilsService.showModalAddNewPhoneLinePopup();
  }

  function importContelTopupHistory() {
    ViewModelUtilsService.showContelTopupHistorTemplate();
  }

  function mobileCheck() {
    let check = false;
    (function (a) {
      if (
        /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
          a
        ) ||
        /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
          a.substr(0, 4)
        )
      )
        check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
  }
}

AllPhoneLinesNewController.$inject = [
  "$scope",
  "$interval",
  "FoneclubeService",
  "DialogFactory",
  "UtilsService",
  "ViewModelUtilsService",
  "FlowManagerService",
  "SessionStorageUtilsService",
];
