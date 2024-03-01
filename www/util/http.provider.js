(function () {

  'use strict';

  angular.module('foneClub')
    .service('HTTPService', HTTPService);

  HTTPService.$inject = ['$http'];

  function HTTPService($http) {

    var vm = this;
    vm.get = get;
    vm.post = post;
    vm.postFile = postFile;
    vm.getStatus = getStatus;

    function get(path, params) {

      return $http.get(path, { params: params })
        .then(complete)
        .catch(error);

      function complete(data) {
        return data.data;
      }

      function error(message) {
        throw message;
      }
    }

    function getStatus(path, params) {

      return $http.get(path, { params: params })
        .then(complete)
        .catch(error);

      function complete(data) {
        return data.status;
      }

      function error(message) {
        throw message;
      }
    }

    function post(path, params) {

      return $http.post(path, params)
        .then(complete)
        .catch(error);

      function complete(data, status, headers, config) {
        return data.data;
      }

      function error(message) {
        throw message;
      }
    }
    function postFile(path, params) {
      // debugger;
      return $http.post(path, params, {
        headers: { 'Content-Type': undefined }
      })
        .then(complete)
        .catch(error);

      function complete(data) {
        return data;
      }

      function error(message) {
        throw message;
      }
    }
  }
})();
