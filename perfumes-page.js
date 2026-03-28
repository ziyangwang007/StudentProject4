
(function () {
  'use strict';
  var form = document.getElementById('perfume-filter-form');
  var grid = document.getElementById('perfume-grid');
  if (!form || !grid || !window.NOVA_STATIC) return;

  var products = window.NOVA_STATIC.products.slice();
  var categories = (window.NOVA_CATALOG.categories || []).reduce(function (acc, c) {
    acc[String(c.category_id)] = c.category;
    return acc;
  }, {});
  var categorySelect = document.getElementById('category');
  var sortSelect = document.getElementById('sort');
  var searchInput = document.getElementById('search');
  var clearBtn = document.getElementById('clear-filters');
  var summary = document.getElementById('perfume-results-summary');

  function escapeHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function defaultSize(product) {
    return (product.sizes || []).find(function (s) { return s.size_ml === product.default_size_ml; }) || (product.sizes || [])[0];
  }

  function cardHtml(product) {
    var size = defaultSize(product);
    return (
      '<article class="product-card" data-product-id="' + product.product_id + '">' +
        '<div class="product-img-wrapper">' +
          '<div class="product-actions">' +
            '<button type="button" class="card-icon fav-toggle" data-product-id="' + product.product_id + '" title="Add to favourites">' +
              '<span class="heart">♡</span>' +
            '</button>' +
            '<button type="button" class="card-icon cart-btn js-add-to-cart" data-product-id="' + product.product_id + '" data-size-ml="' + size.size_ml + '" title="Add to basket">&#128722;</button>' +
          '</div>' +
          '<img src="uploads/products/' + encodeURIComponent(product.image) + '" alt="' + escapeHtml(product.name) + '">' +
        '</div>' +
        '<div class="product-info">' +
          '<h3>' + escapeHtml(product.name) + '</h3>' +
          '<p class="product-category">' + escapeHtml(product.category) + '</p>' +
          '<p class="product-price">' + window.NOVA_STATIC.formatPrice(product.price) + '</p>' +
          '<div class="card-footer-line">' +
            '<div class="product-rating">No reviews yet</div>' +
            '<a href="product.html?id=' + product.product_id + '" class="view-btn">View</a>' +
          '</div>' +
        '</div>' +
      '</article>'
    );
  }

  function populateCategories() {
    var used = {};
    products.forEach(function (p) { used[String(p.category_id)] = p.category; });
    Object.keys(used).sort(function (a, b) {
      return used[a].localeCompare(used[b]);
    }).forEach(function (id) {
      var option = document.createElement('option');
      option.value = id;
      option.textContent = used[id];
      categorySelect.appendChild(option);
    });
  }

  function readStateFromUrl() {
    var params = new URLSearchParams(window.location.search);
    if (params.get('category')) categorySelect.value = params.get('category');
    if (params.get('sort')) sortSelect.value = params.get('sort');
    if (params.get('search')) searchInput.value = params.get('search');
  }

  function writeStateToUrl() {
    var params = new URLSearchParams();
    if (categorySelect.value && categorySelect.value !== 'all') params.set('category', categorySelect.value);
    if (sortSelect.value && sortSelect.value !== 'relevant') params.set('sort', sortSelect.value);
    if (searchInput.value.trim()) params.set('search', searchInput.value.trim());
    var q = params.toString();
    history.replaceState(null, '', 'perfumes.html' + (q ? '?' + q : ''));
  }

  function applyFilters() {
    var category = categorySelect.value;
    var sort = sortSelect.value;
    var search = searchInput.value.trim().toLowerCase();

    var filtered = products.filter(function (p) {
      var okCategory = category === 'all' || String(p.category_id) === String(category);
      var okSearch = !search || (
        p.name.toLowerCase().indexOf(search) !== -1 ||
        p.category.toLowerCase().indexOf(search) !== -1 ||
        (p.description || '').toLowerCase().indexOf(search) !== -1
      );
      return okCategory && okSearch;
    });

    filtered.sort(function (a, b) {
      switch (sort) {
        case 'price_low': return a.price - b.price;
        case 'price_high': return b.price - a.price;
        case 'name_az': return a.name.localeCompare(b.name);
        case 'name_za': return b.name.localeCompare(a.name);
        case 'newest': return b.product_id - a.product_id;
        default: return a.product_id - b.product_id;
      }
    });

    grid.innerHTML = filtered.map(cardHtml).join('') || '<p>No perfumes found for your filters/search.</p>';
    if (summary) summary.textContent = filtered.length + ' perfume' + (filtered.length === 1 ? '' : 's') + ' shown in this static demo.';
    window.NOVA_STATIC.applyFavouriteStates();
    document.querySelectorAll('.js-add-to-cart').forEach(function (btn) {
      btn.addEventListener('click', function () {
        window.NOVA_STATIC.addToCart(btn.getAttribute('data-product-id'), btn.getAttribute('data-size-ml') || 100, 1);
        window.NOVA_STATIC.showDemoNotice(btn.closest('.product-card') || btn, 'Added to bag.');
      });
    });
    document.querySelectorAll('.fav-toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        window.NOVA_STATIC.toggleFavourite(btn.getAttribute('data-product-id'));
      });
    });

    writeStateToUrl();
  }

  document.addEventListener('DOMContentLoaded', function () {
    populateCategories();
    readStateFromUrl();
    applyFilters();
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      applyFilters();
    });
    clearBtn.addEventListener('click', function () {
      categorySelect.value = 'all';
      sortSelect.value = 'relevant';
      searchInput.value = '';
      applyFilters();
    });
  });
})();
