(function() {
'use strict';

    angular
        .module('foneClub')
        .service('FireBaseManagerUtil', FireBaseManagerUtil);

    FireBaseManagerUtil.$inject = ['$firebaseArray'];
    function FireBaseManagerUtil($firebaseArray) {

        var ref = firebase.database().ref();
        var log = $firebaseArray(ref.child("log"));
        var users = $firebaseArray(ref.child("users"));

        this.initialize = initialize;
        this.addLog = addLog;
        this.addUser = addUser;
        this.getUsers = getUsers;

        function initialize(){

        }

        function addLog(value){
            log.$add({
             text: value
            });
        }

        // FireBaseManagerUtil.addUser({
        //     user:'Gustavo',
        //     password:'123gustavo'
        // });

        function addUser(user){
            users.$add(user);
        }

        function getUsers(){
            console.log(users);
            // var obj = $firebaseObject(ref);
            // obj.$loaded()
            // .then(function(data) {
            //     console.log(data === obj); // true
            // })
            // .catch(function(error) {
            //     console.error("Error:", error);
            // });

            return users;
        }

    }
})();