(() => {
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  const rupiah = (value) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    })
      .format(value)
      .replace(/\s/g, "");

  document.documentElement.classList.add("js-ready");

  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  // =========================================
  // MOBILE NAVIGATION
  // =========================================

  const menuToggle = $("#menuToggle");
  const mainNav = $("#mainNav");

  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";

      menuToggle.setAttribute("aria-expanded", String(!isOpen));
      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Open navigation" : "Close navigation"
      );

      mainNav.classList.toggle("open", !isOpen);
    });

    $$(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        $$(".nav-link").forEach((item) =>
          item.classList.remove("active")
        );

        link.classList.add("active");
        mainNav.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation");
      });
    });
  }

  // =========================================
  // ACTIVE SECTION & SCROLL REVEAL
  // =========================================

  const sections = $$("main section[id]");

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            $$(".nav-link").forEach((link) => {
              link.classList.toggle(
                "active",
                link.getAttribute("href") === `#${entry.target.id}`
              );
            });
          }
        });
      },
      { rootMargin: "-35% 0px -55% 0px" }
    );

    sections.forEach((section) => sectionObserver.observe(section));

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    $$(
      ".section-heading, .shop-feature, .product-strip, .builder-workspace, .builder-checkout, .about-copy, .footer-main"
    ).forEach((element) => {
      element.classList.add("reveal");
      revealObserver.observe(element);
    });
  }

  // =========================================
  // SHOP PRODUCT SELECTION
  // =========================================

  const shopProducts = {
    "white-lily": {
      name: "White Lily",
      subtitle: "Arrangement",
      description:
        "An elegant arrangement of delicate lilies, made to bring a soft and lasting touch to your space.",
      price: 200000,
      image: "assets/flowers/lilly.svg",
      index: "FEATURED PIECE / 001",
    },

    "blush-tulip": {
      name: "Blush Tulip",
      subtitle: "Arrangement",
      description:
        "Soft blush tulips arranged to bring a gentle touch of colour to your favourite corner.",
      price: 150000,
      image: "assets/flowers/tulip.svg",
      index: "CURATED PIECE / 002",
    },

    "lavender-bloom": {
      name: "Lavender",
      subtitle: "Bloom",
      description:
        "A delicate lavender-inspired arrangement with a calm, timeless character.",
      price: 175000,
      image: "assets/flowers/purple.svg",
      index: "CURATED PIECE / 003",
    },
  };

  $$(".shop-product-card").forEach((card) => {
    card.addEventListener("click", () => {
      const id = card.dataset.shopProduct;
      const product = shopProducts[id];

      if (!product) return;

      $$(".shop-product-card").forEach((item) => {
        const selected = item === card;

        item.classList.toggle("is-selected", selected);
        item.setAttribute("aria-pressed", String(selected));
      });

      const indexElement = $("#shopProductIndex");
      const nameElement = $("#shopProductName");
      const descriptionElement = $("#shopProductDescription");
      const priceElement = $("#shopProductPrice");
      const addButton = $("#shopAddButton");

      if (indexElement) indexElement.textContent = product.index;

      if (nameElement) {
        nameElement.innerHTML =
          `${product.name}<br /><em>${product.subtitle}</em>`;
      }

      if (descriptionElement) {
        descriptionElement.textContent = product.description;
      }

      if (priceElement) {
        priceElement.textContent = rupiah(product.price);
      }

      if (addButton) {
        addButton.dataset.addProduct = id;
      }

      const bouquetImage = $("#shopChairBouquet");

      if (bouquetImage) {
        bouquetImage.style.display = "block";
        bouquetImage.src = product.image;
        bouquetImage.alt = `${product.name} ${product.subtitle}`;

        bouquetImage.onerror = () => {
          bouquetImage.style.display = "none";
        };
      }
    });
  });

  // =========================================
  // SHOP CART DATA
  // =========================================

  const products = {
    "white-lily": {
      name: "White Lily Arrangement",
      price: 200000,
      icon: "✿",
    },

    "blush-tulip": {
      name: "Blush Tulip",
      price: 150000,
      icon: "🌷",
    },

    "lavender-bloom": {
      name: "Lavender Bloom",
      price: 175000,
      icon: "✿",
    },
  };

  const cart = [];

  const cartDrawer = $("#cartDrawer");
  const cartBackdrop = $("#cartBackdrop");
  const cartItems = $("#cartItems");
  const toast = $("#toast");

  let toastTimer;

  // =========================================
  // TOAST NOTIFICATION
  // =========================================

  function showToast(message) {
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2400);
  }

  // =========================================
  // CART DRAWER
  // =========================================

  function openCart() {
    if (!cartDrawer || !cartBackdrop) return;

    cartDrawer.classList.add("open");
    cartDrawer.setAttribute("aria-hidden", "false");
    cartDrawer.inert = false;

    cartBackdrop.hidden = false;
    document.body.style.overflow = "hidden";

    $("#closeCart")?.focus();
  }

  function closeCart() {
    if (!cartDrawer || !cartBackdrop) return;

    const wasOpen = cartDrawer.classList.contains("open");

    cartDrawer.classList.remove("open");
    cartDrawer.setAttribute("aria-hidden", "true");
    cartDrawer.inert = true;

    cartBackdrop.hidden = true;
    document.body.style.overflow = "";

    if (wasOpen) $("#cartButton")?.focus();
  }

  // =========================================
  // RENDER CART
  // =========================================

  function renderCart() {
    if (!cartItems) return;

    const count = cart.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    const total = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    if ($("#cartCount")) {
      $("#cartCount").textContent = count;
    }

    if ($("#drawerCount")) {
      $("#drawerCount").textContent = `(${count})`;
    }

    if ($("#cartSubtotal")) {
      $("#cartSubtotal").textContent = rupiah(total);
    }

    if ($("#checkoutButton")) {
      $("#checkoutButton").disabled = count === 0;
    }

    if (!cart.length) {
      cartItems.innerHTML =
        '<p class="cart-empty">Your cart is empty for now.</p>';

      return;
    }

    cartItems.innerHTML = cart
      .map(
        (item, index) => `
          <div class="cart-item">
            <div class="cart-item-art">${item.icon}</div>

            <div class="cart-item-info">
              <strong>${item.name}</strong>
              <small>Qty ${item.quantity}</small>

              ${
                item.detail
                  ? `<small class="cart-item-detail">${item.detail}</small>`
                  : ""
              }
            </div>

            <span class="cart-item-price">
              ${rupiah(item.price * item.quantity)}
            </span>

            <button
              class="cart-remove"
              type="button"
              data-remove="${index}"
              aria-label="Remove ${item.name}"
            >
              ×
            </button>
          </div>
        `
      )
      .join("");
  }

  // =========================================
  // ADD TO CART
  // =========================================

  function addToCart(item) {
    const existing = cart.find(
      (row) =>
        row.name === item.name &&
        row.detail === item.detail
    );

    if (existing) {
      existing.quantity += item.quantity || 1;
    } else {
      cart.push({
        ...item,
        quantity: item.quantity || 1,
      });
    }

    renderCart();
    showToast(`${item.name} added to your cart`);
  }

  $$("[data-add-product]").forEach((button) => {
    button.addEventListener("click", () => {
      const product = products[button.dataset.addProduct];

      if (product) {
        addToCart({
          ...product,
          quantity: 1,
        });
      }
    });
  });

  $("#cartButton")?.addEventListener("click", openCart);
  $("#closeCart")?.addEventListener("click", closeCart);
  cartBackdrop?.addEventListener("click", closeCart);

  cartItems?.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-remove]");

    if (!removeButton) return;

    cart.splice(Number(removeButton.dataset.remove), 1);
    renderCart();
  });

  // =========================================
  // CHECKOUT
  // =========================================

  $("#checkoutButton")?.addEventListener("click", () => {
    const lines = cart.map(
      (item) =>
        `${item.name}${
          item.detail ? ` (${item.detail})` : ""
        } x${item.quantity} — ${rupiah(item.price * item.quantity)}`
    );

    const total = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const message =
      `Halo Lorem, saya ingin memesan:\n` +
      `${lines.join("\n")}\n` +
      `Total: ${rupiah(total)}`;

    // Masukkan nomor WhatsApp toko di sini.
    // Gunakan kode negara tanpa tanda + atau spasi.
    const whatsappNumber = "";

    if (whatsappNumber) {
      window.open(
        `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
        "_blank",
        "noopener"
      );
    } else {
      showToast(
        "Demo checkout: connect your WhatsApp number in script.js"
      );
    }
  });

  // =========================================
  // KEYBOARD ESCAPE
  // =========================================

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    closeCart();

    if (
      menuToggle &&
      menuToggle.getAttribute("aria-expanded") === "true"
    ) {
      mainNav?.classList.remove("open");

      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
      menuToggle.focus();
    }
  });

  // =========================================
  // BOUQUET BUILDER DATA
  // =========================================

  const flowerData = {
    "lily-white": {
      name: "White Lily",
      price: 35000,
      category: "lily",
      glyph: "✿",
      color: "#e9e1c9",
      size: 54,
    },

    "lily-pink": {
      name: "Pink Lily",
      price: 35000,
      category: "lily",
      glyph: "✿",
      color: "#d98b9c",
      size: 51,
    },

    "tulip-pink": {
      name: "Pink Tulip",
      price: 25000,
      category: "tulip",
      glyph: "🌷",
      color: "#d88c9b",
      size: 43,
    },

    "tulip-white": {
      name: "White Tulip",
      price: 25000,
      category: "tulip",
      glyph: "🌷",
      color: "#e9e1d6",
      size: 43,
    },

    lavender: {
      name: "Lavender",
      price: 15000,
      category: "filler",
      glyph: "✿",
      color: "#a18bb8",
      size: 34,
    },

    "baby-breath": {
      name: "Baby's Breath",
      price: 12000,
      category: "filler",
      glyph: "✳",
      color: "#b7c7ad",
      size: 29,
    },
  };

  const selectedFlowers = [];

  const previewBlooms = $("#previewBlooms");
  const previewStems = $("#previewStems");
  const wrapping = $("#wrapping");
  const flowerOptions = $("#flowerOptions");

  // =========================================
  // RENDER FLOWER OPTIONS
  // =========================================

  function renderFlowerOptions() {
    if (!flowerOptions) return;

    flowerOptions.innerHTML = Object.entries(flowerData)
      .map(([id, flower]) => {
        const quantity = selectedFlowers.filter(
          (selected) => selected === id
        ).length;

        return `
          <article class="flower-option" data-flower="${id}">
            <span class="flower-thumb" aria-hidden="true">
              ${flower.glyph}
            </span>

            <span class="flower-info">
              <strong>${flower.name}</strong>
              <small>${rupiah(flower.price)} / stem</small>
            </span>

            <span class="quantity-control">
              <button
                type="button"
                class="quantity-button"
                data-qty-change="-1"
                data-flower-id="${id}"
                aria-label="Remove one ${flower.name}"
                ${quantity === 0 ? "disabled" : ""}
              >
                −
              </button>

              <output class="quantity-value">${quantity}</output>

              <button
                type="button"
                class="quantity-button"
                data-qty-change="1"
                data-flower-id="${id}"
                aria-label="Add one ${flower.name}"
              >
                +
              </button>
            </span>
          </article>
        `;
      })
      .join("");

    const category =
      $(".category-button.selected")?.dataset.category || "all";

    $$(".flower-option", flowerOptions).forEach((option) => {
      option.hidden =
        category !== "all" &&
        flowerData[option.dataset.flower].category !== category;
    });

    const availableCount = $("#availableCount");

    if (availableCount) {
      availableCount.textContent =
        `${$$(".flower-option:not([hidden])", flowerOptions).length
          .toString()
          .padStart(2, "0")} ITEMS`;
    }
  }

  // =========================================
  // RENDER BOUQUET PREVIEW
  // =========================================

  function renderBuilder() {
    if (!flowerOptions || !wrapping) return;

    renderFlowerOptions();

    const count = selectedFlowers.length;

    const flowerTotal = selectedFlowers.reduce(
      (sum, id) => sum + flowerData[id].price,
      0
    );

    const wrapTotal = Number(wrapping.value);
    const total = flowerTotal + wrapTotal;

    if ($("#flowerCount")) {
      $("#flowerCount").textContent =
        `${count} flower${count === 1 ? "" : "s"} selected`;
    }

    if ($("#builderTotal")) {
      $("#builderTotal").textContent = rupiah(total);
    }

    if ($("#builderSummary")) {
      $("#builderSummary").textContent = count
        ? `${count} ${
            count === 1 ? "stem" : "stems"
          } · ${
            wrapping.options[wrapping.selectedIndex].text.split(" — ")[0]
          }`
        : "Your bouquet is waiting";
    }

    if ($("#addBouquet")) {
      $("#addBouquet").disabled = count === 0;
    }

    if (!count) {
      if (previewBlooms) {
        previewBlooms.innerHTML = `
          <div class="empty-preview">
            <span>✿</span>
            <p>Your bouquet starts here</p>
            <small>Select flowers to add them</small>
          </div>
        `;
      }

      if (previewStems) {
        previewStems.innerHTML = "";
      }

      return;
    }

    const positions = [
      [50, 25, -8],
      [31, 37, -18],
      [69, 37, 16],
      [40, 13, -12],
      [61, 14, 12],
      [23, 52, -25],
      [77, 52, 22],
      [50, 48, 0],
      [35, 58, -12],
      [65, 58, 14],
      [17, 30, -28],
      [83, 30, 28],
    ];

    if (previewBlooms) {
      previewBlooms.innerHTML = selectedFlowers
        .map((id, index) => {
          const flower = flowerData[id];
          const [x, y, rotation] =
            positions[index % positions.length];

          const size = Math.max(
            25,
            flower.size -
              Math.floor(index / positions.length) * 4
          );

          return `
            <span
              class="preview-bloom"
              title="${flower.name}"
              style="
                --x:${x}%;
                --y:${y}%;
                --rotation:${rotation}deg;
                --size:${size}px;
                --bloom-color:${flower.color};
              "
            >
              ${flower.glyph}
            </span>
          `;
        })
        .join("");
    }

    if (previewStems) {
      previewStems.innerHTML = selectedFlowers
        .map((id, index) => {
          const angle = (index - (count - 1) / 2) * 7;
          const height = 68 + (index % 3) * 9;

          return `
            <span
              class="preview-stem"
              style="
                --stem-rotation:${angle}deg;
                --stem-height:${height}%;
              "
            ></span>
          `;
        })
        .join("");
    }
  }

  // =========================================
  // ADD / REMOVE FLOWERS
  // =========================================

  function addFlower(id) {
    if (!flowerData[id]) return;

    if (selectedFlowers.length >= 12) {
      showToast("Maximum 12 stems for this bouquet");
      return;
    }

    selectedFlowers.push(id);

    renderBuilder();
    showToast(`${flowerData[id].name} added to your bouquet`);
  }

  function removeFlower(id) {
    const index = selectedFlowers.lastIndexOf(id);

    if (index === -1) return;

    selectedFlowers.splice(index, 1);
    renderBuilder();
  }

  // Event delegation for flower options and quantity buttons.
  flowerOptions?.addEventListener("click", (event) => {
    const quantityButton = event.target.closest("[data-qty-change]");

    if (quantityButton) {
      const id = quantityButton.dataset.flowerId;
      const change = Number(quantityButton.dataset.qtyChange);

      if (change > 0) {
        addFlower(id);
      } else {
        removeFlower(id);
      }

      return;
    }

    const flowerOption = event.target.closest(".flower-option");

    if (flowerOption) {
      addFlower(flowerOption.dataset.flower);
    }
  });

  // =========================================
  // CATEGORY FILTER
  // =========================================

  $$(".category-button").forEach((button) => {
    button.addEventListener("click", () => {
      $$(".category-button").forEach((item) => {
        item.classList.toggle("selected", item === button);
      });

      const category = button.dataset.category;

      $$(".flower-option", flowerOptions).forEach((option) => {
        option.hidden =
          category !== "all" &&
          flowerData[option.dataset.flower].category !== category;
      });

      const availableCount = $("#availableCount");

      if (availableCount) {
        availableCount.textContent =
          `${$$(".flower-option:not([hidden])", flowerOptions).length
            .toString()
            .padStart(2, "0")} ITEMS`;
      }
    });
  });

  // =========================================
  // WRAPPING SELECTION
  // =========================================

  wrapping?.addEventListener("change", renderBuilder);

  // =========================================
  // RESET BOUQUET
  // =========================================

  $("#resetBouquet")?.addEventListener("click", () => {
    selectedFlowers.length = 0;

    if (wrapping) {
      wrapping.value = "0";
    }

    renderBuilder();
    showToast("Your arrangement has been reset");
  });

  // =========================================
  // ADD CUSTOM BOUQUET TO CART
  // =========================================

  $("#addBouquet")?.addEventListener("click", () => {
    if (!selectedFlowers.length) return;

    const flowerTotal = selectedFlowers.reduce(
      (sum, id) => sum + flowerData[id].price,
      0
    );

    const total = flowerTotal + Number(wrapping.value);

    const flowerCounts = selectedFlowers.reduce(
      (counts, id) => {
        counts[id] = (counts[id] || 0) + 1;
        return counts;
      },
      {}
    );

    const names = Object.entries(flowerCounts)
      .map(([id, quantity]) =>
        quantity > 1
          ? `${quantity}x ${flowerData[id].name}`
          : flowerData[id].name
      )
      .join(", ");

    const wrappingName = wrapping.options[
      wrapping.selectedIndex
    ].text.split(" — ")[0];

    addToCart({
      name: `Custom Bouquet (${selectedFlowers.length} ${
        selectedFlowers.length === 1 ? "stem" : "stems"
      })`,
      price: total,
      icon: "💐",
      quantity: 1,
      detail:
        wrapping.value === "0"
          ? names
          : `${names}; ${wrappingName}`,
    });

    openCart();
  });

  // =========================================
  // INITIALIZE
  // =========================================

  renderBuilder();
  renderCart();
})();