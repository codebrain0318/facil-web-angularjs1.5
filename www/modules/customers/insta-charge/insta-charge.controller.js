(function () {
  'use strict';

  angular
    .module('foneClub')
    .controller('InstaChargeController', InstaChargeController);


  InstaChargeController.inject = ['ViewModelUtilsService', 'FoneclubeService', 'DialogFactory', 'UtilsService', 'localStorageService', '$filter'];

  function InstaChargeController(ViewModelUtilsService, FoneclubeService, DialogFactory, UtilsService, localStorageService, $filter) {
    var vm = this;
    vm.validateCPF = validateCPF;
    vm.validateCEP = validateCEP;
    vm.saveClientDetails = saveClientDetails;
    vm.clearSelectedName = clearSelectedName;
    var customer = ViewModelUtilsService.modalBoletoData;
    vm.chargeForm = {};
    vm.isMobile = UtilsService.mobileCheck();
    vm.address = {};
    vm.Phones = [];
    vm.customer = customer;
    vm.chargeForm.Vencimento = moment().subtract(1, 'day').format("DD MMMM YYYY");
    vm.chargeForm.Vigencia = moment().subtract(1, 'day').format("YYYY MM");
    vm.chargeForm.CpfType = 0;
    vm.chargeForm.CPF = "";
    vm.chargeForm.Id = 0;
    vm.chargeForm.Nome = "";
    vm.chargeForm.CountryCode = "55"
    vm.chargeForm.WhatsAppNumber= "";
    vm.chargeForm.Email = "";
    vm.chargeForm.IsPix = true;
    vm.chargeForm.IsCC = false;
    vm.chargeForm.ICCID = "";
    vm.chargeForm.Amount = 0;
    vm.chargeForm.Plano = "";
    vm.chargeForm.Portar = "";
    vm.chargeForm.Use2Prices = false;
    vm.chargeForm.IsVIP = false;
    vm.chargeForm.Referral = "";
    vm.validWhatsApp = "";
    vm.chargeForm.ExistingClient = "";
    vm.defaultComment = `Prezado *|namevariable|*,

planvariable

Vigencia: *|vigenciavariable|*
Vencimento: *|vigenciavariable|*
Total: *amountvariable*`;

    vm.chargeForm.Comment = vm.defaultComment;
    vm.chargeForm.Vencimento = moment().subtract(1, 'day').format("DD MMMM YYYY");
    vm.chargeForm.Vigencia = moment().subtract(1, 'day').format("YYYY MM");
    vm.ErrCPF = false;
    vm.ErrNome = false;
    vm.ErrAddress = false;
    vm.ErrWhatsAppNumber = false;
    vm.ErrValor = false;
    vm.ErrInvalidCPF = true;
    vm.customer = customer;
    vm.replaceIndex = 0;
    vm.chargeForm.ParentCPF = "";
    vm.chargeForm.ParentNome = "";
    vm.chargeForm.ParentWhatsAppNumber = "";
    vm.validWhatsAppParent = "";
    vm.ErrInvalidParentCPF = true;
    vm.IdPagarme = 0;
    vm.plans = [];

    vm.isParentSelected = true;
    vm.parentNames = [];
    vm.selectedParent = null;

    vm.isCustomerSelected = true;
    vm.customerNames = [];

    vm.validateCPF = validateCPF;
    vm.validateForm = validateForm;
    vm.updateVariable = updateVariable;
    vm.updatePrice = updatePrice;
    vm.validateParentCPF = validateParentCPF;
    vm.selectAndChargePlans = selectAndChargePlans;
    vm.sendWelcomeWhatsApp = sendWelcomeWhatsApp;
    vm.sendWelcomeWhatsAppParent = sendWelcomeWhatsAppParent;
    vm.selectParentItem = selectParentItem;
    vm.setSelectedParentName = setSelectedParentName;
    vm.confirmDados = confirmDados;
    vm.selectCustomerItem = selectCustomerItem;
    vm.setSelectedCustomerName = setSelectedCustomerName;
    vm.registerNewClient = registerNewClient;
    vm.copyToClipboard = copyToClipboard


    init();

    function init() {
      var showLoader1 = DialogFactory.showLoader("aguarde enquanto buscamos os dados");
      FoneclubeService.getPlans().then(function (result) {
        vm.plans = result.filter(x => x.IdOperator != 1).sort((a, b) => (a.IdOperator > b.IdOperator) ? -1 : ((b.IdOperator > a.IdOperator) ? 1 : 0));
      });

      FoneclubeService.getAllCustomersMinimal().then(function (result) {
        vm.parentNames = result;
        vm.customerNames = result;
        showLoader1.close();
      });
    }

    function selectParentItem(val) {
      vm.isParentSelected = val;
    }

    function selectCustomerItem(val) {
      vm.isCustomerSelected = val;
      vm.chargeForm.ExistingClient = "";
    }

    function setSelectedParentName(item) {
      console.log(item);
      vm.isParentSelected = true;
      vm.selectedParent = item;
      vm.chargeForm.ParentCPF = item.DocumentNumber;
      vm.chargeForm.ParentNome = item.Name;
      vm.chargeForm.ParentWhatsAppNumber = item.Telefone;
    }

    function clearSelectedName() {
      vm.chargeForm.Id = 0;
      vm.chargeForm.CPF = "";
      vm.chargeForm.Nome = "";
      vm.chargeForm.Email = "";
      vm.chargeForm.WhatsAppNumber = "";
      vm.chargeForm.Address = {};
      vm.validWhatsApp = "";
    }

    function setSelectedCustomerName(item) {
      console.log(item);
      vm.isCustomerSelected = true;
      vm.chargeForm.Id = item.Id;
      vm.chargeForm.CPF = item.DocumentNumber;
      vm.chargeForm.Nome = item.Name;
      vm.chargeForm.Email = item.Email;

      var contactPhone = item.Phones.filter(x => x.IsFoneclube == false);
      if(contactPhone != undefined && contactPhone != null && contactPhone.length > 0){
        vm.chargeForm.CountryCode = contactPhone[0].CountryCode;
        vm.chargeForm.WhatsAppNumber = '(' + contactPhone[0].DDD + ') ' + contactPhone[0].Number.toString().substr(0, 5) + '-' + contactPhone[0].Number.toString().substr(5);
      }
      else{
        if(item.Telefone != null)
        {
          vm.chargeForm.CountryCode = item.Telefone.substr(0, 2) == "55" ? "55" : item.Telefone.substr(0, 2);
          vm.chargeForm.WhatsAppNumber = item.Telefone.substr(0, 2) == "55" || item.Telefone.length > 10 ? item.Telefone.substr(2): item.Telefone;
        }
      }
      vm.chargeForm.Address = item.Address;
      vm.chargeForm.Use2Prices = item.Use2Prices;
      vm.chargeForm.IsVIP = item.IsVIP;
      vm.chargeForm.Referral = item.Referral;
      vm.Phones = item.Phones;
      vm.Pai = item.Pai;
      vm.IdPagarme = item.IdPagarme;
      validateForm();
    }

    var updateClient = document.querySelector('#update_client_details')
    var registerClient = document.querySelector('#register_client')
    var selectPlans = document.querySelector('#select_plans')



    // var input = document.querySelector("#phone");

    // window.intlTelInput(input, {
    //   initialCountry: "BR",

    // });

    // var input1 = document.querySelector("#phone1");

    // window.intlTelInput(input1, {
    //   initialCountry: "BR",
    // });

    function copyToClipboard() {
      var valor = document.querySelector('button[data-valor]').getAttribute('data-valor');
      var copyText = document.createElement('textarea');
      copyText.value = valor;
      document.body.appendChild(copyText);
      copyText.select();
      document.execCommand('copy');
      document.body.removeChild(copyText);
      alert('Link copiado para a área de transferência!');
    };


    function validateCPF() {
      vm.ErrInvalidCPF = true;
      vm.isCustomerSelected = true;
      var cpf = vm.chargeForm.CPF.replaceAll(".", "").replaceAll("-", "").replaceAll("/", "");
      if (cpf.length > 10) {
        FoneclubeService.getCustomerByCPF(cpf).then(function (cpfResult) {
          if (cpfResult != null && cpfResult.Id != 0) {
            vm.chargeForm.Id = cpfResult.Id;
            vm.chargeForm.Nome = cpfResult.Name;
            vm.chargeForm.Email = cpfResult.Email;
            vm.chargeForm.ExistingClient = "Cliente existente";
            vm.chargeForm.Use2Prices = cpfResult.Use2Prices;
            vm.chargeForm.IsVIP = cpfResult.IsVIP;
            vm.chargeForm.Address = cpfResult.Adresses[0];
            var contactPhone = cpfResult.Phones.filter(x => x.IsFoneclube == false);
            vm.Phones = cpfResult.Phones;
            vm.Pai = cpfResult.Pai;
            vm.chargeForm.CountryCode = contactPhone[0].CountryCode;
            vm.chargeForm.WhatsAppNumber = '(' + contactPhone[0].DDD + ') ' + contactPhone[0].Number.toString().substr(0, 5) + '-' + contactPhone[0].Number.toString().substr(5);


            updateVariable();
            validateForm();
          }
          else {
            FoneclubeService.validateCPF(cpf).then(function (result) {
              console.log(result);
              if (result != null && result.status == 400) {
                vm.ErrInvalidCPF = false;
                //vm.chargeForm.Nome = "";
                //vm.chargeForm.CPF = "";
                vm.chargeForm.ExistingClient = "";
              }
              else {
                vm.ErrInvalidCPF = true;
                vm.chargeForm.Nome = vm.chargeForm.Nome != "" ? vm.chargeForm.Nome : result.nome;
                vm.chargeForm.ExistingClient = "";

                vm.chargeForm.Address.Street = "";
                vm.chargeForm.Address.StreetNumber = "";
                vm.chargeForm.Address.Complement = "";
                vm.chargeForm.Address.Neighborhood = "";
                vm.chargeForm.Address.City = "";
                vm.chargeForm.Address.State = "";
                vm.chargeForm.Address.Cep = "";

                updateVariable();
              }
            })
          }
        });
      }
    }

    function validateForm() {
      vm.ErrInvalidCPF = true;
      vm.ErrAddress = true;
      vm.ErrCPF = false;
      vm.ErrNome = false;
      vm.ErrWhatsAppNumber = false;
      vm.ErrValor = false;
      var error = false;
      vm.validWhatsApp = "";

      if (vm.chargeForm.CPF == undefined || vm.chargeForm.CPF == "") {
        vm.ErrCPF = true;
        error = true;
      }
      if (vm.chargeForm.CPF.length < 10) {
        vm.ErrInvalidCPF = false;
        error = true;
      }
      if (vm.chargeForm.Nome == undefined || vm.chargeForm.Nome == "") {
        vm.ErrNome = true;
        error = true;
      }
      
      if (vm.chargeForm.WhatsAppNumber == undefined || vm.chargeForm.WhatsAppNumber == "") {
        vm.ErrWhatsAppNumber = true;
        error = true;
      }
      else
      {
        if (vm.chargeForm.WhatsAppNumber.length > 10 && vm.chargeForm.WhatsAppNumber.startsWith("55")) {
          vm.chargeForm.WhatsAppNumber = vm.chargeForm.WhatsAppNumber.slice(2);
        }
      }

      updateVariable();
      sendWelcomeWhatsApp();

      return error;
    }

    function sendWelcomeWhatsApp() {
      if (vm.chargeForm.WhatsAppNumber != undefined && vm.chargeForm.WhatsAppNumber != "") {
        var number = vm.chargeForm.CountryCode + UtilsService.getPhoneNumberFromStringToJson(vm.chargeForm.WhatsAppNumber).DDD + UtilsService.getPhoneNumberFromStringToJson(vm.chargeForm.WhatsAppNumber).Number;
        FoneclubeService.validatePhoneForWA(number).then(function (result) {
          var validNumbers = result.split('|')[0];
          var invalidNumbers = result.split('|')[1];
          if (validNumbers) {
            vm.validWhatsApp = "Número do WhatsApp válido";
          }
          else {
            vm.validWhatsApp = "Número do WhatsApp inválido";
          }
        });
      }
    }

    function updateVariable() {
      if (vm.chargeForm.Comment != undefined) {
        vm.replaceIndex = 0;
        vm.chargeForm.Comment = vm.chargeForm.Comment.replace(/([\|(])(.+?)([\|)])/gs, autoRepalceText);
        vm.replaceIndex = 0;
      }
    }

    function autoRepalceText(match, start, changeValue, end, offset, string) {
      var resStr = "";
      if (vm.replaceIndex == 0) {
        resStr = vm.chargeForm.Nome == "" ? "namevariable" : vm.chargeForm.Nome;
      }
      if (vm.replaceIndex == 1) {
        resStr = vm.chargeForm.Vigencia;
      }
      if (vm.replaceIndex == 2) {
        resStr = vm.chargeForm.Vencimento;
      }
      vm.replaceIndex++;

      return start + resStr + end;
    }

    function updatePrice(index) {
      var amount = vm.plans.find(x => x.Id == index).Value / 100;
      vm.chargeForm.Amount = "R$" + amount.toFixed(2);
    }
    function validateCEP() {
      var cep = vm.chargeForm.Address.Cep.replaceAll("-", "").replaceAll("_", "").replaceAll(".", "");
      if(cep.length == 8){
      FoneclubeService.validateCEP(cep).then(function (data) {
        if (data != "error") {
          //vm.address.CEP= cep;
          vm.chargeForm.Address.Street = data.logradouro;
          vm.chargeForm.Address.StreetNumber = "";
          vm.chargeForm.Address.Complement = "";
          vm.chargeForm.Address.Neighborhood = data.bairro;
          vm.chargeForm.Address.City = data.localidade;
          vm.chargeForm.Address.State = data.uf;
          vm.chargeForm.Address.Cep = cep;
        }
      });
    }
    }
    function selectAndChargePlans() {
      selectPlans.disabled = true;
      var error = validateForm();
      if (!error) {
        if (vm.chargeForm.Address == undefined || vm.chargeForm.Address == {} || vm.chargeForm.Address.Street == "" || vm.chargeForm.Address.Cep == "" || vm.chargeForm.Address.StreetNumber == ""  || vm.chargeForm.Address.City == ""  || vm.chargeForm.Address.State == "" ) {
          DialogFactory.showMessageDialog({ mensagem: 'Please fill all address fields' });
          selectPlans.disabled = false;
          return;
        }

        var data = JSON.parse(JSON.stringify(vm.chargeForm));
        if (vm.chargeForm.ParentCPF != '' && vm.chargeForm.ParentNome != '' && vm.chargeForm.ParentWhatsAppNumber != '') {
          data.Parent = {
            ParentId: vm.selectedParent == null ? -1 : vm.selectedParent.Id,
            Name: vm.chargeForm.ParentNome,
            WhatsAppNumber: UtilsService.getPhoneNumberFromStringToJson(vm.chargeForm.ParentWhatsAppNumber).DDD + UtilsService.getPhoneNumberFromStringToJson(vm.chargeForm.ParentWhatsAppNumber).Number,
            CPF: vm.chargeForm.ParentCPF,
            Address: vm.chargeForm.Address
          };
          selectPlans.disabled = false
        }
        else
          data.Parent = null;

        data.Phones = vm.Phones;
        data.Parent = vm.Pai;
        data.IdPagarme = vm.IdPagarme;
        ViewModelUtilsService.showPlanSelectionModal(data);
        selectPlans.disabled = false;
      }
      else{
        selectPlans.disabled = false;
      }
    }


    function sendWelcomeWhatsAppParent() {

    }

    function validateParentCPF() {
      vm.ErrInvalidParentCPF = true;
      var cpf = vm.chargeForm.ParentCPF.replaceAll(".", "").replaceAll("-", "").replaceAll("/", "");
      if (cpf.length > 10) {
        FoneclubeService.getCustomerByCPF(cpf).then(function (cpfResult) {
          if (cpfResult != null && cpfResult.Id != 0) {
            vm.chargeForm.ParentNome = cpfResult.Name;
            var contactPhone = cpfResult.Phones.filter(x => x.IsFoneclube == false);
            vm.chargeForm.ParentWhatsAppNumber = '(' + contactPhone[0].DDD + ') ' + contactPhone[0].Number.toString().substr(0, 5) + '-' + contactPhone[0].Number.toString().substr(5)
          }
          else {
            FoneclubeService.validateCPF(cpf).then(function (result) {
              console.log(result);
              if (result != null && result.status == 400) {
                vm.ErrInvalidParentCPF = false;
                vm.chargeForm.ParentNome = "";
                vm.chargeForm.ParentCPF = "";
              }
              else {
                vm.ErrInvalidParentCPF = true;
                vm.chargeForm.ParentNome = result.nome;
              }
            })
          }
        });
      }
    }

    function confirmDados() {
      if (vm.chargeForm.ParentCPF != undefined && vm.chargeForm.ParentNome != undefined && vm.chargeForm.ParentWhatsAppNumber != undefined) {
        var parentdata = {
          ParentId: vm.selectedParent == null ? -1 : vm.selectedParent.Id,
          Name: vm.chargeForm.ParentNome,
          WhatsAppNumber: UtilsService.getPhoneNumberFromStringToJson(vm.chargeForm.ParentWhatsAppNumber).DDD + UtilsService.getPhoneNumberFromStringToJson(vm.chargeForm.ParentWhatsAppNumber).Number,
          CPF: vm.chargeForm.ParentCPF,
        };
        FoneclubeService.postInstaCustomerParent(parentdata).then(function (result) {
          alert("Parent data saved successfully");
        });
      }
    }


    function registerNewClient() {
      registerClient.disabled = true;
      var cpf = vm.chargeForm.CPF.replaceAll(".", "").replaceAll("-", "").replaceAll("/", "");
      if (cpf.length > 10) {
        FoneclubeService.getCustomerByCPF(cpf).then(function (cpfResult) {
          registerClient.disabled = false;
          if (cpfResult != null && cpfResult.Id != 0) {
            DialogFactory.showMessageDialog({ mensagem: 'Usuario já existe em FoneClube' });
          }
          else {
            var phone = UtilsService.clearPhoneNumber(vm.chargeForm.WhatsAppNumber);
            var person = {
              Name: vm.chargeForm.Nome == "" ? vm.chargeForm.CPF : vm.chargeForm.Nome,
              Email: vm.chargeForm.Email == "" ? phone + "@foneclube.com.br" : vm.chargeForm.Email,
              DocumentNumber: cpf,
              IntlPhone: {
                CountryCode : vm.chargeForm.CountryCode,
                Phone: phone
              }
            };
            FoneclubeService.saveInstaRegisterClient(person).then(function (res) {
              if (res) {
                DialogFactory.showMessageDialog({ mensagem: 'Usuario cadastrado com sucesso' });
              }
              registerClient.disabled = false;
            });
          }
        });
      }
      else
      {
        registerClient.disabled = false;
        DialogFactory.showMessageDialog({ mensagem: 'Invalid CPF' });
      }
    }

    function saveClientDetails() {
      updateClient.disabled = true;
      var phone = UtilsService.clearPhoneNumber(vm.chargeForm.WhatsAppNumber);

      var cpf = vm.chargeForm.CPF.replaceAll(".", "").replaceAll("-", "").replaceAll("/", "");
      var saveData = {
        Id: vm.chargeForm.Id,
        Name: vm.chargeForm.Nome,
        Email: vm.chargeForm.Email,
        DocumentNumber: cpf,
        Address: vm.chargeForm.Address,
        IntlPhone: {
                CountryCode : vm.chargeForm.CountryCode,
                Phone: phone
              },
        ParentId: vm.selectedParent == null ? -1 : vm.selectedParent.Id,
      };
      var showLoader = DialogFactory.showLoader("Aguarde enquanto atualizamos os detalhes do cliente");
      FoneclubeService.updateInstaEditClient(saveData).then(function (res) {
        showLoader.close();
        if (res > 0) {
          DialogFactory.showMessageDialog({ mensagem: 'Dados atualizados com sucesso' });
        }
        else {
          DialogFactory.showMessageDialog({ mensagem: 'Erro ocorreu ao atualizar os dados do cliente:' + vm.chargeForm.Nome });
        }
        updateClient.disabled = false;

      }, function (error) {
        showLoader.close();
        updateClient.disabled = false;
        DialogFactory.showMessageDialog({ mensagem: 'Erro ocorreu ao atualizar os dados do cliente:' + vm.chargeForm.Nome });
      });
    }



  }
})();
