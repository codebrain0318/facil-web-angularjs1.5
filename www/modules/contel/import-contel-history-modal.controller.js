(function () {
    'use strict';
    
     angular.module('foneClub').controller('ImportContelTopupHistModalController', ImportContelTopupHistModalController);
    
     ImportContelTopupHistModalController.inject = ['ViewModelUtilsService',
      'FoneclubeService',
      'DialogFactory',
      'UtilsService',
      '$stateParams', '$filter'];

      function ImportContelTopupHistModalController(ViewModelUtilsService,
        FoneclubeService,
        DialogFactory,
        UtilsService,
        $stateParams, $filter) {
            var vm = this;

            vm.ReadExcelData = ReadExcelData;
            

            function ReadExcelData() {
                debugger;  
               
                var regex = /\.(xls[mx]?)$/;  
                var fileName = $("#ngexcelfile1").val();
                /*Checks whether the file is a valid excel file*/  
                if (regex.test($("#ngexcelfile1").val().toLowerCase())) {  
                  var xlsxflag = false; /*Flag for checking whether excel is .xls format or .xlsx format*/  
                  if ($("#ngexcelfile1").val().toLowerCase().indexOf(".xlsx") > 0) {  
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
                      var count = parseInt(workbook.Sheets[y]['!ref'].split(':')[1].replace(/\D/g, ""));
                      for(var iloop = 2; iloop <= count; iloop++){
                        var rowdata = {};
                    
                        rowdata.txtTipo = workbook.Sheets[y]["A" + iloop].v;
                        rowdata.DteDateRec = workbook.Sheets[y]["B" + iloop].w;
                        rowdata.txtValor = workbook.Sheets[y]["C" + iloop] !=undefined ? workbook.Sheets[y]["C" + iloop].w.replace("R$ ","") :"";
                        rowdata.txtName = workbook.Sheets[y]["D" + iloop] != undefined ? workbook.Sheets[y]["D" + iloop].v : "";
                        rowdata.txtApelido = workbook.Sheets[y]["E" + iloop] != undefined ? workbook.Sheets[y]["E" + iloop].v : "";
                        rowdata.txtLinha = workbook.Sheets[y]["F" + iloop] != undefined ? workbook.Sheets[y]["F" + iloop].w : "";
                        rowdata.txtPlano = workbook.Sheets[y]["G" + iloop] !=undefined ? workbook.Sheets[y]["G" + iloop].v:"";
                        rowdata.txtValorPlano = workbook.Sheets[y]["H" + iloop] != undefined ? workbook.Sheets[y]["H" + iloop].v : "";
                        rowdata.txtREALIZADAPOR = workbook.Sheets[y]["I" + iloop] != undefined ?  workbook.Sheets[y]["I" + iloop].v:"";
                        finalOutput.push(rowdata);
                      };

                      FoneclubeService.saveImportTopupHistory(finalOutput).then(function (result) {
                        if(result){
                            alert("Data Imported Successfully");
                        }
                        else{
                            alert("Error occured while importing data");
                        }
                      });
                    });
                      
                  }
                    if (xlsxflag) {/*If excel file is .xlsx extension than creates a Array Buffer from excel*/  
                      reader.readAsArrayBuffer($("#ngexcelfile1")[0].files[0]);  
                    }  
                    else {  
                      reader.readAsBinaryString($("#ngexcelfile1")[0].files[0]);  
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
    