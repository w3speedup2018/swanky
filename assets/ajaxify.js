/*============================================================================
  (c) Copyright 2015 Shopify Inc. Author: Carson Shold (@cshold). All Rights Reserved.

  Plugin Documentation - http://shopify.github.io/Timber/#ajax-cart

  Ajaxify the add to cart experience and flip the button for inline confirmation,
  show the cart in a modal, or a 3D drawer.

  This file includes:
    - Basic Shopify Ajax API calls
    - Ajaxify cart plugin

  This requires:
    - jQuery 1.8+
    - handlebars.min.js (for cart template)
    - modernizer.min.js
    - snippet/ajax-cart-template.liquid

  JQUERY API (c) Copyright 2009-2015 Shopify Inc. Author: Caroline Schnapp. All Rights Reserved.
  Includes slight modifications to addItemFromForm.
==============================================================================*/
if ((typeof Shopify) === 'undefined') { Shopify = {}; }

/*============================================================================
  Basic JS Helper Functions
==============================================================================*/
function urlParams (name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
  return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

/*============================================================================
  API Helper Functions
==============================================================================*/
function attributeToString(attribute) {
  if ((typeof attribute) !== 'string') {
    attribute += '';
    if (attribute === 'undefined') {
      attribute = '';
    }
  }
  return jQuery.trim(attribute);
};

/*============================================================================
  API Functions
  - Shopify.format money is defined in option_selection.js.
    If that file is not included, it is redefined here.
==============================================================================*/
if (!Shopify.formatMoney) {
  Shopify.formatMoney = function(cents, format) {
    var value = '',
        placeholderRegex = /\{\{\s*(\w+)\s*\}\}/,
        formatString = (format || this.money_format);

    if (typeof cents == 'string') {
      cents = cents.replace('.','');
    }

    function defaultOption(opt, def) {
      return (typeof opt == 'undefined' ? def : opt);
    }

    function formatWithDelimiters(number, precision, thousands, decimal) {
      precision = defaultOption(precision, 2);
      thousands = defaultOption(thousands, ',');
      decimal   = defaultOption(decimal, '.');

      if (isNaN(number) || number == null) {
        return 0;
      }

      number = (number/100.0).toFixed(precision);

      var parts   = number.split('.'),
          dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands),
          cents   = parts[1] ? (decimal + parts[1]) : '';

      return dollars + cents;
    }

    switch(formatString.match(placeholderRegex)[1]) {
      case 'amount':
        value = formatWithDelimiters(cents, 2);
        break;
      case 'amount_no_decimals':
        value = formatWithDelimiters(cents, 0);
        break;
      case 'amount_with_comma_separator':
        value = formatWithDelimiters(cents, 2, '.', ',');
        break;
      case 'amount_no_decimals_with_comma_separator':
        value = formatWithDelimiters(cents, 0, '.', ',');
        break;
    }

    return formatString.replace(placeholderRegex, value);
  };
}

Shopify.onProduct = function(product) {
  // alert('Received everything we ever wanted to know about ' + product.title);
};

Shopify.onCartUpdate = function(cart) {
  // alert('There are now ' + cart.item_count + ' items in the cart.');
};

Shopify.updateCartNote = function(note, callback) {
  var params = {
    type: 'POST',
    url: '/cart/update.js',
    data: 'note=' + attributeToString(note),
    dataType: 'json',
    success: function(cart) {
      if ((typeof callback) === 'function') {
        callback(cart);
      }
      else {
        Shopify.onCartUpdate(cart);
      }
    },
    error: function(XMLHttpRequest, textStatus) {
      Shopify.onError(XMLHttpRequest, textStatus);
    }
  };
  jQuery.ajax(params);
};

Shopify.onError = function(XMLHttpRequest, textStatus) {
  var data = eval('(' + XMLHttpRequest.responseText + ')');
  if (!!data.message) {
    alert(data.message + '(' + data.status  + '): ' + data.description);
  } else {
    alert('Error : ' + Shopify.fullMessagesFromErrors(data).join('; ') + '.');
  }
};

/*============================================================================
  POST to cart/add.js returns the JSON of the line item associated with the added item
==============================================================================*/
Shopify.addItem = function(variant_id, quantity, callback) {
  var quantity = quantity || 1,
      params = {
    type: 'POST',
    url: '/cart/add.js',
    data: 'quantity=' + quantity + '&id=' + variant_id,
    dataType: 'json',
    success: function(line_item) {
      if ((typeof callback) === 'function') {
        callback(line_item);
      }
      else {
        Shopify.onItemAdded(line_item);
      }
    },
    error: function(XMLHttpRequest, textStatus) {
      Shopify.onError(XMLHttpRequest, textStatus);
    }
  };
  jQuery.ajax(params);
};

/*============================================================================
  POST to cart/add.js returns the JSON of the line item
    - Allow use of form element instead of id
    - Allow custom error callback
==============================================================================*/
Shopify.addItemFromForm = function(form, callback, errorCallback) {
  var params = {
    type: 'POST',
    url: '/cart/add.js',
    data: jQuery(form).serialize(),
    dataType: 'json',
    success: function(line_item) {
      if ((typeof callback) === 'function') {
        callback(line_item, form);
      }
      else {
        Shopify.onItemAdded(line_item, form);
      }
    },
    error: function(XMLHttpRequest, textStatus) {
      if ((typeof errorCallback) === 'function') {
        errorCallback(XMLHttpRequest, textStatus);
      }
      else {
        Shopify.onError(XMLHttpRequest, textStatus);
      }
    }
  };
  jQuery.ajax(params);
};

// Get from cart.js returns the cart in JSON
Shopify.getCart = function(callback) {
  jQuery.getJSON('/cart.js', function (cart, textStatus) {
    if ((typeof callback) === 'function') {
      callback(cart);
    }
    else {
      Shopify.onCartUpdate(cart);
    }
  });
};

// GET products/<product-handle>.js returns the product in JSON
Shopify.getProduct = function(handle, callback) {
  jQuery.getJSON('/products/' + handle + '.js', function (product, textStatus) {
    if ((typeof callback) === 'function') {
      callback(product);
    }
    else {
      Shopify.onProduct(product);
    }
  });
};

// Customily
// We need to use this function instead of changeItem because with customizations "Item"s are
// multiple cart entries therefore shoul not be removed together
Shopify.updateLineItemQuantity = function(lineId, qty, callback){
      //customily intervention
      jQuery.post('/cart/change.js', { line: lineId, quantity: qty }).always(function(cart) {
			  callback(cart);
      });
      //customily intervention
}

// POST to cart/change.js returns the cart in JSON
Shopify.changeItem = function(variant_id, quantity, callback) {
  var params = {
    type: 'POST',
    url: '/cart/change.js',
    data:  'quantity='+quantity+'&id='+variant_id,
    dataType: 'json',
    success: function(cart) {
      if ((typeof callback) === 'function') {
        callback(cart);
      }
      else {
        Shopify.onCartUpdate(cart);
      }
    },
    error: function(XMLHttpRequest, textStatus) {
      Shopify.onError(XMLHttpRequest, textStatus);
    }
  };
  jQuery.ajax(params);
};

/*============================================================================
  Ajaxify Shopify Add To Cart
==============================================================================*/
var ajaxifyShopify = (function(module, $) {

  'use strict';

  // Public functions
  var init;

  // Private general variables
  var settings, cartInit, $drawerHeight, $cssTransforms, $cssTransforms3d, $nojQueryLoad, $w, $body, $html;

  // Private plugin variables
  var $formContainer, $btnClass, $wrapperClass, $addToCart, $flipClose, $flipCart, $flipContainer, $cartCountSelector, $cartCostSelector, $toggleCartButton, $modal, $cartContainer, $drawerCaret, $modalContainer, $modalOverlay, $closeCart, $drawerContainer, $prependDrawerTo, $callbackData={};

  // Private functions
  var updateCountPrice, flipSetup, revertFlipButton, modalSetup, showModal, sizeModal, hideModal, drawerSetup, showDrawer, hideDrawer, sizeDrawer, loadCartImages, formOverride, itemAddedCallback, itemErrorCallback, cartUpdateCallback, cartToggleCallback, setToggleButtons, flipCartUpdateCallback, buildCart, cartTemplate, adjustCart, adjustCartCallback, createQtySelectors, qtySelectors, validateQty, scrollTop, toggleCallback;

  /*============================================================================
    Initialise the plugin and define global options
  ==============================================================================*/
  init = function (options) {

    // Default settings
    settings = {
      method: 'modal', // Method options are drawer, modal, and flip. Default is drawer.
      formSelector: '.cartForm',
      addToCartSelector: 'input[type="submit"]',
      cartCountSelector: null,
      cartCostSelector: null,
      toggleCartButton: null,
      btnClass: null,
      wrapperClass: null,
      useCartTemplate: true,
      moneyFormat: '$',
      disableAjaxCart: false,
      enableQtySelectors: true,
      prependDrawerTo: 'body',
      onToggleCallback: null
    };

    // Override defaults with arguments
    $.extend(settings, options);

    // If method parameter is set, override the defined method (used for demos)
    if (urlParams('method')) {
      settings.method = urlParams('method');
    }

    // Make sure method is lower case
    settings.method = settings.method.toLowerCase();

    // Select DOM elements
    $formContainer     = $(settings.formSelector);
    $btnClass          = settings.btnClass;
    $wrapperClass      = settings.wrapperClass;
    $addToCart         = $formContainer.find(settings.addToCartSelector);
    $flipContainer     = null;
    $flipClose         = null;
    $cartCountSelector = $(settings.cartCountSelector);
    $cartCostSelector  = $(settings.cartCostSelector);
    $toggleCartButton  = $(settings.toggleCartButton);
    $modal             = null;
    $prependDrawerTo   = $(settings.prependDrawerTo);

    // CSS Checks
    $cssTransforms   = Modernizr.csstransforms;
    $cssTransforms3d = Modernizr.csstransforms3d;

    // General Selectors
    $w    = $(window);
    $body = $('body');
    $html = $('html');

    // Check if we can use .load
    $nojQueryLoad = $html.hasClass('lt-ie9');
    if ($nojQueryLoad) {
      settings.useCartTemplate = false;
    }


    // Enable the ajax cart
    if (!settings.disableAjaxCart) {
      // Handle each case add to cart method
      switch (settings.method) {
        case 'flip':
          flipSetup();
          break;

        case 'modal':
          modalSetup();
          break;

        case 'drawer':
          drawerSetup();
          break;
      }

      // Escape key closes cart
      $(document).keyup(function (evt) {
        if (evt.keyCode == 27) {
          switch (settings.method) {
            case 'flip':
            case 'drawer':
              hideDrawer();
              break;
            case 'modal':
              hideModal();
              break;
          }
        }
      });

      if ($addToCart.length) {
        // Take over the add to cart form submit
        formOverride();
      }
    }

    // Run this function in case we're using the quantity selector outside of the cart
    adjustCart();
  };

  updateCountPrice = function (cart) {
    if ($cartCountSelector) {
      $cartCountSelector.html(cart.item_count).removeClass('hidden-count');

      if (cart.item_count === 0) {
        $cartCountSelector.addClass('hidden-count');
      }
    }
    if ($cartCostSelector) {
      $cartCostSelector.find('span.money').html(Shopify.formatMoney(cart.total_price, settings.moneyFormat));
      $cartCostSelector.removeClass('hidden-count');

      if (cart.item_count === 0) {
        $cartCostSelector.addClass('hidden-count');
      }
    }
  };

  flipSetup = function () {
    // Build and append the drawer in the DOM
    drawerSetup();

    // Stop if there is no add to cart button
    if (!$addToCart.length) {
      return;
    }

    // Wrap the add to cart button in a div
    $addToCart.addClass('flip__front').wrap('<div class="flip"></div>');

    // Write a (hidden) Checkout button, a loader, and the extra view cart button
    var checkoutBtn = $('<a href="/cart" class="flip__back" style="background-color: #C00; color: #fff;" class="flip__checkout">"Checkout" </a>').addClass($btnClass),
        flipLoader = $('<span class="ajaxcart__flip-loader"></span>'),
        flipExtra = $('<div class="flip__extra"><a href="#" class="flip__cart">"translation missing: en.cart.general.view_cart" (<span></span>)</a></div>');

    // Append checkout button and loader
    checkoutBtn.insertAfter($addToCart);
    flipLoader.insertAfter(checkoutBtn);

    // Setup new selectors
    $flipContainer = $('.flip');

    if (!$cssTransforms3d) {
      $flipContainer.addClass('no-transforms');
    }

    // Setup extra selectors once appended
    flipExtra.insertAfter($flipContainer);
    $flipCart = $('.flip__cart');

    $flipCart.on('click', function(e) {
      e.preventDefault();
      showDrawer(true);
    });

    // Reset the button if a user changes a variation
    $('input[type="checkbox"], input[type="radio"], select', $formContainer).on('click', function() {
      revertFlipButton();
    });
  };

  revertFlipButton = function () {
    $flipContainer.removeClass('is-flipped');
  };

  modalSetup = function () {
    // Create modal DOM elements with handlebars.js template
    var source   = $("#ModalTemplate").html(),
        template = Handlebars.compile(source);

    // Append modal and overlay to body
    $body.append(template).append('<div class="ajaxcart__overlay"></div>');

    // Modal selectors
    $modalContainer = $('#AjaxifyModal');
    $modalOverlay   = $('.ajaxcart__overlay');
    $cartContainer  = $('#AjaxifyCart');

    // Close modal when clicking the overlay
    $modalOverlay.on('click', hideModal);

    // Create a close modal button
    $modalContainer.prepend('<button type="button" class="ajaxcart__close" title="' + "translation missing: en.cart.general.close_cart" + '">' + "translation missing: en.cart.general.close_cart" + '</button>');
    $closeCart = $('.ajaxcart__close');
    $closeCart.on('click', hideModal);

    // Add a class if CSS translate isn't available
    if (!$cssTransforms) {
      $modalContainer.addClass('no-transforms');
    }

    // Update modal position on screen changes
    $(window).on({
      orientationchange: function(e) {
        if ($modalContainer.hasClass('is-visible')) {
          sizeModal('resize');
        }
      }, resize: function(e) {
        // IE8 fires this when overflow on body is changed. Ignore IE8.
        if (!$nojQueryLoad && $modalContainer.hasClass('is-visible')) {
          sizeModal('resize');
        }
      }
    });

    // Toggle modal with cart button
    setToggleButtons();
  };

  showModal = function (toggle) {
    $body.addClass('ajaxcart--is-visible');
    // Build the cart if it isn't already there
    if (!cartInit && toggle) {
      Shopify.getCart(cartToggleCallback);
    } else {
      sizeModal();
    }
  };

  sizeModal = function(isResizing) {
    if (!isResizing) {
      $modalContainer.css('opacity', 0);
    }

    // Position modal by negative margin
    $modalContainer.css({
      'margin-left': - ($modalContainer.outerWidth() / 2),
      'opacity': 1
    });

    // Position close button relative to title
    $closeCart.css({
      'top': 30 + ($cartContainer.find('h1').height() / 2)
    });

    $modalContainer.addClass('is-visible');

    scrollTop();

    toggleCallback({
      'is_visible': true
    });
  };

  hideModal = function (e) {
    $body.removeClass('ajaxcart--is-visible');
    if (e) {
      e.preventDefault();
    }

    if ($modalContainer) {
      $modalContainer.removeClass('is-visible');
      $body.removeClass('ajaxify-lock');
    }

    toggleCallback({
      'is_visible': false
    });
  };

  drawerSetup = function () {
    // Create drawer DOM elements with handlebars.js template
    var source   = $("#DrawerTemplate").html(),
        template = Handlebars.compile(source),
        data = {
          wrapperClass: $wrapperClass
        };

    // Append drawer (defaults to body)
    $prependDrawerTo.prepend(template(data));

    // Drawer selectors
    $drawerContainer = $('#AjaxifyDrawer');
    $cartContainer   = $('#AjaxifyCart');
    $drawerCaret     = $('.ajaxcart__caret > span');

    // Toggle drawer with cart button
    setToggleButtons();

    // Position caret and size drawer on resize if drawer is visible
    var timeout;
    $(window).resize(function() {
      clearTimeout(timeout);
      timeout = setTimeout(function(){
        if ($drawerContainer.hasClass('is-visible')) {
          positionCaret();
          sizeDrawer();
        }
      }, 500);
    });

    // Position the caret the first time
    positionCaret();

    // Position the caret
    function positionCaret() {
      if ($toggleCartButton.offset()) {
        // Get the position of the toggle button to align the caret with
        var togglePos = $toggleCartButton.offset(),
            toggleWidth = $toggleCartButton.outerWidth(),
            toggleMiddle = togglePos.left + toggleWidth/2;

        $drawerCaret.css('left', toggleMiddle + 'px');
      }
    }
  };

  showDrawer = function (toggle) {
    // If we're toggling with the flip method, use a special callback
    if (settings.method == 'flip') {
      Shopify.getCart(flipCartUpdateCallback);
    }
    // opening the drawer for the first time
    else if (!cartInit && toggle) {
      Shopify.getCart(cartUpdateCallback);
    }
    // simple toggle? just size it
    else if (cartInit && toggle) {
      sizeDrawer();
    }

    // Show the drawer
    $drawerContainer.addClass('is-visible');

    scrollTop();

    toggleCallback({
      'is_visible': true
    });
  };

  hideDrawer = function () {
    $drawerContainer.removeAttr('style').removeClass('is-visible');
    scrollTop();
    toggleCallback({
      'is_visible': false
    });
  };

  sizeDrawer = function ($empty) {
    if ($empty) {
      $drawerContainer.css('height', '0px');
    } else {
      $drawerHeight = $cartContainer.outerHeight();
      $('.cart__row img').css('width', 'auto'); // fix Chrome image size bug
      $drawerContainer.css('height',  $drawerHeight + 'px');
    }
  };

  loadCartImages = function () {
    // Size cart once all images are loaded
    var cartImages = $('img', $cartContainer),
        count = cartImages.length,
        index = 0;

    cartImages.on('load', function() {
      index++;

      if (index==count) {
        switch (settings.method) {
          case 'modal':
            sizeModal();
            break;
          case 'flip':
          case 'drawer':
            sizeDrawer();
            break;
        }
      }
    });
  };

  formOverride = function () {
    $formContainer.submit(function(e) {
      e.preventDefault();

      // Add class to be styled if desired
      $addToCart.removeClass('is-added').addClass('is-adding');

      // Remove any previous quantity errors
      $('.qty-error').remove();

      Shopify.addItemFromForm(e.target, itemAddedCallback, itemErrorCallback);

      // Set the flip button to a loading state
      switch (settings.method) {
        case 'flip':
          $flipContainer.addClass('flip--is-loading');
          break;
      }
    });
  };

  itemAddedCallback = function (product) {
    $addToCart.removeClass('is-adding').addClass('is-added');

    // Slight delay of flip to mimic a longer load
    switch (settings.method) {
      case 'flip':
        setTimeout(function () {
          $flipContainer.removeClass('flip--is-loading').addClass('is-flipped');
        }, 600);
        break;
    }
    Shopify.getCart(cartUpdateCallback);
  };

  itemErrorCallback = function (XMLHttpRequest, textStatus) {
    var data = eval('(' + XMLHttpRequest.responseText + ')');

    switch (settings.method) {
      case 'flip':
        $flipContainer.removeClass('flip--is-loading');
        break;
    }

    if (!!data.message) {
      if (data.status == 422) {
        $formContainer.after('<div class="errors qty-error">'+ data.description +'</div>')
      }
    }
  };

  cartUpdateCallback = function (cart) {
    // Update quantity and price
    updateCountPrice(cart);

    switch (settings.method) {
      case 'flip':
        $('.flip__cart span').html(cart.item_count);
        break;
      case 'modal':
//         if(){
//           buildCart(cart);
//         }
  buildCart(cart);
        break;
      case 'drawer':
        buildCart(cart);
        if (!$drawerContainer.hasClass('is-visible')) {
          showDrawer();
        } else {
          scrollTop();
        }
        break;
    }
  };

  cartToggleCallback = function (cart) {
    // Update quantity and price
    updateCountPrice(cart);

    switch (settings.method) {
      case 'flip':
        $('.flip__cart span').html(cart.item_count);
        break;
      case 'modal':
        buildCart(cart);
        break;
      case 'drawer':
        buildCart(cart);
        if (!$drawerContainer.hasClass('is-visible')) {
          showDrawer();
        } else {
          scrollTop();
        }
        break;
    }
  };

  setToggleButtons = function () {
    // Reselect the element in case it just loaded
    $toggleCartButton  = $(settings.toggleCartButton);

    if ($toggleCartButton) {
      // Turn it off by default, in case it's initialized twice
      $toggleCartButton.off('click');

      // Toggle the cart, based on the method
      $toggleCartButton.on('click', function(e) {
        e.preventDefault();

        switch (settings.method) {
          case 'modal':
            if ($modalContainer.hasClass('is-visible')) {
              hideModal();
            } else {
              showModal(true);
            }
            break;
          case 'drawer':
          case 'flip':
            if ($drawerContainer.hasClass('is-visible')) {
              hideDrawer();
            } else {
              showDrawer(true);
            }
            break;
        }

      });

    }
  };

  flipCartUpdateCallback = function (cart) {
    buildCart(cart);
  };

  buildCart = function (cart) {
    // Empty cart if using default layout or not using the .load method to get /cart
    if (!settings.useCartTemplate || cart.item_count === 0) {
      $cartContainer.empty();
    }

    // Show empty cart
    if (cart.item_count === 0) {
      $cartContainer
        .append('<h3 class="uppercase h3">' + "translation missing: en.cart.general.empty" + '</h3>')
        .append('<a href="/collections/all" class="btn btn--large btn--splash btn--full btn--checkout">' + "There are no items in your cart." + '</a>');

      switch (settings.method) {
        case 'modal':
          sizeModal('resize');
          break;
        case 'flip':
        case 'drawer':
          sizeDrawer();

          if (!$drawerContainer.hasClass('is-visible') && cartInit) {
            sizeDrawer(true);
          }
          break;
      }
      return;
    }

    // Use the /cart template, or Handlebars.js layout based on theme settings
    if (settings.useCartTemplate) {
      cartTemplate(cart);
      return;
    }

    // Handlebars.js cart layout
    var items = [],
        item = {},
        data = {},
        source = $("#CartTemplate").html(),
        template = Handlebars.compile(source);

    // Add each item to our handlebars.js data
    $.each(cart.items, function(index, cartItem) {
      var itemAdd = cartItem.quantity + 1,
          itemMinus = cartItem.quantity - 1,
          itemQty = cartItem.quantity;

      /* Hack to get product image thumbnail
       *   - If image is not null
       *     - Remove file extension, add _small, and re-add extension
       *     - Create server relative link
       *   - A hard-coded url of no-image
      */

      if (cartItem.image != null){
        var prodImg = cartItem.image.replace(/(\.[^.]*)$/, "_small$1").replace('http:', '');
      } else {
        var prodImg = "//cdn.shopify.com/s/assets/admin/no-image-medium-cc9732cb976dd349a0df1d39816fbcc7.gif";
      }

      var prodName = cartItem.product_title,
          prodVariation = cartItem.variant_title;

      if (prodVariation == 'Default Title'){
	      prodVariation = false;
      }

      // Create item's data object and add to 'items' array
      item = {
        id: cartItem.variant_id,
        url: cartItem.url,
        img: prodImg,
        name: prodName,
        variation: prodVariation,
        itemAdd: itemAdd,
        itemMinus: itemMinus,
        itemQty: itemQty,
        price: Shopify.formatMoney(cartItem.price, settings.moneyFormat)
      };

      items.push(item);
    });

    // Gather all cart data and add to DOM
    data = {
      items: items,
      totalPrice: Shopify.formatMoney(cart.total_price, settings.moneyFormat),
      btnClass: $btnClass
    }
    $cartContainer.append(template(data));

    // With new elements we need to relink the adjust cart functions
    adjustCart();

    // Setup close modal button and size drawer
    switch (settings.method) {
      case 'modal':
        loadCartImages();
        break;
      case 'flip':
      case 'drawer':
        if (cart.item_count > 0) {
          loadCartImages();
        } else {
          sizeDrawer(true);
        }
        break;
      default:
        break;
    }

    // Mark the cart as built
    cartInit = true;
  };

  cartTemplate = function (cart) {
    var url = '/cart?' + Date.now() + ' form[action="/cart"]';
    $cartContainer.load(url, function() {

      // With new elements we need to relink the adjust cart functions
      adjustCart();

      // Size drawer at this point
      switch (settings.method) {
        case 'modal':
          loadCartImages();
          break;
        case 'flip':
        case 'drawer':
          if (cart.item_count > 0) {
            loadCartImages();
          } else {
            sizeDrawer(true);
          }
          // Create a close drawer button
          $cartContainer.prepend('<button type="button" class="ajaxcart__close" title="' + "translation missing: en.cart.general.close_cart" + '">' + "translation missing: en.cart.general.close_cart" + '</button>');
          $closeCart = $('.ajaxcart__close');
          $closeCart.on('click', hideDrawer);
          break;
        default:
          break;
      }

      // Mark the cart as built
      cartInit = true;
    });
  }

  adjustCart = function () {
    // This function runs on load, and when the cart is reprinted

    // Create ajax friendly quantity fields and remove links in the ajax cart
    if (settings.useCartTemplate) {
      createQtySelectors();
    }

    // Update quantify selectors
    var qtyAdjust = $('.ajaxcart__qty-adjust');

    // Add or remove from the quantity
    qtyAdjust.off('click');
    qtyAdjust.on('click', function() {
      var el = $(this),
          removeLink = el.parents('.cart__row').find('a[href*="line"]'),
          qtySelector = el.siblings('.ajaxcart__qty-num'),
          qty = parseInt(qtySelector.val().replace(/\D/g, '')),
          lineId = ((removeLink.attr('href').match(/line=\d+/gi) || [])[0].match(/\d+/gi) || [])[0];
        
      var qty = validateQty(qty);

      // Add or subtract from the current quantity
      if (el.hasClass('ajaxcart__qty--plus')) {
        qty = qty + 1;
      } else {
        qty = qty - 1;
        if (qty <= 0) qty = 0;
      }

      // If it has a data-id, update the cart.
      // Otherwise, just update the input's number
      if (lineId) {
        updateLineItemQuantity(lineId, qty);
      } else {
        qtySelector.val(qty);
      }

    });

    // Update quantity based on input on change
    var qtyInput = $('.ajaxcart__qty-num');
    qtyInput.off('change');
    qtyInput.on('change', function() {
      var el = $(this),
          removeLink = el.parents('.cart__row').find('a[href*="line"]'),
          qty = parseInt(el.val().replace(/\D/g, '')),
          lineId = ((removeLink.attr('href').match(/line=\d+/gi) || [])[0].match(/\d+/gi) || [])[0];

      var qty = validateQty(qty);

      // Only update the cart via ajax if we have a variant ID to work with
      if (lineId) {
        updateLineItemQuantity(lineId, qty);
      }
    });

    // Highlight the text when focused
    qtyInput.off('focus');
    qtyInput.on('focus', function() {
      var el = $(this);
      setTimeout(function() {
        el.select();
      }, 50);
    });

    // Completely remove product
    $('.ajaxcart__remove').on('click', function(e) {
      var el = $(this),
          id = el.data('id') || null,
          lineId = ((el.attr('href').match(/line=\d+/gi) || [])[0].match(/\d+/gi) || [])[0];

      // Without an id, let the default link action take over
      // if (!id) {
      //   return;
      // }

      e.preventDefault();
      updateLineItemQuantity(lineId, 0);
    });

    function updateLineItemQuantity(lineId, qty){
      // Add activity classes when changing cart quantities

      var $removeLink = $('.cart__row a[href*="line='+ lineId +'"]');
      
      if (!settings.useCartTemplate) {
        var row = $removeLink.parents('.ajaxcart__row').addClass('is-loading');
      } else {
        var row = $removeLink.parents('.cart__row').addClass('is-loading');
      }

      if (qty === 0) {
        row.addClass('is-removed');
      }

      // Slight delay to make sure removed animation is done
      setTimeout(function() {
        Shopify.updateLineItemQuantity(lineId, qty, function(cart){
          if(cart.statusText != 'OK'){
            return console.error('Network error while removing cart item.');            
          }
          try{
            cart = JSON.parse(cart.responseText);
          }catch(err){
            return console.error('Network error while removing cart item.');
          }
          adjustCartCallback(cart);
        });
      }, 250);
    }

    function updateQuantity(id, qty) {
      // Add activity classes when changing cart quantities
      if (!settings.useCartTemplate) {
        var row = $('.ajaxcart__row[data-id="' + id + '"]').addClass('is-loading');
      } else {
        var row = $('.cart__row[data-id="' + id + '"]').addClass('is-loading');
      }

      if (qty === 0) {
        row.addClass('is-removed');
      }

      // Slight delay to make sure removed animation is done
      setTimeout(function() {
        Shopify.changeItem(id, qty, function(cart){
          // this is a bad practise
          //var updatedItem = cart.items.filter(function(item){ return item.variant_id == id });
          if(qty == 0 || (updatedItem.length && updatedItem[0].quantity == qty))
            adjustCartCallback(cart);
          else
            jQuery('#ajaxcart__item__' + id + '__errors', $cartContainer).show().delay(5000).fadeOut();
        });
      }, 250);
    }

    // Save note anytime it's changed
    var noteArea = $('textarea[name="note"]');
    noteArea.off('change');
    noteArea.on('change', function() {
      var newNote = $(this).val();

      // Simply updating the cart note in case they don't click update/checkout
      Shopify.updateCartNote(newNote, function(cart) {});
    });

    

  };

  adjustCartCallback = function (cart) {
    // Update quantity and price
    updateCountPrice(cart);

    // Hide the modal or drawer if we're at 0 items
    if (cart.item_count === 0) {
      // Handle each add to cart method
      switch (settings.method) {
        case 'modal':
          break;
        case 'flip':
        case 'drawer':
          hideDrawer();
          break;
      }
    }

    // Reprint cart on short timeout so you don't see the content being removed
    setTimeout(function() {
      Shopify.getCart(buildCart);
    }, 150)
  };

  createQtySelectors = function() {
    // If there is a normal quantity number field in the ajax cart, replace it with our version
    if ($('input[type="number"]', $cartContainer).length) {
      $('input[type="number"]', $cartContainer).each(function() {
        var el = $(this),
            currentQty = el.val();

        var itemAdd = currentQty + 1,
            itemMinus = currentQty - 1,
            itemQty = currentQty;

        var source   = $("#AjaxifyQty").html(),
            template = Handlebars.compile(source),
            data = {
              id: el.data('id'),
              itemQty: itemQty,
              itemAdd: itemAdd,
              itemMinus: itemMinus
            };

        // Append new quantity selector then remove original
        el.after(template(data)).remove();
      });
    }

    // If there is a regular link to remove an item, add attributes needed to ajaxify it
    if ($('a[href^="/cart/change"]', $cartContainer).length) {
      $('a[href^="/cart/change"]', $cartContainer).each(function() {
        var el = $(this).addClass('ajaxcart__remove');
      });
    }
  };


  validateQty = function (qty) {
    // Make sure we have a valid integer
    if((parseFloat(qty) == parseInt(qty)) && !isNaN(qty)) {
      // We have a number!
    } else {
      // Not a number. Default to 1.
      qty = 1;
    }
    return qty;
  };

  scrollTop = function () {
    if ($body.scrollTop() > 0 || $html.scrollTop() > 0) {
      $('html, body').animate({
        scrollTop: 0
      }, 250, 'swing');
    }
  };

  toggleCallback = function (data) {
    // General data to send
    data.method = settings.method;

    // Run the callback if it's a function
    if (typeof settings.onToggleCallback == 'function') {
      settings.onToggleCallback.call(this, data);
    }
  };

  module = {
    init: init
  };

  return module;

}(ajaxifyShopify || {}, jQuery));
