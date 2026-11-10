(() => {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [
    ...scope.querySelectorAll(selector),
  ];
  const money = (value) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    })
      .format(Number(value) || 0)
      .replace(/\s/g, "");

  const CART_STORAGE_KEY = "lorem-cart-v1";
  const ORDER_STORAGE_KEY = "lorem-orders-v1";
  const MAX_FLOWERS = 12;
  const ORDER_STAGES = ["Order Placed", "Processing", "Shipped", "Delivered"];

  const WHATSAPP_NUMBER = "6283856696403";

  const escapeHTML = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[char],
    );

  function readArray(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(value) ? value : [];
    } catch (error) {
      console.warn(`Could not read ${key}:`, error);
      return [];
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`Could not save ${key}:`, error);
      return false;
    }
  }

  /* =====================================================
     1. INITIAL PAGE SETUP
  ===================================================== */

  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();
  document.documentElement.classList.add("js-ready");

  /* =====================================================
     2. HEADER + MOBILE NAVIGATION
  ===================================================== */

  const menuToggle = $("#menuToggle");
  const mainNav = $("#mainNav");

  function closeMenu() {
    if (!menuToggle || !mainNav) return;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    mainNav.classList.remove("open");
  }

  menuToggle?.addEventListener("click", () => {
    const willOpen = menuToggle.getAttribute("aria-expanded") !== "true";
    menuToggle.setAttribute("aria-expanded", String(willOpen));
    menuToggle.setAttribute(
      "aria-label",
      willOpen ? "Close navigation" : "Open navigation",
    );
    mainNav?.classList.toggle("open", willOpen);
  });

  $$(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      $$(".nav-link").forEach((item) =>
        item.classList.toggle("active", item === link),
      );
      closeMenu();
    });
  });

  document.addEventListener("click", (event) => {
    if (!mainNav?.classList.contains("open")) return;
    if (mainNav.contains(event.target) || menuToggle?.contains(event.target))
      return;
    closeMenu();
  });

  /* =====================================================
     3. ACTIVE SECTION + SCROLL REVEAL
  ===================================================== */

  const sections = $$("main section[id], main footer[id]");

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          $$(".nav-link").forEach((link) => {
            link.classList.toggle(
              "active",
              link.getAttribute("href") === `#${entry.target.id}`,
            );
          });
        });
      },
      { rootMargin: "-35% 0px -55% 0px" },
    );

    sections.forEach((section) => sectionObserver.observe(section));

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12 },
    );

    $$(
      ".section-heading, .shop-layout, .builder-workspace, .builder-checkout, .about-copy, .footer-main",
    ).forEach((element) => {
      element.classList.add("reveal");
      revealObserver.observe(element);
    });
  } else {
    $$(".reveal").forEach((element) => element.classList.add("is-visible"));
  }

  /* =====================================================
     4. TOAST NOTIFICATION
  ===================================================== */

  const toast = $("#toast");
  let toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2600);
  }

  /* =====================================================
     5. SHOP PRODUCT SELECTION
  ===================================================== */

  const shopProducts = {
    "white-lily": {
      name: "Until We Meet Again",
      subtitle: "",
      description:
        "An elegant arrangement of delicate lilies designed to bring a soft, lasting touch to your space.",
      price: 340000,
      image: "assets/flowers/chair-UWMA.svg",
      index: "FEATURED PIECE / 001",
      meta: "Artificial floral arrangement · Decorative use",
      icon: "✿",
    },
    "blush-tulip": {
      name: "Blush Tulip",
      subtitle: "Arrangement",
      description:
        "Soft blush tulips arranged to bring a gentle touch of color to your favorite corner.",
      price: 150000,
      image: "assets/flowers/tulip.svg",
      index: "CURATED PIECE / 002",
      meta: "Artificial tulip arrangement · Decorative use",
      icon: "🌷",
    },
    "lavender-bloom": {
      name: "Lavender Bloom",
      subtitle: "Arrangement",
      description:
        "A delicate lavender-inspired arrangement with a calm, timeless character and a soothing presence.",
      price: 175000,
      image: "assets/flowers/purple.svg",
      index: "CURATED PIECE / 003",
      meta: "Artificial lavender arrangement · Decorative use",
      icon: "✳",
    },
  };

  const shopName = $("#shopProductName");
  const shopDescription = $("#shopProductDescription");
  const shopPrice = $("#shopProductPrice");
  const shopIndex = $("#shopProductIndex");
  const shopMeta = $("#shopProductMeta");
  const shopImage = $("#shopChairBouquet");
  const shopAddButton = $("#shopAddButton");
  const productCards = $$(".shop-product-card");
  let activeProductId = "white-lily";

  productCards.forEach((card) => {
    const image = $(".shop-card-art", card);
    const product = shopProducts[card.dataset.shopProduct];
    if (!image || !product) return;
    image.addEventListener("error", () => {
      image.hidden = true;
      let fallback = $(".shop-card-fallback", card);
      if (!fallback) {
        fallback = document.createElement("span");
        fallback.className = "shop-card-fallback";
        fallback.setAttribute("aria-hidden", "true");
        fallback.textContent = product.icon;
        image.after(fallback);
      }
    }, { once: true });
  });

  function updateProductSelection(id) {
    productCards.forEach((card) => {
      const isSelected = card.dataset.shopProduct === id;
      card.classList.toggle("is-selected", isSelected);
      card.setAttribute("aria-pressed", String(isSelected));
    });
  }

  function selectShopProduct(id) {
    const product = shopProducts[id];
    if (!product) return;

    activeProductId = id;
    updateProductSelection(id);

    if (shopIndex) shopIndex.textContent = product.index;
    if (shopName) {
      shopName.innerHTML = product.subtitle
        ? `${escapeHTML(product.name)}<br><em>${escapeHTML(product.subtitle)}</em>`
        : escapeHTML(product.name);
    }
    if (shopDescription) shopDescription.textContent = product.description;
    if (shopPrice) shopPrice.textContent = money(product.price);
    if (shopMeta) shopMeta.textContent = product.meta;
    if (shopAddButton) shopAddButton.dataset.addProduct = id;

    if (shopImage) {
      shopImage.style.display = "block";
      shopImage.alt = [product.name, product.subtitle]
        .filter(Boolean)
        .join(" ");
      shopImage.onerror = () => {
        shopImage.style.display = "none";
        const fallback = $(".chair-fallback");
        if (fallback) fallback.style.display = "block";
        const flowerFallback = $(".bouquet-fallback");
        if (flowerFallback) flowerFallback.style.display = "block";
      };
      shopImage.onload = () => {
        const fallback = $(".chair-fallback");
        if (fallback) fallback.style.display = "none";
        const flowerFallback = $(".bouquet-fallback");
        if (flowerFallback) flowerFallback.style.display = "none";
      };
      shopImage.src = product.image;
    }
  }

  productCards.forEach((card) => {
    card.addEventListener("click", () =>
      selectShopProduct(card.dataset.shopProduct),
    );
  });

  const shopSearch = $("#shopSearch");
  const shopSort = $("#shopSort");
  const shopResults = $("#shopResults");
  const shopList = $(".shop-product-list");
  const originalProductOrder = [...productCards];

  function updateShopListing() {
    if (!shopList) return;
    const query = String(shopSearch?.value || "").trim().toLowerCase();
    const sort = shopSort?.value || "featured";
    const cards = [...originalProductOrder];
    if (sort === "price-asc") cards.sort((a, b) => shopProducts[a.dataset.shopProduct].price - shopProducts[b.dataset.shopProduct].price);
    if (sort === "price-desc") cards.sort((a, b) => shopProducts[b.dataset.shopProduct].price - shopProducts[a.dataset.shopProduct].price);
    if (sort === "name") cards.sort((a, b) => shopProducts[a.dataset.shopProduct].name.localeCompare(shopProducts[b.dataset.shopProduct].name, "id"));
    cards.forEach((card) => {
      const product = shopProducts[card.dataset.shopProduct];
      const matches = `${product.name} ${product.subtitle} ${product.description}`.toLowerCase().includes(query);
      card.hidden = !matches;
      shopList.append(card);
    });
    const visible = cards.filter((card) => !card.hidden).length;
    if (shopResults) shopResults.textContent = `${visible} ${visible === 1 ? "piece" : "pieces"} found`;
    if (query && !visible) {
      let empty = $("#shopEmptyState");
      if (!empty) {
        empty = document.createElement("p");
        empty.id = "shopEmptyState";
        empty.className = "shop-empty-state";
        empty.textContent = "No products match your search.";
        shopList.after(empty);
      }
      empty.hidden = false;
    } else {
      const empty = $("#shopEmptyState");
      if (empty) empty.hidden = true;
    }
  }
  shopSearch?.addEventListener("input", updateShopListing);
  shopSort?.addEventListener("change", updateShopListing);

  /* =====================================================
     6. CART + LOCAL STORAGE
  ===================================================== */

  const cart = readArray(CART_STORAGE_KEY)
    .filter(
      (item) =>
        item &&
        typeof item.name === "string" &&
        Number.isFinite(Number(item.price)) &&
        Number(item.price) >= 0,
    )
    .map((item) => ({
      name: item.name,
      price: Number(item.price),
      icon: String(item.icon || "✿"),
      quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
      detail: String(item.detail || ""),
    }));

  const cartDrawer = $("#cartDrawer");
  const cartBackdrop = $("#cartBackdrop");
  const cartItems = $("#cartItems");
  let lastFocusedElement = null;

  function saveCart() {
    if (!writeStorage(CART_STORAGE_KEY, cart)) {
      showToast(
        "Browser storage is unavailable; cart may not persist after refresh.",
      );
    }
  }

  function openCart() {
    if (!cartDrawer || !cartBackdrop) return;
    lastFocusedElement = document.activeElement;
    cartDrawer.classList.add("open");
    cartDrawer.setAttribute("aria-hidden", "false");
    cartDrawer.inert = false;
    cartBackdrop.hidden = false;
    document.body.classList.add("cart-is-open");
    document.body.style.overflow = "hidden";
    $("#closeCart")?.focus();
  }

  function closeCart(restoreFocus = true) {
    if (!cartDrawer || !cartBackdrop) return;
    const wasOpen = cartDrawer.classList.contains("open");
    cartDrawer.classList.remove("open");
    cartDrawer.setAttribute("aria-hidden", "true");
    cartDrawer.inert = true;
    cartBackdrop.hidden = true;
    document.body.classList.remove("cart-is-open");
    document.body.style.overflow = "";
    if (wasOpen && restoreFocus)
      (lastFocusedElement || $("#cartButton"))?.focus();
  }

  function cartSubtotalValue() {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  function renderCart() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const total = cartSubtotalValue();

    if ($("#cartCount")) $("#cartCount").textContent = count;
    if ($("#drawerCount")) $("#drawerCount").textContent = `(${count})`;
    if ($("#cartSubtotal")) $("#cartSubtotal").textContent = money(total);
    if ($("#checkoutButton")) $("#checkoutButton").disabled = count === 0;
    if ($("#clearCart")) $("#clearCart").disabled = count === 0;

    if (!cartItems) {
      saveCart();
      updateCheckoutTotals();
      return;
    }

    if (!cart.length) {
      cartItems.innerHTML =
        '<p class="cart-empty">Your cart is empty for now.</p>';
    } else {
      cartItems.innerHTML = cart
        .map(
          (item, index) => `
        <article class="cart-item">
          <div class="cart-item-art" aria-hidden="true">${escapeHTML(item.icon || "✿")}</div>
          <div class="cart-item-info">
            <strong>${escapeHTML(item.name)}</strong>
            ${item.detail ? `<small class="cart-item-detail">${escapeHTML(item.detail)}</small>` : ""}
            <div class="cart-quantity-control" aria-label="Quantity controls">
              <button type="button" data-cart-action="decrease" data-cart-index="${index}" aria-label="Decrease ${escapeHTML(item.name)} quantity" ${item.quantity <= 1 ? "disabled" : ""}>−</button>
              <output>${item.quantity}</output>
              <button type="button" data-cart-action="increase" data-cart-index="${index}" aria-label="Increase ${escapeHTML(item.name)} quantity">+</button>
            </div>
          </div>
          <span class="cart-item-price">${money(item.price * item.quantity)}</span>
          <button class="cart-remove" type="button" data-cart-action="remove" data-cart-index="${index}" aria-label="Remove ${escapeHTML(item.name)}">×</button>
        </article>
      `,
        )
        .join("");
    }

    saveCart();
    updateCheckoutTotals();
  }

  function addToCart(item) {
    if (!item || !Number.isFinite(Number(item.price)) || Number(item.price) < 0)
      return;

    const normalized = {
      name: String(item.name || "Lorem item"),
      price: Number(item.price),
      icon: String(item.icon || "✿"),
      quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
      detail: String(item.detail || ""),
    };

    const existing = cart.find(
      (row) => row.name === normalized.name && row.detail === normalized.detail,
    );
    if (existing) {
      if (existing.quantity + normalized.quantity > 99) {
        showToast("Maximum 99 units per cart item");
        return;
      }
      existing.quantity += normalized.quantity;
    } else cart.push(normalized);

    renderCart();
    showToast(`${normalized.name} added to your cart`);
  }

  document.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-add-product]");
    if (!addButton) return;
    const product = shopProducts[addButton.dataset.addProduct];
    if (!product) return;

    addToCart({
      name: `${product.name} ${product.subtitle}`.trim(),
      price: product.price,
      icon: product.icon,
      quantity: 1,
    });
  });

  $("#cartButton")?.addEventListener("click", openCart);
  $("#closeCart")?.addEventListener("click", () => closeCart());
  cartBackdrop?.addEventListener("click", () => closeCart());

  cartItems?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-cart-action]");
    if (!button) return;

    const index = Number(button.dataset.cartIndex);
    const item = cart[index];
    if (!item) return;

    if (button.dataset.cartAction === "increase") {
      if (item.quantity >= 99) {
        showToast("Maximum 99 units per cart item");
        return;
      }
      item.quantity += 1;
    }
    if (button.dataset.cartAction === "decrease" && item.quantity > 1)
      item.quantity -= 1;
    if (button.dataset.cartAction === "remove") cart.splice(index, 1);

    renderCart();
  });

  $("#clearCart")?.addEventListener("click", () => {
    if (!cart.length) return;
    if (!window.confirm("Remove all items from your cart?")) return;
    cart.length = 0;
    renderCart();
    showToast("Cart cleared");
  });

  /* =====================================================
     7. BOUQUET BUILDER
  ===================================================== */

  const flowerData = {
    "lily-white": {
      image: "assets/flowers/lilly.svg",
      name: "White Lily",
      price: 35000,
      category: "lily",
      glyph: "✿",
      color: "#e9e1c9",
      size: 54,
    },
    "lily-pink": {
      image: "assets/flowers/lilly.svg",
      name: "Pink Lily",
      price: 35000,
      category: "lily",
      glyph: "✿",
      color: "#d98b9c",
      size: 51,
    },
    "tulip-pink": {
      image: "assets/flowers/tulip.svg",
      name: "Pink Tulip",
      price: 25000,
      category: "tulip",
      glyph: "🌷",
      color: "#d88c9b",
      size: 43,
    },
    "tulip-white": {
      image: "assets/flowers/tulip.svg",
      name: "White Tulip",
      price: 25000,
      category: "tulip",
      glyph: "🌷",
      color: "#e9e1d6",
      size: 43,
    },
    lavender: {
      image: "assets/flowers/purple.svg",
      name: "Lavender",
      price: 15000,
      category: "filler",
      glyph: "✿",
      color: "#a18bb8",
      size: 34,
    },
    "baby-breath": {
      image: "assets/flowers/purple.svg",
      name: "Baby's Breath",
      price: 12000,
      category: "filler",
      glyph: "✳",
      color: "#b7c7ad",
      size: 29,
    },

    // Additional photo assets supplied for the bouquet builder.
    // Prices below are provisional; edit them to match the final catalog.
    "hydrangea-white": { image: "assets/flowers/white-hydrangea.png", name: "White Hydrangea", price: 35000, category: "hydrangea", glyph: "✿", size: 66 },
    "hydrangea-purple": { image: "assets/flowers/purple-hydrangea.png", name: "Purple Hydrangea", price: 35000, category: "hydrangea", glyph: "✿", size: 62 },
    "hydrangea-pink": { image: "assets/flowers/pink-hydrangea.png", name: "Pink Hydrangea", price: 35000, category: "hydrangea", glyph: "✿", size: 62 },
    "hydrangea-blue": { image: "assets/flowers/blue-hydrangea.png", name: "Blue Hydrangea", price: 35000, category: "hydrangea", glyph: "✿", size: 58 },

    "gerbera-orange": { image: "assets/flowers/orange-gerbera.png", name: "Orange Gerbera", price: 25000, category: "gerbera", glyph: "✿", size: 58 },
    "gerbera-pink": { image: "assets/flowers/pink-gerbera.png", name: "Pink Gerbera", price: 25000, category: "gerbera", glyph: "✿", size: 58 },
    "gerbera-red": { image: "assets/flowers/red-gerbera.png", name: "Red Gerbera", price: 25000, category: "gerbera", glyph: "✿", size: 58 },
    "gerbera-white": { image: "assets/flowers/white-gerbera.png", name: "White Gerbera", price: 25000, category: "gerbera", glyph: "✿", size: 58 },

    "carnation-pink": { image: "assets/flowers/pink-carnation.png", name: "Pink Carnation", price: 25000, category: "carnation", glyph: "✿", size: 58 },
    "carnation-purple": { image: "assets/flowers/purple-carnation.png", name: "Purple Carnation", price: 25000, category: "carnation", glyph: "✿", size: 58 },
    "carnation-red": { image: "assets/flowers/red-carnation.png", name: "Red Carnation", price: 25000, category: "carnation", glyph: "✿", size: 58 },
    "carnation-white": { image: "assets/flowers/white-carnation.png", name: "White Carnation", price: 25000, category: "carnation", glyph: "✿", size: 58 },

    "filler-babys-breath": { image: "assets/flowers/babys-breath.png", name: "Baby's Breath", price: 15000, category: "filler", glyph: "✳", size: 48 },
    "filler-chamomile": { image: "assets/flowers/chamomile.png", name: "Chamomile", price: 15000, category: "filler", glyph: "✿", size: 48 },
    "filler-million-stars": { image: "assets/flowers/million-stars.png", name: "Million Stars", price: 15000, category: "filler", glyph: "✳", size: 48 },
    "filler-statice": { image: "assets/flowers/statice.png", name: "Statice", price: 15000, category: "filler", glyph: "✿", size: 48 },
    "filler-wax-flower": { image: "assets/flowers/wax-flower.png", name: "Wax Flower", price: 15000, category: "filler", glyph: "✳", size: 48 },
  };

  const selectedFlowers = [];
  // Per-stem adjustments stay aligned with selectedFlowers by array index.
  const flowerAdjustments = [];
  let selectedFlowerIndex = -1;
  let autoArrangeEnabled = true;
  const previewBlooms = $("#previewBlooms");
  const previewWrap = $("#previewWrap");
  const wrapping = $("#wrapping");
  const flowerOptions = $("#flowerOptions");

  // Each SVG already contains its own stem. These layouts position the complete
  // flower assets as a bouquet, with stems converging toward the wrapping.
  const bouquetLayouts = {
    // Every flower rotates around the same bottom-center anchor.
    // The flower heads fan outward while the original stems meet in the middle.
    1:  [[50, 0, 0.92]],
    2:  [[50, -12, 0.90], [50, 12, 0.90]],
    3:  [[50, 0, 0.94], [50, -20, 0.86], [50, 20, 0.86]],
    4:  [[50, -10, 0.90], [50, 10, 0.90], [50, -27, 0.82], [50, 27, 0.82]],
    5:  [[50, 0, 0.94], [50, -16, 0.88], [50, 16, 0.88], [50, -30, 0.80], [50, 30, 0.80]],
    6:  [[50, 0, 0.96], [50, -13, 0.90], [50, 13, 0.90], [50, -25, 0.83], [50, 25, 0.83], [50, 5, 0.78]],
    7:  [[50, 0, 0.96], [50, -12, 0.91], [50, 12, 0.91], [50, -24, 0.84], [50, 24, 0.84], [50, -34, 0.76], [50, 34, 0.76]],
    8:  [[50, 0, 0.98], [50, -10, 0.92], [50, 10, 0.92], [50, -21, 0.86], [50, 21, 0.86], [50, -31, 0.80], [50, 31, 0.80], [50, 4, 0.76]],
    9:  [[50, 0, 0.98], [50, -10, 0.93], [50, 10, 0.93], [50, -20, 0.87], [50, 20, 0.87], [50, -30, 0.81], [50, 30, 0.81], [50, -38, 0.75], [50, 38, 0.75]],
    10: [[50, 0, 0.98], [50, -9, 0.94], [50, 9, 0.94], [50, -19, 0.88], [50, 19, 0.88], [50, -28, 0.82], [50, 28, 0.82], [50, -36, 0.76], [50, 36, 0.76], [50, 4, 0.74]],
    11: [[50, 0, 1.00], [50, -9, 0.94], [50, 9, 0.94], [50, -18, 0.89], [50, 18, 0.89], [50, -27, 0.83], [50, 27, 0.83], [50, -35, 0.77], [50, 35, 0.77], [50, -14, 0.80], [50, 14, 0.80]],
    12: [[50, 0, 1.00], [50, -8, 0.95], [50, 8, 0.95], [50, -17, 0.90], [50, 17, 0.90], [50, -25, 0.84], [50, 25, 0.84], [50, -33, 0.78], [50, 33, 0.78], [50, -13, 0.82], [50, 13, 0.82], [50, 4, 0.76]],
  };

  function currentCategory() {
    return $(".category-button.selected")?.dataset.category || "all";
  }

  function renderFlowerOptions() {
    if (!flowerOptions) return;

    flowerOptions.innerHTML = Object.entries(flowerData)
      .map(([id, flower]) => {
        const quantity = selectedFlowers.filter(
          (selected) => selected === id,
        ).length;
        const atLimit = selectedFlowers.length >= MAX_FLOWERS;

        return `
        <article class="flower-option" data-flower="${id}">
          <span class="flower-thumb" aria-hidden="true"><img src="${flower.image}" alt="" loading="lazy"><span>${flower.glyph}</span></span>
          <span class="flower-info">
            <strong>${escapeHTML(flower.name)}</strong>
            <small>${money(flower.price)} / stem</small>
          </span>
          <span class="quantity-control">
            <button type="button" class="quantity-button" data-qty-change="-1" data-flower-id="${id}" aria-label="Remove one ${escapeHTML(flower.name)}" ${quantity === 0 ? "disabled" : ""}>−</button>
            <output class="quantity-value" aria-label="${quantity} selected">${quantity}</output>
            <button type="button" class="quantity-button" data-qty-change="1" data-flower-id="${id}" aria-label="Add one ${escapeHTML(flower.name)}" ${atLimit ? "disabled" : ""}>+</button>
          </span>
        </article>
      `;
      })
      .join("");

    $$(".flower-thumb img", flowerOptions).forEach((image) => {
      image.addEventListener("error", () => {
        image.hidden = true;
      }, { once: true });
    });

    const category = currentCategory();
    $$(".flower-option", flowerOptions).forEach((option) => {
      option.hidden =
        category !== "all" &&
        flowerData[option.dataset.flower].category !== category;
    });

    const visibleCount = $$(
      ".flower-option:not([hidden])",
      flowerOptions,
    ).length;
    const availableCount = $("#availableCount");
    if (availableCount)
      availableCount.textContent = `${String(visibleCount).padStart(2, "0")} ITEMS`;
  }

  function updateWrappingPreview() {
    if (!previewWrap || !wrapping) return;

    const wrapStyles = {
      0: ["#d9c3b3", "#f3e7d8", "#c8ad9c"],
      15000: ["#e5d9c8", "#fff7e9", "#d4c3ad"],
      20000: ["#bd7f8a", "#e8bfc2", "#a95e70"],
      25000: ["#351923", "#642f43", "#23131a"],
    };

    const colors = wrapStyles[wrapping.value] || wrapStyles["0"];
    previewWrap.style.setProperty("--wrap-left", colors[0]);
    previewWrap.style.setProperty("--wrap-center", colors[1]);
    previewWrap.style.setProperty("--wrap-right", colors[2]);
    previewWrap.hidden = selectedFlowers.length === 0 || wrapping.value === "0";
    previewWrap.dataset.wrap = wrapping.value;
  }

  function renderBuilder() {
    const count = selectedFlowers.length;
    const flowerTotal = selectedFlowers.reduce(
      (sum, id) => sum + flowerData[id].price,
      0,
    );
    const wrapTotal = Number(wrapping?.value || 0);
    const total = flowerTotal + wrapTotal;
    const wrapLabel =
      wrapping?.options[wrapping.selectedIndex]?.text.split(" — ")[0] ||
      "No wrapping";

    const flowerCount = $("#flowerCount");
    const builderTotal = $("#builderTotal");
    const builderSummary = $("#builderSummary");
    const builderBreakdown = $("#builderBreakdown");
    const addBouquetButton = $("#addBouquet");

    if (flowerCount)
      flowerCount.textContent = `${count} ${count === 1 ? "flower" : "flowers"} selected`;
    if (builderTotal) builderTotal.textContent = money(total);
    if (builderSummary)
      builderSummary.textContent = count
        ? `${count} ${count === 1 ? "stem" : "stems"} · ${wrapLabel}`
        : "Your bouquet is waiting";
    if (builderBreakdown) {
      const flowerLabel = money(flowerTotal);
      const wrapPrice = money(wrapTotal);
      builderBreakdown.textContent = count
        ? `Flowers ${flowerLabel} + wrapping ${wrapPrice}`
        : "Choose flowers to see your price breakdown.";
    }
    if (addBouquetButton) addBouquetButton.disabled = count === 0;

    updateWrappingPreview();
    renderFlowerOptions();

    if (!previewBlooms) return;

    // Keep the mode indicator and controls in sync even before any flower is selected.
    const autoButton = $("#autoArrange");
    const hint = $("#editorHint");
    const selectionLabel = $("#controlSelection");
    const controlButtons = $$("[data-flower-control]");
    if (autoButton) {
      autoButton.classList.toggle("is-active", autoArrangeEnabled);
      autoButton.setAttribute("aria-pressed", String(autoArrangeEnabled));
    }
    if (hint) hint.textContent = autoArrangeEnabled
      ? "Automatic layout is on"
      : "Manual mode · select a flower to edit";
    if (selectionLabel) {
      selectionLabel.textContent = !autoArrangeEnabled && selectedFlowerIndex >= 0 && selectedFlowers[selectedFlowerIndex]
        ? `${flowerData[selectedFlowers[selectedFlowerIndex]].name} · Stem ${selectedFlowerIndex + 1}`
        : autoArrangeEnabled ? "Turn off Auto Arrange to edit" : "Select a flower in the preview";
    }
    controlButtons.forEach((button) => {
      button.disabled = autoArrangeEnabled || selectedFlowerIndex < 0 || !selectedFlowers[selectedFlowerIndex];
    });

    if (!count) {
      previewBlooms.innerHTML =
        '<div class="empty-preview"><span>✿</span><p>Your bouquet starts here</p><small>Select blooms to add them</small></div>';
      return;
    }

    const layout = bouquetLayouts[count] || bouquetLayouts[12];
    // Complete flower PNGs rotate around their bottom-center stem endpoint.
    previewBlooms.innerHTML = selectedFlowers
      .map((id, index) => {
        const flower = flowerData[id];
        const autoPose = layout[index] || [50, 0, 0.76];
        const adjustment = flowerAdjustments[index] || { angle: 0, scale: 1 };
        const angle = autoArrangeEnabled ? autoPose[1] : autoPose[1] + adjustment.angle;
        const scale = autoArrangeEnabled ? autoPose[2] : autoPose[2] * adjustment.scale;
        const layer = 2 + Math.round(scale * 10) + (index % 2);
        const width = flower.category === "filler" ? 30 : flower.category === "hydrangea" ? 38 : 34;
        const selected = index === selectedFlowerIndex && !autoArrangeEnabled;
        return `<button class="preview-bloom${selected ? " is-selected" : ""}" type="button" data-preview-index="${index}" aria-label="Select ${escapeHTML(flower.name)} ${index + 1}" aria-pressed="${selected}" style="--flower-x:50%;--flower-angle:${angle}deg;--flower-scale:${scale};--flower-layer:${layer};--flower-width:${width}px"><img src="${flower.image}" alt=""></button>`;
      })
      .join("");

    $$(".preview-bloom", previewBlooms).forEach((bloom) => {
      bloom.addEventListener("click", () => {
        if (autoArrangeEnabled) return;
        selectedFlowerIndex = Number(bloom.dataset.previewIndex);
        renderBuilder();
      });
      bloom.addEventListener("pointerdown", (event) => {
        if (autoArrangeEnabled || event.button !== 0) return;
        selectedFlowerIndex = Number(bloom.dataset.previewIndex);
        bloom.setPointerCapture?.(event.pointerId);
        bloom.dataset.dragStartX = String(event.clientX);
        bloom.dataset.dragStartAngle = String(flowerAdjustments[selectedFlowerIndex]?.angle || 0);
      });
      bloom.addEventListener("pointerup", (event) => {
        if (autoArrangeEnabled || bloom.dataset.dragStartX == null) return;
        const index = Number(bloom.dataset.previewIndex);
        const delta = event.clientX - Number(bloom.dataset.dragStartX);
        if (Math.abs(delta) > 5) {
          flowerAdjustments[index].angle = Math.max(-55, Math.min(55, Number(bloom.dataset.dragStartAngle) + delta * 0.55));
          selectedFlowerIndex = index;
          renderBuilder();
        }
        delete bloom.dataset.dragStartX;
        delete bloom.dataset.dragStartAngle;
      });
      const image = $("img", bloom);
      image?.addEventListener("error", () => {
        bloom.classList.add("asset-missing");
        image.remove();
      }, { once: true });
    });
  }

  flowerOptions?.addEventListener("click", (event) => {
    const quantityButton = event.target.closest("[data-qty-change]");
    if (!quantityButton || quantityButton.disabled) return;

    const id = quantityButton.dataset.flowerId;
    const change = Number(quantityButton.dataset.qtyChange);
    if (!flowerData[id]) return;

    if (change > 0) {
      if (selectedFlowers.length >= MAX_FLOWERS) {
        showToast(`Maximum ${MAX_FLOWERS} stems per bouquet`);
        return;
      }
      selectedFlowers.push(id);
      flowerAdjustments.push({ angle: 0, scale: 1 });
      selectedFlowerIndex = selectedFlowers.length - 1;
    } else {
      const index = selectedFlowers.lastIndexOf(id);
      if (index !== -1) {
        selectedFlowers.splice(index, 1);
        flowerAdjustments.splice(index, 1);
        if (selectedFlowerIndex === index) selectedFlowerIndex = -1;
        else if (selectedFlowerIndex > index) selectedFlowerIndex -= 1;
      }
    }

    renderBuilder();
  });

  $$(".category-button").forEach((button) => {
    button.setAttribute(
      "aria-pressed",
      String(button.classList.contains("selected")),
    );
    button.addEventListener("click", () => {
      $$(".category-button").forEach((item) => {
        const selected = item === button;
        item.classList.toggle("selected", selected);
        item.setAttribute("aria-pressed", String(selected));
      });
      renderFlowerOptions();
    });
  });

  $("#autoArrange")?.addEventListener("click", () => {
    autoArrangeEnabled = !autoArrangeEnabled;
    selectedFlowerIndex = -1;
    renderBuilder();
  });

  $("#flowerControls")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-flower-control]");
    if (!button || button.disabled || autoArrangeEnabled || selectedFlowerIndex < 0) return;
    const adjustment = flowerAdjustments[selectedFlowerIndex];
    if (!adjustment) return;
    switch (button.dataset.flowerControl) {
      case "rotate-left": adjustment.angle = Math.max(-55, adjustment.angle - 5); break;
      case "rotate-right": adjustment.angle = Math.min(55, adjustment.angle + 5); break;
      case "smaller": adjustment.scale = Math.max(0.65, +(adjustment.scale - 0.05).toFixed(2)); break;
      case "larger": adjustment.scale = Math.min(1.35, +(adjustment.scale + 0.05).toFixed(2)); break;
      case "reset-one": adjustment.angle = 0; adjustment.scale = 1; break;
    }
    renderBuilder();
  });

  wrapping?.addEventListener("change", renderBuilder);

  $("#resetBouquet")?.addEventListener("click", () => {
    selectedFlowers.length = 0;
    flowerAdjustments.length = 0;
    selectedFlowerIndex = -1;
    autoArrangeEnabled = true;
    if (wrapping) wrapping.value = "0";
    renderBuilder();
    showToast("Your arrangement has been reset");
  });

  $("#addBouquet")?.addEventListener("click", () => {
    if (!selectedFlowers.length) return;

    const flowerTotal = selectedFlowers.reduce(
      (sum, id) => sum + flowerData[id].price,
      0,
    );
    const total = flowerTotal + Number(wrapping?.value || 0);

    const counts = selectedFlowers.reduce((result, id) => {
      result[id] = (result[id] || 0) + 1;
      return result;
    }, {});

    const details = Object.entries(counts)
      .map(
        ([id, quantity]) =>
          `${quantity > 1 ? `${quantity}x ` : ""}${flowerData[id].name}`,
      )
      .join(", ");

    const wrapLabel =
      wrapping?.options[wrapping.selectedIndex]?.text.split(" — ")[0] ||
      "No wrapping";

    addToCart({
      name: `Custom Bouquet (${selectedFlowers.length} ${selectedFlowers.length === 1 ? "stem" : "stems"})`,
      price: total,
      icon: "💐",
      quantity: 1,
      detail: wrapping?.value === "0" ? details : `${details}; ${wrapLabel}`,
    });

    openCart();
  });

  /* =====================================================
     8. GUEST CHECKOUT — FORM + ORDER SUMMARY
  ===================================================== */

  const checkoutDialog = $("#checkoutDialog");
  const checkoutForm = $("#checkoutForm");
  const checkoutPanel = $("#checkoutPanel");
  const orderSuccess = $("#orderSuccess");
  const checkoutShipping = $("#checkoutShipping");
  const customerPhoneInput = $("#customerPhone");
  let currentOrder = null;

  function normalizeIndonesianPhone(value) {
    let digits = String(value || "").replace(/\D/g, "");
    if (digits.startsWith("0")) digits = `62${digits.slice(1)}`;
    else if (digits.startsWith("8")) digits = `62${digits}`;
    return digits;
  }

  customerPhoneInput?.addEventListener("blur", () => {
    const normalized = normalizeIndonesianPhone(customerPhoneInput.value);
    if (normalized) customerPhoneInput.value = normalized;
  });

  function shippingValue() {
    return Number(checkoutShipping?.value || 0);
  }

  function renderOrderItems(target, items) {
    if (!target) return;

    if (!items.length) {
      target.innerHTML =
        '<p class="checkout-items-empty">No items in this order.</p>';
      return;
    }

    target.innerHTML = items
      .map(
        (item) => `
      <div class="checkout-order-item">
        <span>
          <strong>${escapeHTML(item.name)}</strong>
          ${item.detail ? `<small>${escapeHTML(item.detail)}</small>` : ""}
          <small>Qty ${item.quantity}</small>
        </span>
        <strong>${money(item.price * item.quantity)}</strong>
      </div>
    `,
      )
      .join("");
  }

  function updateCheckoutTotals() {
    if (!checkoutDialog) return;

    const subtotal = cartSubtotalValue();
    const shipping = shippingValue();

    if ($("#checkoutSubtotal"))
      $("#checkoutSubtotal").textContent = money(subtotal);
    if ($("#checkoutShippingCost"))
      $("#checkoutShippingCost").textContent = money(shipping);
    if ($("#checkoutGrandTotal"))
      $("#checkoutGrandTotal").textContent = money(subtotal + shipping);

    renderOrderItems($("#checkoutItems"), cart);
  }

  function openCheckout() {
    if (!cart.length) return;
    if (!checkoutDialog || typeof checkoutDialog.showModal !== "function") {
      showToast("Checkout dialog is not supported in this browser.");
      return;
    }

    closeCart(false);
    checkoutForm?.reset();
    const submitButton = $(".checkout-submit");
    if (submitButton) submitButton.disabled = false;
    if (checkoutForm) checkoutForm.hidden = false;
    if (checkoutPanel) checkoutPanel.hidden = false;
    if (orderSuccess) orderSuccess.hidden = true;

    checkoutDialog.showModal();
    updateCheckoutTotals();
    $("#customerName")?.focus();
  }

  $("#checkoutButton")?.addEventListener("click", openCheckout);
  checkoutShipping?.addEventListener("change", updateCheckoutTotals);
  $("#closeCheckout")?.addEventListener("click", () => checkoutDialog?.close());
  $("#closeCheckoutSuccess")?.addEventListener("click", () =>
    checkoutDialog?.close(),
  );

  checkoutDialog?.addEventListener("click", (event) => {
    if (event.target === checkoutDialog) checkoutDialog.close();
  });

  checkoutDialog?.addEventListener("close", () => {
    $("#cartButton")?.focus();
  });

  /* =====================================================
     9. ORDER STORAGE + CONFIRMATION
  ===================================================== */

  function saveOrder(order) {
    const orders = readArray(ORDER_STORAGE_KEY);
    orders.unshift(order);
    return writeStorage(ORDER_STORAGE_KEY, orders.slice(0, 30));
  }

  const orderHistoryDialog = $("#orderHistoryDialog");
  const orderHistoryList = $("#orderHistoryList");

  function renderOrderHistory() {
    if (!orderHistoryList) return;
    const orders = readArray(ORDER_STORAGE_KEY);
    if (!orders.length) {
      orderHistoryList.innerHTML = '<p class="history-empty">Belum ada pesanan tersimpan di browser ini.</p>';
      return;
    }
    orderHistoryList.innerHTML = orders.slice(0, 20).map((order) => {
      const date = order.createdAt ? new Date(order.createdAt) : null;
      const dateLabel = date && !Number.isNaN(date.getTime())
        ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(date)
        : "Tanggal tidak tersedia";
      const status = ORDER_STAGES[Math.min(Math.max(Number(order.statusIndex) || 0, 0), ORDER_STAGES.length - 1)];
      const itemSummary = (order.items || []).map((item) => `${escapeHTML(item.name)} ×${Math.max(1, Number(item.quantity) || 1)}`).join(" · ");
      return `<article class="history-order"><div class="history-order-top"><strong>${escapeHTML(order.orderId || "Order")}</strong><span>${escapeHTML(status)}</span></div><small>${escapeHTML(dateLabel)}</small><p>${itemSummary || "Order details unavailable"}</p><div class="history-order-bottom"><span>${money(Number(order.total) || ((order.items || []).reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0) + (Number(order.shipping) || 0)))}</span><small>${escapeHTML(order.customer?.name || "Guest")}</small></div></article>`;
    }).join("");
  }

  $("#openOrderHistory")?.addEventListener("click", () => {
    renderOrderHistory();
    if (orderHistoryDialog?.showModal) {
      closeCart(false);
      orderHistoryDialog.showModal();
    } else {
      showToast("Order history dialog is not supported in this browser.");
    }
  });
  $("#closeOrderHistory")?.addEventListener("click", () => orderHistoryDialog?.close());
  orderHistoryDialog?.addEventListener("click", (event) => {
    if (event.target === orderHistoryDialog) orderHistoryDialog.close();
  });
  orderHistoryDialog?.addEventListener("close", () => $("#cartButton")?.focus());

  function renderTracking(order) {
    const timeline = $("#trackingTimeline");
    if (!timeline) return;

    const descriptions = [
      "Order has been received.",
      "The florist is preparing your arrangement.",
      "Your order has been handed to the courier.",
      "Your order has reached the customer.",
    ];

    timeline.innerHTML = ORDER_STAGES.map((stage, index) => {
      const state =
        index < order.statusIndex
          ? "completed"
          : index === order.statusIndex
            ? "current"
            : "";
      const marker = index < order.statusIndex ? "✓" : String(index + 1);
      return `
        <div class="tracking-step ${state}">
          <span class="tracking-dot">${marker}</span>
          <div>
            <strong>${stage}</strong>
            <small>${descriptions[index]}</small>
          </div>
        </div>
      `;
    }).join("");

    const advanceButton = $("#advanceOrderStatus");
    if (advanceButton) {
      const isDelivered = order.statusIndex >= ORDER_STAGES.length - 1;
      advanceButton.disabled = isDelivered;
      advanceButton.textContent = isDelivered
        ? "Order delivered"
        : `Demo: advance to ${ORDER_STAGES[order.statusIndex + 1]}`;
    }
  }

  function getOrderAddress(customer) {
    return [
      customer.address,
      customer.district,
      customer.city,
      customer.province,
      customer.postalCode,
    ]
      .filter(Boolean)
      .join(", ");
  }

  checkoutForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!cart.length || !checkoutForm.reportValidity()) return;
    const normalizedPhone = normalizeIndonesianPhone(customerPhoneInput?.value);
    if (!/^62[0-9]{8,13}$/.test(normalizedPhone)) {
      customerPhoneInput?.setCustomValidity("Gunakan nomor WhatsApp Indonesia yang valid, contoh 081234567890.");
      customerPhoneInput?.reportValidity();
      customerPhoneInput?.addEventListener("input", () => customerPhoneInput.setCustomValidity(""), { once: true });
      return;
    }
    if (customerPhoneInput) customerPhoneInput.value = normalizedPhone;

    const data = new FormData(checkoutForm);
    const subtotal = cartSubtotalValue();
    const shipping = shippingValue();
    const randomSuffix = Math.random().toString(36).slice(2, 4).toUpperCase();
    const orderId = `LRM-${Date.now().toString().slice(-8)}-${randomSuffix}`;

    currentOrder = {
      orderId,
      createdAt: new Date().toISOString(),
      customer: {
        name: String(data.get("customerName") || "").trim(),
        phone: normalizeIndonesianPhone(data.get("customerPhone")),
        province: String(data.get("province") || "").trim(),
        city: String(data.get("city") || "").trim(),
        district: String(data.get("district") || "").trim(),
        postalCode: String(data.get("postalCode") || "").trim(),
        address: String(data.get("address") || "").trim(),
        notes: String(data.get("deliveryNotes") || "").trim(),
      },
      payment: String(data.get("paymentMethod") || ""),
      shippingLabel:
        checkoutShipping?.selectedOptions[0]?.textContent.trim() ||
        "Shipping simulation",
      items: cart.map((item) => ({ ...item })),
      subtotal,
      shipping,
      total: subtotal + shipping,
      statusIndex: 0,
    };

    const orderSaved = saveOrder(currentOrder);
    renderOrderHistory();
    const submitButton = $(".checkout-submit");
    if (submitButton) submitButton.disabled = true;
    cart.length = 0;
    renderCart();

    if (checkoutForm) checkoutForm.hidden = true;
    if (checkoutPanel) checkoutPanel.hidden = true;
    if (orderSuccess) orderSuccess.hidden = false;

    if ($("#successOrderNumber"))
      $("#successOrderNumber").textContent = currentOrder.orderId;
    if ($("#successOrderName"))
      $("#successOrderName").textContent = currentOrder.customer.name;
    if ($("#successPayment"))
      $("#successPayment").textContent = currentOrder.payment;
    if ($("#successOrderTotal"))
      $("#successOrderTotal").textContent = money(currentOrder.total);
    if ($("#successShippingCost"))
      $("#successShippingCost").textContent = money(currentOrder.shipping);
    if ($("#successDeliveryAddress"))
      $("#successDeliveryAddress").textContent = getOrderAddress(
        currentOrder.customer,
      );

    renderOrderItems($("#successOrderItems"), currentOrder.items);
    renderTracking(currentOrder);

    const feedback = $("#whatsappFeedback");
    if (feedback) {
      feedback.textContent = orderSaved
        ? "Demo order saved in this browser. Payment has not been verified."
        : "Order displayed, but browser storage is unavailable. Payment has not been verified.";
    }
  });

  /* =====================================================
     10. DEMO DELIVERY STATUS
  ===================================================== */

  $("#advanceOrderStatus")?.addEventListener("click", () => {
    if (!currentOrder || currentOrder.statusIndex >= ORDER_STAGES.length - 1)
      return;

    currentOrder.statusIndex += 1;
    const orders = readArray(ORDER_STORAGE_KEY);
    const existingIndex = orders.findIndex(
      (order) => order.orderId === currentOrder.orderId,
    );

    if (existingIndex >= 0) {
      orders[existingIndex] = currentOrder;
      writeStorage(ORDER_STORAGE_KEY, orders);
    }

    renderTracking(currentOrder);
  });

  /* =====================================================
     11. WHATSAPP ORDER CONFIRMATION
  ===================================================== */

  $("#sendWhatsAppOrder")?.addEventListener("click", () => {
    if (!currentOrder) return;

    const customer = currentOrder.customer;
    const address = getOrderAddress(customer);
    const itemLines = currentOrder.items.map(
      (item) =>
        `- ${item.name}${item.detail ? ` (${item.detail})` : ""} x${item.quantity}: ${money(item.price * item.quantity)}`,
    );

    const message = [
      `Halo Lorem, saya ingin konfirmasi pesanan ${currentOrder.orderId}.`,
      `Nama: ${customer.name}`,
      `WhatsApp: ${customer.phone}`,
      `Alamat: ${address}`,
      `Catatan kurir: ${customer.notes || "-"}`,
      `Pembayaran: ${currentOrder.payment}`,
      `Pengiriman: ${currentOrder.shippingLabel}`,
      ...itemLines,
      `Subtotal: ${money(currentOrder.subtotal)}`,
      `Ongkir: ${money(currentOrder.shipping)}`,
      `TOTAL: ${money(currentOrder.total)}`,
      "Catatan: pembayaran belum diverifikasi oleh sistem.",
    ].join("\n");

    const feedback = $("#whatsappFeedback");
    if (!/^62\d{8,15}$/.test(WHATSAPP_NUMBER)) {
      if (feedback)
        feedback.textContent =
          "Nomor WhatsApp toko belum diatur. Isi WHATSAPP_NUMBER di script.js sebelum demo.";
      return;
    }

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    const popup = window.open(url, "_blank");

    if (popup) {
      popup.opener = null;
      if (feedback)
        feedback.textContent =
          "Pesanan siap dikirim melalui WhatsApp. Periksa kembali detail sebelum mengirim.";
    } else if (feedback) {
      feedback.textContent =
        "Browser memblokir tab baru. Izinkan pop-up lalu coba kembali.";
    }
  });

  /* =====================================================
     12. KEYBOARD SUPPORT
  ===================================================== */

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (cartDrawer?.classList.contains("open")) closeCart();
      if (mainNav?.classList.contains("open")) {
        closeMenu();
        menuToggle?.focus();
      }
    }

    if (event.key === "Tab" && cartDrawer?.classList.contains("open")) {
      const focusable = $$(
        'button:not([disabled]), a[href], select, input, [tabindex]:not([tabindex="-1"])',
        cartDrawer,
      ).filter(
        (element) =>
          !element.hidden && element.getAttribute("aria-hidden") !== "true",
      );

      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (
        event.shiftKey &&
        (document.activeElement === first ||
          !cartDrawer.contains(document.activeElement))
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          !cartDrawer.contains(document.activeElement))
      ) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  /* =====================================================
     13. INITIAL STATE
  ===================================================== */

  selectShopProduct(activeProductId);
  updateShopListing();
  renderBuilder();
  renderCart();
})();
