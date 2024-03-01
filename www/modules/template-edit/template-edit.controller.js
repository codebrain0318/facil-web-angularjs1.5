(function() {
    'use strict';
    
        angular
            .module('foneClub')
            .controller('TemplateEditController', TemplateEditController);
    
      TemplateEditController.inject = ['DialogFactory', 'FoneclubeService', 'ViewModelUtilsService', 'UtilsService', '$filter'];
      function TemplateEditController(DialogFactory, FoneclubeService, ViewModelUtilsService, UtilsService, $filter) {
            var vm = this;
            vm.templates = [];
            vm.searchTemplate = "";
            vm.setSelectedRecord = setSelectedRecord;
            vm.addNewTemplate = addNewTemplate;
            vm.editTemplate = editTemplate;
            vm.deleteTemplate = deleteTemplate;
            vm.duplicateTemplate = duplicateTemplate;
            vm.filterTemplates = filterTemplates;
            vm.loadTemplates = loadTemplates;
            vm.refreshTemplate = refreshTemplate;
            console.log('-- TemplateEditController --')
            vm.gridWidth = $(window).width() - 150;
            vm.gridHeight = $(window).height() - 150;
            vm.gridOptions = {
                columnDefs: setColumnDefs(),
                defaultColDef: {
                    sortable: true,
                    filter: true,
                    resizable: true,
                    autoHeight: true
                },
                rowData: [],
                angularCompileRows: true,
                onGridReady: function(params) {
                    this.gridApi = params.api;
                    this.gridColumnApi = params.columnApi;
                    bindAgGrid(vm.templates);
                },
                headerHeight: 100,
                autoSizeColumns: true
            };

            loadTemplates();
            console.log('-- WA TemplateEditController --');

            function loadTemplates(){
                FoneclubeService.getTemplates().then(function (result) {
                vm.templates = result.sort(function(a,b) {return (a.Tipo > b.Tipo) ? 1 : ((b.Tipo > a.Tipo) ? -1 : 0);} );
                 bindAgGrid(vm.templates);
                });
            }

            function refreshTemplate(){
                loadTemplates();
            }

           function setColumnDefs() 
            {
                var columnDefs = [
                    {
                        headerName: "", 
                        field: "Actions", 
                        width:120, 
                        pinned:'left',
                        cellRenderer: function (params) {
                            var cellHtml = "";
                            cellHtml='<a title="Edit" ng-click="vm.editTemplate(' + params.value.Id + ')" ><img class="imgEdit     link"src="content/img/edit.png" /></a>&nbsp;<a title="Duplicate" ng-click="vm.duplicateTemplate(' + params.value.Id + ')"><img class="imgduplicate link" src="content/img/copy.png" /></a>&nbsp;<a title="Delete" ng-click="vm.deleteTemplate('  + params.value.Id + ')" ><img class="imgDelete link" src="content/img/Cancel.png" /></a>';
                            return cellHtml;
                        }
                    },
                    {headerName: "Tipo", field: "Tipo", width:150, pinned:'left'},
                    {headerName: "From", field: "From", width:200},
                    {headerName: "To", field: "To", width:200},
                    {headerName: "Cc", field: "Cc", width:200},
                    {headerName: "Bcc", field: "Bcc", width:200},
                    {headerName: "Subject", field: "Subject", width:200},
                    {headerName: "Description", field: "Description", width:200},
                    {headerName: "ShowInAction", field: "ShowInAction", width:200},
                ];
                return columnDefs;
            }

            function bindAgGrid(data) {
                var rowData = convertToViewModel(data);
                if (vm.gridOptions.api) {
                    vm.gridOptions.api.setRowData(rowData);
                } 
            }
            
            function filterTemplates() {
                var filteredData = $filter('filter')(vm.templates, function (data) {
                    return UtilsService.checkContains(UtilsService.removeAccents(data.Tipo.toLowerCase()), UtilsService.removeAccents(vm.searchTemplate.toLowerCase())) 
                    || UtilsService.checkContains(UtilsService.removeAccents(data.From.toLowerCase()), UtilsService.removeAccents(vm.searchTemplate.toLowerCase())) 
                    || UtilsService.checkContains(UtilsService.removeAccents(data.To.toLowerCase()), UtilsService.removeAccents(vm.searchTemplate.toLowerCase())) 
                    || UtilsService.checkContains(UtilsService.removeAccents(data.Cc.toLowerCase()), UtilsService.removeAccents(vm.searchTemplate.toLowerCase()))
                    || UtilsService.checkContains(UtilsService.removeAccents(data.Bcc.toLowerCase()), UtilsService.removeAccents(vm.searchTemplate.toLowerCase())) 
                    || UtilsService.checkContains(UtilsService.removeAccents(data.Subject.toLowerCase()), UtilsService.removeAccents(vm.searchTemplate.toLowerCase())) 
                    || UtilsService.checkContains(UtilsService.removeAccents(data.Description.toLowerCase()), UtilsService.removeAccents(vm.searchTemplate.toLowerCase()));
                });
                bindAgGrid(filteredData);
            }

            function convertToViewModel(data){
                var templateDataList = [];
                for (var i = 0; i < data.length; i++) {
                    var tempalteData = data[i];
                    templateDataList.push({
                        'Actions': tempalteData,
                        'Tipo': tempalteData.Tipo,
                        'From': tempalteData.From,
                        'To': tempalteData.To,
                        'Cc': tempalteData.Cc,
                        'Bcc': tempalteData.Bcc,
                        'Subject': tempalteData.Subject,
                        'Description': tempalteData.Description,
                        'ShowInAction': tempalteData.ShowInAction
                    });
                }
                return templateDataList;
            }

             function addNewTemplate(){
                ViewModelUtilsService.showModalTemplate(null);
            }

            function deleteTemplate(templateId){
                vm.selectedRecord = angular.copy(vm.templates.find(x =>  x.Id == templateId));
                DialogFactory.dialogConfirm({
                    mensagem:
                      'Are you sure, you want to delete this template ' + vm.selectedRecord.Tipo +' ?'
                  }).then(function (value) {
                    if (value) {
                        FoneclubeService.deleteTemplate(vm.selectedRecord.Id).then(function (result) {
                            if(result){
                                alert("Template deleted Successfully");
                                location.reload();
                            }
                            else{
                                vm.templates.map(function(template){ template.Selected = false;})
                            }
                        });
                    }
                    else{
                        vm.templates.map(function(template){ template.Selected = false;})
                    }
                });
            }

            function editTemplate(templateId){ 
                if(vm.templates !=undefined && vm.templates.length > 0 )
                {
                   if(vm.templates.filter(x => x.Id == templateId).length > 0)
                   {
                      vm.selectedRecord = angular.copy(vm.templates.find(x => x.Id == templateId));
                      vm.Tipo = vm.selectedRecord.Tipo;
                      vm.From = vm.selectedRecord.From;
                      vm.To = vm.selectedRecord.To;
                      vm.Cc = vm.selectedRecord.Cc;
                      vm.Bcc = vm.selectedRecord.Bcc;
                      vm.Subject = vm.selectedRecord.Subject;
                      vm.Description = vm.selectedRecord.Description;
                      vm.ShowInAction = vm.selectedRecord.ShowInAction;
                      ViewModelUtilsService.showModalTemplate(vm.selectedRecord);
                      vm.templates.map(function(template){ template.Selected = false;})
                    } 
                }
            }

            function duplicateTemplate(templateId){
                if(vm.templates !=undefined && vm.templates.length > 0 )
                {
                    if(vm.templates.filter(x => x.Id == templateId).length > 0)
                   {
                        vm.selectedRecord = angular.copy(vm.templates.find(x =>  x.Id == templateId));
                        vm.selectedRecord.Id = -1;
                        vm.selectedRecord.Tipo = vm.selectedRecord.Tipo + '-Copy';
                        vm.selectedRecord.From = vm.selectedRecord.From;
                        vm.selectedRecord.To = vm.selectedRecord.To;
                        vm.selectedRecord.Cc = vm.selectedRecord.Cc;
                        vm.selectedRecord.Bcc = vm.selectedRecord.Bcc;
                        vm.selectedRecord.Subject = vm.selectedRecord.Subject;
                        vm.selectedRecord.Description = vm.selectedRecord.Description;
                        vm.selectedRecord.ShowInAction = vm.selectedRecord.ShowInAction;
                        ViewModelUtilsService.showModalTemplate(vm.selectedRecord);
                        vm.templates.map(function(template){ template.Selected = false;})
                   } 
                }
            }

            function setSelectedRecord(template){
                if(vm.templates !=undefined && vm.templates.length > 0 )
                {
                   if(vm.templates.filter(x => x.Selected).length > 0)
                   {
                        vm.selectedRecord = angular.copy(vm.templates.find(x => x.Selected));
                   } 
                   else {

                   }
                }
            }
    
        }
    })();
    