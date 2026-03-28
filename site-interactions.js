
(function () {
  'use strict';

  var catalog = window.NOVA_CATALOG || { products: [], categories: [], featuredIds: [] };
  var products = catalog.products || [];
  var productsById = {};
  products.forEach(function (p) { productsById[String(p.product_id)] = p; });

  function formatPrice(n) {
    return '£' + Number(n).toFixed(2);
  }

  function getProductById(id) {
    return productsById[String(id)] || null;
  }

  function getCart() {
    try { return JSON.parse(localStorage.getItem('novaCart') || '[]'); }
    catch (e) { return []; }
  }

  function saveCart(items) {
    localStorage.setItem('novaCart', JSON.stringify(items));
  }

  function addToCart(productId, sizeMl, qty) {
    var product = getProductById(productId);
    if (!product) return;
    var cart = getCart();
    qty = Math.max(1, parseInt(qty || 1, 10));
    sizeMl = parseInt(sizeMl, 10);
    var existing = cart.find(function (item) {
      return String(item.productId) === String(productId) && parseInt(item.sizeMl, 10) === sizeMl;
    });
    if (existing) existing.qty += qty;
    else cart.push({ productId: product.product_id, sizeMl: sizeMl, qty: qty });
    saveCart(cart);
  }

  function getFavourites() {
    try { return JSON.parse(localStorage.getItem('novaFavourites') || '[]'); }
    catch (e) { return []; }
  }

  function saveFavourites(items) {
    localStorage.setItem('novaFavourites', JSON.stringify(items));
  }

  function isFavourite(id) {
    return getFavourites().map(String).indexOf(String(id)) !== -1;
  }

  function toggleFavourite(id) {
    var favs = getFavourites().map(String);
    var idx = favs.indexOf(String(id));
    if (idx === -1) favs.push(String(id));
    else favs.splice(idx, 1);
    saveFavourites(favs);
    applyFavouriteStates();
  }

  function applyFavouriteStates() {
    document.querySelectorAll('.fav-toggle').forEach(function (btn) {
      var active = isFavourite(btn.getAttribute('data-product-id'));
      btn.classList.toggle('is-favourite', active);
      var heart = btn.querySelector('.heart');
      if (heart) heart.textContent = active ? '♥' : '♡';
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      btn.setAttribute('title', active ? 'Remove from favourites' : 'Add to favourites');
    });
  }

  function showDemoNotice(target, message) {
    if (!target) return;
    var note = document.createElement('div');
    note.className = 'demo-notice';
    note.textContent = message;
    var existing = target.parentNode.querySelector('.demo-notice');
    if (existing) existing.remove();
    target.insertAdjacentElement('afterend', note);
    setTimeout(function () {
      if (note && note.parentNode) note.parentNode.removeChild(note);
    }, 2600);
  }

  function wireDemoForms() {
    document.querySelectorAll('[data-demo-form]').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        showDemoNotice(form, form.getAttribute('data-demo-form') || 'This action is disabled in the static demo.');
      });
    });
  }

  function wireFavButtons() {
    document.querySelectorAll('.fav-toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-product-id');
        if (id) toggleFavourite(id);
      });
    });
  }

  function wireAddToCartButtons() {
    document.querySelectorAll('.js-add-to-cart').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var productId = btn.getAttribute('data-product-id');
        var sizeMl = btn.getAttribute('data-size-ml') || 100;
        addToCart(productId, sizeMl, 1);
        showDemoNotice(btn.closest('.product-card') || btn, 'Added to bag.');
      });
    });
  }

  function startTeamSlideshow() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.team-slide'));
    if (slides.length <= 1) return;
    var idx = 0;
    setInterval(function () {
      slides[idx].classList.remove('active');
      idx = (idx + 1) % slides.length;
      slides[idx].classList.add('active');
    }, 2800);
  }

  document.addEventListener('DOMContentLoaded', function () {
    applyFavouriteStates();
    wireFavButtons();
    wireAddToCartButtons();
    wireDemoForms();
    startTeamSlideshow();
  });

  window.NOVA_STATIC = {
    catalog: catalog,
    products: products,
    productsById: productsById,
    getProductById: getProductById,
    formatPrice: formatPrice,
    getCart: getCart,
    saveCart: saveCart,
    addToCart: addToCart,
    getFavourites: getFavourites,
    isFavourite: isFavourite,
    toggleFavourite: toggleFavourite,
    applyFavouriteStates: applyFavouriteStates,
    showDemoNotice: showDemoNotice
  };
})();
