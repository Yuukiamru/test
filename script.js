(() => {
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const rupiah = value => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value).replace(/\s/g, '');

  document.documentElement.classList.add('js-ready');
  $('#year').textContent = new Date().getFullYear();

  // Mobile navigation
  const menuToggle = $('#menuToggle');
  const mainNav = $('#mainNav');
  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    mainNav.classList.toggle('open', !isOpen);
  });
  $$('.nav-link').forEach(link => link.addEventListener('click', () => {
    $$('.nav-link').forEach(item => item.classList.remove('active'));
    link.classList.add('active');
    mainNav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }));

  // Active section in navigation
  const sections = $$('main section[id]');
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          $$('.nav-link').forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
        }
      });
    }, { rootMargin: '-35% 0px -55% 0px' });
    sections.forEach(section => sectionObserver.observe(section));

    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: .12 });
    $$('.section-heading, .shop-feature, .product-strip, .builder-workspace, .builder-checkout, .about-copy, .footer-main').forEach(el => {
      el.classList.add('reveal');
      revealObserver.observe(el);
    });
  }

  // Product cart
  const products = {
    'white-lily': { name: 'White Lily Arrangement', price: 200000, icon: '✿' },
    'blush-tulip': { name: 'Blush Tulip', price: 150000, icon: '🌷' },
    'lavender-bloom': { name: 'Lavender Bloom', price: 175000, icon: '✿' }
  };
  const cart = [];
  const cartDrawer = $('#cartDrawer');
  const cartBackdrop = $('#cartBackdrop');
  const cartItems = $('#cartItems');
  const toast = $('#toast');
  let toastTimer;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  }
  function openCart() {
    cartDrawer.classList.add('open');
    cartDrawer.setAttribute('aria-hidden', 'false');
    cartBackdrop.hidden = false;
    document.body.style.overflow = 'hidden';
    $('#closeCart').focus();
  }
  function closeCart() {
    cartDrawer.classList.remove('open');
    cartDrawer.setAttribute('aria-hidden', 'true');
    cartBackdrop.hidden = true;
    document.body.style.overflow = '';
  }
  function renderCart() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    $('#cartCount').textContent = count;
    $('#drawerCount').textContent = `(${count})`;
    $('#cartSubtotal').textContent = rupiah(total);
    $('#checkoutButton').disabled = count === 0;
    if (!cart.length) {
      cartItems.innerHTML = '<p class="cart-empty">Your cart is empty for now.</p>';
      return;
    }
    cartItems.innerHTML = cart.map((item, index) => `
      <div class="cart-item">
        <div class="cart-item-art">${item.icon}</div>
        <div class="cart-item-info"><strong>${item.name}</strong><small>Qty ${item.quantity}</small></div>
        <span class="cart-item-price">${rupiah(item.price * item.quantity)}</span>
        <button class="cart-remove" type="button" data-remove="${index}" aria-label="Remove ${item.name}">×</button>
      </div>`).join('');
  }
  function addToCart(item) {
    const existing = cart.find(row => row.name === item.name);
    if (existing) existing.quantity += item.quantity || 1;
    else cart.push({ ...item, quantity: item.quantity || 1 });
    renderCart();
    showToast(`${item.name} added to your cart`);
  }
  $$('[data-add-product]').forEach(button => button.addEventListener('click', () => {
    const product = products[button.dataset.addProduct];
    if (product) addToCart({ ...product, quantity: 1 });
  }));
  $('#cartButton').addEventListener('click', openCart);
  $('#closeCart').addEventListener('click', closeCart);
  cartBackdrop.addEventListener('click', closeCart);
  cartItems.addEventListener('click', event => {
    const removeButton = event.target.closest('[data-remove]');
    if (!removeButton) return;
    cart.splice(Number(removeButton.dataset.remove), 1);
    renderCart();
  });
  $('#checkoutButton').addEventListener('click', () => {
    const lines = cart.map(item => `${item.name} x${item.quantity} — ${rupiah(item.price * item.quantity)}`);
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const message = `Halo Lorem, saya ingin memesan:\n${lines.join('\n')}\nTotal: ${rupiah(total)}`;
    // Replace this demo number with the store's WhatsApp number (country code, no + or spaces).
    const whatsappNumber = '';
    if (whatsappNumber) window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
    else showToast('Demo checkout: connect your WhatsApp number in script.js');
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeCart(); });

  // Bouquet builder
  const flowerData = {
    'lily-white': { name: 'White Lily', price: 35000, category: 'lily', glyph: '✿', color: '#e9e1c9', size: 54 },
    'lily-pink': { name: 'Pink Lily', price: 35000, category: 'lily', glyph: '✿', color: '#d98b9c', size: 51 },
    'tulip-pink': { name: 'Pink Tulip', price: 25000, category: 'tulip', glyph: '🌷', color: '#d88c9b', size: 43 },
    'tulip-white': { name: 'White Tulip', price: 25000, category: 'tulip', glyph: '🌷', color: '#e9e1d6', size: 43 },
    'lavender': { name: 'Lavender', price: 15000, category: 'filler', glyph: '✿', color: '#a18bb8', size: 34 },
    'baby-breath': { name: "Baby's Breath", price: 12000, category: 'filler', glyph: '✳', color: '#b7c7ad', size: 29 }
  };
  const selectedFlowers = [];
  const previewBlooms = $('#previewBlooms');
  const previewStems = $('#previewStems');
  const wrapping = $('#wrapping');
  const flowerOptions = $('#flowerOptions');

  function renderBuilder() {
    const count = selectedFlowers.length;
    const flowerTotal = selectedFlowers.reduce((sum, id) => sum + flowerData[id].price, 0);
    const wrapTotal = Number(wrapping.value);
    const total = flowerTotal + wrapTotal;
    $('#flowerCount').textContent = `${count} flower${count === 1 ? '' : 's'} selected`;
    $('#builderTotal').textContent = rupiah(total);
    $('#builderSummary').textContent = count ? `${count} stems · ${wrapping.options[wrapping.selectedIndex].text.split(' — ')[0]}` : 'Your bouquet is waiting';
    $('#addBouquet').disabled = count === 0;

    if (!count) {
      previewBlooms.innerHTML = '<div class="empty-preview"><span>✿</span><p>Your bouquet starts here</p><small>Select flowers to add them</small></div>';
      previewStems.innerHTML = '';
      return;
    }

    const positions = [
      [50, 25, -8], [31, 37, -18], [69, 37, 16], [40, 13, -12], [61, 14, 12],
      [23, 52, -25], [77, 52, 22], [50, 48, 0], [35, 58, -12], [65, 58, 14],
      [17, 30, -28], [83, 30, 28]
    ];
    previewBlooms.innerHTML = selectedFlowers.map((id, index) => {
      const flower = flowerData[id];
      const [x, y, rotation] = positions[index % positions.length];
      const size = Math.max(25, flower.size - Math.floor(index / positions.length) * 4);
      return `<span class="preview-bloom" title="${flower.name}" style="--x:${x}%;--y:${y}%;--rotation:${rotation}deg;--size:${size}px;--bloom-color:${flower.color}">${flower.glyph}</span>`;
    }).join('');
    previewStems.innerHTML = selectedFlowers.map((id, index) => {
      const angle = (index - (count - 1) / 2) * 7;
      const height = 68 + (index % 3) * 9;
      return `<span class="preview-stem" style="--stem-rotation:${angle}deg;--stem-height:${height}%"></span>`;
    }).join('');
  }

  function addFlower(id) {
    if (!flowerData[id]) return;
    if (selectedFlowers.length >= 12) {
      showToast('Maximum 12 stems for this bouquet');
      return;
    }
    selectedFlowers.push(id);
    renderBuilder();
    showToast(`${flowerData[id].name} added to your bouquet`);
  }
  flowerOptions.addEventListener('click', event => {
    const button = event.target.closest('[data-flower]');
    if (button) addFlower(button.dataset.flower);
  });
  $$('.category-button').forEach(button => button.addEventListener('click', () => {
    $$('.category-button').forEach(item => item.classList.toggle('selected', item === button));
    const category = button.dataset.category;
    $$('.flower-option', flowerOptions).forEach(option => {
      option.hidden = category !== 'all' && flowerData[option.dataset.flower].category !== category;
    });
    $('#availableCount').textContent = `${$$('.flower-option:not([hidden])', flowerOptions).length.toString().padStart(2,'0')} ITEMS`;
  }));
  wrapping.addEventListener('change', renderBuilder);
  $('#resetBouquet').addEventListener('click', () => {
    selectedFlowers.length = 0;
    wrapping.value = '0';
    renderBuilder();
    showToast('Your arrangement has been reset');
  });
  $('#addBouquet').addEventListener('click', () => {
    if (!selectedFlowers.length) return;
    const flowerTotal = selectedFlowers.reduce((sum, id) => sum + flowerData[id].price, 0);
    const total = flowerTotal + Number(wrapping.value);
    const names = [...new Set(selectedFlowers.map(id => flowerData[id].name))].join(', ');
    addToCart({ name: `Custom Bouquet (${selectedFlowers.length} stems)`, price: total, icon: '💐', quantity: 1, detail: names });
    openCart();
  });

  renderBuilder();
  renderCart();
})();
