(function() {

  'use strict';

  angular.module('foneClub')
    .service('MainUtils', MainUtils);

  MainUtils.inject = ['$q', '$cordovaFile', '$ionicLoading', '$ionicPopup'];
  function MainUtils($q, $cordovaFile, $ionicLoading, $ionicPopup) {

    this.guid = guid;
    this.pathToDataURI = pathToDataURI;
    this.dataURIToBlob = dataURIToBlob;
    this.uploadFile = uploadFile;
    this.operatorOptions = operatorOptions;

    this.agent = undefined;
    this.setAgent = setAgent
    this.getAgent = getAgent

    function setAgent(value){
        this.agent = value;
    }

    function getAgent(){
        return this.agent;
    }

      function guid() {

        function s4() {
          return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        }

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
          s4() + '-' + s4() + s4() + s4();
      }

      function dataURIToBlob(dataURI) {
            // convert base64/URLEncoded data component to raw binary data held in a string
            var byteString;
            if (dataURI.split(',')[0].indexOf('base64') >= 0)
                byteString = atob(dataURI.split(',')[1]);
            else
                byteString = unescape(dataURI.split(',')[1]);

            // separate out the mime component
            var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

            // write the bytes of the string to a typed array
            var ia = new Uint8Array(byteString.length);
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }

            return new Blob([ia], {type:mimeString});
        }

        function pathToDataURI(url, callback) {
            var xhr = new XMLHttpRequest();
            var headers = {
              'Access-Control-Allow-Origin' : '*',
              'Access-Control-Allow-Methods' : 'POST, GET, OPTIONS, PUT',
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            };
            xhr.onload = function() {
                var reader = new FileReader();
                reader.onloadend = function() {
                callback(reader.result);
                }
                reader.readAsDataURL(xhr.response);
            };
            xhr.open('GET', url);
            xhr.headers = headers;
            xhr.responseType = 'blob';
            xhr.send();
        }

        function uploadFile(file){

            var q = $q.defer();

            var imageUploader = new ImageUploader();
            imageUploader.push(file)
            .then((data) => {
                //console.debug('Upload complete. Data:', data);
                q.resolve(data);
            })
            .catch((err) => {
                console.error(err);
                q.reject(err);
            });

            return q.promise;
        }

        function operatorOptions(){

            return [
                {'nome':'Claro', 'id':1},
                {'nome':'Vivo', 'id':2},
                {'nome':'Oi', 'id':3},
                {'nome':'Tim', 'id':4},
                {'nome':'Vivo', 'id':5},
                {'nome':'Outra', 'id':6},
            ];
        }

  }

})();