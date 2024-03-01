(function () {
  'use strict';

  angular.module('foneClub').controller('CustomersController', CustomersController);

  CustomersController.inject = [
    // 'PagarmeService',
    'DialogFactory',
    '$scope',
    'ViewModelUtilsService',
    'FoneclubeService',
    // 'MainUtils',
    // 'DataFactory',
    'FlowManagerService',
    'localStorageService',
    // '$templateCache',
    'NgTableParams',
    // '$state',
    // '$rootScope',
    // '$stateParams',
    'UtilsService',
    // 'ngTableDefaults'
    '$filter'
  ];
  function CustomersController(
    // PagarmeService,
    DialogFactory,
    $scope,
    ViewModelUtilsService,
    FoneclubeService,
    // MainUtils,
    // DataFactory,
    FlowManagerService,
    localStorageService,
    // $templateCache,
    NgTableParams,
    // $state,
    // $rootScope,
    // $stateParams,
    UtilsService,
    // ngTableDefaults
    $filter
  ) {

    var vm = this;
    var checkvalidate = localStorageService.get('userid');

    var customerPerPage = 50;

    vm.filters = {
      active: false,
      inactive: false,
      regerror: false,
      all: true,
      excludeFather: false,
      excludeAddress: false,
      search: ''
    };

    vm.totalDisplayedCustomers = 1;

    vm.data = {};
    vm.onTapSwitchActivate = onTapSwitchActivate;
    vm.onTapCustomer = onTapCustomer;
    vm.onTapCustomerEdit = onTapCustomerEdit;
    vm.onTapRepeatLastCharge = onTapRepeatLastCharge;
    vm.onTapBoleto = onTapBoleto;
    vm.onTapBoletoPayment = onTapBoletoPayment;
    vm.onTapDebito = onTapDebito;
    vm.onTapNewCardPayment = onTapNewCardPayment;
    vm.onTapExcluir = onTapExcluir;
    vm.onDeleteCustomer = onDeleteCustomer;
    vm.onTapComment = onTapComment;
    vm.onTapMessage = onTapMessage;
    vm.onTapFlag = onTapFlag;

    initialize();

    function initialize() {
      if (checkvalidate == null) {
        FlowManagerService.changeLoginView();
      }


      FoneclubeService.getAllCustomers(true).then(function (result) {


        FoneclubeService.getCustomerDaysWithoutCharge().then(function (resultDaysWithoutCharge) {

          
          console.log('Wooooooorks')
          console.log(resultDaysWithoutCharge)
          var teste= resultDaysWithoutCharge;
          
          vm.data.customers = result.map(function (user) {

            user.Teste = 'working'
            for(var i in resultDaysWithoutCharge){
              if(user.Id == resultDaysWithoutCharge[i].Id){
                try{
                  user.DiasSemCobrar = resultDaysWithoutCharge[i].Charging.DiasSemCobrar
                }
                catch(e){}
                
              }
            }
            

            // user.Phones = user.Phones.map(function (phone) {
            //   if (phone) {
            //     phone.phoneFull = phone.DDD.concat(phone.Number);
            //   }
            //   return phone;
            // });
            return user;
          });
          var customersSemSoftDelete = [];
          for (var i in vm.data.customers) {
            var customer = vm.data.customers[i];
            if (!customer.SoftDelete) {
              customer.PhoneDDDParent = null;
              customer.PhoneNumberParent = null;
              for (var i in customer.Phones) {
                if (customer.Phones[i]) {
                  if (!customer.Phones[i].IsFoneclube) {
                    customer.Phones.splice(i, 1);
                  }
                }
              }
  
              customersSemSoftDelete.push(customer);
            }
          }
  
          vm.tableParams = createUsingFullOptions(customersSemSoftDelete);
          vm.tableParams.reload();
          
  
        })

        

        
      });



    }

    /* Deprecated since 09-02-2019 | Ariê Furtado 
    $scope.$watch('vm.searchUser', function() {
      try {
        var search = vm.searchUser.replace(/[!#$%&'()*+,-./:;?@[\\\]_`{|}~]/g, '');
        var isnum = /^\d+$/.test(search.replace(' ', ''));

        if (isnum) vm.searchIgnoreAccent = search.replace(' ', '');
        else vm.searchIgnoreAccent = search;

        // debugger;
        vm.tableParams.filter({ $: vm.searchIgnoreAccent });
        vm.tableParams.reload();
      } catch (e) {}
    }); */

    function onDeleteCustomer(customer) {
      var r = confirm('Deseja fazer um soft delete nesse cliente?');
      if (r == true) {
        FoneclubeService.postSoftDeleteCustomer(customer).then(function (result) {
          if (result) {
            alert('Cliente deletado');
            customer.SoftDelete = true;
          }
        });
        /* .catch(function(error) {
            console.log(error);
          }); */
      } else {
        txt = 'You pressed Cancel!';
      }
    }

    function createUsingFullOptions(customers) {
      return new NgTableParams(
        {
          count: customerPerPage, // initial page size
          filter: vm.filters
        },
        {
          // determines the pager buttons (left set of buttons in demo)
          paginationMaxBlocks: 10,
          paginationMinBlocks: 1,
          dataset: customers,
          getData: function (params) {
            var search = vm.filters.search;
            var filtered = getFilteredCustomers(customers, params);

            if (search && search !== '') {
              search = normalizeText(search);// search.replace(/[!#$%&'()*+,-./:;?@[\\\]_`{|}~]/g, '');

              //var isnum = /^\d+$/.test(value.replace(' ', ''));

              // filtered = $filter('filter')(filtered, {
              //   Name: isnum ? value.replace(' ', '') : value
              // });
              search = search.toLowerCase();
              filtered = $filter('filter')(filtered, function (data) {
                if (search) {
                  return data.Name.toLowerCase().indexOf(search) > -1 ||
                    data.Email.toLowerCase().indexOf(search) > -1 ||
                    (data.DocumentNumber ? data.DocumentNumber.toLowerCase().indexOf(search) > -1 : false) ||
                    (data.NickName ? data.NickName.toLowerCase().indexOf(search) > -1 : false) ||
                    (data.Born ? data.Born.toLowerCase().indexOf(search) > -1 : false) ||
                    (data.IdPagarme ? data.IdPagarme.toString().indexOf(search) > -1 : false) ||
                    matchPhone(data.Phones, search) ||
                    (!vm.filters.excludeAddress ? matchAddress(data.Addresses, search) : false) ||
                    (!vm.filters.excludeFather ? (data.NameParent ? data.NameParent.toLowerCase().indexOf(search) > -1 : false) : false);
                } else {
                  return true;
                }
              });
            }

            params.settings({
              counts: filtered.length > customerPerPage ? [50, 100, 500] : [],
              total: filtered.length
            });

            filtered = filtered.slice(
              (params.page() - 1) * params.count(),
              params.page() * params.count()
            );

            vm.totalDisplayedCustomers = filtered.length;

            return filtered;
          }
        }
      );
    }

    function matchPhone(phones, numberToCompare) {
      numberToCompare = numberToCompare.replace(/[!#$%&'()*+,-./:;?@[\\\]_`{|}~' 'éá]/g, '');
      if (phones && phones.length > 0) {
        if (phones[0] == null) {
          return false;
        } else {
          var phone = $filter('filter')(phones, function (data) {
            return (data.Number ? ("55" + data.DDD + data.Number.toString()).indexOf(numberToCompare) > -1 : false);
          });

          return phone.length > 0;
        }
      }

      return false;
    }
    function matchAddress(addresses, address) {
      if (addresses && addresses.length > 0) {
        if (addresses[0] == null) {
          return false;
        } else {
          var address = $filter('filter')(addresses, function (data) {
            data.Street = normalizeText(data.Street);
            return (data.Street ? data.Street.toLowerCase().indexOf(address) > -1 : false);
          });

          return address.length > 0;
        }
      }

      return false;
    }
    function normalizeText(text) {
      var weird = 'öüóőúéáàűíÖÜÓŐÚÉÁÀŰÍçÇ';
      var normalized = 'ouooueaauiOUOOUEAAUIcC';
      var idoff = -1, new_text = '';
      var lentext = text.toString().length - 1

      for (i = 0; i <= lentext; i++) {
        if (text[i].trim() == "+") {
          new_text += text[i];
        }
        else {
          idoff = weird.search(text.charAt(i));
          if (idoff == -1 || text.charAt(i) == ".") {
            new_text = new_text + text.charAt(i);
          } else {
            new_text = new_text + normalized.charAt(idoff);
          }
        }
      }

      return new_text;
    }

    function getFilteredCustomers(customers) {
      if (vm.filters.active) {
        customers = $filter('customerBy')(customers, 'active');
      }

      if (vm.filters.inactive) {
        customers = $filter('customerBy')(customers, 'inactive');
      }

      if (vm.filters.regerror) {
        customers = $filter('customerBy')(customers, 'regerror');
      }

      return customers;
    }

    //////////////////////////////////////////////////
    // Eventos de tap
    function onTapSwitchActivate(c) {
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
            }
          });
        }
      });
    }

    function onTapCustomerEdit(customer, index) {
      customer.view = 1;
      FlowManagerService.changeEdicaoView(customer);
    }

    function onTapCustomer(customer, index) {
      ViewModelUtilsService.showModalCustomer(customer, index);
    }

    function onTapComment(customer) {
      ViewModelUtilsService.showModalComment(customer);
    }

    /* Not used! | Ariê Furtado
    function clearDocumentField(documentNumber) {
      vm.documentClear = UtilsService.clearDocumentNumber(documentNumber);
    } */

    function onTapNewCardPayment(customer) {
      ViewModelUtilsService.showModalNewCardPayment(customer);
    }

    function onTapBoletoPayment(customer) {
      ViewModelUtilsService.showModalBoletoPayment(customer);
    }

    function onTapBoleto(customer) {
      ViewModelUtilsService.showModalBoleto(customer);
    }

    function onTapDebito(customer) {
      ViewModelUtilsService.showModalDebito(customer);
    }

    function onTapRepeatLastCharge(customer) {
      FoneclubeService.getLastPaymentType(customer).then(function (result) {
        if (result['intIdPaymentType'] == 1) {
          ViewModelUtilsService.showModalRepeatCard(result, customer);
        }
      }); /* 
        .catch(function(error) {
          console.log('catch error');
          console.log(error);
        }); */
    }

    function onTapExcluir(customer) {
      var personCheckout = {
        DocumentNumber: customer.DocumentNumber
      };
      DialogFactory.dialogConfirm({
        mensagem:
          'Atenção essa ação irá excluir o cliente da base foneclube, após exclusão não terá volta, deseja proseguir?'
      }).then(function (value) {
        if (value) {
          FoneclubeService.postDeletePerson(personCheckout).then(function (result) {
            if (result) {
              DialogFactory.showMessageDialog({
                message:
                  'Usuário foi removido com sucesso, no próximo carregamento da lista ele não será mais exibido'
              });
              closeThisDialog(0);
            } else DialogFactory.showMessageDialog({ message: 'Usuário não foi removido, guarde o documento dele: ' + customer.DocumentNumber });
          }); /* 
            .catch(function(error) {
              console.log('catch error');
              console.log(error);
            }); */
        }
      });
    }

    //open whatsapp messages box
    function onTapMessage(customer) {
      ViewModelUtilsService.showModalWhatsapp(customer);
    }

    function onTapFlag(customer) {
      ViewModelUtilsService.showModalFlag(customer);
    }

  }
})();
