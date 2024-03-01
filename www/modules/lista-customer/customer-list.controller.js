(function() {
'use strict';

    angular
        .module('foneClub')
        .controller('CustomerListController', CustomerListController);

    CustomerListController.inject = ['PagarmeService', '$ionicPopup', '$ionicModal', '$scope', 'ViewModelUtilsService'];
    function CustomerListController(PagarmeService, $ionicPopup, $ionicModal, $scope, ViewModelUtilsService) {
        var vm = this;
        vm.onTapCustomer = onTapCustomer;
        vm.showLoader = true;
        
        console.log('=== CustomerListController Controller ===');    

        PagarmeService.getCustomers()
        .then(function(result){
            console.log(result);
            vm.showLoader = false;
            vm.customers = result;            
        })
        .catch(function(error){
            console.log(error);
        });

        function onTapCustomer(customer){
            console.log('onTapCustomer')
            console.log(customer);
             ViewModelUtilsService.showModal(customer);
        }



        /**$ionicModal.fromTemplateUrl('templates/modal.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  }); */

/*
        $ionicModal.fromTemplateUrl('modules/lista-customer/modal.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.modal = modal;
        });*/







        /*

        //get cards ok
        PagarmeService.getCards()
        .then(function(result){
            console.log(result);
        })
        .catch(function(error){
            console.log(error);
        });

        //get customers ok
        PagarmeService.getCustomers()
        .then(function(result){
            console.log(result);
        })
        .catch(function(error){
            console.log(error);
        });

        //get card ok 145059
        PagarmeService.getCard(145059)
        .then(function(result){
            console.log(result);
        })
        .catch(function(error){
            console.log(error);
        });

        //post boleto
        PagarmeService.postBoleto(6000)
        .then(function(result){
            console.log(result);
        })
        .catch(function(error){
            console.log(error);
        });

        */




        /*
        var cardData = {
            cardHolderName:'Desenv C Teste',
            cardExpirationMonth:11,
            cardExpirationYear:17,
            cardNumber:'4716329201322757',
            cardCVV:'162'
        }

        PagarmeService.generateCardHash(cardData).then(function(cardHash){
            console.log(cardHash);
            /*
            PagarmeService.postTransactionCard(7000, cardHash)
            .then(function(result){
                console.log(result);
            })
            .catch(function(error){
                console.log(error);
        });


        })
        .catch(function(error){
            //mensagem erro ao inserir dados
            console.log(error);
        });
        */





/*
        PagarmeService.postTransactionCard(7000, cardHash)
        .then(function(result){
            console.log(result);
        })
        .catch(function(error){
            console.log(error);
        });
        */
    }
})();