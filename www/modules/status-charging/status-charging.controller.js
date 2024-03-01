



//angular.module('foneClub', ['kendo.directives']);
angular.module('foneClub').controller('StatusChargingController', StatusChargingController);



function StatusChargingController($scope, $interval, FoneclubeService, PagarmeService) {




  var vm = this;
  vm.month = new Date().getMonth() + 1;
  vm.year = new Date().getFullYear();
  vm.diffDays = diffDays;
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

  function convertToViewModel(sourceData) {
    var customerDataList = [];

    for (var i = 0; i < sourceData.length; i++) {
      var customer = sourceData[i];

      var RCobrado = customer.ammoutIntFormat;
      var customerSelectedCharge = '';
      var Tipo = '';
      var TipoLink = '';
      var Acao = '';
      var AcaoBool = false;
      var Vencimento = customer.boletoExpires;
      var Ultimopag = customer.LastPaidDate;
      var Dias2 = diffDays(customer.LastPaidDate);
      var RPago = 0;
      var CustomerName = customer.Name;
      var Status2 = '';
      var customerChargeId = '';
      var UltimaCob = '';
      var Dias = 0;
      var Status = '';//customer.descricaoStatus;

      if (isNaN(Dias2)) {
        Dias2 = 0;
      }
      ///////////////
      if (customer.ChargeAndServiceOrderHistory && customer.ChargeAndServiceOrderHistory.Charges) {
        var charge = customer.ChargeAndServiceOrderHistory.Charges;
        RPago = charge.Ammount;

        var dataCobranca = charge.CreationDate;
        var dataConvertida = new Date(dataCobranca).toISOString().split('T')[0].replace('-', '/').replace('-', '/');
        var mes = dataConvertida.substring(5, 7);
        var ano = dataConvertida.substring(0, 4);

        customer.chargingDate = charge.CreationDate;
        customer.chargingDateDiffDays = diffDays(dataConvertida);
        Status= charge.PaymentStatusDescription;
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

      if (customer.ChargingValidity != undefined) {

        var lastChargingRec = (customer.ChargingValidity.length - 1);
        var customerChargingInfo = customer.ChargingValidity[lastChargingRec];

        customerSelectedCharge = customerChargingInfo;
        customerChargeId = customerChargingInfo.Id;
        if (customerChargingInfo.CreateDate != null && customerChargingInfo.CreateDate != undefined) {
          //UltimaCob = customerChargingInfo.CreateDate;
        }



        Status2 = customerChargingInfo.Canceled ? 'Cancelada' : 'Ativa'

        if (customerChargingInfo.PaymentType == 1) {
          Tipo = 'CARTÃO';
        }
        else {
          Tipo = 'BOLETO'
          TipoLink = customerChargingInfo.BoletoUrl;
        }
        if (customerChargingInfo.Canceled) {
          Acao = 'A';
          AcaoBool = true;
        }
        if (!customerChargingInfo.Canceled) {
          Acao = 'C';
        }
      }

      if (UltimaCob != undefined && UltimaCob != null) { Dias = diffDays(UltimaCob); }

      if (customer.Name == 'Rodrigo Cardozo Pinto') {
        //debugger;

      }

      customerDataList.push({
        'UltimaCob': UltimaCob,
        'Dias': Dias,
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
        'CustomerName': CustomerName,
      });
    }
    return customerDataList;
  }

  $scope.onPageLoad = function () {

    $scope.onClickSearchCustomerData();
  }

  $scope.onClickSearchCustomerData = function () {
    $('#loadingDiv').show();
    vm.loading = true;
    vm.totalReceivedReady = false;
    hasUpdate = false;
    var ativos = vm.somenteAtivos ? 1 : 0;
    FoneclubeService.getStatusCharging(vm.month, vm.year, ativos).then(function (result) {

      vm.customers = result;
      for (var i in vm.customers) {

        vm.customers[i].allChargingsCanceled = false;

        for (var o in vm.customers[i].ChargingValidity) {
          vm.customers[i].ChargingValidity[o].display = true;
        }
      }
      handleData(vm.customers);
      // loadPaymentHistory();
      var gridData = vm.customers;
      initDataProperties(gridData);
    })
  }

  $scope.exportToExcel = function () {
    $('.k-grid-excel').trigger("click")
  }

  function initDataProperties(customerDatasource) {
    var customerData = convertToViewModel(customerDatasource);
    var totalRecords = customerData.length + 10;
    var pageHeight = $(window).height() - 110;

    $scope.customerDataSource = new kendo.data.DataSource({
      data: customerData,
      pageSize: totalRecords,
      schema: {
        model: {
          fields: {
            Dias: { type: "number" },
            AcaoBool: { type: "boolean" },
          }
        }
      },
    });
    $scope.customerGridOptions = {
      dataSource: $scope.customerDataSource,
      height: pageHeight,
      toolbar: ["excel"],
      excel: {
        allPages: true,
        fileName: "Customer Report.xlsx",
        template: "<a class='k-button k-button-icontext' onclick='customCommand();' href='\\#'></span>Cutom Command</a>"
      },
      sortable: true,
      scrollable: true,
      pageable: {
        refresh: true,
        alwaysVisible: false

      },
      reorderable: true,
      resizable: true,

      filterable: {
        mode: "row",
        extra: false,
        operators: {
          string: {
            contains: "Contains",
            startswith: "Starts with",
            eq: "Is equal to",
            neq: "Is not equal to"
          },
          number: {
            eq: "Equal to",
            neq: "Not equal to",
            gte: "Greater Than",
            lte: "Less Than"
          }
        }
      },
      columns: [
        {
          field: "CustomerName", title: "Name", width: "220px", headerTemplate: "<div class='break-word'>Name<div>"
          , filterable: { cell: { operator: "contains", template: function (args) { args.element.css("width", "90%").addClass("k-textbox").attr("data-value-update", "keyup"); }, } }
        },
        {
          field: "UltimaCob", title: "Última Cob.", width: "130px",
          //template: "#if( UltimaCob != '1999/12/31') {# <div>#=kendo.toString(kendo.parseDate(UltimaCob, 'yyyy-MM-dd'), 'dd.MMM')#</div> #}else{# <div>-</div> #}#",
          template: "<div>#=kendo.toString(kendo.parseDate(UltimaCob, 'yyyy-MM-dd'), 'dd MMM, yyyy')#</div>",
          headerTemplate: "<div class='break-word'>Última Cob.<div>",
          filterable: { cell: { showOperators: false, operator: "contains", template: function (args) { args.element.css("width", "90%").addClass("k-textbox").attr("data-value-update", "keyup"); }, } }
        },
        {
          field: "Dias", title: "Dias", width: "150px"
          , headerTemplate: "<div class='break-word'>Dias<div>",
          filterable: { cell: { operator: "gte", template: function (args) { args.element.css("width", "90%").addClass("k-textbox").attr("data-value-update", "keyup"); }, } }

        },
        {
          field: "Status", title: "Status", width: "140px"
          , headerTemplate: "<div class='break-word'>Última Cob. <br>Status<div>"
          , filterable: {
            cell: {
              showOperators: false,
              template: function (args) {
                args.element.kendoDropDownList({
                  dataTextField: "text",
                  dataValueField: "text",
                  dataSource: new kendo.data.DataSource({ data: [{ text: 'COBRADO' }, { text: 'NÃO COBRADO' }, { text: 'PAGO' }, { text: 'REFUNDED' }, { text: 'VENCIDO' }] }),
                  index: 0,
                  optionLabel: { text: "", value: "" },
                  valuePrimitive: true
                })
              }
            }
          }
        },
        {
          field: "RCobrado", title: "R$ Cobrado", width: "110px"
          , headerTemplate: "<div class='break-word'>R$ <br>Cobrado<div>"
          , filterable: { cell: { showOperators: false, operator: "contains", template: function (args) { args.element.css("width", "90%").addClass("k-textbox").attr("data-value-update", "keyup"); }, } }
        },
        {
          field: "Tipo", title: "Tipo", width: "110px"
          , headerTemplate: "<div class='break-word'>Tipo<div>"
          , template: " #if( Tipo != 'BOLETO') {#   <label>#:Tipo#</label>  #} else{#  <a href='#:TipoLink#' target='_blank'>#:Tipo#</a> #}# "
          , filterable: {
            cell: {
              showOperators: false,
              template: function (args) {
                args.element.kendoDropDownList({
                  dataTextField: "text",
                  dataValueField: "text",
                  dataSource: new kendo.data.DataSource({ data: [{ text: 'BOLETO' }, { text: 'CARTÃO' }] }),
                  index: 0,
                  optionLabel: { text: "", value: "" },
                  valuePrimitive: true
                })
              }
            }
          }
        },


        {
          field: "Status2", title: "Status", width: "130px"
          , headerTemplate: "<div class='break-word'>Ação <br>Status<div>"
          , filterable: {
            cell: {
              showOperators: false,
              template: function (args) {
                args.element.kendoDropDownList({
                  dataTextField: "text",
                  dataValueField: "text",
                  dataSource: new kendo.data.DataSource({ data: [{ text: 'ATIVA' }, { text: 'CANCELADA' }] }),
                  index: 0,
                  optionLabel: { text: "", value: "" },
                  valuePrimitive: true
                })
              }
            }
          }
        },

        {
          field: "Acao", title: "Ação", width: "80px", headerTemplate: "<div class='break-word'>Ação <div>"
          , template: " #if( Acao == 'C') {#   <button class= 'btnb btn-danger action-buttons' ng-click='vm.onDesativarBoleto(#:customerChargeId#)'>				C</button>  #} else{#  <button class='btnb btn-info action-buttons' ng-click='vm.onAtivarBoleto(#:customerChargeId#)'>A</button> #}# "
          , filterable: {
            cell: {
              showOperators: false,
              template: function (args) {
                args.element.kendoDropDownList({
                  dataTextField: "text",
                  dataValueField: "text",
                  dataSource: new kendo.data.DataSource({ data: [{ text: 'A' }, { text: 'C' }] }),
                  index: 0,
                  optionLabel: { text: "", value: "" },
                  valuePrimitive: true
                })
              }
            }
          }
        },



        {
          field: "Vencimento", title: "Vencimento", width: "110px", headerTemplate: "<div class='break-word'>Vencimento<div>"
          , filterable: { cell: { showOperators: false, operator: "contains", template: function (args) { args.element.css("width", "90%").addClass("k-textbox").attr("data-value-update", "keyup"); }, } }
        },
        {
          field: "Ultimopag", title: "Última pag.", width: "110px", headerTemplate: "<div class='break-word'>Última pag.<div>"
          , filterable: { cell: { showOperators: false, operator: "contains", template: function (args) { args.element.css("width", "90%").addClass("k-textbox").attr("data-value-update", "keyup"); }, } }
        },
        {
          field: "Dias2", title: "Dias", width: "110px", headerTemplate: "<div class='break-word'>Dias<div>"
          , template: " #if( Dias2 == 0 ) {# <div>-</div> #} else{#  <div>#:Dias2#</div>  #}# "
          , filterable: {
            cell: {
              showOperators: false, operator: "contains"
              , template: function (args) { args.element.css("width", "90%").addClass("k-textbox").attr("data-value-update", "keyup"); },
            }
          }
        },
        {
          field: "RPago", title: "R$ Pago", width: "110px", headerTemplate: "<div class='break-word'>R$ Pago<div>"
          , filterable: { cell: { showOperators: false, operator: "contains", template: function (args) { args.element.css("width", "90%").addClass("k-textbox").attr("data-value-update", "keyup"); }, } }
        },

      ]
    }
    vm.loading = false;

    $('#loadingDiv').hide();
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
                totalRecebidoBoleto += parseInt(result[0].vm.customers[result[0].indexCustomer].ChargingValidity[result[0].indexCharge].Ammount, 10)
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

        vm.totalCharged += parseInt(customer.ChargingValidity[0].Ammount);

        if (customer.ChargingValidity[0].Payd == true) {
          vm.totalReceived += parseInt(customer.ChargingValidity[0].Ammount)
        }

        customer.ammout = parseFloat(parseInt(customer.ChargingValidity[0].Ammount) / 100);
        customer.ammoutFormat = customer.ammout.toString().replace('.', ',');
        customer.descricaoCharge = charge.Canceled ? vm.AtivoType.CANCELADA : vm.AtivoType.ATIVA;
        customer.descricaoAcao = charge.Canceled ? vm.AtivoType.CANCELADA : vm.AtivoType.ATIVA;
        customer.ammoutInt = parseFloat(customer.ammout);
        customer.ammoutIntFormat = customer.ammoutInt.toString().replace('.', ',');
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

  function loadPaymentHistory() {
    for (var index in vm.customers) {

      FoneclubeService.getChargeAndServiceOrderHistoryDinamic(vm.customers[index].Id, index).then(function (result) {

        if (result.length == 0) {
        }
        else {

          // TODO TEMPORARIO
          var dataCobranca;
          try {

            // dataCobranca = result[0].Charges.PaymentDate.substring(0,10).replace('-','/').replace('-','/');
            dataCobranca = result[0].Charges.CreationDate;
          }
          catch (erro) {

            // dataCobranca = result[0].CreatedDate.substring(0,10).replace('-','/').replace('-','/')
            dataCobranca = result[0].CreatedDate
          }

          var dataConvertida = new Date(dataCobranca).toISOString().split('T')[0].replace('-', '/').replace('-', '/');
          var mes = dataConvertida.substring(5, 7);
          var ano = dataConvertida.substring(0, 4);

          var selecionado = new Date(vm.year.toString() + '/' + vm.month.toString()).toISOString().split('T')[0].replace('-', '/').replace('-', '/');
          var mesSelecionado = selecionado.substring(5, 7);
          var anoSelecionado = selecionado.substring(0, 4);

          if (mesSelecionado == mes && anoSelecionado == ano) {
            vm.customers[result.indexLista].dataIgual = true;
          }

          vm.customers[result.indexLista].chargingDate = dataConvertida;
          vm.customers[result.indexLista].chargingDateDiffDays = diffDays(dataConvertida);
          vm.customers[result.indexLista].LastPaidDateDiffDays = diffDays(vm.customers[result.indexLista].LastPaidDate);
        }
      });
    }
    for (var index in vm.customers) {
      if (vm.customers[index].chargingDate == undefined || vm.customers[index].chargingDate == null) {
        vm.customers[index].chargingDate = new Date('2000/01/01').toISOString().split('T')[0].replace('-', '/').replace('-', '/');
        vm.customers[index].chargingDateDiffDays = diffDays(vm.customers[index].chargingDate);
      }
    }
  }



  var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds            
  var secondDate = new Date();

  function diffDays(date) {
    var firstDate = new Date(date);
    return Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay)));
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
};


StatusChargingController.$inject = ['$scope', '$interval', 'FoneclubeService', 'PagarmeService']; 
