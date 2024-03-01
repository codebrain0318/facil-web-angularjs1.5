(function () {

  'use strict';

  angular
    .module('foneClub')
    .service('MainComponents', MainComponents);

  MainComponents.$inject = ['$q', '$sce', '$ionicPopup', '$timeout', '$ionicLoading', '$cordovaNetwork', '$ionicBackdrop', '$ionicBody'];

  function MainComponents($q, $sce, $ionicPopup, $timeout, $ionicLoading, $cordovaNetwork, $ionicBackdrop, $ionicBody) {

    /* fields */
    var vm = this;
    vm.getVersion = getVersion;
    vm.alert = alert;
    vm.show = show;
    vm.showSimpleToast = showSimpleToast;
    vm.infoAlert = infoAlert;
    vm.showLoader = showLoader;
    vm.hideLoader = hideLoader;

    var releaseMode = true;
    var version = '1.6.0';

    setFavicon();

    function getVersion(){
      return version;
    }

    function setFavicon(){
      var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      if(releaseMode){
        link.href = 'content/favicon/favicon-32x32.png'
      }
      else{
        link.href = 'content/favicon/homol/favicon-32x32.png'
      }

      document.getElementsByTagName('head')[0].appendChild(link);
    }

    function alert(params){

      if(!params.titulo)
        params.titulo = 'Aviso';

      closeAllPopups();

      var infoParams = {
        template: params.mensagem,
        title: params.titulo
      };

      return $ionicPopup.alert(infoParams).then(function (answer) {
        return answer;
      });

    }

    function show(params){
      closeAllPopups();
      return $ionicPopup.show(params);
    }

    function showLoader(mensagem){
      $ionicLoading.show({
                template: mensagem
      });
    }

    function hideLoader(){
      $ionicLoading.hide();
    }

    function infoAlert(params) {

      closeAllPopups();

      var infoParams = {
        template: params.mensagem,
        title: 'Info',
        cancelText: 'Cancelar'
      };

      return $ionicPopup.confirm(infoParams).then(function (answer) {
        return answer;
      });
    }

    function showLoading() {
      $ionicLoading.show({
        template: '<ion-spinner icon="bubbles" class="spinner-calm"></ion-spinner>'
      });
    }

    function hideLoading() {
      $ionicLoading.hide();
    }

    function isOnline() {
      if (window.cordova && window.cordova.plugins && navigator && navigator.connection && navigator.connection.type) {
          return (window.cordova && $cordovaNetwork.isOnline()) || (navigator.onLine);
      }else{
          return navigator.onLine;
      }
    }

    function showSimpleToast(toastMsg, title) {
      return $ionicPopup.alert({
        template: toastMsg,
        title: title
      });
    }

    function showConfirm(params) {

      var infoParams = {
        template: params.message || 'Mensagem',
        title: params.title || 'Título',
        cancelText: params.cancelText || 'Cancelar',
        okText: params.okText || 'Confirmar',
        okType: 'button-assertive'
      };

      return $ionicPopup.confirm(infoParams);
    }



    function _noConnectionMessage() {
      return showSimpleToast("Sem conexão com internet", "AVISO");
    }

    function closeAllPopups() {
        var noop = angular.noop;
        var elevated = false;
        var popupStack = $ionicPopup._popupStack;
        if (popupStack.length > 0) {
          popupStack.forEach(function(popup, index) {
            if (popup.isShown === true) {
              popup.remove();
              popupStack.pop();
            }
          });
        }

        $ionicBackdrop.release();
        //Remove popup-open & backdrop if this is last popup
        $timeout(function() {
          // wait to remove this due to a 300ms delay native
          // click which would trigging whatever was underneath this
          $ionicBody.removeClass('popup-open');
          // $ionicPopup._popupStack.pop();
        }, 400, false);
        ($ionicPopup._backButtonActionDone || noop)();
    }

  }
})();

