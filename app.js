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

const poundsFormat = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});
const penceFormat = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });

// £1,299 for whole pounds, £12.50 when there are pence
function money(amount) {
  return Number.isInteger(amount) ? poundsFormat.format(amount) : penceFormat.format(amount);
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

// ----- Buy now, pay later -----

function getPlan(id) {
  return STORE.payLater.plans.find(function (plan) { return plan.id === id; });
}

// Work out what a customer pays on a plan for a given price
function planBreakdown(plan, price) {
  const total = Math.round(price * (1 + plan.markup) * 100) / 100;
  // Round instalments up to whole pounds, then the deposit covers the rest exactly
  const instalment = Math.ceil((total * (1 - plan.deposit)) / plan.payments);
  const deposit = Math.round((total - instalment * plan.payments) * 100) / 100;
  return { deposit: deposit, instalment: instalment, total: total, extra: total - price };
}

// e.g. "£300 today, then £200 per month × 6"
function planSentence(plan, price) {
  const b = planBreakdown(plan, price);
  return money(b.deposit) + " today, then " + money(b.instalment) + " per " + plan.every + " × " + plan.payments;
}

// True when no plan adds any extra cost
function allPlansInterestFree() {
  return STORE.payLater.plans.every(function (plan) { return plan.markup === 0; });
}

// The smallest monthly payment available, for "from £X/month" labels
function lowestMonthly(price) {
  let lowest = null;
  STORE.payLater.plans.forEach(function (plan) {
    if (plan.every !== "month" || plan.collectAfterPaying || plan.businessOnly) return;
    const instalment = planBreakdown(plan, price).instalment;
    if (lowest === null || instalment < lowest) lowest = instalment;
  });
  return lowest;
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

// UK postcodes, e.g. "SW1A 1AA", "M1 1AE", "B33 8TH"
function isValidPostcode(text) {
  return /^[A-Z]{1,2}[0-9][A-Z0-9]?\s*[0-9][A-Z]{2}$/i.test(text.trim());
}

// UK numbers (07700 900123, +44 7700 900123, 020 7946 0000) or other international numbers
function isValidPhone(text) {
  const digits = text.replace(/[\s\-()]/g, "");
  return /^(0\d{9,10}|\+44\d{9,10}|\+\d{10,14})$/.test(digits);
}

// Joins the parts of an address that were filled in
function formatAddress(c) {
  return [c.address, c.address2, c.city, c.county, (c.postcode || "").toUpperCase()]
    .filter(function (part) { return part; }).join(", ");
}

// ----- Product pictures -----
// Simple drawings for each category, used when a product has no photo.
const ART = {
  "solar-panels": '<svg viewBox="0 0 120 100"><path d="M30 72 L24 92 M90 72 L96 92" stroke="#64748b" stroke-width="4"/><rect x="14" y="14" width="92" height="60" rx="4" fill="#1e3a8a"/><g stroke="#93c5fd" stroke-width="1.5" opacity=".7"><path d="M37 14v60M60 14v60M83 14v60M14 34h92M14 54h92"/></g></svg>',
  "inverters": '<svg viewBox="0 0 120 100"><rect x="28" y="10" width="64" height="80" rx="8" fill="#f1f5f9" stroke="#334155" stroke-width="3"/><rect x="40" y="22" width="40" height="22" rx="3" fill="#0f172a"/><text x="60" y="38" font-size="11" fill="#4ade80" text-anchor="middle" font-family="monospace">230V</text><circle cx="48" cy="60" r="4" fill="#22c55e"/><circle cx="60" cy="60" r="4" fill="#f59e0b"/><circle cx="72" cy="60" r="4" fill="#ef4444"/><path d="M40 76h40" stroke="#94a3b8" stroke-width="3"/></svg>',
  "batteries": '<svg viewBox="0 0 120 100"><rect x="22" y="22" width="76" height="62" rx="6" fill="#0f766e"/><rect x="34" y="14" width="14" height="10" rx="2" fill="#334155"/><rect x="72" y="14" width="14" height="10" rx="2" fill="#334155"/><path d="M63 34 L50 56 H60 L56 74 L72 50 H62 Z" fill="#fde047"/></svg>',
  "charge-controllers": '<svg viewBox="0 0 120 100"><rect x="20" y="18" width="80" height="64" rx="8" fill="#1f2937"/><rect x="32" y="28" width="56" height="20" rx="3" fill="#bef264"/><text x="60" y="43" font-size="11" fill="#1f2937" text-anchor="middle" font-family="monospace">MPPT</text><g fill="#9ca3af"><rect x="30" y="60" width="12" height="12" rx="2"/><rect x="48" y="60" width="12" height="12" rx="2"/><rect x="66" y="60" width="12" height="12" rx="2"/></g></svg>',
  "solar-kits": '<svg viewBox="0 0 120 100"><circle cx="92" cy="22" r="11" fill="#f59e0b"/><rect x="10" y="40" width="58" height="36" rx="3" fill="#1e3a8a"/><g stroke="#93c5fd" stroke-width="1.2" opacity=".7"><path d="M29 40v36M48 40v36M10 58h58"/></g><rect x="76" y="46" width="30" height="40" rx="4" fill="#f1f5f9" stroke="#334155" stroke-width="2.5"/><rect x="82" y="52" width="18" height="9" rx="2" fill="#0f172a"/></svg>',
  "solar-lights": '<svg viewBox="0 0 120 100"><path d="M60 92 V36" stroke="#475569" stroke-width="5"/><rect x="32" y="14" width="56" height="14" rx="3" fill="#1e3a8a"/><path d="M60 36 h28 v8 h-28z" fill="#334155"/><path d="M70 44 L60 74 H100 L90 44 Z" fill="#fde047" opacity=".55"/></svg>',
  "inverter-acs": '<svg viewBox="0 0 120 100"><rect x="12" y="20" width="96" height="36" rx="8" fill="#f8fafc" stroke="#334155" stroke-width="3"/><path d="M22 46h76" stroke="#94a3b8" stroke-width="3"/><circle cx="96" cy="31" r="3" fill="#22c55e"/><g stroke="#38bdf8" stroke-width="3" fill="none" stroke-linecap="round"><path d="M36 64 q-6 8 0 16"/><path d="M60 64 q-6 8 0 16"/><path d="M84 64 q-6 8 0 16"/></g></svg>',
  "inverter-fridges": '<svg viewBox="0 0 120 100"><rect x="34" y="6" width="52" height="88" rx="6" fill="#f8fafc" stroke="#334155" stroke-width="3"/><path d="M34 38h52" stroke="#334155" stroke-width="3"/><path d="M76 16v14M76 46v18" stroke="#64748b" stroke-width="4" stroke-linecap="round"/><text x="52" y="84" font-size="9" fill="#0ea5e9" text-anchor="middle" font-family="sans-serif" font-weight="700">INV</text></svg>',
  "home-appliances": '<svg viewBox="0 0 120 100"><rect x="26" y="8" width="68" height="84" rx="6" fill="#f8fafc" stroke="#334155" stroke-width="3"/><path d="M26 26h68" stroke="#334155" stroke-width="2.5"/><circle cx="38" cy="17" r="3" fill="#f59e0b"/><circle cx="60" cy="58" r="22" fill="#bae6fd" stroke="#334155" stroke-width="3"/><path d="M48 62 q12 -10 24 0" stroke="#0284c7" stroke-width="3" fill="none"/></svg>',
  "wind-power": '<svg viewBox="0 0 120 100"><path d="M58 40 L54 96 H66 L62 40 Z" fill="#94a3b8"/><g fill="#f8fafc" stroke="#334155" stroke-width="2"><path d="M60 36 L56 4 Q60 2 64 4 Z"/><path d="M60 36 L88 52 Q87 57 83 58 Z"/><path d="M60 36 L32 52 Q33 57 37 58 Z"/></g><circle cx="60" cy="36" r="5" fill="#334155"/><g stroke="#38bdf8" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".8"><path d="M6 24 h20"/><path d="M2 34 h18"/><path d="M8 44 h14"/></g></svg>',
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
        '<div class="card-price">' + money(product.retailPrice) + ' <small class="vat">inc. VAT</small></div>' +
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
        '<span class="eyebrow">Solar, wind &amp; inverter specialists</span>' +
        "<h1>Cut your energy bills. Keep the power on.</h1>" +
        "<p>" + esc(STORE.tagline) + ". Buy one unit at retail price, or buy in bulk and pay trade prices automatically. All prices include VAT.</p>" +
        '<div class="hero-buttons">' +
          '<a href="#/shop" class="btn btn-primary btn-large">Shop now</a>' +
          '<a href="#/calculator" class="btn btn-light btn-large">Size my solar system</a>' +
        "</div>" +
      "</div>" +
      '<div class="hero-art">' + ART["solar-kits"] + "</div>" +
    "</section>" +

    '<section class="benefits">' +
      '<div><strong>Retail &amp; wholesale</strong><span>Bulk prices apply automatically</span></div>' +
      '<div><strong>UK-wide delivery</strong><span>Or collect from our premises</span></div>' +
      '<a href="#/pay-later"><strong>Buy now, pay later</strong><span>Spread payments over up to 12 months</span></a>' +
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
      "<p>Installers, electricians, resellers and businesses pay wholesale prices once they reach the minimum quantity shown on each product. VAT invoices provided. Need a bigger quote? Message us.</p></div>" +
      '<a class="btn btn-whatsapp btn-large" target="_blank" rel="noopener" href="' +
        whatsappLink("Hello " + STORE.name + ", I'd like a wholesale quote.") + '">Get a wholesale quote</a>' +
    "</section>" +

    '<section class="paylater-banner">' +
      "<div><span class=\"eyebrow\">Buy now, pay later</span>" +
      "<h2>Get it today. Spread the cost.</h2>" +
      "<p>Solar, wind and battery systems, heat pumps, fridges and more on " + STORE.payLater.plans.length +
        (allPlansInterestFree() ? " interest-free" : " flexible") + " plans, from 3 to 12 months.</p></div>" +
      '<a href="#/pay-later" class="btn btn-primary btn-large">See payment plans</a>' +
    "</section>";
}

// ----- Shop (all products, with search, filter and sort) -----
function renderShop(params) {
  const selectedCategory = params.get("cat") || "all";
  const search = params.get("q") || "";
  const sort = params.get("sort") || "featured";

  app.innerHTML =
    '<div class="page-head"><h1>Shop</h1><p>All prices include VAT. Wholesale prices apply automatically in your cart.</p></div>' +
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
          '<div><span>Retail price (inc. VAT)</span><strong>' + money(product.retailPrice) + "</strong><small>" + (product.wholesaleMinQty === 2 ? "1 unit" : "1 – " + (product.wholesaleMinQty - 1) + " units") + "</small></div>" +
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
        (product.retailPrice >= STORE.payLater.minimumAmount && product.inStock
          ? '<a class="paylater-line" href="#/pay-later?product=' + product.id + '">' +
              "<span>Or pay from <strong>" + money(lowestMonthly(product.retailPrice)) + "/month</strong> with Buy Now, Pay Later</span><span>See plans →</span></a>"
          : "") +
        '<a class="btn btn-whatsapp" id="ask-whatsapp" target="_blank" rel="noopener">Ask about this product on WhatsApp</a>' +
        (product.category === "wind-power" ? windAdvice() : "") +
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

// Honest guidance shown on every wind product
function windAdvice() {
  return (
    '<div class="advice-box">' +
      "<h3>Before you buy a wind turbine</h3>" +
      "<ul>" +
        "<li><strong>Check your wind.</strong> Turbines work best on open, exposed sites with an average wind speed of 5 m/s or more. Rooftops in towns and cities are usually too sheltered and turbulent. A <a href=\"#/product/wind-anemometer-logger\">wind speed logger</a> tells you for sure.</li>" +
        "<li><strong>Planning.</strong> In England, some small turbines can go up without planning permission (permitted development) if they meet size, location and noise limits and are MCS certified. Otherwise you'll need planning permission. Rules differ in Scotland, Wales and Northern Ireland, so check with your local council first.</li>" +
        "<li><strong>Installation.</strong> Masts, foundations and electrical connections should be installed by a qualified installer. To be paid for exported electricity through the Smart Export Guarantee, the turbine and installation must be MCS certified.</li>" +
        "<li><strong>Pair it with solar.</strong> Wind is often strongest in winter when solar is weakest, so together they give steadier power all year.</li>" +
      "</ul>" +
      '<a target="_blank" rel="noopener" href="' + whatsappLink("Hello " + STORE.name + ", I'd like advice on whether a wind turbine suits my property.") + '">Ask us if wind suits your property →</a>' +
    "</div>"
  );
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
        '<div class="summary-row total"><span>Total (inc. VAT)</span><span>' + money(summary.subtotal) + "</span></div>" +
        '<a href="#/checkout" class="btn btn-primary btn-block btn-large">Proceed to checkout</a>' +
        (summary.subtotal >= STORE.payLater.minimumAmount
          ? '<a href="#/pay-later?cart=1" class="paylater-line small"><span>Or pay from <strong>' +
              money(lowestMonthly(summary.subtotal)) + "/month</strong></span><span>See plans →</span></a>"
          : "") +
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
          field("phone", "Phone number", "tel", saved.phone, true, "e.g. 07700 900123") +
          field("email", "Email", "email", saved.email, true) +
          field("company", "Business name (optional)", "text", saved.company, false) +
          field("vatNumber", "Business VAT number (optional)", "text", saved.vatNumber, false, "For your VAT invoice") +
        "</div>" +

        "<h3>Delivery</h3>" +
        '<div class="radio-group">' +
          '<label class="radio-card"><input type="radio" name="delivery" value="Delivery" checked><span><strong>Deliver to me</strong><small>UK mainland. Highlands, islands and Northern Ireland may cost more</small></span></label>' +
          '<label class="radio-card"><input type="radio" name="delivery" value="Collection"><span><strong>Collect from us</strong><small>' + esc(STORE.address) + "</small></span></label>" +
        "</div>" +
        '<div id="address-fields" class="form-grid">' +
          field("address", "Address line 1", "text", saved.address, true, "House number and street") +
          field("address2", "Address line 2 (optional)", "text", saved.address2, false) +
          field("city", "Town / City", "text", saved.city, true) +
          field("county", "County (optional)", "text", saved.county, false) +
          field("postcode", "Postcode", "text", saved.postcode, true, "e.g. SW1A 1AA") +
        "</div>" +

        "<h3>Payment</h3>" +
        '<div class="radio-group">' +
          '<label class="radio-card"><input type="radio" name="payment" value="Bank transfer" checked><span><strong>Bank transfer</strong><small>Account details shown after you place the order</small></span></label>' +
          '<label class="radio-card" id="pay-on-collection"><input type="radio" name="payment" value="Pay on collection"><span><strong>Pay on collection</strong><small>Card or cash when you collect your order</small></span></label>' +
          (summary.subtotal >= STORE.payLater.minimumAmount
            ? '<label class="radio-card"><input type="radio" name="payment" value="Buy now, pay later"><span><strong>Buy now, pay later</strong><small>From ' +
                money(lowestMonthly(summary.subtotal)) + "/month. Subject to approval</small></span></label>"
            : "") +
        "</div>" +
        '<div id="plan-picker" class="plan-picker" hidden>' +
          "<strong>Choose your plan</strong>" +
          STORE.payLater.plans.map(function (plan, i) {
            const b = planBreakdown(plan, summary.subtotal);
            return '<label class="plan-option"><input type="radio" name="plan" value="' + plan.id + '"' + (plan.id === "6-months" || (i === 0 && !getPlan("6-months")) ? " checked" : "") + ">" +
              "<span><strong>" + esc(plan.name) + (plan.businessOnly ? ' <span class="tag-wholesale">businesses</span>' : "") + "</strong>" +
              "<small>" + planSentence(plan, summary.subtotal) + "</small></span>" +
              "<span class=\"plan-total\">" + money(b.total) + "</span></label>";
          }).join("") +
          '<p class="muted small-print">You\'ll need: ' + STORE.payLater.requirements.map(esc).join("; ") + '. <a href="#/pay-later">Learn more</a></p>' +
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
        '<div class="summary-row total"><span>Total (inc. VAT)</span><span>' + money(summary.subtotal) + "</span></div>" +
      "</aside>" +
    "</div>";

  const form = document.getElementById("checkout-form");
  const addressFields = document.getElementById("address-fields");

  const requiredAddressFields = ["address", "city", "postcode"];

  function updateDelivery() {
    const isDelivery = form.delivery.value === "Delivery";
    addressFields.hidden = !isDelivery;
    requiredAddressFields.forEach(function (name) { form[name].required = isDelivery; });

    // Paying on collection only makes sense when collecting
    const collectionOption = document.getElementById("pay-on-collection");
    collectionOption.hidden = isDelivery;
    if (isDelivery && form.payment.value === "Pay on collection") {
      form.querySelector('input[name="payment"][value="Bank transfer"]').checked = true;
    }
  }
  form.querySelectorAll('input[name="delivery"]').forEach(function (radio) {
    radio.addEventListener("change", updateDelivery);
  });
  updateDelivery();

  // Show the plans only when "Buy now, pay later" is chosen
  const planPicker = document.getElementById("plan-picker");
  form.querySelectorAll('input[name="payment"]').forEach(function (radio) {
    radio.addEventListener("change", function () {
      planPicker.hidden = form.payment.value !== "Buy now, pay later";
    });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!validateCheckout(form)) return;

    const customer = {
      name: form.name.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      company: form.company.value.trim(),
      vatNumber: form.vatNumber.value.trim(),
      address: form.address.value.trim(),
      address2: form.address2.value.trim(),
      city: form.city.value.trim(),
      county: form.county.value.trim(),
      postcode: form.postcode.value.trim().toUpperCase()
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
      plan: null,
      notes: form.notes.value.trim()
    };

    if (order.payment === "Buy now, pay later") {
      const plan = getPlan(form.plan.value);
      const b = planBreakdown(plan, summary.subtotal);
      order.plan = {
        name: plan.name,
        deposit: b.deposit,
        instalment: b.instalment,
        payments: plan.payments,
        every: plan.every,
        total: b.total,
        collectAfterPaying: !!plan.collectAfterPaying
      };
    }

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
    } else if (input.type === "tel" && value && !isValidPhone(value)) {
      message = "Enter a valid phone number, e.g. 07700 900123";
    } else if (input.name === "postcode" && value && !isValidPostcode(value)) {
      message = "Enter a valid UK postcode, e.g. SW1A 1AA";
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
  text += "\n*Total: " + money(order.subtotal) + " inc. VAT* (plus delivery)\n\n";
  text += "Name: " + c.name + "\n";
  if (c.company) text += "Business: " + c.company + (c.vatNumber ? " (VAT " + c.vatNumber + ")" : "") + "\n";
  text += "Phone: " + c.phone + "\n";
  if (c.email) text += "Email: " + c.email + "\n";
  if (order.delivery === "Delivery") {
    text += "Delivery to: " + formatAddress(c) + "\n";
  } else {
    text += "I will collect the order\n";
  }
  text += "Payment: " + order.payment + "\n";
  if (order.plan) {
    const pl = order.plan;
    text += "Plan: " + pl.name + ": " + money(pl.deposit) + " deposit, then " + money(pl.instalment) +
      " per " + pl.every + " × " + pl.payments + " (total " + money(pl.total) + ")\n";
  }
  if (order.notes) text += "Notes: " + order.notes + "\n";
  return text;
}

// ----- Order confirmation -----
function renderOrder(id, params) {
  const order = load("snok-orders", []).find(function (o) { return o.id === id; });
  if (!order) return renderNotFound();
  const isNew = params.get("new") === "1";
  const message = orderText(order);

  const plan = order.plan;
  const planBox = plan
    ? '<div class="info-box">' +
        "<h3>Your pay-later plan: " + esc(plan.name) + "</h3>" +
        '<div class="bank-details">' +
          "<div><span>Deposit (after approval)</span><strong>" + money(plan.deposit) + "</strong></div>" +
          "<div><span>Then</span><strong>" + money(plan.instalment) + " per " + plan.every + " × " + plan.payments + "</strong></div>" +
          "<div><span>Total you'll pay</span><strong>" + money(plan.total) + "</strong></div>" +
        "</div>" +
        "<p>" + (plan.collectAfterPaying
          ? "Your goods are delivered once you have paid in full."
          : "Your goods are delivered after your deposit is paid.") +
        " We'll contact you to verify your details. Please have these ready:</p>" +
        "<ul>" + STORE.payLater.requirements.map(function (r) { return "<li>" + esc(r) + "</li>"; }).join("") + "</ul>" +
      "</div>"
    : "";

  const bankBox = order.payment !== "Pay on collection"
    ? '<div class="info-box">' +
        "<h3>Bank transfer details</h3>" +
        '<div class="bank-details">' +
          "<div><span>Bank</span><strong>" + esc(STORE.bank.bankName) + "</strong></div>" +
          "<div><span>Account name</span><strong>" + esc(STORE.bank.accountName) + "</strong></div>" +
          "<div><span>Sort code</span><strong>" + esc(STORE.bank.sortCode) + "</strong></div>" +
          '<div><span>Account number</span><strong>' + esc(STORE.bank.accountNumber) +
            ' <button class="link-button" data-action="copy" data-text="' + esc(STORE.bank.accountNumber) + '">Copy</button></strong></div>' +
        "</div>" +
        '<p class="muted">' + (plan
          ? "Please wait until your application is approved before paying your deposit."
          : "Please wait for us to confirm stock and the delivery cost before paying.") +
          " Use <strong>" + order.id + "</strong> as the payment reference.</p>" +
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
          '<p class="lead">Placed on ' + new Date(order.date).toLocaleString("en-GB") + "</p>" +
          '<div class="info-box"><h3>Send or resend this order</h3>') +
        '<div class="send-buttons">' +
          '<a class="btn btn-whatsapp btn-large" target="_blank" rel="noopener" href="' + whatsappLink(message) + '">Send on WhatsApp</a>' +
          '<a class="btn btn-light btn-large" href="' + emailLink("New order " + order.id, message.replace(/\*/g, "")) + '">Send by email</a>' +
        "</div>" +
      "</div>" +
      planBox +
      bankBox +
      '<div class="info-box">' +
        "<h3>Order summary</h3>" +
        order.items.map(function (item) {
          return '<div class="summary-row small"><span>' + item.qty + " × " + esc(item.name) +
            (item.wholesale ? ' <span class="tag-wholesale">wholesale</span>' : "") +
            "</span><span>" + money(item.total) + "</span></div>";
        }).join("") +
        (order.savings > 0 ? '<div class="summary-row savings"><span>Wholesale savings</span><span>−' + money(order.savings) + "</span></div>" : "") +
        '<div class="summary-row total"><span>Total inc. VAT (plus delivery)</span><span>' + money(order.subtotal) + "</span></div>" +
        '<p class="muted">' + esc(order.delivery === "Delivery"
          ? "Delivery to " + formatAddress(order.customer)
          : "Collect from " + STORE.address) + " · Payment: " + esc(order.payment) + "</p>" +
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
                new Date(o.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) +
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
  { name: "TV box / Wi-Fi router", watts: 20, hours: 12 },
  { name: "Phone charger", watts: 10, hours: 3 },
  { name: "Laptop", watts: 65, hours: 6 },
  { name: "Desktop computer", watts: 250, hours: 6 },
  { name: "Refrigerator", watts: 150, hours: 10 },
  { name: "Chest freezer", watts: 200, hours: 12 },
  { name: "Sound system", watts: 100, hours: 3 },
  { name: "Air conditioner (9,000 BTU, older type)", watts: 900, hours: 4 },
  { name: "Air conditioner (12,000 BTU, older type)", watts: 1300, hours: 4 },
  { name: "Water pump (1HP)", watts: 750, hours: 1 },
  { name: "Microwave", watts: 1000, hours: 0.5 },
  { name: "Pressing iron", watts: 1000, hours: 0.5 },
  { name: "Inverter AC / heat pump (9,000 BTU)", watts: 550, hours: 4 },
  { name: "Inverter AC / heat pump (12,000 BTU)", watts: 800, hours: 4 },
  { name: "Inverter fridge / freezer", watts: 80, hours: 12 },
  { name: "BLDC inverter ceiling fan", watts: 35, hours: 8 },
  { name: "Kettle", watts: 3000, hours: 0.3 },
  { name: "Washing machine", watts: 500, hours: 1 },
  { name: "Dishwasher", watts: 1200, hours: 1 },
  { name: "Tumble dryer", watts: 2500, hours: 1 },
  { name: "Electric oven", watts: 2000, hours: 1 }
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
    //  - panels: about 2.5 hours of full sun a day on average in the UK, 75% system efficiency
    const neededKva = (peakWatts * 1.25) / 0.8 / 1000;
    const neededKwh = (dailyWh * 0.6) / 0.8 / 1000;
    const neededPanelWatts = dailyWh / (2.5 * 0.75);

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
      '<p class="muted small-print">This is an estimate based on average UK sunshine: panels produce much more in summer and much less in winter. Cables, breakers, mounting and installation are extra. We\'ll confirm the right setup for you.</p>';

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
    ["Do your prices include VAT?",
      "Yes. All prices include VAT at 20%. Business customers receive a VAT invoice. Add your business name and VAT number at checkout."],
    ["How do wholesale prices work?",
      "Every product shows a minimum quantity for wholesale. Once you have that many of the same product in your cart, the lower wholesale price is applied automatically, ideal for installers, electricians and resellers."],
    ["How do I pay?",
      "By bank transfer, by card or cash when you collect, or with an interest-free <a href=\"#/pay-later\">Buy Now, Pay Later</a> plan. We confirm stock and delivery cost with you before you pay."],
    ["Where do you deliver?",
      "We deliver across the UK mainland. Deliveries to the Scottish Highlands, islands, Northern Ireland, the Isle of Man and the Channel Islands may cost more. We confirm the cost before you pay. You can also collect from us."],
    ["Can I pay in instalments?",
      'Yes. With <a href="#/pay-later">Buy Now, Pay Later</a> you can spread the cost over 3 to 12 months' +
        (allPlansInterestFree() ? " at 0% interest" : "") + ", for purchases from " + money(STORE.payLater.minimumAmount) + ". Plans are subject to approval."],
    ["Do you install?",
      "We can arrange installation through qualified installers. Solar PV and battery systems should be installed by an MCS-certified installer, which you need to earn money for exported electricity through the Smart Export Guarantee (SEG). Air conditioners and heat pumps must be fitted by an F-gas certified engineer, and all electrical work must follow UK wiring regulations (BS 7671)."],
    ["Is a wind turbine right for my home?",
      "Small wind turbines work well on open, exposed sites such as farms, rural homes and coastal properties, ideally with an average wind speed of 5 m/s or more. They rarely perform well on rooftops in towns and cities. We recommend measuring your wind with a <a href=\"#/product/wind-anemometer-logger\">wind speed logger</a> first. Some small turbines in England can be installed under permitted development if they meet strict size, location and MCS requirements; otherwise planning permission is needed, so check with your local council."],
    ["Can I connect a system to the grid?",
      "Yes. Grid-connected solar, wind and battery systems must be notified to, or approved by, your local electricity network operator (under G98 or G99). Your installer normally handles this for you."],
    ["What size of system do I need?",
      'Try our <a href="#/calculator">Solar Calculator</a> for an estimate, then chat with us to confirm.'],
    ["Can I return something?",
      "If you order online, by phone or on WhatsApp, you can cancel within 14 days of receiving your goods under the Consumer Contracts Regulations, as long as the items are unused and in their original packaging. Faulty items are covered by your rights under the Consumer Rights Act 2015. Contact us to arrange a return."],
    ["Do products come with a warranty?",
      "Yes. Warranty length depends on the product and manufacturer, and is on top of your statutory rights. Ask us about any product and we'll give you the details."],
    ["What happens to my personal details?",
      "The details you type into this website are stored only in your own browser. They reach us only when you send your order or application to us by WhatsApp or email, and we use them only to process your order."]
  ];
  app.innerHTML =
    '<div class="page-head"><h1>About Snok Enterprise</h1></div>' +
    '<section class="about-grid">' +
      "<div>" +
        '<p class="lead">Snok Enterprise supplies renewable energy equipment, including solar panels, wind turbines, battery storage and hybrid inverters, plus energy-efficient inverter appliances, to homeowners and businesses across the United Kingdom.</p>' +
        "<p>With energy prices high and more of us working from home, we help households and businesses generate their own electricity, store it for the evening, keep the lights on during power cuts and switch to appliances that use far less power.</p>" +
        "<p>We sell everything for a complete system: solar panels, small wind turbines and masts, hybrid inverters, lithium batteries, charge controllers, cables and mounting kits, plus inverter heat pumps and air conditioners, fridges, freezers and other energy-saving appliances. Homeowners pay retail prices, and installers, electricians, resellers and businesses get wholesale prices automatically when they buy in quantity.</p>" +
        "<p>Our goal is simple: lower bills and reliable power, with honest advice about what you actually need.</p>" +
      "</div>" +
      '<div class="about-card">' +
        "<h3>Visit or contact us</h3>" +
        contactDetails() +
      "</div>" +
    "</section>" +
    '<section class="audience-grid">' +
      '<div class="about-card">' +
        "<h3>For homeowners</h3>" +
        '<ul class="check-list">' +
          "<li>Cut your electricity bills with solar panels and, on windy sites, a wind turbine</li>" +
          "<li>Store daytime solar, or cheap off-peak electricity, in a battery for the evening</li>" +
          "<li>Backup power for essentials during power cuts</li>" +
          "<li>Efficient heating and cooling with inverter heat pumps</li>" +
          "<li>Spread the cost with interest-free payment plans</li>" +
        "</ul>" +
      "</div>" +
      '<div class="about-card">' +
        "<h3>For businesses &amp; trade</h3>" +
        '<ul class="check-list">' +
          "<li>Wholesale prices applied automatically</li>" +
          "<li>VAT invoices for every order</li>" +
          "<li>Commercial inverters and large battery systems</li>" +
          "<li>Bulk quotes for installers, electricians and resellers</li>" +
          "<li>Business payment plans over 12 months</li>" +
        "</ul>" +
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

// ----- Buy now, pay later -----
function renderPayLater(params) {
  const settings = STORE.payLater;
  const minimum = settings.minimumAmount;
  const summary = cartSummary();

  // Things the customer can choose to pay for: their cart, one product, or an amount
  const choices = {};
  if (summary.subtotal >= minimum) {
    choices.cart = {
      amount: summary.subtotal,
      label: "Everything in my cart",
      items: summary.lines.map(function (l) { return l.qty + " × " + l.product.name; }).join(", ")
    };
  }
  PRODUCTS.forEach(function (p) {
    if (p.inStock && p.retailPrice >= minimum) {
      choices["product:" + p.id] = { amount: p.retailPrice, label: p.name, items: "1 × " + p.name };
    }
  });

  let initialChoice = "custom";
  if (params.get("cart") && choices.cart) initialChoice = "cart";
  else if (params.get("product") && choices["product:" + params.get("product")]) initialChoice = "product:" + params.get("product");
  else if (choices.cart) initialChoice = "cart";

  const productOptions = CATEGORIES.map(function (c) {
    const options = PRODUCTS.filter(function (p) { return p.category === c.id && choices["product:" + p.id]; })
      .map(function (p) {
        return '<option value="product:' + p.id + '">' + esc(p.name) + " (" + money(p.retailPrice) + ")</option>";
      }).join("");
    return options ? '<optgroup label="' + esc(c.name) + '">' + options + "</optgroup>" : "";
  }).join("");

  app.innerHTML =
    '<section class="paylater-hero">' +
      '<span class="eyebrow">Buy now, pay later</span>' +
      "<h1>Get it today. Spread the cost.</h1>" +
      "<p>Spread the cost of solar panels, wind turbines, battery storage, inverters, heat pumps, fridges and freezers over monthly payments" +
        (allPlansInterestFree() ? ", <strong>0% interest and no fees</strong>" : "") + ", on purchases from " + money(minimum) + ".</p>" +
    "</section>" +

    '<section class="section">' +
      '<h2 class="section-title">How it works</h2>' +
      '<div class="steps">' +
        "<div><b>1</b><strong>Choose</strong><span>Pick a product or fill your cart, then choose a plan below.</span></div>" +
        "<div><b>2</b><strong>Apply</strong><span>Send your application on WhatsApp or by email. It takes 2 minutes.</span></div>" +
        "<div><b>3</b><strong>Get approved</strong><span>We check your ID, address and that the payments are affordable for you, usually within 1–2 working days.</span></div>" +
        "<div><b>4</b><strong>Pay &amp; enjoy</strong><span>Pay your deposit, receive your goods, then pay the rest in instalments.</span></div>" +
      "</div>" +
    "</section>" +

    '<section class="section">' +
      '<h2 class="section-title">Our plans</h2>' +
      '<div class="plan-grid">' +
        settings.plans.map(function (plan) {
          return '<div class="plan-card' + (plan.id === "6-months" ? " popular" : "") + '">' +
            (plan.id === "6-months" ? '<span class="plan-badge">Most popular</span>' : "") +
            (plan.businessOnly ? '<span class="plan-badge business">Businesses</span>' : "") +
            "<h3>" + esc(plan.name) + "</h3>" +
            "<p>" + esc(plan.description) + "</p>" +
            "<ul>" +
              "<li><strong>" + Math.round(plan.deposit * 100) + "%</strong> deposit</li>" +
              "<li>then <strong>" + plan.payments + "</strong> " + plan.every + "ly payments</li>" +
              "<li>" + (plan.markup === 0 ? "<strong>0% interest, no fees</strong>" : "<strong>+" + Math.round(plan.markup * 100) + "%</strong> on the price") + "</li>" +
              "<li>" + (plan.collectAfterPaying ? "Goods delivered when fully paid" : "Goods delivered after deposit") + "</li>" +
            "</ul>" +
          "</div>";
        }).join("") +
      "</div>" +
    "</section>" +

    '<section class="section" id="plan-calculator">' +
      '<h2 class="section-title">Work out your payments</h2>' +
      '<div class="paylater-calc">' +
        '<div class="form-grid">' +
          '<label class="field"><span>What do you want to buy?</span><select id="bnpl-choice">' +
            (choices.cart ? '<option value="cart">My cart (' + money(choices.cart.amount) + ")</option>" : "") +
            productOptions +
            '<option value="custom">Enter an amount…</option>' +
          "</select></label>" +
          '<label class="field" id="bnpl-amount-field"><span>Amount (£)</span><input type="number" id="bnpl-amount" min="' + minimum + '" step="10" placeholder="e.g. 2500"></label>' +
        "</div>" +
        '<div id="bnpl-results"></div>' +
      "</div>" +
    "</section>" +

    '<section class="section" id="apply">' +
      '<h2 class="section-title">Apply now</h2>' +
      '<div class="about-grid">' +
        '<form id="bnpl-form" class="checkout-form" novalidate>' +
          '<p id="bnpl-selected" class="selected-plan"></p>' +
          "<h3>Your details</h3>" +
          '<div class="form-grid">' +
            field("name", "Full name", "text", "", true) +
            field("phone", "Phone number", "tel", "", true) +
            field("email", "Email", "email", "", true) +
            field("postcode", "Postcode", "text", "", true, "e.g. SW1A 1AA") +
            '<label class="field"><span>Applying as <b>*</b></span><select name="applicantType" required><option value="">Choose one</option>' +
              "<option>Homeowner</option><option>Tenant</option><option>Business</option>" +
            '</select><em class="error"></em></label>' +
            '<label class="field"><span>Employment <b>*</b></span><select name="work" required><option value="">Choose one</option>' +
              "<option>Employed</option><option>Self-employed</option><option>Company director</option><option>Retired</option><option>Other</option>" +
            '</select><em class="error"></em></label>' +
            field("employer", "Employer or business name", "text", "", true) +
            '<label class="field"><span>Monthly take-home income <b>*</b></span><select name="income" required><option value="">Choose a range</option>' +
              "<option>Below £1,500</option><option>£1,500 – £2,500</option><option>£2,500 – £4,000</option><option>£4,000 – £6,000</option><option>Above £6,000</option>" +
            '</select><em class="error"></em></label>' +
            '<label class="field"><span>ID you will provide <b>*</b></span><select name="idType" required><option value="">Choose one</option>' +
              "<option>Passport</option><option>UK driving licence</option><option>UK residence permit / eVisa</option>" +
            '</select><em class="error"></em></label>' +
            field("companyNumber", "Company number (businesses)", "text", "", false) +
          "</div>" +
          '<label class="field"><span>Anything else? (optional)</span><textarea name="notes" rows="3" placeholder="e.g. delivery address, installation needed"></textarea></label>' +
          '<div class="send-buttons">' +
            '<button type="submit" class="btn btn-whatsapp btn-large" data-via="whatsapp">Apply on WhatsApp</button>' +
            '<button type="submit" class="btn btn-light btn-large" data-via="email">Apply by email</button>' +
          "</div>" +
        "</form>" +
        '<div class="about-card">' +
          "<h3>What you'll need</h3>" +
          '<ul class="check-list">' + settings.requirements.map(function (r) { return "<li>" + esc(r) + "</li>"; }).join("") + "</ul>" +
          "<h3>Good to know</h3>" +
          '<ul class="check-list">' +
            (allPlansInterestFree() ? "<li>0% interest and no fees on every plan.</li>" : "") +
            "<li>All plans are subject to approval and an affordability check.</li>" +
            "<li>Plans are based on retail prices, including VAT.</li>" +
            "<li>Goods remain the property of " + esc(STORE.name) + " until fully paid.</li>" +
            "<li>You can pay off early at any time.</li>" +
            "<li>If you're finding it hard to pay, talk to us early. Free, impartial help is also available from MoneyHelper (moneyhelper.org.uk).</li>" +
          "</ul>" +
        "</div>" +
      "</div>" +
    "</section>";

  const choiceSelect = document.getElementById("bnpl-choice");
  const amountField = document.getElementById("bnpl-amount-field");
  const amountInput = document.getElementById("bnpl-amount");
  const results = document.getElementById("bnpl-results");
  const selectedText = document.getElementById("bnpl-selected");
  choiceSelect.value = initialChoice;
  let selectedPlanId = "6-months";

  function current() {
    if (choiceSelect.value === "custom") {
      const amount = Math.round(parseFloat(amountInput.value) || 0);
      return { amount: amount, label: "Custom amount", items: "Amount: " + money(amount) };
    }
    return choices[choiceSelect.value];
  }

  function update() {
    amountField.hidden = choiceSelect.value !== "custom";
    const item = current();

    if (item.amount < minimum) {
      results.innerHTML = '<p class="muted">Buy now, pay later is available for purchases from ' + money(minimum) + ".</p>";
      selectedText.innerHTML = "Choose what you want to buy in the calculator above.";
      return;
    }

    results.innerHTML =
      '<div class="plan-table">' +
        '<div class="plan-row plan-head"><span>Plan</span><span>Pay today</span><span>Then</span><span>Total</span><span>Extra</span></div>' +
        settings.plans.map(function (plan) {
          const b = planBreakdown(plan, item.amount);
          return '<label class="plan-row">' +
            '<span><input type="radio" name="bnpl-plan" value="' + plan.id + '"' + (plan.id === selectedPlanId ? " checked" : "") + "> <strong>" + esc(plan.name) + "</strong>" +
              (plan.businessOnly ? ' <span class="tag-wholesale">businesses</span>' : "") + "</span>" +
            '<span data-label="Pay today">' + money(b.deposit) + "</span>" +
            '<span data-label="Then">' + money(b.instalment) + " / " + plan.every + " × " + plan.payments + "</span>" +
            '<span data-label="Total">' + money(b.total) + "</span>" +
            '<span data-label="Extra" class="muted">' + (b.extra === 0 ? "None" : money(b.extra)) + "</span>" +
          "</label>";
        }).join("") +
      "</div>";

    results.querySelectorAll('input[name="bnpl-plan"]').forEach(function (radio) {
      radio.addEventListener("change", function () {
        selectedPlanId = radio.value;
        showSelected();
      });
    });
    showSelected();
  }

  function showSelected() {
    const item = current();
    const plan = getPlan(selectedPlanId);
    selectedText.innerHTML = "Applying for: <strong>" + esc(item.label) + "</strong> (" + money(item.amount) + ") on the <strong>" +
      esc(plan.name) + "</strong> plan: " + planSentence(plan, item.amount) + '. <a href="#plan-calculator" data-scroll>Change</a>';
  }

  choiceSelect.addEventListener("change", update);
  amountInput.addEventListener("input", update);
  update();

  // "Change" link scrolls back up to the calculator
  selectedText.addEventListener("click", function (event) {
    if (event.target.matches("[data-scroll]")) {
      event.preventDefault();
      document.getElementById("plan-calculator").scrollIntoView();
    }
  });

  const form = document.getElementById("bnpl-form");
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const item = current();
    if (item.amount < minimum) {
      toast("Choose something from " + money(minimum) + " in the calculator first");
      document.getElementById("plan-calculator").scrollIntoView();
      return;
    }
    if (!validateCheckout(form)) return;

    const plan = getPlan(selectedPlanId);
    if (plan.businessOnly && form.applicantType.value !== "Business") {
      toast(plan.name + " is for businesses. Choose another plan, or apply as a business.");
      form.applicantType.focus();
      return;
    }
    const b = planBreakdown(plan, item.amount);
    const id = "BNPL-" + makeOrderId().slice(4);
    const text =
      "Hello " + STORE.name + ", I'd like to apply for Buy Now, Pay Later.\n\n" +
      "*Application " + id + "*\n" +
      "Item: " + item.items + "\n" +
      "Price: " + money(item.amount) + "\n" +
      "Plan: " + plan.name + ": " + money(b.deposit) + " deposit, then " + money(b.instalment) + " per " + plan.every + " × " + plan.payments + "\n" +
      "Total: " + money(b.total) + "\n\n" +
      "Name: " + form.name.value.trim() + "\n" +
      "Phone: " + form.phone.value.trim() + "\n" +
      "Email: " + form.email.value.trim() + "\n" +
      "Postcode: " + form.postcode.value.trim().toUpperCase() + "\n" +
      "Applying as: " + form.applicantType.value + "\n" +
      "Employment: " + form.work.value + " (" + form.employer.value.trim() + ")\n" +
      (form.companyNumber.value.trim() ? "Company number: " + form.companyNumber.value.trim() + "\n" : "") +
      "Monthly income: " + form.income.value + "\n" +
      "ID: " + form.idType.value + "\n" +
      (form.notes.value.trim() ? "Notes: " + form.notes.value.trim() + "\n" : "");

    const via = event.submitter ? event.submitter.dataset.via : "whatsapp";
    if (via === "email") {
      location.href = emailLink("Pay later application " + id, text.replace(/\*/g, ""));
    } else {
      window.open(whatsappLink(text), "_blank", "noopener");
    }
    toast("Application " + id + " ready to send");
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
  else if (page === "pay-later") renderPayLater(params);
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
  // Company details required on UK business websites, shown once filled in
  const legal = [
    STORE.legalName,
    STORE.companyNumber ? "Company No. " + STORE.companyNumber : "",
    STORE.vatNumber ? "VAT No. " + STORE.vatNumber : ""
  ].filter(function (part) { return part; });
  if (legal.length) {
    document.getElementById("legal-line").textContent = " · " + legal.join(" · ");
  }

  if (STORE.whatsapp === "447700900000" || STORE.email === "orders@example.com") {
    document.getElementById("setup-banner").hidden = false;
  }
}

setupLayout();
updateCartCount();
window.addEventListener("hashchange", route);
route();
