angular.module('foneClub').controller('CustomersControllerNew2', CustomersControllerNew2).directive('setFocus',function(){
	return {
	   link:  function(scope, element, attrs){
		 element.bind('click',function(){
				//alert(element.attr('id'));
			  document.querySelector('#' + attrs.setFocus).focus();
		  })
	   }
	 }
})

//CustomersControllerNew.inject = ['localStorageService']

function CustomersControllerNew2($interval, FoneclubeService, PagarmeService, FlowManagerService, $filter, ViewModelUtilsService, localStorageService,DialogFactory,UtilsService) {

	var vm = this;
	var CARTAO = 1;
	var BOLETO = 2;
	var PIX = 3;
	vm.isMobile = UtilsService.mobileCheck();
	vm.Data = null;
	vm.hidefilters = true;
	vm.searchText = "";
	vm.resultText = "";
	vm.includeActive = true;
	vm.includeInActive = false;
	vm.clipBoardCopiedText = "";
	vm.filterTextInAllCols = false;
	vm.filterTextInNameOnly = false;
	vm.includeStatusGreen = false;
	vm.includeStatusYellow = false;
	vm.includeStatusRed = false;
	vm.includeStatusGray = false;
	vm.includeStatusNan = false;
	vm.gridHeight = $(window).height();
	vm.onTapSwitchActivate = onTapSwitchActivate;
	vm.onTapCustomer = onTapCustomer;
	vm.onTapCustomerEdit = onTapCustomerEdit;
	vm.onTapMessage = onTapMessage;
	vm.onTapFlag = onTapFlag;
	vm.onTapComment = onTapComment;
	vm.onTapPix = onTapPix;
	vm.onTapNewCardPayment = onTapNewCardPayment;
	vm.onTapBoletoPayment = onTapBoletoPayment;
	vm.onTapBoleto = onTapBoleto;
	vm.onTapDebito = onTapDebito;
	vm.onDeleteCustomer = onDeleteCustomer;
	vm.onUnDeleteCustomer = onUnDeleteCustomer;
	vm.onPageLoad= onPageLoad;
	vm.showFilterSection = showFilterSection;
	vm.filterText = filterText;
	vm.filterClients = filterClients;
	vm.pasteCliboardText = pasteCliboardText;
	vm.onClipBoardSuccess = onClipBoardSuccess;
	vm.importDrCelular = importDrCelular;
	vm.exportToExcel = exportToExcel;
	vm.testWhatsApp = testWhatsApp;
	vm.saveState = saveState;
	vm.deleteState = deleteState;
    vm.updateState = updateState;
	vm.getAgGridState = getAgGridState;
	vm.BlockUnlockLine = BlockUnlockLine;
	vm.checkRepeatOrder = checkRepeatOrder;
	
	const customNumberComparator = (valueA, valueB) => {
		if(valueA =="OFF" || valueB=="OFF"){
			valueA = valueA;
		}
    	valueA = (valueA == null || valueA == "" || valueA == "OFF") ? "-1" : valueA.replace(" GB","").replace(",","").replace("R$","");
    	valueB = (valueB == null || valueB == "" || valueB == "OFF") ? "-1" : valueB.replace(" GB","").replace(",","").replace("R$","");
    	if (parseInt(valueA) == parseInt(valueB)) return 0;
    	return (parseInt(valueA) > parseInt(valueB)) ? 1 : -1;
  	};

	vm.gridOptions = {
		components: {
			personComponent : PersonComponent,
			customDateComponent : CustomDateComponent
		},
		columnDefs: setColumnDefs(),
		onCellValueChanged: function(event) {
			if(event!=null && event.data!=null){
				var nextAction = 
				{
					Id : event.data.Id,
					NextActionDate : new Date(event.data.NextActionDate),
					NextActionText: event.data.NextAction
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
		rowHeight: UtilsService.mobileCheck() ? 40: 30,
		headerHeight: UtilsService.mobileCheck() ? 50: 100,
		angularCompileRows: true,
		onGridReady: function (params) {
			this.gridApi = params.api;
    		this.gridColumnApi = params.columnApi;
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



	//BEGIN: New Functions
	//BEGIN: AG-Grid
	function setColumnDefs() {
		var columnDefs = [
			{ hide: true, field: 'Id' },
			// On/Off color
			{
				headerName: '',
				field: 'Desativo',
				width: 30,
				pinned:'left',
				cellRenderer: function (params) {
					var cellHtml = "";
						cellHtml='<a title="' + (!params.value ? "Desativar cliente" : "Ativar cliente") +'" ng-click="vm.onTapSwitchActivate(' + params.node.data.Id + ', ' + params.node.id + ')" ><img class="imgOnOff link" src="content/img/'+(!params.value ? 'customeron.png' : 'customeroff.png') + '" /></a>';
					return cellHtml;
				},
				filter: true,
			},
			// payment color
			{
				headerName: '$',
				field: 'PaymentStatusColor',
				width: 30,
				pinned:'left',
				cellRenderer: function (params) {
					if(params.value == "green")
						return "<img class='imgWhatsapp link' src='content/img/dollar-green.png' />";
					else if(params.value == "red")
						return "<img class='imgWhatsapp link' src='content/img/dollar-red.png' />";
					else if(params.value == "yellow")
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
				pinned:'left',
				cellRenderer: function (params) {
					params.value= "../../content/img/message-green.png";
					if (params.value == '../../content/img/message-red.png') {
						return "<a ng-click='vm.onTapMessage(" + params.node.data.Id + ")' title='UnRegistered'><img class='imgWhatsapp link' src=" + params.value + " /></a>";
					} else {
						return "<a ng-click='vm.onTapMessage(" + params.node.data.Id + ")' title='Registered'><img class='imgWhatsapp link' src=" + params.value + " /></a>";
					}
				},
				filter: false
			},
			// customer name
			{
				headerName: 'Name',
				field: 'Name',
				width: 250,
				pinned:'left',
				cellRenderer: function (params) {
					return "<a ng-click='vm.onTapCustomerEdit(" + params.node.data.Id + ",\""+ params.node.data.DocumentNumber+"\")' class='black-link'>" + params.value + "</a>";
				},
				filter: 'personComponent',
			},
			// buttons
			{
				headerName: '',
				field: '',
				width: 230,
				cellRenderer: function (params) {
					var cellHtml = "";
					//var customer = findCustomerById(params.node.data.Id);
					
					cellHtml += '<a ng-click="vm.onTapCustomer(' + params.node.data.Id + ')" title="Financeiro"><img class="imgUsd link" src="content/img/usd.jpeg" /></a>';
					cellHtml += '&nbsp;&nbsp;<a ng-click="vm.checkRepeatOrder(' + params.node.data.Id + ')" title="Repetir Última Cobrança"><img class="imgrepeatcharge link" src="content/img/repeatcharge.png" /></a>';
					cellHtml += '&nbsp;<a ng-click="vm.onTapPix(' + params.node.data.Id + ')" title="PIX"><img class="imgPix link" src="content/img/pix.png" /></a>';
					cellHtml += '&nbsp;<a ng-click="vm.onTapBoleto(' + params.node.data.Id + ')" title="BOLETO"><img class="imgBoleto link" src="content/img/BoletoIcon.png" /></a>';
					cellHtml += '&nbsp;<a ng-click="vm.onTapNewCardPayment(' + params.node.data.Id + ')" title="Credit Card"><img class="imgcc link" src="../../content/img/creditcard.png" /></a>';
					cellHtml += '&nbsp;<a ng-click="vm.onTapFlag(' + params.node.data.Id + ')" title="Criar Flag"><img class="imgcc link" src="content/img/pflag.png" /></a>';
					cellHtml += '&nbsp;<a title="Soft delete" ng-click="vm.onDeleteCustomer(' + params.node.data.Id + ', ' + params.node.id + ');$event.preventDefault();"><img class="imgPix link" src="content/img/cancel.png" /></a>';
					cellHtml += '&nbsp;<a title="Un delete" ng-click="vm.onUnDeleteCustomer(' + params.node.data.Id + ', ' + params.node.id + ')"><img class="imgPix link" src="content/img/undelete.jpg" /></a>';
					cellHtml += '&nbsp;<a ng-click="vm.onTapComment(' + params.node.data.Id + ')" title="Ordem de Serviço" ><img class="imgPix link" src="content/img/serviceorder.png" /></a>';
					// if (customer.PendingFlagInteraction) {
					// 	cellHtml += '&nbsp;<a title="Cliente com flag pendente!" class="btn btn-warning"><i>&#9873;</i></a>';
					// }
					// if (customer.Orphan) {
					// 	cellHtml += '&nbsp;<button title="Cliente com problema no cadastro!" class="btn btn-warning"><i class="glyphicon glyphicon-exclamation-sign"></i></button>';
					// }
					
					return cellHtml;
				},
				filter: false
			},
			{
				headerName: 'Agendado',
				field: 'Agendado',
				width: 85,
				editable:true,
				filter: true,
				cellRenderer: function (params) {
					return "<label>" + params.value + "</label>";
				},
				comparator: (valueA, valueB, nodeA, nodeB, isDescending) => valueA - valueB,
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
			// Ult Pag Dias
			{
				headerName: 'Ult. $ Dias',
				field: 'UltPagDias',
				colId: 'Ult. Pag. Dias',
				width: 105,
				cellRenderer: function (params) {
					if(params.value >= 0)
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
				field: 'ContelStatus',
				width: 95,
				cellRenderer: function (params) {
					if (params.value == "A") {
						return '<a ng-click="vm.BlockUnlockLine(\''+params.value+'\', '+params.node.data.Id+', ' + params.node.id + ')" href="javascript:void(0);" title="Ativa"><img class="imgUsd link" style="max-width:16px" src="content/img/phone-green.png" /></a>';
					}
					else if (params.value == "C") {
						return '<a ng-click="vm.BlockUnlockLine(\''+params.value+'\', '+params.node.data.Id+', ' + params.node.id + ')" href="javascript:void(0);" title="Cancelada"><img class="imgUsd link" style="max-width:16px" src="content/img/phone-black.png" /></a>';
					} else if (params.value == "B") {
						return '<a ng-click="vm.BlockUnlockLine(\''+params.value+'\', '+params.node.data.Id+', ' + params.node.id + ')"  title="Bloqueada" style=""><img class="imgUsd link" style="max-width:16px" src="content/img/phone-red.png" /></a>';
					}
					else{
						return '<a class="circle_red1" ng-click="vm.BlockUnlockLine(\''+params.value+'\', '+params.node.data.Id+', ' + params.node.id + ')"></a>';
					}
				}
			},
			// Status Cob   (Select Filter)            
			{
				headerName: 'Status $',
				field: 'Status',
				width: 95,
				cellRenderer: function (params) {
					if (params.value == 'Atrasado') {
						return "<label style='color:red;font-weight:bold'>" + params.value + "</label>";
					} else {
						return "<label>" + params.value + "</label>";
					}
				}
			},
			// Ultima Cob
			{
				headerName: 'Ultima Cob.',
				field: 'UltimaCob',
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
				field: 'VIPSum',
				width: 120,
				cellRenderer: function (params) {
					return "<label>" + params.value + "</label>";
				},
          		comparator: customNumberComparator
			},
			{
				headerName: 'Next Action',
				field: 'NextActionDate',
				editable:true,
				width: 120,
				cellRenderer: 'customDateComponent',
				filter: false
			},
			// payment color
			{
				headerName: 'Envio $',
				field: 'Envio',
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
				field: 'NextAction',
				editable:true,
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
				field: 'TIPO',
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
			{
				headerName: 'Vigência pendente',
				field: 'PendingVigencias',
				width: 120,
				cellRenderer: function (params) {
					return "<label>" + params.value + "</label>";
				},
			},
			{
				headerName: 'Sem Pgmto',
				field: 'SemPgmto',
				width: 120,
				cellRenderer: function (params) {
					var cellHtml = "";
						cellHtml='<a><img class="imgOnOff link" src="content/img/'+(params.value ? 'customeron.png' : 'customeroff.png') + '" /></a>';
					return cellHtml;
				},
			},
			// Ult Pag Data
			{
				headerName: 'Ult. Pago',
				field: 'UltPago',
				width: 100,
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
				field: 'LastPaidAmount',
				width: 100,
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
				field: 'UltimaCobDate',
				width: 100,
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
				field: 'UltimaCobAmount',
				width: 100,
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
		var rowData = data;

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
		findCustomerById();
		var filteredData = $filter('filter')(vm.Data, function (data) {
			if (data) {
				return ((excludeAllFilters()) ||
					(filterByText(data)) &&
					((!vm.includeActive && !vm.includeInActive) ||
						(vm.includeActive ?  data.Desativo ==undefined ? true: data.Desativo == false : false) ||
						(vm.includeInActive ? data.Desativo ==undefined ? false: data.Desativo == true : false)) &&

					// (vm.excludeProblema ? !data.Orphan : true) &&
					// (vm.excludeFlag ? !data.PendingFlagInteraction : true) &&
					// (vm.excludeFather ? !data.NameParent : true) &&
					// (vm.excludeAddress ? !data.Adresses.length : true) &&

					// ((!vm.excludeWhatsappUsers && !vm.includeWhatsappUsers) ||
					// 	(vm.excludeWhatsappUsers ? (!data.WClient || !data.fullData.WClient.IsRegisteredWithChat2Desk) : false) ||
					// 	(vm.includeWhatsappUsers ? (data.fullData.WClient && data.fullData.WClient.IsRegisteredWithChat2Desk) : false)) &&

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
		vm.resultText = filteredData.length + " of " + vm.Data.length + " items";
		bindAgGrid(filteredData);
		UpdateLastSelected();
		vm.loading = false;
	}

	function filterByText(data) {
		if (vm.searchText) {
			vm.searchText = vm.searchText.replace(".","").replace("-","");
			var tempsearchText = vm.searchText.replace("(","").replace(")","").replaceAll(" ","");
			if(!isNaN(tempsearchText))
			{
				vm.searchText = tempsearchText;
			}

			vm.searchText = vm.searchText.toLowerCase();

			if (vm.filterTextInAllCols && !vm.filterTextInNameOnly) {
				return data.Id.toString().toLowerCase().indexOf(vm.searchText) > -1 ||
					data.Name.toLowerCase().indexOf(vm.searchText) > -1 ||
					data.Email.toLowerCase().indexOf(vm.searchText) > -1 ||
					(data.DocumentNumber ? data.DocumentNumber.toLowerCase().indexOf(vm.searchText) > -1 : false) ||
					(data.NickName ? data.NickName.toLowerCase().indexOf(vm.searchText) > -1 : false) ||
					//(data.fullData.Born ? data.fullData.Born.toLowerCase().indexOf(vm.searchText) > -1 : false) ||
					(data.IdPagarme ? data.IdPagarme.toString().indexOf(vm.searchText) > -1 : false) ||
					matchPhone(data.Phones, vm.searchText) ||
					matchPhoneNickName(data.Phones, vm.searchText) ||
					matchICCID(data.Phones, vm.searchText) ||
					matchPortNumber(data.Phones, vm.searchText)
			} else {
				return data.Name.toLowerCase().indexOf(vm.searchText) > -1  || (data.DocumentNumber ? data.DocumentNumber.toLowerCase().indexOf(vm.searchText) > -1 : false) || matchPhone(data.Phones, vm.searchText) || matchICCID(data.Phones, vm.searchText) || UtilsService.checkContains(UtilsService.removeAccents(data.Name.toLowerCase()), UtilsService.removeAccents(vm.searchText));
				//return data.Name.toLowerCase().indexOf(vm.searchText) > -1;
			}
		} else {
			return true;
		}
	}

	function filterStatusColor(data, color) {
		return data.PaymentStatusColor == color;
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
					return (data.Number ? "55" + (data.DDD + "" + data.Number).indexOf(numberToCompare) > -1 : false);
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
					return (data.PortNumber ? data.PortNumber.replace("-","").replace("(","").replace(")","").replaceAll(" ","").indexOf(numberToCompare) > -1 : false);
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
						var index = vm.Data.indexOf(vm.Data.filter(v => v.Id == id)[0]);
						if (index >= 0) {
							vm.Data[index].Desativo = c.Desativo;
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
		var addComment = chargeMsg.ChargingComment !=undefined && chargeMsg.ChargingComment!=null?"*"+chargeMsg.ChargingComment+"*":"";
		var chargesummaryurl = window.location.origin+"/#/chargesummary/"+custId+"/"+chargeMsg.Id;

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

	function SetSessionForRowClick(id){
		sessionStorage.setItem('lastClickedRowClient', id);
    	UpdateLastSelected();
	}

	function onTapCustomerEdit(id, cpf) {
		SetSessionForRowClick(id);
		FoneclubeService.getCustomerByCPF(UtilsService.clearDocumentNumber(cpf)).then(function (result) {
                var data = {
                  Id : result.Id,
                  CPF : result.DocumentNumber,
                  Nome : result.Name,
                  Use2Prices: result.Use2Prices,
                  IsVIP: result.IsVIP,
                  Referral: result.Referral,
                  Phones : result.Phones,
                  Email : result.Email,
                  Parent : result.Pai,
                  SoftDelete : result.Desativo
                }
                ViewModelUtilsService.showPlanSelectionModal(data);
          });
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
	function onTapPix(id){
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

	function exportToExcel() {
		$('.k-grid-excel').trigger("click")
	}

	function testWhatsApp(){
		var dataMessage = {
			ClientIds: "5521982008200,5521981908190",
			Message: vm.searchText.replace(/\|/g, '')
		 };

		FoneclubeService.postSendWhatsAppMessageNew(dataMessage).then(function(result){
			if(result == true)
				alert("Message sent successfully");      
			else
			    alert("Error occured while sending message");         
		});
	}

	function importDrCelular()
	{
		ViewModelUtilsService.showDrCelularImportTemplate();
	}
	function onUnDeleteCustomer(id, nodeId){
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
					var index = vm.Data.indexOf(vm.Data.filter(v => v.Id == id)[0]);
					if (index >= 0) {
						vm.Data.splice(index, 1);
						var row = vm.gridOptions.api.getRowNode(nodeId);
						vm.gridOptions.api.updateRowData({ remove: [row.data] });
					}
				}
			});
		//} else {
		//}
	}

	function checkRepeatOrder(customerId){
		FoneclubeService.getChargeAndServiceOrderHistory(customerId).then(function (result){

			//debugger;
			var customer = findCustomerById(customerId);
			if(result!=undefined && result[0]!=undefined && result[0].Charges!=undefined){
				if(result[0].Charges.PaymentType == PIX && result[0].Charges.PixCode != undefined){
					
					ViewModelUtilsService.showModalPIX(customer);
				}
				else if(result[0].Charges.PaymentType == BOLETO){
					ViewModelUtilsService.showModalBoleto(customer);
				}
				else if(result[0].Charges.PaymentType == CARTAO){
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
									  var lastCard = cardsResult.find(x=>x.id == cardId);
									  if(lastCard){
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
					else
					{
						custId = customer.IdPagarme;
						
						PagarmeService.getCard(custId)
        					.then(function (result) {
        					  var cardsResult = result.sort(function (a, b) {
        					    return new Date(b.date_updated) > new Date(a.date_updated) ? 1 : -1;
        					  });
							  var lastCard = cardsResult.find(x=>x.id == cardId);
							  if(lastCard){
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

	function showFilterSection()
	{
		vm.hidefilters = !vm.hidefilters;
	}

	function onPageLoad() {
		loadCustomersNew();
		GetDefaultState();
		LoadAllPhoneLinesInBackground();
	}

	function LoadAllPhoneLinesInBackground(){
		FoneclubeService.getAllPhoneLinesNew().then(function (data) {
              var str = JSON.stringify(data);
	    	  sessionStorage.setItem('allphonelines', LZString.compress(str));
		});
	}

	function GetDefaultState()
	{
		FoneclubeService.getAgGridStates("Customers2").then(function (result){
			if(result!=null){
				vm.agGridStates = result.sort((a,b) => (a.txtStateName  > b.txtStateName ) ? 1 : ((b.txtStateName  > a.txtStateName ) ? -1 : 0));
				var default1 = result.find(x=> x.IsDefault == true);
				if(default1)
				{
					vm.defaultGridState = default1;
					vm.defaultGridState.txtStateName
					getAgGridState(default1);
				}
			}
		});
	}

	function loadCustomersNew(){
		var showLoader = DialogFactory.showLoader("Por favor, aguarde");
		FoneclubeService.getAllCustomersNew().then(function(res){
			vm.Data = res;
			vm.gridOptions.api.setRowData(res);
			getAgGridState("");
			showLoader.close();
			for (var customer in vm.Data) {
			
				var custData = vm.Data[customer].Phones;
				if(custData!= null && !isArray(custData))
				{
					vm.Data[customer].Phones = [];
					var phones = custData.split('|').map(function(data){ return data.split(','); });
					phones.forEach(element => {
						var objPhone = {};
						objPhone.Id = element[0];
						objPhone.DDD = element[1];
						objPhone.Number = element[2];
						objPhone.NickName = element[3];
						objPhone.ICCID = element[4];
						objPhone.PortNumber = element[5];
						objPhone.IsFoneclube = element[6] == 1 ? true : false;
						vm.Data[customer].Phones.push(objPhone);
					});
				}
			}
			
			vm.searchText = sessionStorage.getItem('searchTextMain') == null ? "" : sessionStorage.getItem('searchTextMain');
			filterText();
		});
	}

	function findCustomerById(id) {

		for (var customer in vm.Data) {
			if (vm.Data[customer].Id == id) {
				var custData = vm.Data[customer].Phones;
				if(custData!= null && !isArray(custData))
				{
					vm.Data[customer].Phones = [];
					var phones = custData.split('|').map(function(data){ return data.split(','); });
					phones.forEach(element => {
						var objPhone = {};
						objPhone.Id = element[0];
						objPhone.DDD = element[1];
						objPhone.Number = element[2];
						objPhone.NickName = element[3];
						objPhone.ICCID = element[4];
						objPhone.PortNumber = element[5];
						objPhone.IsFoneclube = element[6] == 1 ? true : false;
						vm.Data[customer].Phones.push(objPhone);
					});
				}
				return vm.Data[customer];
			}
		}
	}

	var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds            
	var secondDate = new Date();

	function diffDays(date) {
		var firstDate = new Date(date);
		return Math.floor(Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay)));
	}

	function onClipBoardSuccess(event){
		//debugger;
		vm.clipBoardCopiedText = event.text;
	}

	function pasteCliboardText(event){
		//debugger;
		vm.searchText = vm.clipBoardCopiedText;
		var $activeElement = angular.element(document.getElementById('filterCustomers'));
		$activeElement.attr('focused', 'yes'); // Example usage
	}
	
	function saveState() {
		var retVal = prompt("Enter save state name : ", "state name here");
		var saveStateData = {
			intId: -1,
			txtStateName : retVal,
			txtAgidName : 'Customers2',
    		txtColumnState : JSON.stringify(vm.gridOptions.columnApi.getColumnState()),
    		txtFilterModel : JSON.stringify(vm.gridOptions.api.getFilterModel()),
    		txtSortModel : JSON.stringify(vm.gridOptions.api.getSortModel())
		}
		if(retVal != "null" && retVal != null)
		{
			FoneclubeService.saveAgGridState(saveStateData).then(function (result){
				alert('Saved successfully')
			});
		}
	}

	function updateState() {
	  var retVal = prompt("Enter save state name to update: ", vm.defaultGridState.txtStateName);
	  var saveStateData = {
      intId: vm.defaultGridState.intId,
			txtStateName : retVal,
			txtAgidName : 'Customers2',
    		txtColumnState : JSON.stringify(vm.gridOptions.columnApi.getColumnState()),
    		txtFilterModel : JSON.stringify(vm.gridOptions.api.getFilterModel()),
    		txtSortModel : JSON.stringify(vm.gridOptions.api.getSortModel())
		}
		FoneclubeService.saveAgGridState(saveStateData).then(function (result){
			alert('Updated successfully')
		});
	}

	function deleteState() {
	  ViewModelUtilsService.showConfirmDialog('Atenção!', 'Are you sure, you want to delete?').then(function(confirm) {
	    if(confirm)
	    {
	      var deleteStateData = {
				intId : vm.defaultGridState.intId,
				txtAgidName : 'Customers2'
			}
	    	FoneclubeService.deleteAgGridState(deleteStateData).then(function (result){
	  			alert('Deleted successfully')      	
	    	});
	    }
	  });
	}

	function BlockUnlockLine(value, custId, nodeId){
		var custName = vm.Data.find(x=>x.Id == custId).Name;
		if(value == "A")
		{
			DialogFactory.dialogConfirm({ titulo: 'Bloqueio de linhas', mensagem: '<span>Deseja bloquear <strong>TODAS</strong> as linhas do ' + custName+'</span>', btn1: 'SIM', btn2: 'Temporariamente' })
        	.then(function (result) {
        	    if (!result) {
					DialogFactory.dialogConfirm({ titulo: 'Bloqueio de linhas', mensagem: 'Tem Certeza', btn1: 'SIM', btn2: 'NÃO' })
        			.then(function (result) {
						  var showLoader = DialogFactory.showLoader("Um momento estamos desbloqueando as linhas.");
						  if (!result) {
							var data = {
								PersonId : custId
							}
							FoneclubeService.permanentBlockLineForCustomer(data).then(function (result){
								if(result!=null)
								{
									showLoader.close();
									var resDisplay = "";
									for(var ir= 0 ; ir < result.length; ir++)
									{
										resDisplay += "Linha: " + result[ir].Linha + " Status: " + result[ir].BlockLineResponse.status + " Mensagem: " + result[ir].BlockLineResponse.mensagem +"<br/>";
									}

	  								ViewModelUtilsService.showConfirmDialog('Success!', resDisplay).then(function (confirm) {
									if (confirm) {
									
										let row = vm.gridOptions.api.getRowNode(nodeId);
										var index = vm.Data.indexOf(vm.Data.filter(v => v.Id == custId)[0]);
										if (index >= 0) {
											vm.Data[index].ContelStatus = "B";
											vm.gridOptions.api.redrawRows({ rowNodes: [row] });
										}
										bindAgGrid(vm.Data);
										GetDefaultState();
										
										var resDisplay = "";

										sessionStorage.setItem('lastClickedRowClient', custId);
    						    		UpdateLastSelected();
									}
									else{
										showLoader.close();
									}
								});
								}
								else{
									showLoader.close();
									DialogFactory.showMessageDialog({mensagem:'Error occured: ' + result});
								}
	    					});
						}
					});
				}
				else{

				}
			});
		}
		else if(value == "B"){
			DialogFactory.dialogConfirm({ titulo: 'Desbloquear linhas', mensagem: '<span>Deseja desbloquear todas as linhas para ' + custName +'</span>', btn1: 'SIM', btn2: 'Temporariamente' })
        	.then(function (result) {
        	    if (!result) {
					var showLoader = DialogFactory.showLoader("Um momento estamos desbloqueando as linhas.");
					var data = {
						PersonId : custId
					}
					FoneclubeService.permanentUnBlockLineForCustomer(data).then(function (result){
						if(result!=null)
						{
							var resDisplay = "";
							showLoader.close();
							for(var ir= 0 ; ir < result.length; ir++)
							{
								resDisplay += "Linha: " + result[ir].Linha + " Status: " + result[ir].BlockLineResponse.status + " Mensagem: " + result[ir].BlockLineResponse.mensagem +"<br/>";
							}

	  						ViewModelUtilsService.showConfirmDialog('Success!', resDisplay).then(function (confirm) {
							if (confirm) {
								let row = vm.gridOptions.api.getRowNode(nodeId);
								var index = vm.Data.indexOf(vm.Data.filter(v => v.Id == custId)[0]);
								if (index >= 0) {
									vm.Data[index].ContelStatus = "A";
									vm.gridOptions.api.redrawRows({ rowNodes: [row] });
								}
								bindAgGrid(vm.Data);
								GetDefaultState();
								sessionStorage.setItem('lastClickedRowClient', custId);
    							UpdateLastSelected();
							}
							else{
								showLoader.close();
							}
						});
						}
						else{
							DialogFactory.showMessageDialog({mensagem:'Error occured: ' + result});
						}
	    			});
				}
				else{

				}
			});
		}
		else{
			alert('Selected customer does not have any contel lines')
		}
	}

	function UpdateLastSelected()
	{
	  let IDofRowToSelect = parseInt(sessionStorage.getItem('lastClickedRowClient'));
	  if(IDofRowToSelect!=null && vm.gridOptions.api != null ){
	  	vm.gridOptions.api.forEachNode((node) => {
	      node.setSelected(node.data.Id == IDofRowToSelect);
	      if (node.data.Id == IDofRowToSelect) {
	          vm.gridOptions.api.ensureIndexVisible(node.rowIndex, 'middle');
	      }
	  });
	 }
	}		

	function getAgGridState(stateName) {
		if(vm.agGridStates!=null && vm.defaultGridState != null){
			var res = vm.agGridStates.find(x=>x.txtStateName == vm.defaultGridState.txtStateName);
			if(res !=null && res.txtFilterModel !=undefined && res.txtColumnState != undefined)
			{
				vm.gridOptions.api.setFilterModel(JSON.parse(res.txtFilterModel));
				vm.gridOptions.columnApi.setColumnState(JSON.parse(res.txtColumnState));
				vm.gridOptions.api.setSortModel(JSON.parse(res.txtSortModel));
			}

	  		var saveStateData = {
      			intId: vm.defaultGridState.intId,
				txtAgidName : 'Customers2',
			}
			FoneclubeService.updateDefaultGridState(saveStateData).then(function (result){
			});
		}
	}

	function PersonComponent() {
	}
	
	
	PersonComponent.prototype.init = function(params) {
		this.valueGetter = params.valueGetter;
		this.filterText = null;
		this.setupGui(params);
	}
	
	  // not called by AG Grid, just for us to help setup
	PersonComponent.prototype.setupGui = function(params) {
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
	
	PersonComponent.prototype.getGui = function() {
		return this.gui;
	  }
	
	PersonComponent.prototype.doesFilterPass = function(params) {
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
	
	PersonComponent.prototype.isFilterActive = function() {
		return this.filterText != null && this.filterText !== '';
	  }
	
	PersonComponent.prototype.getModel = function() {
		return { value: this.filterText.value };
	  }
	
	PersonComponent.prototype.setModel = function(model) {
		this.eFilterText.value = model.value;
	  }

	
	function CustomDateComponent() {
	}

   CustomDateComponent.prototype.init = function(params) {
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
	   
	   if(params.data.NextActionDate != undefined && params.data.NextActionDate != ""){
			this.setDate(new Date(params.data.NextActionDate));
	   }
	   else
	   		this.date = null;
   }

   CustomDateComponent.prototype.getGui=function() {
       return this.eGui;
   }

   CustomDateComponent.prototype.onDateChanged=function(selectedDates) {
       this.date = selectedDates[0] || null;
       this.params.data.NextActionDate = this.date;
   }

   CustomDateComponent.prototype.getDate=function() {
       return this.date;
   }

   CustomDateComponent.prototype.setDate=function(date) {
	if(date!="")
	{
       this.picker.setDate(date);
       this.date = date;
	}
   }

   CustomDateComponent.prototype.setInputPlaceholder=function(placeholder) {
       this.eInput.setAttribute('placeholder', placeholder);
   }

};


StatusChargingController.$inject = ['$interval', 'FoneclubeService', 'PagarmeService', 'FlowManagerService', '$filter', 'ViewModelUtilsService', 'DialogFactory', 'UtilsService']; 
