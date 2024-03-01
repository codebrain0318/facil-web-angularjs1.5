(function() {

  'use strict';

  angular.module('foneClub')
    .service('FileListUtil', FileListUtil);

  function FileListUtil() {

    /* fields */
    this.data = undefined;

    this.set = set
    this.get = get

    function set(fileList){
        this.data = fileList;
    }

    function get(){
        return this.data;
    }

  }

})();