(function () {
  'use strict';

  angular
    .module('foneClub')
    .controller('EmailDetailController', EmailDetailController)
    .directive('ngFiles', ['$parse', function ($parse) {

      function fn_link(scope, element, attrs) {
        var onChange = $parse(attrs.ngFiles);
        element.on('change', function (event) {
          onChange(scope, { $files: event.target.files });
        });
      };

      return {
        link: fn_link
      }
    }]);

  EmailDetailController.inject = ['ViewModelUtilsService', 'MainUtils', '$scope', 'FoneclubeService'];
  function EmailDetailController(ViewModelUtilsService, MainUtils, $scope, FoneclubeService) {
    // debugger;
    var vm = this;
    vm.sendemail = sendemail;
    vm.saveemail = saveemail;
    vm.templates = [];
    vm.templateNames = [];
    vm.emailstatus = ViewModelUtilsService.modalEmailDetailemailstatus;
    vm.phone = ViewModelUtilsService.modalEmailDetailphone;
    vm.operator = ViewModelUtilsService.modalEmailDetailoperator;
    vm.oper = ViewModelUtilsService.modalEmailDetailoperator;
    vm.customerData = ViewModelUtilsService.modalEmailCustomer;
    vm.getEmailDetails = getEmailDetails;
    vm.from = 'marcio.franco@gmail.com';
    vm.bcc = "";
    vm.attachment1 = "";
    vm.attachment2 = "";
    vm.attachment3 = "";
    getTemplates();
    //getEmailDetails(vm);
    var formdata = new FormData();

    $scope.getTheFiles = function ($files) {
      // debugger;
      //formData.append("model", angular.toJson(vm));
      angular.forEach($files, function (value, key) {
        //formData.append("file" + key, value);
        formdata.append(key, value);
      });
    };

    function getTemplates(){
        FoneclubeService.getTemplates().then(function (result) {
            vm.emailstatus = "";
            vm.templates = result;
            vm.templateNames = result.filter(x=>x.ShowInAction==true);
        });
    }

    function saveemail(vm) {
      console.log(vm);
      FoneclubeService.saveemail(vm).then(function (result) {
        alert('Template Updated successfully');

      })
        .catch(function (error) {
          console.log('catch error');
          console.log(error);
        });
    }

    function sendemail(vm) {
      if(vm.emailstatus!="")
      {
        vm.emailData = { 
          TemplateType: parseInt(vm.emailstatus), 
          email: vm.email, 
          from: vm.from, 
          subject: vm.subject, 
          body: vm.body, 
          cc: vm.cc, 
          bcc: vm.bcc 
        };
        formdata.append("model", angular.toJson(vm.emailData));
        console.log(vm);
        FoneclubeService.SendEmailStatus(formdata).then(function (result) {
          alert('Email sent successfully');
        })
        .catch(function (error) {
          console.log('catch error');
          console.log(error);
        });
      }
    }

     function getEmailDetails(index) {
      if(vm.emailstatus!="")
      {
          var result = vm.templates.find(x=>x.Id == vm.emailstatus);
          vm.from = result.From;
          vm.email = result.To;
          vm.cc = result.Cc;
          vm.bcc = result.Bcc;
          vm.subject = replaceVariables(result.Subject);
          vm.body = replaceVariables(result.Description);
          vm.template = result.Tipo;
      }
     }

     function replaceVariables(value){
       value = value.replace("$name", vm.customerData.Name);
       return value.replace("$phone", vm.phone.replace(/[^0-9]/g, ""));
     }

    // function getEmailDetails(vm) {
    //   if (vm.operator == "8" || vm.operator == "9" || vm.operator == "10" || vm.operator == "11" || vm.operator == "12" || vm.operator == "13" || vm.operator == "14") {
    //     vm.oper = "VIVO";

    //   }
    //   else {

    //     vm.oper = 'CLARO';
    //     vm.emailstatus = parseInt(vm.emailstatus) + 6;
       
    //   }
    //   FoneclubeService.getEmailDetails(vm).then(function (result) {
        
    //     vm.subject = result.Subject;
    //     vm.body = result.Body.replace(/#DDDeTELEFONE/g, vm.Phone);
    //     vm.cc = result.Cc;
    //     vm.bcc = result.Bcc;
    //     vm.email = result.Email;
    //     vm.from = result.From;

    //     if (vm.oper =="VIVO") {
    //       if (vm.emailstatus == "3" || vm.emailstatus == "4") {
    //         if (vm.email == null) {

    //           vm.email = ViewModelUtilsService.modalEmailDetailemail + ',relacionamentoPJ1_LD2.br@telefonica.com'
    //         }
    //         if (vm.cc == null) {

    //           vm.cc = 'suporte@foneclube.com.br';
    //         }
            
            
           
    //       }
    //       else if (vm.emailstatus == "6") {

    //         if (vm.email == null) {

    //           vm.email = ViewModelUtilsService.modalEmailDetailemail + ',relacionamentoPJ1_LD2.br@telefonica.com'
    //         }
    //         if (vm.cc == null) {

    //           vm.cc = 'suporte@foneclube.com.br';
    //         }
            
            
    //       }

    //       else if (vm.emailstatus == "5") {
    //         if (vm.email == null) {

    //           vm.email = ViewModelUtilsService.modalEmailDetailemail + ',relacionamentoPJ1_LD2.br@telefonica.com'
    //         }
    //         if (vm.cc == "") {

    //           vm.cc = 'suporte@foneclube.com.br';
    //         }
    //       }

    //       else if (vm.emailstatus == "7") {
    //         if (vm.email == null) {

    //           vm.email = ViewModelUtilsService.modalEmailDetailemail + ',relacionamentoPJ1_LD2.br@telefonica.com'
    //         }
    //         if (vm.cc == null) {

    //           vm.cc = 'suporte@foneclube.com.br';
    //         }
    //       }

    //       else if (vm.emailstatus == "8") {
    //         if (vm.email == "") {

    //           vm.email = ViewModelUtilsService.modalEmailDetailemail + ',relacionamentoPJ1_LD2.br@telefonica.com'
    //         }
    //         if (vm.cc == null) {

    //           vm.cc = 'suporte@foneclube.com.br';
    //         }
    //       }
    //       else {
    //         vm.subject = '';
    //         vm.cc = '';
    //         vm.body = '';
    //         vm.bcc = '';

    //       }

    //     }
    //     else {

    //       if (vm.emailstatus == "9" || vm.emailstatus == "10") {
    //         if (vm.email == null) {

    //           vm.email = ViewModelUtilsService.modalEmailDetailemail + ',GSINC@claro.com.br';
    //         }
    //         if (vm.cc == null) {

    //           vm.cc = 'suporte@foneclube.com.br';
    //         }
    //       }
    //       else if (vm.emailstatus == "12") {
    //         if (vm.email == null) {

    //           vm.email = ViewModelUtilsService.modalEmailDetailemail + ',GSINC@claro.com.br';
    //         }
    //         if (vm.cc == null) {

    //           vm.cc = 'suporte@foneclube.com.br';
    //         }
    //       }

    //       else if (vm.emailstatus == "11") {
    //         if (vm.email == null) {

    //           vm.email = ViewModelUtilsService.modalEmailDetailemail + ',GSINC@claro.com.br';
    //         }
    //         if (vm.cc == null) {

    //           vm.cc = 'suporte@foneclube.com.br';
    //         }
    //       }

    //       else if (vm.emailstatus == "13") {
    //         if (vm.email == null) {

    //           vm.email = ViewModelUtilsService.modalEmailDetailemail + ',GSINC@claro.com.br';
    //         }
    //         if (vm.cc == null) {

    //           vm.cc = 'suporte@foneclube.com.br';
    //         }
    //       }

    //       else if (vm.emailstatus == "14") {
    //         if (vm.email == null) {

    //           vm.email = ViewModelUtilsService.modalEmailDetailemail + ',GSINC@claro.com.br';
    //         }
    //         if (vm.cc == null) {

    //           vm.cc = 'suporte@foneclube.com.br';
    //         }
    //       }
    //       else {
    //         vm.subject = '';
    //         vm.cc = '';
    //         vm.body = '';
    //         vm.bcc = '';

    //       }
    //     }

    //   })
    //     .catch(function (error) {
    //       console.log('catch error');
    //       console.log(error);
    //     });
    // }

   }
})();
