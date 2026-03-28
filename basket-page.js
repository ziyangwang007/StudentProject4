
(function () {
  'use strict';
  var box = document.getElementById('basket-products-box');
  var summaryBox = document.getElementById('basket-summary-box');
  if (!box || !summaryBox || !window.NOVA_STATIC) return;

  function render() {
    var cart = window.NOVA_STATIC.getCart();
    var subtotal = 0;

    if (!cart.length) {
      box.innerHTML =
        '<div class="basket-empty">' +
          '<p>Your bag is empty.</p>' +
          '<p><a href="perfumes.html" class="hero-btn basket-empty-cta">Explore perfumes</a></p>' +
        '</div>';
    } else {
      box.innerHTML = cart.map(function (item, index) {
        var product = window.NOVA_STATIC.getProductById(item.productId);
        if (!product) return '';
        var size = (product.sizes || []).find(function (s) { return parseInt(s.size_ml, 10) === parseInt(item.sizeMl, 10); }) || product.sizes[0];
        var lineTotal = Number(size.price) * Number(item.qty);
        subtotal += lineTotal;
        return (
          '<div class="basket-item">' +
            '<img src="uploads/products/' + encodeURIComponent(product.image) + '" alt="' + product.name.replace(/"/g, '&quot;') + '">' +
            '<div>' +
              '<div class="basket-item-title">' + product.name + '</div>' +
              '<div class="basket-item-size">' + size.size_ml + ' ml · ' + window.NOVA_STATIC.formatPrice(size.price) + '</div>' +
              '<div class="basket-qty-controls">' +
                '<button type="button" class="basket-qty-btn" data-action="decrease" data-index="' + index + '">−</button>' +
                '<span>Qty ' + item.qty + '</span>' +
                '<button type="button" class="basket-qty-btn" data-action="increase" data-index="' + index + '">+</button>' +
              '</div>' +
            '</div>' +
            '<div>' +
              '<div class="basket-item-title">' + window.NOVA_STATIC.formatPrice(lineTotal) + '</div>' +
              '<button type="button" class="basket-remove-btn" data-action="remove" data-index="' + index + '">Remove</button>' +
            '</div>' +
          '</div>'
        );
      }).join('');
    }

    var shipping = cart.length ? (subtotal >= 100 ? 0 : 4.99) : 0;
    var total = subtotal + shipping;

    document.getElementById('basket-subtotal').textContent = window.NOVA_STATIC.formatPrice(subtotal);
    document.getElementById('basket-shipping').textContent = window.NOVA_STATIC.formatPrice(shipping);
    document.getElementById('basket-total').textContent = window.NOVA_STATIC.formatPrice(total);

    wireButtons();
  }

  function wireButtons() {
    box.querySelectorAll('[data-action]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var cart = window.NOVA_STATIC.getCart();
        var index = parseInt(btn.getAttribute('data-index'), 10);
        var item = cart[index];
        if (!item) return;
        var action = btn.getAttribute('data-action');
        if (action === 'remove') {
          cart.splice(index, 1);
        } else if (action === 'increase') {
          item.qty += 1;
        } else if (action === 'decrease') {
          item.qty = Math.max(1, item.qty - 1);
        }
        window.NOVA_STATIC.saveCart(cart);
        render();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    render();
    var checkoutBtn = document.getElementById('basket-checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', function () {
        window.NOVA_STATIC.showDemoNotice(checkoutBtn, 'Checkout is disabled in the static GitHub demo.');
      });
    }
  });
})();
