(function() {
    'use strict';
    
        angular
            .module('foneClub')
            .filter('filterTelefone', filterTelefone);
    
            filterTelefone.inject = [];

        function filterTelefone() {
            return function(arr, input) {
                if (input == null || input == undefined || arr == null || arr == undefined || arr.length == 0 ) {
                    return arr;
                }
                var inputClean = input.replace(/[!#$%&'()*+,-./:;?@[\\\]_`{|}~a-zA-Z]/g, '');
                if (inputClean == null || input == undefined) {
                    return arr;
                }
                return arr.filter(function(param) {
                    return param.Phones.find(function(phone) {
                        return phone.DDD.concat(phone.Number).indexOf(inputClean) !== -1;
                        // return phone.Number.toString().substring(0, inputClean.length) == inputClean;
                    }) 
                })
            }
        }
    })();