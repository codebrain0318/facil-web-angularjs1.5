(function() {
'use strict';

    angular
        .module('foneClub')
        .controller('CheckoutController', CheckoutController);

    CheckoutController.inject = ['$scope','PagarmeService', 'HubDevService', 'FoneclubeService', 'FileListUtil', 'MainUtils', '$q', '$cordovaCamera', '$cordovaFile', '$timeout', 'DialogFactory'];
    function CheckoutController($scope,PagarmeService, HubDevService, FoneclubeService, FileListUtil, MainUtils, $q, $cordovaCamera, $cordovaFile, $timeout, DialogFactory) {
        var vm = this;
        var personCheckout = {};
        personCheckout.Images = [];
        vm.images = [];
        vm.fotos = [];
        var listaImagens = [];
        console.log('=== CheckoutController Controller ===');

        vm.onTapPagar = onTapPagar;
        vm.statusTransaction = ''
        vm.validarCEP = validaCEP;
        vm.validarCPF = validaCPF;
        vm.fotoIdentidadeCamera = fotoIdentidadeCamera;
        vm.uploadIdentidadeGaleria = uploadIdentidadeGaleria;
        vm.uploadIdentidadeCamera = uploadIdentidadeCamera;
        vm.OperatorsSelecteds = [];
        vm.addCheckout = addCheckout;
        vm.onRegisterTap = onRegisterTap;        

        init();

        function init(){

            faseCadastro();

            FoneclubeService.getPlans().then(function(result){
                vm.plans = result;
                //post realizado com sucesso
            })
            .catch(function(error){
                console.log('catch error');
                console.log(error);
                console.log(error.statusText); // mensagem de erro para tela, caso precise
            });
           FoneclubeService.getOperators().then(function(result){
                vm.operators = result;
                //post realizado com sucesso
            })
            .catch(function(error){
                console.log('catch error');
                console.log(error);
                console.log(error.statusText); // mensagem de erro para tela, caso precise
                DialogFactory.showMessageDialog({mensagem:error.statusText})                
            });
        }

        function onRegisterTap(){

                //limpando, assim chega na api

                //todo fix temp
                try{
                    var cellNumber = vm.UserCellphone.replace('-', '').replace(' ', '');
                }
                catch(e){
                    DialogFactory.showMessageDialog({mensagem:'Informações pendentes'})                       
                }

                var personCheckout = {
                    'DocumentNumber': vm.register,
                    'Name': vm.name,
                    'Nickname':vm.Nickname,
                    'Email': vm.email,
                    'Born': vm.birthdate,
                    'Gender': 1,
                    'IdPagarme': 100,
                    'IdPlanOption': 4,
                    'IdContactParent': 999999999, //tem usuáro cadastrado pra teste com esse numero pra ser indicador, é o número da pessoa que indicou
                    'Adresses': [
                    {
                    'Street': vm.street,
                    'Complement': vm.complement,
                    'StreetNumber': vm.street_number,
                    'Neighborhood': vm.neighborhood,
                    'City': vm.city,
                    'State': vm.uf,
                    'Cep': vm.zipcode
                    }
                ],
                "Images": listaImagens,
                'Phones': [
                    {
                    // 'Id': 1,
                    'DDD': vm.UserDDD,
                    'Number': cellNumber
                    }
                ]
                };

                console.log(personCheckout)
            FoneclubeService.postCheckout(personCheckout).then(function(result){
                console.log(result);
                //post realizado com sucesso
                DialogFactory.showMessageDialog({mensagem:'Cadastro realizado'})                    

                if(result)
                    fasePagamento();
            })
            .catch(function(error){
                console.log('catch error');
                console.log(error);
                console.log(error.statusText); // mensagem de erro para tela, caso precise
                DialogFactory.showMessageDialog({mensagem:error.statusText})                    
            });

        }

        /*
        function onRegisterTap(){

                personCheckout.DocumentNumber = vm.register;
                personCheckout.Name = vm.name;
                personCheckout.Email = vm.email;
                personCheckout.Born = vm.birthdate;
                personCheckout.Gender = 1; // todo
                personCheckout.IdPagarme = vm.register; //vai ser limado
                personCheckout.IdPlanOption = parseInt(vm.plan);
                personCheckout.IdContactParent = 21999999999; //vm.contactParent, //tem usuáro cadastrado pra teste com esse numero pra ser indicador, é o número da pessoa que indicou

                personCheckout.Adresses = [
                    {
                        'Street': vm.street,
                        'Complement': vm.complement,
                        'StreetNumber': vm.street_number,
                        'Neighborhood': vm.neighborhood,
                        'City': vm.city,
                        'State': vm.uf,
                        'Cep': vm.zipcode
                    }
                ];

                personCheckout.Phones = [
                    {
                    'DDD': vm.ddd,
                    'Number': vm.number
                    }
                ];


                console.log(personCheckout)

                if(!personCheckout.DocumentNumber || !personCheckout.Name || !personCheckout.Email
                || !personCheckout.Born || !personCheckout.IdPlanOption || !personCheckout.IdContactParent
                || !personCheckout.Adresses[0].Street || !personCheckout.Adresses[0].StreetNumber
                || !personCheckout.Adresses[0].City || !personCheckout.Adresses[0].Cep || !personCheckout.Adresses[0].State
                || !personCheckout.Phones[0].DDD || !personCheckout.Phones[0].Number)
                {
                    //trocar forma de aviso
                    vm.statusTransaction = "Existe pendência de campo a ser preenchido";
                    return;
                }

            FoneclubeService.postCheckout(personCheckout).then(function(result){
                console.log(result);
                //post realizado com sucesso
                vm.statusTransaction = result;
            })
            .catch(function(error){
                console.log('catch error');
                console.log(error);
                console.log(error.statusText); // mensagem de erro para tela, caso precise
                vm.statusTransaction = error.statusText;
            });

        }
        */

        function uploadIdentidadeGaleria(){
            console.log('uploadIdentidadeGaleria')
            var file = FileListUtil.get();

            if(!file)
             return;

            uploadFile(file).then(function(result){
                personCheckout.Images.push(result.filename);
                listaImagens.push(result.filename);
            });

        }

        function uploadIdentidadeCamera(param){
            if(vm.fotos.length > 0)
            {
                startListUpload(vm.fotos);
            }
            else
            {
                alert('não tem foto tirada')
            }
        }


        function addCheckout(){

        console.log('addCheckout');

        //esse ´o objeto checkout que vamos montar a partir do form
        //se o document number for repetido não funciona ( ver catch )
           var personCheckout = {
                    'DocumentNumber': vm.register,
                    'Name': vm.name,
                    'Email': vm.email,
                    'Born': vm.birthdate,
                    'Gender': 1, //??
                    'IdPagarme': 100, //??
                    'IdPlanOption': vm.plan,
                    'IdContactParent': 999999999, //tem usuáro cadastrado pra teste com esse numero pra ser indicador, é o número da pessoa que indicou
                    'Adresses': [
                    {
                    'Street': vm.street,
                    'Complement': vm.complement,
                    'StreetNumber': vm.street_number,
                    'Neighborhood': vm.neighborhood,
                    'City': vm.city,
                    'State': vm.uf,
                    'Cep': vm.zipcode
                    }
                ],
                // "Images": [
                //    vm.HoldingRg.url, //aqui vão os guids
                //    vm.rg.url
                // ],
                'Phones': [
                    {
                    'DDD': vm.ddd,
                    'Number': vm.number
                    }
                ]
                };

                // debugger;
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



        function validaCEP(cepInput){
            var cep = cepInput.replace(/[-.]/g , '');
            if(cep.length < 8)
                return;
            var showLoader = DialogFactory.showLoader('Tentando preencher dados...');            

            HubDevService.validaCEP(cep)
            .then(function(result){
             vm.street = result.info.logradouro;
             vm.neighborhood = result.info.bairro;
             vm.city = result.info.cidade;
             vm.uf = result.info.uf;
            showLoader.close();
             console.log(result);

            },
            function(error){
                showLoader.close();
            });
        }

         function validaCPF(cpfInput, birthdate){

                console.log(cpfInput.length)
                if(cpfInput.length <= 6)
                    return;


                var patternValidaData =/^([0-9]{2})\/([0-9]{2})\/([0-9]{4})$/;
                if(!patternValidaData.test(birthdate)){
                    DialogFactory.showMessageDialog({mensagem: 'Data Inválida'});                    
                    return;
                }


                var showLoader = DialogFactory.showLoader('Tentando preencher dados...');                

                var cpf = cpfInput.replace(/[-.,]/g , '');
                HubDevService.validaCPF(cpf,birthdate)
                .then(function(result){
                   if(result.status){
                       vm.name = result.result.nome_da_pf;
                   }
                     showLoader.close();
                },
            function(error){
            showLoader.close();
            });
        }

        function onTapPagar(){


            console.log(' --- onTapPagar ');
            vm.statusTransaction = 'Iniciando transação';



            try
            {

                var expirationMonth = vm.cardExpirationMonth;

                if(vm.cardExpirationMonth < 10)
                {
                    expirationMonth = '0' + vm.cardExpirationMonth;
                }

                var cardData = {
                    cardHolderName: vm.cardHolderName.toUpperCase(),
                    cardExpirationMonth: expirationMonth,
                    cardExpirationYear: vm.cardExpirationYear,
                    cardNumber: vm.cardNumber,
                    cardCVV:vm.cardCVV
                }
            }
            catch(erro){
                DialogFactory.showMessageDialog({mensagem: 'Existe campo vazio'});                
                return;
            }

            try
            {
                var customer = {
                    'name' : vm.name,
                    'document_number' : vm.register.toString(),
                    'email' : vm.email,
                    'birthdate' : vm.birthdate,
                    'nickname': vm.Nickname,
                    'user_cellphone': vm.UserCellphone,
                    'plan': vm.plan,
                    'actual_mobile_operators': {
                        'vivo': vm.Vivo,
                        'tim': vm.Tim,
                        'nextel': vm.Nextel,
                        'claro': vm.Claro,
                        'oi': vm.Oi,
                        'other': vm.Other
                    },
                    'front_and_back': vm.Yes == undefined ? false : vm.Yes
                    ,
                    'sugestions': vm.sugestions,
                    'foneClub_new_operators': {
                        'vivo': vm.VivoActual,
                        'claro': vm.ClaroActual
                    },
                    'invite' : {
                        'name': vm.whoinvite,
                        'number': vm.contactParent
                    },
                    'address' : {
                        'street' : vm.street,
                        'street_number' : vm.street_number,
                        'neighborhood' : vm.neighborhood,
                        'zipcode' : vm.zipcode,
                        'city': vm.city,
                        'uf': vm.uf

                    },
                    'phone' : {
                        'ddd' : vm.ddd.toString(),
                        'number' : vm.number.toString()
                    }

                }

                console.log(customer);

                var patternValidaData =/^([0-9]{2})\/([0-9]{2})\/([0-9]{4})$/;
                if(!patternValidaData.test(customer.birthdate)){
                    DialogFactory.showMessageDialog({mensagem: 'Data inválida'});                        
                    return;
                }

                var cpf = customer.document_number.replace(/[-.,]/g , '');
                HubDevService.validaCPF(cpf,customer.birthdate)
                .then(function(result){
                    console.log(result);
                    if(result.status){
                        var validaCamposReturn = {
                            success: true,
                            msg: 'Cpf válido'
                        }
                    }else{
                        DialogFactory.showMessageDialog({mensagem: 'CPF inválido'});                                       
                       return;
                    }
                });


            }
            catch(erro){
                console.log(erro)
                DialogFactory.showMessageDialog({mensagem: 'Existe campo vazio'});                        

                return;
            }

            PagarmeService.generateCardHash(cardData).then(function(cardHash){

                vm.statusTransaction = 'Criptografando dados cartão';

                PagarmeService.postTransactionCard(vm.amount, cardHash, customer)
                .then(function(result){


                    vm.statusTransaction = 'Transação em andamento';


                    PagarmeService.postCaptureTransaction(result.token, vm.amount).then(function(result){

                        vm.statusTransaction = 'Transação concluída';
                    })
                    .catch(function(error){
                        try{
                            DialogFactory.showMessageDialog({mensagem: 'Erro na captura da transação' + error.status});                                
                        }
                        catch(erro){
                            DialogFactory.showMessageDialog({mensagem: 'Erro na captura da transação'});                              
                        }
                        console.log(error);

                    });


                })
                .catch(function(error){
                    try{
                        DialogFactory.showMessageDialog({mensagem: 'Erro na transação'});                            
                        console.log(error.data.errors)

                        error.data.errors.forEach(function(erro) {
                            DialogFactory.showMessageDialog({mensagem: 'Erro na transação: ' + erro.message});                                
                        }, this);

                    }
                    catch(erro){
                        DialogFactory.showMessageDialog({mensagem: 'Erro na transação'});                                
                    }

                    console.log(error);
                });


            })
            .catch(function(error){
                var erro;
                for(var i in error)
                {

                    erro = error[i];
                }
                DialogFactory.showMessageDialog({mensagem: 'Erro na transação: ' + erro});      

            });

        }

         function uploadFile(file){
             console.log('-- uploadFile')
            var q = $q.defer();
            console.log(file)
            var showLoader = DialogFactory.showLoader('Enviando...');            

            var imageUploader = new ImageUploader();
            imageUploader.push(file)
            .then((data) => {
                console.debug('Upload complete. Data:', data);
                DialogFactory.showMessageDialog({mensagem: 'Imagem enviada com sucesso.'});                      
                showLoader.close();
                 q.resolve(data);
            })
            .catch((err) => {
                console.error(err);
                DialogFactory.showMessageDialog({mensagem: 'Não foi possivel enviar imagens'});                
                showLoader.close();
                q.reject(error);
            });
            return q.promise;
        }

        function faseCadastro(){
            vm.faseCadastro = true;
            vm.fasePagamento = false;
        }

        function fasePagamento(){
            vm.faseCadastro = false;
            vm.fasePagamento = true;
        }

        function fotoIdentidadeCamera() {

            console.log('fotoIdentidadeCamera')
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
                    var listName = entry.nativeURL.split('/');

                    vm.fotos.push(entry.nativeURL);
                    listaImagens.push(listName[listName.length - 1]);

                    $scope.$apply(function () {
                        vm.images.push(entry.nativeURL);
                    });

                    startListUpload(vm.fotos);

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

        function startListUpload(photos){

            var showLoader = DialogFactory.showLoader('Enviando...');            

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

                showLoader.close();
                DialogFactory.showMessageDialog({mensagem: 'Imagem enviada com sucesso'});                
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
                    personCheckout.Images.push(blob.name);
                    q.resolve(true);
                }).catch(function(result){
                    q.resolve(false);
                });
            });

            return q.promise;
        }       


    }
})();