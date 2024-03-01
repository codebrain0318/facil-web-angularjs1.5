(function() {
'use strict';

    angular
        .module('foneClub')
        .controller('CadastroController', CadastroController);

    CadastroController.inject = [
        '$scope',
        'PagarmeService',        
        'HubDevService',
        'FoneclubeService',        
        'MainUtils',
        '$q',
        '$timeout',        
        'FlowManagerService',
        'ViewModelUtilsService',
        '$ionicScrollDelegate',
        'UtilsService',
        'DialogFactory',
        'ngDialog'
    ];

    function CadastroController(
        $scope,
        PagarmeService,          
        HubDevService, 
        FoneclubeService,
        MainUtils, 
        $q, 
        $timeout,          
        FlowManagerService, 
        ViewModelUtilsService,
        $ionicScrollDelegate,
        UtilsService,
        DialogFactory,
        ngDialog
    ) {
            
        var vm = this;
        vm.viewName = 'Cadastro Foneclube';
        vm.requesting = false;        
        vm.cpf = '';
        vm.birthdate = '';
        vm.zipcode = '';
        vm.street = '';
        vm.complement = '';
        vm.street_number = '';
        vm.neighborhood = '';
        vm.city = '';
        vm.uf = '';
        vm.email = '';
        vm.personalNumber = '';
        vm.phoneNumbersView =[ ];
        onTapNewPhoneNumber();        
        vm.onTapSearchDocument = onTapSearchDocument;
        vm.onTapSendDocument = onTapSendDocument;

        vm.validarCEP = validarCEP;
        vm.onTapSendAddress = onTapSendAddress;

        vm.onTapSendPersonalData = onTapSendPersonalData;

        vm.onTapNewPhoneNumber = onTapNewPhoneNumber;
        vm.onTapRemoveNewNumber = onTapRemoveNewNumber;
        vm.setPlansList = setPlansList;
        vm.changePhoneNumber = changePhoneNumber;
        vm.getContactParentName = getContactParentName;
        vm.showAddNewPhone = showAddNewPhone;
        
        // vm.enter = enter;
        vm.onTapCancel = onTapCancel;

        vm.onCheckCNPJ = onCheckCNPJ
        vm.CNPJField = false;
        vm.CPFField = true;

        function onCheckCNPJ(){
            console.log("andando " + vm.checkboxCNPJ)

            if(vm.checkboxCNPJ)
            {
                onShowCNPJField();
            }
            else
            {
                onShowCPFField();
            }
            
        }

        function onShowCPFField(){
            vm.CNPJField = false;
            vm.CPFField = true;
        }

        function onShowCNPJField(){
            vm.CNPJField = true;
            vm.CPFField = false;
        }
           
        init();

        function init(){
            vm.hasCPF = false;
            etapaDocumento();            
            vm.allOperatorOptions = MainUtils.operatorOptions();
            FoneclubeService.getPlans().then(function(result){
                console.log(result)
                vm.plans = result;
                vm.selectedPlansList = [];
            })
            .catch(function(error){
                console.log(error.statusText);
            });
           FoneclubeService.getOperators().then(function(result){
                vm.operators = result;
            })
            .catch(function(error){
                console.log(error.statusText);
            });                 
        }

        //Busca o cpf na base foneclube, se existir envia pra edição senão consulta na API de cpfs e retorna o nome;
        function onTapSearchDocument() {            
            vm.requesting = true;            
            var showLoader = DialogFactory.showLoader('Tentando preencher dados...');
            var cpf = UtilsService.clearDocumentNumber(vm.cpf);
            FoneclubeService.getCustomerByCPF(cpf).then(function(existentClient){
                if (existentClient.Id == 0) {
                    HubDevService.validaCPF(cpf).then(function(result){
                        if(result.status){
                           vm.name = result.nome;
                        }
                        etapaDocumentoFaseNome();
                        showLoader.close();
                    }, function(error){
                        etapaDocumentoFaseNome();
                        showLoader.close();
                    });
                } else {
                    showLoader.close();
                    DialogFactory.dialogConfirm({titulo:'Cliente já cadastrado', mensagem:'Deseja acrescentar novas linhas a este CPF?'})
                    .then(function(res){
                        if(res) {
                            existentClient.view = 1;
                            FlowManagerService.changeEdicaoView(existentClient);
                        } else {
                            FlowManagerService.changeNewHomeView();
                        }
                    })                    
                }
            }, function (result) {
                FlowManagerService.changeNewHomeView();
            }).catch(function (error) {
                FlowManagerService.changeNewHomeView();
            });
        }

        //envia o CPF com os dados basico para cadastro no Foneclube
        function onTapSendDocument(){
            vm.requesting = true;
            var personCheckout = {
                'DocumentNumber': UtilsService.clearDocumentNumber(vm.cpf),
                'Name': vm.name,
                'Born': '12/12/1950',
                'Email': vm.email,
                'Phones' : [{
                    'DDD': UtilsService.getPhoneNumberFromStringToJson(vm.personalNumber).DDD,
                    'Number': UtilsService.getPhoneNumberFromStringToJson(vm.personalNumber).Number,
                    'IsFoneclube': null,
                    'Id': null,
                    'IdOperator': vm.operator
                }]
            };
            FoneclubeService.postBasePerson(personCheckout).then(function(result){
                if(result) {
                    etapaEndereco();
                    DialogFactory.showMessageConfirm({titulo:'Andamento', mensagem:'Documento enviado, agora preencha os dados de Endereço.'})
                    .then(function() {
                        $timeout(function(){
                            document.getElementById('cep').focus();
                        }, 200);
                    });
                }
            }).catch(function(error){
                vm.requesting = false;
                DialogFactory.showMessageDialog({mensagem:error.statusText});                
            });
        }
            
        
        function validarCEP() {
            if (vm.zipcode.length < 9) return;
            var showLoader = DialogFactory.showLoader('Tentando preencher dados...');
            HubDevService.validaCEP(vm.zipcode.replace(/[-.]/g , '')).then(function(result){
                if (!result.erro) {
                    vm.street = result.logradouro;
                    vm.neighborhood = result.bairro;
                    vm.city = result.localidade;
                    vm.uf = result.uf;
                    $timeout(function(){
                        document.getElementById('numero').focus();
                    }, 200);
                } else {
                    DialogFactory.showMessageDialog({mensagem: "CEP incorreto."});
                }
                showLoader.close();
            }, function(error){
                showLoader.close();
            });
        }

        function onTapSendAddress() {
            vm.requesting = true;
            var cpf = UtilsService.clearDocumentNumber(vm.cpf);
            var personCheckout = {
                'DocumentNumber': cpf,
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
                ]
            };

            FoneclubeService.postUpdatePersonAdress(personCheckout).then(function(result){
                if(result) {
                    etapaDadosPessoais();
                    DialogFactory.showMessageConfirm({titulo:'Andamento',mensagem:'Endereço enviado, agora preencha os dados pessoais.'});                    
                }
            })
            .catch(function(error){
                DialogFactory.showMessageDialog({mensagem:error.statusText});
                vm.requesting = false;
            });
        }

        // ETAPA IMAGENS
        vm.imageSelf;
        vm.base64Self;
        vm.imageFrente;
        vm.base64Frente;
        vm.imageVerso;
        vm.base64Verso;        
        vm.uploadImg = uploadImg;
        vm.viewImg = viewImg;
        function viewImg(img) {            
            ngDialog.open({
                template: '<div class="popup-lista-imagens ngdialog-close"><img ng-src="{{img}}"/></div>',
                controller: ['$scope', 'DataFactory', function($scope, DataFactory) {                    
                    $scope.img = $scope.ngDialogData.img;            
                }],
                className: 'ngDialog-custom-width popup-lista-imagens',
                plain: true,
                closeByDocument: true,
                data: {
                    img: img
                }
            });
        }
        function uploadImg(param) {
            document.getElementById(param).click();
        }
        function onTapSendPersonalData() {
            var showLoader = DialogFactory.showLoader('Enviando Imagens...');
            vm.requesting = true;
            UtilsService.sendImageToUpload(vm.imageSelf, vm.imageFrente, vm.imageVerso).then(function(result) {
                var personCheckout = {
                    'DocumentNumber': UtilsService.clearDocumentNumber(vm.cpf),
                    'Photos': []
                };
                for(var i in result) {
                    personCheckout.Photos.push({Name:result[i].filename, Tipo: result[i].tipo});
                }
                FoneclubeService.postUpdatePerson(personCheckout).then(function(result){
                    showLoader.close();
                    if(result) {
                        etapaComplementar();
                        DialogFactory.showMessageConfirm({titulo:'Andamento',mensagem:'Dados pessoais enviados, agora preencha os dados Foneclube.'})
                        .then(function() {
                            $timeout(function(){
                                document.getElementById('telefoneConvidou').focus();
                            }, 200); 
                        })
                    }
                })
                .catch(function(error){
                    DialogFactory.showMessageDialog({mensagem:error.statusText}); //TODO
                    vm.requesting = false;
                    showLoader.close();

                });
            }, function(result) {
                showLoader.close();
                DialogFactory.showMessageDialog({mensagem: 'fazer validações para mensagens de erro;'}); //TODO
            });
        }
        // ETAPA IMAGENS
        function etapaDocumentoFaseNome(){
            vm.hasCPF = true;            
            vm.requesting = false;
            $timeout(function(){
                document.getElementById('nome').focus();
            }, 200);            
        }
        function etapaDocumento(){
            limpaEtapas();
            vm.etapaDocumento = true;
        }
        function etapaEndereco(){
            limpaEtapas();
            vm.etapaBuscarCEP = true;
            vm.etapaEndereco = true;                          
        }
        function etapaDadosPessoais(){
            limpaEtapas();
            vm.etapaDadosPessoais = true;
        }
        function etapaComplementar(){
            limpaEtapas();
            vm.etapaComplementar = true;           
            
        }
        function limpaEtapas(){
            vm.etapaDocumento = false;
            vm.etapaEndereco = false;
            vm.etapaDadosPessoais = false;
            vm.etapaComplementar = false;
            vm.requesting = false;
        }

        /////////////////////////
        /////FOTOS FASE
        //MOVER PRA CONSTATNS
        // var PHOTO_SELFIE = 1;
        // var PHOTO_FRONT = 2;
        // var PHOTO_VERSE = 3;
        // var interval;
        // vm.currentPhoto;

        // function onTapPhotoSelfie(){
        //     console.log('onTapPhotoSelfie');
        //     if(!vm.selfieSended)
        //         launchModal(PHOTO_SELFIE);
        // }

        // function onTapPhotoFront(){
        //     console.log('onTapPhotoFront');
        //     if(!vm.frontSended)
        //         launchModal(PHOTO_FRONT);
        // }

        // function onTapPhotoVerse(){
        //     console.log('onTapPhotoVerse');
        //     if(!vm.verseSended)
        //         launchModal(PHOTO_VERSE);
        //         //deseja trocar imagem?
        // }

        // function launchModal(photoType){
        //     console.log('launchModal ' + photoType);
        //     vm.currentPhoto = photoType;
        //     //limpa seleção de arquivo em variável local e em variável global
        //     vm.hasFileSelected = false;
        //     FileListUtil.set(undefined);
        //     vm.hasPhotoCaptured = false;
        //     vm.modal.show();            
        //     validadeFile();

        // }

        // function validadeFile(){
        //     try{
        //         $interval.cancel(interval);
        //     }
        //     catch(error){ }
        //     interval = $interval(function() {
        //         //console.log('say hello');
        //         //console.log(FileListUtil.get())
        //         if(FileListUtil.get())
        //         {
        //             vm.hasFileSelected = true;
        //         }
        //     }, 500);
        // }

        // vm.onTapPhotoGalley = onTapPhotoGalley;
        // vm.onTapPhotoCamera = onTapPhotoCamera;
        // function onTapPhotoGalley(){
        //     console.log('onTapPhotoGalley');
        //     //não precisu file upload abre direto do DOM
        // }
        // function onTapPhotoCamera(){
        //     console.log('onTapPhotoCamera');
        //     //startCameraPhoto(); não precisa file upload abre direto do DOM
        // }

        ////PHOTO PROCCESS
        /////////////////////////////////////
        /////////////////////////////////////

        ///GALERIA
        
        
        // var personCheckout = {};
        // personCheckout.Images = [];
        // var selfiePhotoName = '';
        // var frontPhotoName = '';
        // var versePhotoName = '';
        // var listaImagens = [];
        // var cameraPhotoName;
        // vm.fotos = [];
        // vm.images = []
        // vm.onTapSendImage = onTapSendImage;
        // function uploadIdentidadeGaleria(){
        //     console.log('uploadIdentidadeGaleria')
        //     var file = FileListUtil.get();
        //     if(!file)
        //      return;
        //     uploadFile(file).then(function(result){
        //         console.log('result')
        //         console.log(result.filename);
        //         setImageReleaseView(result);
        //         //https://s3-sa-east-1.amazonaws.com/fone-clube-bucket/lsUbxLxh-IMG_20170420_162617843.jpg
        //     });

        // }

        // function setImageReleaseView(result){
        //     switch(vm.currentPhoto) {
        //             case PHOTO_SELFIE:
        //                 console.log('PHOTO_SELFIE');
        //                 vm.selfieSended = true;
        //                 vm.showSelfiePhoto = true;
        //                 selfiePhotoName = result.filename;
        //                 vm.selfiePhotoURL = 'https://s3-sa-east-1.amazonaws.com/fone-clube-bucket/' + selfiePhotoName;
        //                 vm.modal.hide();
        //                 //code
        //                 break;

        //             case PHOTO_FRONT:
        //                 console.log('PHOTO_FRONT');
        //                 vm.frontSended = true;
        //                 vm.showFrontPhoto = true;
        //                 frontPhotoName = result.filename;
        //                 vm.frontPhotoURL = 'https://s3-sa-east-1.amazonaws.com/fone-clube-bucket/' + frontPhotoName;
        //                 vm.modal.hide();
        //                 //code
        //                 break;

        //             case PHOTO_VERSE:
        //                 console.log('PHOTO_VERSE');
        //                 versePhotoName = result.filename;
        //                 vm.verseSended = true;
        //                 vm.showVersePhoto = true;
        //                 vm.versePhotoURL = 'https://s3-sa-east-1.amazonaws.com/fone-clube-bucket/' + versePhotoName;
        //                 vm.modal.hide();
        //                 //code
        //                 break;
        //         }
        // }




        // function uploadFile(file){
        //     var q = $q.defer();

        //     if(isInvalidName(file.name)){
        //         vm.file = null;
        //         vm.msg = "Não foi possivel enviar sua imagem, por favor envie uma imagem sem espaço no nome do arquivo"
        //         q.reject();
        //         return q.promise;
        //     }
        //     var showLoader = DialogFactory.showLoader('Enviando...');
        //     var imageUploader = new ImageUploader();
        //     imageUploader.push(file)
        //     .then((data) => {
        //         showLoader.close();
        //          q.resolve(data);
        //     })
        //     .catch((err) => {
        //         DialogFactory.showMessageDialog({mensagem:'Não foi possível enviar imagens'});
        //         showLoader.close();
        //         q.reject(error);
        //     });
        //     return q.promise;
        // }

        // function onTapSendImage(){
        //     vm.msg = "";
        //     console.log('onTapSendImage ');
        //     if(vm.hasPhotoCaptured)
        //         startListUpload(vm.fotos);
        //     if(vm.hasFileSelected)
        //         uploadIdentidadeGaleria();
        // }

        // /////////////////////////////////////
        // ///foto de camera
        // //extrair
        // function startCameraPhoto() {
        //     console.log('fotoIdentidadeCamera')
        //     // 2
        //     var options = {
        //         destinationType : Camera.DestinationType.FILE_URI,
        //         sourceType : Camera.PictureSourceType.CAMERA, // Camera.PictureSourceType.PHOTOLIBRARY
        //         allowEdit : false,
        //         encodingType: Camera.EncodingType.JPEG,
        //         popoverOptions: CameraPopoverOptions,
        //     };

        //     // 3
        //     $cordovaCamera.getPicture(options).then(function(imageData) {
        //         console.log('cordovaCamera.getPicture')
        //         console.log(imageData)
        //         // 4
        //         onImageSuccess(imageData);

        //         function onImageSuccess(fileURI) {
        //             createFileEntry(fileURI);
        //         }
        //         function createFileEntry(fileURI) {
        //             window.resolveLocalFileSystemURL(fileURI, copyFile, fail);
        //         }
        //         // 5
        //         function copyFile(fileEntry) {
        //             var newName = MainUtils.guid() + '.jpg'; //todo fazer tratamento pra nome jpg /png
        //             window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(fileSystem2) {
        //                 fileEntry.copyTo(
        //                     fileSystem2,
        //                     newName,
        //                     onCopySuccess,
        //                     fail
        //                 );
        //             },
        //             fail);
        //         }

        //         // 6
        //         function onCopySuccess(entry) {
        //             console.log('onCopySuccess ' );
        //             console.log(entry);
        //             console.log(entry.nativeURL);
        //             var listName = entry.nativeURL.split('/');
        //             vm.fotos.push(entry.nativeURL);
        //             listaImagens.push(listName[listName.length - 1]);
        //             $scope.$apply(function () {
        //                 vm.images.push(entry.nativeURL);
        //             });
        //             vm.hasPhotoCaptured = true;
        //             //startListUpload(vm.fotos);
        //         }

        //         function fail(error) {
        //             console.log("fail: " + error.code);
        //         }

        //         function makeid() {
        //             var text = "";
        //             var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        //             for (var i=0; i < 5; i++) {
        //                 text += possible.charAt(Math.floor(Math.random() * possible.length));
        //             }
        //             return text;
        //         }

        //     }, function(err) {
        //         console.log(err);
        //     });
        // }

        // function startListUpload(photos){
        //     var showLoader = DialogFactory.showLoader('Enviando...');
        //     if(photos.length > 0) {
        //         var lastItemIndex = photos[photos.length - 1];
        //         uploadImagePath(lastItemIndex).then(function(result){
        //             if(result)
        //                 continueListUpload(vm.fotos);
        //         });
        //     } else {
        //         showLoader.close();                
        //         console.log(listaImagens)
        //         //conclusão de foto auqi
        //         setImageReleaseView(cameraPhotoName)
        //     }
        // }

        // function continueListUpload(photos){
        //     photos.pop();
        //     startListUpload(vm.fotos);
        // }

        // function uploadImagePath(path){
        //     var q = $q.defer();
        //     var guidName = MainUtils.guid();
        //     MainUtils.pathToDataURI(path, function(dataUri) {
        //         var blob = MainUtils.dataURIToBlob(dataUri);
        //         blob.name = guidName.concat('.jpg');
        //         MainUtils.uploadFile(blob).then(function(result){
        //             console.log(' MainUtils.uploadFile(blob)')
        //             console.log(result)
        //             personCheckout.Images.push(blob.name);
        //             setImageReleaseView(result);
        //             q.resolve(true);
        //         }).catch(function(result){
        //             q.resolve(false);
        //         });
        //     });
        //     return q.promise;
        // }


        /////////////////////////////////////
        /////////////////////////////////////

        function getFoneclubePhonesOnly(array) {
            return array.filter(function (number) {
                return number.IsFoneclube == true && number.DDD.length == 2 && number.Number.length >= 8 && number.LinhaAtiva;
            });
        }

        function validadeMinInfos() {
            for (var number in vm.phoneNumbersView) {
                if(!vm.phoneNumbersView[number].Nickname || vm.phoneNumbersView[number].Nickname == '') {
                    DialogFactory.showMessageDialog({titulo:'Linha ' + (number + 1), mensagem:'Nickname é um campo obrigario'});
                    return false;
                }
                if(vm.phoneNumbersView[number].IdPlanOption == '') {
                    DialogFactory.showMessageDialog({titulo:'Linha ' + (number + 1), mensagem:'A escolha do plano é obrigatória.'});
                    return false;
                }
                if (vm.phoneNumbersView[number].NovoFormatoNumero.length < 14 && vm.phoneNumbersView[number].NovoFormatoNumero.length > 0) {
                    DialogFactory.showMessageDialog({titulo:'Aviso', mensagem:'O telefone: '.concat(vm.phoneNumbersView[number].NovoFormatoNumero).concat(', não pode ficar incompleto, mas pode ficar em branco.')});
                    return false;
                }
            }
            return true;
        }

        function validateUniquePriceLessThanPhones() {
            if (!vm.singlePrice) return true;
            var totalPriceValidade = 0;
            for (var number in vm.phoneNumbersView) {
                vm.plans.find(function (element, index, array) {
                    if (element.Id == vm.phoneNumbersView[number].IdPlanOption) {
                        totalPriceValidade = totalPriceValidade + element.Value / 100;
                    }
                });
            }
            var price = parseFloat(vm.singlePrice) / 100;
            if (price > totalPriceValidade) {
                DialogFactory.showMessageDialog({mensagem:'Preço único não pode ser maior do que o preço de todos os planos somados.'});
                return false;
            }
            return true;
        }

        function dontLetAddTheSameNumberTwice(arrayFiltered) {
            for(var x in arrayFiltered) {
                var twiceNumber = arrayFiltered.filter(function (element, index, array) {
                    return element.DDD == arrayFiltered[x].DDD && element.Number == arrayFiltered[x].Number;
                });
                if (twiceNumber.length > 1) {
                    DialogFactory.showMessageDialog({titulo:'Aviso', mensagem:'Você não pode cadastrar o mesmo telefone duas vezes para o cliente.'});
                    return false;
                }
            }
            return true;
        }

        vm.onTapSendFoneclubeData = onTapSendFoneclubeData;
        function onTapSendFoneclubeData(){
            vm.requesting = true;
            
            var cpf = UtilsService.clearDocumentNumber(vm.cpf);
            var phones = [];
            
            //valida se nickname e apelido está preenchido
            if (!validadeMinInfos()) {
                vm.requesting = false;
                //showLoader.close();
                return;
            }
            
            //valida se a soma dos planos não é maior do que o preço unico;
            if (!validateUniquePriceLessThanPhones()) {
                vm.requesting = false;
                //showLoader.close();
                return;
            }

            vm.phoneNumbersView.forEach(function (element, index, array) {
                phones.push({
                    'DDD': UtilsService.getPhoneNumberFromStringToJson(element.NovoFormatoNumero).DDD,
                    'Number': UtilsService.getPhoneNumberFromStringToJson(element.NovoFormatoNumero).Number,
                    'Portability': element.Portability,
                    'IsFoneclube': true,
                    'Nickname': element.Nickname,
                    'IdPlanOption': element.IdPlanOption
                });
            });

            var personCheckout = {
                'DocumentNumber': UtilsService.clearDocumentNumber(vm.cpf),  
                // 'NameContactParent': vm.whoinvite,
                //'IdParent': vm.IdParent, //se passar um que não existe api não guarda indicação, atualmente não retornamos erro, validar com cliente, cardozo
                //'IdContactParent': vm.IdParent, //se passar um que não existe api não guarda indicação, atualmente não retornamos erro, validar com cliente, cardozo
                'Phones': phones,
                'SinglePrice': vm.singlePrice,
                'DescriptionSinglePrice': vm.descriptionSinglePrice
            };

            // debugger;

            
            
            if (vm.IdParent) {
                personCheckout.IdParent = vm.IdParent;
                personCheckout.IdContactParent = vm.IdParent;
            }

            //busca apenas telefones foneclube e que estão ativos
            var arrayFiltered = getFoneclubePhonesOnly(phones);

            //Não deixa adicionar o mesmo numero duas vezes;
            if (!dontLetAddTheSameNumberTwice(arrayFiltered)) {
                vm.requesting = false;
                //showLoader.close();
                return;
            }
            var showLoader = DialogFactory.showLoader('Enviando dados...');
            // if (personCheckout.IdParent == 0) {
            //     delete personCheckout.IdParent;
            // }
            if (arrayFiltered.length == 0) {
                FoneclubeService.postUpdatePerson(personCheckout).then(postUpdatePersonSucess).catch(postUpdatePersonError);
            } else {
                validadeNumbers(arrayFiltered).then(function(result) {
                    var right = true;
                    for (var item in result) {
                        if (result[item].DocumentNumber && result[item].DocumentNumber != UtilsService.clearDocumentNumber(vm.cpf)) {
                            var msg = 'Você não pode cadastrar o mesmo telefone para dois clientes.</br>O número <strong>'
                                .concat(getNumberComMascara(arrayFiltered[item])).concat('</strong>, pertence ao cliente ')
                                .concat(result[item].DocumentNumber).concat(', ').concat(result[item].Name).concat('.');
                            DialogFactory.showMessageDialog({titulo: 'Aviso', mensagem: msg});
                            right = false;
                            vm.requesting = false;
                            showLoader.close();
                            break;
                        }
                    }
                    if (right) {
                        FoneclubeService.postUpdatePerson(personCheckout).then(postUpdatePersonSucess).catch(postUpdatePersonError);
                    }
                });
            }
            
            function postUpdatePersonSucess(result) {

                FoneclubeService.getCustomerByCPF(UtilsService.clearDocumentNumber(vm.cpf)).then(function(result){
                    
                    // debugger
                    try{
                        var parentDDD = vm.phoneContactParent.replace('(', '').replace(')','').replace('-', '').replace(' ', '').trim().substring(0,2);
                        var parentNumber = vm.phoneContactParent.replace('(', '').replace(')','').replace('-', '').replace(' ', '').trim().substring(2,11);
                    }
                    catch(erro){
                        var parentDDD = '';
                        var parentNumber = '';
                    }
                    
                    // debugger;
                    var customerObj = {
                        'NameParent':vm.whoinvite,
                        'Id': result.Id,
                        'PhoneDDDParent':parentDDD,
                        'PhoneNumberParent':parentNumber
                    }
    
                    FoneclubeService.postCustomerParent(customerObj).then(function(result){
                        var avisopai = '';
                        if(!result)
                        {
                            avisopai = '(menos o pai)'
                        }
 
                        
                        showLoader.close();
                        if(result) { 
                            DialogFactory.dialogConfirm({title:'Cadastro Realizado', mensagem: 'Todos dados pessoais enviados, cadastro Foneclube feito com sucesso.' + avisopai, btn1: 'Ir para Home', btn2: 'Realizar Cobrança'}).then(function(result) {
                                if(result) {
                                    FoneclubeService.getCustomerByCPF(UtilsService.clearDocumentNumber(vm.cpf)).then(function(result){
                                        if(vm.singlePrice) {
                                            result.CacheIn = vm.singlePrice;
                                            ViewModelUtilsService.showModalCustomer(result);
                                        } else {
                                            FoneclubeService.getCustomerPlans(UtilsService.clearDocumentNumber(vm.cpf)).then(function(customerPlans){
                                                var valueTotal = 0;
                                                if(customerPlans.length > 0) {
                                                    for(var i=0; i<customerPlans.length;i++){
                                                        valueTotal = valueTotal + customerPlans[i].Value;
                                                    }
                                                }
                                                result.CacheIn = valueTotal;
                                                ViewModelUtilsService.showModalCustomer(result);
                                            });
                                        }
                                    });
                                } else {
                                    FlowManagerService.changeNewHomeView();
                                }
                            })                    
                        }

                    }).catch(function(erro){
                        

                        showLoader.close();
                        if(result) { 
                            DialogFactory.dialogConfirm({title:'Cadastro Realizado', mensagem: 'Todos dados pessoais enviados (menos o pai), cadastro Foneclube feito com sucesso.', btn1: 'Ir para Home', btn2: 'Realizar Cobrança'}).then(function(result) {
                                if(result) {
                                    FoneclubeService.getCustomerByCPF(UtilsService.clearDocumentNumber(vm.cpf)).then(function(result){
                                        if(vm.singlePrice) {
                                            result.CacheIn = vm.singlePrice;
                                            ViewModelUtilsService.showModalCustomer(result);
                                        } else {
                                            FoneclubeService.getCustomerPlans(UtilsService.clearDocumentNumber(vm.cpf)).then(function(customerPlans){
                                                var valueTotal = 0;
                                                if(customerPlans.length > 0) {
                                                    for(var i=0; i<customerPlans.length;i++){
                                                        valueTotal = valueTotal + customerPlans[i].Value;
                                                    }
                                                }
                                                result.CacheIn = valueTotal;
                                                ViewModelUtilsService.showModalCustomer(result);
                                            });
                                        }
                                    });
                                } else {
                                    FlowManagerService.changeNewHomeView();
                                }
                            })                    
                        }
                    });
                });

                
            }
            
            function postUpdatePersonError(error) {
                vm.requesting = false;
                showLoader.close();
                DialogFactory.showMessageDialog({mensagem:error.statusText});
            }
        }
        
        function validadeNumbers(numbers){
            var promises = numbers.map(function(number) {
                return FoneclubeService.getCustomerByPhoneNumber({
                    ddd: UtilsService.clearPhoneNumber(number.DDD),
                    numero: UtilsService.clearPhoneNumber(number.Number)
                });
            });
            return $q.all(promises);
        }
        
        function setPlansList(operadora) {
            vm.selectedPlansList = [];
            for (var item in vm.plans) {
                if (operadora == 1 && vm.plans[item].Description.endsWith('VIVO')) {
                    vm.selectedPlansList.push(vm.plans[item]);
                } else if (operadora == 2 && vm.plans[item].Description.endsWith('CLARO')){
                    vm.selectedPlansList.push(vm.plans[item]);
                }
            }
        }
            
        //adiciona telefone do array que é exibido na view
        function onTapNewPhoneNumber() {
            vm.phoneNumbersView.push(
                {
                    'Id': null,
                    'DDD': '',
                    'Number': '',
                    'IsFoneclube': true,
                    'IdOperator': 0,
                    'Portability': 'false',
                    'NickName': '',
                    'IdPlanOption': 0,
                    'Inative': false,
                    'Delete': false,
                    'NovoFormatoNumero': '',
                    'operadora': '1',
                    'LinhaAtiva': true
                }
            );
        }
        //remove telefone do array que é exibido na view
        function onTapRemoveNewNumber(position) {
            DialogFactory.dialogConfirm({title:'Excluir Número', mensagem: 'Deseja realmente remover este número?'})       
            .then(function(result) {
                if (result) {
                    vm.phoneNumbersView.splice(position, 1);
                }
            })                 
        }
        
        function changePhoneNumber(position) {
            if (vm.phoneNumbersView[position].NovoFormatoNumero.length < 14) {
                return
            }
            var param = {
                ddd: UtilsService.getPhoneNumberFromStringToJson(vm.phoneNumbersView[position].NovoFormatoNumero).DDD,
                numero: UtilsService.getPhoneNumberFromStringToJson(vm.phoneNumbersView[position].NovoFormatoNumero).Number
            }
                //nao deixa add o mesmo numero duas vezes para o mesmo cliente;
                var twiceNumber = vm.phoneNumbersView.filter(function (element, index, array) {
                    return element.NovoFormatoNumero == vm.phoneNumbersView[position].NovoFormatoNumero;
                });
                if (twiceNumber.length > 1) {
                    DialogFactory.showMessageDialog({titulo:'Aviso', mensagem:'Você não pode cadastrar o mesmo telefone duas vezes para o mesmo cliente.'});
                    return;
                }
            FoneclubeService.getCustomerByPhoneNumber(param).then(function(res) {
                if (res.DocumentNumber && res.DocumentNumber != UtilsService.clearDocumentNumber(vm.cpf)) {
                    var msg = 'Este telefone já pertence ao cliente '.concat(UtilsService.getDocumentNumerWithMask(res.DocumentNumber)).concat(', ').concat(res.Name).concat('.');
                    DialogFactory.showMessageDialog({titulo:'Aviso', mensagem: msg});
                }
            });
        }
        
        function getContactParentName() {
            //TODO
            //preenchimento automatico
            // if (vm.phoneContactParent.length < 13) { 
            //     vm.IdParent = "";
            //     return 
            // }
            // var param = {
            //     ddd: UtilsService.getPhoneNumberFromStringToJson(vm.phoneContactParent).DDD,
            //     numero: UtilsService.getPhoneNumberFromStringToJson(vm.phoneContactParent).Number
            // }
            // FoneclubeService.getCustomerByPhoneNumber(param).then(function(result) {
            //     vm.IdParent = result.Id;
            //     vm.whoinvite = result.Name;
            // })
        }

        function onTapCancel(){
            vm.modal.hide();
        }
               
        function showAddNewPhone() {
            function filterPhones(number){
                return number.IsFoneclube == true;
            }
            return personCheckout.Phones.filter(filterPhones);
        }
    }

    angular.module('foneClub').directive("fileread", [function () {
        return {
            scope: {
                fileread: "=",
                base64: "="
            },
            link: function (scope, element, attributes) {
                element.bind("change", function (changeEvent) {
                    scope.$apply(function () {
                        scope.fileread = changeEvent.target.files[0];
                    });
                    var reader = new FileReader();
                    reader.onload = function (loadEvent) {
                        scope.$apply(function () {
                            scope.base64 = loadEvent.target.result;
                        });
                    }
                    reader.readAsDataURL(changeEvent.target.files[0]);
                });
            }
        }
    }]);

})();


