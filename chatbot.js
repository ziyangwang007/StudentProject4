
(function () {
  'use strict';

  var root = document.getElementById('nova-chatbot');
  if (!root) return;

  var toggle = document.getElementById('nova-chatbot-toggle');
  var closeBtn = document.getElementById('nova-chatbot-close');
  var panel = document.getElementById('nova-chatbot-panel');
  var messagesEl = document.getElementById('nova-chatbot-messages');
  var form = document.getElementById('nova-chatbot-form');
  var input = document.getElementById('nova-chatbot-input');
  var suggestionsEl = document.getElementById('nova-chatbot-suggestions');
  var avatarSrc = root.getAttribute('data-avatar') || 'noa_icon.png';
  var callout = root.getAttribute('data-callout') || 'Need help finding your perfect scent?';
  var products = (window.NOVA_CATALOG && window.NOVA_CATALOG.products) || [];

  function syncNovaChatbotSafeWidth() {
      var w = document.documentElement && document.documentElement.clientWidth;
      if (!w) w = window.innerWidth || 0;
      root.style.setProperty('--nova-chatbot-safe-w', Math.max(0, w - 32) + 'px');
  }

  function syncNovaChatbotPanelMaxHeight() {
      var launcher = root.querySelector('.nova-chatbot-launcher');
      if (!launcher) return;
      var top = launcher.getBoundingClientRect().top;
      var panelMarginAboveLauncher = 14;
      var minTopInset = 12;
      var avail = Math.floor(top - panelMarginAboveLauncher - minTopInset);
      if (avail < 0) avail = 0;
      var cap = Math.min(620, avail);
      root.style.setProperty('--nova-chatbot-panel-max-h', cap + 'px');
  }

  function syncNovaChatbotLayout() {
      syncNovaChatbotSafeWidth();
      var w = document.documentElement && document.documentElement.clientWidth;
      if (!w) w = window.innerWidth || 0;
      var frac = w < 400 ? 0.96 : w < 520 ? 0.9 : w < 720 ? 0.85 : 0.8;
      root.style.setProperty('--nova-chatbot-panel-w-frac', String(frac));
      var maxW = w < 480 ? 340 : 320;
      root.style.setProperty('--nova-chatbot-panel-max-w', maxW + 'px');
      var fontScale = w < 380 ? 0.88 : w < 450 ? 0.92 : w < 560 ? 0.96 : 1;
      root.style.setProperty('--nova-chatbot-font-scale', String(fontScale));
      syncNovaChatbotPanelMaxHeight();
  }
  syncNovaChatbotLayout();
  window.addEventListener('resize', syncNovaChatbotLayout);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', syncNovaChatbotLayout);

  function escapeHtml(s) {
      var d = document.createElement('div');
      d.textContent = s;
      return d.innerHTML;
  }

  function formatChatTime(d) {
      return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }

  function appendUserMessage(text) {
      var time = formatChatTime(new Date());
      var wrap = document.createElement('div');
      wrap.className = 'nova-chatbot-msg nova-chatbot-msg--user';
      wrap.innerHTML =
          '<div class="nova-chatbot-imessage-row nova-chatbot-imessage-row--user">' +
          '<div class="nova-chatbot-imessage-stack">' +
          '<div class="nova-chatbot-bubble nova-chatbot-bubble--user">' +
          escapeHtml(text) +
          '</div>' +
          '<span class="nova-chatbot-msg-time">' +
          escapeHtml(time) +
          '</span>' +
          '</div></div>';
      messagesEl.appendChild(wrap);
      messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function buildProductCard(p) {
      var card = document.createElement('a');
      card.className = 'nova-chatbot-product';
      card.href = 'product.html?id=' + p.product_id;
      var imgSrc = p.image ? 'uploads/products/' + encodeURIComponent(p.image) : '';
      card.innerHTML =
          (imgSrc ? '<span class="nova-chatbot-product-img"><img src="' + escapeHtml(imgSrc) + '" alt=""></span>' : '') +
          '<span class="nova-chatbot-product-meta">' +
          '<span class="nova-chatbot-product-name">' + escapeHtml(p.name) + '</span>' +
          '<span class="nova-chatbot-product-cat">' + escapeHtml(p.category || '') + '</span>' +
          '<span class="nova-chatbot-product-price">£' + Number(p.price).toFixed(2) + '</span></span>';
      return card;
  }

  function appendBotResponse(text, productList) {
      var time = formatChatTime(new Date());
      var wrap = document.createElement('div');
      wrap.className = 'nova-chatbot-msg nova-chatbot-msg--bot';
      var row = document.createElement('div');
      row.className = 'nova-chatbot-imessage-row';

      var av = document.createElement('img');
      av.className = 'nova-chatbot-msg-avatar';
      av.src = avatarSrc;
      av.width = 30;
      av.height = 30;
      av.alt = 'NOA';
      av.decoding = 'async';

      var stack = document.createElement('div');
      stack.className = 'nova-chatbot-imessage-stack';

      if (text) {
          var bubble = document.createElement('div');
          bubble.className = 'nova-chatbot-bubble nova-chatbot-bubble--bot';
          bubble.textContent = text;
          stack.appendChild(bubble);
      }

      if (productList && productList.length) {
          var prodWrap = document.createElement('div');
          prodWrap.className = 'nova-chatbot-products';
          productList.forEach(function (p) { prodWrap.appendChild(buildProductCard(p)); });
          stack.appendChild(prodWrap);
      }

      var ti = document.createElement('span');
      ti.className = 'nova-chatbot-msg-time';
      ti.textContent = time;
      stack.appendChild(ti);

      row.appendChild(av);
      row.appendChild(stack);
      wrap.appendChild(row);
      messagesEl.appendChild(wrap);
      messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function setSuggestions(items) {
      suggestionsEl.innerHTML = '';
      (items || []).forEach(function (label) {
          var chip = document.createElement('button');
          chip.type = 'button';
          chip.className = 'nova-chatbot-chip';
          chip.textContent = label;
          chip.addEventListener('click', function () { sendMessageFromUser(label); });
          suggestionsEl.appendChild(chip);
      });
  }

  function openPanel() {
      panel.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      syncNovaChatbotPanelMaxHeight();
      requestAnimationFrame(function () {
          syncNovaChatbotPanelMaxHeight();
          if (input) input.focus();
      });
  }

  function closePanel() {
      panel.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', function () {
      if (panel.hidden) openPanel();
      else closePanel();
  });

  if (closeBtn) closeBtn.addEventListener('click', closePanel);

  document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) closePanel();
  });

  function topMatches(filterFn, limit) {
      return products.filter(filterFn).slice(0, limit || 3);
  }

  function replyForMessage(msg) {
      var text = String(msg || '').trim().toLowerCase();
      if (!text) {
          return {
              reply: 'Hi, I’m NOA. ' + callout,
              suggestions: ['Show citrus perfumes', 'Gift boxes', 'Perfumes under £70', 'Contact support'],
              products: []
          };
      }

      var budgetMatch = text.match(/under\s*£?\s*(\d+)/);
      var budget = budgetMatch ? parseFloat(budgetMatch[1]) : null;

      if (text.indexOf('contact') !== -1 || text.indexOf('support') !== -1 || text.indexOf('delivery') !== -1 || text.indexOf('return') !== -1) {
          return {
              reply: 'You can use the Contact page for support details and store information. In this static GitHub demo, the form itself does not send messages.',
              suggestions: ['Show gift boxes', 'What is NOVA?', 'Perfumes under £70'],
              products: []
          };
      }

      if (text.indexOf('gift') !== -1 || text.indexOf('box') !== -1) {
          return {
              reply: 'Here are a few NOVA gift options.',
              suggestions: ['Show citrus perfumes', 'Show floral perfumes', 'Perfumes under £70'],
              products: topMatches(function (p) { return /gift/i.test(p.category) || /gift/i.test(p.name); }, 3)
          };
      }

      if (text.indexOf('citrus') !== -1) {
          return {
              reply: 'These citrus picks are bright, fresh and easy to wear.',
              suggestions: ['Perfumes under £70', 'Show floral perfumes', 'Show men perfumes'],
              products: topMatches(function (p) {
                return /citrus/i.test(p.category) && (budget === null || p.price <= budget);
              }, 3)
          };
      }

      if (text.indexOf('floral') !== -1) {
          return {
              reply: 'Here are some floral favourites from NOVA.',
              suggestions: ['Show citrus perfumes', 'Show spicy perfumes', 'Gift boxes'],
              products: topMatches(function (p) {
                return /floral/i.test(p.category) && (budget === null || p.price <= budget);
              }, 3)
          };
      }

      if (text.indexOf('spicy') !== -1 || text.indexOf('oud') !== -1 || text.indexOf('oriental') !== -1) {
          return {
              reply: 'These options lean warmer, deeper and more evening-ready.',
              suggestions: ['Show exclusive perfumes', 'Show men perfumes', 'Perfumes under £70'],
              products: topMatches(function (p) {
                return (/spicy|oriental|exclusive/i.test(p.category) || /oud/i.test(p.name)) && (budget === null || p.price <= budget);
              }, 3)
          };
      }

      if (text.indexOf('men') !== -1) {
          return {
              reply: 'Here are a few scents from the men’s collection.',
              suggestions: ['Show citrus perfumes', 'Show oriental perfumes', 'Perfumes under £70'],
              products: topMatches(function (p) {
                return /^Men/i.test(p.category) && (budget === null || p.price <= budget);
              }, 3)
          };
      }

      if (text.indexOf('women') !== -1) {
          return {
              reply: 'Here are a few scents from the women’s collection.',
              suggestions: ['Show floral perfumes', 'Show citrus perfumes', 'Perfumes under £70'],
              products: topMatches(function (p) {
                return /^Women/i.test(p.category) && (budget === null || p.price <= budget);
              }, 3)
          };
      }

      if (budget !== null || text.indexOf('cheap') !== -1 || text.indexOf('budget') !== -1) {
          return {
              reply: 'These are some lower-priced NOVA options.',
              suggestions: ['Gift boxes', 'Show citrus perfumes', 'Show floral perfumes'],
              products: products.filter(function (p) { return budget === null || p.price <= budget; }).sort(function (a, b) { return a.price - b.price; }).slice(0, 3)
          };
      }

      if (text.indexOf('about') !== -1 || text.indexOf('nova') !== -1 || text.indexOf('story') !== -1) {
          return {
              reply: 'NOVA is designed around luminous, modern fragrances with a clean aesthetic. The About page tells the full story.',
              suggestions: ['Show featured perfumes', 'Gift boxes', 'Contact support'],
              products: []
          };
      }

      return {
          reply: 'I can help with perfume categories, gift boxes, budget options, and basic support questions. Try asking for citrus perfumes, floral perfumes, or perfumes under £70.',
          suggestions: ['Show citrus perfumes', 'Gift boxes', 'Perfumes under £70'],
          products: []
      };
  }

  function sendMessageFromUser(text) {
      var msg = String(text).trim();
      if (!msg) return;
      appendUserMessage(msg);
      var response = replyForMessage(msg);
      window.setTimeout(function () {
          appendBotResponse(response.reply || '', response.products || []);
          setSuggestions(response.suggestions || []);
      }, 350);
  }

  form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = (input.value || '').trim();
      if (!msg) return;
      input.value = '';
      sendMessageFromUser(msg);
  });

  appendBotResponse('Hi, I’m NOA. ' + callout, []);
  setSuggestions(['Show citrus perfumes', 'Gift boxes', 'Perfumes under £70', 'Contact support']);
})();
