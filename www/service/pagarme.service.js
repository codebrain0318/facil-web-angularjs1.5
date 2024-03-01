(function() {
  'use strict';

  angular.module('foneClub').service('PagarmeService', PagarmeService);

  PagarmeService.inject = ['$q', 'HTTPService'];

  function PagarmeService($q, HTTPService) {
        
    // live
    var apiKey = 'ak_live_fP7ceLSpdBe8gCXGTywVRmC5VTkvN0'
    var encriptionKey = 'ek_live_U52ijlxsDgB8mk0rzcJde7HYHzqWYl';

    // //homol
    // var apiKey = "ak_test_rIMnFMFbwNJR1A5RuTmSULl9xxDdoM"
    // var encriptionKey ="ek_test_5rLvyIU3tqMGHKAj94kpCuqSWT37Ps"

    this.getCards = getCards;
    this.getCustomers = getCustomers;
    this.getCustomer = getCustomer;
    this.getCard = getCard;
    this.getStatusBoleto = getStatusBoleto;
    this.getStatusBoletoRecursivo = getStatusBoletoRecursivo;

    this.postBoleto = postBoleto;
    this.postBoletoDirect = postBoletoDirect;
    this.postPIX = postPIX;
    this.postTransactionCard = postTransactionCard;
    this.postTransactionExistentCard = postTransactionExistentCard; //refact pra uma só func
    this.postCaptureTransaction = postCaptureTransaction;
    this.generateCardHash = generateCardHash;
    this.notifyCustomerBoleto = notifyCustomerBoleto;
    this.getInstallmentPayments = getInstallmentPayments;

    this.getBoletoUrl = getBoletoUrl;

    function getBoletoUrl(id, chargesAndOrders, index) {
      var q = $q.defer();

      HTTPService.get(
        'https://api.pagar.me/1/transactions?api_key='
          .concat(apiKey)
          .concat('&id=')
          .concat(id)
      )
        .then(function(result) {

          result.index = index;
          result.chargesAndOrders = chargesAndOrders;
          q.resolve(result);
        })
        .catch(function(error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getInstallmentPayments() {
      var q = $q.defer();

      HTTPService.get(
        'https://api.pagar.me/1/transactions/calculate_installments_amount?api_key='
          .concat("ak_live_fP7ceLSpdBe8gCXGTywVRmC5VTkvN0")
          .concat('&amount=10000')
          .concat('&free_installments=1')
          .concat('&interest_rate=13')
          .concat('&max_installments=3')
      )
        .then(function(result) {
          q.resolve(result);
        })
        .catch(function(error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getCards() {
      var q = $q.defer();

      HTTPService.get('https://api.pagar.me/1/cards?api_key='.concat(apiKey))
        .then(function(result) {
          q.resolve(result);
        })
        .catch(function(error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getCustomers() {
      var q = $q.defer();
      console.log('getCustomers');
      HTTPService.get(
        'https://api.pagar.me/1/customers/?count=10000&api_key='.concat(apiKey)
      )
        .then(function(result) {
          console.log(result);
          q.resolve(result);
        })
        .catch(function(error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getCustomer(documentNumber) {
      var q = $q.defer();

      HTTPService.get(
        'https://api.pagar.me/1/customers/?api_key='
          .concat(apiKey)
          .concat('&document_number=')
          .concat(documentNumber)
      )
        .then(function(result) {
          console.log(result);
          q.resolve(result);
        })
        .catch(function(error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getCard(customerId) {
      var q = $q.defer();

      HTTPService.get(
        'https://api.pagar.me/1/cards?api_key='
          .concat(apiKey)
          .concat('&customer_id=')
          .concat(customerId)
      )
        .then(function(result) {
          q.resolve(result);
        })
        .catch(function(error) {
          q.reject(error);
        });

      return q.promise;
    }

    function postBoleto(amount, instructions, customer) {
      var q = $q.defer();

      // debugger;
      var parameters = {
        api_key: apiKey,
        encryption_key: encriptionKey,
        amount: amount,
        payment_method: 'boleto',
        'data-customer-data': true,
        customer: customer,
        boleto_instructions: instructions,
        postback_url: 'https://api.foneclube.com.br/api/pagarme/receive-webhook'
      };

      HTTPService.post('https://api.pagar.me/1/transactions', parameters)
        .then(function(result) {
          console.log(result);
          q.resolve(result);
        })
        .catch(function(error) {
          q.reject(error);
        });

      return q.promise;
    }

    function postBoletoDirect(amount, instructions, customer, expirationDate) {
      var q = $q.defer();

      // debugger;
      // var parameters = {
      //     'api_key':apiKey,
      //     // 'encryption_key':encriptionKey,
      //     'amount': amount,
      //     'payment_method':'boleto',
      //     'boleto_instructions': instructions
      // };

      var parameters = {
        api_key: apiKey,
        // 'encryption_key':encriptionKey,
        amount: amount,
        payment_method: 'boleto',
        'data-customer-data': true,
        customer: customer,
        boleto_instructions: instructions,
        boleto_expiration_date: expirationDate,
        postback_url: 'https://api.foneclube.com.br/api/pagarme/receive-webhook'
      };

      HTTPService.post('https://api.pagar.me/1/transactions', parameters)
        .then(function(result) {
          console.log(result);
          q.resolve(result);
        })
        .catch(function(error) {
          q.reject(error);
        });

      return q.promise;
    }

    function postPIX(amount, instructions, customer, expirationDate, loop) {
      var q = $q.defer();

      // For expirying at 12 AM
      var expiryDateMandatory = expirationDate + 'T21:00:00';

      var parameters = {
        api_key: apiKey,
        customer:customer,
        encryption_key:encriptionKey,
        amount: amount,
        payment_method: 'pix',
        pix_expiration_date: expiryDateMandatory,
        pix_additional_fields: [{value:'1',name:'Quantidade'}],
        postback_url: 'https://api.foneclube.com.br/api/pagarme/receive-webhook'
      };
      HTTPService.post('https://api.pagar.me/1/transactions', parameters)
        .then(function(result) {
          q.resolve(result);

          // HTTPService.post(
          //   'https://api.pagar.me/1/transactions/'.concat(result.token).concat('/capture'),
          //   parameters
          // )
          // .then(function(result) {
          //   q.resolve(result);
          // })
          // .catch(function(error) {
          //   q.reject(error);
          // });

        })
        .catch(function(error) {
          q.reject(error);
        });

      return q.promise;
    }

    function notifyCustomerBoleto(id, email) {
      var q = $q.defer();

      // var parameters = {
      //     'email': email
      // };

      // HTTPService.post('https://api.pagar.me/1/transactions/'.concat(id).concat('/collect_payment?api_key=').concat(apiKey), parameters)
      // .then(function(result){
      //     console.log(result);
      //     q.resolve(result);
      // })
      // .catch(function(error){
      //     q.reject(error);
      // });

      q.resolve(true);

      return q.promise;
    }

    function postTransactionCard(amount, cardHash, customer) {
      var q = $q.defer();

      var parameters = {
        api_key: apiKey,
        encryption_key: encriptionKey,
        amount: amount,
        card_hash: cardHash,
        'data-customer-data': true,
        customer: customer,
        postback_url: 'https://api.foneclube.com.br/api/pagarme/receive-webhook'
      };

      console.log('--- Transação com prametros:');
      console.log(parameters);

      HTTPService.post('https://api.pagar.me/1/transactions', parameters)
        .then(function(result) {
          q.resolve(result);
        })
        .catch(function(error) {
          q.reject(error);
        });

      return q.promise;
    }

    function postTransactionExistentCard(amount, cardId, customer, installments) {
      var q = $q.defer();

      var parameters = {  
          api_key: apiKey,
          encryption_key: encriptionKey,
          amount: amount,
          card_id: cardId,
          installments: installments,
          customer: customer,
          postback_url: 'https://api.foneclube.com.br/api/pagarme/receive-webhook'
        };

      console.log('--- Transação com prametros:');
      console.log(parameters);

      HTTPService.post('https://api.pagar.me/1/transactions', parameters)
        .then(function(result) {
            q.resolve(result);
        })
        .catch(function(error) {
          q.reject(error);
        });

      return q.promise;
    }

    function postCaptureTransaction(transactionId, amount) {
      var q = $q.defer();

      var parameters = {
        api_key: apiKey,
        amount: amount
      };

      HTTPService.post(
        'https://api.pagar.me/1/transactions/'.concat(transactionId).concat('/capture'),
        parameters
      )
        .then(function(result) {
          q.resolve(result);
        })
        .catch(function(error) {
          q.reject(error);
        });

      return q.promise;
    }

    function generateCardHash(cardData) {
      var q = $q.defer();
      PagarMe.encryption_key = encriptionKey;
      var creditCard = new PagarMe.creditCard();
      creditCard.cardHolderName = cardData.cardHolderName;
      creditCard.cardExpirationMonth = cardData.cardExpirationMonth;
      creditCard.cardExpirationYear = cardData.cardExpirationYear;
      creditCard.cardNumber = cardData.cardNumber;
      creditCard.cardCVV = cardData.cardCVV;

      var fieldErrors = creditCard.fieldErrors();
      var hasErrors = false;

      for (var field in fieldErrors) {
        hasErrors = true;
        break;
      }

      if (hasErrors) {
        q.reject(fieldErrors);
      } else {
        creditCard.generateHash(function(cardHash) {
          q.resolve(cardHash);
        });
      }

      return q.promise;
    }

    function getStatusBoleto(boletoId) {
      var q = $q.defer();

      HTTPService.get(
        'https://api.pagar.me/1/transactions?api_key='
          .concat(apiKey)
          .concat('&id=')
          .concat(boletoId)
      )
        .then(function(result) {
          q.resolve(result);
        })
        .catch(function(error) {
          q.reject(error);
        });

      return q.promise;
    }

    function getStatusBoletoRecursivo(
      boletoId,
      elemento,
      viewModel,
      indexCustomerModel,
      indexChargeModel
    ) {
      var q = $q.defer();

      HTTPService.get(
        'https://api.pagar.me/1/transactions?api_key='
          .concat(apiKey)
          .concat('&id=')
          .concat(boletoId)
      )
        .then(function(result) {
          // if (elemento.Name == 'Antonia Maria da Silva Barboza')
          //     // debugger

          try {
            result[0].elemento = elemento;
            result[0].vm = viewModel;
            result[0].indexCustomer = indexCustomerModel;
            result[0].indexCharge = indexChargeModel;
          } catch (erro) {
            //// debugger
          }

          q.resolve(result);
        })
        .catch(function(error) {
          q.reject(error);
        });

      return q.promise;
    }
  }
})();
