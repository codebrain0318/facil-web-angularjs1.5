(function() {
  'use strict';

  angular.module('foneClub').service('ViewModelUtilsService', ViewModelUtilsService);

  ViewModelUtilsService.inject = ['$ionicModal', 'DialogFactory'];
  function ViewModelUtilsService($ionicModal, DialogFactory) {
    //todo colocar cria~ção na hora do show garantindo sempre limpeza ao abrir
    this.modalCustomerData = {};
    this.showModalCustomer = showModalCustomer;
    this.showModalComment = showModalComment;
    this.showModalFlag = showModalFlag;

    this.modalNewCardPaymentData = {};
    this.showModalNewCardPayment = showModalNewCardPayment;
    this.showInternationDeposits = showInternationDeposits;

    this.modalExistentCardPaymentData = {};
    this.modalExistentCardData = {};
    this.showModalExistentCardPayment = showModalExistentCardPayment;
    this.showModalPaymentHistoryDetail = showModalPaymentHistoryDetail;

    this.modalData = {};
    this.modalReportData = {};
    this.showModal = showModal;

    this.modalBoletoData = {};
    this.modalRepeatBoletoData = {};

    this.modalCardData = {};
    this.modalRepeatCardData = {};
    this.showModalBoleto = showModalBoleto;
    this.showModalBoletoPayment = showModalBoletoPayment;
    this.showModalPIX = showModalPIX;
    this.showModalReport = showModalReport;
    this.showModalDebito = showModalDebito;

    this.showModalRepeatBoleto = showModalRepeatBoleto;
    this.showModalRepeatCard = showModalRepeatCard;
    this.showModalPhoneTopUpTemplate = showModalPhoneTopUpTemplate;
    this.showModalPhoneTopUpHistoryTemplate = showModalPhoneTopUpHistoryTemplate;
    this.showModalEmailDetail = showModalEmailDetail;
    this.showModalWhatsapp = showModalWhatsapp;
    this.showModalWhatsappTemplate = showModalWhatsappTemplate;
    this.showModalWATemplateEdit = showModalWATemplateEdit;
    this.showDrCelularImportTemplate = showDrCelularImportTemplate;
    this.showContelTopupHistorTemplate = showContelTopupHistorTemplate;
    this.showModalTemplate = showModalTemplate;
    this.showPlanSelectionModal = showPlanSelectionModal;
    this.changeAllPhoneLinesNewView = changeAllPhoneLinesNewView;
    this.showScheudleEditModal = showScheudleEditModal;
    this.showModalAddNewPhoneLinePopup = showModalAddNewPhoneLinePopup;
    this.showInstaChargeConfirPopup = showInstaChargeConfirPopup;
    this.showInstaAddNewLinePopup = showInstaAddNewLinePopup;
    this.showIntlAddUserModalTemplate = showIntlAddUserModalTemplate;
    this.showFacilDeposits = showFacilDeposits;

    function showModal(data) {
      this.modalData = data;
      var service = this;

      DialogFactory.showTemplate('modules/lista-customer/checkout-customer-modal.html');
    }

    function showModalCustomer(data, index) {
      this.modalCustomerData = data;
      this.modalCustomerData.index = index;
      var service = this;

      DialogFactory.showTemplate('modules/customers/customers-modal/customer-modal.html');
    }

    function showModalNewCardPayment(data) {
      this.modalNewCardPaymentData = data;
      var service = this;

      DialogFactory.showTemplate('modules/customers/new-card/new-card-payment.html');
    }

    function showInternationDeposits(data) {
      this.customerData = data;
      DialogFactory.showTemplateMedium('modules/customers/intl-deposits/intl-depositModal.html');
    }

    function showModalComment(data) {
      this.modalCommentData = data;
      var service = this;
      DialogFactory.showTemplate('modules/customers/comment/comment.html');
    }

    function showModalFlag(data){
      this.modalFlagData = data;
      var service = this;
      DialogFactory.showTemplate('modules/customers/flags-modal/flags.html');
    }

    function showModalExistentCardPayment(data, card) {
      this.modalExistentCardPaymentData = data;
      this.modalExistentCardData = card;
      var service = this;

      DialogFactory.showTemplate('modules/customers/existent-card/existent-card.html');
    }

    function showModalBoleto(data) {
      this.modalBoletoData = data;
      var service = this;

      DialogFactory.showTemplate('modules/customers/boleto/boleto.html');
    }

    function showModalPIX(data) {
      this.modalBoletoData = data;
      var service = this;

      DialogFactory.showTemplate('modules/customers/pix/pix.html');
    }

    function showModalReport(data) {
      this.modalData = data;

      DialogFactory.showTemplateSmall('modules/customers/report-modal/report-modal.html');
    }

    function showModalDebito(data) {
      this.modalBoletoData = data;
      var service = this;

      DialogFactory.showTemplate('modules/customers/debito/debito.html');
    }

    function showModalBoletoPayment(data) {
      this.modalBoletoData = data;
      var service = this;
      DialogFactory.showTemplate('modules/customers/boleto/boletopayment.html');
    }
    function showModalRepeatBoleto(payment, data) {
      // debugger;
      this.modalBoletoData = data;
      this.modalRepeatBoletoData = payment;
      var service = this;
      DialogFactory.showTemplate('modules/customers/repeat-boleto/repeat-boleto.html');
    }
    function showModalRepeatCard(payment, data) {
      // debugger;
      this.modalCardData = data;
      this.modalRepeatCardData = payment;
      var service = this;
      DialogFactory.showTemplate('modules/customers/repeat-card/repeat-card.html');
    }

    function showModalPaymentHistoryDetail(history, customer) {
      this.modalPaymentDetailHistory = history;
      this.modalPaymentDetailCustomer = customer;
      var service = this;
      DialogFactory.showTemplate('modules/customers/payment-detail/paymentdetail.html');
    }

    function showModalEmailDetail(emailstatus, phone, email, operator, customer) {
      this.modalEmailDetailemailstatus = emailstatus;
      this.modalEmailDetailphone = phone;
      this.modalEmailDetailemail = email;
      this.modalEmailDetailoperator = operator;
      this.modalEmailCustomer = customer;
      var service = this;
      DialogFactory.showTemplate('modules/customers/edicao/EmailTemplate.html');
    }

    function showModalWhatsapp(data) {
      this.modalData = data;
      var service = this;

      DialogFactory.showTemplate('modules/whatsapp/whatsapp.html');
    }

    function showModalWhatsappTemplate(data) {
      this.modalData = data;

      DialogFactory.showTemplate('modules/wa-template-edit/wa-template-editModal.html');
    }

    function showModalPhoneTopUpTemplate(data) {
      this.modalData = data;

      DialogFactory.showTemplate('modules/all-phoneslines-new/phone-topup.html');
    }

    function showModalAddNewPhoneLinePopup() {
      DialogFactory.showTemplate('modules/all-phoneslines-new/add-new-phone.html');
    }

    function showModalPhoneTopUpHistoryTemplate(data) {
      this.modalData = data;

      DialogFactory.showTemplate('modules/all-phoneslines-new/phone-topup-history.html');
    }

    function showInstaChargeConfirPopup(data) {
      this.modalData = data;

      DialogFactory.showTemplateMedium('modules/customers/insta-charge/insta-charge-confirmation.html');
    }

    function showInstaAddNewLinePopup(data) {
      this.modalData = data;

      DialogFactory.showTemplateMedium('modules/customers/insta-charge/addnewline.html');
    }

    function showModalTemplate(data) {
      this.modalData = data;

      DialogFactory.showTemplate('modules/template-edit/template-editModal.html');
    }

    function showDrCelularImportTemplate() {
      DialogFactory.showTemplateSmall('modules/dr-celular/dr-celular-modal.html');
    }

    function showContelTopupHistorTemplate() {
      DialogFactory.showTemplateSmall('modules/contel/import-contel-history-modal.html');
    }

    function showPlanSelectionModal(data){
      this.modalData = data;

      DialogFactory.showTemplate('modules/customers/insta-charge/select-planoModal.html');
    }

    function showScheudleEditModal(data){
      this.modalData = data;

      DialogFactory.showTemplateMedium('modules/customers/customers-modal/customer-schedule-editModal.html');
    }

    function showModalWATemplateEdit(data) {
      this.modalReportData = data;

      DialogFactory.showTemplate('modules/customers/report-modal/selectreport-modal.html');
    }

    function changeAllPhoneLinesNewView(data){
      this.modalReportData = data;

      DialogFactory.showTemplate('modules/all-phoneslines-new/all-phoneslines-new.html');
    }

     function showIntlAddUserModalTemplate(data) {
      this.modalData = data;

      DialogFactory.showTemplateMedium('modules/facil/faciladdnew.html');
    }

     function showFacilDeposits(data) {
      this.modalData = data;

      DialogFactory.showTemplateMedium('modules/facil/facildeposithistory.html');
    }


    this.showConfirmDialog = function(title, content) {
      return DialogFactory.dialogConfirm({
        titulo: title,
        mensagem: content
      });
    };
  }
})();
