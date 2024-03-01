(function () {
  'use strict';

  angular
    .module('foneClub')
    .controller('EdicaoController', EdicaoController)
    .directive('ngPrism', function () {
      return {
        restrict: 'A',
        link: function (scope, element, attrs) {
          element.ready(function () {
            Prism.highlightElement(element[0]);
          });
        }
      };
    });


  EdicaoController.inject = ['$scope', 'DataFactory', 'ViewModelUtilsService', 'FoneclubeService', 'MainUtils', '$stateParams', 'FlowManagerService', '$timeout', 'HubDevService', '$q', '$ionicScrollDelegate', 'UtilsService', 'DialogFactory', 'ngDialog', '$http', '$sce', '$rootScope', 'localStorageService', '$templateCache'];
  function EdicaoController($scope, DataFactory, ViewModelUtilsService, FoneclubeService, MainUtils, $stateParams, FlowManagerService, $timeout, HubDevService, $q, $ionicScrollDelegate, UtilsService, DialogFactory, ngDialog, $http, $sce, $rootScope,localStorageService, $templateCache) {

    var checkvalidate = localStorageService.get("userid");
    if (checkvalidate == null) {
      FlowManagerService.changeLoginView();
    }
    var vm = this;
    vm.showLoader = false;
    vm.data = DataFactory;
    vm.onTapSendUser = onTapSendUser;
    vm.onTapCancel = onTapCancel;
    vm.onTapSendUserAllCheck = onTapSendUserAllCheck;
    vm.onTapRemoveNewNumber = onTapRemoveNewNumber;
    vm.onTapNewPhoneNumber = onTapNewPhoneNumber;
    vm.validarCEP = validarCEP;
    vm.validarCPF = validarCPF;
    vm.validatePhoneNumber = validatePhoneNumber;
    vm.changeCustomerAtivity = changeCustomerAtivity;
    vm.showAddNewPhone = showAddNewPhone;
    vm.saveUserSettings = saveUserSettings;
    vm.goBack = goBack;
    vm.cpf = $stateParams.data ? $stateParams.data.DocumentNumber : '';
    var index = $stateParams.data ? $stateParams.data.index : '';
    vm.calledView = $stateParams.data.view;
    vm.singlePriceLocal = 0;
    vm.singlePrice = 0;
    vm.allOperatorOptions = MainUtils.operatorOptions();
    vm.requesting = true;
    vm.onCheckCNPJ = onCheckCNPJ
    vm.CNPJField = false;
    vm.CPFField = true;
    vm.opemEmailpopup = opemEmailpopup;
    vm.onTapAtualizaPai = onTapAtualizaPai;
    vm.changeExtraService = changeExtraService;
    vm.changeSelectedService = changeSelectedService;
    vm.onClickFlag = onClickFlag;
    vm.onedit = onedit;
    vm.openChargeSummary = openChargeSummary;

    vm.search = "";
    vm.showall = false;
    vm.linhaAtiva = false;
    vm.iccid = false;
    vm.noPortar = false;
    vm.claro = true;
    vm.vivo = true;
    vm.history = [];
    vm.sp = 1;

    function changeExtraService(index, serviceId, phoneNumber, service){
      
      if(serviceId != null)
      {
        for(var i in phoneNumber.Servicos){
          if(phoneNumber.Servicos[i].Id == serviceId){
            DialogFactory.showMessageDialog({ mensagem: 'Serviço não pôde ser adicionado pois já faz parte da linha' });
            service.Id = 1;
            return;
          }
        }

        if(phoneNumber.Servicos.length > 0){
          DialogFactory.showMessageDialog({ mensagem: 'Linha já tem serviço' });
          return;
        }

        var selectedService;
        for(var i in vm.extraServices)
        {
          if(vm.extraServices[i].Id == serviceId){
            selectedService = vm.extraServices[i];
          }
        }

        DialogFactory.dialogConfirm({ title: 'Adicionar serviço', mensagem: 'Tem certeza que deseja adicionar o serviço '+ selectedService.Descricao +' ?:', btn1: 'não', btn2: 'sim' })
        .then(function (result) {
          
          if (result == 1) {
            console.log('clicou em sim')
            //todo validar falta de id de phone ou de serivço
            var servico = {
              Id:phoneNumber.Id,
              Servicos:[{
                Id: serviceId
              }]
            }
            FoneclubeService.postIsertServiceActive(servico).then(function (result) {
              if(result)
              {
                DialogFactory.showMessageDialog({ mensagem: 'Serviço adicionado' });
                for(var i in vm.customer.Phones){
          
                  var currentPhone = vm.customer.Phones[i];
        
                  if(currentPhone.Id == phoneNumber.Id){
                      vm.customer.Phones[i].Price += selectedService.AmountFoneclube;
                      vm.pricelist[i] = 'R$'+ (vm.customer.Phones[i].Price / 100).toFixed(2);
                  }
                }

                service.Id = 1;
                phoneNumber.Servicos.push(selectedService)
              }
              else{
                DialogFactory.showMessageDialog({ mensagem: 'Serviço não pôde ser adicionado' });
                service.Id = 1;
              }
            })
          } else {
            console.log('clicou em não')
            service.Id = 1;
          }
        })
      }

    }

    var changingSelectedService = false;
    function changeSelectedService(index,serviceId, phoneNumber, fromUser, service){
      if(serviceId != null)
      {
        if(!changingSelectedService)
        {
          changingSelectedService = true;
          var currentService;
          for(var i in vm.extraServices)
          {
            if(vm.extraServices[i].Id == serviceId){
              currentService = vm.extraServices[i];
            }
          }


          DialogFactory.dialogConfirm({ title: 'Remover serviço', mensagem: 'Tem certeza que deseja remover o serviço '+ currentService.Descricao +' ?:', btn1: 'não', btn2: 'sim' })
          .then(function (result) {
            if (result == 1) {
              console.log('clicou em sim')
              //todo validar falta de id de phone ou de serivço
              var servico = {
                Id:phoneNumber.Id,
                Servicos:[{
                  Id: serviceId
                }]
              }

              FoneclubeService.postIsertServiceDeactive(servico).then(function (result) {
                if(result)
                {
                  for(var i in phoneNumber.Servicos){
                    if(phoneNumber.Servicos[i].Id == serviceId){
                      phoneNumber.Servicos.splice(i,1)
                    }
                  }
                  DialogFactory.showMessageDialog({ mensagem: 'Serviço removido' });

                  for(var i in vm.customer.Phones){
          
                    var currentPhone = vm.customer.Phones[i];
          
                    if(currentPhone.Id == phoneNumber.Id){
                        vm.customer.Phones[i].Price -= currentService.AmountFoneclube;
                        vm.pricelist[i] = 'R$'+ (vm.customer.Phones[i].Price / 100).toFixed(2);
                    }
                  }

                  service.Id = 1;
                  $timeout(function () {
                    changingSelectedService = false;
                  }, 1000)
                  
                }
                else{
                  service.Id = 1;
                  DialogFactory.showMessageDialog({ mensagem: 'Serviço não pôde ser removido' });
                  changingSelectedService = false;
                }
              })
              
            } else {
              console.log('clicou em não');
              service.Id = 1;
              changingSelectedService = false;
            }
          })
        }
      }
    }

    function opemEmailpopup(emailstatus, phone, email, operator) {
      if (emailstatus != "") {
        ViewModelUtilsService.showModalEmailDetail(emailstatus, phone, email, operator, vm.customer);
      }
    }

    function onTapAtualizaPai(selectedPai){
      
      if(selectedPai == undefined)
      {
        alert('Sem nenhum pai selecionado.');
        return;
      }

      if(vm.customer.Id == selectedPai.Id){
        alert('Cliente não pode ser pai dele mesmo.');
        return;
      }
     
      var customObj = {
        Id:vm.customer.Id,
        Pai:{
          Id:selectedPai.Id,
          Name:selectedPai.Name
        }
      }

      

      FoneclubeService.postCustomerUpdateParent(customObj).then(function (result) {
        if(result){
          alert('Pai alterado com sucesso')

          vm.nomePai = selectedPai.Name;
          vm.telefonePai = '';

          FoneclubeService.getCustomerById(selectedPai.Id).then(function (result) {
            
            vm.nomePai = selectedPai.Name;

            for(var i in result.Phones){
              if(result.Phones[i].IsFoneclube != true){
                vm.telefonePai = result.Phones[i].DDD + result.Phones[i].Number;
              }
            }

          })
          
        }
        else{
          alert('Não foi possível alterar o Pai nesse cliente')
        }
      })
      //postCustomerUpdateParent

      //faz o post
      //vc não pode selecionar um pai como o próprio cliente
      //no sucesso atualiza
      //vm.telefonePai = "2187554657"
      //vm.nomePai = "Nome do pai"
    }

    function onCheckCNPJ() {
      console.log("andando " + vm.checkboxCNPJ)

      if (vm.checkboxCNPJ) {
        onShowCNPJField();
      }
      else {
        onShowCPFField();
      }

    }

    function onShowCPFField() {
      vm.CNPJField = false;
      vm.CPFField = true;
    }

    function onShowCNPJField() {
      vm.CNPJField = true;
      vm.CPFField = false;
    }

    init();


    function init() {
      FoneclubeService.getServices().then(function (result) {
        vm.extraServices = result;
      })

      $templateCache.removeAll();

      if (!vm.cpf) {
        FlowManagerService.changeCustomersView();
        return;
      }
      var showDialog = DialogFactory.showLoader('Carregando dados...');

      var documentnum = UtilsService.clearDocumentNumber(vm.cpf);

      FoneclubeService.getActiveCustomers().then(function (result) {
        vm.testeResult = result;
        
      })

      



      FoneclubeService.getCustomerByCPF(UtilsService.clearDocumentNumber(vm.cpf)).then(function (result) {
        
        vm.DocumentNumberFreeze = angular.copy(result.DocumentNumber);
        vm.customer = result;
        vm.autoSum = vm.customer.IsPrecoPromoSum;
        vm.autoSumNormal = vm.customer.IsPrecoFCSum;
        vm.linhaAtiva = vm.customer.IsLinhaAtiva;
        vm.noPortar = vm.customer.IsShowPort;
        vm.iccid = vm.customer.IsShowICCID;
        
        vm.customer.linkIndicacao = "https://foneclube.com.br/convite/" + btoa(vm.customer.Id)
        
        vm.linkRoot = "https://foneclube.com.br/convite/" + btoa(vm.customer.Id)

        console.log('vm.linkRoot')
        console.log(vm.linkRoot)

        if(vm.customer.DocumentNumber.length > 11)
          onShowCNPJField()

        vm.customerAtivo = !vm.customer.Desativo;
        
        if(vm.customer.Pai != null)
        {
          vm.telefonePai = vm.customer.Pai.ContatoPai;
          vm.nomePai = vm.customer.Pai.Name;
        }
        


        if(result.Id == 4158)
        {
          vm.hideColunaLinhaAtiva = true;
          vm.hideColunaPrecoVip = true;
          vm.hideColunaPrecoFC = true;
          vm.hideColunaPerfil = true;
          vm.hideColunaApelido = true;
        }
          
        //desusar
        getPersonParent(vm.customer.IdParent);

        vm.singlePriceLocal = result.SinglePrice > 0  ? 'R$'+ (vm.customer.SinglePrice / 100).toFixed(2) : 0; //single place formatado;
        vm.singlePrice = 'R$0';
        if (vm.customer.Adresses) {
          for (var i = 0; i < vm.customer.Adresses.length; i++) {
            vm.customer.Adresses[i].StreetNumber = parseInt(vm.customer.Adresses[i].StreetNumber); //deve ser int por causa da mascara
          }
        }

        FoneclubeService.getStatusTelefonesOperadora().then(function (result) {
          
          for(var i in vm.customer.Phones)
          {
            var telefone = vm.customer.Phones[i].DDD + vm.customer.Phones[i].Number;
            vm.customer.Phones[i].usoLinha = -1;
            vm.customer.Phones[i].divergente = -1;
            for(var r in result){
              if(telefone == result[r].phone){
                
                var operadora; 
                if(result[r].operadora == 1)
                {
                  operadora = 'CLARO'
                } 
                else if(result[r].operadora == 2)
                {
                  operadora = 'VIVO'
                }
                  

                vm.customer.Phones[i].plano = operadora + " " + result[r].plano;
                vm.customer.Phones[i].usoLinha = result[r].usoLinha ? 1 : 0;
                if(parseInt(vm.customer.Phones[i].IdOperator) == result[r].operadora)
                {
                  vm.customer.Phones[i].divergente = 0
                }
                else if(parseInt(vm.customer.Phones[i].IdOperator) != result[r].operadora)
                {
                  vm.customer.Phones[i].divergente = 1
                }
              }
            }
          }

          // vm.concluiuVerificacaoStatus = 'S';

          vm.tempPhones = angular.copy(vm.customer.Phones);
          for (var number in vm.customer.Phones) {
            // FoneclubeService.getPhoneServices(vm.customer.Phones[number].Id, index).then(function (result) {
            //   vm.customer.Phones[result.index].Servicos = result.Servicos;
            // })
            var contactPhone = !vm.customer.Phones[number].IsFoneclube;

            if(contactPhone){
              vm.actual_phone = vm.customer.Phones[number].DDD + vm.customer.Phones[number].Number;
            }

          }

          });

          FoneclubeService.getPlans().then(function (result) {


            FoneclubeService.getCustomerWithPhoneStatus(UtilsService.clearDocumentNumber(vm.cpf)).then(function (result) {
              
              // se der divergencia fazer foreach
              // vm.tempPhones = angular.copy(result.Phones);
              
            })


            vm.plans = result;
            
            var listaPlanosUsados = [];

            for (var number in vm.customer.Phones) {
              vm.customer.Phones[number].key = Math.random();

              vm.customer.Phones[number].StatusOperator = { 'background-color': 'grey' }
              vm.customer.Phones[number].StatusDescription = 'C'

              if (vm.customer.Phones[number].Portability) {
                vm.customer.Phones[number].Portability = 'true';
              } 
              else {
                vm.customer.Phones[number].Portability = 'false';
              }

              vm.customer.Phones[number].NovoFormatoNumero = getNumberString(vm.customer.Phones[number]); //popula o novo campo vm.<telefone>

              for (var plan in vm.plans) {

                listaPlanosUsados.push(vm.customer.Phones[number].IdPlanOption);

                if (vm.plans[plan].Id == vm.customer.Phones[number].IdPlanOption) {
                  if (vm.plans[plan].Description.endsWith('VIVO')) {
                    vm.customer.Phones[number].operadora = '1'; //seta a operadora local
                  } 
                  else {
                    vm.customer.Phones[number].operadora = '2'; //seta a operadora local

                    // FoneclubeService.getStatusLinhaClaro(vm.customer.Phones[number].DDD, vm.customer.Phones[number].Number, number).then(function (result) {
                      
                    //   console.log('-- retorno ' + vm.customer.Phones[result.index].DDD + ' ' + vm.customer.Phones[result.index].Number)
                    //   console.log(result)

                      
                    //   vm.tempPhones = angular.copy(vm.customer.Phones);
                      

                    // });
                    vm.tempPhones = angular.copy(vm.customer.Phones);

                  }
                }

              }

            }

            listaPlanosUsados = listaPlanosUsados.filter(vm.onlyUnique)
            for (var i in listaPlanosUsados) {
              var teste = listaPlanosUsados[i];
            }

            console.info(vm.customer);

            populaPai(vm.customer)
            showDialog.close();
            // Fix caso não exista numero de telefone -- É necessário manter esse fix por causa de clientes que tenham esse array vazio
            var dontHaveContact = vm.customer.Phones.filter(function (element, index, array) {
              return element.IsFoneclube == null || element.IsFoneclube == false;
            });
            if (dontHaveContact.length == 0) {
              vm.actual_phone = '(11) 11111-1111'
            }

            // Fix caso não exista endereço -- É necessário manter esse fix por causa de clientes que tenham esse array vazio
            if (vm.customer.Adresses.length == 0) {
              vm.customer.Adresses.push({
                Cep: '',
                Street: '',
                StreetNumber: '',
                Complement: '',
                Neighborhood: '',
                City: '',
                State: ''
              });
            }

            $timeout(function () {
              vm.requesting = false;
            }, 2000)

            $timeout(function () {
              document.getElementById('cpf').focus();
            }, 200);

            vm.pricelist = [];
            for (var i = 0; i < vm.customer.Phones.length; i++) {

              var phoneNumber = vm.customer.Phones[i];
              var totalServicos = 0;

              if(phoneNumber.Servicos.length > 0 ){
                for(var o in phoneNumber.Servicos){
                  totalServicos += phoneNumber.Servicos[o].AmountFoneclube;
                }
              }
              

              if (phoneNumber.IdPlanOption == '') {
                vm.pricelist.push(0);
                // customer.Phones[i].PriceFoneclube = 0;
              } 
              else {
                var valorPlano = 0;
                try{
                  valorPlano = vm.plans.find(x => x.Id == phoneNumber.IdPlanOption).Value;
                }
                catch(e){}
                
                vm.pricelist.push(valorPlano + totalServicos);
                vm.customer.Phones[i]['Price'] = valorPlano + totalServicos;
                // customer.Phones[i].PriceFoneclube = valorPlano + totalServicos;
              }

            }
              
            for (var i = 0; i < vm.customer.Phones.length; i++) {
                var phoneNumber = vm.customer.Phones[i];
                if(phoneNumber.IdPlanOption == 0){
                  vm.actual_phone = phoneNumber.NovoFormatoNumero;
                  vm.actual_id = i;
                  break
                }

            }
            if(!vm.actual_phone){
                for (var i = 0; i < vm.customer.Phones.length; i++) {
                    var phoneNumber = vm.customer.Phones[i];
                    if(phoneNumber.LinhaAtiva == false){
                        vm.actual_phone = phoneNumber.NovoFormatoNumero;
                        vm.actual_id = i;
                        break
                    }
                }
            }

            vm.tempPhones = angular.copy(vm.customer.Phones);

            vm.sp = 1;
            
            if(vm.autoSumNormal)
              autmaticSumNormal();
            if(vm.autoSum)
              autmaticSum();

            // // 
            addHistory();
          });

        

      });
    };


    vm.loading = false;
    vm.autoCompleteOptions = {
      minimumChars: 1,
      //selectedTextAttr: 'PhoneParent',
      data: function (searchTerm) {
        return FoneclubeService.getAllParents()
          .then(function (response) {
            vm.loading = true;
            console.log(response);
            // ideally filtering should be done on server
            searchTerm = searchTerm.toUpperCase();


            return _.filter(response, function (info) {
              if (info.NameParent != null)
                //return info.NameParent.startsWith(searchTerm);
                return removeAccents(info.NameParent.toString().toLowerCase()).indexOf(removeAccents(searchTerm.toLowerCase())) > -1;
            });

          }).catch(function (error) {
            console.log('error: ' + error);
          });
      },
      renderItem: function (item) {
        return {
          value: item.NameParent,
          label: $sce.trustAsHtml(
            "<p class='auto-complete' style='margin-bottom:0px;'>"
            + item.NameParent +
            "</p>")
        };
      },
      itemSelected: function (e) {
    
        var contactNo = "(" + e.item.DDDParent + ") " + e.item.PhoneParent.toString().substring(0, 5) + "-" + e.item.PhoneParent.toString().substring(5, 9);
        vm.contactParent = contactNo;
      }
    }

    vm.getParentDataByPhone = getParentDataByPhone;

    function getParentDataByPhone(phoneparent, personid) {
  
      if (phoneparent && personid) {
        phoneparent = phoneparent.replace('(', '').replace(')', '').replace('-', '').replace(' ', '').trim().substring(2, 11);
        FoneclubeService.getCustomerParentByPhone(phoneparent, personid).then(function (result) {
          console.log(result);
          vm.customer.NameContactParent = result.NameParent;
        }).catch(function (error) {
          console.log('error: ' + error);
        });
      }
    };



    function populaPai(customer) {

      vm.customer.NameContactParent = customer.NameParent;

      if (customer.PhoneDDDParent != null && customer.PhoneNumberParent != null)
        vm.contactParent = customer.PhoneDDDParent + customer.PhoneNumberParent;

    }

    function getPersonParent(id) {
      if (id) {
        FoneclubeService.getCustomerById(id).then(function (result) {

          vm.customerPai = result;
          console.log('parent - ')
          console.log(result)

          if (result.Phones.length > 0) {
            vm.contactParent = result.Phones[0].DDD.concat(result.Phones[0].Number);
          }
        }).catch(function (error) {
          console.log('error: ' + error);
        });
      }
    }

    function getFormatedDate(param) {
      var date = new Date(param);
      var day = date.getDate();
      var month = date.getMonth() + 1;
      var year = date.getFullYear();
      if (day < 10) { day = "0" + day; }
      if (month < 10) { month = "0" + month; }
      return day + '/' + month + '/' + year;
    }

    function onTapSendUser(customer) {
       

      if (vm.requesting == true)
        return;

      vm.requesting = true;

      var dontHaveContact = vm.tempPhones.filter(function (element, index, array) {
        return element.IsFoneclube == null || element.IsFoneclube == false;
      });

      if(dontHaveContact.length == 0)
      {
        var contactPhone = {
          "DDD":UtilsService.getPhoneNumberFromStringToJson(vm.actual_phone).DDD,
          "Number":UtilsService.getPhoneNumberFromStringToJson(vm.actual_phone).Number,
          "IsFoneclube": false
        }

        vm.tempPhones.push(contactPhone);
      }

      // update phones of input
      for (var i in vm.tempPhones) {
        vm.tempPhones[i].DDD = UtilsService.getPhoneNumberFromStringToJson(vm.tempPhones[i].NovoFormatoNumero).DDD;
        vm.tempPhones[i].Number = UtilsService.getPhoneNumberFromStringToJson(vm.tempPhones[i].NovoFormatoNumero).Number;


        if(vm.tempPhones[i].IsFoneclube != true)
        {
          vm.tempPhones[i].IsFoneclube = false;
          vm.tempPhones[i].DDD = UtilsService.getPhoneNumberFromStringToJson(vm.actual_phone).DDD;
          vm.tempPhones[i].Number = UtilsService.getPhoneNumberFromStringToJson(vm.actual_phone).Number;
        }
        
      }
      
      var customerSend = {
        "Id": customer.Id,
        "DocumentNumber": UtilsService.clearDocumentNumber(customer.DocumentNumber),
        "Register": customer.Register,
        "Name": customer.Name,
        "NickName": customer.NickName,
        "Email": customer.Email,
        "Born": customer.Born,
        "Gender": customer.Gender,
        "IdPlanOption": customer.IdPlanOption,
        "IdPagarme": customer.IdPagarme,
        "IdRole": customer.IdRole,
        "Adresses": customer.Adresses,
        "Phones": vm.tempPhones,
        "Photos": customer.Photos,
        "IdParent": customer.IdParent,
        "NameContactParent": customer.NameContactParent,
        "IdCommissionLevel": customer.IdCommissionLevel,
        "SinglePrice": vm.singlePriceLocal,
        "DescriptionSinglePrice": customer.DescriptionSinglePrice
      }

      try{
        customerSend.SinglePrice = customerSend.SinglePrice.replace('R','').replace('$','').replace('.','').replace(',','');
      }
      catch(erro){}

      var newFoneclubeDocument = false;
      FoneclubeService.getStatusDocument(customerSend.DocumentNumber).then(function (result) {
        newFoneclubeDocument = result;

      var totalPriceValidade = 0;
      for (var i in vm.customer.Phones) {
        vm.plans.find(function (element, index, array) {
          if (element.Id == vm.customer.Phones[i].IdPlanOption) {
            totalPriceValidade = totalPriceValidade + element.Value / 100;
          }
        });
      }

      // if (vm.singlePriceLocal) {
      //   if ((vm.singlePriceLocal / 100) > totalPriceValidade) {
      //     DialogFactory.showMessageDialog({ mensagem: 'Preço único aplicado é maior do que o preço de todos os planos somados.' });
      //     // vm.requesting = false;
      //     // return;
      //   }
      // }

      var digitosMinimosTelefone = 11
      
      //Regra: o telefone não pode ser incompleto, mass pode estar em branco, se for de contato foge da regra
      for (var item in customerSend.Phones) {

        customerSend.Phones[item].NovoFormatoNumero = customerSend.Phones[item].DDD + customerSend.Phones[item].Number
        if (customerSend.Phones[item].NovoFormatoNumero.length < digitosMinimosTelefone && customerSend.Phones[item].NovoFormatoNumero.length > 0 && customerSend.Phones[item].IsFoneclube) {
          // debugger;
          DialogFactory.showMessageDialog({ titulo: 'Aviso', mensagem: 'O telefone: '.concat(customerSend.Phones[item].NovoFormatoNumero).concat(', não pode ficar incompleto, mas pode ficar em branco.') });
          vm.requesting = false;
          return;
        }

      }
      
      var arrayFiltered = customerSend.Phones.filter(function (number) {
        return number.IsFoneclube == true && number.DDD.length == 2 && number.Number.length >= 8 && number.Delete == null && number.LinhaAtiva;
      });

      for (var i in customerSend.Adresses) {
        if (customerSend.Adresses[i].Cep == '')
          customerSend.Adresses.splice(i, 1);
      }
      var showLoader = DialogFactory.showLoader('Enviando Dados...');

      if (arrayFiltered.length == 0) {
        runPostUpdateCustomer(customerSend);
      } 
      else {

        validadeNumbers(arrayFiltered).then(function (result) {
          var right = true;
          for (var item in result) {
            if (result[item].DocumentNumber && result[item].DocumentNumber != UtilsService.clearDocumentNumber(vm.customer.DocumentNumber) && !newFoneclubeDocument) {

              var msg = 'Você não pode cadastrar o mesmo telefone para dois clientes.</br>O número <strong>'
                .concat(arrayFiltered[item].NovoFormatoNumero).concat('</strong>, pertence ao cliente ')
                .concat(result[item].DocumentNumber).concat(', ').concat(result[item].Name).concat('.');
              DialogFactory.showMessageDialog({ titulo: 'Aviso', mensagem: msg });
              right = false;
              vm.requesting = false;
              showLoader.close();
            }
          }
          for (var x in arrayFiltered) {
            //nao deixa add o mesmo numero duas vezes para o mesmo cliente;
            var twiceNumber = arrayFiltered.filter(function (element, index, array) {
              return element.DDD == arrayFiltered[x].DDD && element.Number == arrayFiltered[x].Number;
            });
            if (twiceNumber.length > 1) {
              DialogFactory.showMessageDialog({ titulo: 'Aviso', mensagem: 'Você não pode cadastrar o mesmo telefone duas vezes para o cliente.' });
              right = false;
              vm.requesting = false;
              showLoader.close();
              break;
            }
          }
          // // 
          if (right) {
            runPostUpdateCustomer(customerSend);
          }
        });
      }

      function runPostUpdateCustomer(customerSend) {
        
        
        // valida preenchimento de telefones
        for(var i in customerSend.Phones)
        {
          var ddd = customerSend.Phones[i].DDD;
          var number = customerSend.Phones[i].Number;

          var dddIsNum = /^\d+$/.test(ddd);
          var numberIsNum = /^\d+$/.test(number);

          if(!dddIsNum || !numberIsNum || ddd.length == 0 || number.length == 0)
          {
            alert("Os telefones devem estar preenchidos com DDD e Número. Ajuste e refaça o envio.");
            vm.requesting = false;
            showLoader.close();
            return;
          }
        }

        UtilsService.sendImageToUpload(vm.imageSelf, vm.imageFrente, vm.imageVerso).then(function (result) {
          for (var i in result) {
            customerSend.Photos = customerSend.Photos.filter(function (element) {
              return element.Tipo != result[i].tipo;
            });
          
            customerSend.Photos.push({ Name: result[i].filename, Tipo: result[i].tipo });
          }

          var parentDDD = "";
          var parentNumber = "";
          if (vm.contactParent != undefined)
          {
            var parentDDD = vm.contactParent.replace('(', '').replace(')', '').replace('-', '').replace(' ', '').trim().substring(0, 2);
            var parentNumber = vm.contactParent.replace('(', '').replace(')', '').replace('-', '').replace(' ', '').trim().substring(2, 11);
          }

          var parentName = vm.customer.NameContactParent;

          var customerObj = {
            'NameParent': vm.customer.NameContactParent,
            'Id': customerSend.Id,
            'PhoneDDDParent': parentDDD,
            'PhoneNumberParent': parentNumber
          }
          
          FoneclubeService.postCustomerParent(customerObj).then(function (result) {
            if (result)
              FoneclubeService.postUpdateCustomer(customerSend).then(postUpdateCustomerSucess).catch(postUpdateCustomerError);
            else {
              DialogFactory.dialogConfirm({ title: 'Andamento editar', mensagem: '1 Não foi possível atualizar dados do pai da linha, deseja salvaro restante ( reomendável que sim ):', btn1: 'sim', btn2: 'não' })
                .then(function (result) {
                  if (result) {
                    FoneclubeService.postUpdateCustomer(customerSend).then(postUpdateCustomerSucess).catch(postUpdateCustomerError);
                  } else {
                    return;
                  }
                })
            }
          }).catch(function (erro) {

            DialogFactory.dialogConfirm({ title: 'Andamento editar', mensagem: '2 Não foi possível atualizar dados do pai da linha, deseja salvaro restante ( reomendável que sim ):', btn1: 'sim', btn2: 'não' })
              .then(function (result) {
                if (result) {
                  FoneclubeService.postUpdateCustomer(customerSend).then(postUpdateCustomerSucess).catch(postUpdateCustomerError);
                } else {
                  return;
                }
              })

          });

        })

      }

      function postUpdateCustomerSucess(result) {
        if (result) {
          DialogFactory.dialogConfirm({ title: 'Edição Realizada', mensagem: 'Todos os dados pessoais enviados, edição Foneclube feita com sucesso.', btn1: 'Voltar para Clientes', btn2: 'Cobrança Cliente' })
            .then(function (result) {
              if (result) {
                FoneclubeService.getCustomerByCPF(UtilsService.clearDocumentNumber(vm.cpf)).then(function (result) {
                  ViewModelUtilsService.showModalCustomer(result);
                });
              } else {
                if(vm.calledView == 1)
                    FlowManagerService.changeNewHomeView();
                  else
                    FlowManagerService.changeAllPhoneLinesNewView();
              }
            });
        }
        vm.requesting = false;
        showLoader.close();
      }

      function postUpdateCustomerError(error) {
        DialogFactory.showMessageDialog({ mensagem: error.statusText });
        vm.requesting = false;
        showLoader.close();
      }

      });
      // aqui
    };

    function onTapCancel() {
      if(vm.calledView == 1)
        FlowManagerService.changeNewHomeView();
      else
        FlowManagerService.changeAllPhoneLinesNewView();
    }

    function onTapSendUserAllCheck(customer) {


      if (vm.requesting == true) return;
      vm.requesting = true;

      for (var i = 0; i < vm.tempPhones.length; i++) {
        vm.customer.Phones[i] = angular.copy(vm.tempPhones[i]);

      }

      // customer.Photos = vm.customer.Phones;

      //TODO
      //colocar breakpoint nos metodos localhost API, validar se novos atributos chegam--Putting breakpoint the methods localhost API, validate the new assets come.
      //revisar todos nomes entidade .net apos refact de nomes atributos -- Revisar of names or. net apos refact of attributes.
      var customerSend = {
        "Id": customer.Id,
        "DocumentNumber": UtilsService.clearDocumentNumber(customer.DocumentNumber),
        "Register": customer.Register,
        "Name": customer.Name,
        "NickName": customer.NickName,
        "Email": customer.Email,
        "Born": customer.Born,
        "Gender": customer.Gender,
        "IdPlanOption": customer.IdPlanOption,
        "IdPagarme": customer.IdPagarme,
        "IdRole": customer.IdRole,
        "Adresses": customer.Adresses,
        "Phones": customer.Phones,
        "Photos": customer.Photos,
        "IdParent": customer.IdParent,
        "NameContactParent": customer.NameContactParent,
        "IdCommissionLevel": customer.IdCommissionLevel,
        "SinglePrice": vm.singlePriceLocal,
        "DescriptionSinglePrice": customer.DescriptionSinglePrice
      }
      var totalPriceValidade = 0;
      for (var i in vm.customer.Phones) {
        vm.plans.find(function (element, index, array) {
          if (element.Id == vm.customer.Phones[i].IdPlanOption) {
            totalPriceValidade = totalPriceValidade + element.Value / 100;
          }
        });
      }

      // if (vm.singlePriceLocal) {
      //   if ((vm.singlePriceLocal / 100) > totalPriceValidade) {
      //     DialogFactory.showMessageDialog({ mensagem: 'Preço único aplicado é maior do que o preço de todos os planos somados.' });
      //     //showLoader.close();
      //     // vm.requesting = false;
      //     // return;
      //   }
      // }


      var digitosMinimosTelefone = 11
      //Regra: o telefone não pode ser incompleto, mass pode estar em branco
      for (var item in customerSend.Phones) {
        if (customerSend.Phones[item].NovoFormatoNumero.length < digitosMinimosTelefone && customerSend.Phones[item].NovoFormatoNumero.length > 0) {
          // // ;
          DialogFactory.showMessageDialog({ titulo: 'Aviso', mensagem: 'O telefone: '.concat(customerSend.Phones[item].NovoFormatoNumero).concat(', não pode ficar incompleto, mas pode ficar em branco.') });
          //showLoader.close();
          vm.requesting = false;
          return;
        } else {

          customerSend.Phones[item].DDD = UtilsService.getPhoneNumberFromStringToJson(customerSend.Phones[item].NovoFormatoNumero).DDD;
          customerSend.Phones[item].Number = UtilsService.getPhoneNumberFromStringToJson(customerSend.Phones[item].NovoFormatoNumero).Number;
          customerSend.Phones[item].PortNumber = (customerSend.Phones[item].PortNumber != "inativo") ? UtilsService.getPhoneNumberFromStringToJson(customerSend.Phones[item].PortNumber).DDD + '' + UtilsService.getPhoneNumberFromStringToJson(customerSend.Phones[item].PortNumber).Number: customerSend.Phones[item].PortNumber;
        }
      }

      var arrayFiltered = customerSend.Phones.filter(function (number) {
        return number.IsFoneclube == true && number.DDD.length == 2 && number.Number.length >= 8 && number.Delete == null && number.LinhaAtiva;
      });

      //Fix se o usuario não add CEP o array deve estar vazio;
      for (var i in customerSend.Adresses) {
        if (customerSend.Adresses[i].Cep == '')
          customerSend.Adresses.splice(i, 1);
      }
      var showLoader = DialogFactory.showLoader('Enviando Dados...');
      if (arrayFiltered.length == 0) {
        runPostUpdateCustomer(customerSend);
      } else {

        // // ;
        validadeNumbers(arrayFiltered).then(function (result) {
          var right = true;
          for (var item in result) {
            if (result[item].DocumentNumber && result[item].DocumentNumber != UtilsService.clearDocumentNumber(vm.customer.DocumentNumber)) {

              // // ;
              var msg = 'Você não pode cadastrar o mesmo telefone para dois clientes.</br>O número <strong>'
                .concat(arrayFiltered[item].NovoFormatoNumero).concat('</strong>, pertence ao cliente ')
                .concat(result[item].DocumentNumber).concat(', ').concat(result[item].Name).concat('.');
              DialogFactory.showMessageDialog({ titulo: 'Aviso', mensagem: msg });
              right = false;
              vm.requesting = false;
              showLoader.close();
            }
          }
          for (var x in arrayFiltered) {
            //nao deixa add o mesmo numero duas vezes para o mesmo cliente;
            var twiceNumber = arrayFiltered.filter(function (element, index, array) {
              return element.DDD == arrayFiltered[x].DDD && element.Number == arrayFiltered[x].Number;
            });
            if (twiceNumber.length > 1) {
              DialogFactory.showMessageDialog({ titulo: 'Aviso', mensagem: 'Você não pode cadastrar o mesmo telefone duas vezes para o cliente.' });
              right = false;
              vm.requesting = false;
              showLoader.close();
              break;
            }
          }
          if (right) {
            runPostUpdateCustomer(customerSend);
          }
        });
      }

      function runPostUpdateCustomer(customerSend) {

        UtilsService.sendImageToUpload(vm.imageSelf, vm.imageFrente, vm.imageVerso).then(function (result) {
          for (var i in result) {
            customerSend.Photos = customerSend.Photos.filter(function (element) {
              return element.Tipo != result[i].tipo;
            });
            // for (var x in customerSend.Photos) {
            //     if (result[i].tipo == customerSend.Photos[x].Tipo) {
            // //         ;
            //         customerSend.Photos.splice(x, 1);
            //     }
            // }
            customerSend.Photos.push({ Name: result[i].filename, Tipo: result[i].tipo });
          }

          var parentDDD = "";
          var parentNumber = "";
          if (vm.contactParent != undefined) {
            var parentDDD = vm.contactParent.replace('(', '').replace(')', '').replace('-', '').replace(' ', '').trim().substring(0, 2);
            var parentNumber = vm.contactParent.replace('(', '').replace(')', '').replace('-', '').replace(' ', '').trim().substring(2, 11);
          }

          var parentName = vm.customer.NameContactParent;
          // // ;


          var customerObj = {
            'NameParent': vm.customer.NameContactParent,
            'Id': customerSend.Id,
            'PhoneDDDParent': parentDDD,
            'PhoneNumberParent': parentNumber
          }

          FoneclubeService.postCustomerParent(customerObj).then(function (result) {
            
            if (result)
              FoneclubeService.postUpdateCustomer(customerSend).then(postUpdateCustomerSucesscheck).catch(postUpdateCustomerError);
            else {
              DialogFactory.dialogConfirm({ title: 'Andamento editar', mensagem: '3 Não foi possível atualizar dados do pai da linha, deseja salvaro restante ( reomendável que sim ):', btn1: 'sim', btn2: 'não' })
                .then(function (result) {
                  if (result) {
                    return;
                   // FoneclubeService.postUpdateCustomer(customerSend).then(postUpdateCustomerSucesscheck).catch(postUpdateCustomerError);
                  } else {
                    return;
                  }
                })
            }
          }).catch(function (erro) {

            FoneclubeService.postUpdateCustomer(customerSend).then(postUpdateCustomerSucesscheck).catch(postUpdateCustomerError);

          });






        })

      }

      

      function postUpdateCustomerSucess(result) {
        if (result) {
          DialogFactory.dialogConfirm({ title: 'Edição Realizada', mensagem: 'Todos os dados pessoais enviados, edição Foneclube feita com sucesso.', btn1: 'Ir para Home', btn2: 'Visualizar Cliente' })
            .then(function (result) {
              if (result) {
                if(vm.calledView == 1)
                    FlowManagerService.changeCustomersView();
                  else
                    FlowManagerService.changeAllPhoneLinesNewView();
                FoneclubeService.getCustomerByCPF(UtilsService.clearDocumentNumber(vm.cpf)).then(function (result) {
                  vm.data.customers.splice(index, 1, result);
                  ViewModelUtilsService.showModalCustomer(result);
                });
              } else {
                if(vm.calledView == 1)
                  FlowManagerService.changeNewHomeView();
                else
                  FlowManagerService.changeAllPhoneLinesNewView();
              }
            })
        }
        vm.requesting = false;
        showLoader.close();
      }

      function postUpdateCustomerSucesscheck(result) {

        vm.requesting = false;
        showLoader.close();
      }

      function postUpdateCustomerError(error) {
        DialogFactory.showMessageDialog({ mensagem: error.statusText });
        vm.requesting = false;
        showLoader.close();
      }
    };

    function setPlansList(operadora) {
      vm.selectedPlansList = [];
      for (var item in vm.plans) {
        if (operadora == 1 && vm.plans[item].Description.endsWith('VIVO')) {
          vm.selectedPlansList.push(vm.plans[item]);
        } else if (operadora == 2 && vm.plans[item].Description.endsWith('CLARO')) {
          vm.selectedPlansList.push(vm.plans[item]);
        }
      }
    }

    function validarCEP(index) {
      if (vm.customer.Adresses[index].Cep.length < 9) return;
      var showLoader = DialogFactory.showLoader('Tentando preencher dados...');
      HubDevService.validaCEP(vm.customer.Adresses[index].Cep.replace(/[-.]/g, '')).then(function (result) {
        if (!result.erro) {
          vm.customer.Adresses[index].Street = result.logradouro;
          vm.customer.Adresses[index].Neighborhood = result.bairro;
          vm.customer.Adresses[index].City = result.localidade;
          vm.customer.Adresses[index].State = result.uf;
        } else {
          DialogFactory.showMessageDialog({ mensagem: "CEP incorreto." });
        }
        showLoader.close();
      }, function (error) {
        showLoader.close();
      });
    }

    function validarCPF() {


      if (vm.customer.DocumentNumber.length < 11) { 
        return 
      }
      FoneclubeService.getCustomerByCPF(UtilsService.clearDocumentNumber(vm.customer.DocumentNumber)).then(function (existentClient) {
        if (existentClient.Id == 0) {
          HubDevService.validaCPF(UtilsService.clearDocumentNumber(vm.customer.DocumentNumber)).then(function (result) {
            if (result.status) {
              vm.name = result.nome;
            }
          }, function (error) { });
        } else if (existentClient.DocumentNumber != vm.DocumentNumberFreeze) {
          DialogFactory.showMessageConfirm({ titulo: 'CPF já cadastrado', mensagem: 'Você não pode cadastrar um cpf repetido.' })
            .then(function (param) {
              var cpf = angular.copy(vm.DocumentNumberFreeze);
              // vm.customer.DocumentNumber = cpf.substr(0, 3) + '.' + cpf.substr(3, 3) + '.' + cpf.substr(6, 3) + '-' + cpf.substr(9)
            })
        }
      }, function (result) {
        if(vm.calledView == 1)
            FlowManagerService.changeCustomersView();
          else
            FlowManagerService.changeAllPhoneLinesNewView();
      }).catch(function (error) {
        if(vm.calledView == 1)
            FlowManagerService.changeCustomersView();
          else
            FlowManagerService.changeAllPhoneLinesNewView();
      });
    }

    function onTapNewPhoneNumber() {
      // 
      vm.customer.Phones.push(
        {
          'Id': null,
          'DDD': '',
          'Number': '',
          'IsFoneclube': true,
          'IdOperator': 0,
          'Portability': 'false',
          'NickName': '',
          'IdPlanOption': 0,
          'Inative': false,
          'Delete': null,
          'NovoFormatoNumero': '',
          'operadora': '1',
          'key': Math.random(),
          'LinhaAtiva': true
        }
      );

      vm.tempPhones = angular.copy(vm.customer.Phones);
      resizeScroll();
    }

    function onTapRemoveNewNumber(position) {
      // // 
      DialogFactory.dialogConfirm({ titulo: 'Excluir Número', mensagem: 'Deseja realmente remover este número?' })
        .then(function (res) {
          if (res) {
            if (vm.customer.Phones[position].Id !== null) {
              vm.customer.Phones[position].Delete = true;
            } else {
              vm.customer.Phones.splice(position, 1);
            }

          }
        })
    }

    function validadeNumbers(numbers) {
      var promises = numbers.map(function (number) {
        return FoneclubeService.getCustomerByPhoneNumber({
          ddd: clearPhoneNumber(number.DDD),
          numero: clearPhoneNumber(number.Number)
        });
      });
      return $q.all(promises);
    }

    function validatePhoneNumber(position) {

      // // ;

      if (vm.requesting || vm.customer.Phones[position].NovoFormatoNumero.length < 14) return;
      var number = {
        ddd: UtilsService.getPhoneNumberFromStringToJson(vm.customer.Phones[position].NovoFormatoNumero).DDD,
        numero: UtilsService.getPhoneNumberFromStringToJson(vm.customer.Phones[position].NovoFormatoNumero).Number
      }
      //nao deixa add o mesmo numero duas vezes para o mesmo cliente;
      var twiceNumber = vm.customer.Phones.filter(function (element, index, array) {
        return element.NovoFormatoNumero == vm.customer.Phones[position].NovoFormatoNumero
          && element.IsFoneclube == true
          && element.Delete == null;
      });
      if (twiceNumber.length > 1) {
        DialogFactory.showMessageDialog({ titulo: 'Aviso', mensagem: 'Você não pode cadastrar o mesmo telefone duas vezes para o cliente.' });
        return;
      }
      FoneclubeService.getCustomerByPhoneNumber(number).then(function (res) {
        if (res.DocumentNumber && res.DocumentNumber != UtilsService.clearDocumentNumber(vm.customer.DocumentNumber)) {
          DialogFactory.showMessageDialog({ titulo: 'Aviso', mensagem: 'Este telefone já pertence a um cliente.' });
        }
      });
    }

    function getNumberString(param) {
      return param.DDD.concat(param.Number);
    }

    function clearPhoneNumber(number) {
      return number ? number.replace('-', '').replace(' ', '').replace('(', '').replace(')', '') : '';
    }

    function showAddNewPhone() {
      function filterPhones(number) {
        return number.IsFoneclube == true;
      }
      return vm.customer.Phones.filter(filterPhones);
    }

    function goBack() {
      FlowManagerService.goBack();
      FoneclubeService.getCustomerByCPF(vm.cpf).then(function (result) {
        ViewModelUtilsService.showModalCustomer(result);
      });
    }

    function resizeScroll() {
      $ionicScrollDelegate.resize();
    }

    vm.imageSelf;
    vm.base64Self;
    vm.imageFrente;
    vm.base64Frente;
    vm.imageVerso;
    vm.base64Verso;
    vm.uploadImg = uploadImg;
    vm.viewImg = viewImg;
    
    function viewImg(img) {
      ngDialog.open({
        template: '<div class="popup-lista-imagens ngdialog-close"><img ng-src="{{img}}"/></div>',
        controller: ['$scope', 'DataFactory', function ($scope, DataFactory) {
          $scope.img = $scope.ngDialogData.img;
        }],
        className: 'ngDialog-custom-width popup-lista-imagens',
        plain: true,
        closeByDocument: true,
        data: {
          img: img
        }
      });
    }
    function uploadImg(param) {
      document.getElementById(param).click();
    }
    vm.getImageOftype = getImageOftype;
    function getImageOftype(type) {
      function base64img(tipo) {
        if (tipo == 1) {
          return vm.base64Self;
        } else if (tipo == 2) {
          return vm.base64Frente;
        } else if (tipo == 3) {
          return vm.base64Verso;
        }
        return null;
      }
      if (base64img(type)) {
        return base64img(type);
      }
      var img = vm.customer.Photos.filter(function (element) {
        return element.Tipo == type;
      });
      if (img[0]) {
        return 'https://s3-sa-east-1.amazonaws.com/fone-clube-bucket/' + img[0].Name;
      }
      return '../../content/img/upload-cloud.png';
    }

    vm.onlyUnique = onlyUnique;

    function onlyUnique(value, index, self) {
      return self.indexOf(value) === index;
    }

    vm.getPrice = getPrice;
    function getPrice(id) {
      console.log(id);
      if (id == '')
        return 0;
      return vm.plans.find(x => x.Id == id).Value / 100;
    }

    vm.changedPlano = changedPlano;
    function changedPlano(position, id) {

      if (id == '' || id == null)
        vm.pricelist[position] = 0;
      else
        vm.pricelist[position] = vm.plans.find(x => x.Id == id).Value;
      
      addHistory();
      autmaticSum();
      autmaticSumNormal();
    }

    vm.onfocusPreco = onfocusPreco;
    function onfocusPreco(position){
        vm.tempPrice = vm.pricelist[position];
    }

    vm.onBlurPreco = onBlurPreco;
    function onBlurPreco(position){
        if(vm.tempPrice != vm.pricelist[position]){
            addHistory();
        }
    }

    vm.onunchecked = onunchecked;
    function onunchecked(position) {

      var phone =
      {
        "Id": vm.tempPhones[position].Id,
      };

      if(phone.Id == null)
      {
        vm.tempPhones[position].Delete = true;
        vm.tempPhones.splice(position, 1);
        return;
      }
        

      var r = confirm("Deseja fazer um soft delete nessa linha?");
      if (r == true) {
          FoneclubeService.postSoftDeletePhone(phone).then(function(result){
              ;
              if(result){
                vm.tempPhones[position].Delete = true;
                vm.tempPhones.splice(position, 1);
              }
                
          })
      } 
      else {
          txt = "You pressed Cancel!";
      }

    }

    // TODO ajustar ou remover
    vm.onallunchecked = onallunchecked;
    function onallunchecked() {
      vm.tempPhones = angular.copy(vm.customer.Phones);
      for (var position = 0; position < vm.tempPhones.length; position++) {
        var id = vm.tempPhones[position].IdPlanOption;
        if (id == '' || id == null)
          vm.pricelist[position] = 0;
        else{
          vm.pricelist[position] = vm.plans.find(x => x.Id == id).Value;
          vm.tempPhones[position]['Price'] = vm.plans.find(x => x.Id == id).Value;
        }
          
      }
    }

    function onedit() {
      ViewModelUtilsService.showModalCustomer(vm.customer, -1);
    }

    vm.ignoreAccents = function (item) {
      if (vm.showall) {
        return true;
      } else {

        try{

        var text = item.NovoFormatoNumero!=undefined ? removeAccents(item.NovoFormatoNumero.toLowerCase()) : "";
        //alert(text);
        var search_text = removeAccents(vm.search.replace(/[!#$%&'()*+,-./:;?@[\\\]_`{|}~]/g, ''));
        var flag1 = text.indexOf(search_text) > -1;
        var flag2 = true;
        if (vm.linhaAtiva && !item.LinhaAtiva) {
          flag2 = false;
        }
        var flag3 = true;
        if (!vm.claro) {
          var itm = vm.plans.find(x => x.Id == item.IdPlanOption);
          if (!itm) {
            flag3 = false;
          } else {
            text = removeAccents(itm.Description.toLowerCase());
            flag3 = !(text.indexOf('claro') > -1);
          }
        }
        var flag4 = true;
        if (!vm.vivo) {
          var itm = vm.plans.find(x => x.Id == item.IdPlanOption);
          if (!itm) {
            flag4 = false;
          } else {
            text = removeAccents(itm.Description.toLowerCase());
            flag4 = !(text.indexOf('vivo') > -1);
          }
        }
        console.log(item.Number + "-" + (flag1 && flag2 && flag3 && flag4));
        return flag1 && flag2 && flag3 && flag4;

        
      }
      catch(e){
        console.log('Erro lowercase');
        // console.log(e);
      }

      }
    };

    vm.changedFilterAll = changedFilterAll;
    function changedFilterAll() {
      if (vm.showall) {
        vm.search = "";
        vm.linhaAtiva = false;
        vm.claro = true;
        vm.vivo = true;
      }
    }

    vm.onUndo = onUndo;
    function onUndo() {
      vm.sp--;
      var tmp = angular.copy(vm.history[vm.sp - 1]);
      vm.tempPhones = tmp.phones;
      vm.pricelist = tmp.pricelist;
      for (var position = 0; position < vm.tempPhones.length; position++) {
        var id = vm.tempPhones[position].IdPlanOption;
      }
    }

    vm.onRedo = onRedo;
    function onRedo() {
      vm.sp++;
      var tmp = angular.copy(vm.history[vm.sp - 1]);
      vm.tempPhones = tmp.phones;
      vm.pricelist = tmp.pricelist;
      for (var position = 0; position < vm.tempPhones.length; position++) {
        var id = vm.tempPhones[position].IdPlanOption;
      }
    }

    vm.addHistory = addHistory;
    function addHistory() {
      if (vm.history.length > vm.sp) {
        vm.history.splice(vm.sp, vm.history.length - vm.sp);
      }
      var tmpPhones = angular.copy(vm.tempPhones);
      var tmpPricelist = angular.copy(vm.pricelist);
      vm.history.push({ 'phones': tmpPhones, 'pricelist': tmpPricelist });
      vm.sp = vm.history.length;
    }

    vm.telephonechanged = telephonechanged;
    function telephonechanged($index, phone) {
      try{
        var ddd = phone.replace('(', '').replace(')', '').replace('-', '').replace(' ', '').trim().substring(0, 2)
        var phone = phone.replace('(', '').replace(')', '').replace('-', '').replace(' ', '').trim().substring(2, 11)
  
        vm.customer.Phones[$index].DDD = ddd;
        vm.customer.Phones[$index].Number = phone;
        vm.customer.Phones[$index].NovoFormatoNumero = ddd + phone;
  
        vm.tempPhones[$index].DDD = ddd;
        vm.tempPhones[$index].Number = phone;
        vm.tempPhones[$index].NovoFormatoNumero = ddd + phone;
      }
      catch(e){}
      
    }

    vm.activechanged = activechanged;
    function activechanged($index) {
      // debugger
      addHistory();
    }


    vm.pricechanged = pricechanged;
    function pricechanged($index) {
      autmaticSum();
      autmaticSumNormal();
    }
    vm.pricechangedVIP = pricechangedVIP;
    function pricechangedVIP($index) {
        autmaticSum();
    }
    vm.nicknamechanged = nicknamechanged;
    function nicknamechanged($index) {
      addHistory();
    }

     vm.changedAutoSum = changedAutoSum;
    function changedAutoSum() {
      if (vm.autoSum) {
        autmaticSum();
      }
      saveUserSettings();
    }

    vm.changedAutoSumNormal = changedAutoSumNormal;
    function changedAutoSumNormal() {
      if (vm.autoSumNormal) {
        autmaticSumNormal();
      }
      saveUserSettings();
    }
    function autmaticSum() {

      if (vm.autoSum) {
        vm.singlePriceLocal = 0;
        for (var i = 0; i < vm.pricelist.length; i++) {
          if(vm.tempPhones[i].LinhaAtiva && !vm.tempPhones[i].Delete && vm.tempPhones[i].IsFoneclube){
              if(vm.tempPhones[i].AmmountPrecoVip > 0){
                  vm.singlePriceLocal += parseInt(vm.tempPhones[i].AmmountPrecoVip) ;
              }
              else {
                  vm.singlePriceLocal += parseInt(vm.pricelist[i]) ;
              }
          }

        }
        vm.singlePriceLocal = vm.singlePriceLocal / 100;
        vm.singlePriceLocal = 'R$'+vm.singlePriceLocal.toFixed(2);
      }
    }

    function autmaticSumNormal() {

      if (vm.autoSumNormal) {
        vm.singlePrice = 0;
        for (var i = 0; i < vm.pricelist.length; i++) {
          if(vm.tempPhones[i].LinhaAtiva && !vm.tempPhones[i].Delete && vm.tempPhones[i].IsFoneclube){
              vm.singlePrice += parseInt(vm.pricelist[i]) ;
          }

        }
        vm.singlePrice = vm.singlePrice / 100;
        vm.singlePrice = 'R$'+vm.singlePrice.toFixed(2);
      }
    }

    function changeCustomerAtivity(id, status){
      console.log(' --- changeCustomerAtivity');
      // debugger

      var customer = {
        'Id':id,
        'Desativo': !status
      }
      // debugger;
      FoneclubeService.postPersonAtivity(customer).then(function(result){
        // debugger;
      })
    }

    function onClickFlag(phoneNumber){
      console.log('onClickFlag');
      console.log(phoneNumber);
      
      var cliente = vm.customer;
      cliente.flagPhone = true;
      cliente.selectedPhone = phoneNumber
      // debugger
      ViewModelUtilsService.showModalFlag(cliente);

    }

    function saveUserSettings()
    {
      var data = {
        IntIdPerson : vm.customer.Id,
        IsPrecoPromoSum : vm.autoSum,
        IsPrecoFCSum : vm.autoSumNormal,
        IsUse2Prices : vm.customer.Use2Prices,
        IsVIP : vm.customer.IsVIP,
        IsLinhaAtiva : vm.linhaAtiva,
        IsShowICCID : vm.iccid,
        IsShowPort : vm.noPortar
      };

      FoneclubeService.saveUserSettings(data).then(function (result) {
        console.log('Saved Usar2Preços');
      });
    }

    function openChargeSummary()
    {
       FoneclubeService.getCustomerByCPF(UtilsService.clearDocumentNumber(vm.cpf)).then(function (result) {
          ViewModelUtilsService.showModalCustomer(result);
       });
    }
  }
})();
