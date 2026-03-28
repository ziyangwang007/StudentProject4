
(function () {
  'use strict';
  var root = document.querySelector('.product-page-container');
  if (!root || !window.NOVA_STATIC) return;

  var products = window.NOVA_STATIC.products;

  function escapeHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function getProductFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var id = params.get('id');
    return window.NOVA_STATIC.getProductById(id) || products[0];
  }

  function relatedProducts(product) {
    return products.filter(function (p) {
      return p.category_id === product.category_id && p.product_id !== product.product_id;
    }).slice(0, 3);
  }

  function renderCard(product) {
    var size = (product.sizes || []).find(function (s) { return s.size_ml === product.default_size_ml; }) || product.sizes[0];
    return (
      '<article class="product-card" data-product-id="' + product.product_id + '">' +
        '<div class="product-img-wrapper">' +
          '<div class="product-actions">' +
            '<button type="button" class="card-icon fav-toggle" data-product-id="' + product.product_id + '" title="Add to favourites"><span class="heart">♡</span></button>' +
            '<button type="button" class="card-icon cart-btn js-add-to-cart" data-product-id="' + product.product_id + '" data-size-ml="' + size.size_ml + '" title="Add to basket">&#128722;</button>' +
          '</div>' +
          '<img src="uploads/products/' + encodeURIComponent(product.image) + '" alt="' + escapeHtml(product.name) + '">' +
        '</div>' +
        '<div class="product-info">' +
          '<h3>' + escapeHtml(product.name) + '</h3>' +
          '<p class="product-category">From ' + window.NOVA_STATIC.formatPrice(product.price) + '</p>' +
          '<div class="card-footer-line"><a href="product.html?id=' + product.product_id + '" class="view-btn">View</a></div>' +
        '</div>' +
      '</article>'
    );
  }

  function sizeOptionHtml(size, selectedSizeMl) {
    var label = size.size_ml + ' ml';
    if (size.status === 'out_of_stock') label += ' – Out of stock';
    else if (size.status === 'low_stock') label += ' – Low stock (' + size.stock_qty + ' left)';
    return '<option value="' + size.size_ml + '" data-price="' + size.price + '" data-status="' + size.status + '" data-stock="' + size.stock_qty + '"' +
      (size.size_ml === selectedSizeMl ? ' selected' : '') + '>' + label + '</option>';
  }

  function renderProduct(product) {
    document.title = product.name;
    var html = '' +
      '<main class="product-page-container">' +
        '<section class="product-main">' +
          '<div class="product-gallery">' +
            '<div class="product-main-image">' +
              '<img id="main-product-image" src="uploads/products/' + encodeURIComponent(product.image) + '" alt="' + escapeHtml(product.name) + '">' +
            '</div>' +
            '<div class="product-thumbs">' +
              '<button type="button" class="product-thumb is-active">' +
                '<img src="uploads/products/' + encodeURIComponent(product.image) + '" alt="' + escapeHtml(product.name) + '">' +
              '</button>' +
            '</div>' +
          '</div>' +
          '<div class="product-summary" data-product-id="' + product.product_id + '">' +
            '<p class="product-category">' + escapeHtml(product.category) + '</p>' +
            '<h1>' + escapeHtml(product.name) + '</h1>' +
            '<p class="product-price product-price-large">£<span id="product-price-value">' + Number(product.price).toFixed(2) + '</span></p>' +
            '<div class="product-rating">No reviews yet</div>' +
            '<p class="info-paragraph">' + escapeHtml(product.short_description || product.description || '') + '</p>' +
            '<form class="product-purchase-form" data-product-purchase-form>' +
              '<label for="size-select">Size</label>' +
              '<select id="size-select" name="size">' +
                product.sizes.map(function (size) { return sizeOptionHtml(size, product.default_size_ml); }).join('') +
              '</select>' +
              '<p class="demo-stock-note" id="stock-note"></p>' +
              '<label for="qty">Quantity</label>' +
              '<input type="number" id="qty" name="quantity" min="1" value="1">' +
              '<div class="product-purchase-actions">' +
                '<button type="submit" class="btn-primary">Add to bag</button>' +
                '<button type="button" class="fav-toggle card-icon" data-product-id="' + product.product_id + '" title="Add to favourites"><span class="heart">♡</span></button>' +
              '</div>' +
            '</form>' +
          '</div>' +
        '</section>' +
        '<section class="product-info-section">' +
          '<h2 class="info-title">Product Information</h2>' +
          '<p class="info-paragraph">' + escapeHtml(product.short_description || product.description || '') + '</p>' +
          '<div class="info-block">' +
            '<p><strong>Top notes:</strong> ' + escapeHtml(product.top_notes || '') + '</p>' +
            '<p><strong>Heart notes:</strong> ' + escapeHtml(product.heart_notes || '') + '</p>' +
            '<p><strong>Base notes:</strong> ' + escapeHtml(product.base_notes || '') + '</p>' +
            '<p><strong>Launch:</strong> ' + escapeHtml(product.launch_info || '') + '</p>' +
          '</div>' +
          '<h3 class="info-subtitle">Scent story</h3>' +
          '<p class="info-paragraph">' + escapeHtml(product.scent_story || product.description || '') + '</p>' +
          '<h3 class="info-subtitle">Design story</h3>' +
          '<p class="info-paragraph">' + escapeHtml(product.design_story || '') + '</p>' +
        '</section>' +
        '<section class="related-products">' +
          '<h2 class="related-title">You may also like</h2>' +
          '<div class="products-grid">' + relatedProducts(product).map(renderCard).join('') + '</div>' +
        '</section>' +
        '<section id="reviews" class="product-reviews">' +
          '<h2>Customer reviews</h2>' +
          '<p>No reviews are included in this static GitHub demo.</p>' +
          '<div class="review-form-wrapper">' +
            '<h3>Write a review</h3>' +
            '<p class="demo-form-note">Reviews are disabled in the static version.</p>' +
            '<form class="review-form" data-demo-form="Reviews are disabled in this static demo.">' +
              '<label for="rating">Rating</label>' +
              '<select id="rating" disabled><option>Static demo only</option></select>' +
              '<label for="comment">Comment</label>' +
              '<textarea id="comment" rows="4" disabled></textarea>' +
              '<button type="submit" class="add-review-btn">Submit review</button>' +
            '</form>' +
          '</div>' +
        '</section>' +
      '</main>';

    root.outerHTML = html;
    wirePage(product);
  }

  function updatePriceAndStock(selectEl) {
    var option = selectEl.options[selectEl.selectedIndex];
    if (!option) return;
    var priceValue = document.getElementById('product-price-value');
    var stockNote = document.getElementById('stock-note');
    if (priceValue) priceValue.textContent = Number(option.getAttribute('data-price')).toFixed(2);
    if (stockNote) {
      var status = option.getAttribute('data-status');
      var stock = parseInt(option.getAttribute('data-stock') || '0', 10);
      if (status === 'out_of_stock') stockNote.textContent = 'This size is currently out of stock.';
      else if (status === 'low_stock') stockNote.textContent = 'Only ' + stock + ' left in stock.';
      else stockNote.textContent = 'In stock for dispatch.';
    }
  }

  function wirePage(product) {
    var selectEl = document.getElementById('size-select');
    if (selectEl) {
      updatePriceAndStock(selectEl);
      selectEl.addEventListener('change', function () {
        updatePriceAndStock(selectEl);
      });
    }

    var form = document.querySelector('[data-product-purchase-form]');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var sizeMl = parseInt(selectEl.value, 10);
        var qty = parseInt((document.getElementById('qty') || { value: 1 }).value || '1', 10);
        window.NOVA_STATIC.addToCart(product.product_id, sizeMl, qty);
        window.NOVA_STATIC.showDemoNotice(form, 'Added to bag.');
      });
    }

    window.NOVA_STATIC.applyFavouriteStates();
    document.querySelectorAll('.fav-toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        window.NOVA_STATIC.toggleFavourite(btn.getAttribute('data-product-id'));
      });
    });
    document.querySelectorAll('.js-add-to-cart').forEach(function (btn) {
      btn.addEventListener('click', function () {
        window.NOVA_STATIC.addToCart(btn.getAttribute('data-product-id'), btn.getAttribute('data-size-ml') || 100, 1);
        window.NOVA_STATIC.showDemoNotice(btn.closest('.product-card') || btn, 'Added to bag.');
      });
    });
    document.querySelectorAll('[data-demo-form]').forEach(function (demoForm) {
      demoForm.addEventListener('submit', function (e) {
        e.preventDefault();
        window.NOVA_STATIC.showDemoNotice(demoForm, demoForm.getAttribute('data-demo-form'));
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderProduct(getProductFromUrl());
  });
})();
