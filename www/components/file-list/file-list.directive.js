(function() {
'use strict';

    angular
        .module('foneClub')
        .directive('file', ['FileListUtil', function(FileListUtil) {
            return {
                restrict: 'AE',
                scope: {
                file: '@'
                },
                link: function(scope, el, attrs){

                    el.on('change', function(event){
                        var files = event.target.files;
                        var file = files[0];
                        if(file && typeof(file) !== undefined && file.size > 0){
                            scope.file = file;
                            scope.$parent.file = file;
                            FileListUtil.set(file);
                            event.currentTarget.value = "";
                        }
                        else {
                            scope.file = {};
                            scope.$parent.file = {};
                            FileListUtil.set(file);
                            event.currentTarget.value = "";
                        }
                        scope.$apply(); 
                    });


                }
            };
        }])


})();