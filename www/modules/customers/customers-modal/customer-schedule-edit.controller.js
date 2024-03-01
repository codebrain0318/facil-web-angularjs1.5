(function () {
  'use strict';

  angular
    .module('foneClub')
    .controller('CustomerScheduleEditModalController', CustomerScheduleEditModalController);

  CustomerScheduleEditModalController.inject = [
    'ViewModelUtilsService',
    'PagarmeService',
    'FoneclubeService',
    'UtilsService',
    'FlowManagerService',
    'DialogFactory'
  ];

  function CustomerScheduleEditModalController(
    ViewModelUtilsService,
    PagarmeService,
    UtilsService,
    FoneclubeService,
    FlowManagerService,
    DialogFactory
  ) {
        var vm = this;
        vm.changeTextValue = changeTextValue;
        vm.changeTextValueChange = changeTextValueChange;
        vm.generateDefaults = generateDefaults;
        vm.Atualizar = Atualizar;

        vm.replaceIndex = 0;
        vm.AdditionalComment = "";

        vm.ParentData = ViewModelUtilsService.modalData;


        vm.paymentTypes = [ { Id:1, Name: "CARTÃO" }, { Id:2, Name:"BOLETO" }, { Id:3, Name:"PIX" } ];
        vm.amountTemp = parseInt(vm.ParentData.ValorCobrado);
        vm.vigenciaField =  moment(vm.ParentData.Vingencia).format("YYYY MM");
        vm.expirationDateField = moment(vm.ParentData.DataExecucao).format("DD MMMM YYYY");
        vm.dataExecucao = moment(vm.ParentData.DataExecucao).format("DD MMMM YYYY"); 
        vm.Name = vm.ParentData.CustomerName;
        vm.PaymentType = vm.ParentData.Tipo == "PIX" ? 3 : vm.ParentData.Tipo == "BOLETO" ? 2 : 1;
        
        vm.defaultTemplateText = `🤖 FoneClube: FoneBot
Prezado *|namevariable|*,

Segue resumo da sua última cobrança que que será enviada por email e whatsapp.  
*|Detalhes.Cobrança|*

Vigencia:*|vigenciavariable|* 
Vencimento:*|vencimentovariable|*
Total:*R$|amountvariable|*

Caso tenha alguma dúvida envie um *whatsapp para* 

*${'https://wa.me/5521981908190'}*

ou email para 

*financeiro@foneclube.com.br*.  

Obrigado pela Atenção: 
*FoneClube*  👍`;
        init();

        function init(){
            vm.customerComment = (vm.ParentData.CommentEmail != null &&  vm.ParentData.CommentEmail != "") ? decodeURIComponent(vm.ParentData.CommentEmail) :vm.defaultTemplateText;
            changeTextValue();
        }

        function changeTextValue(){
            if(vm.customerComment!=undefined){
                vm.replaceIndex = 0;
                vm.customerComment = vm.customerComment.replace(/([\|(])(.+?)([\|)])/gs, autoRepalceText);
                vm.replaceIndex = 0;
          }
        }

        function changeTextValueChange(){
            //refreshVencimento(false);
            if(vm.customerComment!=undefined){
                vm.replaceIndex = 0;
                vm.customerComment = vm.customerComment.replace(/([\|(])(.+?)([\|)])/gs, autoRepalceText);
                vm.replaceIndex = 0;
            }
          }
          function refreshVencimento(blnVal){ 
                var foDate = '';
                var currentDate = new Date();
                var selectedDt = new Date(new Date().getFullYear().toString(), vm.vigenciaField.split(" ")[1] - 1, vm.padroaValue);
                if(!blnVal){
                  selectedDt = new Date(vm.expirationDateField);
                }
                if(currentDate >= selectedDt){
                  foDate = UtilsService.formatDate(UtilsService.addDays(0));
                }
                else{
                  var datediff = UtilsService.diffBtDays(currentDate, selectedDt);
                  foDate = UtilsService.formatDate(UtilsService.addDays(datediff));
                }
                console.log("foDate: " + foDate);
                upDateCalendar(foDate);
            }

            function upDateCalendar(date){
              vm.expirationDateField = moment(date).format("DD MMMM YYYY");
            }

        function autoRepalceText(match, start, changeValue, end, offset, string) {
            var resStr = "";
            if(vm.replaceIndex == 0){
              resStr = vm.Name;
            }
            if(vm.replaceIndex == 1){
              vm.AdditionalComment = changeValue;
              resStr = changeValue;
            }
            if(vm.replaceIndex == 2){
              resStr = vm.vigenciaField.split(" ")[1] ? new Date(0,parseInt(vm.vigenciaField.split(" ")[1]),0).toLocaleDateString('pt-br', { month: 'long'}) : '';
            }
            if(vm.replaceIndex == 3){
              var dat = new Date(vm.expirationDateField);
              dat.setDate(dat.getDate());
              var expirationDt = dat.toLocaleDateString('pt-br', { day: '2-digit', month: 'long'});
              resStr = expirationDt.replace(' ',', ')
            }
            if(vm.replaceIndex == 4){
              resStr =  vm.amountTemp / 100;
            }
            vm.replaceIndex++;

            return start + resStr + end;
          }

          function generateDefaults(){
              vm.customerComment = vm.defaultTemplateText;
              changeTextValue();
          }

          function Atualizar(){
            var data = {
                Id: vm.ParentData.Id,
                DataExecucao: moment(vm.dataExecucao).format("YYYY-MM-DD"),
                Vingencia:  moment(vm.vigenciaField).format("YYYY-MM-DD"), 
                Vencimento: moment(vm.expirationDateField).format("YYYY-MM-DD"), 
                Tipo: vm.PaymentType,
                ValorCobrado: vm.amountTemp,
                CommentEmail: encodeURIComponent(vm.customerComment),
                AdditionalComment: vm.AdditionalComment  
            };

            FoneclubeService.postUpdateScheduledCharges(data).then(function (result) {
                if(result)
                    alert("Agendamento de cobrança atualizado com sucesso");
                else
                    alert("Ocorreu um erro ao atualizar a cobrança programada");
            });
          }
 }
  
})();