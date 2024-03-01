(function() {
  'use strict';

  angular.module('foneClub').service('HubDevService', HubDevService);

  HubDevService.inject = ['$q', 'HTTPService'];

  function HubDevService($q, HTTPService) {
    //teste
    var apiToken = '5ae973d7a997af13f0aaf2bf60e65803';

    //prod
    // var apiToken = '74817fbeb42c87d0a61f20684d3309e3';

    this.validaCPF = validaCPF;
    this.validaCEP = validaCEP;

    function validaCPF(cpf, datanascimento) {
      var q = $q.defer();
      var packageNumber = cpf.length > 11 ? 4 : 1;
      //packages
      //1 CPF Básico 2 CPF Avançado 4 CNPJ Básico 7 CPF Personalizado 8 CPF Personalizado
      ///{token}/{package}/{type}/{value}
      HTTPService.get(
        'https://api.cpfcnpj.com.br/'
          .concat(apiToken)
          .concat('/')
          .concat(packageNumber)
          .concat('/')
          .concat('json')
          .concat('/')
          .concat(cpf)
          .concat('/')
      )
        .then(function(result) {
          q.resolve(result);
        })
        .catch(function(error) {
          q.reject(error);
        });

      return q.promise;
    }

    function validaCEP(cep) {
      var q = $q.defer();

      HTTPService.get('http://viacep.com.br/ws/'.concat(cep).concat('/json/'))
        .then(function(result) {
          q.resolve(result);
        })
        .catch(function(error) {
          q.reject(error);
        });

      return q.promise;
    }
  }
})();
