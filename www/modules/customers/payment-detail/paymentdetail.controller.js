(function() {
'use strict';

    angular
        .module('foneClub')
        .controller('PaymentDetailController', PaymentDetailController);

    PaymentDetailController.inject = ['ViewModelUtilsService', 'MainUtils'];
    function PaymentDetailController(ViewModelUtilsService, MainUtils) {
        var vm = this;
        vm.customer = ViewModelUtilsService.modalPaymentDetailCustomer;
        vm.history = ViewModelUtilsService.modalPaymentDetailHistory;

    }
})();