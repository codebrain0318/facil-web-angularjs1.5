(function () {
  'use strict';

  angular.module('foneClub').controller('WPPController', WPPController);

  WPPController.inject = ['ViewModelUtilsService', 'MainUtils', 'FoneclubeService', 'DialogFactory', '$scope'];

  function WPPController(ViewModelUtilsService, MainUtils, FoneclubeService, DialogFactory, $scope) {
    var vm = this;
    vm.currentUser = MainUtils.getAgent();
    vm.log = '<br/>' +'';
    vm.startWPP = startWPP;
    vm.stopWPP = stopWPP;
    vm.startSession = startSession;
    vm.createToken = createToken;
    vm.closeSession = closeSession;
    vm.logoutSession = logoutSession;
    vm.getSessionStatus = getSessionStatus;
    vm.checkConnectionStatus = checkConnectionStatus;
    vm.clearLog = clearLog;

    init();

    function init() {
      
    }

    function startWPP(){
     FoneclubeService.wppStart().then(function(data){
        vm.log = '<br/>' +'Start WPP:'+ data.replace(/(?:\r\n|\r|\n)/g, '<br>') + '<br/>' + vm.log ;
      });
    }

    function stopWPP(){
     FoneclubeService.wppStop().then(function(data){
        vm.log = '<br/>' +'Stop WPP:'+ data.replace(/(?:\r\n|\r|\n)/g, '<br>') + '<br/>' + vm.log ;
      });
    }

    function startSession(){
      FoneclubeService.wppManageSession('start').then(function(data){
        try{
            var jsonData = JSON.parse(data);
            var statuslbl = '<label>Current status</label> : <label>"'+jsonData.status+'"</label><br/>';
            if(jsonData != undefined && jsonData.status == 'QRCODE'){
                var qrcode = statuslbl + '<img src="'+jsonData.qrcode+'"/>';
                vm.log = '<br/>' +"Start Session " + qrcode + '<br/>' + vm.log ;
            }
            else{
              vm.log = '<br/>' +"Start Session: " +statuslbl + '<br/>' + vm.log ;
            }
        }
        catch(ex){
           vm.log = '<br/>' +'Start Session: Error occured while trying to start session' + '<br/>' + vm.log ;
        }
      });
    }
    function logoutSession(){
      FoneclubeService.wppManageSession('logout').then(function(data){
         vm.log = '<br/>' +"Log-out Session: " + data.replace(/(?:\r\n|\r|\n)/g, '<br>') + '<br/>' + vm.log ;
      });
    }
    function getSessionStatus(){
      FoneclubeService.wppStatusSession().then(function(data){
        try{
            var jsonData = JSON.parse(data);
            var statuslbl = '<label>Current status</label> : <label>"'+jsonData.status+'"</label><br/>';
            vm.log = '<br/>' +"Get Session Status: " + statuslbl + '<br/>' + vm.log ;
        }
        catch(ex){
           vm.log = '<br/>' +"Get Session Status: Error occured while trying to start session"+ '<br/>' + vm.log ;
        }
      });
    }

    function checkConnectionStatus(){
      FoneclubeService.wppCheckConnectionStatus().then(function(data){
        try{
            var jsonData = JSON.parse(data);
            var statuslbl = '<label>Current status</label> : <label>"'+jsonData.message+'"</label><br/>';
            vm.log = '<br/>' +"Check Connection Status: " + statuslbl+ '<br/>' + vm.log ;
        }
        catch(ex){
           vm.log = '<br/>' +'Check Connection Status: Error occured while trying to start session'+ '<br/>' + vm.log ;
        }
      });
    }
    function closeSession(){
      FoneclubeService.wppManageSession('close').then(function(data){
        vm.log = '<br/>' +"Close Session: "+ data+ '<br/>' + vm.log ;
      });
    }
    function createToken(){
       FoneclubeService.wppCreateTokenSession('12345').then(function(data){
           vm.log = '<br/>' +"Create Token: "+ data+ '<br/>' + vm.log ;
      });
    }

    function clearLog(){
      vm.log = "";
    }

  }
})();
