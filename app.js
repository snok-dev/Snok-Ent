// =====================================================================
//  Snok Enterprise store - all the page logic lives here.
//  Settings are in config.js and products are in products.js.
// =====================================================================

// ----- Small helpers -----

// Make text safe to put inside HTML (stops odd characters breaking the page)
function esc(text) {
  return String(text).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

const nairaFormat = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

function money(amount) {
  return nairaFormat.format(amount);
}

function getProduct(id) {
  return PRODUCTS.find(function (p) { return p.id === id; });
}

function categoryName(id) {
  const category = CATEGORIES.find(function (c) { return c.id === id; });
  return category ? category.name : "";
}

// The price per unit depends on how many you buy
function unitPrice(product, qty) {
  return qty >= product.wholesaleMinQty ? product.wholesalePrice : product.retailPrice;
}

function load(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value === null ? fallback : value;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Saving isn't available (e.g. private browsing) - the site still works
  }
}

function whatsappLink(message) {
  return "https://wa.me/" + STORE.whatsapp + (message ? "?text=" + encodeURIComponent(message) : "");
}

function emailLink(subject, body) {
  return "mailto:" + STORE.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
}

let toastTimer;
function toast(message) {
  const box = document.getElementById("toast");
  box.textContent = message;
  box.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { box.classList.remove("show"); }, 2500);
}

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
  "Taraba", "Yobe", "Zamfara"
];

// ----- Product pictures -----
// Simple drawings for each category, used when a product has no photo.
const ART = {
  "solar-panels": '<svg viewBox="0 0 120 100"><path d="M30 72 L24 92 M90 72 L96 92" stroke="#64748b" stroke-width="4"/><rect x="14" y="14" width="92" height="60" rx="4" fill="#1e3a8a"/><g stroke="#93c5fd" stroke-width="1.5" opacity=".7"><path d="M37 14v60M60 14v60M83 14v60M14 34h92M14 54h92"/></g></svg>',
  "inverters": '<svg viewBox="0 0 120 100"><rect x="28" y="10" width="64" height="80" rx="8" fill="#f1f5f9" stroke="#334155" stroke-width="3"/><rect x="40" y="22" width="40" height="22" rx="3" fill="#0f172a"/><text x="60" y="38" font-size="11" fill="#4ade80" text-anchor="middle" font-family="monospace">230V</text><circle cx="48" cy="60" r="4" fill="#22c55e"/><circle cx="60" cy="60" r="4" fill="#f59e0b"/><circle cx="72" cy="60" r="4" fill="#ef4444"/><path d="M40 76h40" stroke="#94a3b8" stroke-width="3"/></svg>',
  "batteries": '<svg viewBox="0 0 120 100"><rect x="22" y="22" width="76" height="62" rx="6" fill="#0f766e"/><rect x="34" y="14" width="14" height="10" rx="2" fill="#334155"/><rect x="72" y="14" width="14" height="10" rx="2" fill="#334155"/><path d="M63 34 L50 56 H60 L56 74 L72 50 H62 Z" fill="#fde047"/></svg>',
  "charge-controllers": '<svg viewBox="0 0 120 100"><rect x="20" y="18" width="80" height="64" rx="8" fill="#1f2937"/><rect x="32" y="28" width="56" height="20" rx="3" fill="#bef264"/><text x="60" y="43" font-size="11" fill="#1f2937" text-anchor="middle" font-family="monospace">MPPT</text><g fill="#9ca3af"><rect x="30" y="60" width="12" height="12" rx="2"/><rect x="48" y="60" width="12" height="12" rx="2"/><rect x="66" y="60" width="12" height="12" rx="2"/></g></svg>',
  "solar-kits": '<svg viewBox="0 0 120 100"><circle cx="92" cy="22" r="11" fill="#f59e0b"/><rect x="10" y="40" width="58" height="36" rx="3" fill="#1e3a8a"/><g stroke="#93c5fd" stroke-width="1.2" opacity=".7"><path d="M29 40v36M48 40v36M10 58h58"/></g><rect x="76" y="46" width="30" height="40" rx="4" fill="#f1f5f9" stroke="#334155" stroke-width="2.5"/><rect x="82" y="52" width="18" height="9" rx="2" fill="#0f172a"/></svg>',
  "solar-lights": '<svg viewBox="0 0 120 100"><path d="M60 92 V36" stroke="#475569" stroke-width="5"/><rect x="32" y="14" width="56" height="14" rx="3" fill="#1e3a8a"/><path d="M60 36 h28 v8 h-28z" fill="#334155"/><path d="M70 44 L60 74 H100 L90 44 Z" fill="#fde047" opacity=".55"/></svg>',
  "accessories": '<svg viewBox="0 0 120 100"><path d="M18 70 C40 20, 70 90, 100 34" fill="none" stroke="#dc2626" stroke-width="6" stroke-linecap="round"/><path d="M18 80 C44 40, 76 98, 102 50" fill="none" stroke="#111827" stroke-width="6" stroke-linecap="round"/><rect x="92" y="22" width="18" height="12" rx="3" fill="#475569"/></svg>'
};

function productImage(product) {
  if (product.image) {
    return '<img src="' + esc(product.image) + '" alt="' + esc(product.name) + '" loading="lazy">';
  }
  return '<div class="art art-' + product.category + '">' + (ART[product.category] || "") + "</div>";
}

// =====================================================================
//  CART  - saved as a list of { id, qty }
// =====================================================================

let cart = load("snok-cart", []).filter(function (line) { return getProduct(line.id); });

function saveCart() {
  save("snok-cart", cart);
  updateCartCount();
}

function cartQty(id) {
  const line = cart.find(function (l) { return l.id === id; });
  return line ? line.qty : 0;
}

function addToCart(id, qty) {
  const product = getProduct(id);
  if (!product || !product.inStock) return;
  const line = cart.find(function (l) { return l.id === id; });
  if (line) line.qty += qty;
  else cart.push({ id: id, qty: qty });
  saveCart();
  toast("Added to cart: " + product.name);
}

function setCartQty(id, qty) {
  if (qty < 1) {
    cart = cart.filter(function (l) { return l.id !== id; });
  } else {
    const line = cart.find(function (l) { return l.id === id; });
    if (line) line.qty = qty;
  }
  saveCart();
}

// Work out prices for everything in the cart
function cartSummary() {
  const lines = cart.map(function (line) {
    const product = getProduct(line.id);
    const price = unitPrice(product, line.qty);
    return {
      product: product,
      qty: line.qty,
      price: price,
      total: price * line.qty,
      isWholesale: line.qty >= product.wholesaleMinQty
    };
  });
  let subtotal = 0;
  let retailTotal = 0;
  let count = 0;
  lines.forEach(function (l) {
    subtotal += l.total;
    retailTotal += l.product.retailPrice * l.qty;
    count += l.qty;
  });
  return { lines: lines, subtotal: subtotal, savings: retailTotal - subtotal, count: count };
}

function updateCartCount() {
  document.getElementById("cart-count").textContent = cartSummary().count;
}

// =====================================================================
//  PAGES
// =====================================================================

const app = document.getElementById("app");

function productCard(product) {
  const button = product.inStock
    ? '<button class="btn btn-primary btn-block" data-action="add" data-id="' + product.id + '">Add to cart</button>'
    : '<button class="btn btn-block" disabled>Out of stock</button>';
  return (
    '<article class="card">' +
      '<a href="#/product/' + product.id + '" class="card-image">' + productImage(product) + "</a>" +
      '<div class="card-body">' +
        '<span class="card-category">' + esc(categoryName(product.category)) + "</span>" +
        '<a href="#/product/' + product.id + '" class="card-title">' + esc(product.name) + "</a>" +
        '<div class="card-price">' + money(product.retailPrice) + "</div>" +
        '<div class="card-wholesale">Wholesale: <strong>' + money(product.wholesalePrice) + "</strong> each for " + product.wholesaleMinQty + "+ units</div>" +
        button +
      "</div>" +
    "</article>"
  );
}

// ----- Home -----
function renderHome() {
  const featured = PRODUCTS.filter(function (p) { return p.featured; });
  app.innerHTML =
    '<section class="hero">' +
      '<div class="hero-text">' +
        '<span class="eyebrow">Solar &amp; inverter specialists</span>' +
        "<h1>Steady power for your home and business</h1>" +
        "<p>" + esc(STORE.tagline) + ". Buy one unit at retail price, or buy in bulk and pay wholesale prices automatically.</p>" +
        '<div class="hero-buttons">' +
          '<a href="#/shop" class="btn btn-primary btn-large">Shop now</a>' +
          '<a href="#/calculator" class="btn btn-light btn-large">Size my solar system</a>' +
        "</div>" +
      "</div>" +
      '<div class="hero-art">' + ART["solar-kits"] + "</div>" +
    "</section>" +

    '<section class="benefits">' +
      '<div><strong>Retail &amp; wholesale</strong><span>Bulk prices apply automatically</span></div>' +
      '<div><strong>Delivery across Nigeria</strong><span>Or pick up from our shop</span></div>' +
      '<div><strong>Flexible payment</strong><span>Bank transfer or pay on delivery</span></div>' +
      '<div><strong>Expert advice</strong><span>Chat with us on WhatsApp</span></div>' +
    "</section>" +

    '<section class="section">' +
      '<h2 class="section-title">Shop by category</h2>' +
      '<div class="category-grid">' +
        CATEGORIES.map(function (c) {
          const count = PRODUCTS.filter(function (p) { return p.category === c.id; }).length;
          return '<a class="category-tile" href="#/shop?cat=' + c.id + '">' +
            '<div class="art art-' + c.id + '">' + ART[c.id] + "</div>" +
            "<strong>" + esc(c.name) + "</strong><span>" + count + " products</span></a>";
        }).join("") +
      "</div>" +
    "</section>" +

    '<section class="section">' +
      '<div class="section-head"><h2 class="section-title">Popular products</h2><a href="#/shop">View all →</a></div>' +
      '<div class="product-grid">' + featured.map(productCard).join("") + "</div>" +
    "</section>" +

    '<section class="wholesale-banner">' +
      "<div><h2>Buying for your business or a project?</h2>" +
      "<p>Installers, resellers and contractors pay wholesale prices once they reach the minimum quantity shown on each product. Need a bigger quote? Message us.</p></div>" +
      '<a class="btn btn-whatsapp btn-large" target="_blank" rel="noopener" href="' +
        whatsappLink("Hello " + STORE.name + ", I'd like a wholesale quote.") + '">Get a wholesale quote</a>' +
    "</section>";
}

// ----- Shop (all products, with search, filter and sort) -----
function renderShop(params) {
  const selectedCategory = params.get("cat") || "all";
  const search = params.get("q") || "";
  const sort = params.get("sort") || "featured";

  app.innerHTML =
    '<div class="page-head"><h1>Shop</h1><p>Prices shown are retail. Wholesale prices apply automatically in your cart.</p></div>' +
    '<div class="shop-layout">' +
      '<aside class="shop-filters">' +
        "<h3>Categories</h3>" +
        '<div class="category-list">' +
          '<button class="chip" data-cat="all">All products</button>' +
          CATEGORIES.map(function (c) {
            return '<button class="chip" data-cat="' + c.id + '">' + esc(c.name) + "</button>";
          }).join("") +
        "</div>" +
        '<label class="check"><input type="checkbox" id="in-stock-only"> In stock only</label>' +
      "</aside>" +
      "<div>" +
        '<div class="shop-toolbar">' +
          '<input type="search" id="shop-search" placeholder="Search products..." value="' + esc(search) + '">' +
          '<select id="shop-sort">' +
            '<option value="featured">Sort: Popular</option>' +
            '<option value="price-low">Price: low to high</option>' +
            '<option value="price-high">Price: high to low</option>' +
            '<option value="name">Name: A to Z</option>' +
          "</select>" +
        "</div>" +
        '<p id="result-count" class="muted"></p>' +
        '<div id="shop-grid" class="product-grid"></div>' +
      "</div>" +
    "</div>";

  let currentCategory = selectedCategory;
  const searchInput = document.getElementById("shop-search");
  const sortSelect = document.getElementById("shop-sort");
  const stockCheckbox = document.getElementById("in-stock-only");
  sortSelect.value = sort;

  function update() {
    const words = searchInput.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    let results = PRODUCTS.filter(function (p) {
      if (currentCategory !== "all" && p.category !== currentCategory) return false;
      if (stockCheckbox.checked && !p.inStock) return false;
      const haystack = (p.name + " " + p.description + " " + categoryName(p.category)).toLowerCase();
      return words.every(function (w) { return haystack.includes(w); });
    });

    if (sortSelect.value === "price-low") results.sort(function (a, b) { return a.retailPrice - b.retailPrice; });
    if (sortSelect.value === "price-high") results.sort(function (a, b) { return b.retailPrice - a.retailPrice; });
    if (sortSelect.value === "name") results.sort(function (a, b) { return a.name.localeCompare(b.name); });
    if (sortSelect.value === "featured") results.sort(function (a, b) { return (b.featured ? 1 : 0) - (a.featured ? 1 : 0); });

    document.querySelectorAll(".chip[data-cat]").forEach(function (chip) {
      chip.classList.toggle("active", chip.dataset.cat === currentCategory);
    });
    document.getElementById("result-count").textContent =
      results.length + (results.length === 1 ? " product" : " products");
    document.getElementById("shop-grid").innerHTML = results.length
      ? results.map(productCard).join("")
      : '<div class="empty-state">No products match your search. <a href="#/shop">Show all products</a></div>';

    // Keep the web address in sync so the page can be shared or bookmarked
    const query = new URLSearchParams();
    if (currentCategory !== "all") query.set("cat", currentCategory);
    if (searchInput.value.trim()) query.set("q", searchInput.value.trim());
    if (sortSelect.value !== "featured") query.set("sort", sortSelect.value);
    const queryText = query.toString();
    history.replaceState(null, "", "#/shop" + (queryText ? "?" + queryText : ""));
  }

  document.querySelectorAll(".chip[data-cat]").forEach(function (chip) {
    chip.addEventListener("click", function () {
      currentCategory = chip.dataset.cat;
      update();
    });
  });
  searchInput.addEventListener("input", update);
  sortSelect.addEventListener("change", update);
  stockCheckbox.addEventListener("change", update);
  update();
}

// ----- One product -----
function renderProduct(id) {
  const product = getProduct(id);
  if (!product) return renderNotFound();

  const specsRows = Object.keys(product.specs || {}).map(function (key) {
    return "<tr><th>" + esc(key) + "</th><td>" + esc(product.specs[key]) + "</td></tr>";
  }).join("");
  const related = PRODUCTS.filter(function (p) {
    return p.category === product.category && p.id !== product.id;
  }).slice(0, 4);

  app.innerHTML =
    '<nav class="breadcrumb"><a href="#/shop">Shop</a> › <a href="#/shop?cat=' + product.category + '">' +
      esc(categoryName(product.category)) + "</a> › " + esc(product.name) + "</nav>" +
    '<section class="product-page">' +
      '<div class="product-image">' + productImage(product) + "</div>" +
      '<div class="product-info">' +
        "<h1>" + esc(product.name) + "</h1>" +
        (product.inStock ? '<span class="stock in">● In stock</span>' : '<span class="stock out">● Out of stock</span>') +
        '<p class="product-description">' + esc(product.description) + "</p>" +
        '<div class="price-table">' +
          '<div><span>Retail price</span><strong>' + money(product.retailPrice) + "</strong><small>1 – " + (product.wholesaleMinQty - 1) + " units</small></div>" +
          '<div class="wholesale"><span>Wholesale price</span><strong>' + money(product.wholesalePrice) + "</strong><small>" + product.wholesaleMinQty + "+ units, each</small></div>" +
        "</div>" +
        (product.inStock
          ? '<div class="buy-box">' +
              '<div class="qty-control">' +
                '<button type="button" id="qty-minus" aria-label="Less">−</button>' +
                '<input type="number" id="qty-input" min="1" value="1" aria-label="Quantity">' +
                '<button type="button" id="qty-plus" aria-label="More">+</button>' +
              "</div>" +
              '<button class="btn btn-primary btn-large" id="add-button">Add to cart</button>' +
            "</div>" +
            '<p id="price-preview" class="price-preview"></p>'
          : "") +
        '<a class="btn btn-whatsapp" id="ask-whatsapp" target="_blank" rel="noopener">Ask about this product on WhatsApp</a>' +
        (specsRows ? '<h3>Specifications</h3><table class="specs">' + specsRows + "</table>" : "") +
      "</div>" +
    "</section>" +
    (related.length
      ? '<section class="section"><h2 class="section-title">You may also like</h2><div class="product-grid">' +
          related.map(productCard).join("") + "</div></section>"
      : "");

  document.getElementById("ask-whatsapp").href =
    whatsappLink("Hello " + STORE.name + ", I'm interested in the " + product.name + ". Is it available?");

  if (!product.inStock) return;

  const qtyInput = document.getElementById("qty-input");
  const preview = document.getElementById("price-preview");

  function readQty() {
    return Math.max(1, parseInt(qtyInput.value, 10) || 1);
  }

  // Show what the customer will pay, counting what's already in the cart
  function updatePreview() {
    const qty = readQty();
    const totalQty = qty + cartQty(product.id);
    const price = unitPrice(product, totalQty);
    let text = qty + " × " + money(price) + " = <strong>" + money(price * qty) + "</strong>";
    if (totalQty >= product.wholesaleMinQty) {
      text += ' <span class="tag-wholesale">Wholesale price applied</span>';
    } else {
      const more = product.wholesaleMinQty - totalQty;
      text += '<br><span class="muted">Add ' + more + " more to pay the wholesale price of " + money(product.wholesalePrice) + " each.</span>";
    }
    if (cartQty(product.id) > 0) {
      text += '<br><span class="muted">You already have ' + cartQty(product.id) + " in your cart.</span>";
    }
    preview.innerHTML = text;
  }

  document.getElementById("qty-minus").addEventListener("click", function () {
    qtyInput.value = Math.max(1, readQty() - 1);
    updatePreview();
  });
  document.getElementById("qty-plus").addEventListener("click", function () {
    qtyInput.value = readQty() + 1;
    updatePreview();
  });
  qtyInput.addEventListener("input", updatePreview);
  document.getElementById("add-button").addEventListener("click", function () {
    addToCart(product.id, readQty());
    qtyInput.value = 1;
    updatePreview();
  });
  updatePreview();
}

// ----- Cart -----
function renderCart() {
  const summary = cartSummary();

  if (summary.lines.length === 0) {
    app.innerHTML =
      '<div class="page-head"><h1>Your cart</h1></div>' +
      '<div class="empty-state big">Your cart is empty.<br><a href="#/shop" class="btn btn-primary">Start shopping</a></div>';
    return;
  }

  app.innerHTML =
    '<div class="page-head"><h1>Your cart</h1></div>' +
    '<div class="cart-layout">' +
      '<div class="cart-lines">' +
        summary.lines.map(function (line) {
          const p = line.product;
          let hint;
          if (line.isWholesale) {
            hint = '<span class="tag-wholesale">Wholesale price</span>';
          } else {
            hint = '<span class="muted">Add ' + (p.wholesaleMinQty - line.qty) + " more for " + money(p.wholesalePrice) + " each</span>";
          }
          return (
            '<div class="cart-line">' +
              '<a href="#/product/' + p.id + '" class="cart-thumb">' + productImage(p) + "</a>" +
              '<div class="cart-line-info">' +
                '<a href="#/product/' + p.id + '" class="cart-line-name">' + esc(p.name) + "</a>" +
                "<div>" + money(line.price) + " each " + hint + "</div>" +
                '<div class="cart-line-actions">' +
                  '<div class="qty-control small">' +
                    '<button data-action="cart-dec" data-id="' + p.id + '" aria-label="Less">−</button>' +
                    '<input type="number" min="1" value="' + line.qty + '" data-qty-for="' + p.id + '" aria-label="Quantity">' +
                    '<button data-action="cart-inc" data-id="' + p.id + '" aria-label="More">+</button>' +
                  "</div>" +
                  '<button class="link-button" data-action="cart-remove" data-id="' + p.id + '">Remove</button>' +
                "</div>" +
              "</div>" +
              '<div class="cart-line-total">' + money(line.total) + "</div>" +
            "</div>"
          );
        }).join("") +
      "</div>" +
      '<aside class="order-summary">' +
        "<h3>Order summary</h3>" +
        '<div class="summary-row"><span>Items (' + summary.count + ")</span><span>" + money(summary.subtotal + summary.savings) + "</span></div>" +
        (summary.savings > 0
          ? '<div class="summary-row savings"><span>Wholesale savings</span><span>−' + money(summary.savings) + "</span></div>"
          : "") +
        '<div class="summary-row"><span>Delivery</span><span class="muted">Confirmed after order</span></div>' +
        '<div class="summary-row total"><span>Total</span><span>' + money(summary.subtotal) + "</span></div>" +
        '<a href="#/checkout" class="btn btn-primary btn-block btn-large">Proceed to checkout</a>' +
        '<a href="#/shop" class="btn btn-light btn-block">Continue shopping</a>' +
      "</aside>" +
    "</div>";

  // Typing a quantity directly into the box
  document.querySelectorAll("[data-qty-for]").forEach(function (input) {
    input.addEventListener("change", function () {
      setCartQty(input.dataset.qtyFor, Math.max(1, parseInt(input.value, 10) || 1));
      renderCart();
    });
  });
}

// ----- Checkout -----
function renderCheckout() {
  const summary = cartSummary();
  if (summary.lines.length === 0) {
    location.hash = "#/cart";
    return;
  }
  const saved = load("snok-customer", {});

  app.innerHTML =
    '<div class="page-head"><h1>Checkout</h1><p>Fill in your details. Next you\'ll send the order to us on WhatsApp or by email, and we\'ll confirm availability and delivery cost.</p></div>' +
    '<div class="cart-layout">' +
      '<form id="checkout-form" class="checkout-form" novalidate>' +
        "<h3>Your details</h3>" +
        '<div class="form-grid">' +
          field("name", "Full name", "text", saved.name, true) +
          field("phone", "Phone number", "tel", saved.phone, true, "e.g. 0803 123 4567") +
          field("email", "Email (optional)", "email", saved.email, false) +
          field("company", "Business name (optional)", "text", saved.company, false) +
        "</div>" +

        "<h3>Delivery</h3>" +
        '<div class="radio-group">' +
          '<label class="radio-card"><input type="radio" name="delivery" value="Delivery" checked><span><strong>Deliver to me</strong><small>Delivery cost depends on your location</small></span></label>' +
          '<label class="radio-card"><input type="radio" name="delivery" value="Pickup"><span><strong>Pick up from shop</strong><small>' + esc(STORE.address) + "</small></span></label>" +
        "</div>" +
        '<div id="address-fields" class="form-grid">' +
          field("address", "Delivery address", "text", saved.address, true, "House number, street, area") +
          field("city", "City / Town", "text", saved.city, true) +
          '<label class="field"><span>State <b>*</b></span><select name="state" required>' +
            '<option value="">Choose your state</option>' +
            NIGERIAN_STATES.map(function (s) {
              return "<option" + (saved.state === s ? " selected" : "") + ">" + s + "</option>";
            }).join("") +
          '</select><em class="error"></em></label>' +
        "</div>" +

        "<h3>Payment</h3>" +
        '<div class="radio-group">' +
          '<label class="radio-card"><input type="radio" name="payment" value="Bank transfer" checked><span><strong>Bank transfer</strong><small>Account details shown after you place the order</small></span></label>' +
          '<label class="radio-card"><input type="radio" name="payment" value="Pay on delivery / pickup"><span><strong>Pay on delivery or pickup</strong><small>Cash, transfer or POS when you receive your goods</small></span></label>' +
        "</div>" +

        '<label class="field"><span>Notes (optional)</span><textarea name="notes" rows="3" placeholder="Anything we should know? e.g. installation needed, best time to call"></textarea></label>' +
        '<button type="submit" class="btn btn-primary btn-large btn-block">Place order</button>' +
      "</form>" +
      '<aside class="order-summary">' +
        "<h3>Your order</h3>" +
        summary.lines.map(function (l) {
          return '<div class="summary-row small"><span>' + l.qty + " × " + esc(l.product.name) + "</span><span>" + money(l.total) + "</span></div>";
        }).join("") +
        (summary.savings > 0
          ? '<div class="summary-row savings"><span>Wholesale savings</span><span>−' + money(summary.savings) + "</span></div>"
          : "") +
        '<div class="summary-row"><span>Delivery</span><span class="muted">Confirmed after order</span></div>' +
        '<div class="summary-row total"><span>Total</span><span>' + money(summary.subtotal) + "</span></div>" +
      "</aside>" +
    "</div>";

  const form = document.getElementById("checkout-form");
  const addressFields = document.getElementById("address-fields");

  function updateDelivery() {
    const isDelivery = form.delivery.value === "Delivery";
    addressFields.hidden = !isDelivery;
    addressFields.querySelectorAll("input, select").forEach(function (el) { el.required = isDelivery; });
  }
  form.querySelectorAll('input[name="delivery"]').forEach(function (radio) {
    radio.addEventListener("change", updateDelivery);
  });
  updateDelivery();

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!validateCheckout(form)) return;

    const customer = {
      name: form.name.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      company: form.company.value.trim(),
      address: form.address.value.trim(),
      city: form.city.value.trim(),
      state: form.state.value
    };
    save("snok-customer", customer); // remember details for next time

    const order = {
      id: makeOrderId(),
      date: new Date().toISOString(),
      items: summary.lines.map(function (l) {
        return { id: l.product.id, name: l.product.name, qty: l.qty, price: l.price, total: l.total, wholesale: l.isWholesale };
      }),
      subtotal: summary.subtotal,
      savings: summary.savings,
      customer: customer,
      delivery: form.delivery.value,
      payment: form.payment.value,
      notes: form.notes.value.trim()
    };

    const orders = load("snok-orders", []);
    orders.unshift(order);
    save("snok-orders", orders);

    cart = [];
    saveCart();
    location.hash = "#/order/" + order.id + "?new=1";
  });
}

// Builds one labelled input for a form
function field(name, label, type, value, required, placeholder) {
  return (
    '<label class="field"><span>' + label + (required ? " <b>*</b>" : "") + "</span>" +
    '<input name="' + name + '" type="' + type + '" value="' + esc(value || "") + '"' +
    (required ? " required" : "") + (placeholder ? ' placeholder="' + esc(placeholder) + '"' : "") + ">" +
    '<em class="error"></em></label>'
  );
}

function validateCheckout(form) {
  let firstBad = null;
  form.querySelectorAll(".field").forEach(function (fieldBox) {
    const input = fieldBox.querySelector("input, select, textarea");
    const error = fieldBox.querySelector(".error");
    if (!error) return;
    let message = "";
    const value = input.value.trim();
    if (input.required && value === "") {
      message = "This is required";
    } else if (input.name === "phone" && !/^\+?[0-9]{10,14}$/.test(value.replace(/[\s-]/g, ""))) {
      message = "Enter a valid phone number";
    } else if (input.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      message = "Enter a valid email address";
    }
    error.textContent = message;
    fieldBox.classList.toggle("invalid", message !== "");
    if (message && !firstBad) firstBad = input;
  });
  if (firstBad) {
    firstBad.focus();
    return false;
  }
  return true;
}

function makeOrderId() {
  const now = new Date();
  const datePart =
    String(now.getFullYear()).slice(2) +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");
  const randomPart = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  return "SNK-" + datePart + "-" + randomPart;
}

// The order written out as plain text, for WhatsApp and email
function orderText(order) {
  const c = order.customer;
  let text = "Hello " + STORE.name + ", I'd like to place an order.\n\n";
  text += "*Order " + order.id + "*\n";
  order.items.forEach(function (item, i) {
    text += (i + 1) + ". " + item.name + "\n   " + item.qty + " × " + money(item.price) +
      (item.wholesale ? " (wholesale)" : "") + " = " + money(item.total) + "\n";
  });
  if (order.savings > 0) text += "\nWholesale savings: " + money(order.savings);
  text += "\n*Total: " + money(order.subtotal) + "* (plus delivery)\n\n";
  text += "Name: " + c.name + "\n";
  if (c.company) text += "Business: " + c.company + "\n";
  text += "Phone: " + c.phone + "\n";
  if (c.email) text += "Email: " + c.email + "\n";
  if (order.delivery === "Delivery") {
    text += "Delivery to: " + c.address + ", " + c.city + ", " + c.state + "\n";
  } else {
    text += "I will pick up from the shop\n";
  }
  text += "Payment: " + order.payment + "\n";
  if (order.notes) text += "Notes: " + order.notes + "\n";
  return text;
}

// ----- Order confirmation -----
function renderOrder(id, params) {
  const order = load("snok-orders", []).find(function (o) { return o.id === id; });
  if (!order) return renderNotFound();
  const isNew = params.get("new") === "1";
  const message = orderText(order);

  const bankBox = order.payment === "Bank transfer"
    ? '<div class="info-box">' +
        "<h3>Bank transfer details</h3>" +
        '<div class="bank-details">' +
          "<div><span>Bank</span><strong>" + esc(STORE.bank.bankName) + "</strong></div>" +
          "<div><span>Account name</span><strong>" + esc(STORE.bank.accountName) + "</strong></div>" +
          '<div><span>Account number</span><strong>' + esc(STORE.bank.accountNumber) +
            ' <button class="link-button" data-action="copy" data-text="' + esc(STORE.bank.accountNumber) + '">Copy</button></strong></div>' +
        "</div>" +
        '<p class="muted">Please wait for us to confirm stock and the delivery cost before paying. Use <strong>' + order.id + "</strong> as the payment reference.</p>" +
      "</div>"
    : "";

  app.innerHTML =
    '<div class="order-page">' +
      (isNew
        ? '<div class="success-icon">✓</div><h1>Order created</h1>' +
          '<p class="lead">Your order number is <strong>' + order.id + "</strong>.</p>" +
          '<div class="info-box highlight"><h3>Last step: send your order to us</h3>' +
          "<p>Your order reaches us when you send it. Choose WhatsApp (fastest) or email:</p>"
        : "<h1>Order " + order.id + "</h1>" +
          '<p class="lead">Placed on ' + new Date(order.date).toLocaleString("en-NG") + "</p>" +
          '<div class="info-box"><h3>Send or resend this order</h3>') +
        '<div class="send-buttons">' +
          '<a class="btn btn-whatsapp btn-large" target="_blank" rel="noopener" href="' + whatsappLink(message) + '">Send on WhatsApp</a>' +
          '<a class="btn btn-light btn-large" href="' + emailLink("New order " + order.id, message.replace(/\*/g, "")) + '">Send by email</a>' +
        "</div>" +
      "</div>" +
      bankBox +
      '<div class="info-box">' +
        "<h3>Order summary</h3>" +
        order.items.map(function (item) {
          return '<div class="summary-row small"><span>' + item.qty + " × " + esc(item.name) +
            (item.wholesale ? ' <span class="tag-wholesale">wholesale</span>' : "") +
            "</span><span>" + money(item.total) + "</span></div>";
        }).join("") +
        (order.savings > 0 ? '<div class="summary-row savings"><span>Wholesale savings</span><span>−' + money(order.savings) + "</span></div>" : "") +
        '<div class="summary-row total"><span>Total (plus delivery)</span><span>' + money(order.subtotal) + "</span></div>" +
        '<p class="muted">' + esc(order.delivery === "Delivery"
          ? "Delivery to " + order.customer.address + ", " + order.customer.city + ", " + order.customer.state
          : "Pickup from " + STORE.address) + " · Payment: " + esc(order.payment) + "</p>" +
      "</div>" +
      '<p><a href="#/shop">← Continue shopping</a> · <a href="#/orders">See all my orders</a></p>' +
    "</div>";
}

// ----- Order history (stored on this device) -----
function renderOrders() {
  const orders = load("snok-orders", []);
  app.innerHTML =
    '<div class="page-head"><h1>My orders</h1><p>Orders placed from this device and browser.</p></div>' +
    (orders.length === 0
      ? '<div class="empty-state big">You haven\'t placed any orders yet.<br><a href="#/shop" class="btn btn-primary">Start shopping</a></div>'
      : '<div class="orders-list">' +
          orders.map(function (o) {
            const count = o.items.reduce(function (n, i) { return n + i.qty; }, 0);
            return '<a class="order-row" href="#/order/' + o.id + '">' +
              "<div><strong>" + o.id + "</strong><span class=\"muted\">" +
                new Date(o.date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) +
                " · " + count + (count === 1 ? " item" : " items") + "</span></div>" +
              "<strong>" + money(o.subtotal) + "</strong></a>";
          }).join("") +
        "</div>");
}

// ----- Solar calculator -----
const APPLIANCES = [
  { name: "LED bulb", watts: 10, hours: 6 },
  { name: "Ceiling / standing fan", watts: 75, hours: 8 },
  { name: "Television (32–55\")", watts: 100, hours: 6 },
  { name: "Decoder / Wi-Fi router", watts: 20, hours: 8 },
  { name: "Phone charger", watts: 10, hours: 3 },
  { name: "Laptop", watts: 65, hours: 6 },
  { name: "Desktop computer", watts: 250, hours: 6 },
  { name: "Refrigerator", watts: 150, hours: 10 },
  { name: "Chest freezer", watts: 200, hours: 12 },
  { name: "Sound system", watts: 100, hours: 3 },
  { name: "Air conditioner (1HP)", watts: 900, hours: 6 },
  { name: "Air conditioner (1.5HP)", watts: 1300, hours: 6 },
  { name: "Water pump (1HP)", watts: 750, hours: 1 },
  { name: "Microwave", watts: 1000, hours: 0.5 },
  { name: "Pressing iron", watts: 1000, hours: 0.5 }
];

// Pick batteries that match the inverter's voltage.
// A 24V or 48V inverter can also use 12V batteries joined in sets of 2 or 4.
function chooseBatteries(inverterVolts, neededKwh) {
  const batteries = PRODUCTS.filter(function (p) { return p.kwh && p.volts && p.inStock; })
    .sort(function (a, b) { return a.kwh - b.kwh; });

  // Batteries made for this voltage (e.g. 48V lithium for a 48V inverter)
  const matching = batteries.filter(function (p) { return p.volts === inverterVolts; });
  if (matching.length) {
    const single = matching.find(function (p) { return p.kwh >= neededKwh; });
    if (single) return { product: single, qty: 1 };
    const largest = matching[matching.length - 1];
    return { product: largest, qty: Math.ceil(neededKwh / largest.kwh) };
  }

  // Otherwise use 12V batteries in sets
  const twelveVolt = batteries.filter(function (p) { return p.volts === 12; });
  if (!twelveVolt.length || inverterVolts % 12 !== 0) return null;
  const perSet = inverterVolts / 12;
  const largest = twelveVolt[twelveVolt.length - 1];
  const sets = Math.max(1, Math.ceil(neededKwh / (largest.kwh * perSet)));
  return { product: largest, qty: sets * perSet };
}

function renderCalculator() {
  const savedCalc = load("snok-calculator", {});

  app.innerHTML =
    '<div class="page-head"><h1>Solar calculator</h1>' +
    "<p>Tell us what you want to power. We'll estimate the inverter, battery and solar panels you need and suggest products.</p></div>" +
    '<div class="calc-layout">' +
      '<div class="calc-table">' +
        '<div class="calc-row calc-header"><span>Appliance</span><span>Watts</span><span>How many</span><span>Hours / day</span></div>' +
        APPLIANCES.map(function (a, i) {
          const s = savedCalc[i] || {};
          return '<div class="calc-row">' +
            "<span>" + esc(a.name) + "</span>" +
            '<input type="number" min="0" data-calc="watts" data-i="' + i + '" value="' + (s.watts !== undefined ? s.watts : a.watts) + '" aria-label="Watts">' +
            '<input type="number" min="0" data-calc="qty" data-i="' + i + '" value="' + (s.qty || 0) + '" aria-label="How many">' +
            '<input type="number" min="0" max="24" step="0.5" data-calc="hours" data-i="' + i + '" value="' + (s.hours !== undefined ? s.hours : a.hours) + '" aria-label="Hours per day">' +
          "</div>";
        }).join("") +
      "</div>" +
      '<aside id="calc-results" class="order-summary"></aside>' +
    "</div>";

  function read(i, kind) {
    const input = document.querySelector('[data-calc="' + kind + '"][data-i="' + i + '"]');
    return Math.max(0, parseFloat(input.value) || 0);
  }

  function update() {
    let peakWatts = 0;
    let dailyWh = 0;
    const toSave = {};
    APPLIANCES.forEach(function (a, i) {
      const watts = read(i, "watts");
      const qty = read(i, "qty");
      const hours = Math.min(24, read(i, "hours"));
      peakWatts += watts * qty;
      dailyWh += watts * qty * hours;
      toSave[i] = { watts: watts, qty: qty, hours: hours };
    });
    save("snok-calculator", toSave);

    const results = document.getElementById("calc-results");
    if (peakWatts === 0) {
      results.innerHTML = "<h3>Your system</h3><p class=\"muted\">Enter how many of each appliance you have to see your recommendation.</p>";
      return;
    }

    // Rules of thumb:
    //  - inverter: total load + 25% headroom, at a 0.8 power factor
    //  - battery: covers evening & night use (about 60% of the day's use), at 80% usable depth
    //  - panels: about 5 hours of good sun a day in Nigeria, 75% system efficiency
    const neededKva = (peakWatts * 1.25) / 0.8 / 1000;
    const neededKwh = (dailyWh * 0.6) / 0.8 / 1000;
    const neededPanelWatts = dailyWh / (5 * 0.75);

    const recommendations = [];

    const inverters = PRODUCTS.filter(function (p) { return p.kva && p.inStock; })
      .sort(function (a, b) { return a.kva - b.kva; });
    const inverter = inverters.find(function (p) { return p.kva >= neededKva; });
    if (inverter) {
      recommendations.push({ product: inverter, qty: 1 });
      const battery = chooseBatteries(inverter.volts, neededKwh);
      if (battery) recommendations.push(battery);
    }

    const panels = PRODUCTS.filter(function (p) { return p.watts && p.inStock; })
      .sort(function (a, b) { return b.watts - a.watts; });
    if (inverter && panels.length) {
      recommendations.push({ product: panels[0], qty: Math.max(1, Math.ceil(neededPanelWatts / panels[0].watts)) });
    }

    let total = 0;
    recommendations.forEach(function (r) { total += unitPrice(r.product, r.qty) * r.qty; });

    results.innerHTML =
      "<h3>Your system</h3>" +
      '<div class="calc-stats">' +
        "<div><span>Total load</span><strong>" + Math.round(peakWatts).toLocaleString() + " W</strong></div>" +
        "<div><span>Daily energy</span><strong>" + (dailyWh / 1000).toFixed(1) + " kWh</strong></div>" +
        "<div><span>Inverter size</span><strong>" + neededKva.toFixed(1) + " kVA+</strong></div>" +
        "<div><span>Battery storage</span><strong>" + neededKwh.toFixed(1) + " kWh</strong></div>" +
        "<div><span>Solar panels</span><strong>" + (neededPanelWatts / 1000).toFixed(1) + " kW</strong></div>" +
      "</div>" +
      (inverter ? "" : '<p class="warning">Your load is larger than our biggest inverter. Contact us for a custom commercial system.</p>') +
      (recommendations.length ? "<h4>Suggested products</h4>" : "") +
      recommendations.map(function (r) {
        return '<div class="summary-row small"><span>' + r.qty + ' × <a href="#/product/' + r.product.id + '">' + esc(r.product.name) +
          "</a></span><span>" + money(unitPrice(r.product, r.qty) * r.qty) + "</span></div>";
      }).join("") +
      (recommendations.length
        ? '<div class="summary-row total"><span>Estimated total</span><span>' + money(total) + "</span></div>" +
          '<button class="btn btn-primary btn-block" id="add-recommended">Add all to cart</button>'
        : "") +
      '<a class="btn btn-whatsapp btn-block" target="_blank" rel="noopener" href="' +
        whatsappLink("Hello " + STORE.name + ", I used your solar calculator. My total load is about " +
          Math.round(peakWatts) + "W and I use about " + (dailyWh / 1000).toFixed(1) +
          " kWh a day. Can you advise on a system and installation?") +
        '">Ask an expert on WhatsApp</a>' +
      '<p class="muted small-print">This is an estimate. Cables, breakers, mounting and installation are extra. We\'ll confirm the right setup for you.</p>';

    if (!recommendations.length) return;
    document.getElementById("add-recommended").addEventListener("click", function () {
      recommendations.forEach(function (r) { addToCart(r.product.id, r.qty); });
      toast("Recommended system added to your cart");
    });
  }

  document.querySelectorAll("[data-calc]").forEach(function (input) {
    input.addEventListener("input", update);
  });
  update();
}

// ----- About & FAQ -----
function renderAbout() {
  const faqs = [
    ["How do wholesale prices work?",
      "Every product shows a minimum quantity for wholesale. Once you have that many of the same product in your cart, the lower wholesale price is applied automatically."],
    ["How do I pay?",
      "You can pay by bank transfer or pay when you receive your goods. We confirm stock and delivery cost with you on WhatsApp or by phone before you pay."],
    ["Do you deliver outside my city?",
      "Yes, we deliver across Nigeria. Delivery cost depends on your location and the size of your order, and we confirm it before you pay. You can also pick up from our shop."],
    ["Do you install?",
      "Yes. Tell us in the order notes or on WhatsApp that you need installation and we'll arrange it and give you a quote."],
    ["What size of system do I need?",
      'Try our <a href="#/calculator">Solar Calculator</a> for an estimate, then chat with us to confirm.'],
    ["Do products come with a warranty?",
      "Warranty depends on the product and manufacturer. Ask us about any product and we'll give you the details."]
  ];
  app.innerHTML =
    '<div class="page-head"><h1>About Snok Enterprise</h1></div>' +
    '<section class="about-grid">' +
      "<div>" +
        "<p class=\"lead\">Snok Enterprise is a Nigerian supplier of solar and inverter technology for homes, offices, shops and installers.</p>" +
        "<p>We sell solar panels, hybrid inverters, lithium and tubular batteries, charge controllers, solar lights and all the cables and accessories needed for a complete installation, at retail prices for individuals and wholesale prices for businesses, installers and resellers.</p>" +
        "<p>Our goal is simple: reliable power that you can afford, with honest advice about what you actually need.</p>" +
      "</div>" +
      '<div class="about-card">' +
        "<h3>Visit or contact us</h3>" +
        contactDetails() +
      "</div>" +
    "</section>" +
    '<section class="section"><h2 class="section-title">Frequently asked questions</h2>' +
      '<div class="faq">' +
        faqs.map(function (f) { return "<details><summary>" + f[0] + "</summary><p>" + f[1] + "</p></details>"; }).join("") +
      "</div>" +
    "</section>";
}

function contactDetails() {
  return (
    '<ul class="contact-list">' +
      '<li><span>📍</span>' + esc(STORE.address) + "</li>" +
      '<li><span>📞</span><a href="tel:' + esc(STORE.phone.replace(/\s/g, "")) + '">' + esc(STORE.phone) + "</a></li>" +
      '<li><span>💬</span><a target="_blank" rel="noopener" href="' + whatsappLink("") + '">Chat on WhatsApp</a></li>' +
      '<li><span>✉️</span><a href="mailto:' + esc(STORE.email) + '">' + esc(STORE.email) + "</a></li>" +
      '<li><span>🕘</span>' + esc(STORE.hours) + "</li>" +
    "</ul>"
  );
}

// ----- Contact -----
function renderContact() {
  app.innerHTML =
    '<div class="page-head"><h1>Contact us</h1><p>Questions, quotes or installation requests: we\'re happy to help.</p></div>' +
    '<section class="about-grid">' +
      '<form id="contact-form" class="checkout-form" novalidate>' +
        field("name", "Your name", "text", "", true) +
        field("phone", "Phone number", "tel", "", true) +
        '<label class="field"><span>Message <b>*</b></span><textarea name="message" rows="5" required placeholder="How can we help?"></textarea><em class="error"></em></label>' +
        '<div class="send-buttons">' +
          '<button type="submit" class="btn btn-whatsapp" data-via="whatsapp">Send on WhatsApp</button>' +
          '<button type="submit" class="btn btn-light" data-via="email">Send by email</button>' +
        "</div>" +
      "</form>" +
      '<div class="about-card"><h3>Our details</h3>' + contactDetails() + "</div>" +
    "</section>";

  const form = document.getElementById("contact-form");
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!validateCheckout(form)) return;
    const text = "Hello " + STORE.name + ",\n\n" + form.message.value.trim() +
      "\n\nName: " + form.name.value.trim() + "\nPhone: " + form.phone.value.trim();
    const via = event.submitter ? event.submitter.dataset.via : "whatsapp";
    if (via === "email") {
      location.href = emailLink("Enquiry from " + form.name.value.trim(), text);
    } else {
      window.open(whatsappLink(text), "_blank", "noopener");
    }
  });
}

function renderNotFound() {
  app.innerHTML =
    '<div class="empty-state big"><h1>Page not found</h1><p>We couldn\'t find what you were looking for.</p>' +
    '<a href="#/" class="btn btn-primary">Go to the home page</a></div>';
}

// =====================================================================
//  ROUTER - shows the right page for the web address after the #
//  e.g.  #/shop?cat=inverters   #/product/inverter-5kva-48v   #/cart
// =====================================================================

function route() {
  const hash = location.hash.slice(1) || "/";
  const questionMark = hash.indexOf("?");
  const path = questionMark === -1 ? hash : hash.slice(0, questionMark);
  const params = new URLSearchParams(questionMark === -1 ? "" : hash.slice(questionMark + 1));
  const parts = path.split("/").filter(Boolean);
  const page = parts[0] || "home";

  if (page === "home") renderHome();
  else if (page === "shop") renderShop(params);
  else if (page === "product") renderProduct(decodeURIComponent(parts[1] || ""));
  else if (page === "cart") renderCart();
  else if (page === "checkout") renderCheckout();
  else if (page === "order") renderOrder(decodeURIComponent(parts[1] || ""), params);
  else if (page === "orders") renderOrders();
  else if (page === "calculator") renderCalculator();
  else if (page === "about") renderAbout();
  else if (page === "contact") renderContact();
  else renderNotFound();

  document.querySelectorAll("[data-nav]").forEach(function (link) {
    link.classList.toggle("active", link.dataset.nav === page);
  });
  document.getElementById("main-nav").classList.remove("open");
  window.scrollTo(0, 0);
}

// =====================================================================
//  BUTTONS that appear on many pages are handled here in one place
// =====================================================================

document.addEventListener("click", function (event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const id = button.dataset.id;

  switch (button.dataset.action) {
    case "add":
      addToCart(id, 1);
      break;
    case "cart-inc":
      setCartQty(id, cartQty(id) + 1);
      renderCart();
      break;
    case "cart-dec":
      setCartQty(id, cartQty(id) - 1);
      renderCart();
      break;
    case "cart-remove":
      setCartQty(id, 0);
      renderCart();
      break;
    case "toggle-menu":
      document.getElementById("main-nav").classList.toggle("open");
      break;
    case "copy":
      if (navigator.clipboard) {
        navigator.clipboard.writeText(button.dataset.text).then(function () { toast("Copied"); });
      }
      break;
  }
});

document.getElementById("header-search").addEventListener("submit", function (event) {
  event.preventDefault();
  const input = event.target.querySelector("input");
  const query = input.value.trim();
  input.value = "";
  location.hash = "#/shop" + (query ? "?q=" + encodeURIComponent(query) : "");
});

// ----- Fill in the parts of the page that never change -----
function setupLayout() {
  document.getElementById("year").textContent = new Date().getFullYear();
  document.getElementById("footer-tagline").textContent = STORE.tagline;
  document.getElementById("footer-categories").innerHTML = CATEGORIES.map(function (c) {
    return '<li><a href="#/shop?cat=' + c.id + '">' + esc(c.name) + "</a></li>";
  }).join("");
  document.getElementById("footer-contact").innerHTML =
    "<li>" + esc(STORE.address) + "</li>" +
    '<li><a href="tel:' + esc(STORE.phone.replace(/\s/g, "")) + '">' + esc(STORE.phone) + "</a></li>" +
    '<li><a href="mailto:' + esc(STORE.email) + '">' + esc(STORE.email) + "</a></li>" +
    "<li>" + esc(STORE.hours) + "</li>";
  document.getElementById("whatsapp-float").href =
    whatsappLink("Hello " + STORE.name + ", I have a question.");

  // Show a reminder while the settings are still the examples
  if (STORE.whatsapp === "2348000000000" || STORE.email === "orders@example.com") {
    document.getElementById("setup-banner").hidden = false;
  }
}

setupLayout();
updateCartCount();
window.addEventListener("hashchange", route);
route();
