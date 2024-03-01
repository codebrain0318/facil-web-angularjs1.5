(function () {
    'use strict';
    
     angular.module('foneClub').controller('WATemplateEditController', WATemplateEditController);
    
      WATemplateEditController.inject = ['ViewModelUtilsService',
      'FoneclubeService',
      'DialogFactory',
      'UtilsService',
      '$stateParams', '$filter'];

      function WATemplateEditController(ViewModelUtilsService,
        FoneclubeService,
        DialogFactory,
        UtilsService,
        $stateParams, $filter) {
            var vm = this;
            vm.templates = [];
            vm.searchTemplate = "";
            vm.setSelectedRecord = setSelectedRecord;
            vm.addNewTemplate = addNewTemplate;
            vm.refreshTemplate = refreshTemplate;
            vm.editTemplate = editTemplate;
            vm.deleteTemplate = deleteTemplate;
            vm.duplicateTemplate = duplicateTemplate;
            vm.filterTemplates = filterTemplates;
            vm.loadTemplates = loadTemplates;
            vm.saveConfig = saveConfig;
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
                //rowHeight: 100,
                headerHeight: 100,
                angularCompileRows: true,
                onGridReady: function(params) {
                    this.gridApi = params.api;
                    this.gridColumnApi = params.columnApi;
                    bindAgGrid(vm.templates);
                },
                autoSizeColumns: true
            };

            loadTemplates();
            console.log('-- WA TemplateEditController --');

            function loadTemplates(){

                 FoneclubeService.getWATemplates().then(function (result) {
                     vm.templates = result;
                     bindAgGrid(vm.templates);
                 });
                 FoneclubeService.getWATemplatesConfig().then(function (result) {
                     vm.useURL = result.useURL;
                     vm.useButton = result.useButton;
                     vm.useList = result.useList;
                     vm.useRocket = result.useRocket;
                 });
            }

            function saveConfig(){
                var data = {
                    useURL : vm.useURL,
                    useButton : vm.useButton,
                    useList : vm.useList,
                    useRocket : vm.useRocket
                };
                FoneclubeService.saveWATemplatesConfig(data).then(function (result) {
                    
                 });
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
                    {headerName: "TemplateName", field: "TemplateName", width:150, pinned:'left'},
                    {headerName: "Trigger", field: "Trigger", width:150},
                    {
                        headerName: "Comment", 
                        field: "Comment", 
                        width:400,
                        cellRenderer: function (params) {
                            return params.value.replaceAll("\n","<br/>");
                        }
                    },
                    {headerName: "Title", field: "Title", width:200},
                    {headerName: "Footer", field: "Footer", width:200},
                    {headerName: "Buttons", field: "Buttons", width:200},
                    {headerName: "Urls", field: "Urls", width:200},
                    {headerName: "ListButton", field: "ListButton", width:200},
                    {headerName: "ListSections", field: "ListSections", width:200},
                    {headerName: "ListSectionRows", field: "ListSectionRows", width:200},
                    {headerName: "MessageType", field: "MessageType", width:200},
                    {headerName: "CallBackAction", field: "CallBackAction", width:100},
                    {headerName: "Internal", field: "Internal", width:100},
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
                    if(data.TemplateName != undefined && data.Trigger != undefined && data.Comment != undefined && data.Title != undefined && data.Footer != undefined){
                        return UtilsService.checkContains(UtilsService.removeAccents(data.TemplateName.toLowerCase()), UtilsService.removeAccents(vm.searchTemplate.toLowerCase())) || UtilsService.checkContains(UtilsService.removeAccents(data.Trigger.join(',').toLowerCase()), UtilsService.removeAccents(vm.searchTemplate.toLowerCase())) || UtilsService.checkContains(UtilsService.removeAccents(data.Comment.toLowerCase()), UtilsService.removeAccents(vm.searchTemplate.toLowerCase()))|| UtilsService.checkContains(UtilsService.removeAccents(data.Title.toLowerCase()), UtilsService.removeAccents(vm.searchTemplate.toLowerCase())) || UtilsService.checkContains(UtilsService.removeAccents(data.Footer.toLowerCase()), UtilsService.removeAccents(vm.searchTemplate.toLowerCase()));
                    }
                });
                bindAgGrid(filteredData);
            }

            function convertToViewModel(data){
                var templateDataList = [];
                for (var i = 0; i < data.length; i++) {
                    var tempalteData = data[i];
                    templateDataList.push({
                        'Actions': tempalteData,
                        'TemplateName': tempalteData.TemplateName,
                        'Trigger': tempalteData.Trigger,
                        'Comment': tempalteData.Comment,
                        'Title': tempalteData.Title,
                        'Footer': tempalteData.Footer,
                        'Buttons': tempalteData.Buttons,
                        'Urls': tempalteData.Urls,
                        'ListButton': tempalteData.ListButton,
                        'ListSections': tempalteData.ListSections,
                        'ListSectionRows': tempalteData.ListSectionRows,
                        'MessageType': tempalteData.MessageType,
                        'CallBackAction': tempalteData.CallBackAction,
                        'Internal': tempalteData.Internal,
                    });
                }
                return templateDataList;
            }

            function refreshTemplate(){
                loadTemplates();
            }

            function addNewTemplate(){
                ViewModelUtilsService.showModalWhatsappTemplate(null);
            }

            function deleteTemplate(templateId){
                vm.selectedRecord = angular.copy(vm.templates.find(x =>  x.Id == templateId));
                DialogFactory.dialogConfirm({
                    mensagem:
                      'Are you sure, you want to delete this template ' + vm.selectedRecord.Trigger +' ?'
                  }).then(function (value) {
                    if (value) {
                        FoneclubeService.deleteWATemplates(vm.selectedRecord.Id).then(function (result) {
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
                        vm.selectedRecord.Trigger = vm.selectedRecord.Trigger.join(',');
                        vm.selectedRecord.Buttons =vm.selectedRecord.Buttons!=null? vm.selectedRecord.Buttons:null;
                        vm.selectedRecord.Urls = vm.selectedRecord.Urls!=null ? vm.selectedRecord.Urls:null;
                        vm.selectedRecord.ListButton = vm.selectedRecord.ListButton!=null?vm.selectedRecord.ListButton:null;
                        vm.selectedRecord.ListSections = vm.selectedRecord.ListSections!=null?vm.selectedRecord.ListSections:null;
                        vm.selectedRecord.ListSectionRows = vm.selectedRecord.ListSectionRows!=null?vm.selectedRecord.ListSectionRows:null;
                        ViewModelUtilsService.showModalWhatsappTemplate(vm.selectedRecord);
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
                        vm.selectedRecord.TemplateName = vm.selectedRecord.TemplateName + '-Copy';
                        vm.selectedRecord.Trigger = vm.selectedRecord.Trigger.join(',') + '-Copy';
                        vm.selectedRecord.Comment = vm.selectedRecord.Comment;
                        vm.selectedRecord.Title = vm.selectedRecord.Title;
                        vm.selectedRecord.Footer = vm.selectedRecord.Footer;
                        vm.selectedRecord.Buttons =vm.selectedRecord.Buttons!=null? vm.selectedRecord.Buttons:null;
                        vm.selectedRecord.Urls = vm.selectedRecord.Urls!=null ? vm.selectedRecord.Urls:null;
                        vm.selectedRecord.ListButton = vm.selectedRecord.ListButton!=null?vm.selectedRecord.ListButton:null;
                        vm.selectedRecord.ListSections = vm.selectedRecord.ListSections!=null?vm.selectedRecord.ListSections:null;
                        vm.selectedRecord.ListSectionRows = vm.selectedRecord.ListSectionRows!=null?vm.selectedRecord.ListSectionRows:null;
                        ViewModelUtilsService.showModalWhatsappTemplate(vm.selectedRecord);
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
    