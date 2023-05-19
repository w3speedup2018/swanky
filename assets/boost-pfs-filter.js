if (typeof boostPFSThemeConfig !== 'undefined') {
  // Override Settings
  var boostPFSFilterConfig = {
    general: {
      limit: boostPFSConfig.custom.products_per_page,
      // Optional
      loadProductFirst: true,
      stickyFixTopPos: true,
      // paginationType: boostPFSConfig.custom.pagination_type == 'infinite_scroll' ? 'infinite' :
      // 	(boostPFSConfig.custom.pagination_type == 'load_more' ? 'load_more' : 'default'),
    },
    template: {
      loadMoreLoading: '<div class="boost-pfs-filter-load-more-loading"><div class="load-more__icon" style="width: 44px; height: 44px; opacity: 1;"></div></div>'
    },
    selector: {
      breadcrumb: '.breadcrumb-collection'
    }
  };
}

(function() { // Add this
  BoostPFS.inject(this); // Add this

  // Build Product Grid Item
  ProductGridItem.prototype.compileTemplate = function(data, index) {
    if (!data) data = this.data;
    if (!index) index = this.index + 1;

    /*** Prepare data ***/
    var images = data.images_info;
    if (images.length > 0) {
      data.featured_image = images[0];
    } else {
      data.featured_image = {
        'height': 1,
        'width': 1
      }
    }
    // Displaying price base on the policy of Shopify, have to multiple by 100
    var soldOut = !data.available; // Check a product is out of stock
    var onSale = data.compare_at_price_min > data.price_min; // Check a product is on sale
    var priceVaries = data.price_min != data.price_max; // Check a product has many prices
    // Get First Variant (selected_or_first_available_variant)
    var firstVariant = data['variants'][0];
    if (Utils.getParam('variant') !== null && Utils.getParam('variant') != '') {
      var paramVariant = data.variants.filter(function(e) {
        return e.id == Utils.getParam('variant');
      });
      if (typeof paramVariant[0] !== 'undefined') firstVariant = paramVariant[0];
    } else {
      for (var iVariants = 0; iVariants < data['variants'].length; iVariants++) {
        if (data['variants'][iVariants].available) {
          firstVariant = data['variants'][iVariants];
          break;
        }
      }
    }
    /*** End Prepare data ***/

      // Get Template
    var itemHtml = boostPFSTemplate.productGridItemHtml;

    var onSaleClass = onSale ? 'sale' : '';
    //var soldOutClass = soldOut ? 'out_of_stock' : 'in_stock';
    //var availabilityProp = soldOut ? 'http://schema.org/SoldOut' : 'http://schema.org/InStock';

    // Add custom class
    var itemColumnNumberClass = '';
    var itemCollectionGroupLargeClass = '';
    var itemCollectionGroupMediumClass = '';
    var itemCollectionGroupSmallClass = (index - 1) % 2 == 0 ? 'even' : 'odd';

    switch (boostPFSConfig.custom.products_per_row) {
      case 2:
        itemColumnNumberClass = 'eight columns';
        break;
      case 3:
        itemColumnNumberClass = 'one-third column';
        break;
      case 4:
        itemColumnNumberClass = 'four columns';
        break;
      case 5:
        itemColumnNumberClass = 'one-fifth column';
        break;
      case 6:
        itemColumnNumberClass = 'one-sixth column';
        break;
      default:
        itemColumnNumberClass = 'one-seventh column';
        break;
    }

    if (boostPFSConfig.custom.mobile_products_per_row == 1) {
      itemColumnNumberClass += ' medium-down--one-half small-down--one-whole';
    } else {
      itemColumnNumberClass += ' medium-down--one-half small-down--one-half';
    }

    itemHtml = itemHtml.replace(/{{itemColumnNumberClass}}/g, itemColumnNumberClass);
    itemHtml = itemHtml.replace(/{{itemCollectionGroupLargeClass}}/g, itemCollectionGroupLargeClass);
    itemHtml = itemHtml.replace(/{{itemCollectionGroupMediumClass}}/g, itemCollectionGroupMediumClass);
    itemHtml = itemHtml.replace(/{{itemCollectionGroupSmallClass}}/g, itemCollectionGroupSmallClass);
    itemHtml = itemHtml.replace(/{{quickShopStyle}}/g, boostPFSConfig.custom.quick_shop_style);

    // Add soldOut label
    var itemSoldOutLabel = soldOut ? boostPFSTemplate.soldOutLabelHtml : '';
    itemHtml = itemHtml.replace(/{{itemSoldOutLabel}}/g, itemSoldOutLabel);

    // Add onSale label
    var itemSaleLabel = boostPFSConfig.custom.sale_banner_enabled && onSale ? boostPFSTemplate.saleLabelHtml : '';
    itemHtml = itemHtml.replace(/{{itemSaleLabel}}/g, itemSaleLabel);

    // Add Label (New, Coming soon, Pre order)
    var newLabel = data.collections.filter(function(e) {
      return e.handle == 'new';
    });
    var preorderLabel = data.collections.filter(function(e) {
      return e.handle == 'pre-order';
    });
    var comingsoonLabel = data.collections.filter(function(e) {
      return e.handle == 'coming-soon';
    });
    if (data.collections) {
      var itemNewLabelHtml = typeof newLabel[0] != 'undefined' ? boostPFSTemplate.newLabelHtml : '';
      itemHtml = itemHtml.replace(/{{itemNewLabel}}/g, itemNewLabelHtml);

      var itemComingsoonLabelHtml = typeof comingsoonLabel[0] != 'undefined' ? boostPFSTemplate.comingsoonLabelHtml : '';
      itemHtml = itemHtml.replace(/{{itemComingsoonLabel}}/g, itemComingsoonLabelHtml);

      var itemPreorderLabelHtml = typeof preorderLabel[0] != 'undefined' ? boostPFSTemplate.preorderLabelHtml : '';
      itemHtml = itemHtml.replace(/{{itemPreorderLabel}}/g, itemPreorderLabelHtml);
    }

    var itemHiddenClass = boostPFSConfig.custom.thumbnail_hover_enabled ? 'hidden' : '';
    itemHtml = itemHtml.replace(/{{itemHiddenClass}}/g, itemHiddenClass);

    var flipImageClass = boostPFSConfig.custom.secondary_image && images.length > 1 ? 'has-secondary-media-swap' : '';
    itemHtml = itemHtml.replace(/{{flipImageClass}}/, flipImageClass);


    //Render image-element
    var itemImagesHtml = buildImageElement(data);
    itemHtml = itemHtml.replace(/{{itemImages}}/g, itemImagesHtml);


    // Build Product Info when hovering
    var itemProductInfoHoverHtml = '';
    if (boostPFSConfig.custom.thumbnail_hover_enabled || (boostPFSConfig.custom.quick_shop_enabled && boostPFSConfig.custom.quick_shop_style == 'popup')) {
      itemProductInfoHoverHtml = '<div class="thumbnail-overlay">' +
        '<a href="{{itemUrl}}" itemprop="url" class="hidden-product-link">{{itemTitle}}</a>' +
        '<div class="info">' +
        (boostPFSConfig.custom.thumbnail_hover_enabled ? '{{itemProductInfo}}' : '') +
        '</div>' +
        '</div>';
    }
    if (boostPFSConfig.custom.sale_banner_enabled) {
      itemProductInfoHoverHtml += '<div class="price-ui-badges price-ui-badges--' + boostPFSConfig.custom.sticker_style + '">';
      itemProductInfoHoverHtml += '<div class="price-ui-badge price-ui-badge--loading" data-price-ui-badge>' +
        '<noscript>' +
        '<style>' +
        '.price-ui-badge--loading {' +
        '  display: block !important;' +
        '  opacity: 1 !important;' +
        '}' +
        '</style>' +
        '</noscript>';
      if (soldOut) {
        itemProductInfoHoverHtml += '<div class="price-ui-badge__sticker"><span class="price-ui-badge__sticker-text" data-badge>' + boostPFSConfig.label.sold_out + '</span></div>';
      } else if (onSale) {
        itemProductInfoHoverHtml += '<div class="price-ui-badge__sticker"><span class="price-ui-badge__sticker-text" data-badge>' + boostPFSConfig.label.sale + '</span></div>';
      }
      itemProductInfoHoverHtml += '</div>';
      if (boostPFSConfig.general.collection_handle.indexOf('new') !== -1) {
        itemProductInfoHoverHtml += '<div class="price-ui-badge price-ui-badge--new">' +
          '<div class="price-ui-badge__sticker price-ui-badge__sticker--new">' +
          '<span class="price-ui-badge__sticker-text price-ui-badge__sticker-text--new">' + boostPFSConfig.label.new + '</span>'
        '</div>' +
        '</div>'
      }

      if (boostPFSConfig.general.collection_handle.indexOf('pre-order') !== -1) {
        itemProductInfoHoverHtml += '<div class="price-ui-badge price-ui-badge--new">' +
          '<div class="price-ui-badge__sticker price-ui-badge__sticker--new">' +
          '<span class="price-ui-badge__sticker-text price-ui-badge__sticker-text--new">' + boostPFSConfig.label.pre_order + '</span>'
        '</div>' +
        '</div>'
      }

      itemProductInfoHoverHtml += '</div>';
    }
    itemHtml = itemHtml.replace(/{{itemProductInfoHover}}/g, itemProductInfoHoverHtml);


    // Build Product Info (product-info.liquid)
    var itemProductInfoHtml = '<div class="product-details">';
    itemProductInfoHtml += '<span class="title" itemprop="name">{{itemTitle}}</span>';
    itemProductInfoHtml += '{{itemVendor}}';
    itemProductInfoHtml += '{{itemReviews}}';
    itemProductInfoHtml += '{{itemPrice}}';
    itemProductInfoHtml += '</div>';
    itemHtml = itemHtml.replace(/{{itemProductInfo}}/g, itemProductInfoHtml);

    // Add Vendor
    var itemVendorHtml = '';
    if (boostPFSConfig.custom.vendor_enable) {
      itemVendorHtml = '<span class="brand">' + data.vendor + '</span>';
    }
    itemHtml = itemHtml.replace(/{{itemVendor}}/g, itemVendorHtml);

    // Add Reviews
    if (typeof Integration === 'undefined' || !Integration.hascompileTemplate('reviews')) {
      var itemReviewHtml = '';
      if (boostPFSConfig.custom.enable_shopify_collection_badges) {
        itemReviewHtml += '<div class="shopify-reviews reviewsVisibility--' + boostPFSConfig.custom.enable_shopify_review_comments + '">';
        itemReviewHtml += '<span class="shopify-product-reviews-badge" data-id="{{itemId}}"></span>';
        itemReviewHtml += '</div>';
      }
      itemHtml = itemHtml.replace(/{{itemReviews}}/g, itemReviewHtml);
    }

    // Add Price
    var itemPriceHtml = '';
    if (typeof comingsoonLabel[0] !== 'undefined') {
      itemPriceHtml += '<span class="coming-soon">' + boostPFSConfig.label.coming_soon + '</span>';
    } else {
      itemPriceHtml += '<span class="price ' + onSaleClass + '">';
      if (!soldOut || boostPFSConfig.custom.display_price) {
        itemPriceHtml += '<span class="current_price">';
        if (priceVaries && data.price_min > 0) {
          itemPriceHtml += '<small><em>' + boostPFSConfig.label.from_price + '</em></small> ';
        }
        if (data.price_min > 0) {
          if (boostPFSConfig.custom.currency_format == 'money_with_currency_format') {
            itemPriceHtml += Utils.formatMoney(data.price_min) + ' ' + Globals.defaultCurrency;
          } else {
            itemPriceHtml += Utils.formatMoney(data.price_min);
          }
        } else {
          itemPriceHtml += boostPFSConfig.label.free_price;
        }
        itemPriceHtml += "</span>";


        itemPriceHtml += ' <span class="was_price"><span class="money">';
        if (onSale) {
          if (boostPFSConfig.custom.currency_format == 'money_with_currency_format') {
            itemPriceHtml += Utils.formatMoney(data.compare_at_price_max) + ' ' + Globals.defaultCurrency;
          } else {
            itemPriceHtml += Utils.formatMoney(data.compare_at_price_max);
          }
        }
        itemPriceHtml += ' </span></span>';
      }

      itemPriceHtml += '<div class="sold-out">';
      if (soldOut) {
        itemPriceHtml += boostPFSConfig.label.sold_out_text;
      }
      itemPriceHtml += ' </div>';
    }
    itemHtml = itemHtml.replace(/{{itemPrice}}/g, itemPriceHtml);

    // Add Swatches
    var itemColorSwatchesHtml = '';
    if (boostPFSConfig.custom.collection_swatches) {
      for (var k = 0; k < data.options.length; k++) {
        var option = data['options'][k];
        var downcasedOption = option.toLowerCase();
        var colorTypes = ['color', 'colour'];
        if (colorTypes.indexOf(downcasedOption) > -1) {
          var option_index = k;
          var values = [];
          itemColorSwatchesHtml += '<div class="collection_swatches">';
          for (var i = 0; i < data.variants.length; i++) {
            var variant = data['variants'][i];
            var value = variant['options'][option_index];
            if (values.indexOf(value) == -1) {
              /*
               var values = values.join(',');
               values += ',' + value;
               values = values.split(',');
               */
              values.push(value);
              var fileColorUrl = boostPFSConfig.general.asset_url.replace('boost-pfs.js', Utils.slugify(value) + '.png');
              fileColorUrl = Utils.optimizeImage(fileColorUrl, '50x');
              itemColorSwatchesHtml += '<a href="' + Utils.buildProductItemUrl(data) + '?variant=' + variant.id + '" class="swatch" data-swatch-name="meta-' + downcasedOption + '_' + (value.replace(/\s/g, '_')).toLowerCase() + '">';
              itemColorSwatchesHtml += '<span ';
              if (boostPFSConfig.custom.products_per_row == 2) {
                itemColorSwatchesHtml += 'data-image="' + Utils.optimizeImage(variant.image, '600x') + '" ';
              } else if (boostPFSConfig.custom.products_per_row == 3) {
                itemColorSwatchesHtml += 'data-image="' + Utils.optimizeImage(variant.image, '500x') + '" ';
              } else {
                itemColorSwatchesHtml += 'data-image="' + Utils.optimizeImage(variant.image, '400x') + '" ';
              }
              itemColorSwatchesHtml += 'style="background-image: url(' + fileColorUrl + '); background-color: ' + Utils.slugify(value.split(' ').pop()) + ';">';
              itemColorSwatchesHtml += '</span>';
              itemColorSwatchesHtml += '</a>';
            }
          }
          itemColorSwatchesHtml += '</div>';
        }
      }
    }

    if (!(boostPFSConfig.custom.quick_shop_style == 'inline' && boostPFSConfig.custom.quick_shop_enabled)) {
      itemHtml = itemHtml.replace(/{{itemColorSwatchesInline}}/g, itemColorSwatchesHtml);
    } else {
      itemHtml = itemHtml.replace(/{{itemColorSwatchesInline}}/g, '');
    }

    // Add main attribute
    itemHtml = itemHtml.replace(/{{itemId}}/g, data.id);
    itemHtml = itemHtml.replace(/{{itemHandle}}/g, data.handle);
    itemHtml = itemHtml.replace(/{{itemTitle}}/g, data.title);
    itemHtml = itemHtml.replace(/{{itemUrl}}/g, Utils.buildProductItemUrlWithVariant(data));

    return itemHtml;
  };

  // Build Image Element image-element
  //{% render 'image-element' %} -- product-thumbnail.liquid
  function buildImageElement(data) {
    var images = data.images_info;
    var maxHeight = boostPFSConfig.custom.collection_height;
    var imageWidth = 900,
      imageHeight = 900;
    if (images.length > 0) {
      imageWidth = data.featured_image.width;
      imageHeight = data.featured_image.height;
    }


    var lowQualityImage = null;
    if (boostPFSConfig.custom.image_loading_style == 'blur-up') {
      lowQualityImage = Utils.getFeaturedImage(images, '50x');
    }

    var backgroundColor = '';
    var crop_to_aspect_ratio = '';
    if (boostPFSConfig.custom.image_loading_style == 'color') {
      var dominantColorImage = Utils.getFeaturedImage(images, '1x');

      var object_fit = boostPFSConfig.custom.align_height;
      if (object_fit) {
        crop_to_aspect_ratio = 'max-height: ' + maxHeight + 'px; width: calc(' + imageWidth + ' /  ' + imageHeight + ' * ' + maxHeight + 'px);';
      }

      backgroundColor = 'background: url(' + dominantColorImage + ');';
    }

    // Get Thumbnail url
    var itemThumbUrl = Utils.getFeaturedImage(images, boostPFSConfig.custom.image_loading_style == 'blur-up' ? '50x' : '100x');

    // Get image source
    var itemImageSrc = '';
    if (lowQualityImage) {
      itemImageSrc += 'src="' + lowQualityImage + '"';
    }
    itemImageSrc += 'data-src="' + Utils.getFeaturedImage(images, '1600x') + '" ';
    itemImageSrc += 'data-srcset=" ' + Utils.getFeaturedImage(images, '5000x') + ' 5000w,';
    itemImageSrc += Utils.getFeaturedImage(images, '4500x') + ' 4500w, ';
    itemImageSrc += Utils.getFeaturedImage(images, '4000x') + ' 4000w, ';
    itemImageSrc += Utils.getFeaturedImage(images, '3500x') + ' 3500w, ';
    itemImageSrc += Utils.getFeaturedImage(images, '3000x') + ' 3000w, ';
    itemImageSrc += Utils.getFeaturedImage(images, '2000x') + ' 2000w, ';
    itemImageSrc += Utils.getFeaturedImage(images, '1800x') + ' 1800w, ';
    itemImageSrc += Utils.getFeaturedImage(images, '1600x') + ' 1600w, ';
    itemImageSrc += Utils.getFeaturedImage(images, '1400x') + ' 1400w, ';
    itemImageSrc += Utils.getFeaturedImage(images, '1200x') + ' 1200w, ';
    itemImageSrc += Utils.getFeaturedImage(images, '1000x') + ' 1000w, ';
    itemImageSrc += Utils.getFeaturedImage(images, '800x') + ' 800w, ';
    itemImageSrc += Utils.getFeaturedImage(images, '600x') + ' 600w, ';
    itemImageSrc += Utils.getFeaturedImage(images, '400x') + ' 400w, ';
    itemImageSrc += Utils.getFeaturedImage(images, '200x') + ' 200w" ';

    // Get Flip image url
    var itemFlipImageUrl = images.length > 1 ? Utils.optimizeImage(images[1]['src']) : Utils.getFeaturedImage(images, '900x');


    // Compile Template
    var itemImagesHtml = '<div class="image__container">';
    itemImagesHtml += '<div class="image-element__wrap" style="' + backgroundColor + ' ' + crop_to_aspect_ratio + ((!object_fit) ? 'max-width: ' + imageWidth + 'px;' : '') + '">';
    itemImagesHtml += '<img ' +
      ' alt="{{itemTitle}}" ' +
      ' data-sizes="auto" ' +
      ' data-aspectratio="' + imageWidth / imageHeight + '" ' +
      ' height="' + imageHeight + '" ' +
      ' width="' + imageWidth + '" ' +
      ' style="" ' +
      ' class="lazyload transition--' + boostPFSConfig.custom.image_loading_style + '"' +
      ' srcset="data:image/svg+xml;utf8,<svg%20xmlns=\'http://www.w3.org/2000/svg\'%20width=\'' + imageWidth + '\'%20height=\'' + imageHeight + '\'></svg>" ' +
      itemImageSrc + '/>';
    itemImagesHtml += '</div>';
    itemImagesHtml += '<noscript>';
    itemImagesHtml += '<img src="' + Utils.getFeaturedImage(images, '2000x') + '" alt="{{itemTitle}}" class="noscript">';
    itemImagesHtml += '</noscript>';
    itemImagesHtml += '</div>';

    // Add Flip Image
    if (boostPFSConfig.custom.secondary_image && images.length > 1) {
      // Get image source
      var itemFlipImageSrc = 'data-src="' + Utils.optimizeImage(images[1]['src'], '1600x') + '" ';
      itemFlipImageSrc += 'data-srcset=" ' + Utils.optimizeImage(images[1]['src'], '5000x') + ' 5000w, ';
      itemFlipImageSrc += Utils.optimizeImage(images[1]['src'], '4500x') + ' 4500w, ';
      itemFlipImageSrc += Utils.optimizeImage(images[1]['src'], '4000x') + ' 4000w, ';
      itemFlipImageSrc += Utils.optimizeImage(images[1]['src'], '3000x') + ' 3000w, ';
      itemFlipImageSrc += Utils.optimizeImage(images[1]['src'], '2000x') + ' 2000w, ';
      itemFlipImageSrc += Utils.optimizeImage(images[1]['src'], '1800x') + ' 1800w, ';
      itemFlipImageSrc += Utils.optimizeImage(images[1]['src'], '1600x') + ' 1600w, ';
      itemFlipImageSrc += Utils.optimizeImage(images[1]['src'], '1400x') + ' 1400w, ';
      itemFlipImageSrc += Utils.optimizeImage(images[1]['src'], '1200x') + ' 1200w, ';
      itemFlipImageSrc += Utils.optimizeImage(images[1]['src'], '1000x') + ' 1000w, ';
      itemFlipImageSrc += Utils.optimizeImage(images[1]['src'], '800x') + ' 800w, ';
      itemFlipImageSrc += Utils.optimizeImage(images[1]['src'], '600x') + ' 600w, ';
      itemFlipImageSrc += Utils.optimizeImage(images[1]['src'], '400x') + ' 400w, ';
      itemFlipImageSrc += Utils.optimizeImage(images[1]['src'], '200x') + ' 200w" ';
      itemImagesHtml += '<div class="image__container">';
      itemImagesHtml += '<div class="image-element__wrap" style="width:';
      if (images.length > 1) {
        itemImagesHtml += images[1]['width'] + 'px">';
      } else {
        itemImagesHtml += data.featured_image.width + 'px">';
      }
      itemImagesHtml += '<img src="' + itemFlipImageUrl + '" ';
      itemImagesHtml += 'class="lazyload transition--blur-up secondary lazypreload lazyautosizes secondary-media-hidden" alt="{{itemTitle}}" data-sizes="auto" ' + itemFlipImageSrc + '/>';
      itemImagesHtml += '</div>';
      itemImagesHtml += '</div>';
    }
    return itemImagesHtml;
  }

  // Build Pagination
  ProductPaginationDefault.prototype.compileTemplate = function(totalProduct) {
    // Get page info
    if (!totalProduct) totalProduct = this.totalProduct;
    var currentPage = parseInt(Globals.queryParams.page);
    var totalPage = Math.ceil(totalProduct / Globals.queryParams.limit);

    if (totalPage > 1) {
      var paginationHtml = boostPFSTemplate.paginateHtml;

      // Build Previous
      var previousHtml = (currentPage > 1) ? boostPFSTemplate.previousHtml : '';
      previousHtml = previousHtml.replace(/{{itemUrl}}/g, Utils.buildToolbarLink('page', currentPage, currentPage - 1));
      paginationHtml = paginationHtml.replace(/{{previous}}/g, previousHtml);

      // Build Next
      var nextHtml = (currentPage < totalPage) ? boostPFSTemplate.nextHtml : '';
      nextHtml = nextHtml.replace(/{{itemUrl}}/g, Utils.buildToolbarLink('page', currentPage, currentPage + 1));
      paginationHtml = paginationHtml.replace(/{{next}}/g, nextHtml);

      // Create page items array
      var beforeCurrentPageArr = [];
      for (var iBefore = currentPage - 1; iBefore > currentPage - 3 && iBefore > 0; iBefore--) {
        beforeCurrentPageArr.unshift(iBefore);
      }
      if (currentPage - 4 > 0) {
        beforeCurrentPageArr.unshift('...');
      }
      if (currentPage - 4 >= 0) {
        beforeCurrentPageArr.unshift(1);
      }
      beforeCurrentPageArr.push(currentPage);

      var afterCurrentPageArr = [];
      for (var iAfter = currentPage + 1; iAfter < currentPage + 3 && iAfter <= totalPage; iAfter++) {
        afterCurrentPageArr.push(iAfter);
      }
      if (currentPage + 3 < totalPage) {
        afterCurrentPageArr.push('...');
      }
      if (currentPage + 3 <= totalPage) {
        afterCurrentPageArr.push(totalPage);
      }

      // Build page items
      var pageItemsHtml = '';
      var pageArr = beforeCurrentPageArr.concat(afterCurrentPageArr);
      for (var iPage = 0; iPage < pageArr.length; iPage++) {
        if (pageArr[iPage] == '...') {
          pageItemsHtml += boostPFSTemplate.pageItemRemainHtml;
        } else {
          pageItemsHtml += (pageArr[iPage] == currentPage) ? boostPFSTemplate.pageItemSelectedHtml : boostPFSTemplate.pageItemHtml;
        }
        pageItemsHtml = pageItemsHtml.replace(/{{itemTitle}}/g, pageArr[iPage]);
        pageItemsHtml = pageItemsHtml.replace(/{{itemUrl}}/g, Utils.buildToolbarLink('page', currentPage, pageArr[iPage]));
      }
      paginationHtml = paginationHtml.replace(/{{pageItems}}/g, pageItemsHtml);

      return paginationHtml;
    }
    return '';
  };

  ProductPaginationLoadMore.prototype.compileTotalTemplate = function() {
    /**
     * If enable the Load previous feature and the evnet type is page:
     * => Get the next loading page is from session storage OR get the next loading page from query param
     */
    if (Utils.isLoadPreviousPagePaginationType() && this.parent.eventType == 'page') {
      this.nextPage = parseInt(window.sessionStorage.getItem(this.settings.sessionStorageCurrentNextPage));
    } else {
      this.nextPage = Globals.queryParams.page;
    }
    // Set from index
    var from = (this.nextPage - 1) * Globals.queryParams.limit + 1;
    if (jQ(Selector.products + ' > div').length) {
      from -= jQ(Selector.products + ' > div').length - Globals.queryParams.limit;
    }
    // Set to index
    var product_index = (this.nextPage - 1) * Globals.queryParams.limit + 1;
    var to = product_index + this.data.products.length - 1;
    this.toProduct = to;

    return this.getTemplate('total')
      .replace(/{{progressLabel}}/g, Labels.loadMoreTotal)
      .replace(/{{ from }}/g, from)
      .replace(/{{ to }}/g, to)
      .replace(/{{ total }}/g, this.totalProduct)
      .replace(/{{class.productLoadMore}}/g, Class.productLoadMore)
  };

  // Build Sorting
  ProductSorting.prototype.compileTemplate = function() {
    if (boostPFSTemplate.hasOwnProperty('sortingHtml')) {

      var sortingArr = Utils.getSortingList();
      if (sortingArr) {
        // Build content
        var sortingItemsHtml = '';
        for (var k in sortingArr) {
          if (sortingArr.hasOwnProperty(k)) {
            sortingItemsHtml += '<option value="' + k + '">' + sortingArr[k] + '</option>';
          }
        }

        return boostPFSTemplate.sortingHtml.replace(/{{sortingItems}}/g, sortingItemsHtml);
      }
    }
    return '';
  };

  // Sorting render
  ProductSorting.prototype.render = function() {
    jQ(Selector.topSorting).html(this.compileTemplate());
    var $selectInput = jQ(Selector.topSorting);
    if ($selectInput.length) {
      $selectInput.val(Globals.queryParams.sort);
    }
  };

  // Build Sorting event
  ProductSorting.prototype.bindEvents = function() {
    //var _this = this;
    jQ(Selector.topSorting).off('change');
    jQ(Selector.topSorting).change(function(e) {
      // Append "sort" param to url
      // Used to Scroll to the previous position after returning from Product page
      FilterApi.setParam('sort', jQ(this).val());
      FilterApi.setParam('page', 1);
      FilterApi.applyFilter('sort');
    })
  };

  // Build Breadcrumb
  Breadcrumb.prototype.compileTemplate = function(colData) {
    if (!colData) colData = this.collectionData;
    if (typeof colData !== 'undefined' && colData.hasOwnProperty('collection')) {
      var colInfo = colData.collection;

      var breadcrumbHtml = '<span ><a href="' + boostPFSConfig.shop.url + '" title="' + boostPFSConfig.shop.name + '" class="breadcrumb_link"><span>' + boostPFSConfig.label.breadcrumb_home + '</span></a></span> ';
      breadcrumbHtml += '<span class="breadcrumb-divider">/</span> ' +
        '<span><a href="{{currentCollectionLink}}" title="{{currentCollectionTitle}}" class="breadcrumb_link"><span>{{currentCollectionTitle}}</span></a></span> ';
      // Build Tags
      var currentTagsHtml = '';
      if (Array.isArray(boostPFSConfig.general.current_tags)) {
        var current_tags = boostPFSConfig.general.current_tags;
        for (var k = 0; k < current_tags.length; k++) {
          var tag = current_tags[k];
          currentTagsHtml += '<span class="breadcrumb-divider">/</span>';
          currentTagsHtml += '<span><a href="/collections/{{currentCollectionLink}}/' + Utils.slugify(tag) + '" title="' + tag + '"><span>' + tag + '</span></a></span>';
        }
      }
      breadcrumbHtml += currentTagsHtml;
      // Build Collection Info
      breadcrumbHtml = breadcrumbHtml.replace(/{{currentCollectionLink}}/g, '/collections/' + colInfo.handle).replace(/{{currentCollectionTitle}}/g, colInfo.title);
      // Top Pagination
      breadcrumbHtml += ' <span class="boost-pfs-filter-top-pagination"></span>';
      return breadcrumbHtml;
    }
    return '';
  };

  // Call Theme function to Build additional elements for Product list
  ProductList.prototype.afterRender = function(data) {
    // Build Quick view data
    if (!data) data = this.data;
    if (boostPFSConfig.custom.quick_shop_enabled) {
      this.buildExtrasProductListByAjax(data, 'boost-pfs-quickview', function(results) {
        results.forEach(function(result) {
          var element = '';
          if (boostPFSConfig.custom.quick_shop_style == 'inline') {
            element = jQ('[data-boost-theme-quickview="' + result.id + '"]');
            if (element.find('.js-quick-shop-link').length == 0) {
              element.append(result.quickview);
            }
          } else {
            element = jQ('[data-boost-theme-quickview="' + result.id + '"] div.info');
            if (element.find('.js-quick-shop-link').length == 0) {
              element.append(result.quickview);
            }
          }
        });
        buildTheme();
      });
    }
  };

  // Build Additional elements
  Filter.prototype.afterRender = function(data) {
    if (!data) data = this.data;
    // Remove InstantClick
    jQ(Selector.filterTree).find('a').attr('data-no-instant', '');

    // Remove product wrapper
    if (jQ(Selector.products).children().hasClass('product-list')) {
      jQ(Selector.products).children().children().unwrap();
    }

    // Build top pagination
    var totalPage = Math.ceil(data.total_product / Globals.queryParams.limit);
    var topPaginationHtml = '<span class="breadcrumb-divider">/</span> ' + (boostPFSConfig.label.breadcrumb_page).replace(/{{ current_page }}/g, Globals.queryParams.page).replace(/{{ pages }}/g, totalPage);
    jQ('.boost-pfs-filter-top-pagination').html(topPaginationHtml);
    jQ(".load-more__icon").remove();

    buildTheme();
  };

  function buildTheme() {
    // From Turbo 7.0.1, using window.PXUTheme instead of Shopify.theme_settings
    if (typeof Shopify.theme_settings !== "undefined") {
      if ((Shopify.theme_settings.enable_shopify_review_comments || Shopify.theme_settings.enable_shopify_collection_badges) && window.SPR) {
        SPR.registerCallbacks();
        SPR.initRatingHandler();
        SPR.initDomEls();
        SPR.loadProducts();
        SPR.loadBadges();
      }
      if (Shopify.theme_settings.show_multiple_currencies && typeof convertCurrencies == 'function') {
        convertCurrencies();
      }

      if (Shopify.theme_settings.quick_shop_enabled &&
        typeof quickShop != 'undefined' &&
        typeof quickShop.init == 'function') {
        quickShop.init();
      }
    } else {
      if (window.PXUTheme && window.PXUTheme.hasOwnProperty('theme_settings')) {
        if ((window.PXUTheme.theme_settings.enable_shopify_review_comments || window.PXUTheme.theme_settings.enable_shopify_collection_badges) && window.SPR) {
          if($('#shopify-product-reviews').length >= 1) {
            SPR.$(document).ready(function() {
              return SPR.registerCallbacks(),
                SPR.initRatingHandler(),
                SPR.initDomEls(),
                SPR.loadProducts(),
                SPR.loadBadges()
            })
          }
        }
        if (window.PXUTheme.currency.show_multiple_currencies || window.PXUTheme.currency.native_multi_currency) {
          window.currencyConverter.init();
        }
        if (window.PXUTheme.quick_shop_enabled &&
          typeof window.quickShop != 'undefined' &&
          typeof window.quickShop.init == 'function') {
          window.quickShop.init();
        }
      }
    }

    if (typeof imageFunctions != 'undefined' && typeof imageFunctions.showSecondaryImage == 'function') {
      imageFunctions.showSecondaryImage();
    }

    // Initialize shopify payment buttons
    if (Shopify.PaymentButton) {
      Shopify.PaymentButton.init();
    }

    if (typeof productPage != 'undefined' && typeof productPage.init == 'function') {
      productPage.init();
    }

    if (typeof hideNoScript == 'function') {
      hideNoScript();
    }
  }

})(); // Add this at the end
