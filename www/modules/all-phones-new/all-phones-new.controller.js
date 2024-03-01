/**
CAUTION, IMPORTANT

All this code is not following patterns. The pattern we trying to follow is: 
https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md

Please do not reaply any of pattern or the this code, structure or techniques 
used here in this file or the code will not be aproved. 

This page will be organized and refactored but we can not do it now. 
This page represent all that we do not want in code technique and pattern.

For example: 
1. We do not use jquery approach, we use angularJS .
2. We do not need use ajax, we have http service on foneclube.service
3. Avoid use Scope, use vm.

Maybe you will find other pages that are not following fully the desired patterns 
But we have the a lot of samples in the project and especially the guide:
https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md

 */

angular
  .module('foneClub')
  .controller('AllPhoneNewController', AllPhoneNewController);


function AllPhoneNewController($scope, $interval, FoneclubeService, PagarmeService) {

  var vm = this;
  vm.planOptions;
  vm.result;
  vm.filtroCliente = false;

  $scope.initPageLoad = function () {
    this.AllPhoneData();

    this.BindDropDowns();
  }

  $scope.RemoveService = function (serviceId, phoneId) {
    // 
    var removeUrl = FoneclubeService.getAPIUrl() + '/manager/phones/extra/service/insert/deactive';
    $.ajax({
      url: removeUrl,
      type: 'POST',
      data: {
        'Id': phoneId,
        'Servicos[0].Id': serviceId
      },
      dataType: 'json',
      success: function (data) {
        $scope.ShowSystemAlert('Service Removed Successfully!');

        $("#phoneService").data("kendoGrid").dataSource.read();
        $("#phoneService").data("kendoGrid").refresh();

        $("#allphoneGrid").data("kendoGrid").dataSource.read();
        $("#allphoneGrid").data("kendoGrid").refresh();


        $("#customerAllPhoneGrid").data("kendoGrid").dataSource.read();
        $("#customerAllPhoneGrid").data("kendoGrid").refresh();

        $scope.MonthlySubscription();
      }
    });
  }

  $scope.AddNewService = function (personPhoneId) {
    $('#accountServicesModel').modal('show');
    $('#hdnPersonPhoneId').val(personPhoneId);

    var readUrl = FoneclubeService.getAPIUrl() + '/manager/phones/Service/ByPerson?personId=' + personPhoneId;
    $scope.phoneServiceDataSource = new kendo.data.DataSource({
      type: "json",
      transport: { read: readUrl },
      serverPaging: false,
      serverSorting: false
    });
    $scope.phoneServiceGridOptions = {
      dataSource: $scope.phoneServiceDataSource,
      columns: [
        { field: "ServiceName", width: "180px", title: "Service" },
        { field: "ActiveDate", width: "180px", title: "Active Date" },
      ]
    }
  }

  $scope.AllPhoneData = function () {
    SetGridProperties();

    var allServicesUrl = FoneclubeService.getAPIUrl() + '/manager/phones/extra/services';
    $("#phoneServices").kendoDropDownList({
      dataTextField: "Descricao",
      dataValueField: "Id",
      dataSource: {
        transport: {
          read: {
            dataType: "json",
            url: allServicesUrl,
          }
        }
      }
    });


  }

  $scope.closeCustomers = function () {
    $('#allCustomerModel').hide();
    $('#hdnPhoneNumber').val('');
  }

  $scope.ShowAllCustomers = function (phoneNumber) {
    $('#allCustomerModel').show();
    $('#hdnPhoneNumber').val(phoneNumber);
  }

  $scope.CCID = function (value) {
    debugger
  }

  $scope.showtabInfo = function (tabNumber) {
    $('#btnCustomerTab').removeClass('btn-default');
    $('#btnCustomerTab').removeClass('btn-info');
    $('#btnPhoneTab').removeClass('btn-default');
    $('#btnPhoneTab').removeClass('btn-info');

    $('#CustomerDetail-Container').hide();
    $('#PhoneDetail-Container').hide();

    if (tabNumber == 1) {
      $('#btnCustomerTab').addClass('btn-info');
      $('#btnPhoneTab').addClass('btn-default');
      $('#CustomerDetail-Container').show();
    }
    else {
      $('#btnCustomerTab').addClass('btn-default');
      $('#btnPhoneTab').addClass('btn-info');
      $('#PhoneDetail-Container').show();


      $('#hdnRecordId').val(0);
      $('#hdnPersonPhoneId').val(0);
      $('#hdnIsPrecoVip').val();
      $('#hdnEditPhoneNumber').val('');

      $('#phoneDetailTitle').html('Add New Phone');
      $("#AmoutPrecoVip").kendoNumericTextBox({
        value: 0.00
      });

      var url = FoneclubeService.getAPIUrl() + '/manager/phones/Available/Numbers?number=';
      $("#PhoneNumber").kendoDropDownList({
        optionLabel: "Select",
        dataTextField: "DisplayPhone",
        dataValueField: "CompletePhone",
        dataSource: {
          transport: {
            read: {
              dataType: "json",
              url: url
            }
          }
        }
      });

    }

  }

  $scope.ShowMessage = function (personId) {
    $('#ShowMessageModel').show();
    $('#hdnPersonPhoneId').val(personId);
  }

  $scope.CancelPhone = function () {
    $('#hdnPersonPhoneId').val(0);
    $('#ShowMessageModel').hide();
  }

  $scope.DeactivePhone = function () {

    var personId = $('#hdnPersonPhoneId').val();
    $scope.ActivateDeactivePhone(personId, false);
    $('#ShowMessageModel').hide();
  }

  $scope.ActivateDeactivePhone = function (personId, activate) {
    var url = FoneclubeService.getAPIUrl() + '/profile/Phone/Activate/Deactive?personPhoneId=' + personId + '&activate=' + activate;
    $.ajax({
      url: url,
      type: 'GET',
      dataType: 'json',
      success: function (data) {
        $('#hdnPersonPhoneId').val(0);
        $("#allphoneGrid").data("kendoGrid").dataSource.read();
        $("#allphoneGrid").data("kendoGrid").refresh();
      }
    });
  }

  //---------------------------------------------------------------------------------


  $scope.BindDropDowns = function () {

    //Phone Plans


    $("#CustomerPhonePlanId").kendoDropDownList({
      dataTextField: "Description",
      dataValueField: "Id",
      dataSource: {
        transport: {
          read: {
            dataType: "json",
            url: FoneclubeService.getAPIUrl() + '/manager/phones/plans'
          }
        }
      }
    });

    $("#PhonePlanId").kendoDropDownList({
      optionLabel: "Select",
      dataTextField: "Description",
      dataValueField: "Id",
      dataSource: {
        transport: {
          read: {
            dataType: "json",
            url: FoneclubeService.getAPIUrl() + '/manager/phones/plans'
          }
        }
      }
    });
    // All Availabl Phone Numbers
    $("#PhoneNumber").kendoDropDownList({
      optionLabel: "Select",

      dataTextField: "DisplayPhone",
      dataValueField: "CompletePhone",

      dataSource: {
        transport: {
          read: {
            dataType: "json",
            url: FoneclubeService.getAPIUrl() + '/manager/phones/Available/Numbers?number=' + $('#hdnEditPhoneNumber').val()
          }
        }
      }
    });
    //All Phone Plan Extra Services
    //$("#newPhoneOptionId").kendoDropDownList({
    //  optionLabel: "Select",
    //  dataTextField: "Descricao",
    //  dataValueField: "Id",
    //  dataSource: {
    //    transport: {
    //      read: {
    //        dataType: "json",
    //        url: FoneclubeService.getAPIUrl() + '/manager/phones/extra/services',
    //      }
    //    }
    //  }
    //});

    $("#PhoneOperatorId").kendoDropDownList({
      optionLabel: "Select",
      dataTextField: "Name",
      dataValueField: "Id",
      dataSource: {
        transport: {
          read: {
            dataType: "json",
            url: FoneclubeService.getAPIUrl() + '/account/operators',
          }
        }
      }
    });
  }


  $scope.editParentRef = function () {


    $('#parentRefDisplay-container').hide();
    $('#parentRefEdit-container').show();

    $('#editRefButton').hide();
    $('#cancelRefButton').show();
    $('#saveRefButton').show();

    $("#RefParentList").kendoDropDownList({
      optionLabel: "Select",
      dataTextField: "Name",
      dataValueField: "Id",
      dataSource: {
        transport: {
          read: {
            dataType: "json",
            url: FoneclubeService.getAPIUrl() + '/profile/active/customers/parents',
          }
        }
      }
    });

    var parentId = $('#ParentId').html();
    var dropdownlist = $("#RefParentList").data("kendoDropDownList");
    dropdownlist.value(parentId);

  }
  $scope.cancelParentRef = function () {
    $('#parentRefDisplay-container').show();
    $('#parentRefEdit-container').hide();

    $('#editRefButton').show();
    $('#cancelRefButton').hide();
    $('#saveRefButton').hide();

  }
  $scope.saveParentRef = function () {

    var ddParentReference = $("#RefParentList").data("kendoDropDownList");


    var parentId = ddParentReference.value();
    var parentName = ddParentReference.text();
    $.ajax({
      url: FoneclubeService.getAPIUrl() + '/profile/customer/parent/id/insert',
      type: 'Post',
      data: {
        'Id': $('#hdnPersonId').val(),
        'Pai.Id': parentId,
        'Pai.Name': parentName,
      },
      dataType: 'json',
      success: function (data) {
        $scope.ShowSystemAlert('Reference Updated Successfully!');
        $('#ParentName').html(parentName);
        $('#ParentId').html(parentId);
        $scope.cancelParentRef();
      }
    });


  }

  //---------------------------------------------------------------------------------
  $scope.SaveCustomerBasicInfo = function () {
    var url = FoneclubeService.getAPIUrl() + '/profile/customer/SaveBasicInfo';
    $.ajax({
      url: url,
      type: 'Post',
      data: {
        'Name': $('#CustomerName').val(),
        'PersonName': $('#CustomerName').val(),
        'Email': $('#CustomerEmail').val(),
        'DocumentNumber': $('#CustomerDocumentNumber').val(),
        'NickName': $('#CustomerNickName').val(),
        'PersonId': $('#hdnPersonId').val(),
      },
      dataType: 'json',
      success: function (data) {
        $scope.ShowSystemAlert('Customer Information Saved Successfully!');
      }
    });

  }

  $scope.SaveService = function (serviceId) {
    /// manager/phones/ 
    var saveUrl = FoneclubeService.getAPIUrl() + '/manager/phones/extra/service/insert';
    var phoneId = $('#hdnPersonPhoneId').val();
    var serviceId = $('#phoneServices').val();
    $.ajax({
      url: saveUrl,
      type: 'POST',
      data: {
        'Id': phoneId,
        'Servicos[0].Id': serviceId
      },
      dataType: 'json',
      success: function (data) {
        $scope.ShowSystemAlert('Service Successfully Added!');

        $("#phoneService").data("kendoGrid").dataSource.read();
        $("#phoneService").data("kendoGrid").refresh();

        $("#allphoneGrid").data("kendoGrid").dataSource.read();
        $("#allphoneGrid").data("kendoGrid").refresh();


        $("#customerAllPhoneGrid").data("kendoGrid").dataSource.read();
        $("#customerAllPhoneGrid").data("kendoGrid").refresh();

        $scope.MonthlySubscription();
      }
    });
  }

  $scope.SavePersonPhone = function () {

    var url = FoneclubeService.getAPIUrl() + '/manager/phones/Save/PersonPhone';
    var Id = $('#hdnRecordId').val();
    var PersonPhoneId = $('#hdnPersonPhoneId').val();
    var PersonId = $('#hdnPersonId').val();
    var DDNumber;
    var PhoneNumber = $('#PhoneNumber').val();
    var PlanId = $('#PhonePlanId').val();
    var OperatorId = $('#PhoneOperatorId').val();
    //var PlanOptionId = $('#newPhoneOptionId').val();
    var StatusId = $('#hdnStatusId').val();
     
    var AmoutPrecoVip = $('#AmoutPrecoVip').val();

    var newAmoutPrecoVip = 0;

    if (parseInt(AmoutPrecoVip) > 0)
    {
      newAmoutPrecoVip = AmoutPrecoVip * 100;
    }

    var Nickname = $('#PhoneNickName').val();
    var IsActive = true;
    var IsPhoneClube = true;
    var IsPortability = false;
    var IsPrecoVip = $('#hdnIsPrecoVip').val();

    DDNumber = PhoneNumber.substring(0, 2);
    PhoneNumber = PhoneNumber.substring(2, 11);

    $.ajax({
      url: url,
      type: 'Post',
      data: {
        'Id': Id,
        'PersonId': PersonId,
        'PersonPhoneId': PersonPhoneId,
        'DDNumber': DDNumber,
        'PhoneNumber': PhoneNumber,
        'OperatorId': OperatorId,
        'PlanId': PlanId,
        'StatusId': StatusId,
        'AmoutPrecoVip': newAmoutPrecoVip,
        //'PlanOptionId': PlanOptionId,
        'Nickname': Nickname,
        'IsActive': IsActive,
        'IsPhoneClube': IsPhoneClube,
        'IsPortability': IsPortability,
        'IsPrecoVip': IsPrecoVip
      },
      dataType: 'json',
      success: function (data) {
        //Once Record is Saved refresh the Grid
        $("#customerAllPhoneGrid").data("kendoGrid").dataSource.read();
        $("#customerAllPhoneGrid").data("kendoGrid").refresh();

        $('#PhonePlanId').val("");
        $('#PhoneNumber').val(""); 
        $('#PhoneOperatorId').val("");
        $('#hdnPersonPhoneId').val('');
        $('#PhoneNickName').val(""); 
        $('#AmoutPrecoVip').val("0")
        $scope.BindDropDowns();
        $scope.ShowSystemAlert('Record Saved Successfully!');
      }
    });
  }

  $scope.SaveCustomerToPhone = function (personId) {
     

    var phone = $('#hdnPhoneNumber').val();
    var DDNumber = phone.substring(0, 2);
    var PhoneNumber = phone.substring(2, 11);

    var url = FoneclubeService.getAPIUrl() + '/manager/phones/Save/PersonPhone';
    var Id = $('#hdnRecordId').val();
    var PlanId = $('#CustomerPhonePlanId').val();
    var OperatorId = $('#PhoneOperatorId').val();
    //var PlanOptionId = $('#newPhoneOptionId').val();
    var StatusId = $('#hdnStatusId').val();
    var AmoutPrecoVip = $('#AmoutPrecoVip').val();
    var Nickname = $('#PhoneNickName').val();
    var IsActive = true;
    var IsPhoneClube = true;
    var IsPortability = false;
    var IsPrecoVip = $('#hdnIsPrecoVip').val();



    $.ajax({
      url: url,
      type: 'Post',
      data: {
        'Id': Id,
        'PersonId': personId,
        'DDNumber': DDNumber,
        'PhoneNumber': PhoneNumber,
        'OperatorId': OperatorId,
        'PlanId': PlanId,
        'StatusId': StatusId,
        'AmoutPrecoVip': AmoutPrecoVip,
        'PlanOptionId': PlanOptionId,
        'Nickname': Nickname,
        'IsActive': IsActive,
        'IsPhoneClube': IsPhoneClube,
        'IsPortability': IsPortability,
        'IsPrecoVip': IsPrecoVip
      },
      dataType: 'json',
      success: function (data) {
        //Once Record is Saved refresh the Grid
        $("#allphoneGrid").data("kendoGrid").dataSource.read();
        $("#allphoneGrid").data("kendoGrid").refresh();

        $('#allCustomerModel').hide();
        $scope.ShowSystemAlert('Record Saved Successfully!');
      }
    });
  }

  $scope.EditPhoneRecord = function (personPhoneId, phoneNumber, phonePlanId, phoneNickName, phoneOperatorId, amoutPrecoVip) {

    $('#phoneDetailTitle').html('Edit Phone Detail');
    var newAmoutPrecoVip = amoutPrecoVip / 100;

    $("#AmoutPrecoVip").kendoNumericTextBox({
      value: newAmoutPrecoVip
    });

    
    $('#hdnPersonPhoneId').val(personPhoneId); 
    $('#PhoneNickName').val(phoneNickName); 
    $('#hdnEditPhoneNumber').val(phoneNumber);

    var url = FoneclubeService.getAPIUrl() + '/manager/phones/Available/Numbers?number=' + phoneNumber;
    $("#PhoneNumber").kendoDropDownList({
      optionLabel: "Select",
      dataTextField: "DisplayPhone",
      dataValueField: "CompletePhone",
      dataSource: {
        transport: {
          read: {
            dataType: "json",
            url: url
          }
        }
      }
    });


    var ddPhoneNumber = $("#PhoneNumber").data("kendoDropDownList");
    ddPhoneNumber.value(phoneNumber);

    var ddPhonePlan = $("#PhonePlanId").data("kendoDropDownList");
    ddPhonePlan.value(phonePlanId);


    var ddOperator = $("#PhoneOperatorId").data("kendoDropDownList");
    ddOperator.value(phoneOperatorId);

    //------------------------------------------------------------------------
    $('#btnCustomerTab').removeClass('btn-default');
    $('#btnCustomerTab').removeClass('btn-info');
    $('#btnPhoneTab').removeClass('btn-default');
    $('#btnPhoneTab').removeClass('btn-info');
    $('#btnCustomerTab').addClass('btn-default');
    $('#btnPhoneTab').addClass('btn-info');
    $('#CustomerDetail-Container').hide();
    $('#PhoneDetail-Container').show();
    //------------------------------------------------------------------------

  }

  $scope.UpdatePhonePrice = function () {

    var url = FoneclubeService.getAPIUrl() + '/manager/phones/Update/Phone/Price';

    $.ajax({
      url: url,
      type: 'Post',
      data: {
        'Id': $('#hdnPersonId').val(),
        'SinglePrice': $('#payableMontlyPrice').val(),
        'DescriptionSinglePrice': $('#lblMonthlySubscription').html(),
      },
      dataType: 'json',
      success: function (data) {
        $scope.ShowSystemAlert('Price has been updated Successfully!');
      }
    });
  }



  //-------------------------------------------------------------------------------------------- 
  $scope.customerGridDataSource = new kendo.data.DataSource({
    type: "json",
    transport: { read: FoneclubeService.getAPIUrl() + '/profile/all/customers?minimal=true' },
    serverPaging: false,
    serverSorting: false
  });
  $scope.customerGridOptions = {
    dataSource: $scope.phoneServiceDataSource,
    sortable: true,
    scrollable: true,
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
        field: "Id", width: "50px", title: '-'
        , template: "<button type='button' ng-click=\"SaveCustomerToPhone('#=Id#')\" class='btn btn-info btn-xs'><i class='fa fa-plus'></i></button>"
        , filterable: { cell: { showOperators: false } }
      },
      { field: "Name", width: "180px", title: "Name", filterable: { cell: { showOperators: false } } },
      { field: "NickName", width: "180px", title: "Nick Name", filterable: { cell: { showOperators: false } } },
      { field: "DocumentNumber", width: "180px", title: "Document Number", filterable: { cell: { showOperators: false } } },
      { field: "Email", width: "180px", title: "Email", filterable: { cell: { showOperators: false } } }
    ]
  }
  //--------------------------------------------------------------------------------------------

  $scope.showCustomerDetail = function (personId) {
    $('#CustomerDetailModel').show();
    $('#hdnPersonId').val(personId);

    //---------------------------------------------------
    $('#btnCustomerTab').removeClass('btn-default');
    $('#btnCustomerTab').removeClass('btn-info');
    $('#btnPhoneTab').removeClass('btn-default');
    $('#btnPhoneTab').removeClass('btn-info');
    $('#CustomerDetail-Container').hide();
    $('#PhoneDetail-Container').hide();
    $('#btnCustomerTab').addClass('btn-info');
    $('#btnPhoneTab').addClass('btn-default');
    $('#CustomerDetail-Container').show();

    $('#ParentName').html('');
    $('#CustomerNickName').val('');
    $('#CustomerDocumentNumber').val('');
    $('#CustomerEmail').val('');
    $('#CustomerName').val('');

    //-----------------------------------------------------

    $scope.customerSummary();
    $scope.MonthlySubscription();


    debugger;

    $scope.customerAllPhoneGridGridOptions = {
      dataSource: $scope.customerAllPhoneGridDataSource,
      sortable: true,
      scrollable: true,
      height: 300,
      columns: [

        {
          field: "UsoLinha", width: "50px", title: "-"

          , template: "<button type='button' ng-click=\"EditPhoneRecord('#=PersonPhoneId#','#=CompletePhone#', '#=PlanId#', '#=NickName#','#=OperatorId#', '#=AmoutPrecoVip#')\" class='btn btn-info btn-xs'><i class='fa fa-pencil-square-o'></i></button>"
          , attributes: { "class": "#=DisplayOperatorCss#" }
          , filterable: { cell: { showOperators: false } }
        },
        {
          field: "UsoLinha", width: "80px", title: "Linha em Uso"
          , template: " # if (UsoLinha == 1) {#  <button class='btn btn-success btn-xs'>sim</button> #}else{# <button class='btn btn-warning btn-xs'>não</button> #}#"
          , attributes: { "class": "#=DisplayOperatorCss#" }
          , filterable: { cell: { showOperators: false } }
        },
        {
          field: "OperatorId", width: "80px", title: "Operadora Divergente"
          , template: " # if (OperatorId == 1) {#  <button class='btn btn-success btn-xs'>A</button> #}else{# <button class='btn btn-danger btn-xs'>E</button> #}#"
          , attributes: { "class": "#=DisplayOperatorCss#" }
          , filterable: { cell: { showOperators: false } }
        },
        {
          field: "OperatorName", width: "180px", title: "Plano Operadora 1"
          , template: "#:OperatorName# #:MasterOperatorName#"
          , attributes: { "class": "#=DisplayOperatorCss#" }
          , filterable: { cell: { showOperators: true } }
        },
        {
          field: "DisplayPhone", width: "180px", title: "Telefone"
          , template: "#:DisplayPhone#", attributes: { "class": "#=DisplayOperatorCss#" }
          , filterable: { cell: { showOperators: false } }
        },
        {
          field: "PhoneServices"
          , width: "180px"
          , title: "Servico da linha"

          , template: function (dataItem) {
            var personPhoneId = dataItem.PersonPhoneId;
            var temp = "<ul class='activeServicesContainer'>";
            if (dataItem.PhoneServices != undefined) {
              for (var i = 0; i < dataItem.PhoneServices.length; i++) {
                var item = dataItem.PhoneServices[i];
                var serviceName = item.ServiceName;
                var serviceId = item.ServiceId;
                temp = temp + "<li class='activeService'>"
                  + "<button class='btn btn-info btn-xs' ng-click='RemoveService(" + serviceId + "," + personPhoneId + ")'>"
                  + serviceName
                  + "<i class='fa fa-times'></i>"
                  + "</button ></li > ";
              }
            }
            temp = temp + "<li class='activeService '><button class='btn btn-success btn-xs'  ng-click='AddNewService(" + personPhoneId + ")'><i class='fa fa-plus'></i></button></li>";
            temp = temp + "</ul>";
            return temp;
          }
          , attributes: { "class": "#=DisplayOperatorCss#" }
          , filterable: { cell: { showOperators: false } }
        },
        {
          field: "IsActive", width: "80px", title: "Ativa"
          , template: " # if (IsActive == 1) {#  <button type='button' ng-click='ShowMessage(#=PersonPhoneId#)' class='btn btn-success btn-xs'>On</button> #}else{# <button type='button' ng-click='ActivateDeactivePhone(#=PersonPhoneId#,true)' class='btn btn-danger btn-xs'>Off</button> #}#"
          , attributes: { "class": "#=DisplayOperatorCss#" }
          , filterable: { cell: { showOperators: false } }
        },
        {
          field: "PlanDescription", width: "120px", title: "Plano Fc"
          , template: "#:PlanDescription#", attributes: { "class": "#=DisplayOperatorCss#" }
          , filterable: { cell: { showOperators: false } }
        },
        {
          field: "PlanCost", width: "120px", title: "Preco Fc"
          , template: "#:DisplayPlanCost#", attributes: { "class": "#=DisplayOperatorCss#" }
          , filterable: { cell: { showOperators: false } }
        },
        {
          field: "AmoutPrecoVip", width: "80px", title: "Preco VIP"
          , template: "#:DisplayAmoutPrecoVip#"
          , attributes: { "class": "#=DisplayOperatorCss#" }
          , filterable: { cell: { showOperators: false } }
        },
        {
          field: "NickName", width: "180px", title: "Apelido"
          , attributes: { "class": "#=DisplayOperatorCss#" }
          , filterable: { cell: { showOperators: false } }
        },
      ]

    }
  }



  $scope.hideCustomerDetail = function () {
    $('#CustomerDetailModel').hide();
    $('#hdnPersonId').val(0);
  }
  //--------------------------------------------------------------------------------------------

  $scope.customerSummary = function () {
    // 
    var url = FoneclubeService.getAPIUrl() + '/profile/cliente/id/' + $('#hdnPersonId').val()
    $.ajax({
      url: url,
      type: 'Get',
      dataType: 'json',
      success: function (data) {

        $('#ParentName').html(data.Pai.Name);
        $('#ParentId').html(data.Pai.Id);

        $('#CustomerNickName').val(data.NickName);
        $('#CustomerDocumentNumber').val(data.DocumentNumber);
        $('#CustomerEmail').val(data.Email);
        $('#CustomerName').val(data.Name);
      }
    });
  }

  $scope.ShowSystemAlert = function (msg) {
    $('#Content-Alert').show();
    $('#Content-AlertMessage').html(msg);
    var target = $('#Content-Alert');
    if (target.length) {
      $('html, body').stop().animate({ scrollTop: target.offset().top }, 1000);
    }
    $("#Content-Alert").delay(2000).fadeOut(2000);
  }

  $scope.MonthlySubscription = function () {

    if (parseInt($('#hdnPersonId').val()) == 0)
      return;


    var url = FoneclubeService.getAPIUrl() + '/manager/phones/GetMonthly/Subscription?personId=' + $('#hdnPersonId').val()
    $.ajax({
      url: url,
      type: 'Get',
      dataType: 'json',
      success: function (data) {
        $('#lblMonthlySubscription').html('R$ ' + data);
        $('#hdnMonthlySubscription').html('R$ ' + data);
      }
    });
  }

  function SetGridProperties() {
    var pageHeight = $(window).height() - 110;
    var readUrl = FoneclubeService.getAPIUrl() + '/manager/phones/All/Phones';

    $scope.allphoneDataSource = new kendo.data.DataSource({
      type: "json",
      transport: { 
        read: {
          dataType: "json",
          url: readUrl,
        }
      },
      serverPaging: false,
      serverSorting: false,
      schema: {
        model: {
          fields: {
            // PlanCost: { type: "number" },
            // AmoutPrecoVip: { type: "number" },
            // CalculateAmoutPrecoVip: { type: "number" },
            // CalculatePlanCost: { type: "number" }
            // ,CCID: { type: "string" }
          }
        }
      },

    });

    // console.log('works')
    // debugger;
    //  console.log($scope.allphoneDataSource)

    $scope.allphoneGridOptions = {
      dataSource: $scope.allphoneDataSource,
      height: pageHeight,
      toolbar: ["excel"],
      excel: {
        allPages: true,
        fileName: "phone Report.xlsx",
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
          string: { contains: "Contains" },
          number: { gte: "Greater Than" }

        }
      },
      columns: [
        {
          field: "DisplayUsoLinha", width: "80px", title: "Linha em Uso"
          , template: " # if (UsoLinha == 1) {#  <button class='btn btn-success btn-xs'>sim</button> #}else{# <button class='btn btn-warning btn-xs'>não</button> #}#"
          , attributes: { "class": "#=DisplayOperatorCss#" }
          , filterable: { cell: { showOperators: false } }
        },
        {
          field: "DisplayOperator", width: "80px", title: "Operadora Divergente"
          , template: " # if (OperatorId == 1) {#  <button class='btn btn-success btn-xs'>A</button> #}else{# <button class='btn btn-danger btn-xs'>E</button> #}#"
          , attributes: { "class": "#=DisplayOperatorCss#" }
          , filterable: { cell: { showOperators: false } }
        },
        {
          field: "DisplayPlanoOperador", width: "180px", title: "Plano Operadora 3"
          , template: "#:DisplayPlanoOperador#"
          , attributes: { "class": "#=DisplayOperatorCss#" }
          , filterable: { cell: { showOperators: false, operator: "contains", template: function (args) { args.element.css("width", "90%").addClass("k-textbox").attr("data-value-update", "keyup"); }, } }
        },
        {
          field: "CompletePhone", width: "180px", title: "Telefone"
          , template: "#:DisplayPhone#", attributes: { "class": "#=DisplayOperatorCss#" }
          , filterable: { cell: { showOperators: false, operator: "contains", template: function (args) { args.element.css("width", "90%").addClass("k-textbox").attr("data-value-update", "keyup"); }, } }
        },
        {
          field: "CCID", width: "180px", title: "CCID"
          , template: "#:CCID#"
          , attributes: { "class": "#=DisplayOperatorCss#" }
          , filterable: { cell: { showOperators: false } }
        },
        {
          field: "CodigoCliente", width: "180px", title: "Cod. Cliente"
          , template: "#:CodigoCliente#"
          , attributes: { "class": "#=DisplayOperatorCss#" }
          , filterable: { cell: { showOperators: false } }
        },
        {
          field: "RazaoSocial", width: "180px", title: "Razao Social"
          , template: "#:RazaoSocial#"
          , attributes: { "class": "#=DisplayOperatorCss#" }
          , filterable: { cell: { showOperators: false } }
        },
        {
          field: "PersonName", width: "180px", title: "Cliente 2"
          , template: "# if( PersonName == '~') {#  <button class='btn btn-success btn-xs' ng-click='ShowAllCustomers(#:CompletePhone#)'><i class='fa fa-plus'></i></button>   #} else {# <div><a ng-click='showCustomerDetail(#:PersonId#)'> #=PersonName# </a></div>  #}# "
          , attributes: { "class": "#=DisplayOperatorCss#" }
          , filterable: { cell: { showOperators: false, operator: "contains", template: function (args) { args.element.css("width", "90%").addClass("k-textbox").attr("data-value-update", "keyup"); }, } }
        },
        {
          field: "PhoneServices", width: "180px", title: "Servico da linha"
          , template: function (dataItem) {
            var personPhoneId = dataItem.PersonPhoneId;
            var temp = "<ul class='activeServicesContainer'>";
            if (dataItem.PhoneServices != undefined) {
              for (var i = 0; i < dataItem.PhoneServices.length; i++) {
                var item = dataItem.PhoneServices[i];
                var serviceName = item.ServiceName;
                var serviceId = item.ServiceId;
                temp = temp + "<li class='activeService'>"
                  + "<button class='btn btn-info btn-xs' ng-click='RemoveService(" + serviceId + "," + personPhoneId + ")'>"
                  + serviceName
                  + "<i class='fa fa-times'></i>"
                  + "</button ></li > ";
              }
            }
            temp = temp + "<li class='activeService '><button class='btn btn-success btn-xs'  ng-click='AddNewService(" + personPhoneId + ")'><i class='fa fa-plus'></i></button></li>";
            temp = temp + "</ul>";
            return temp;
          }
          , attributes: { "class": "#=DisplayOperatorCss#" }
          , filterable: false
        },


        {
          field: "IsActive", width: "80px", title: "Ativa"
          , template: " # if (IsActive == 1) {#  <button type='button' ng-click='ShowMessage(#=PersonPhoneId#)' class='btn btn-success btn-xs'>On</button> #}else{# <button type='button' ng-click='ActivateDeactivePhone(#=PersonPhoneId#,true)' class='btn btn-danger btn-xs'>Off</button> #}#"
          , attributes: { "class": "#=DisplayOperatorCss#" }
          , filterable: { cell: { showOperators: false } }
        },
        {
          field: "PlanDescription", width: "120px", title: "Plano Fc"
          , template: "#:PlanDescription#", attributes: { "class": "#=DisplayOperatorCss#" }
          , filterable: { cell: { showOperators: false, template: function (args) { args.element.css("width", "90%").addClass("k-textbox").attr("data-value-update", "keyup"); }, } }
        },

        {
          field: "CalculatePlanCost", width: "120px", title: "Preco Fc"
          , template: "#:DisplayPlanCost#", attributes: { "class": "#=DisplayOperatorCss#" }
          , filterable: { cell: { showOperators: false, template: function (args) { args.element.css("width", "90%").addClass("k-textbox").attr("data-value-update", "keyup"); }, } }
        },

        {
          field: "CalculateAmoutPrecoVip", width: "80px", title: "Preco VIP"
          , template: "#:DisplayAmoutPrecoVip#"
          , attributes: { "class": "#=DisplayOperatorCss#" }
          , filterable: { cell: { showOperators: false, template: function (args) { args.element.css("width", "90%").addClass("k-textbox").attr("data-value-update", "keyup"); }, } }
        },
        {
          field: "NickName", width: "180px", title: "Apelido"
          , attributes: { "class": "#=DisplayOperatorCss#" }
          , filterable: { cell: { showOperators: false, operator: "contains", template: function (args) { args.element.css("width", "90%").addClass("k-textbox").attr("data-value-update", "keyup"); }, } }
        },
      ]
    }

  }
};

AllPhoneNewController.$inject = ['$scope', '$interval', 'FoneclubeService', 'PagarmeService']; 

/**
CAUTION, IMPORTANT

All this code is not following patterns. The pattern we trying to follow is: 
https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md

Please do not reaply any of pattern or the this code, structure or techniques 
used here in this file or the code will not be aproved. 

This page will be organized and refactored but we can not do it now. 
This page represent all that we do not want in code technique and pattern.

For example: 
1. We do not use jquery approach, we use angularJS .
2. We do not need use ajax, we have http service on foneclube.service
3. Avoid use Scope, use vm.

Maybe you will find other pages that are not following fully the desired patterns 
But we have the a lot of samples in the project and especially the guide:
https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md

 */
