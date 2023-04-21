/**
 * Copyright (c)2020, 2023, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 */
define([
  'text!resources/config/vb-metadata.json',
  'ojs/ojarraydataprovider',
  'ojs/ojresponsiveknockoututils',
  'ojs/ojresponsiveutils',
  
  'fndconfig/config',
], function (
  newMetadata,
  ArrayDataProvider,
  ResponsiveKnockoutUtils, ResponsiveUtils,
  
) {
  'use strict';

  var AppModule = function AppModule() {

    // by default disable offline toolkit:
    // this.forceOffline();

    this.metadata = JSON.parse(newMetadata);
    this.recipes = {};
    this.categories = {};
    this.metadata.forEach(i => {
      this.recipes[i.id] = i;
      if (this.categories[i.category] === undefined) {
        this.categories[i.category] = [];
      }
     if(i.shownOnUI == true){
      this.categories[i.category].push(i);
     }
    });
    Object.keys(this.categories).forEach(c => this.categories[c].sort((a,b) => {
      const nameA = a.label.toUpperCase();
      const nameB = b.label.toUpperCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    }));

    var smQuery = ResponsiveUtils.getFrameworkQuery(ResponsiveUtils.FRAMEWORK_QUERY_KEY.SM_ONLY);
    this.smScreen = ResponsiveKnockoutUtils.createMediaQueryObservable(smQuery);
  };

  

  AppModule.prototype.isRecipe = function (recipe) {
    return this.recipes[recipe] !== undefined;
  }

  AppModule.prototype.isNotHomePage = function (currentFlow) {
    return currentFlow !== 'home';
  }

  var searchables = ["label", "id", "desc", "category", "subCategory"];
  var categories = ["Components", "REST", "Dynamic", "PWA", "Application"];
  var subCategories = ["Table", "List View", "Data Grid", "List of Values - LOV", "Chart", "Checkbox Set", "Editable Rows", "Navigation"];

  AppModule.prototype._matches = function (recipe, fullTextWord) {
    var match = false;
    searchables.forEach(f => {
      if (recipe[f].toUpperCase().indexOf(fullTextWord) >= 0) {
        match = true;
      }
    });
    return match;
  }

  AppModule.prototype.isValidFilter = function (filter) {
    return categories.includes(filter) || subCategories.includes(filter);
  }

  AppModule.prototype.getMatchedRecipes = function (filter, fullText) {
    const self = this;
    var ignoreFilter = false;
    if (filter !== undefined && filter !== 'all') {
      if (!this.isValidFilter(filter)) {
        // wrong URL param passed in; ignore the filter
        ignoreFilter = true;
      }
    }
    const data = this.metadata.filter(recipe => {
      if (!ignoreFilter && filter !== undefined && filter !== 'all') {
        const isCategory = categories.includes(filter);
        if (isCategory && recipe.category !== filter) {
          return false;
        }
        if (!isCategory && recipe.subCategory !== filter) {
          return false;
        }
      }
      if (fullText !== undefined && fullText !== '') {
        const fullTextWords = fullText.toUpperCase().split(" ");
        var count = 0;
        fullTextWords.forEach(word => {
          if (self._matches(recipe, word)) {
            count++;
          }
        });
        return count === fullTextWords.length;
      }

      return true;
    });
    return new ArrayDataProvider(data, {
        keyAttributes: "id",
        textFilterAttributes: searchables,
    });
  }

  /**
   * Returns recipe metadata from vb-demos.json for given current page
   */
  AppModule.prototype.getRecipeMetadataForPage = function (currentPage) {
    const recipeId = currentPage.path.split('/')[1];
    return this.recipes[recipeId];
  }

  /**
   * Returns recipe metadata from vb-demos.json for given recipe ID
   */
  AppModule.prototype.getRecipeMetadata = function (recipeId) {
    return this.recipes[recipeId];
  }

  AppModule.prototype.getCategoryRecipes = function (category) {
    return this.categories[category];
  }

  AppModule.prototype.isMobileDevice = function () {
    return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(navigator.userAgent));
  }

  /**
   *
   * @param {String} arg1
   * @return {String}
   */
  AppModule.prototype.convertToArrayOfRecipes = function (recipeNames) {
    return recipeNames.map(name => this.getRecipeMetadata(name));
  };


  return AppModule;
});