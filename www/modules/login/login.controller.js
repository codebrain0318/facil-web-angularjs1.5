(function() {
'use strict';

    angular
        .module('foneClub')
        .controller('LoginController', LoginController);

  LoginController.inject = ['FlowManagerService', 'MainComponents', '$scope', 'FireBaseManagerUtil', 'MainUtils', 'DialogFactory','localStorageService', 'FoneclubeService'];
  function LoginController(FlowManagerService, MainComponents, $scope, FireBaseManagerUtil, MainUtils, DialogFactory, localStorageService, FoneclubeService) {
        var vm = this;
        vm.login = login;
        vm.refresh = refresh;
        vm.version = MainComponents.getVersion();

        FoneclubeService.getReintegrateDatePagarme().then(function (result) {
            // debugger
            var registro = new Date(result);
            vm.dataClonePagarme = registro.toString().split('GMT')[0];
        }).catch(function(error){
            alert('Aviso: o watcher pegou uma exceção, por favor, tire um print para companhamento: lc24')
        })

        FoneclubeService.getScheduleDateExecuted().then(function (result) {
          // debugger
          var registro = new Date(result);
          vm.dateschedule = registro.toString().split('GMT')[0];
      }).catch(function(error){
          alert('Aviso: o watcher pegou uma exceção, por favor, tire um print para companhamento: lc24')
      })



        FoneclubeService.getStatusAPI().then(function(result){
                vm.statusBase = result;
                console.log(result)
        })

        function validaLogin(){

            var users = FireBaseManagerUtil.getUsers();


            for(var i in users){
                var user = users[i];
                if(user.user == vm.user && user.password == vm.password)
                {
                    MainUtils.setAgent(user.user);
                    return true;
                }

            }

            return false;
        }

        function login(){
            if(validaLogin())
            {
              localStorageService.add("userid",'True')
              FlowManagerService.changeNewHomeView();


            }
            else
            {
                DialogFactory.showMessageDialog({mensagem: 'Usuário ou senha incorretos', titulo: 'Alerta'});
            }
        }


        function formatDate(date) {
            var monthNames = [
              "January", "February", "March",
              "April", "May", "June", "July",
              "August", "September", "October",
              "November", "December"
            ];

            var day = date.getDate();
            var monthIndex = date.getMonth();
            var year = date.getFullYear();

            return day + ' ' + monthNames[monthIndex] + ' ' + year;
        }

        function refresh(){
            // debugger
            FoneclubeService.getUpdatePagarme().then(function (result) {
                // debugger
                console.log('result ' + result);
            }).catch(function(error){
                alert('Aviso: o watcher pegou uma exceção, por favor, tire um print para companhamento: lc17')
            })
        }


    }
})();
