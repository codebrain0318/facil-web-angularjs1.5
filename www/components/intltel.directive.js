angular.module('foneClub').directive('intlTel', function(){
  return{
    replace:true,
    restrict: 'E',
    require: 'ngModel',
    template: '<input type="text" placeholder="e.g. +55 22123 4567">',
    link: function(scope,element,attrs,ngModel){
      var read = function() {
        var inputValue = window.intlTelInput(element[0]);
        var cCode = inputValue.getSelectedCountryData().dialCode;
        var data = {
            CountryCode : cCode ,
            Phone : element.val().replace(cCode,'')
        }
        ngModel.$setViewValue(data);
      }     
      window.intlTelInput(element[0], {
        initialCountry: "BR",
      }); 

      element.on('blur keyup change', function() {
        if (scope.$root.$$phase != '$apply' && scope.$root.$$phase != '$digest') {
            scope.$apply(read);
        }
      });
      read();
    }
  }
});