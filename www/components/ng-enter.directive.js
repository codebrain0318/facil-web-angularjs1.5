angular.module('foneClub').directive('ngEnter', function () {
    return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {
            if(event.which === 13) {
                scope.$apply(function(){
                    scope.$eval(attrs.ngEnter, {'event': event});
                });

                event.preventDefault();
            }
        });
    };
});

angular.module('foneClub').directive('ngEnterAll', function () {    
    return function (scope, element, attrs) {
        angular.element(document).find('body').bind("keydown", function (event) {            
            if(event.which === 13) {
            console.log(element[0].type);
            if(event!=undefined && event.target !=null && event.target.type != "textarea")
            {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnterAll);
                });
 
                event.preventDefault();
            }
            }
        });

        
    };
});

angular.module('foneClub').directive('nextOnEnter', function () {
    return {
        restrict: 'A',
        link: function ($scope, selem, attrs) {
            selem.bind('keydown', function (e) {
                var code = e.keyCode || e.which;
                if (code === 13) {
                    e.preventDefault();
                    var pageElems = document.querySelectorAll('input, select, textarea'),
                        elem = e.srcElement || e.target,
                        focusNext = false,
                        len = pageElems.length;
                    for (var i = 0; i < len; i++) {
                        var pe = pageElems[i];
                        if (focusNext) {
                            if (pe.style.display !== 'none') {
                                document.getElementById(pe.id).focus();
                                break;
                            }
                        } else if (pe === elem) {
                            focusNext = true;
                        }
                    }
                }
            });
        }
    }
});