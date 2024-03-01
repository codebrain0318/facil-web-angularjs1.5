
angular
.module('foneClub')
.directive('moneyInput', function($filter, $browser, $timeout) {
    return {
        require: 'ngModel',
        link: function($scope, $element, $attrs, ngModelCtrl) {
            var listener = function() {

                console.log($element.val());
                var value = $element.val().replace(/[^0-9]/g, '');
                $element.val($filter('currency')(value/100, "R$", 2));

            };


            // This runs when we update the text field
            ngModelCtrl.$parsers.push(function(viewValue) {
                return viewValue.replace(/[^0-9]/g, '')
            });

            // This runs when the model gets updated on the scope directly and keeps our view in sync
            ngModelCtrl.$render = function() {
                $element.val(ngModelCtrl.$viewValue);
            };

            $element.bind('change', listener);
            $element.bind('keydown', function(event) {
                $browser.defer(listener); // Have to do this or changes don't get picked up properly
            });
            $timeout(function(){
                $element.val($filter('currency')($element.val().replace(/[^0-9]/g, '')/100, "R$", 2));    
                $browser.defer(listener)
            },500);
            
        }

    };
});


angular
.module('foneClub')
.directive('moneyInputPlain', function($filter, $browser, $timeout) {
    return {
        require: 'ngModel',
        link: function($scope, $element, $attrs, ngModelCtrl) {
            var listener = function() {

                console.log($element.val());
                var value = $element.val().replace(/[^0-9]/g, '');
                $element.val($filter('currency')(value/100, "", 2));

            };


            // This runs when we update the text field
            ngModelCtrl.$parsers.push(function(viewValue) {
                return viewValue.replace(/[^0-9]/g, '')
            });

            // This runs when the model gets updated on the scope directly and keeps our view in sync
            ngModelCtrl.$render = function() {
                $element.val(ngModelCtrl.$viewValue);
            };

            $element.bind('change', listener);
            $element.bind('keydown', function(event) {
                $browser.defer(listener); // Have to do this or changes don't get picked up properly
            });
            $timeout(function(){
                $element.val($filter('currency')($element.val().replace(/[^0-9]/g, '')/100, "", 2));    
                $browser.defer(listener)
            },500);
            
        }

    };
});