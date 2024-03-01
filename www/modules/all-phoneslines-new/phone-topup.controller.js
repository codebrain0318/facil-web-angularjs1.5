(function () {
    'use strict';
    
     angular.module('foneClub').controller('PhoneTopupModalController', PhoneTopupModalController);
    
     PhoneTopupModalController.inject = ['ViewModelUtilsService',
      'FoneclubeService',
      'DialogFactory',
      'UtilsService',
      '$stateParams', '$filter'];

      function PhoneTopupModalController(ViewModelUtilsService,
        FoneclubeService,
        DialogFactory,
        UtilsService,
        $stateParams, $filter) {
            var vm = this;
            vm.plans = [];
            vm.gridWidth = ($(window).width() -  20) + "px";
            vm.gridHeight = 200;
            vm.selectedRecord = ViewModelUtilsService.modalData;
            const arr1 = ["Selecione Plano"];
            const arr2 = vm.selectedRecord.plans.data.map(x=> x.plano);
            vm.selectedRecord.plans = vm.selectedRecord.plans.data;
            vm.plansDesc = [...arr1,...arr2];
            vm.ExtraClick = false;

            vm.gridOptions = {
            columnDefs: [
              { field: 'linha', width: 120, pinned:'left' },
              { field: 'Recarregar', width:120, 
                editable:true,
                cellEditor: 'agSelectCellEditor',
                cellEditorParams: {
                  values: vm.plansDesc
                } 
              },
              { field: 'plano', width: 80 },
              { field: 'recarga_automatica', width: 130 },
              { field: 'portin', width:80 },
              { field: 'status', width: 100 },
              { field: 'bloqueada', width:100},
              { field: 'restante_dados', width:140 
                ,cellRenderer: function (params) {
                    var dados = Math.ceil(params.value/1024) + " GB";
                    return dados;
                }  
              },
              { field: 'restante_minutos', width:150 },
              { field: 'restante_sms', width:120 },
              { field: 'data_fim_plano', width:120 },
              { field: 'data_renovacao', width:120 },
              { field: 'data_cancelamento_linha', width:120 }
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
            rowHeight: 50,
            headerHeight: 100,
            onGridReady: function (params) {
			    this.gridApi = params.api;
    		    this.gridColumnApi = params.columnApi;
                init();
            },
            onCellValueChanged: function(event) {
            	if(event!=null && event.data!=null)
                {
                   if(event.data[event.column.colId] != "Select" || event.data[event.column.colId] != "Selecione Plano")
                   {
                        var showLoaderMain = DialogFactory.showLoader("Aguarde enquanto buscamos as informações do contel para a linha que você recarregou");
                        FoneclubeService.getContelDetailByPhone(event.node.data.linha).then(function (result) {
                            showLoaderMain.close();
                            if(result!=null)
                            {
                                DialogFactory.dialogConfirmCustom({ titulo: 'Realizar Recarga?', mensagem: '<span>Linha: <strong>' +event.node.data.linha+ '</strong> <br/> Saldo Atual: <strong>'+ parseFloat(result.restante_dados/1024).toFixed(1) + ' GB</strong><br/>  Plano Atual:<strong>' + event.data[event.column.colId] + '</strong><br/>Data Renovação:<strong>'+result.data_renovacao+'</strong><br/> Fim Plano:<strong>'+result.data_fim_plano+'</strong><br/>Recarga Automatica: <strong>' + (result.recarga_automatica == 'INATIVA' ? 'Desativada' :  result.recarga_automatica_plano )+ '</strong><br/><br/> <strong>Recarregar Plano: '+event.data[event.column.colId] + '?</strong></span>', additionalAction: '<div><input type="checkbox" id="extra" name="extra" ng-click="vm.ExtraClick(this)"/><label for="extra" style="margin:0 0 0 10px"> Extra</label></div><br/><div style="color:red; padding:0 80px 20px">Aviso: so use "extra" se é uma recarga adicional alem do plano mensal e o cliente quer tambem manter a recarga mensal!</div>', btn1: 'Saldo', btn2: 'Link' })
                                .then(function (saldo) {
                                    var extra = document.getElementById("extra").checked;
                                    if(!saldo)
                                    {
                                        if(extra)
                                        {
                                            DialogFactory.dialogConfirm({ titulo: 'Realizar recarga?', mensagem: 'Se marcar como extra será feita tambem a recarga automatica configurada mensalmente. <br/><br/> So clicar em EXTRA se o cliente especificamente relatou que quer dados extra este mês e quer manter o plano recorrente mensal!', btn1: 'Sim', btn2: 'Não' })
                                            .then(function (res) {
                                            if(!res)
                                            {
                                                DialogFactory.dialogConfirm({ titulo: 'Realizar recarga?', mensagem: 'Isso é irreversivel. Tem certeza? ', btn1: 'Sim', btn2: 'Não' })
                                                .then(function (res) {
                                                    if(!res)
                                                    {
                                                        var selectedplan = event.data[event.column.colId];
                                                        debugger;
                                                        var planId = vm.selectedRecord.plans.find(x=>x.plano == selectedplan).id;
                                                        var data = {
                                                            extra: extra,
                                                            planGB: parseInt(event.data[event.column.colId].replace(" GB", "")),
	                                                        metodo_pagamento: "SALDO",
	                                                        numeros: [
                                                                {
                                                                    numero: event.node.data.linha,
                                                                    id_plano: planId
                                                                }
	                                                        ]
                                                        };
                                                        var showLoader = DialogFactory.showLoader("Aguarde, a recarga está em andamento");
                                                        FoneclubeService.addTopupPlan(data).then(function (respo) 
                                                        {
                                                            showLoader.close();
                                                            if(respo != null)
                                                            {
                                                                if(respo.bitWarning)
                                                                {
                                                                    DialogFactory.showMessageDialog({ title:'Falha ao recarregar', mensagem: 'Aviso, ja foi feito uma recarga nos ultimos 30.  Por bug da contel, é possivel que não apareça a data da recarga na contel e no historico de recarga mas foi feito recarga no dia '+ moment(respo.LastTopup).format('DD/MMM HH:mm') }); 
                                                                }
                                                                else
                                                                {
                                                                    var title = GetTitleByStatus(respo.Status);
                                                                    var titleColor = GetTitleColorByStatus(respo.Status);
                                                                    var body = GetBodyByStatus(respo);

                                                                    DialogFactory.dialogConfirm(
                                                                    { 
                                                                        title:'<span style="color:'+titleColor+'">' + title + '</span>', mensagem: body, btn1: 'OK', btn2:'exit'
                                                                    }).then(function (link) {
                                                                        sessionStorage.setItem('allphonelines', LZString.compress('none'));
		                                                                location.reload();
                                                                        Utils.clipBoardCopy('topupInfo');
                                                                    });
                                                                }
                                                            }
                                                            else{
                                                                DialogFactory.showMessageDialog({ title:'Falha ao recarregar', mensagem: 'Ocorreu um erro recarregar o plano selecionado' }); 
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                    else
                                    {
                                        DialogFactory.dialogConfirm({ titulo: 'Realizar recarga?', mensagem: 'Isso é irreversivel. Tem certeza? ', btn1: 'Sim', btn2: 'Não' })
                                        .then(function (res) {
                                        if(!res)
                                        {
                                            var selectedplan = event.data[event.column.colId];
                                            debugger;
                                            var planId = vm.selectedRecord.plans.find(x=>x.plano == selectedplan).id;
                                            var data = {
                                                extra: extra,
                                                planGB: parseInt(event.data[event.column.colId].replace(" GB", "")),
	                                            metodo_pagamento: "SALDO",
	                                            numeros: [
                                                    {
                                                        numero: event.node.data.linha,
                                                        id_plano: planId
                                                    }
	                                            ]
                                            };
                                            var showLoader = DialogFactory.showLoader("Aguarde, a recarga está em andamento");
                                            FoneclubeService.addTopupPlan(data).then(function (respo) 
                                            {
                                                if(respo != null)
                                                {
                                                    showLoader.close();
                                                    if(respo.bitWarning)
                                                    {
                                                        DialogFactory.showMessageDialog({ title:'Falha ao recarregar', mensagem: 'Aviso, ja foi feito uma recarga nos ultimos 30.  Por bug da contel, é possivel que não apareça a data da recarga na contel e no historico de recarga mas foi feito recarga no dia '+ moment(respo.LastTopup).format('DD/MMM HH:mm') }); 
                                                    }
                                                    else{
                                                        var title = GetTitleByStatus(respo.Status);
                                                        var titleColor = GetTitleColorByStatus(respo.Status);
                                                        var body = GetBodyByStatus(respo);

                                                        DialogFactory.dialogConfirm(
                                                        { 
                                                            title:'<span style="color:'+titleColor+'">' + title + '</span>', mensagem: body, btn1: 'OK', btn2:'exit'
                                                        }).then(function (link) {
                                                            sessionStorage.setItem('allphonelines', LZString.compress('none'));
		                                                    location.reload();
                                                            Utils.clipBoardCopy('topupInfo');
                                                        });
                                                    }
                                                   
                                                }
                                                else{
                                                    DialogFactory.showMessageDialog({ title:'Falha ao recarregar', mensagem: 'Ocorreu um erro recarregar o plano selecionado' }); 
                                                }
                                            }, function(error){
                                                showLoader.close();
                                            });
                                        }
                                        });
                                    }
                                }
                                else
                                {
                                    if(extra)
                                    {
                                        DialogFactory.dialogConfirm({ titulo: 'Realizar recarga?', mensagem: 'Se marcar como extra será feita tambem a recarga automatica configurada mensalmente. <br/><br/> So clicar em EXTRA se o cliente especificamente relatou que quer dados extra este mês e quer manter o plano recorrente mensal!', btn1: 'Sim', btn2: 'Não' })
                                        .then(function (res) {
                                        if(!res)
                                        {
                                            DialogFactory.dialogConfirm({ titulo: 'Realizar recarga?', mensagem: '<span>Deseja criar link de cobrança para acrescentar <br/> plano de dados de <strong>' + event.data[event.column.colId]+ '</strong> <br/>Na linha <strong>'+ event.node.data.linha + '</strong>?</span>', btn1: 'Sim', btn2: 'Não' })
                                            .then(function (link) {
                                            if(!link)
                                            {
                                                var selectedplan = event.data[event.column.colId];
                                                debugger;
                                                var planId = vm.selectedRecord.plans.find(x=>x.plano == selectedplan).id;
                                                var data = {
	                                                metodo_pagamento: "LINK",
                                                    extra: extra,
                                                    planGB: parseInt(event.data[event.column.colId].replace(" GB", "")),
	                                                numeros: [
                                                        {
                                                            numero: event.node.data.linha,
                                                            id_plano: planId
                                                        }
	                                                ]
                                                };
                                                var showLoader = DialogFactory.showLoader("Aguarde, a recarga está em andamento");
                                                FoneclubeService.addTopupPlan(data).then(function (respo) 
                                                {
                                                    if(respo != null)
                                                    {
                                                        showLoader.close();
                                                        if(respo.bitWarning)
                                                        {
                                                            DialogFactory.showMessageDialog({ title:'Falha ao recarregar', mensagem: 'Aviso, ja foi feito uma recarga nos ultimos 30.  Por bug da contel, é possivel que não apareça a data da recarga na contel e no historico de recarga mas foi feito recarga no dia '+ moment(respo.LastTopup).format('DD/MMM HH:mm') }); 
                                                        }
                                                        else{
                                                            var title = GetTitleByStatus(respo.Status);
                                                            var titleColor = GetTitleColorByStatus(respo.Status);
                                                            var body = GetBodyByStatus(respo);

                                                            DialogFactory.dialogConfirm(
                                                            { 
                                                                title:'<span style="color:'+titleColor+'">' + title + '</span>', mensagem: body, btn1: 'OK', btn2:'exit'
                                                            }).then(function (link) {
                                                                sessionStorage.setItem('allphonelines', LZString.compress('none'));
		                                                        location.reload();
                                                                Utils.clipBoardCopy('topupInfo');
                                                            });
                                                        }
                                                   
                                                    }
                                                    else{
                                                        DialogFactory.showMessageDialog({ title:'Falha ao recarregar', mensagem: 'Ocorreu um erro recarregar o plano selecionado' }); 
                                                    }
                                                }, function(error){
                                                        showLoader.close();
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                            else
                            {
                                DialogFactory.dialogConfirm({ titulo: 'Realizar recarga?', mensagem: '<span>Deseja criar link de cobrança para acrescentar <br/> plano de dados de <strong>' + event.data[event.column.colId]+ '</strong> <br/>Na linha <strong>'+ event.node.data.linha + '</strong>?</span>', btn1: 'Sim', btn2: 'Não' })
                                .then(function (link) {
                                if(!link)
                                {
                                    var selectedplan = event.data[event.column.colId];
                                    debugger;
                                    var planId = vm.selectedRecord.plans.find(x=>x.plano == selectedplan).id;
                                    var data = {
	                                    metodo_pagamento: "LINK",
                                        extra: extra,
                                        planGB: parseInt(event.data[event.column.colId].replace(" GB", "")),
	                                    numeros: [
                                            {
                                                numero: event.node.data.linha,
                                                id_plano: planId
                                            }
	                                    ]
                                    };
                                    FoneclubeService.addTopupPlan(data).then(function (respo) 
                                    {
                                        if(respo != null)
                                        {
                                            showLoader.close();
                                            if(respo.bitWarning)
                                            {
                                                DialogFactory.showMessageDialog({ title:'Falha ao recarregar', mensagem: 'Aviso, ja foi feito uma recarga nos ultimos 30.  Por bug da contel, é possivel que não apareça a data da recarga na contel e no historico de recarga mas foi feito recarga no dia '+ moment(respo.LastTopup).format('DD/MMM HH:mm') }); 
                                            }
                                            else{
                                                var title = GetTitleByStatus(respo.Status);
                                                var titleColor = GetTitleColorByStatus(respo.Status);
                                                var body = GetBodyByStatus(respo);

                                                DialogFactory.dialogConfirm(
                                                { 
                                                    title:'<span style="color:'+titleColor+'">' + title + '</span>', mensagem: body, btn1: 'OK', btn2:'exit'
                                                }).then(function (link) {
                                                    sessionStorage.setItem('allphonelines', LZString.compress('none'));
		                                            location.reload();
                                                    Utils.clipBoardCopy('topupInfo');
                                                });
                                            }
                                                   
                                        }
                                        else{
                                            DialogFactory.showMessageDialog({ title:'Falha ao recarregar', mensagem: 'Ocorreu um erro recarregar o plano selecionado' }); 
                                        }
                                    });
                                }
                            });
                            }
                        }
                    });
                    }
                }, function(error){
                    showLoader.close();
                });
            }
            else{
                        
            }
        }
        }
        };
        //init(); 
            
        function init()
        {
            sessionStorage.setItem("ExtraClickOnTopup", null);
             vm.arrData = [vm.selectedRecord.result];
             if (vm.gridOptions.api) {
                vm.gridOptions.api.setRowData(vm.arrData);
             } 
        }

        function GetTitleByStatus(id)
        {
            var title = "";
            switch(id)
            {
                case 1:
                    title = "Recarga realizada com sucesso!";
                    break;
                case 2:
                    title = "Recarga realizada com resalvas!";
                    break;
                case 3:
                    title = "Recarga realizada com resalvas!";
                    break;
                case 4:
                    title = "Recarga realizada com PENDENCIAS!";
                    break;
            }
            return title;
        }

        function GetTitleColorByStatus(id)
        {
            var title = "";
            switch(id)
            {
                case 1:
                    title = "green";
                    break;
                case 2:
                    title = "blue";
                    break;
                case 3:
                    title = "blue";
                    break;
                case 4:
                    title = "red";
                    break;
            }
            return title;
        }

        function GetBodyByStatus(response)
        {
            var statusGB = "";
            var dataFimPlano = "";
            var port = "";
            var topuphtml = "";
            if(response.bitTopupDone)
                topuphtml = "<span style='color:green'>Recarga concluida<strong></span>";
            else
                topuphtml = "<span style='color:red'>Falha na recarga<strong></span>";

            switch(response.Status)
            {
                case 1:
                    {
                        statusGB = '<span>' + response.StatusGB + '</span>';
                        dataFimPlano = '<span>' + response.DataFimPlano + '</span>';
                        port = '<span>' + response.StatusPortabilidade + '</span>';
                    }
                    break;
                case 2:
                case 3:
                case 4:
                    {
                        statusGB = '<span style="color:red;font-weight:bold">' + response.StatusGB + '</span>';
                        dataFimPlano = '<span style="color:red;font-weight:bold">' + response.DataFimPlano + '</span>';
                        port = '<span style="color:red;font-weight:bold">' + response.StatusPortabilidade + '</span>';
                    }
                    break;
            }

            return '<p id="topupInfo">' +topuphtml +' <br/><strong>Linha:</strong>' + response.Linha + '<br/><br/>'+
                '<strong>Fim Plano Pre Recarga:</strong>' + moment(response.PreFimPlano).format('DD/MMM') + '<br/>'+
                '<strong>Fim Plano Pos Recarga:</strong>' + moment(response.PostFimPlano).format('DD/MMM') + '<br/>'+
                '<strong>Status Fim do Plano:</strong>' + dataFimPlano + '<br/><br/>'+
                '<strong>Saldo Pre:</strong>' + response.PreSaldo + '<br/>'+
                '<strong>Saldo Pos:</strong>' + response.PostSaldo + '<br/>'+
                '<strong>GB Adicionados:</strong>' + response.SaldoGBAdded + '<br/>'+
                '<strong>Status GB:</strong>' + statusGB + '<br/><br/>'+
                '<strong>Portabilidade:</strong>' + response.PortIn + '<br/>'+
                '<strong>Status Bonus Portabilidade:</strong>' + port + '<br/></p>';
        }
    }
})();
    