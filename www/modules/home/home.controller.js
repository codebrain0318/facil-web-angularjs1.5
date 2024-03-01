(function() {
'use strict';

    angular
        .module('foneClub')
        .controller('HomeController', HomeController);

    HomeController.inject =
    [
        '$scope',
        '$cordovaCamera',
        '$cordovaFile',
        '$ionicLoading',
        'FileListUtil',
        'MainUtils',
        'FoneclubeService',
        '$q',
        '$rootScope',
        'MainComponents'
    ];

    function HomeController($scope, $cordovaCamera, $cordovaFile, $ionicLoading, FileListUtil, MainUtils, FoneclubeService, $q, $rootScope, MainComponents) {
        var vm = this;
        console.log('=== HomeController Controller ===');
        vm.images = [];
        vm.fotos = [];
        vm.addCheckout = addCheckout;
        vm.addPhoto = addPhoto;
        vm.urlForImage = urlForImage;
        vm.testeData = testeData;        

        var imageUploader = new ImageUploader();
        vm.result = {};
        vm.uploadGaleria = uploadGaleria;
        vm.version = MainComponents.getVersion();

        function addCheckout(){

            console.log('addCheckout');

            //esse ´o objeto checkout que vamos montar a partir do form
            //se o document number for repetido não funciona ( ver catch )
           var personCheckout = {
                    'DocumentNumber': '12345678946',
                    'Name': 'Teste de pessoa',
                    'Email': 'teste@teste.com.br',
                    'Born': '08/11/1988',
                    'Gender': 1,
                    'IdPagarme': 100,
                    'IdPlanOption': 4,
                    'IdContactParent': 999999999, //tem usuáro cadastrado pra teste com esse numero pra ser indicador, é o número da pessoa que indicou
                    'Adresses': [
                    {
                    'Street': 'sample string 1',
                    'Complement': 'sample string 2',
                    'StreetNumber': '100',
                    'Neighborhood': 'sample string 4',
                    'City': 'sample string 5',
                    'State': 'sample string 6',
                    'Cep': 'sample string 7'
                    }
                ],
                "Images": [
                    "sample string 1", //aqui vão os guids
                    "sample string 2"
                ],
                'Phones': [
                    {
                    'Id': 1,
                    'DDD': '21',
                    'Number': '22222222'
                    }
                ]
                };


            FoneclubeService.postCheckout(personCheckout).then(function(result){
                console.log(result);
                //post realizado com sucesso
            })
            .catch(function(error){
                console.log('catch error');
                console.log(error);
                console.log(error.statusText); // mensagem de erro para tela, caso precise
            });
        }

        //TODO MainUtils.guid()
        // colocar nome das imagens id de usuario mais guid
        // remover imagens caso de troca

        function urlForImage(imageName) {

            var name = imageName.substr(imageName.lastIndexOf('/') + 1);
            var trueOrigin = cordova.file.dataDirectory + name;

            console.log("get correct path for image " + imageName);
            console.log("origin " + trueOrigin);
            return trueOrigin;
        }

        function addPhoto() {

            console.log('addPhoto')
            // 2
            var options = {
                destinationType : Camera.DestinationType.FILE_URI,
                sourceType : Camera.PictureSourceType.CAMERA, // Camera.PictureSourceType.PHOTOLIBRARY
                allowEdit : false,
                encodingType: Camera.EncodingType.JPEG,
                popoverOptions: CameraPopoverOptions,
            };

            // 3
            $cordovaCamera.getPicture(options).then(function(imageData) {

                console.log('cordovaCamera.getPicture')
                console.log(imageData)
                // 4
                onImageSuccess(imageData);

                function onImageSuccess(fileURI) {
                    createFileEntry(fileURI);
                }

                function createFileEntry(fileURI) {
                    window.resolveLocalFileSystemURL(fileURI, copyFile, fail);
                }

                // 5
                function copyFile(fileEntry) {
                    var newName = MainUtils.guid() + '.jpg'; //todo fazer tratamento pra nome jpg /png

                    window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(fileSystem2) {
                        fileEntry.copyTo(
                            fileSystem2,
                            newName,
                            onCopySuccess,
                            fail
                        );
                    },
                    fail);
                }

                // 6
                function onCopySuccess(entry) {
                    console.log('onCopySuccess ' );
                    console.log(entry.nativeURL);
                    vm.fotos.push(entry.nativeURL);


                    $scope.$apply(function () {
                        vm.images.push(entry.nativeURL);
                    });
                }

                function fail(error) {
                    console.log("fail: " + error.code);
                }

                function makeid() {
                    var text = "";
                    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

                    for (var i=0; i < 5; i++) {
                        text += possible.charAt(Math.floor(Math.random() * possible.length));
                    }
                    return text;
                }

            }, function(err) {
                console.log(err);
            });


        }


        ////////////////////////////
        function uploadGaleria(param) {
            var file = FileListUtil.get();
            uploadFile(file);
        };

        function testeData(){
            if(vm.fotos.length > 0)
            {
                startListUpload(vm.fotos);
            }
            else
            {
                alert('não tem foto tirada')
            }
        }

        function startListUpload(photos){

            $ionicLoading.show({
                template: 'Uploading...'
            });

            if(photos.length > 0)
            {
                var lastItemIndex = photos[photos.length - 1];
                uploadImagePath(lastItemIndex).then(function(result){
                    if(result)
                        continueListUpload(vm.fotos);

                });
            }
            else
            {
                $ionicLoading.hide();
            }
        }

        function continueListUpload(photos){
            photos.pop();
            startListUpload(vm.fotos);
        }

        function uploadImagePath(path){

            var q = $q.defer();

            var guidName = MainUtils.guid();

            MainUtils.pathToDataURI(path, function(dataUri) {

                var blob = MainUtils.dataURIToBlob(dataUri);
                blob.name = guidName.concat('.jpg');

                MainUtils.uploadFile(blob).then(function(result){
                    q.resolve(true);
                }).catch(function(result){
                    q.resolve(false);
                });
            });

            return q.promise;
        }

        function uploadFile(file){

            console.log('upload file')
            console.log(file)

            $ionicLoading.show({
                template: 'Carregando...'
            });

            var imageUploader = new ImageUploader();
            imageUploader.push(file)
            .then((data) => {
                console.debug('Upload complete. Data:', data);
                $ionicLoading.hide();
                $scope.$digest();
            })
            .catch((err) => {
                console.error(err);
                $ionicLoading.hide();
            });
        }

      window.location.href = "#/tab/customers";

        ////////////////////////////

    }
})();
