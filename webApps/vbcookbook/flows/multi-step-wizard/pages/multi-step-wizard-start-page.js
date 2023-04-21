/**
 * Copyright (c)2020, 2023, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 */
define([], function() {
  'use strict';

  var PageModule = function PageModule() {};

   PageModule.prototype.returnFullName = function(itemContext){
     return itemContext.data.firstName + ' '+ itemContext.data.lastName;
     }
  

  return PageModule;
});
