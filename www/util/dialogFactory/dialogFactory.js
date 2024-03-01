(function () {
    
        'use strict';
    
        angular
            .module('foneClub')
            .factory('DialogFactory', DialogFactory);
    
        DialogFactory.$inject = ['ngDialog', '$q'];
    
        function DialogFactory(ngDialog, $q) {

            function _dialogConfirm(param) {                
                var defer = $q.defer();
                if(param.titulo == undefined || !param.titulo) {
                    param.titulo = 'Confirmação';
                }
                if(param.btn1 == undefined || !param.btn1) {
                    param.btn1 = 'Não';
                }
                if(param.btn2 == undefined || !param.btn2) {
                    param.btn2 = 'Ok';
                }

                ngDialog.openConfirm({
                    template:'<div class="mensagens-dialog"><div class="mensagem-content"><div class="title-mensagem">'+
                    '<span>' + param.titulo +'</span><hr></div>' +
                    '<div class="corpo-mensagem">'+ param.mensagem +'</div>' +
                    '<div class="footer">' +                    
                    '<button type="button" class="btnCancelar" ng-click="closeThisDialog(0)"> '+ param.btn1 + ' </button>' +
                    '<button type="button" id="openConfirm-btn-confirm" class="btnConfirmar" ng-enter-all="confirm(1)" ng-click="confirm(1)" style="margin-left:20px"> ' + param.btn2 + ' </button></div></div></div>',
                    plain: true,
                    className: 'mensagens-dialog',
                    closeByDocument: true,
                    closeByEscape: true,
                    showClose: true
                }).then(function(param) {
                    if(param == 0 || param == 1)
                        defer.resolve(param);
                    else
                        return false;
                }, function(param) {
                    if(param == 0 || param == 1)
                        defer.resolve(param);
                    else
                        return false;
                })
                return defer.promise;
            }

            function _dialogConfirmCustom(param) {                
                var defer = $q.defer();
                if(param.titulo == undefined || !param.titulo) {
                    param.titulo = 'Confirmação';
                }
                if(param.btn1 == undefined || !param.btn1) {
                    param.btn1 = 'Não';
                }
                if(param.btn2 == undefined || !param.btn2) {
                    param.btn2 = 'Ok';
                }
                if(param.additionalAction == undefined)
                    param.additionalAction = "";

                ngDialog.openConfirm({
                    template:'<div class="mensagens-dialog"><div class="mensagem-content"><div class="title-mensagem">'+
                    '<span>' + param.titulo +'</span><hr></div>' +
                    '<div class="corpo-mensagem">'+ param.mensagem +'</div>' +
                    '<div class="footer">' +                    
                    '<button type="button" class="btnCancelar" ng-click="closeThisDialog(0)"> '+ param.btn1 + ' </button>' +
                    '<button type="button" id="openConfirm-btn-confirm" class="btnConfirmar" ng-enter-all="confirm(1)" ng-click="confirm(1)" style="margin-left:20px"> ' + param.btn2 + ' </button></div> <div style="text-align:center">'+ param.additionalAction +'</div></div></div>',
                    plain: true,
                    className: 'mensagens-dialog',
                    closeByDocument: true,
                    closeByEscape: true,
                    showClose: true
                }).then(function(param) {
                    if(param == 0 || param == 1)
                        defer.resolve(param);
                    else
                        return false;
                }, function(param) {
                    if(param == 0 || param == 1)
                        defer.resolve(param);
                    else
                        return false;
                })
                return defer.promise;
            }

            function _showMessageDialog(param) {
                var defer = $q.defer();
                if(param.titulo == undefined || !param.titulo) {
                    param.titulo = 'Aviso';
                }
                ngDialog.open({
                    template: '<div class="mensagens-dialog"><div class="mensagem-content"><div class="title-mensagem">'+
                    '<span>' + param.titulo +'</span><hr></div>' +
                    '<div class="corpo-mensagem">'+ param.mensagem +'</div>' +
                    '<div class="footer">' +
                    '<button type="button" class="btnOk" ng-enter-all="closeThisDialog(0)" ng-click="closeThisDialog(0)">Ok' +
                    '</button></div></div></div>',
                    plain: true,
                    className: 'mensagens-dialog',
                    closeByDocument: false,
                    closeByEscape: false
                })
                return defer.promise;
            }

            function _showAlertDialog(param) {
                // debugger;
                var defer = $q.defer();
                if(param.titulo == undefined || !param.titulo) {
                    param.titulo = 'Aviso';
                }
                ngDialog.open({
                    template: '<div class="mensagens-dialog"><div class="mensagem-content"><div class="title-mensagem">'+
                    '<span>' + param.titulo +'</span><hr></div>' +
                    '<div class="corpo-mensagem">'+ param.message +'</div>' +
                    '<div class="footer">' +
                    '<button type="button" class="btnOk" ng-enter-all="closeThisDialog(0)" ng-click="closeThisDialog(0)">Ok' +
                    '</button></div></div></div>',
                    plain: true,
                    className: 'mensagens-dialog',
                    closeByDocument: false,
                    closeByEscape: false
                })
                return defer.promise;
            }
            
            function _showLoader(mensagem) {                               
                return ngDialog.open({
                    template: '<div class="mensagens-dialog"><div class="show-loader">'+                    
                    '<span>'+ mensagem +'</span></div></div>',
                    plain: true,
                    className: 'mensagens-dialog',
                    closeByDocument: false,
                    closeByEscape: false
                })                
            }

            function _showMessageConfirm(param) {
                var defer = $q.defer();
                if(param.titulo == undefined || !param.titulo) {
                    param.titulo = 'Aviso';
                }
                ngDialog.openConfirm({
                    template:'<div class="mensagens-dialog"><div class="mensagem-content"><div class="title-mensagem">'+
                    '<span>' + param.titulo +'</span><hr></div>' +
                    '<div class="corpo-mensagem">'+ param.mensagem +'</div>' +
                    '<div class="footer">' +                    
                    '<button type="button" class="btnOk" ng-enter-all="confirm(1)" ng-click="confirm(1)"> Ok </button></div></div></div>',
                    plain: true,
                    className: 'mensagens-dialog',
                    closeByDocument: false,
                    closeByEscape: false
                }).then(function(param) {
                    defer.resolve(param);
                }, function(param) {
                    defer.resolve(param);
                })
                return defer.promise;
            }

            function _showTemplate(template) {
                return ngDialog.open({                    
                    template: template,   
                    className: 'show-template',                        
                    closeByDocument: true,
                    closeByEscape: true,
                    showClose: true                    
                })
            }

            function _showTemplateSmall(template) {
                return ngDialog.open({                    
                    template: template,   
                    className: 'show-template',
                    appendClassName: 'custom-width-500',
                    width:"500px",  
                    closeByDocument: true,
                    closeByEscape: true,
                    showClose: true                    
                })
            }

            function _showTemplateMedium(template) {
                return ngDialog.open({                    
                    template: template,   
                    className: 'show-template',
                    appendClassName: 'custom-width-1200',
                    width:"1200px",  
                    closeByDocument: true,
                    closeByEscape: true,
                    showClose: true                    
                })
            }

            return {
                dialogConfirm: _dialogConfirm,
                dialogConfirmCustom: _dialogConfirmCustom,
                showMessageDialog: _showMessageDialog,
                showMessageConfirm: _showMessageConfirm,
                showLoader: _showLoader,
                showTemplate: _showTemplate,
                showAlertDialog:_showAlertDialog,
                showTemplateSmall: _showTemplateSmall,
                showTemplateMedium: _showTemplateMedium
            }
    
        }
    
    })();
    