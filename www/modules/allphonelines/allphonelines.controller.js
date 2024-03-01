(function () {
    'use strict';

    angular
        .module('foneClub')
        .controller('AllPhoneLinesController', AllPhoneLinesController)
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


    AllPhoneLinesController.inject = ['$scope', 'DataFactory', 'ViewModelUtilsService', 'FoneclubeService', 'MainUtils', '$stateParams', 'FlowManagerService', '$timeout', 'HubDevService', '$q', '$ionicScrollDelegate', 'UtilsService', 'DialogFactory', 'ngDialog', '$http', '$sce', '$rootScope'];
    function AllPhoneLinesController($scope, DataFactory, ViewModelUtilsService, FoneclubeService, MainUtils, $stateParams, FlowManagerService, $timeout, HubDevService, $q, $ionicScrollDelegate, UtilsService, DialogFactory, ngDialog, $http, $sce, $rootScope) {
        var vm = this;
        vm.data = DataFactory;
        vm.showLoader = true;

        vm.search = "";
        vm.showall = false;
        vm.linhaAtiva = false;
        vm.claro = true;
        vm.vivo = true;
        vm.history = [];
        vm.sp = 1;
        vm.Phones = [];
        vm.tempPhones = [];
        vm.parentlist = [];
        vm.totalDisplayed = 50;
        vm.showAllText = "Show More 50";

        vm.ignoreAccents = function (item) {
            if (vm.showall) {
                return true;
            } else {
                var text = removeAccents(item.NovoFormatoNumero.toLowerCase());
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

                return flag1 && flag2 && flag3 && flag4;

            }
        };

        function getNumberString(param) {
            return param.DDD.concat(param.Number);
        }

        var getCustomers = $scope.$watch(function () {

            $scope.clientList = vm.data.customers;
            return $scope.clientList;
        }, function (data) {
            if (data && data.length > 0) {
                vm.showLoader = false;
                getCustomers();
                init();
                if (vm.data.customersCache) {
                    vm.data.customers = angular.copy(vm.data.customersCache);
                }
            }
        })


        function init() {
            FoneclubeService.getPlans().then(function (result) {
                vm.plans = result;
                var size = vm.data.customers.length;
                for (var i = 0; i < size; i++) {
                    var customer = vm.data.customers[i];
                    var psize = customer.Phones.length;
                    for (var j = 0; j < psize; j++) {
                        var tmpPhone = customer.Phones[j];
                        if(tmpPhone.IdPlanOption==''){
                        tmpPhone.price = 0;
                        } else {
                            tmpPhone.price = vm.plans.find(x => x.Id == tmpPhone.IdPlanOption).Value / 100                            
                        }
                        vm.Phones.push(tmpPhone);
                        vm.parentlist.push({'parent':i,'child':j});
                        customer.Phones[j].key = Math.random();

                        customer.Phones[j].StatusOperator = { 'background-color': 'grey' }
                        customer.Phones[j].StatusDescription = 'C'

                        if (customer.Phones[j].Portability) {
                            customer.Phones[j].Portability = 'true';
                        } else {
                            customer.Phones[j].Portability = 'false';
                        }
                        customer.Phones[j].NovoFormatoNumero = getNumberString(customer.Phones[j]); //popula o novo campo vm.<telefone>
                        for (var plan in vm.plans) {
                            if (vm.plans[plan].Id == customer.Phones[j].IdPlanOption) {
                                if (vm.plans[plan].Description.endsWith('VIVO')) {
                                    customer.Phones[j].operadora = '1'; //seta a operadora local
                                    // customer.Phones[j].StatusOperator = { 'background-color': 'green' }
                                    // customer.Phones[j].StatusDescription = 'A'
                                } else {
                                    customer.Phones[j].operadora = '2'; //seta a operadora local

                                    console.log('tentando coletar')
                                    /*
                                    FoneclubeService.getStatusBlockedClaro(customer.Phones[j].DDD, customer.Phones[j].Number).then(function (result) {
                                        console.log('retorno ' + result)
                                        if (!result) {
                                            customer.Phones[j].StatusOperator = { 'background-color': 'green' }
                                            customer.Phones[j].StatusDescription = 'A'
                                        }
                                        else {
                                            customer.Phones[j].StatusOperator = { 'background-color': 'red' }
                                            customer.Phones[j].StatusDescription = 'B'
                                        }

                                    });
                                    */
                                }
                            }
                        }

                    }
                }

                vm.pricelist = [];
                for (var i = 0; i < vm.Phones.length; i++) {
                    var phoneNumber = vm.Phones[i];
                    if (phoneNumber.IdPlanOption == '') {
                        vm.pricelist.push(0);
                    } else {
                        vm.pricelist.push(vm.plans.find(x => x.Id == phoneNumber.IdPlanOption).Value / 100);
                    }
                }
                vm.tempPhones = angular.copy(vm.Phones);
                vm.sp = 1;
                addHistory();
                vm.showLoader = false;
            })

                //post realizado com sucesso

                .catch(function (error) {
                    console.log('catch error');
                    console.log(error);
                    console.log(error.statusText); // mensagem de erro para tela, caso precise
                });

        }

        vm.onchecked = onchecked;
        function onchecked(position) {
            vm.Phones[position] = angular.copy(vm.tempPhones[position]);
            vm.data.customers[vm.parentlist[position].parent].Phones[vm.parentlist[position].child] =angular.copy( vm.Phones[position]);
            vm.showLoader = true;
            onTapSendUser(vm.data.customers[vm.parentlist[position].parent]);
        }

        vm.onunchecked = onunchecked;
        function onunchecked(position) {
            vm.tempPhones[position] = angular.copy(vm.Phones[position]);
            var id = vm.tempPhones[position].IdPlanOption;
            if (id == '' || id == null)
                vm.pricelist[position] = 0;
            else
                vm.pricelist[position] = vm.plans.find(x => x.Id == id).Value / 100;

        }

        vm.onallchecked = onallchecked;
        function onallchecked() {
            vm.Phones = angular.copy(vm.tempPhones);
            for(var position=0;position<vm.Phones.length;position++){
                vm.data.customers[vm.parentlist[position].parent].Phones[vm.parentlist[position].child] =angular.copy( vm.Phones[position]);
            }
            vm.count = 0;
            vm.showLoader = true;
            onTapAllusers(vm.data.customers);
        }

        vm.onallunchecked = onallunchecked;
        function onallunchecked() {
            vm.tempPhones = angular.copy(vm.Phones);
            for (var position = 0; position < vm.tempPhones.length; position++) {
                var id = vm.tempPhones[position].IdPlanOption;
                if (id == '' || id == null)
                    vm.pricelist[position] = 0;
                else
                    vm.pricelist[position] = vm.plans.find(x => x.Id == id).Value / 100;
            }
        }

        vm.onedit = onedit;
        function onedit(position) {
            ViewModelUtilsService.showModalCustomer(vm.data.customers[vm.parentlist[position].parent], -1);
        }


        vm.changedFilterAll = changedFilterAll;
        function changedFilterAll() {
            // debugger
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
      /*          if (id == '' || id == null)
                    vm.pricelist[position] = 0;
                else
                    vm.pricelist[position] = vm.plans.find(x => x.Id == id).Value / 100;
                    */
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
                /*
                if (id == '' || id == null)
                    vm.pricelist[position] = 0;
                else
                    vm.pricelist[position] = vm.plans.find(x => x.Id == id).Value / 100;
                    */
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
        function telephonechanged($index) {
            //addHistory();
        }

        vm.activechanged = activechanged;
        function activechanged($index) {
            addHistory();
        }


        vm.changedPlano = changedPlano;
        function changedPlano(position, id) {
            if (id == '' || id == null){
                vm.pricelist[position] = 0;
                vm.tempPhones[position].price = 0;
            } else {
                vm.pricelist[position] = vm.plans.find(x => x.Id == id).Value / 100;
                vm.tempPhones[position].price = vm.plans.find(x => x.Id == id).Value / 100;
            }
            addHistory();
            autmaticSum();
        }

        vm.pricechanged = pricechanged;
        function pricechanged($index) {
            autmaticSum();
        }

        vm.nicknamechanged = nicknamechanged;
        function nicknamechanged($index) {
            addHistory();
        }

        vm.changedAutoSum = changedAutoSum;
        function changedAutoSum() {
            if (vm.autoSum) {
                //       autmaticSum();
            }
        }

        function autmaticSum() {
            if (vm.autoSum) {
                vm.singlePriceLocal = 0;
                for (var i = 0; i < vm.pricelist.length; i++) {
                    vm.singlePriceLocal += vm.pricelist[i] * 100;
                }
                vm.singlePriceLocal = vm.singlePriceLocal / 100;
            }
        }

        vm.onShowMore = onShowMore;
        function onShowMore() {
            if(vm.totalDisplayed<vm.tempPhones.length){
                vm.totalDisplayed+=50;
            }
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

        vm.PhonesAsc = PhonesAsc;
        function PhonesAsc(type) {
            if (type == 'NovoFormatoNumero') {
                $scope.sortType = 'NovoFormatoNumero';
                $scope.sortReverse = false;
            } else if (type == 'IdPlanOption') {
                $scope.sortType = 'IdPlanOption';
                $scope.sortReverse = false;
                vm.tempPhones = vm.Phones.filter(x => x.IdPlanOption != '');
            } else if (type == 'NickName') {
                $scope.sortType = 'NickName';
                $scope.sortReverse = false;
                vm.tempPhones = vm.Phones.filter(x => x.NickName != undefined);
            } else if (type == 'price'){
                $scope.sortType = 'price';
                $scope.sortReverse = false;
                vm.tempPhones = vm.Phones.filter(x => x.price != '');
            }
        }

        vm.PhonesDesc = PhonesDesc;
        function PhonesDesc(type) {
            if (type == 'NovoFormatoNumero') {
                $scope.sortType = '-NovoFormatoNumero';
                $scope.sortReverse = false;
            } else if (type == 'IdPlanOption') {
                $scope.sortType = '-IdPlanOption';
                $scope.sortReverse = false;
                vm.tempPhones = vm.Phones.filter(x => x.IdPlanOption != '');
            } else if (type == 'NickName') {
                $scope.sortType = '-NickName';
                $scope.sortReverse = false;
                vm.tempPhones = vm.Phones.filter(x => x.NickName != undefined);
            } else if (type == 'price'){
                $scope.sortType = '-price';
                $scope.sortReverse = false;
                vm.tempPhones = vm.Phones.filter(x => x.price != '');
            }
        }

        vm.onTapSendUser = onTapSendUser;
        function onTapSendUser(customer) {

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

            FoneclubeService.postUpdateCustomer(customerSend).then(function(result){
                vm.showLoader = false;
            })
        };

        vm.onTapAllusers = onTapAllusers;
        function onTapAllusers(customers){
            for(var i =0;i<customers.length;i++){
                var customer = customers[i];
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
    
                FoneclubeService.postUpdateCustomer(customerSend).then(function(result){
                    vm.count++;
                    if(vm.count==vm.data.customers.length){
                        vm.showLoader = false;                        
                    }
                })
            }
        }
    }
})();
