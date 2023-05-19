// Override Settings
var boostPFSInstantSearchConfig = {
  search: {
    //suggestionMode: 'test',
  }
};

(function() {

  BoostPFS.inject(this); // Add this
  // Customize style of Suggestion box
  SearchInput.prototype.customizeInstantSearch = function(suggestionElement, searchElement, searchBoxId) {
    if (jQ(searchBoxId).closest('.search_container').length > 0) {
      this.setSuggestionWidth(searchBoxId, 400);
    }
  };

  /* Fix search issue on mobile */
  InstantSearch.prototype.init = function() {
    var inputElements = jQ('input[name="' + Settings.getSettingValue('search.termKey') + '"]:not([data-disable-instant-search])');
    inputElements.each((index, inputElement) => {

      if (jQ(inputElement).attr('id') == 'q' && Utils.isMobile()) {
        var id = jQ(inputElement).attr('id');
      } else {
        var id = 'boost-pfs-search-box-' + index;
      }
      var searchBox = new SearchInput(id, jQ(inputElement));
      this.addComponent(searchBox);
    });
    // Build search input for mobile
    if (Utils.isMobile()) {
      // Clear cache when going back from another page
      window.onpageshow = (event) => {
        if (event.persisted) {
          window.location.reload();
        }
      }
      // Build Suggestion mobile on top
      if (Settings.getSettingValue('search.suggestionMobileStyle') !== InstantSearchEnum.Mobile.SuggestionType.STYLE_2) {
        var instantSearchMobile = InstantSearchStyle.instantSearchMobile();
        this.addComponent(instantSearchMobile);
      }
    }
  };

  InstantSearchMobile.prototype.afterCloseInstantSearchMobile = function (isClose) {
    jQ('.close-search').click();
  }

})();