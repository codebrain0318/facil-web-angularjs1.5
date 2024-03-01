(function () {
    'use strict';
    
     angular.module('foneClub').controller('DrCelularModalController', DrCelularModalController);
    
     DrCelularModalController.inject = ['ViewModelUtilsService',
      'FoneclubeService',
      'DialogFactory',
      'UtilsService',
      '$stateParams', '$filter'];

      function DrCelularModalController(ViewModelUtilsService,
        FoneclubeService,
        DialogFactory,
        UtilsService,
        $stateParams, $filter) {
            var vm = this;
            vm.importType = "CLARO";
            vm.portmonths = ["Jan", "Fev","Mar","Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

            vm.ReadExcelData = ReadExcelData;
            init();

            function init(){
              vm.importType = "CLARO";
            }


            function ReadExcelData() {
                debugger;  
               
                var regex = /\.(xls[mx]?)$/;  
                var fileName = $("#ngexcelfile").val();
                /*Checks whether the file is a valid excel file*/  
                if (regex.test($("#ngexcelfile").val().toLowerCase())) {  
                  var xlsxflag = false; /*Flag for checking whether excel is .xls format or .xlsx format*/  
                  if ($("#ngexcelfile").val().toLowerCase().indexOf(".xlsx") > 0) {  
                    xlsxflag = true;  
                  }  
                  /*Checks whether the browser supports HTML5*/  
                  if (typeof (FileReader) != "undefined") {  
                    var reader = new FileReader();  
                   
                    
                    reader.onload = function (e) { 
                      var isInvalid = false;
                      var finalOutput = [];
                      var globaldata = {};

                      var data = e.target.result;  
                      /*Converts the excel data in to object*/  
                      if (xlsxflag) {  
                        var workbook = XLSX.read(data, { type: 'binary' });  
                      }  
                      else {  
                        var workbook = XLS.read(data, { type: 'binary' });  
                      }  
                      /*Gets all the sheetnames of excel in to a variable*/  
                      var sheet_name_list = workbook.SheetNames;  
                      var cnt = 0; /*This is used for restricting the script to consider only first sheet of excel*/  
                      sheet_name_list.forEach(function (y) { /*Iterate through all sheets*/  
                        /*Convert the cell value to Json*/  
                        
                        if(y == "Visao Geral"){
                            var anomes = workbook.Sheets[y].C4.v.split('/');
                            globaldata.mes = vm.portmonths.indexOf(anomes[0]) + 1;
                            globaldata.ano = anomes[1];
                            globaldata.txtFatura = workbook.Sheets[y].B3.v;
                            globaldata.txtNumberPhones = workbook.Sheets[y].C5.v;
                            globaldata.txtPeriodo = workbook.Sheets[y].C4.v;
                        }
                        if(y == "Resumo"){
                          if(workbook.Sheets[y]["A" + 3].v == "Acessos" && workbook.Sheets[y]["B" + 3].v == "Plano de Servico" && workbook.Sheets[y]["C" + 3].v.includes("Centro de custo") && workbook.Sheets[y]["D" + 3].v == "Usuário" && workbook.Sheets[y]["O" + 3].v == "Valor Total da Fatura" && workbook.Sheets[y]["P" + 3].v == "Funcionalidade")
                          {
                          for(var iloop = 4; iloop < 10000; iloop++){
                            if(workbook.Sheets[y]["D" + iloop] != undefined)
                            {
                              var rowdata = {};
                              rowdata.txtCliente = workbook.Sheets[y].A2.v;
                              rowdata.txtEmpresa = workbook.Sheets[y].A2.v.includes("FREENETCOM") ? "FREENETCOM": "RM";
                              rowdata.txtOperadora = fileName.includes("TIM")? "TIM": "CLARO";
                              rowdata.txtLinha = workbook.Sheets[y]["A" + iloop]!=undefined ? workbook.Sheets[y]["A" + iloop].v:"";
                              rowdata.txtPlanoDeServico = workbook.Sheets[y]["B" + iloop]!=undefined ? workbook.Sheets[y]["B" + iloop].v:"";
                              rowdata.txtCentroDeCusto = workbook.Sheets[y]["C" + iloop]!=undefined ? workbook.Sheets[y]["C" + iloop].v:"";
                              rowdata.txtUsuario = workbook.Sheets[y]["D" + iloop]!=undefined ? workbook.Sheets[y]["D" + iloop].v:"";
                              rowdata.txtValorTotalFatura = workbook.Sheets[y]["O" + iloop]!=undefined ? "R$" + workbook.Sheets[y]["O" + iloop].v:"";
                              rowdata.txtFuncionalidade = workbook.Sheets[y]["P" + iloop]!=undefined ? workbook.Sheets[y]["P" + iloop].v:"";
                              finalOutput.push(rowdata);
                            }
                            else
                              break;
                          }
                        }
                        else
                          isInvalid = true;
                        }
                        if(y == "Mensalidades"){
                           if(workbook.Sheets[y]["A" + 3].v == "Acessos" && workbook.Sheets[y]["B" + 3].v == "Sem Uso"){
                            var reg = /^\d+$/;
                            for(var iloop = 4; iloop < 10000; iloop++){
                              if(workbook.Sheets[y]["A" + iloop] != undefined && reg.test(workbook.Sheets[y]["A" + iloop].v))
                              {
                                var isExists = finalOutput.find(x=>x.txtLinha == workbook.Sheets[y]["A" + iloop].v);
                                if(isExists!=undefined){
                                  isExists.txtUsoLinha = workbook.Sheets[y]["B" + iloop]!=undefined ? workbook.Sheets[y]["B" + iloop].v:"";
                                }
                              }
                              else
                                break;
                            }
                        }
                        else
                          isInvalid = true;
                        }
                      }); 
                      
                      if(!isInvalid)
                      {
                        finalOutput.forEach(element => {
                        element.ano = globaldata.ano;
                        element.mes = globaldata.mes;
                        element.txtFatura = globaldata.txtFatura;
                        element.txtNumberPhones = globaldata.txtNumberPhones;
                        element.txtOperadoraButton = strtype == 1 ? "CLARO" : "TIM";
                        element.txtPeriodo = globaldata.txtPeriodo;
                        element.txtLinha = element.txtLinha.toString();
                      });

                      console.log(finalOutput);
                      var tblDrCelular = {};
                      tblDrCelular.tblDrCelularTemps = finalOutput;
                      FoneclubeService.verifyImportDrCelular(finalOutput[0].ano, finalOutput[0].mes, finalOutput[0].txtOperadoraButton, finalOutput[0].txtEmpresa).then(function(result){
                        if(result){
                          ViewModelUtilsService.showConfirmDialog('Data already exist for '+ finalOutput[0].mes + '/' +finalOutput[0].ano +' and Empresa : '+finalOutput[0].txtEmpresa+'', 'Do you want to override?').then(function(confirm) {
                            if (confirm) {
                              FoneclubeService.saveImportDrCelular(tblDrCelular).then(function (result) {
                                if(result){
                                   alert("Data Imported Successfully");
                                }
                                else{
                                  alert("Error occured while importing data");
                                }
                              });
                            }
                          });
                        }
                        else
                        {
                          FoneclubeService.saveImportDrCelular(tblDrCelular).then(function (result) {
                                if(result){
                                   alert("Data Imported Successfully");
                                }
                                else{
                                  alert("Error occured while importing data");
                                }
                          });
                        }
                      })
                    } 
                    else{
                      alert("Please check the column header, it is not in required format");
                    }
                  }
                    if (xlsxflag) {/*If excel file is .xlsx extension than creates a Array Buffer from excel*/  
                      reader.readAsArrayBuffer($("#ngexcelfile")[0].files[0]);  
                    }  
                    else {  
                      reader.readAsBinaryString($("#ngexcelfile")[0].files[0]);  
                    }  
                  }  
                  else {  
                    alert("Sorry! Your browser does not support HTML5!");  
                  }  
                }  
                else {  
                  alert("Please upload a valid Excel file!");  
                }  
            } 
        }
})();
    