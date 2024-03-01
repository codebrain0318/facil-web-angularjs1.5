(function () {
  'use strict';


  angular.module('foneClub').service('FoneclubeService', FoneclubeService);

  FoneclubeService.inject = ['$q', 'HTTPService', '$http'];
  function FoneclubeService($q, HTTPService, $http) {


    //API live
    
    var urlApi = 'https://api.foneclube.com.br/api';

    //API homol
    // var urlApi = 'https://hapi.foneclube.com.br/api'


    //API homol debug
    //var urlApi = 'http://localhost:57078/api';

    this.postBasePerson = postBasePerson;
    this.postUpdatePerson = postUpdatePerson;
    this.postUpdatePersonAdress = postUpdatePersonAdress;
    this.postCheckout = postCheckout;
    this.postHistoryPayment = postHistoryPayment;
    this.postSchedulePayment = postSchedulePayment;
    this.postDebitoTransaction = postDebitoTransaction;
    this.postDeletePerson = postDeletePerson;
    this.postUpdateCustomer = postUpdateCustomer;
    this.postOrderServicePerson = postOrderServicePerson;
    this.postChargingClient = postChargingClient;
    this.postChargingClientCommitCard = postChargingClientCommitCard;
    this.postCustomerParent = postCustomerParent;
    this.postUpdatePagarmeID = postUpdatePagarmeID;
    this.postSendEmail = postSendEmail;
    this.postGeraBoleto = postGeraBoleto;
    this.postCustomerComment = postCustomerComment;
    this.saveTemplate = saveTemplate;
    this.deleteTemplate = deleteTemplate;
    this.sendTemplate = sendTemplate;
    this.postSoftDeletePhone = postSoftDeletePhone;
    this.postSoftDeleteCustomer = postSoftDeleteCustomer;
    this.postUnDeleteCustomer = postUnDeleteCustomer;
    this.postChargingLog = postChargingLog;
    this.postPersonAtivity = postPersonAtivity;
    this.postPersonNextAction = postPersonNextAction;
    this.postAllPhoneLinesAction = postAllPhoneLinesAction;
    this.postChargingUpdate = postChargingUpdate;
    this.postDesassociarLinha = postDesassociarLinha;
    this.postUpdatePhonePlan = postUpdatePhonePlan;
    this.postGeraCobrancaIntegrada = postGeraCobrancaIntegrada;
    this.postCustomerUpdateParent = postCustomerUpdateParent;
    this.postIsertServiceDeactive = postIsertServiceDeactive;
    this.postIsertServiceActive = postIsertServiceActive;
    this.postUpdateServiceFoneclube = postUpdateServiceFoneclube;
    this.postPersonFlag = postPersonFlag;
    this.postUpdateFlag = postUpdateFlag;
    this.postPropriedadeIterna = postPropriedadeIterna;
    this.postUpdateScheduledCharges = postUpdateScheduledCharges;

    this.getPlans = getPlans;
    this.getPlansById = getPlansById;
    this.getCustomerPlans = getCustomerPlans;
    this.getOperators = getOperators;
    this.getCustomers = getCustomers;
    this.getAllCustomers = getAllCustomers;
    this.getCustomerByCPF = getCustomerByCPF;
    this.getCustomerPhonesByCPF = getCustomerPhonesByCPF;
    this.getCustomerWithPhoneStatus = getCustomerWithPhoneStatus;
    this.getHistoryPayment = getHistoryPayment;
    this.getCustomerByPhoneNumber = getCustomerByPhoneNumber;
    this.getCustomerById = getCustomerById;
    this.getChargingClients = getChargingClients;
    this.getTblServiceOrders = getTblServiceOrders;
    this.getCustomerParentByPhone = getCustomerParentByPhone;
    this.getAllParents = getAllParents;
    this.getAllCustomersNew = getAllCustomersNew;
    this.getLastPaymentType = getLastPaymentType;
    this.getStatusBlockedClaro = getStatusBlockedClaro;
    this.getStatusLinhaClaro = getStatusLinhaClaro;
    this.getChargeAndServiceOrderHistory = getChargeAndServiceOrderHistory;
    this.getChargeAndServiceOrderHistoryDinamic = getChargeAndServiceOrderHistoryDinamic;
    this.getStatusCharging = getStatusCharging;
    this.getStatusDocument = getStatusDocument;
    this.getStatusChargingOfCustomer = getStatusChargingOfCustomer;
    this.getPlanOptios = getPlanOptios;
    this.getAllPlanOptios = getAllPlanOptios;
    this.SendEmailStatus = SendEmailStatus;
    this.getEmailDetails = getEmailDetails;
    this.saveemail = saveemail;
    this.getDataPgt = getDataPgt;
    this.getCommision = getCommision;
    this.dispatchedCommision = dispatchedCommision;
    this.dispatchedBonus = dispatchedBonus;
    this.getUpdatePagarme = getUpdatePagarme;
    this.getTemplates = getTemplates;
    this.getStatusAPI = getStatusAPI;
    this.getChargingLog = getChargingLog;
    this.getChargingScheduleHistory = getChargingScheduleHistory;
    this.getLinhasEstoque = getLinhasEstoque;
    this.getStatusTelefonesOperadora = getStatusTelefonesOperadora;
    this.getLastPersonCharging = getLastPersonCharging;
    this.getAllCustomersMinimal = getAllCustomersMinimal;
    this.getReintegrateDatePagarme = getReintegrateDatePagarme;
    this.getScheduleDateExecuted = getScheduleDateExecuted;
    this.getAllPhonesStatus = getAllPhonesStatus;
    this.getMassChargingData = getMassChargingData;
    this.getStatusDivergencia = getStatusDivergencia;
    this.getActiveCustomers = getActiveCustomers;
    this.getPhoneServices = getPhoneServices;
    this.getServices = getServices;
    this.getAllServices = getAllServices;
    this.getBonusLog = getBonusLog;
    this.getBonusOrderHistory = getBonusOrderHistory;
    this.getComissionsOrderHistory = getComissionsOrderHistory;
    this.getTotaisComissoes = getTotaisComissoes;
    this.postSendChargeMessage = postSendChargeMessage;
    this.postSendWhatsappMessage = postSendWhatsappMessage;
    this.getClientMessages = getClientMessages;
    this.getAPIUrl = getAPIUrl;
    this.getFlagsTypes = getFlagsTypes;
    this.getPersonFlags = getPersonFlags;
    this.getPersonPhones = getPersonPhones;
    this.getStatusCardDebito = getStatusCardDebito;
    this.getMassChargingFull = getMassChargingFull;
    this.getCustomerDaysWithoutCharge = getCustomerDaysWithoutCharge;
    this.getDeleteAgendamentoCobranca = getDeleteAgendamentoCobranca;
    this.saveDefaultPaymentInfo = saveDefaultPaymentInfo;
    this.getChargingById = getChargingById;
    this.setChargingFlagByUser = setChargingFlagByUser;
    this.postSendWhatsAppMessageNew = postSendWhatsAppMessageNew;
    this.postSendWhatsappMessageWithButton = postSendWhatsappMessageWithButton;
    this.validatePhoneForWA = validatePhoneForWA;
    this.getWATemplates = getWATemplates;
    this.saveWATemplates = saveWATemplates;
    this.deleteWATemplates = deleteWATemplates;
    this.sendChargeSummary = sendChargeSummary;
    this.sendMarketingMsg = sendMarketingMsg;
    this.sendGenericMsg = sendGenericMsg;
    this.sendWelcomeMsgWhatsApp = sendWelcomeMsgWhatsApp;
    this.sendWhatsAppMessageCCRefused = sendWhatsAppMessageCCRefused;
    this.getLastTransactionIdByCustomer = getLastTransactionIdByCustomer;
    this.saveImportDrCelular = saveImportDrCelular;
    this.verifyImportDrCelular = verifyImportDrCelular;
    this.getClientDashboardData = getClientDashboardData;
    this.saveUserSettings = saveUserSettings;

    this.wppStart = wppStart;
    this.wppStop = wppStop;
    this.wppManageSession = wppManageSession;
    this.wppCreateTokenSession = wppCreateTokenSession;
    this.wppStatusSession = wppStatusSession;
    this.wppCheckConnectionStatus = wppCheckConnectionStatus;

    this.validateCEP = validateCEP;
    this.validateCPF = validateCPF;
    this.validateICCID = validateICCID;
    this.saveInstaRegisterAndCharge = saveInstaRegisterAndCharge;
    this.saveInstaRegisterClient = saveInstaRegisterClient;
    this.saveInstaPhoneClient = saveInstaPhoneClient;
    this.getPortabilidadeOperators = getPortabilidadeOperators;
    this.postInstaCustomerParent = postInstaCustomerParent;
    this.getAllPhoneLinesNew = getAllPhoneLinesNew;
    this.getAgGridStates = getAgGridStates;
    this.saveAgGridState = saveAgGridState;
    this.deleteAgGridState = deleteAgGridState;
    this.updateDefaultGridState = updateDefaultGridState;
    this.getContelDetailByPhone = getContelDetailByPhone;
    this.getContelPlans = getContelPlans;
    this.addTopupPlan = addTopupPlan;
    this.getContelDetailBySaldoPhone = getContelDetailBySaldoPhone;
    this.syncContelLinesForUser = syncContelLinesForUser;
    this.syncContelLines = syncContelLines;
    this.saveWATemplatesConfig = saveWATemplatesConfig;
    this.getWATemplatesConfig = getWATemplatesConfig;
    this.permanentBlockLine = permanentBlockLine;
    this.permanentUnBlockLine = permanentUnBlockLine;
    this.permanentBlockLineForCustomer = permanentBlockLineForCustomer;
    this.permanentUnBlockLineForCustomer = permanentUnBlockLineForCustomer;
    this.getTopupHistory = getTopupHistory;
    this.addContelLineManual = addContelLineManual;
    this.getLineDetails = getLineDetails
    this.updateInstaEditClient = updateInstaEditClient;
    this.updateInstaEditClientLine = updateInstaEditClientLine;
    this.softDeleteLine = softDeleteLine;
    this.saveInstaRegisterClientOrLine = saveInstaRegisterClientOrLine;
    this.saveInstaRegisterClientOrLineWithCharge = saveInstaRegisterClientOrLineWithCharge;
    this.getContelSaldo = getContelSaldo;
    this.saveImportTopupHistory = saveImportTopupHistory;

    this.SaveIntlDeposits = SaveIntlDeposits;
    this.getMMHistory = getMMHistory;

    this.updateRefundInfo = updateRefundInfo;
    this.getAllInternationUsers = getAllInternationUsers;
    this.getAllInternationUserData = getAllInternationUserData;
    this.postRegisterIntlCustomer = postRegisterIntlCustomer;
    this.resetESIM = resetESIM;

    function getAPIUrl() {
      return urlApi;
    }

    function getClientDashboardData(month, year, ativos) {
      var q = $q.defer();

      $q.all([getAllCustomers(false), getStatusCharging(month, year, ativos)]).then(function (values) {
        var results = [];
        results[0] = values[0];
        results[1] = values[1];
        q.resolve(results);
      }).catch(function (error) {
        q.reject(error);
      });

      return q.promise;;
    }

    function getLastPaymentType(customer) {
      var q = $q.defer();
      HTTPService.get(
        urlApi.concat('/profile/getpaymentmethod?personID='.concat(customer.Id))
      )
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getCustomerParentByPhone(phoneparent, personid) {
      var q = $q.defer();
      HTTPService.get(
        urlApi.concat(
          '/profile/customer/GetParentbyPhone?phoneparent=' +
          phoneparent +
          '&personid=' +
          personid
        )
      )
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getAllParents() {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/profile/customer/GetParentAll'))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getAllCustomersMinimal() {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/profile/all/customers/list'))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getAllCustomersNew() {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/profile/customers/all'))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getStatusChargingOfCustomer(id, month, year) {
      var q = $q.defer();
      HTTPService.get(
        urlApi.concat(
          '/charging/cobranca/status/vingencia/cliente/' +
          id +
          '/mes/' +
          month +
          '/ano/' +
          year
        )
      )
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getStatusCharging(month, year, ativos) {
      var q = $q.defer();

      HTTPService.get(
        urlApi.concat('/charging/cobranca/status/vingencia/mes/' + month + '/ano/' + year)
      )
        //HTTPService.get(urlApi.concat('/charging/cobranca/status/vingencia/mes/' + month + '/ano/' + year + '/ativos/' + ativos))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getUpdatePagarme() {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/pagarme/transacao/update'))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getReintegrateDatePagarme() {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/pagarme/transacao/reintegrate/date'))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    //api/charging/schedule/executed/date
    function getScheduleDateExecuted() {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/charging/schedule/executed/date'))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getBonusLog() {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/comission/bonus/lista/log'))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getBonusOrderHistory(total) {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/comission/bonus/order/history?total=' + total))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getComissionsOrderHistory(total) {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/comission/comission/order/history?total=' + total))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getTotaisComissoes(customerId) {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/comission/comission/totais/' + customerId))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function postCustomerComment(commentDetails) {
      var q = $q.defer();
      HTTPService.post(urlApi.concat('/profile/comment'), commentDetails)
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function postUpdatePerson(personCheckout) {
      var q = $q.defer();

      HTTPService.post(urlApi.concat('/profile/update'), personCheckout)
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function postDeletePerson(personCheckout) {
      var q = $q.defer();

      HTTPService.post(urlApi.concat('/profile/delete/customer'), personCheckout)
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }



    function postUpdatePersonAdress(personCheckout) {
      var q = $q.defer();

      HTTPService.post(urlApi.concat('/profile/updateAdress'), personCheckout)
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function postBasePerson(personCheckout) {
      var q = $q.defer();

      HTTPService.post(urlApi.concat('/profile/insert'), personCheckout)
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function postCheckout(personCheckout) {
      var q = $q.defer();

      HTTPService.post(urlApi.concat('/profile/cadastro'), personCheckout)
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function postHistoryPayment(personCharging) {
      var q = $q.defer();

      HTTPService.post(urlApi.concat('/profile/charging/insert'), personCharging)
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function postSchedulePayment(personCharging) {
      var q = $q.defer();

      HTTPService.post(urlApi.concat('/profile/charging/schedule/insert'), personCharging)
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function postUpdateCustomer(customer) {
      var q = $q.defer();

      HTTPService.post(urlApi.concat('/profile/customer/update'), customer)
        .then(function (data) {
          q.resolve(data);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function postOrderServicePerson(param) {
      var q = $q.defer();

      HTTPService.post(urlApi.concat('/profile/service/order'), param)
        .then(function (data) {
          q.resolve(data);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function postUpdatePagarmeID(customer) {
      // customer/pagarme/id/insert
      var q = $q.defer();

      HTTPService.post(urlApi.concat('/profile/customer/pagarme/id/insert'), customer)
        .then(function (data) {
          q.resolve(data);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function postChargingClient(year, month, param) {
      var q = $q.defer();
      HTTPService.post(
        urlApi
          .concat('/charging/')
          .concat(year)
          .concat('/')
          .concat(month)
          .concat('/clients/')
          .concat(param.ClientId)
          .concat('/charging'),
        param
      )
        .then(function (data) {
          q.resolve(data);
        })
        .catch(function (error) {
          q.reject(error);
        });
      return q.promise;
    }

    function postChargingClientCommitCard(year, month, chargingId, param) {
      var q = $q.defer();
      HTTPService.post(
        urlApi
          .concat('/charging/')
          .concat(year)
          .concat('/')
          .concat(month)
          .concat('/clients/')
          .concat(param.ClientId)
          .concat('/charging/')
          .concat(chargingId),
        param
      )
        .then(function (data) {
          q.resolve(data);
        })
        .catch(function (error) {
          q.reject(error);
        });
      return q.promise;
    }

    function postCustomerParent(param) {
      var q = $q.defer();
      HTTPService.post(urlApi.concat('/profile/customer/parent/insert'), param)
        .then(function (data) {
          q.resolve(data);
        })
        .catch(function (error) {
          q.reject(error);
        });
      return q.promise;
    }

    function postInstaCustomerParent(param) {
      var q = $q.defer();
      HTTPService.post(urlApi.concat('/profile/customer/parent/insta/insert'), param)
        .then(function (data) {
          q.resolve(data);
        })
        .catch(function (error) {
          q.reject(error);
        });
      return q.promise;
    }

    function postSendEmail(param) {
      var q = $q.defer();
      HTTPService.post(urlApi.concat('/email/send'), param)
        .then(function (data) {
          q.resolve(data);
        })
        .catch(function (error) {
          q.reject(error);
        });
      return q.promise;
    }

    function postGeraBoleto() {
      var q = $q.defer();
      HTTPService.post(urlApi.concat('/pagarme/boleto'), param)
        .then(function (data) {
          q.resolve(data);
        })
        .catch(function (error) {
          q.reject(error);
        });
      return q.promise;
    }

    function postGeraCobrancaIntegrada(param) {
      var q = $q.defer();
      HTTPService.post(urlApi.concat('/pagarme/integrada'), param)
        .then(function (data) {
          q.resolve(data);
        })
        .catch(function (error) {
          q.reject(error);
        });
      return q.promise;
    }

    function saveTemplate(param) {
      var q = $q.defer();
      HTTPService.post(urlApi.concat('/email/template/save'), param)
        .then(function (data) {
          q.resolve(data);
        })
        .catch(function (error) {
          q.reject(error);
        });
      return q.promise;
    }

    function sendTemplate(param) {
      var q = $q.defer();
      HTTPService.post(urlApi.concat('/email/template/send'), param)
        .then(function (data) {
          q.resolve(data);
        })
        .catch(function (error) {
          q.reject(error);
        });
      return q.promise;
    }

    function postSoftDeletePhone(param) {
      var q = $q.defer();
      HTTPService.post(urlApi.concat('/profile/delete/soft/phone'), param)
        .then(function (data) {
          q.resolve(data);
        })
        .catch(function (error) {
          q.reject(error);
        });
      return q.promise;
    }

    function postSoftDeleteCustomer(param) {
      var q = $q.defer();
      HTTPService.post(urlApi.concat('/profile/delete/soft/customer'), param)
        .then(function (data) {
          q.resolve(data);
        })
        .catch(function (error) {
          q.reject(error);
        });
      return q.promise;
    }

    function postUnDeleteCustomer(param) {
      var q = $q.defer();
      HTTPService.post(urlApi.concat('/profile/delete/undo/customer'), param)
        .then(function (data) {
          q.resolve(data);
        })
        .catch(function (error) {
          q.reject(error);
        });
      return q.promise;
    }

    function postChargingLog(param, id) {
      // debugger;
      var q = $q.defer();
      HTTPService.post(urlApi.concat('/charging/log/person/id/').concat(id), {
        SerializedCharging: param
      })
        .then(function (data) {
          q.resolve(data);
        })
        .catch(function (error) {
          q.reject(error);
        });
      return q.promise;
    }

    function postPersonAtivity(param) {
      var q = $q.defer();
      HTTPService.post(urlApi.concat('/profile/customer/ativity'), param)
        .then(function (data) {
          q.resolve(data);
        })
        .catch(function (error) {
          q.reject(error);
        });
      return q.promise;
    }

    function postPersonNextAction(param) {
      var q = $q.defer();
      HTTPService.post(urlApi.concat('/profile/customer/nextaction'), param)
        .then(function (data) {
          q.resolve(data);
        })
        .catch(function (error) {
          q.reject(error);
        });
      return q.promise;
    }

    function postAllPhoneLinesAction(param) {
      var q = $q.defer();
      HTTPService.post(urlApi.concat('/manager/phones/line/edit'), param)
        .then(function (data) {
          q.resolve(data);
        })
        .catch(function (error) {
          q.reject(error);
        });
      return q.promise;
    }

    function postChargingUpdate(chargingId, status) {
      var q = $q.defer();
      HTTPService.post(
        urlApi.concat('/charging/update/id/' + chargingId + '/canceled/' + status)
      )
        .then(function (data) {
          q.resolve(data);
        })
        .catch(function (error) {
          q.reject(error);
        });
      return q.promise;
    }

    function postDesassociarLinha(phoneId) {
      var q = $q.defer();
      HTTPService.post(urlApi.concat('/manager/phones/desassociar?phoneId=' + phoneId))
        .then(function (data) {
          q.resolve(data);
        })
        .catch(function (error) {
          q.reject(error);
        });
      return q.promise;
    }

    function postUpdatePhonePlan(plan) {
      var q = $q.defer();
      HTTPService.post(urlApi.concat('/manager/phones/plan/foneclube/update'), plan)
        .then(function (data) {
          q.resolve(data);
        })
        .catch(function (error) {
          q.reject(error);
        });
      return q.promise;
    }

    function postCustomerUpdateParent(phone) {
      var q = $q.defer();
      HTTPService.post(urlApi.concat('/profile/customer/parent/id/insert'), phone)
        .then(function (data) {
          q.resolve(data);
        })
        .catch(function (error) {
          q.reject(error);
        });
      return q.promise;
    }

    function postIsertServiceActive(phone) {
      var q = $q.defer();
      HTTPService.post(urlApi.concat('/manager/phones/extra/service/insert'), phone)
        .then(function (data) {
          q.resolve(data);
        })
        .catch(function (error) {
          q.reject(error);
        });
      return q.promise;
    }

    function postIsertServiceDeactive(phone) {
      var q = $q.defer();
      HTTPService.post(urlApi.concat('/manager/phones/extra/service/insert/deactive'), phone)
        .then(function (data) {
          q.resolve(data);
        })
        .catch(function (error) {
          q.reject(error);
        });
      return q.promise;
    }

    function postIsertServiceFoneclube(service) {
      var q = $q.defer();
      HTTPService.post(urlApi.concat('/manager/phones/service/insert'), service)
        .then(function (data) {
          q.resolve(data);
        })
        .catch(function (error) {
          q.reject(error);
        });
      return q.promise;
    }

    function postUpdateServiceFoneclube(service) {
      var q = $q.defer();
      HTTPService.post(urlApi.concat('/manager/phones/service/update'), service)
        .then(function (data) {
          q.resolve(data);
        })
        .catch(function (error) {
          q.reject(error);
        });
      return q.promise;
    }

    function postInsertPlanFoneclube(plan) {
      var q = $q.defer();
      HTTPService.post(urlApi.concat('/manager/phones/plan/insert'), plan)
        .then(function (data) {
          q.resolve(data);
        })
        .catch(function (error) {
          q.reject(error);
        });
      return q.promise;
    }

    function postUpdatePlanFoneclube(plan) {
      var q = $q.defer();
      HTTPService.post(urlApi.concat('/manager/phones/plan/update'), plan)
        .then(function (data) {
          q.resolve(data);
        })
        .catch(function (error) {
          q.reject(error);
        });
      return q.promise;
    }

    function postPersonFlag(flag) {
      var q = $q.defer();
      HTTPService.post(urlApi.concat('/profile/flags/insert'), flag)
        .then(function (data) {
          q.resolve(data);
        })
        .catch(function (error) {
          q.reject(error);
        });
      return q.promise;
    }

    function postUpdateFlag(flag) {
      var q = $q.defer();
      HTTPService.post(urlApi.concat('/profile/flag/update'), flag)
        .then(function (data) {
          q.resolve(data);
        })
        .catch(function (error) {
          q.reject(error);
        });
      return q.promise;
    }

    function postDebitoTransaction(personCharging) {
      var q = $q.defer();

      HTTPService.post(urlApi.concat('/charging/cielo/transaction/insert'), personCharging)
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getPlans() {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/account/plans'))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getPlansById(id) {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/account/plans/').concat(id))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getPlanOptios() {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/manager/phones/plans'))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getAllPlanOptios() {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/manager/phones/all/plans'))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getCommision(customerId) {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/comission/customer/').concat(customerId))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function dispatchedCommision(customerId) {
      var q = $q.defer();
      HTTPService.post(
        urlApi
          .concat('/comission/customer/')
          .concat(customerId)
          .concat('/dispatched')
      )
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function dispatchedBonus(customerId) {
      var q = $q.defer();
      HTTPService.post(
        urlApi
          .concat('/comission/customer/')
          .concat(customerId)
          .concat('/bonus/dispatched')
      )
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getCustomerPlans(register) {
      var q = $q.defer();

      HTTPService.get(
        urlApi
          .concat('/profile/customer/plans?documentNumber=')
          .concat(register.toString())
      )
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getOperators() {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/account/operators'))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getCustomerByCPF(param) {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/profile/cliente?documentRegister='.concat(param)))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getCustomerPhonesByCPF(param) {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/profile/customers/phone/'.concat(param)))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getCustomerWithPhoneStatus(param) {
      var q = $q.defer();

      HTTPService.get(
        urlApi.concat('/profile/cliente/phone/status?documentRegister='.concat(param))
      )
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getCustomerWithPhoneStatus(param) {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/profile/cliente?documentRegister='.concat(param)))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getStatusBlockedClaro(ddd, numeroLinha) {
      var q = $q.defer();

      HTTPService.get(
        urlApi.concat(
          '/manager/phones/claro/status/linha/ddd/' + ddd + '/numeroLinha/' + numeroLinha
        )
      )
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getStatusLinhaClaro(ddd, numeroLinha, numero) {
      var q = $q.defer();

      HTTPService.get(
        urlApi.concat(
          '/manager/phones/claro/status/linha/ddd/' +
          ddd +
          '/numeroLinha/' +
          numeroLinha +
          '/details'
        )
      )
        .then(function (result) {
          result.index = numero;
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getCustomers() {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/profile/customers'))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getHistoryPayment(id) {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/profile/charges?personID='.concat(id)))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getTblServiceOrders(id) {
      var q = $q.defer();
      HTTPService.get(urlApi.concat('/profile/getorders?personID='.concat(id)))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });
      return q.promise;
    }

    function getChargeAndServiceOrderHistory(id) {
      var q = $q.defer();
      HTTPService.get(urlApi.concat('/charging/history?personID='.concat(id)))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });
      return q.promise;
    }

    function getChargeAndServiceOrderHistoryDinamic(id, index) {
      var q = $q.defer();
      HTTPService.get(urlApi.concat('/charging/history?personID='.concat(id)))
        .then(function (result) {
          result.indexLista = index;
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });
      return q.promise;
    }

    function getCustomerByPhoneNumber(param) {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/profile/phoneOwner'), param)
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getCustomerById(id) {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/profile/cliente/id/'.concat(id)))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getChargingClients(param) {
      var q = $q.defer();

      HTTPService.get(
        urlApi
          .concat('/charging/')
          .concat(param.year)
          .concat('/')
          .concat(param.month)
          .concat('/clients')
      )
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getStatusDocument(documentNumber) {
      var q = $q.defer();

      HTTPService.get(
        urlApi.concat('/profile/customer/status/new/document/').concat(documentNumber)
      )
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function SendEmailStatus(emaildetails) {
      var q = $q.defer();
      HTTPService.postFile(urlApi.concat('/email/sendemailstatus'), emaildetails)
        .then(function (result) {
          console.log(result);
          q.resolve(result);
        })
        .catch(function (error) {
          console.log(error);
          q.reject(error);
        });

      return q.promise;
    }

    function getEmailDetails(templateId) {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/email/sendemailstatus/' + templateId))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function saveemail(emaildetails) {
      var q = $q.defer();

      HTTPService.post(urlApi.concat('/email/saveEmailDetails'), emaildetails)
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getDataPgt(idPargarme) {
      var q = $q.defer();

      HTTPService.get(
        urlApi.concat('/pagarme/transacao/dataUltimoPagamento/') + idPargarme
      )
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getTemplates() {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/email/templates'))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getStatusAPI() {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/status/database/name'))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getChargingLog(matricula) {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/charging/history/log/person/id/') + matricula)
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getChargingScheduleHistory(matricula) {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/charging/schedule/history/') + matricula)
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getLinhasEstoque() {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/manager/phones/estoque'))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getStatusTelefonesOperadora() {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/manager/phones/status'))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getLastPersonCharging(matricula) {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/charging/last/customer/') + matricula)
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getAllCustomers(minimal) {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/profile/all/customers?minimal=') + minimal)
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getAllPhonesStatus() {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/manager/phones/all'))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getMassChargingData(mes, ano) {
      var q = $q.defer();
      HTTPService.get(
        urlApi.concat(
          '/charging/mass?mes='
            .concat(mes)
            .concat('&ano=')
            .concat(ano)
        )
      )
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });
      return q.promise;
    }

    function getStatusDivergencia() {
      var q = $q.defer();
      HTTPService.get(urlApi.concat('/manager/phones/divergencia'))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });
      return q.promise;
    }

    function getActiveCustomers() {
      var q = $q.defer();
      HTTPService.get(urlApi.concat('/profile/active/customers/parents'))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });
      return q.promise;
    }

    function getPhoneServices(phoneId) {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/manager/phones/') + phoneId + '/extra/services')
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getServices() {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/manager/phones/extra/services'))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getAllServices() {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/manager/phones/extra/all/services'))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function postSendChargeMessage(param) {
      var q = $q.defer();
      HTTPService.post(urlApi.concat('/message/send-invoice/' + param))
        .then(function (data) {
          q.resolve(data);
        })
        .catch(function (error) {
          q.reject(error);
        });
      return q.promise;
    }

    function postSendWhatsappMessage(param) {
      var q = $q.defer();
      HTTPService.post(urlApi.concat('/message/send'), param)
        .then(function (data) {
          q.resolve(data);
        })
        .catch(function (error) {
          q.reject(error);
        });
      return q.promise;
    }

    function postSendWhatsappMessageWithButton(param) {
      var q = $q.defer();
      HTTPService.post(urlApi.concat('/whatsapp/sendbutton'), param)
        .then(function (data) {
          q.resolve(data);
        })
        .catch(function (error) {
          q.reject(error);
        });
      return q.promise;
    }

    function postSendWhatsAppMessageNew(param) {
      var q = $q.defer();
      HTTPService.post(urlApi.concat('/whatsapp/send'), param)
        .then(function (data) {
          q.resolve(data);
        })
        .catch(function (error) {
          q.reject(error);
        });
      return q.promise;
    }

    function getClientMessages(param, minimal) {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/message/client/') + param + "?minimal=" + minimal)
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getFlagsTypes(onlyFlags) {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/profile/flags/types?phoneFlagOnly='.concat(onlyFlags)))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getPersonFlags(idPerson) {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/profile/customer/' + idPerson + '/flags'))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getPersonPhones(idPerson) {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/manager/phones/customer/' + idPerson))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getStatusCardDebito(idPerson) {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/cielo/debito/apto/' + idPerson))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }


    function getMassChargingFull(mes, ano) {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/charging/mass/full/mes/' + mes + '/ano/' + ano))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getCustomerDaysWithoutCharge() {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/charging/last/customers/chargings'))
        .then(function (result) {

          q.resolve(result);
        })
        .catch(function (error) {

          q.reject(error);
        });

      return q.promise;
    }

    function postPropriedadeIterna(estoquePhone) {
      var q = $q.defer();
      HTTPService.post(urlApi.concat('/manager/phones/estoque/propriedade/interna'), estoquePhone)
        .then(function (data) {
          q.resolve(data);
        })
        .catch(function (error) {
          q.reject(error);
        });
      return q.promise;
    }

    function postUpdateScheduledCharges(data) {
      var q = $q.defer();
      HTTPService.post(urlApi.concat('/charging/schedule/update'), data)
        .then(function (data) {
          q.resolve(data);
        })
        .catch(function (error) {
          q.reject(error);
        });
      return q.promise;
    }

    function getDeleteAgendamentoCobranca(id) {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/charging/schedule/delete/' + id))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {

          q.reject(error);
        });

      return q.promise;
    }

    function saveDefaultPaymentInfo(paymentInfo) {
      var q = $q.defer();

      HTTPService.post(urlApi.concat('/profile/SaveDefaultPaymentInfo'), paymentInfo)
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getChargingById(personId, chargeId) {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/charging/history/' + personId + '/' + chargeId))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {

          q.reject(error);
        });

      return q.promise;
    }

    function setChargingFlagByUser(chargeId, blnEnable) {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/charging/set/flag/' + chargeId + '/' + blnEnable))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {

          q.reject(error);
        });

      return q.promise;
    }

    function validatePhoneForWA(phones) {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/whatsapp/validate/' + phones))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {

          q.reject(error);
        });

      return q.promise;
    }

    function getWATemplates() {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/whatsapp/templates'))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getWATemplatesConfig() {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/whatsapp/whatsappconfig'))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function permanentBlockLineForCustomer(data) {
      var q = $q.defer();

      HTTPService.post(urlApi.concat('/mvno/contel/block/customer'), data)
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function permanentUnBlockLineForCustomer(data) {
      var q = $q.defer();

      HTTPService.post(urlApi.concat('/mvno/contel/unblock/customer'), data)
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function permanentBlockLine(data) {
      var q = $q.defer();

      HTTPService.post(urlApi.concat('/mvno/contel/block'), data)
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function permanentUnBlockLine(data) {
      var q = $q.defer();

      HTTPService.post(urlApi.concat('/mvno/contel/unblock'), data)
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function saveWATemplatesConfig(data) {
      var q = $q.defer();

      HTTPService.post(urlApi.concat('/whatsapp/whatsappconfig/save'), data)
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function sendChargeSummary(chargeId, phonenumbers) {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/whatsapp/send/chargesummary/' + chargeId + '/' + phonenumbers))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getLastTransactionIdByCustomer(documentNum) {
      var q = $q.defer();
      HTTPService.get(urlApi.concat('/pagarme/transacao/last/' + documentNum))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function sendMarketingMsg(param) {
      var q = $q.defer();

      HTTPService.post(urlApi.concat('/whatsapp/send/marketing'), param)
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function sendGenericMsg(param) {
      var q = $q.defer();

      HTTPService.post(urlApi.concat('/whatsapp/send/generic'), param)
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function sendWelcomeMsgWhatsApp(param) {
      var q = $q.defer();

      HTTPService.post(urlApi.concat('/whatsapp/send/welcome'), param)
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function saveWATemplates(param) {
      var q = $q.defer();
      HTTPService.post(urlApi.concat('/whatsapp/templates/save'), param)
        .then(function (data) {
          q.resolve(data);
        })
        .catch(function (error) {
          q.reject(error);
        });
      return q.promise;
    }

    function deleteWATemplates(templateId) {
      var q = $q.defer();
      HTTPService.post(urlApi.concat('/whatsapp/templates/delete/' + templateId))
        .then(function (data) {
          q.resolve(data);
        })
        .catch(function (error) {
          q.reject(error);
        });
      return q.promise;
    }

    function deleteTemplate(templateId) {
      var q = $q.defer();
      HTTPService.post(urlApi.concat('/email/template/delete/' + templateId))
        .then(function (data) {
          q.resolve(data);
        })
        .catch(function (error) {
          q.reject(error);
        });
      return q.promise;
    }

    function sendWhatsAppMessageCCRefused(personCharging) {
      var q = $q.defer();

      HTTPService.post(urlApi.concat('/whatsapp/cc/refused'), personCharging)
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function saveImportDrCelular(data) {
      var q = $q.defer();

      HTTPService.post(urlApi.concat('/charging/drcelular/import'), data)
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function verifyImportDrCelular(ano, mes, operanto, empreso) {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/charging/drcelular/verify/' + ano + '/' + mes + '/' + operanto + '/' + empreso))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function wppStart() {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/whatsapp/start'))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function wppStop() {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/whatsapp/stop'))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function wppManageSession(type) {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/whatsapp/manage/session/' + type))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function wppCreateTokenSession(token) {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/whatsapp/generate/token/' + token))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function wppCheckConnectionStatus() {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/whatsapp/status/connection'))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function wppStatusSession() {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/whatsapp/status/session'))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function saveUserSettings(data) {
      var q = $q.defer();

      HTTPService.post(urlApi.concat('/profile/update/settings'), data)
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function validateCPF(cpf) {
      var q = $q.defer();

      HTTPService.get('https://api.cpfcnpj.com.br/74817fbeb42c87d0a61f20684d3309e3/1/' + cpf)
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.resolve(error);
        });

      return q.promise;
    }

    function validateCEP(cep) {
      var q = $q.defer();

      HTTPService.get('https://viacep.com.br/ws/' + cep + '/json')
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.resolve(error);
        });

      return q.promise;
    }

    function validateICCID(iccid) {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/mvno/validate/iccid/' + iccid))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.resolve(error);
        });

      return q.promise;
    }

    function getContelDetailByPhone(phone) {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/mvno/contel/get/' + phone))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function syncContelLines() {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/mvno/contel/sync/lines'))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getTopupHistory(line) {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/mvno/contel/topup/history/' + line))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function syncContelLinesForUser(phone) {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/mvno/contel/sync/lines-saldo/customer/' + phone))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getContelDetailBySaldoPhone(phone) {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/mvno/contel/get/saldo/' + phone))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getContelSaldo() {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/mvno/contel/get/saldo'))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getContelPlans(phone) {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/mvno/contel/plans'))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getPortabilidadeOperators() {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/mvno/port/operator/list'))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.resolve(error);
        });

      return q.promise;
    }

    function getAllPhoneLinesNew() {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/manager/phones/alllines'))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.resolve(error);
        });

      return q.promise;
    }

    function addTopupPlan(data) {
      var q = $q.defer();

      HTTPService.post(urlApi.concat('/mvno/contel/topup'), data)
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function saveInstaRegisterAndCharge(data) {
      var q = $q.defer();

      HTTPService.post(urlApi.concat('/profile/client/insta-charge'), data)
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function updateInstaEditClient(data) {
      var q = $q.defer();

      HTTPService.post(urlApi.concat('/profile/customer/edit'), data)
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function updateInstaEditClientLine(data) {
      var q = $q.defer();

      HTTPService.post(urlApi.concat('/profile/customer/update/line'), data)
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function softDeleteLine(data) {
      var q = $q.defer();

      HTTPService.post(urlApi.concat('/profile/customer/soft/delete/line'), data)
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function saveInstaRegisterClient(data) {
      var q = $q.defer();

      HTTPService.post(urlApi.concat('/profile/insta/insert/customer'), data)
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function saveInstaPhoneClient(data) {
      var q = $q.defer();

      HTTPService.post(urlApi.concat('/profile/insta/insert/phone'), data)
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function saveInstaRegisterClientOrLine(data) {
      var q = $q.defer();

      HTTPService.post(urlApi.concat('/profile/insta/register/customerorline'), data)
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function saveInstaRegisterClientOrLineWithCharge(data) {
      var q = $q.defer();

      HTTPService.post(urlApi.concat('/profile/insta/register/customerorlinewithcharge'), data)
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getAgGridStates(state) {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/profile/grid/get/state/' + state))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.resolve(error);
        });

      return q.promise;
    }

    function addContelLineManual(line) {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/mvno/contel/add/line/' + line))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.resolve(error);
        });

      return q.promise;
    }

    function saveAgGridState(data) {
      var q = $q.defer();

      HTTPService.post(urlApi.concat('/profile/grid/save/state'), data)
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }


    function deleteAgGridState(data) {
      var q = $q.defer();

      HTTPService.post(urlApi.concat('/profile/grid/delete/state'), data)
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function updateDefaultGridState(data) {
      var q = $q.defer();

      HTTPService.post(urlApi.concat('/profile/grid/update/default/state'), data)
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function saveImportTopupHistory(data) {
      var q = $q.defer();

      HTTPService.post(urlApi.concat('/mvno/contel/import/topup/history'), data)
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function SaveIntlDeposits(data) {
      var q = $q.defer();

      HTTPService.post(urlApi.concat('/facil/deposit/balance'), data)
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getLineDetails(number) {
      var q = $q.defer();
      var token = 'T4bCc463T6nt4CuSfUGhPCBgCBVYowNyOdxrjsNI';

      var url = `https://corsproxy.io/?http://api.conteltelecom.com.br/linhas/detalhes?numero=${number}`;

      var config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      $http.get(url, config)
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.resolve(error);
        });

      return q.promise;
    }


    function getMMHistory(state) {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/mvno/history/mobimatter'))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.resolve(error);
        });

      return q.promise;
    }

    function getAllInternationUsers() {
      var q = $q.defer();

      HTTPService.get(urlApi.concat('/profile/intl/all'))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.resolve(error);
        });

      return q.promise;
    }

    function resetESIM(line) {
      var q = $q.defer();

       HTTPService.get(urlApi.concat('/mvno/line/reset/' + line))
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.resolve(error);
        });

      return q.promise;
    }

    function postRegisterIntlCustomer(data) {
      var q = $q.defer();

      HTTPService.post(urlApi.concat('/profile/register/user/intl'), data)
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function updateRefundInfo(data) {
      var q = $q.defer();

      HTTPService.post(urlApi.concat('/profile/user/intl/refund'), data)
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getAllInternationUserData(data) {

      var q = $q.defer();

      HTTPService.post(urlApi.concat('/profile/intl/user'), data)
        .then(function (result) {
          q.resolve(result);
        })
        .catch(function (error) {
          q.reject(error);
        });

      return q.promise;
    }

  }

})();
