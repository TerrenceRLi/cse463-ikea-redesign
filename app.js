/* CSE 463 Milestone 1 — IKEA Study Lighting Redesigned Interactive Prototype (v1.0 Pre-Test)
   Implements States S1–S8 with consistent state preservation, transparent cost scaffolding,
   non-destructive error/availability recovery, locked fulfillment, and authoritative closure. */

(() => {
  "use strict";

  const DELIVERY_MIN = 35.00;
  const PICKUP_FEE = 2.00;
  const DELIVERY_FEE = 4.99;

  // Supported valid ZIP service areas (simulated)
  const SERVICE_AREAS = {
    "85281": {
      zip: "85281",
      city: "Tempe",
      state: "AZ",
      store: "IKEA Phoenix, AZ",
      storeAddress: "2110 W IKEA Way, Tempe, AZ 85284",
      pickupDate: "Wed, Nov 25, 2026",
      pickupWindow: "10:00 AM – 6:00 PM",
      deliveryDate: "Thu, Nov 26, 2026",
      taxRate: 0.081
    },
    "85259": {
      zip: "85259",
      city: "Scottsdale",
      state: "AZ",
      store: "IKEA Phoenix, AZ",
      storeAddress: "2110 W IKEA Way, Tempe, AZ 85284",
      pickupDate: "Wed, Nov 25, 2026",
      pickupWindow: "10:00 AM – 6:00 PM",
      deliveryDate: "Thu, Nov 26, 2026",
      taxRate: 0.081
    },
    "85284": {
      zip: "85284",
      city: "Tempe",
      state: "AZ",
      store: "IKEA Phoenix, AZ",
      storeAddress: "2110 W IKEA Way, Tempe, AZ 85284",
      pickupDate: "Wed, Nov 25, 2026",
      pickupWindow: "10:00 AM – 6:00 PM",
      deliveryDate: "Thu, Nov 26, 2026",
      taxRate: 0.081
    },
    "90210": {
      zip: "90210",
      city: "Beverly Hills",
      state: "CA",
      store: "IKEA Burbank, CA",
      storeAddress: "805 S San Fernando Blvd, Burbank, CA 91502",
      pickupDate: "Thu, Nov 26, 2026",
      pickupWindow: "11:00 AM – 7:00 PM",
      deliveryDate: "Fri, Nov 27, 2026",
      taxRate: 0.095
    },
    "98101": {
      zip: "98101",
      city: "Seattle",
      state: "WA",
      store: "IKEA Renton, WA",
      storeAddress: "601 SW 41st St, Renton, WA 98057",
      pickupDate: "Thu, Nov 26, 2026",
      pickupWindow: "10:00 AM – 6:00 PM",
      deliveryDate: "Fri, Nov 27, 2026",
      taxRate: 0.1025
    }
  };

  // Compatible E26 Warm LED Bulb Options
  const BULB_OPTIONS = [
    {
      id: "solhetta-450",
      name: "SOLHETTA LED Bulb E26 (450 lm, Warm 2700K, 2-pk)",
      shortName: "SOLHETTA Warm 2700K 450 lm (2-pk)",
      price: 2.49,
      recommended: true,
      note: "Soft warm glow ideal for late-night desk reading"
    },
    {
      id: "solhetta-800",
      name: "SOLHETTA LED Bulb E26 (800 lm, Warm 2700K, Dimmable, 2-pk)",
      shortName: "SOLHETTA Warm 2700K 800 lm Dimmable (2-pk)",
      price: 4.99,
      recommended: false,
      note: "Brighter warm study light with dimming support"
    },
    {
      id: "none",
      name: "No bulb needed (I already own a compatible E26 bulb)",
      shortName: "No bulb included",
      price: 0.00,
      recommended: false,
      note: "Lamp requires an E26 LED bulb (max 13W) to operate"
    }
  ];

  const ADDON_ORGANIZER = {
    id: "vattenkar-org",
    sku: "505.415.69",
    name: "VATTENKAR Desktop Organizer",
    subtitle: "Compact black steel tray for notebooks & chargers",
    price: 14.99,
    finish: "Black",
    finishHex: "#1f242c",
    bulbId: "na",
    bulbName: "Desk accessory (no bulb needed)",
    bulbPrice: 0,
    isAccessory: true
  };

  // Catalog Products (Realistic IKEA Study Lamps)
  const PRODUCTS = [
    {
      id: "tertial",
      sku: "203.554.34",
      name: "TERTIAL",
      subtitle: "Adjustable clamp-mount work lamp",
      price: 19.99,
      footprint: 'Clamp mount (0" desk base)',
      shade: '7" diameter',
      cord: "4' 11\" cord",
      bulbIncluded: false,
      bulbSummary: "E26 bulb required (+$2.49 warm 2700K)",
      description: "Classic steel arm-and-head work lamp that clamps onto the desk edge to save surface space in small studio apartments.",
      style: "clamp",
      finishes: [
        { id: "dark-gray", label: "Dark Gray", colorGroup: "Dark Gray", hex: "#434850", inStock: true, stockText: "In stock (14 at IKEA Phoenix)" },
        { id: "matte-black", label: "Matte Black", colorGroup: "Black", hex: "#1b1f26", inStock: true, stockText: "In stock (8 at IKEA Phoenix)" },
        { id: "light-blue", label: "Light Blue", colorGroup: "Blue", hex: "#7ba7c7", inStock: false, stockText: "Out of stock at IKEA Phoenix" }
      ]
    },
    {
      id: "navlinge",
      sku: "704.049.12",
      name: "NÄVLINGE",
      subtitle: "Compact LED work lamp (warm bulb built-in)",
      price: 24.99,
      footprint: '5" compact base',
      shade: '5" slim head',
      cord: "6' 7\" cord",
      bulbIncluded: true,
      bulbSummary: "Integrated warm 2700K LED included ($0 extra)",
      description: "Ultra-slim gooseneck study lamp with built-in glare-free warm white 2700K LED light—ready to plug in right out of the box.",
      style: "slim",
      finishes: [
        { id: "black", label: "Black", colorGroup: "Black", hex: "#1c2026", inStock: true, stockText: "In stock (19 at IKEA Phoenix)" },
        { id: "dark-gray", label: "Dark Gray", colorGroup: "Dark Gray", hex: "#4c535e", inStock: true, stockText: "In stock (6 at IKEA Phoenix)" },
        { id: "white", label: "White", colorGroup: "White", hex: "#e7eaef", inStock: true, stockText: "In stock (11 at IKEA Phoenix)" }
      ]
    },
    {
      id: "forsa",
      sku: "601.467.64",
      name: "FORSÅ",
      subtitle: "Weighted-base steel articulated work lamp",
      price: 29.99,
      footprint: '6" weighted base',
      shade: '5" steel shade',
      cord: "5' 11\" cord",
      bulbIncluded: false,
      bulbSummary: "E26 bulb required (+$2.49 warm 2700K)",
      description: "Focused directed reading light with sturdy articulated steel arms and a compact weighted desk base.",
      style: "classic",
      finishes: [
        { id: "dark-gray", label: "Dark Gray", colorGroup: "Dark Gray", hex: "#3d434c", inStock: true, stockText: "In stock (9 at IKEA Phoenix)" },
        { id: "matte-black", label: "Matte Black", colorGroup: "Black", hex: "#191c22", inStock: false, stockText: "Out of stock at IKEA Phoenix" },
        { id: "nickel", label: "Nickel-Plated", colorGroup: "Nickel", hex: "#9ca5b0", inStock: true, stockText: "In stock (5 at IKEA Phoenix)" }
      ]
    },
    {
      id: "nymane",
      sku: "604.956.81",
      name: "NYMÅNE",
      subtitle: "Dimmable work lamp with wireless phone charger",
      price: 49.99,
      footprint: '7" charging base',
      shade: '5.5" swivel head',
      cord: "6' 3\" cord",
      bulbIncluded: false,
      bulbSummary: "E26 bulb required (+$2.49 warm 2700K)",
      description: "Study lamp combining directed task lighting with a built-in Qi wireless charging pad in the base. Qualifies directly for Home Delivery.",
      style: "modern",
      finishes: [
        { id: "anthracite", label: "Anthracite Dark Gray", colorGroup: "Dark Gray", hex: "#353a42", inStock: true, stockText: "In stock (7 at IKEA Phoenix)" },
        { id: "white", label: "White", colorGroup: "White", hex: "#ebedf2", inStock: true, stockText: "In stock (10 at IKEA Phoenix)" }
      ]
    },
    {
      id: "hektar",
      sku: "402.165.45",
      name: "HEKTAR",
      subtitle: "Oversized industrial metal desk lamp",
      price: 69.99,
      footprint: '9" heavy base',
      shade: '10" oversized shade',
      cord: "6' 7\" cord",
      bulbIncluded: false,
      bulbSummary: "E26 bulb required (+$2.49 warm 2700K)",
      description: "Large industrial-style metal lamp suited for wide studio desks (above a $60 budget).",
      style: "heavy",
      finishes: [
        { id: "dark-gray", label: "Dark Gray", colorGroup: "Dark Gray", hex: "#3d4147", inStock: true, stockText: "In stock (4 at IKEA Phoenix)" },
        { id: "matte-black", label: "Matte Black", colorGroup: "Black", hex: "#1b1e24", inStock: true, stockText: "In stock (3 at IKEA Phoenix)" }
      ]
    }
  ];

  const STATE_LABELS = {
    S1: "State S1: Catalog & Guided Filter",
    S2: "State S2: Product Detail & Configuration",
    S3: "State S3: Option / Fulfillment Recovery",
    S4: "State S4: Shopping Bag & Cost Review",
    S5: "State S5: Guest Checkout — Locked Fulfillment",
    S6: "State S6: Checkout Validation & Error Recovery",
    S7: "State S7: Final Pre-Submission Order Review",
    S8: "State S8: Order Confirmed — Durable Receipt"
  };

  // Application State Factory (clean reset for every usability participant)
  function createInitialState() {
    return {
      screen: "S1",
      prevScreen: "S1",
      filters: {
        query: "desk lamp",
        maxBudget: 60,
        colors: [], // e.g., ["Dark Gray", "Black"]
        bulbIncludedOnly: false,
        sort: "price-asc"
      },
      area: { ...SERVICE_AREAS["85281"] },
      fulfillment: "pickup", // "pickup" | "delivery"
      // S2 working configuration
      activeProductId: "tertial",
      selectedFinishId: "dark-gray",
      selectedBulbId: "solhetta-450",
      // S3 recovery payload
      recovery: null,
      // S4 Shopping Bag
      cart: [],
      lastRemovedItem: null,
      // S5/S6 Checkout Form (preserved across bag edits & validation recovery!)
      checkout: {
        fullName: "",
        email: "",
        phone: "",
        street: "",
        city: "Tempe",
        stateCode: "AZ",
        zip: "85281",
        pickupPerson: "self",
        cardLast4: "4242",
        pendingAreaSwap: null // Explicit approval before changing store/date!
      },
      checkoutErrors: {},
      // S8 Order Receipt
      confirmedOrder: null,
      // Non-interruptive toast
      toast: null
    };
  }

  let state = createInitialState();

  // DOM References
  const appMain = document.getElementById("appMain");
  const protoStateBadge = document.getElementById("protoStateBadge");
  const headerLocationText = document.getElementById("headerLocationText");
  const headerBagCount = document.getElementById("headerBagCount");
  const scaffoldBudget = document.getElementById("scaffoldBudget");
  const scaffoldFulfillment = document.getElementById("scaffoldFulfillment");
  const scaffoldTotal = document.getElementById("scaffoldTotal");
  const scaffoldBudgetStatus = document.getElementById("scaffoldBudgetStatus");
  const toastRegion = document.getElementById("toastRegion");
  const locationModalBackdrop = document.getElementById("locationModalBackdrop");
  const modalZipInput = document.getElementById("modalZipInput");
  const oosModalBackdrop = document.getElementById("oosModalBackdrop");
  const oosModalContent = document.getElementById("oosModalContent");
  const processingOverlay = document.getElementById("processingOverlay");
  const procStoreName = document.getElementById("procStoreName");
  const scopeBanner = document.getElementById("scopeBanner");

  // Helpers
  function money(n) {
    return "$" + Number(n || 0).toFixed(2);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function getProduct(id) {
    return PRODUCTS.find((p) => p.id === id) || PRODUCTS[0];
  }

  function getBulb(id) {
    return BULB_OPTIONS.find((b) => b.id === id) || BULB_OPTIONS[0];
  }

  function cartItemCount() {
    return state.cart.reduce((sum, item) => sum + item.qty, 0);
  }

  function computeCartTotals() {
    const subtotal = state.cart.reduce((sum, item) => sum + (item.unitPrice + item.bulbPrice) * item.qty, 0);
    if (subtotal === 0) {
      return { subtotal: 0, fee: 0, tax: 0, total: 0, deliveryUnlocked: false, remainingForDelivery: DELIVERY_MIN };
    }
    const deliveryUnlocked = subtotal >= DELIVERY_MIN;
    const effectiveMode = state.fulfillment === "delivery" && deliveryUnlocked ? "delivery" : "pickup";
    const fee = effectiveMode === "delivery" ? DELIVERY_FEE : PICKUP_FEE;
    const tax = Number(((subtotal + fee) * state.area.taxRate).toFixed(2));
    const total = Number((subtotal + fee + tax).toFixed(2));
    const remainingForDelivery = Math.max(0, Number((DELIVERY_MIN - subtotal).toFixed(2)));
    return { subtotal, fee, tax, total, deliveryUnlocked, remainingForDelivery, effectiveMode };
  }

  function computePdpPreviewTotals() {
    const prod = getProduct(state.activeProductId);
    const bulbPrice = prod.bulbIncluded ? 0 : getBulb(state.selectedBulbId).price;
    const itemSubtotal = prod.price + bulbPrice;
    const existingCartSub = state.cart.reduce((sum, i) => sum + (i.unitPrice + i.bulbPrice) * i.qty, 0);
    const combinedSub = existingCartSub + itemSubtotal;
    const deliveryUnlocked = combinedSub >= DELIVERY_MIN;
    const fee = state.fulfillment === "delivery" && deliveryUnlocked ? DELIVERY_FEE : PICKUP_FEE;
    const tax = Number(((itemSubtotal + fee) * state.area.taxRate).toFixed(2));
    const total = Number((itemSubtotal + fee + tax).toFixed(2));
    return {
      lampPrice: prod.price,
      bulbPrice,
      itemSubtotal,
      combinedSub,
      deliveryUnlocked,
      remainingForDelivery: Math.max(0, Number((DELIVERY_MIN - combinedSub).toFixed(2))),
      fee,
      tax,
      total
    };
  }

  function setToast(type, message, actionLabel, actionFn) {
    state.toast = { type, message, actionLabel, actionFn };
    renderToast();
  }

  function clearToast() {
    state.toast = null;
    renderToast();
  }

  function renderToast() {
    if (!state.toast) {
      toastRegion.innerHTML = "";
      return;
    }
    toastRegion.innerHTML = `
      <div class="toast-bar ${state.toast.type}">
        <span>${state.toast.message}</span>
        <div class="toast-actions">
          ${state.toast.actionLabel ? `<button type="button" class="btn btn-sm btn-secondary" id="toastActionBtn">${escapeHtml(state.toast.actionLabel)}</button>` : ""}
          <button type="button" class="icon-close-btn" id="toastDismissBtn" aria-label="Dismiss notification">&times;</button>
        </div>
      </div>
    `;
    const act = document.getElementById("toastActionBtn");
    if (act && state.toast.actionFn) {
      act.addEventListener("click", () => {
        const fn = state.toast.actionFn;
        clearToast();
        fn();
      });
    }
    const dis = document.getElementById("toastDismissBtn");
    if (dis) dis.addEventListener("click", clearToast);
  }

  // Lamp Icon Renderer (Uses Attributed Flaticon Line Icons with Finish-Aware Tinting)
  const LAMP_ICON_FILES = {
    clamp: "assets/lamp-tertial.png",
    slim: "assets/lamp-navlinge.png",
    classic: "assets/lamp-forsa.png",
    modern: "assets/lamp-nymane.png",
    heavy: "assets/lamp-forsa.png"
  };

  function renderLampSvg(style, hex, warmGlow = true) {
    if (style === "accessory") {
      return `
        <svg viewBox="0 0 180 180" aria-hidden="true">
          <rect x="28" y="88" width="124" height="58" rx="8" fill="#2c323d" stroke="#11161f" stroke-width="3"/>
          <rect x="38" y="64" width="44" height="28" rx="4" fill="#465063" stroke="#11161f" stroke-width="2.5"/>
          <rect x="90" y="54" width="52" height="38" rx="4" fill="#0058a3" stroke="#11161f" stroke-width="2.5"/>
          <line x1="28" y1="114" x2="152" y2="114" stroke="#535d6e" stroke-width="2"/>
          <circle cx="90" cy="130" r="5" fill="#ffdb00"/>
        </svg>`;
    }

    const iconSrc = LAMP_ICON_FILES[style] || LAMP_ICON_FILES.classic;
    const raw = (hex || "#343a44").toLowerCase();
    // Ensure high contrast on light backgrounds even for White or Nickel finishes
    let tint = raw;
    if (raw === "#e7eaef" || raw === "#ebedf2") tint = "#64748b";
    else if (raw === "#9ca5b0") tint = "#5a6675";
    else if (raw === "#7ba7c7") tint = "#2b6ca3";

    const halo = warmGlow ? `<span class="lamp-warm-halo" aria-hidden="true"></span>` : "";
    return `
      <span class="lamp-icon-wrap">
        ${halo}
        <span class="lamp-masked-icon" role="img" aria-label="Desk lamp illustration"
          style="background-color:${tint};-webkit-mask-image:url('${iconSrc}');mask-image:url('${iconSrc}');"></span>
      </span>`;
  }

  // Navigation & Header/Scaffold Sync
  function goTo(screen, options = {}) {
    if (!options.keepPrev) {
      state.prevScreen = state.screen;
    }
    state.screen = screen;
    render();
    if (!options.skipScroll) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function updateChrome() {
    protoStateBadge.textContent = STATE_LABELS[state.screen] || state.screen;
    headerLocationText.textContent = `${state.area.zip} · ${state.area.store}`;
    headerBagCount.textContent = String(cartItemCount());

    // Stepper highlighting
    const stepOrder = ["S1", "S2", "S4", "S5", "S7"];
    const effectiveStep = state.screen === "S3"
      ? (state.prevScreen === "S4" ? "S4" : "S2")
      : (state.screen === "S6" ? "S5" : (state.screen === "S8" ? "S8" : state.screen));
    const currentIdx = effectiveStep === "S8" ? 99 : stepOrder.indexOf(effectiveStep);

    document.querySelectorAll(".step-pill").forEach((pill) => {
      const target = pill.dataset.step;
      const idx = stepOrder.indexOf(target);
      pill.classList.remove("active", "done");
      if (state.screen === "S8") {
        pill.classList.add("done");
        pill.disabled = true;
      } else {
        const needsCart = (target === "S4" || target === "S5" || target === "S7") && state.cart.length === 0;
        const needsValidCheckout = target === "S7" && (!state.checkout.fullName || !state.checkout.email || !state.checkout.phone);
        pill.disabled = needsCart || needsValidCheckout;
        if (idx === currentIdx) pill.classList.add("active");
        else if (idx < currentIdx) pill.classList.add("done");
      }
    });

    // Persistent Memory Scaffold Bar
    scaffoldBudget.textContent = `${money(state.filters.maxBudget)} max`;
    const totals = state.cart.length > 0 ? computeCartTotals() : null;
    const isDelivery = state.fulfillment === "delivery" && (totals ? totals.deliveryUnlocked : true);
    scaffoldFulfillment.textContent = isDelivery
      ? `Home Delivery to ${state.area.zip} (${money(DELIVERY_FEE)} · ${state.area.deliveryDate})`
      : `Click & Collect · ${state.area.store} (${money(PICKUP_FEE)} · ${state.area.pickupDate})`;

    const shownTotal = state.confirmedOrder
      ? state.confirmedOrder.total
      : (totals ? totals.total : ((state.screen === "S2" || (state.screen === "S3" && state.recovery && state.recovery.returnTo === "S2")) ? computePdpPreviewTotals().total : 0));

    scaffoldTotal.textContent = money(shownTotal);
    if (shownTotal === 0) {
      scaffoldBudgetStatus.textContent = "Ready to select";
      scaffoldBudgetStatus.className = "budget-status-pill ok";
    } else if (shownTotal <= state.filters.maxBudget) {
      const under = state.filters.maxBudget - shownTotal;
      scaffoldBudgetStatus.textContent = `${money(under)} under budget`;
      scaffoldBudgetStatus.className = "budget-status-pill ok";
    } else {
      const over = shownTotal - state.filters.maxBudget;
      scaffoldBudgetStatus.textContent = `${money(over)} over budget`;
      scaffoldBudgetStatus.className = "budget-status-pill over";
    }
  }

  // Trigger Dedicated Recovery State S3 (Preserving All Valid Selections!)
  function openRecoveryS3(payload) {
    clearToast();
    state.recovery = payload;
    goTo("S3");
  }

  // =========================================================================
  // S1: CATALOG & GUIDED FILTER
  // =========================================================================
  function getFilteredProducts() {
    const q = state.filters.query.trim().toLowerCase();
    return PRODUCTS.filter((p) => {
      if (q && q !== "desk lamp" && q !== "lamp") {
        const hay = `${p.name} ${p.subtitle} ${p.description} ${p.sku}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (p.price > state.filters.maxBudget) return false;
      if (state.filters.bulbIncludedOnly && !p.bulbIncluded) return false;
      if (state.filters.colors.length > 0) {
        const hasMatch = p.finishes.some((f) => state.filters.colors.includes(f.colorGroup));
        if (!hasMatch) return false;
      }
      return true;
    }).sort((a, b) => {
      if (state.filters.sort === "price-desc") return b.price - a.price;
      return a.price - b.price;
    });
  }

  function renderS1() {
    const matches = getFilteredProducts();
    const allColors = [
      { name: "Dark Gray", hex: "#434850" },
      { name: "Black", hex: "#1b1f26" },
      { name: "White", hex: "#e7eaef" },
      { name: "Nickel", hex: "#9ca5b0" },
      { name: "Blue", hex: "#7ba7c7" }
    ];

    const activePills = [];
    activePills.push(`<span class="active-pill">Max budget: ${money(state.filters.maxBudget)}</span>`);
    state.filters.colors.forEach((c) => {
      activePills.push(`<span class="active-pill">Finish: ${escapeHtml(c)} <button type="button" data-remove-color="${escapeHtml(c)}" aria-label="Remove ${escapeHtml(c)} filter">&times;</button></span>`);
    });
    if (state.filters.bulbIncludedOnly) {
      activePills.push(`<span class="active-pill">Bulb included only <button type="button" id="btnRemoveBulbFilter" aria-label="Remove bulb filter">&times;</button></span>`);
    }

    appMain.innerHTML = `
      <div class="page-head">
        <div>
          <span class="eyebrow">Step 1 · Transparent Catalog &amp; Budget Filtering</span>
          <h1 class="page-title">Compact Study Desk Lamps</h1>
          <p class="page-subtitle">Upfront bulb requirements, desk footprint, and $35.00 delivery rules shown on every card—no surprise thresholds after adding to bag.</p>
        </div>
      </div>

      <div class="catalog-layout">
        <!-- Left Guided Filter Panel -->
        <aside class="card filter-panel" aria-label="Catalog filters">
          <h3>Refine your options</h3>

          <div class="filter-group">
            <label class="filter-label-row" for="catalogSearch">Search lamps</label>
            <input type="text" id="catalogSearch" class="search-input" value="${escapeHtml(state.filters.query)}" placeholder="e.g., desk lamp, TERTIAL, clamp" />
          </div>

          <div class="filter-group">
            <div class="filter-label-row">
              <label for="budgetSlider">Maximum budget</label>
              <span class="badge badge-info">${money(state.filters.maxBudget)}</span>
            </div>
            <p class="field-hint" style="margin-bottom:8px;">Custom limit (fixes rigid $40+ buckets). Lamp price shown below; full estimate with bulb &amp; fee updates live.</p>
            <div class="budget-input-row">
              <input type="range" id="budgetSlider" class="range-slider" min="15" max="80" step="5" value="${state.filters.maxBudget}" />
              <input type="number" id="budgetNum" class="budget-num" min="15" max="100" step="1" value="${state.filters.maxBudget}" aria-label="Maximum budget dollars" />
            </div>
          </div>

          <div class="filter-group">
            <div class="filter-label-row"><span>Finish color</span></div>
            <div class="chip-wrap">
              ${allColors.map((c) => {
                const sel = state.filters.colors.includes(c.name);
                return `<button type="button" class="filter-chip ${sel ? "selected" : ""}" data-color-chip="${escapeHtml(c.name)}" aria-pressed="${sel}">
                  <span class="swatch-dot" style="background:${c.hex}"></span>${escapeHtml(c.name)}
                </button>`;
              }).join("")}
            </div>
          </div>

          <div class="filter-group">
            <div class="filter-label-row"><span>Light bulb requirement</span></div>
            <label style="display:flex;align-items:center;gap:8px;font-size:13.5px;cursor:pointer;">
              <input type="checkbox" id="chkBulbIncluded" ${state.filters.bulbIncludedOnly ? "checked" : ""} />
              Show only lamps with built-in LED bulb
            </label>
          </div>

          <div class="filter-group">
            <button type="button" class="btn btn-secondary btn-sm btn-block" id="btnClearFilters">Reset all filters</button>
          </div>
        </aside>

        <!-- Right Product Results -->
        <section aria-label="Search results">
          <div class="results-toolbar">
            <div class="results-count" id="resultsCountText">
              Showing ${matches.length} of ${PRODUCTS.length} study lamps (counts verified)
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              <label for="sortSelect" style="font-size:13px;font-weight:600;color:var(--text-secondary);">Sort:</label>
              <select id="sortSelect" class="inline-select">
                <option value="price-asc" ${state.filters.sort === "price-asc" ? "selected" : ""}>Price: Low to High</option>
                <option value="price-desc" ${state.filters.sort === "price-desc" ? "selected" : ""}>Price: High to Low</option>
              </select>
            </div>
          </div>

          <div class="active-filters-bar">
            ${activePills.join("")}
          </div>

          ${matches.length === 0 ? `
            <div class="card" style="text-align:center;padding:36px;">
              <h3 style="margin-top:0;">No study lamps match all active filters</h3>
              <p style="color:var(--text-secondary);">Try raising your budget or clearing a finish chip to compare available compact lamps.</p>
              <button type="button" class="btn btn-primary" id="btnEmptyResetFilters">Reset filters</button>
            </div>
          ` : `
            <div class="product-grid">
              ${matches.map((p) => {
                const defaultFinish = p.finishes.find((f) => state.filters.colors.length === 0 || state.filters.colors.includes(f.colorGroup)) || p.finishes[0];
                const estTotalPickup = p.price + (p.bulbIncluded ? 0 : 2.49) + PICKUP_FEE;
                const deliveryNote = p.price >= DELIVERY_MIN
                  ? `Qualifies for Home Delivery (${money(DELIVERY_FEE)}) or Click & Collect (${money(PICKUP_FEE)})`
                  : `Click & Collect: ${money(PICKUP_FEE)} at ${state.area.store} · Home Delivery requires ${money(DELIVERY_MIN)}+ order`;
                return `
                  <article class="product-card">
                    <div class="product-illus-box">
                      <span class="card-sku">SKU ${p.sku}</span>
                      ${renderLampSvg(p.style, defaultFinish.hex, true)}
                    </div>
                    <div class="card-header-row">
                      <div>
                        <h2 class="card-title">${escapeHtml(p.name)}</h2>
                        <p class="card-sub">${escapeHtml(p.subtitle)}</p>
                      </div>
                      <div class="card-price">${money(p.price)}</div>
                    </div>
                    <div class="card-specs">
                      <span class="badge badge-neutral">${escapeHtml(p.footprint)}</span>
                      <span class="badge ${p.bulbIncluded ? "badge-success" : "badge-warn"}">${escapeHtml(p.bulbSummary)}</span>
                    </div>
                    <div class="card-swatches">
                      <span>Finishes:</span>
                      ${p.finishes.map((f) => `<span title="${escapeHtml(f.label)} (${f.inStock ? "In stock" : "Out of stock"})" class="swatch-dot" style="background:${f.hex};${f.inStock ? "" : "opacity:0.45;outline:1.5px dashed #b42318;"}"></span>`).join("")}
                      <span style="margin-left:auto;font-weight:600;">Est. w/ bulb+pickup: ~${money(estTotalPickup)}</span>
                    </div>
                    <div class="card-fulfillment-note">${escapeHtml(deliveryNote)}</div>
                    <button type="button" class="btn btn-primary btn-block" data-select-product="${p.id}" data-default-finish="${defaultFinish.id}">
                      Inspect specs &amp; configure options →
                    </button>
                  </article>
                `;
              }).join("")}
            </div>
          `}
        </section>
      </div>
    `;

    // Bind S1 Events
    document.getElementById("catalogSearch").addEventListener("input", (e) => {
      state.filters.query = e.target.value;
      renderS1();
      const inp = document.getElementById("catalogSearch");
      inp.focus();
      inp.setSelectionRange(inp.value.length, inp.value.length);
    });
    const syncBudget = (val) => {
      const clamped = Math.max(15, Math.min(100, Number(val) || 60));
      state.filters.maxBudget = clamped;
      render();
    };
    document.getElementById("budgetSlider").addEventListener("input", (e) => syncBudget(e.target.value));
    document.getElementById("budgetNum").addEventListener("change", (e) => syncBudget(e.target.value));

    document.querySelectorAll("[data-color-chip]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const col = btn.dataset.colorChip;
        if (state.filters.colors.includes(col)) {
          state.filters.colors = state.filters.colors.filter((c) => c !== col);
        } else {
          state.filters.colors.push(col);
        }
        render();
      });
    });

    document.querySelectorAll("[data-remove-color]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const col = btn.dataset.removeColor;
        state.filters.colors = state.filters.colors.filter((c) => c !== col);
        render();
      });
    });

    const remBulb = document.getElementById("btnRemoveBulbFilter");
    if (remBulb) remBulb.addEventListener("click", () => { state.filters.bulbIncludedOnly = false; render(); });

    document.getElementById("chkBulbIncluded").addEventListener("change", (e) => {
      state.filters.bulbIncludedOnly = e.target.checked;
      render();
    });

    document.getElementById("sortSelect").addEventListener("change", (e) => {
      state.filters.sort = e.target.value;
      render();
    });

    const resetF = () => {
      state.filters = { query: "desk lamp", maxBudget: 60, colors: [], bulbIncludedOnly: false, sort: "price-asc" };
      render();
    };
    document.getElementById("btnClearFilters").addEventListener("click", resetF);
    const emptyR = document.getElementById("btnEmptyResetFilters");
    if (emptyR) emptyR.addEventListener("click", resetF);

    document.querySelectorAll("[data-select-product]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const pid = btn.dataset.selectProduct;
        const prod = getProduct(pid);
        state.activeProductId = pid;
        // Prefer an in-stock finish matching defaultFinish
        const preferred = prod.finishes.find((f) => f.id === btn.dataset.defaultFinish && f.inStock) || prod.finishes.find((f) => f.inStock) || prod.finishes[0];
        state.selectedFinishId = preferred.id;
        state.selectedBulbId = prod.bulbIncluded ? "included" : "solhetta-450";
        clearToast();
        goTo("S2");
      });
    });
  }

  // =========================================================================
  // S2: PRODUCT DETAIL & OPTION CONFIGURATION
  // =========================================================================
  function renderS2() {
    const prod = getProduct(state.activeProductId);
    const finish = prod.finishes.find((f) => f.id === state.selectedFinishId) || prod.finishes[0];
    const preview = computePdpPreviewTotals();
    const bulbObj = prod.bulbIncluded ? null : getBulb(state.selectedBulbId);

    const pct = Math.min(100, Math.round((preview.combinedSub / DELIVERY_MIN) * 100));

    appMain.innerHTML = `
      <div class="back-row">
        <button type="button" class="link-btn" id="btnBackToCatalog">← Back to Study Lamps Catalog (filters preserved)</button>
      </div>

      <div class="pdp-layout">
        <!-- Left: Visual + Specs (Above-the-fold clarity) -->
        <div class="pdp-visual-card">
          <div>
            <span class="eyebrow">Step 2 · Inspect &amp; Configure · SKU ${prod.sku}</span>
            <div class="card-header-row">
              <div>
                <h1 class="page-title">${escapeHtml(prod.name)}</h1>
                <p class="page-subtitle">${escapeHtml(prod.subtitle)}</p>
              </div>
              <div style="font-size:28px;font-weight:900;color:var(--text);">${money(prod.price)}</div>
            </div>
          </div>

          <div class="pdp-stage">
            <span class="card-sku">Selected Finish: ${escapeHtml(finish.label)}</span>
            ${renderLampSvg(prod.style, finish.hex, prod.bulbIncluded || state.selectedBulbId !== "none")}
          </div>

          <p style="margin:0;color:var(--text-secondary);font-size:14.5px;">${escapeHtml(prod.description)}</p>

          <div>
            <h3 style="margin:0 0 10px;font-size:15px;">Desk-Fit &amp; Lighting Specifications</h3>
            <div class="spec-grid">
              <div class="spec-box"><span>Desk Footprint</span><strong>${escapeHtml(prod.footprint)}</strong></div>
              <div class="spec-box"><span>Shade Size</span><strong>${escapeHtml(prod.shade)}</strong></div>
              <div class="spec-box"><span>Cord Length</span><strong>${escapeHtml(prod.cord)}</strong></div>
              <div class="spec-box"><span>Light Source</span><strong>${prod.bulbIncluded ? "Built-in Warm 2700K LED" : "E26 LED (max 13W)"}</strong></div>
            </div>
          </div>
        </div>

        <!-- Right: Guided 3-Part Configuration Panel -->
        <div class="card">
          <!-- Part 1: Finish Selection -->
          <div class="config-section">
            <div class="config-heading">
              <span>1. Choose Finish</span>
              <span class="badge ${finish.inStock ? "badge-success" : "badge-danger"}">${finish.inStock ? "In Stock" : "Out of Stock"}</span>
            </div>
            <div class="option-list">
              ${prod.finishes.map((f) => {
                const isSel = f.id === finish.id;
                return `
                  <button type="button" class="option-card ${isSel ? "selected" : ""} ${!f.inStock ? "oos" : ""}" data-finish-id="${f.id}">
                    <span class="option-left">
                      <span class="swatch-dot" style="width:20px;height:20px;background:${f.hex};"></span>
                      <span>
                        <span class="option-title">${escapeHtml(f.label)}</span>
                        ${!f.inStock ? `<span class="option-tag-row"><span class="badge badge-danger">Out of Stock</span></span>` : ""}
                        <span class="option-meta">${escapeHtml(f.stockText)}</span>
                      </span>
                    </span>
                  </button>
                `;
              }).join("")}
            </div>
          </div>

          <!-- Part 2: Compatible Warm Light Bulb -->
          <div class="config-section">
            <div class="config-heading">
              <span>2. Compatible Warm Light Bulb</span>
              <span class="badge ${prod.bulbIncluded ? "badge-success" : "badge-warn"}">${prod.bulbIncluded ? "Built-in" : "Required to operate"}</span>
            </div>
            ${prod.bulbIncluded ? `
              <div class="preserved-box" style="margin:0;">
                <strong>Warm 2700K LED is built in.</strong> No separate light bulb purchase is needed—this lamp works immediately out of the box.
              </div>
            ` : `
              <div class="option-list">
                ${BULB_OPTIONS.map((b) => {
                  const isSel = state.selectedBulbId === b.id;
                  return `
                    <button type="button" class="option-card ${isSel ? "selected" : ""}" data-bulb-id="${b.id}">
                      <span>
                        <span class="option-title">${escapeHtml(b.shortName)}</span>
                        ${b.recommended ? `<span class="option-tag-row"><span class="badge badge-info">Recommended</span></span>` : ""}
                        <span class="option-meta">${escapeHtml(b.note)}</span>
                      </span>
                      <span class="option-price">${b.price > 0 ? "+" + money(b.price) : "$0.00"}</span>
                    </button>
                  `;
                }).join("")}
              </div>
            `}
          </div>

          <!-- Part 3: Upfront Fulfillment Choice (No Hidden $35 Surprise!) -->
          <div class="config-section">
            <div class="config-heading">
              <span>3. Fulfillment for ZIP ${escapeHtml(state.area.zip)}</span>
              <button type="button" class="link-btn" id="btnPdpChangeZip">Change ZIP</button>
            </div>
            <div class="option-list">
              <button type="button" class="option-card ${state.fulfillment === "pickup" ? "selected" : ""}" id="btnPdpPickup">
                <span>
                  <span class="option-title">Click &amp; Collect · ${escapeHtml(state.area.store)}</span>
                  <span class="option-meta">Ready ${escapeHtml(state.area.pickupDate)} (${escapeHtml(state.area.pickupWindow)}) · No minimum</span>
                </span>
                <span class="option-price">${money(PICKUP_FEE)}</span>
              </button>

              <button type="button" class="option-card ${state.fulfillment === "delivery" && preview.deliveryUnlocked ? "selected" : ""} ${!preview.deliveryUnlocked ? "oos" : ""}" id="btnPdpDelivery">
                <span>
                  <span class="option-title">Home Delivery to ${escapeHtml(state.area.zip)}</span>
                  <span class="option-meta">${preview.deliveryUnlocked
                    ? `Arrives ${escapeHtml(state.area.deliveryDate)} · Threshold met`
                    : `Requires ${money(DELIVERY_MIN)} subtotal (${money(preview.remainingForDelivery)} more needed)`}</span>
                </span>
                <span class="option-price">${preview.deliveryUnlocked ? money(DELIVERY_FEE) : "Locked"}</span>
              </button>
            </div>

            <div class="threshold-meter ${preview.deliveryUnlocked ? "met" : ""}">
              ${preview.deliveryUnlocked
                ? `<strong>Home Delivery unlocked!</strong> Your configured subtotal (${money(preview.combinedSub)}) meets the ${money(DELIVERY_MIN)} delivery minimum.`
                : `<strong>Upfront notice:</strong> Home Delivery requires a ${money(DELIVERY_MIN)} order minimum (${money(preview.remainingForDelivery)} away). Click &amp; Collect at ${escapeHtml(state.area.store)} is available immediately for ${money(PICKUP_FEE)}.`}
              <div class="meter-track"><div class="meter-fill" style="width:${pct}%"></div></div>
            </div>
          </div>

          <!-- Live Transparent Cost Breakdown -->
          <div class="cost-preview-box">
            <div class="cost-row"><span>${escapeHtml(prod.name)} (${escapeHtml(finish.label)})</span><span>${money(preview.lampPrice)}</span></div>
            <div class="cost-row"><span>${prod.bulbIncluded ? "Built-in Warm 2700K LED" : escapeHtml(bulbObj.shortName)}</span><span>${money(preview.bulbPrice)}</span></div>
            <div class="cost-row"><span>${state.fulfillment === "delivery" && preview.deliveryUnlocked ? `Home Delivery (${state.area.zip})` : `Click & Collect (${state.area.store})`}</span><span>${money(preview.fee)}</span></div>
            <div class="cost-row"><span>Estimated Sales Tax (${(state.area.taxRate * 100).toFixed(1)}%)</span><span>${money(preview.tax)}</span></div>
            <div class="cost-row total">
              <span>Estimated Total</span>
              <span>${money(preview.total)}</span>
            </div>
          </div>

          ${!finish.inStock ? (() => {
            const altInStock = prod.finishes.find((f) => f.inStock) || prod.finishes[0];
            return `
              <div class="oos-inline-note" role="status">
                <span><strong>${escapeHtml(finish.label)}</strong> is out of stock at ${escapeHtml(state.area.store)}. Choose an in-stock finish to add to bag.</span>
                <button type="button" class="link-btn" id="btnInlineSwitchInStock">Switch to ${escapeHtml(altInStock.label)}</button>
              </div>
            `;
          })() : ""}

          <div style="margin-top:16px;display:flex;flex-direction:column;gap:10px;">
            <button type="button" class="btn btn-primary btn-block" id="btnAddConfiguredToBag" ${!finish.inStock ? "disabled aria-disabled=\"true\"" : ""}>
              ${finish.inStock
                ? `Add Configured Lamp to Bag (${money(preview.itemSubtotal)})`
                : `Out of Stock — Select an In-Stock Finish to Add`}
            </button>
            ${state.cart.length > 0 ? `<button type="button" class="btn btn-secondary btn-block" id="btnPdpViewBag">View Shopping Bag (${cartItemCount()} item${cartItemCount() === 1 ? "" : "s"})</button>` : ""}
          </div>
        </div>
      </div>
    `;

    // Bind S2 Events
    document.getElementById("btnBackToCatalog").addEventListener("click", () => goTo("S1"));
    document.getElementById("btnPdpChangeZip").addEventListener("click", openLocationModal);

    const inlineSwitchBtn = document.getElementById("btnInlineSwitchInStock");
    if (inlineSwitchBtn) {
      inlineSwitchBtn.addEventListener("click", () => {
        const alt = prod.finishes.find((f) => f.inStock) || prod.finishes[0];
        state.selectedFinishId = alt.id;
        setToast("success", `Switched finish to <strong>${escapeHtml(alt.label)}</strong> (In Stock at ${escapeHtml(state.area.store)}).`);
        render();
      });
    }

    // Finish Selection -> Selecting an Out-of-Stock Finish keeps preview on S2, disables Add to Bag, and shows S3 Recovery Pop-Up!
    document.querySelectorAll("[data-finish-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const fid = btn.dataset.finishId;
        const chosen = prod.finishes.find((f) => f.id === fid);
        if (!chosen) return;
        state.selectedFinishId = fid;
        render();
        if (!chosen.inStock) {
          const alt = prod.finishes.find((f) => f.inStock) || prod.finishes[0];
          openOosModal(prod, chosen, alt);
        }
      });
    });

    document.querySelectorAll("[data-bulb-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.selectedBulbId = btn.dataset.bulbId;
        render();
      });
    });

    document.getElementById("btnPdpPickup").addEventListener("click", () => {
      state.fulfillment = "pickup";
      render();
    });

    // Clicking Home Delivery under $35 triggers S3 Recovery cleanly!
    document.getElementById("btnPdpDelivery").addEventListener("click", () => {
      if (!preview.deliveryUnlocked) {
        openRecoveryS3({
          kind: "delivery-minimum",
          returnTo: "S2",
          currentSubtotal: preview.combinedSub,
          shortfall: preview.remainingForDelivery,
          preservedSummary: `${prod.name} in ${finish.label}, bulb choice (${prod.bulbIncluded ? "Built-in Warm LED" : getBulb(state.selectedBulbId).shortName}), ZIP ${state.area.zip}, and your ${money(state.filters.maxBudget)} budget target.`
        });
        return;
      }
      state.fulfillment = "delivery";
      render();
    });

    document.getElementById("btnAddConfiguredToBag").addEventListener("click", () => {
      if (!finish.inStock) return;
      addCurrentPdpToBag();
      setToast(
        "success",
        `Added <strong>${escapeHtml(prod.name)} (${escapeHtml(finish.label)})</strong>${!prod.bulbIncluded && state.selectedBulbId !== "none" ? ` + ${escapeHtml(getBulb(state.selectedBulbId).shortName)}` : ""} to your shopping bag.`,
        "Continue Shopping",
        () => goTo("S1")
      );
      goTo("S4");
    });

    const viewBagBtn = document.getElementById("btnPdpViewBag");
    if (viewBagBtn) viewBagBtn.addEventListener("click", () => goTo("S4"));
  }

  function addCurrentPdpToBag() {
    const prod = getProduct(state.activeProductId);
    const finish = prod.finishes.find((f) => f.id === state.selectedFinishId && f.inStock) || prod.finishes.find((f) => f.inStock);
    const bulb = prod.bulbIncluded ? { id: "included", shortName: "Built-in Warm 2700K LED", price: 0 } : getBulb(state.selectedBulbId);

    const existing = state.cart.find(
      (i) => !i.isAccessory && i.productId === prod.id && i.finishId === finish.id && i.bulbId === bulb.id
    );
    if (existing) {
      existing.qty += 1;
    } else {
      state.cart.push({
        uid: "item-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
        productId: prod.id,
        sku: prod.sku,
        name: prod.name,
        subtitle: prod.subtitle,
        style: prod.style,
        unitPrice: prod.price,
        finishId: finish.id,
        finishLabel: finish.label,
        finishHex: finish.hex,
        bulbIncluded: prod.bulbIncluded,
        bulbId: bulb.id,
        bulbName: bulb.shortName,
        bulbPrice: bulb.price,
        qty: 1,
        isAccessory: false
      });
    }
  }

  // =========================================================================
  // S3: DEDICATED OPTION / FULFILLMENT / ZIP RECOVERY STATE
  // =========================================================================
  function renderS3() {
    const rec = state.recovery || {
      kind: "delivery-minimum",
      returnTo: "S2",
      currentSubtotal: 22.48,
      shortfall: 12.52,
      preservedSummary: "Your selected lamp, finish, bulb, and ZIP 85281 remain safely saved."
    };

    const isZip = rec.kind === "invalid-zip";
    let heading = "";
    let diagnosis = "";
    let optionsHtml = "";

    if (rec.kind === "out-of-stock") {
      heading = `${rec.productName} in "${rec.attemptedFinish}" is currently out of stock`;
      diagnosis = `<strong>${escapeHtml(rec.attemptedFinish)}</strong> is unavailable at <strong>${escapeHtml(state.area.store)}</strong> (ZIP ${escapeHtml(state.area.zip)}) and for local parcel delivery today. Choose an in-stock recovery option below without starting over.`;
      optionsHtml = `
        <div class="recovery-options-grid">
          <div class="recovery-option-card recommended">
            <div>
              <span class="badge badge-info" style="margin-bottom:8px;">Recommended Recovery</span>
              <h4>Switch to ${escapeHtml(rec.alternativeFinish.label)}</h4>
              <p>${escapeHtml(rec.alternativeFinish.stockText)}. Same lamp, price, and desk footprint.</p>
            </div>
            <button type="button" class="btn btn-primary btn-block" id="btnRecSwitchFinish">Use ${escapeHtml(rec.alternativeFinish.label)} &amp; Continue</button>
          </div>
          <div class="recovery-option-card">
            <div>
              <span class="badge badge-neutral" style="margin-bottom:8px;">Compare Alternatives</span>
              <h4>Browse In-Stock Dark Neutral Lamps</h4>
              <p>Return to catalog with your ${money(state.filters.maxBudget)} max budget preserved.</p>
            </div>
            <button type="button" class="btn btn-secondary btn-block" id="btnRecBrowseOther">Compare Other Lamps</button>
          </div>
        </div>
      `;
    } else if (rec.kind === "delivery-minimum") {
      heading = `Home Delivery requires a ${money(DELIVERY_MIN)} order minimum`;
      diagnosis = `Your current subtotal is <strong>${money(rec.currentSubtotal)}</strong>—which is <strong>${money(rec.shortfall)}</strong> below IKEA's ${money(DELIVERY_MIN)} threshold for Home Delivery to ZIP <strong>${escapeHtml(state.area.zip)}</strong>. Pick how you want to continue:`;
      optionsHtml = `
        <div class="recovery-options-grid">
          <div class="recovery-option-card recommended">
            <div>
              <span class="badge badge-info" style="margin-bottom:8px;">Lowest Cost · Under Budget</span>
              <h4>Switch to Click &amp; Collect (${money(PICKUP_FEE)})</h4>
              <p>Pick up at <strong>${escapeHtml(state.area.store)}</strong> on <strong>${escapeHtml(state.area.pickupDate)}</strong>. No minimum order required.</p>
            </div>
            <button type="button" class="btn btn-primary btn-block" id="btnRecUsePickup">Choose Click &amp; Collect (${money(PICKUP_FEE)})</button>
          </div>
          <div class="recovery-option-card">
            <div>
              <span class="badge badge-neutral" style="margin-bottom:8px;">Unlock Home Delivery</span>
              <h4>Add VATTENKAR Desk Organizer (+${money(ADDON_ORGANIZER.price)})</h4>
              <p>Brings subtotal over ${money(DELIVERY_MIN)} so Home Delivery (${money(DELIVERY_FEE)}) unlocks while staying under ${money(state.filters.maxBudget)}.</p>
            </div>
            <button type="button" class="btn btn-secondary btn-block" id="btnRecAddOrganizer">Add Organizer &amp; Unlock Delivery</button>
          </div>
          <div class="recovery-option-card">
            <div>
              <span class="badge badge-neutral" style="margin-bottom:8px;">Higher-Tier Lamp</span>
              <h4>View Lamps Qualifying for Delivery</h4>
              <p>Return to catalog (e.g., NYMÅNE at $49.99 qualifies directly for Home Delivery).</p>
            </div>
            <button type="button" class="btn btn-secondary btn-block" id="btnRecBackCatalog">Return to Catalog</button>
          </div>
        </div>
      `;
    } else if (rec.kind === "invalid-zip") {
      heading = `ZIP code "${rec.attemptedZip || "(blank)"}" could not be verified`;
      diagnosis = `We could not match <strong>"${escapeHtml(rec.attemptedZip || "empty input")}"</strong> to a valid 5-digit US delivery area. Unlike an abrupt failure or silent reset, your previous valid location and bag remain untouched until you confirm a valid ZIP.`;
      optionsHtml = `
        <div class="card" style="margin-top:14px;background:var(--surface-muted);">
          <form id="recZipForm" novalidate>
            <label class="field-label" for="recZipInput">Enter a valid 5-digit US ZIP code</label>
            <div class="zip-input-row" style="margin-top:6px;">
              <input type="text" id="recZipInput" value="" placeholder="Try 85281, 85259, 90210, or 98101" inputmode="numeric" />
              <button type="submit" class="btn btn-primary">Verify &amp; Return</button>
            </div>
            <p class="field-error-msg hidden" id="recZipInlineErr" style="margin-top:8px;"></p>
          </form>
          <div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap;">
            <button type="button" class="btn btn-secondary" id="btnRecRestoreDefaultZip">
              Keep Previous Valid ZIP (${escapeHtml(state.area.zip)} · ${escapeHtml(state.area.store)})
            </button>
          </div>
        </div>
      `;
    }

    appMain.innerHTML = `
      <div class="recovery-shell">
        <div class="recovery-banner ${isZip ? "zip-error" : ""}">
          <div class="recovery-head">
            <div class="recovery-icon" aria-hidden="true">${isZip ? "!" : "⚠"}</div>
            <div>
              <span class="eyebrow">State S3 · Guided Recovery (No Progress Lost)</span>
              <h1 class="page-title" style="font-size:23px;">${escapeHtml(heading)}</h1>
              <p style="margin:8px 0 0;color:var(--text-secondary);font-size:14.5px;">${diagnosis}</p>
            </div>
          </div>

          <div class="preserved-box">
            <strong>What stayed safely preserved:</strong> ${escapeHtml(rec.preservedSummary)}
          </div>

          <h3 style="margin:0 0 6px;font-size:15.5px;">Choose how you want to recover</h3>
          ${optionsHtml}

          <div style="margin-top:20px;padding-top:14px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
            <button type="button" class="link-btn" id="btnRecCancelReturn">← Return to previous screen without changes</button>
            <span style="font-size:12.5px;color:var(--text-muted);">Codex P10 &amp; P11: Data and orientation restored together</span>
          </div>
        </div>
      </div>
    `;

    // Bind S3 Recovery Actions
    document.getElementById("btnRecCancelReturn").addEventListener("click", () => {
      goTo(rec.returnTo || "S2", { keepPrev: true });
    });

    if (rec.kind === "out-of-stock") {
      document.getElementById("btnRecSwitchFinish").addEventListener("click", () => {
        state.selectedFinishId = rec.alternativeFinish.id;
        setToast("success", `Switched finish to <strong>${escapeHtml(rec.alternativeFinish.label)}</strong> (In Stock at ${escapeHtml(state.area.store)}). Your bulb and budget choices were preserved.`);
        goTo("S2", { keepPrev: true });
      });
      document.getElementById("btnRecBrowseOther").addEventListener("click", () => goTo("S1"));
    }

    if (rec.kind === "delivery-minimum") {
      document.getElementById("btnRecUsePickup").addEventListener("click", () => {
        state.fulfillment = "pickup";
        setToast("success", `Fulfillment set to <strong>Click &amp; Collect at ${escapeHtml(state.area.store)} (${money(PICKUP_FEE)} · ${escapeHtml(state.area.pickupDate)})</strong>.`);
        goTo(rec.returnTo || "S2", { keepPrev: true });
      });
      document.getElementById("btnRecAddOrganizer").addEventListener("click", () => {
        // Ensure lamp is in bag if triggered from S2
        if (rec.returnTo === "S2" && state.cart.length === 0) {
          addCurrentPdpToBag();
        }
        const hasOrg = state.cart.find((i) => i.isAccessory && i.productId === ADDON_ORGANIZER.id);
        if (hasOrg) {
          hasOrg.qty += 1;
        } else {
          state.cart.push({
            uid: "acc-" + Date.now(),
            productId: ADDON_ORGANIZER.id,
            sku: ADDON_ORGANIZER.sku,
            name: ADDON_ORGANIZER.name,
            subtitle: ADDON_ORGANIZER.subtitle,
            style: "accessory",
            unitPrice: ADDON_ORGANIZER.price,
            finishId: "black",
            finishLabel: "Black",
            finishHex: "#1f242c",
            bulbIncluded: true,
            bulbId: "na",
            bulbName: "Desk accessory (no bulb needed)",
            bulbPrice: 0,
            qty: 1,
            isAccessory: true
          });
        }
        state.fulfillment = "delivery";
        setToast("success", `Added <strong>${ADDON_ORGANIZER.name} (${money(ADDON_ORGANIZER.price)})</strong> and unlocked <strong>Home Delivery to ${escapeHtml(state.area.zip)}</strong>.`);
        goTo("S4");
      });
      document.getElementById("btnRecBackCatalog").addEventListener("click", () => goTo("S1"));
    }

    if (rec.kind === "invalid-zip") {
      document.getElementById("recZipForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const val = document.getElementById("recZipInput").value.trim();
        const errEl = document.getElementById("recZipInlineErr");
        if (!/^\d{5}$/.test(val) || !SERVICE_AREAS[val]) {
          errEl.textContent = `Please enter a supported 5-digit ZIP code (e.g., 85281, 85259, 90210, or 98101).`;
          errEl.classList.remove("hidden");
          return;
        }
        applyValidArea(SERVICE_AREAS[val], rec.returnTo === "S5");
        setToast("success", `Location verified: <strong>${val} · ${SERVICE_AREAS[val].store}</strong>. All selections preserved.`);
        goTo(rec.returnTo || "S4", { keepPrev: true });
      });
      document.getElementById("btnRecRestoreDefaultZip").addEventListener("click", () => {
        setToast("info", `Kept verified location <strong>${escapeHtml(state.area.zip)} · ${escapeHtml(state.area.store)}</strong>.`);
        goTo(rec.returnTo || "S4", { keepPrev: true });
      });
    }
  }

  // =========================================================================
  // S4: SHOPPING BAG & TRANSPARENT COST REVIEW
  // =========================================================================
  function renderS4() {
    const totals = computeCartTotals();

    if (state.cart.length === 0) {
      appMain.innerHTML = `
        <div class="card" style="max-width:640px;margin:20px auto;text-align:center;padding:40px;">
          <span class="eyebrow">State S4 · Shopping Bag</span>
          <h1 class="page-title" style="margin-bottom:8px;">Your shopping bag is empty</h1>
          <p class="page-subtitle" style="margin-bottom:20px;">Browse compact study desk lamps with upfront bulb pairing and transparent cost estimates.</p>
          <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;">
            <button type="button" class="btn btn-primary" id="btnEmptyBagShop">Browse Desk Lamps</button>
            ${state.lastRemovedItem ? `<button type="button" class="btn btn-secondary" id="btnUndoLastRemove">Undo Remove (${escapeHtml(state.lastRemovedItem.name)})</button>` : ""}
          </div>
        </div>
      `;
      document.getElementById("btnEmptyBagShop").addEventListener("click", () => goTo("S1"));
      const undoBtn = document.getElementById("btnUndoLastRemove");
      if (undoBtn) {
        undoBtn.addEventListener("click", () => {
          state.cart.push(state.lastRemovedItem);
          state.lastRemovedItem = null;
          setToast("success", "Restored removed item to your bag.");
          render();
        });
      }
      return;
    }

    const pct = Math.min(100, Math.round((totals.subtotal / DELIVERY_MIN) * 100));

    appMain.innerHTML = `
      <div class="page-head">
        <div>
          <span class="eyebrow">Step 3 · Unobstructed Bag &amp; Budget Verification</span>
          <h1 class="page-title">Shopping Bag (${cartItemCount()} item${cartItemCount() === 1 ? "" : "s"})</h1>
          <p class="page-subtitle">All finishes, light bulbs, fulfillment fees, and estimated tax are visible upfront—zero hidden fees or overlapping sticky bars.</p>
        </div>
        <button type="button" class="btn btn-secondary btn-sm" id="btnBagContinueShop">+ Add Another Item</button>
      </div>

      <div class="two-col-layout">
        <!-- Left: Items + Fulfillment Choice -->
        <div>
          <!-- Consistent Fulfillment Cards (No contradictory green dots!) -->
          <div class="card" style="margin-bottom:18px;">
            <div class="config-heading">
              <span>How would you like to receive your order? (ZIP ${escapeHtml(state.area.zip)})</span>
              <button type="button" class="link-btn" id="btnBagChangeZip">Update ZIP</button>
            </div>
            <div class="option-list">
              <button type="button" class="option-card ${totals.effectiveMode === "pickup" ? "selected" : ""}" id="btnBagPickup">
                <span>
                  <span class="option-title">Click &amp; Collect · ${escapeHtml(state.area.store)} <span class="badge badge-success" style="margin-left:6px;">Available</span></span>
                  <span class="option-meta">Locked ready date: ${escapeHtml(state.area.pickupDate)} (${escapeHtml(state.area.pickupWindow)})</span>
                </span>
                <span class="option-price">${money(PICKUP_FEE)}</span>
              </button>

              <button type="button" class="option-card ${totals.effectiveMode === "delivery" ? "selected" : ""} ${!totals.deliveryUnlocked ? "oos" : ""}" id="btnBagDelivery">
                <span>
                  <span class="option-title">Home Delivery to ${escapeHtml(state.area.zip)}
                    ${totals.deliveryUnlocked
                      ? `<span class="badge badge-success" style="margin-left:6px;">Unlocked</span>`
                      : `<span class="badge badge-warn" style="margin-left:6px;">Needs ${money(totals.remainingForDelivery)} more</span>`}
                  </span>
                  <span class="option-meta">${totals.deliveryUnlocked
                    ? `Estimated arrival: ${escapeHtml(state.area.deliveryDate)}`
                    : `Minimum ${money(DELIVERY_MIN)} item subtotal required — click to view recovery options`}</span>
                </span>
                <span class="option-price">${totals.deliveryUnlocked ? money(DELIVERY_FEE) : "Locked"}</span>
              </button>
            </div>

            <div class="threshold-meter ${totals.deliveryUnlocked ? "met" : ""}">
              ${totals.deliveryUnlocked
                ? `<strong>${money(DELIVERY_MIN)} delivery minimum met.</strong> Choose either Click &amp; Collect or Home Delivery above.`
                : `Subtotal is ${money(totals.subtotal)} of ${money(DELIVERY_MIN)} needed for Home Delivery (${money(totals.remainingForDelivery)} remaining). Click &amp; Collect is ready now.`}
              <div class="meter-track"><div class="meter-fill" style="width:${pct}%"></div></div>
            </div>
          </div>

          <!-- Cart Items (Directly editable inline, unobstructed) -->
          ${state.cart.map((item) => {
            const lineTotal = (item.unitPrice + item.bulbPrice) * item.qty;
            const prod = !item.isAccessory ? getProduct(item.productId) : null;
            return `
              <article class="bag-item-card">
                <div class="bag-thumb">${renderLampSvg(item.style, item.finishHex, item.bulbIncluded || item.bulbId !== "none")}</div>
                <div>
                  <div class="bag-item-top">
                    <div>
                      <strong style="font-size:17px;">${escapeHtml(item.name)}</strong>
                      <span class="badge badge-neutral" style="margin-left:6px;">SKU ${item.sku}</span>
                      <div style="font-size:13.5px;color:var(--text-secondary);margin-top:2px;">${escapeHtml(item.subtitle)}</div>
                    </div>
                    <strong style="font-size:18px;">${money(lineTotal)}</strong>
                  </div>

                  <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;align-items:center;">
                    <span class="badge badge-info"><span class="swatch-dot" style="background:${item.finishHex};width:10px;height:10px;"></span> Finish: ${escapeHtml(item.finishLabel)}</span>
                    ${item.isAccessory ? `<span class="badge badge-neutral">Desk Accessory</span>`
                      : item.bulbIncluded
                        ? `<span class="badge badge-success">Built-in Warm 2700K LED included</span>`
                        : `<span class="badge ${item.bulbId === "none" ? "badge-warn" : "badge-success"}">${escapeHtml(item.bulbName)} (${item.bulbPrice > 0 ? "+" + money(item.bulbPrice) : "$0.00"})</span>`}
                    <span class="badge ${totals.deliveryUnlocked ? "badge-success" : "badge-neutral"}">
                      ${totals.deliveryUnlocked ? "Pickup & Delivery ready" : "Click & Collect ready (Delivery <$35)"}
                    </span>
                  </div>

                  ${!item.isAccessory && !item.bulbIncluded ? `
                    <div style="margin-top:10px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                      <label style="font-size:12.5px;font-weight:700;color:var(--text-secondary);" for="bagBulb-${item.uid}">Paired bulb:</label>
                      <select class="inline-select" id="bagBulb-${item.uid}" data-change-bulb="${item.uid}">
                        ${BULB_OPTIONS.map((b) => `<option value="${b.id}" ${item.bulbId === b.id ? "selected" : ""}>${escapeHtml(b.shortName)} (${b.price > 0 ? "+" + money(b.price) : "$0"})</option>`).join("")}
                      </select>
                    </div>
                  ` : ""}

                  ${prod ? `
                    <div style="margin-top:8px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                      <label style="font-size:12.5px;font-weight:700;color:var(--text-secondary);" for="bagFinish-${item.uid}">Finish:</label>
                      <select class="inline-select" id="bagFinish-${item.uid}" data-change-finish="${item.uid}">
                        ${prod.finishes.map((f) => `<option value="${f.id}" ${item.finishId === f.id ? "selected" : ""}>${escapeHtml(f.label)} ${f.inStock ? "(In stock)" : "(Out of stock)"}</option>`).join("")}
                      </select>
                    </div>
                  ` : ""}

                  <div class="bag-item-controls">
                    <div class="qty-stepper" aria-label="Quantity for ${escapeHtml(item.name)}">
                      <button type="button" data-qty-dec="${item.uid}" aria-label="Decrease quantity">−</button>
                      <span>${item.qty}</span>
                      <button type="button" data-qty-inc="${item.uid}" aria-label="Increase quantity">+</button>
                    </div>
                    <button type="button" class="btn btn-sm btn-danger-outline" data-remove-item="${item.uid}">Remove item</button>
                  </div>
                </div>
              </article>
            `;
          }).join("")}
        </div>

        <!-- Right: Unobstructed Order Summary -->
        <aside class="summary-card" aria-label="Order summary">
          <h3>Order Summary</h3>
          <div class="cost-row"><span>Items subtotal</span><span>${money(totals.subtotal)}</span></div>
          <div class="cost-row">
            <span>${totals.effectiveMode === "delivery" ? `Home Delivery (${state.area.zip})` : `Click & Collect (${state.area.store})`}</span>
            <span>${money(totals.fee)}</span>
          </div>
          <div class="cost-row"><span>Estimated Sales Tax (${(state.area.taxRate * 100).toFixed(1)}%)</span><span>${money(totals.tax)}</span></div>
          <div class="cost-row total">
            <span>Estimated Total</span>
            <span>${money(totals.total)}</span>
          </div>

          <div style="margin:14px 0;padding:10px 12px;border-radius:8px;font-size:13px;${totals.total <= state.filters.maxBudget ? "background:var(--success-bg);color:#0b4f2d;border:1px solid var(--success-border);" : "background:var(--warn-bg);color:#6b3b00;border:1px solid var(--warn-border);"}">
            ${totals.total <= state.filters.maxBudget
              ? `<strong>Within your ${money(state.filters.maxBudget)} budget</strong> (${money(state.filters.maxBudget - totals.total)} remaining).`
              : `<strong>${money(totals.total - state.filters.maxBudget)} over your ${money(state.filters.maxBudget)} budget.</strong> Adjust items, bulb, or switch to Click &amp; Collect above.`}
          </div>

          <button type="button" class="btn btn-primary btn-block" id="btnProceedCheckout">
            Continue to Guest Checkout →
          </button>
          <p class="field-hint" style="text-align:center;margin-top:8px;">No account required. Your selected store (${escapeHtml(state.area.store)}) stays locked into checkout.</p>
        </aside>
      </div>
    `;

    // Bind S4 Events
    document.getElementById("btnBagContinueShop").addEventListener("click", () => goTo("S1"));
    document.getElementById("btnBagChangeZip").addEventListener("click", openLocationModal);

    document.getElementById("btnBagPickup").addEventListener("click", () => {
      state.fulfillment = "pickup";
      render();
    });
    document.getElementById("btnBagDelivery").addEventListener("click", () => {
      if (!totals.deliveryUnlocked) {
        openRecoveryS3({
          kind: "delivery-minimum",
          returnTo: "S4",
          currentSubtotal: totals.subtotal,
          shortfall: totals.remainingForDelivery,
          preservedSummary: `${cartItemCount()} item(s) in your bag (${money(totals.subtotal)}), ZIP ${state.area.zip}, and your ${money(state.filters.maxBudget)} budget target.`
        });
        return;
      }
      state.fulfillment = "delivery";
      render();
    });

    document.querySelectorAll("[data-qty-inc]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const it = state.cart.find((x) => x.uid === btn.dataset.qtyInc);
        if (it) { it.qty += 1; render(); }
      });
    });
    document.querySelectorAll("[data-qty-dec]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const it = state.cart.find((x) => x.uid === btn.dataset.qtyDec);
        if (!it) return;
        if (it.qty > 1) {
          it.qty -= 1;
          render();
        } else {
          removeItemWithUndo(it.uid);
        }
      });
    });
    document.querySelectorAll("[data-remove-item]").forEach((btn) => {
      btn.addEventListener("click", () => removeItemWithUndo(btn.dataset.removeItem));
    });

    document.querySelectorAll("[data-change-bulb]").forEach((sel) => {
      sel.addEventListener("change", () => {
        const it = state.cart.find((x) => x.uid === sel.dataset.changeBulb);
        const b = getBulb(sel.value);
        if (it && b) {
          it.bulbId = b.id;
          it.bulbName = b.shortName;
          it.bulbPrice = b.price;
          setToast("info", `Updated bulb pairing for <strong>${escapeHtml(it.name)}</strong> to ${escapeHtml(b.shortName)}.`);
          render();
        }
      });
    });

    document.querySelectorAll("[data-change-finish]").forEach((sel) => {
      sel.addEventListener("change", () => {
        const it = state.cart.find((x) => x.uid === sel.dataset.changeFinish);
        const prod = getProduct(it.productId);
        const f = prod.finishes.find((x) => x.id === sel.value);
        if (!f) return;
        if (!f.inStock) {
          const alt = prod.finishes.find((x) => x.inStock);
          openRecoveryS3({
            kind: "out-of-stock",
            returnTo: "S4",
            productId: prod.id,
            productName: prod.name,
            attemptedFinish: f.label,
            alternativeFinish: alt,
            preservedSummary: `Your bag with ${prod.name} (${it.finishLabel}), bulb pairing, and store (${state.area.store}) remains untouched.`
          });
          return;
        }
        it.finishId = f.id;
        it.finishLabel = f.label;
        it.finishHex = f.hex;
        render();
      });
    });

    document.getElementById("btnProceedCheckout").addEventListener("click", () => {
      state.checkout.zip = state.area.zip;
      state.checkout.city = state.area.city;
      state.checkout.stateCode = state.area.state;
      clearToast();
      goTo("S5");
    });
  }

  function removeItemWithUndo(uid) {
    const idx = state.cart.findIndex((x) => x.uid === uid);
    if (idx === -1) return;
    const [removed] = state.cart.splice(idx, 1);
    state.lastRemovedItem = removed;
    setToast(
      "info",
      `Removed <strong>${escapeHtml(removed.name)} (${escapeHtml(removed.finishLabel)})</strong> from your bag.`,
      "Undo Remove",
      () => {
        state.cart.splice(idx, 0, removed);
        state.lastRemovedItem = null;
        render();
      }
    );
    render();
  }

  // =========================================================================
  // S5 & S6: GUEST CHECKOUT (NORMAL S5 vs VALIDATION RECOVERY S6)
  // =========================================================================
  function renderCheckout(isErrorState) {
    const totals = computeCartTotals();
    const c = state.checkout;
    const errs = isErrorState ? state.checkoutErrors : {};
    const errKeys = Object.keys(errs);
    const isDelivery = totals.effectiveMode === "delivery";

    const errSummaryHtml = isErrorState && errKeys.length > 0 ? `
      <div class="error-summary-box" id="checkoutErrorSummary" role="alert" tabindex="-1">
        <h3>State S6 · ${errKeys.length} detail${errKeys.length === 1 ? "" : "s"} need attention before reviewing your order</h3>
        <p style="margin:0;font-size:13.5px;">All valid entries, your bag items, and your locked fulfillment store (<strong>${escapeHtml(state.area.store)}</strong>) are safely preserved. Select any item below to jump directly to the field:</p>
        <ul class="error-summary-list">
          ${errKeys.map((k) => `<li><a href="#field-${k}" data-jump-field="${k}">${escapeHtml(errs[k])}</a></li>`).join("")}
        </ul>
      </div>
    ` : "";

    const pendingSwapHtml = c.pendingAreaSwap ? `
      <div class="store-diff-alert" role="region" aria-label="Confirm fulfillment store change">
        <strong>Explicit Store &amp; Date Change Check (No Silent Substitutions):</strong>
        <p style="margin:6px 0 10px;">
          Changing ZIP to <strong>${escapeHtml(c.pendingAreaSwap.zip)}</strong> would update your pickup store from
          <strong>${escapeHtml(state.area.store)} (${escapeHtml(state.area.pickupDate)})</strong> to
          <strong>${escapeHtml(c.pendingAreaSwap.store)} (${escapeHtml(c.pendingAreaSwap.pickupDate)})</strong>
          and tax rate to <strong>${(c.pendingAreaSwap.taxRate * 100).toFixed(1)}%</strong>.
        </p>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button type="button" class="btn btn-primary btn-sm" id="btnApproveSwap">Confirm Change to ${escapeHtml(c.pendingAreaSwap.store)}</button>
          <button type="button" class="btn btn-secondary btn-sm" id="btnKeepOriginalStore">Keep ${escapeHtml(state.area.store)} (${escapeHtml(state.area.pickupDate)})</button>
        </div>
      </div>
    ` : "";

    appMain.innerHTML = `
      <div class="back-row" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
        <button type="button" class="link-btn" id="btnCheckoutBackBag">← Edit Shopping Bag (your entered details stay saved)</button>
        <button type="button" class="link-btn" id="btnFillSampleFictional">Fill sample fictional details</button>
      </div>

      <div class="page-head">
        <div>
          <span class="eyebrow">Step 4 · Guest Checkout · Fictional Information Only</span>
          <h1 class="page-title">${isErrorState ? "Fix Highlighted Details to Continue" : "Fulfillment &amp; Contact Details"}</h1>
          <p class="page-subtitle">Checking out as a guest (no login wall). Your fulfillment store and date stay locked unless you explicitly approve a change.</p>
        </div>
      </div>

      ${errSummaryHtml}

      <div class="two-col-layout">
        <div>
          <!-- Locked Fulfillment Card (Fixes H4 Silent Store Substitution!) -->
          <div class="locked-fulfillment-card">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;">
              <div>
                <span class="badge badge-success" style="margin-bottom:6px;">Locked from Bag · No Silent Store Changes</span>
                <h3 style="margin:0;font-size:16.5px;">
                  ${isDelivery ? `Home Delivery to ZIP ${escapeHtml(state.area.zip)}` : `Click &amp; Collect · ${escapeHtml(state.area.store)}`}
                </h3>
                <p style="margin:4px 0 0;font-size:13.5px;color:var(--text-secondary);">
                  ${isDelivery
                    ? `Estimated arrival: <strong>${escapeHtml(state.area.deliveryDate)}</strong> · Fee: <strong>${money(DELIVERY_FEE)}</strong>`
                    : `${escapeHtml(state.area.storeAddress)} · Ready <strong>${escapeHtml(state.area.pickupDate)} (${escapeHtml(state.area.pickupWindow)})</strong> · Fee: <strong>${money(PICKUP_FEE)}</strong>`}
                </p>
              </div>
              <button type="button" class="btn btn-secondary btn-sm" id="btnCheckoutChangeZip">Change ZIP / Store</button>
            </div>
            ${pendingSwapHtml}
          </div>

          <!-- Contact & Fictional Payment Form -->
          <form class="card" id="checkoutForm" novalidate>
            <h3 style="margin:0 0 4px;font-size:17px;">1. Contact Details (Use Fictional Info)</h3>
            <p class="field-hint" style="margin-bottom:14px;">Required fields are marked with <span class="req-star">*</span>. All entries are simulated locally.</p>

            <div class="form-grid">
              <div class="form-field full ${errs.fullName ? "has-error" : ""}">
                <label class="field-label" for="field-fullName">Full name <span class="req-star">*</span></label>
                <input type="text" class="text-input" id="field-fullName" value="${escapeHtml(c.fullName)}" placeholder="e.g., Jordan Taylor" autocomplete="name" aria-invalid="${Boolean(errs.fullName)}" />
                ${errs.fullName ? `<span class="field-error-msg">⚠ ${escapeHtml(errs.fullName)}</span>` : ""}
              </div>

              <div class="form-field ${errs.email ? "has-error" : ""}">
                <label class="field-label" for="field-email">Email address (for receipt) <span class="req-star">*</span></label>
                <input type="email" class="text-input" id="field-email" value="${escapeHtml(c.email)}" placeholder="e.g., jordan@example.com" autocomplete="email" aria-invalid="${Boolean(errs.email)}" />
                ${errs.email ? `<span class="field-error-msg">⚠ ${escapeHtml(errs.email)}</span>` : `<span class="field-hint">Format: name@example.com</span>`}
              </div>

              <div class="form-field ${errs.phone ? "has-error" : ""}">
                <label class="field-label" for="field-phone">Phone number (pickup/delivery alerts) <span class="req-star">*</span></label>
                <input type="tel" class="text-input" id="field-phone" value="${escapeHtml(c.phone)}" placeholder="e.g., 480-555-0192" autocomplete="tel" aria-invalid="${Boolean(errs.phone)}" />
                ${errs.phone ? `<span class="field-error-msg">⚠ ${escapeHtml(errs.phone)}</span>` : `<span class="field-hint">10-digit US number (fictional)</span>`}
              </div>
            </div>

            <div style="margin-top:20px;padding-top:18px;border-top:1px solid var(--border);">
              <h3 style="margin:0 0 12px;font-size:17px;">2. ${isDelivery ? "Delivery Address" : "Billing &amp; ZIP Verification"}</h3>
              <div class="form-grid">
                <div class="form-field full ${errs.street ? "has-error" : ""}">
                  <label class="field-label" for="field-street">Street address ${isDelivery ? '<span class="req-star">*</span>' : "(optional for Click &amp; Collect)"}</label>
                  <input type="text" class="text-input" id="field-street" value="${escapeHtml(c.street)}" placeholder="e.g., 525 E University Dr Apt 204" aria-invalid="${Boolean(errs.street)}" />
                  ${errs.street ? `<span class="field-error-msg">⚠ ${escapeHtml(errs.street)}</span>` : ""}
                </div>

                <div class="form-field ${errs.zip ? "has-error" : ""}">
                  <label class="field-label" for="field-zip">ZIP code <span class="req-star">*</span></label>
                  <input type="text" class="text-input" id="field-zip" value="${escapeHtml(c.zip)}" placeholder="e.g., 85281" inputmode="numeric" aria-invalid="${Boolean(errs.zip)}" />
                  ${errs.zip ? `<span class="field-error-msg">⚠ ${escapeHtml(errs.zip)}</span>` : `<span class="field-hint">Valid demo ZIPs: 85281, 85259, 90210, 98101 (try 00000 to test error recovery)</span>`}
                </div>

                <div class="form-field">
                  <label class="field-label" for="field-stateCode">State (US)</label>
                  <select class="text-input" id="field-stateCode">
                    <option value="AZ" ${c.stateCode === "AZ" ? "selected" : ""}>Arizona (AZ)</option>
                    <option value="CA" ${c.stateCode === "CA" ? "selected" : ""}>California (CA)</option>
                    <option value="WA" ${c.stateCode === "WA" ? "selected" : ""}>Washington (WA)</option>
                  </select>
                </div>
              </div>
            </div>

            <div style="margin-top:20px;padding-top:18px;border-top:1px solid var(--border);">
              <h3 style="margin:0 0 8px;font-size:17px;">3. Simulated Payment Method</h3>
              <div style="background:var(--surface-muted);border:1px solid var(--border);border-radius:10px;padding:12px 14px;font-size:13.5px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                <span><strong>Simulated Demo Card</strong> ending in <code>${escapeHtml(c.cardLast4)}</code> · No real charge occurs</span>
                <span class="badge badge-info">Demo Mode</span>
              </div>
            </div>

            <div style="margin-top:22px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
              <button type="button" class="btn btn-secondary" id="btnCheckoutEditBagBottom">← Return to Bag</button>
              <button type="submit" class="btn btn-primary" id="btnContinueReview">Continue to Final Order Review →</button>
            </div>
          </form>
        </div>

        <!-- Right: Completely Unobstructed Order Summary (No Chat FAB Overlap!) -->
        <aside class="summary-card" aria-label="Checkout order summary">
          <h3>Your Order (${cartItemCount()} item${cartItemCount() === 1 ? "" : "s"})</h3>
          ${state.cart.map((it) => `
            <div class="summary-mini-item">
              <div>
                <strong>${it.qty}× ${escapeHtml(it.name)}</strong> (${escapeHtml(it.finishLabel)})
                <div style="font-size:12px;color:var(--text-muted);">${escapeHtml(it.bulbName)}</div>
              </div>
              <strong>${money((it.unitPrice + it.bulbPrice) * it.qty)}</strong>
            </div>
          `).join("")}
          <div style="margin-top:12px;">
            <div class="cost-row"><span>Items subtotal</span><span>${money(totals.subtotal)}</span></div>
            <div class="cost-row"><span>${isDelivery ? "Home Delivery" : "Click & Collect"}</span><span>${money(totals.fee)}</span></div>
            <div class="cost-row"><span>Estimated Tax (${(state.area.taxRate * 100).toFixed(1)}%)</span><span>${money(totals.tax)}</span></div>
            <div class="cost-row total"><span>Estimated Total</span><span>${money(totals.total)}</span></div>
          </div>
          <p class="field-hint" style="margin-top:10px;">Next step lets you review every selection before placing your simulated order.</p>
        </aside>
      </div>
    `;

    // Bind live input preservation
    const bindField = (id, key) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("input", (e) => { state.checkout[key] = e.target.value; });
    };
    bindField("field-fullName", "fullName");
    bindField("field-email", "email");
    bindField("field-phone", "phone");
    bindField("field-street", "street");
    bindField("field-zip", "zip");
    document.getElementById("field-stateCode").addEventListener("change", (e) => {
      state.checkout.stateCode = e.target.value;
    });

    document.getElementById("btnCheckoutBackBag").addEventListener("click", () => goTo("S4"));
    document.getElementById("btnCheckoutEditBagBottom").addEventListener("click", () => goTo("S4"));
    document.getElementById("btnCheckoutChangeZip").addEventListener("click", openLocationModal);

    document.getElementById("btnFillSampleFictional").addEventListener("click", () => {
      state.checkout.fullName = "Jordan Taylor";
      state.checkout.email = "jordan.taylor@example.com";
      state.checkout.phone = "480-555-0192";
      state.checkout.street = "525 E University Dr Apt 204";
      state.checkout.zip = state.area.zip;
      state.checkout.stateCode = state.area.state;
      state.checkoutErrors = {};
      setToast("info", "Filled fictional sample contact details.");
      goTo("S5", { keepPrev: true });
    });

    const approveBtn = document.getElementById("btnApproveSwap");
    if (approveBtn) {
      approveBtn.addEventListener("click", () => {
        const nextArea = state.checkout.pendingAreaSwap;
        state.area = { ...nextArea };
        state.checkout.zip = nextArea.zip;
        state.checkout.city = nextArea.city;
        state.checkout.stateCode = nextArea.state;
        state.checkout.pendingAreaSwap = null;
        setToast("success", `Confirmed fulfillment update to <strong>${escapeHtml(nextArea.store)} (${escapeHtml(nextArea.pickupDate)})</strong>.`);
        render();
      });
    }
    const keepBtn = document.getElementById("btnKeepOriginalStore");
    if (keepBtn) {
      keepBtn.addEventListener("click", () => {
        state.checkout.pendingAreaSwap = null;
        state.checkout.zip = state.area.zip;
        setToast("info", `Kept original store <strong>${escapeHtml(state.area.store)} (${escapeHtml(state.area.pickupDate)})</strong>.`);
        render();
      });
    }

    // Error summary jump links
    document.querySelectorAll("[data-jump-field]").forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        const el = document.getElementById("field-" + a.dataset.jumpField);
        if (el) { el.focus(); el.scrollIntoView({ behavior: "smooth", block: "center" }); }
      });
    });

    // Submit Validation -> Transitions to S6 on error or S7 on valid!
    document.getElementById("checkoutForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const errors = {};
      if (!state.checkout.fullName.trim()) {
        errors.fullName = "Full name is required (e.g., Jordan Taylor).";
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(state.checkout.email.trim())) {
        errors.email = "Enter a valid email address such as jordan@example.com.";
      }
      const digits = state.checkout.phone.replace(/\D/g, "");
      if (digits.length < 10) {
        errors.phone = "Enter a 10-digit phone number (e.g., 480-555-0192).";
      }
      if (isDelivery && !state.checkout.street.trim()) {
        errors.street = "Street address is required for Home Delivery.";
      }
      const zipVal = state.checkout.zip.trim();
      if (!/^\d{5}$/.test(zipVal) || !SERVICE_AREAS[zipVal]) {
        errors.zip = `ZIP code "${zipVal || "(blank)"}" is not a recognized US service area. Enter 85281, 85259, 90210, or 98101 (your locked store ${state.area.store} remains intact).`;
      }

      if (Object.keys(errors).length > 0) {
        state.checkoutErrors = errors;
        goTo("S6");
        const box = document.getElementById("checkoutErrorSummary");
        if (box) box.focus();
        return;
      }

      // Check if user changed ZIP to a DIFFERENT store without approving swap yet
      const targetArea = SERVICE_AREAS[zipVal];
      if (targetArea.store !== state.area.store) {
        state.checkout.pendingAreaSwap = targetArea;
        state.checkoutErrors = {};
        goTo("S5");
        return;
      }

      state.checkoutErrors = {};
      clearToast();
      goTo("S7");
    });
  }

  // =========================================================================
  // S7: FINAL PRE-SUBMISSION ORDER REVIEW (ROUTE TO CHANGE BEFORE CLOSURE)
  // =========================================================================
  function renderS7() {
    const totals = computeCartTotals();
    const isDelivery = totals.effectiveMode === "delivery";
    const c = state.checkout;

    appMain.innerHTML = `
      <div class="page-head">
        <div>
          <span class="eyebrow">Step 5 · Deliberate Review Before Commitment</span>
          <h1 class="page-title">Review Your Order Before Placing</h1>
          <p class="page-subtitle">Check every selected option, fulfillment location, and total below. Nothing has been submitted yet.</p>
        </div>
      </div>

      <div class="review-status-banner">
        <div>
          <strong>Status: Pending Review — Order Not Yet Placed</strong>
          <div style="font-size:13px;color:#6b3b00;">You can edit items, finishes, bulbs, or contact details without losing your progress.</div>
        </div>
        <span class="badge badge-warn">Not Yet Submitted</span>
      </div>

      <div class="two-col-layout">
        <div>
          <!-- Configured Items Review -->
          <section class="review-section-card">
            <div class="review-section-head">
              <h3>1. Selected Lamp &amp; Options (${cartItemCount()} item${cartItemCount() === 1 ? "" : "s"})</h3>
              <button type="button" class="btn btn-secondary btn-sm" id="btnReviewEditBag">Edit Items / Finish / Bulb</button>
            </div>
            ${state.cart.map((it) => `
              <div style="display:flex;justify-content:space-between;align-items:center;gap:14px;padding:10px 0;border-bottom:1px solid var(--border);">
                <div style="display:flex;align-items:center;gap:12px;">
                  <div class="bag-thumb sm-thumb" style="width:68px;height:68px;">${renderLampSvg(it.style, it.finishHex, it.bulbIncluded || it.bulbId !== "none")}</div>
                  <div>
                    <strong>${it.qty}× ${escapeHtml(it.name)}</strong> · Finish: <strong>${escapeHtml(it.finishLabel)}</strong>
                    <div style="font-size:13px;color:var(--text-secondary);">${escapeHtml(it.bulbName)}</div>
                  </div>
                </div>
                <strong>${money((it.unitPrice + it.bulbPrice) * it.qty)}</strong>
              </div>
            `).join("")}
          </section>

          <!-- Locked Fulfillment & Contact Review -->
          <section class="review-section-card">
            <div class="review-section-head">
              <h3>2. Locked Fulfillment &amp; Contact Information</h3>
              <button type="button" class="btn btn-secondary btn-sm" id="btnReviewEditDetails">Edit Fulfillment / Details</button>
            </div>
            <div class="spec-grid">
              <div class="spec-box">
                <span>Fulfillment Method</span>
                <strong>${isDelivery ? `Home Delivery (${state.area.zip})` : `Click &amp; Collect · ${escapeHtml(state.area.store)}`}</strong>
              </div>
              <div class="spec-box">
                <span>Scheduled Date</span>
                <strong>${isDelivery ? escapeHtml(state.area.deliveryDate) : `${escapeHtml(state.area.pickupDate)} (${escapeHtml(state.area.pickupWindow)})`}</strong>
              </div>
              <div class="spec-box">
                <span>Recipient (Fictional)</span>
                <strong>${escapeHtml(c.fullName)} · ${escapeHtml(c.phone)}</strong>
              </div>
              <div class="spec-box">
                <span>Receipt Email &amp; Payment</span>
                <strong>${escapeHtml(c.email)} · Demo Card •••• ${escapeHtml(c.cardLast4)}</strong>
              </div>
            </div>
          </section>
        </div>

        <!-- Final Commitment Card -->
        <aside class="summary-card">
          <h3>Final Total Breakdown</h3>
          <div class="cost-row"><span>Items subtotal</span><span>${money(totals.subtotal)}</span></div>
          <div class="cost-row"><span>${isDelivery ? `Home Delivery (${state.area.zip})` : `Click & Collect (${state.area.store})`}</span><span>${money(totals.fee)}</span></div>
          <div class="cost-row"><span>Estimated Sales Tax (${(state.area.taxRate * 100).toFixed(1)}%)</span><span>${money(totals.tax)}</span></div>
          <div class="cost-row total"><span>Total Due (Simulated)</span><span>${money(totals.total)}</span></div>

          <div style="margin:14px 0;padding:10px 12px;border-radius:8px;font-size:13px;${totals.total <= state.filters.maxBudget ? "background:var(--success-bg);color:#0b4f2d;border:1px solid var(--success-border);" : "background:var(--warn-bg);color:#6b3b00;border:1px solid var(--warn-border);"}">
            ${totals.total <= state.filters.maxBudget
              ? `<strong>Verified within your ${money(state.filters.maxBudget)} budget</strong>.`
              : `<strong>Note:</strong> Total exceeds ${money(state.filters.maxBudget)} by ${money(totals.total - state.filters.maxBudget)}.`}
          </div>

          <button type="button" class="btn btn-success btn-block" id="btnPlaceSimulatedOrder">
            Place Simulated Order (${money(totals.total)})
          </button>
          <p class="field-hint" style="text-align:center;margin-top:8px;">Clicking above processes a simulated order and displays an authoritative confirmation receipt.</p>
        </aside>
      </div>
    `;

    document.getElementById("btnReviewEditBag").addEventListener("click", () => goTo("S4"));
    document.getElementById("btnReviewEditDetails").addEventListener("click", () => goTo("S5"));
    document.getElementById("btnPlaceSimulatedOrder").addEventListener("click", () => {
      // Explicit Processing State -> Confirmed Closure (Codex P5: Closure for Confidence)
      procStoreName.textContent = isDelivery ? `ZIP ${state.area.zip}` : state.area.store;
      processingOverlay.classList.remove("hidden");
      setTimeout(() => {
        processingOverlay.classList.add("hidden");
        const now = new Date();
        const timestamp = now.toLocaleString("en-US", {
          month: "short", day: "numeric", year: "numeric",
          hour: "numeric", minute: "2-digit"
        });
        state.confirmedOrder = {
          orderNumber: "IK-463-" + String(Math.floor(1000 + Math.random() * 9000)),
          timestamp,
          items: state.cart.map((x) => ({ ...x })),
          area: { ...state.area },
          fulfillmentMode: totals.effectiveMode,
          subtotal: totals.subtotal,
          fee: totals.fee,
          tax: totals.tax,
          total: totals.total,
          customer: { ...state.checkout }
        };
        goTo("S8");
      }, 650);
    });
  }

  // =========================================================================
  // S8: ORDER CONFIRMED — DURABLE CLOSURE RECEIPT
  // =========================================================================
  function renderS8() {
    const ord = state.confirmedOrder;
    if (!ord) { goTo("S1"); return; }
    const isDelivery = ord.fulfillmentMode === "delivery";

    appMain.innerHTML = `
      <div class="confirmed-shell">
        <div class="confirmed-hero">
          <div class="confirmed-top">
            <div class="check-circle" aria-hidden="true">✓</div>
            <div>
              <span class="badge badge-success" style="margin-bottom:5px;">State S8 · Order Complete — No Further Action Needed</span>
              <h1 class="page-title" style="color:#0b4f2d;">Simulated Order Confirmed!</h1>
              <p style="margin:4px 0 0;color:#145333;font-size:14.5px;">
                A copy of this simulated receipt was prepared for <strong>${escapeHtml(ord.customer.email)}</strong>. Your purchase workflow is complete.
              </p>
            </div>
          </div>

          <div class="receipt-meta-grid">
            <div class="receipt-meta-box">
              <span>Confirmation Number</span>
              <strong>${escapeHtml(ord.orderNumber)}</strong>
            </div>
            <div class="receipt-meta-box">
              <span>Confirmed At</span>
              <strong>${escapeHtml(ord.timestamp)}</strong>
            </div>
            <div class="receipt-meta-box">
              <span>Total Paid (Simulated)</span>
              <strong>${money(ord.total)}</strong>
            </div>
          </div>
        </div>

        <div class="review-section-card">
          <div class="review-section-head">
            <h3>Verified Fulfillment &amp; Items</h3>
            <span class="badge badge-success">Status: Confirmed</span>
          </div>

          <div class="spec-grid" style="margin-bottom:16px;">
            <div class="spec-box">
              <span>${isDelivery ? "Delivery Destination" : "Locked Pickup Location"}</span>
              <strong>${isDelivery ? `${escapeHtml(ord.customer.street)}, ${escapeHtml(ord.area.city)}, ${escapeHtml(ord.area.state)} ${escapeHtml(ord.area.zip)}` : `${escapeHtml(ord.area.store)} (${escapeHtml(ord.area.storeAddress)})`}</strong>
            </div>
            <div class="spec-box">
              <span>${isDelivery ? "Estimated Delivery" : "Pickup Window"}</span>
              <strong>${isDelivery ? escapeHtml(ord.area.deliveryDate) : `${escapeHtml(ord.area.pickupDate)} · ${escapeHtml(ord.area.pickupWindow)}`}</strong>
            </div>
          </div>

          ${ord.items.map((it) => `
            <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border);">
              <div>
                <strong>${it.qty}× ${escapeHtml(it.name)}</strong> · Finish: <strong>${escapeHtml(it.finishLabel)}</strong>
                <div style="font-size:13px;color:var(--text-secondary);">${escapeHtml(it.bulbName)}</div>
              </div>
              <strong>${money((it.unitPrice + it.bulbPrice) * it.qty)}</strong>
            </div>
          `).join("")}

          <div style="margin-top:14px;max-width:340px;margin-left:auto;">
            <div class="cost-row"><span>Items subtotal</span><span>${money(ord.subtotal)}</span></div>
            <div class="cost-row"><span>${isDelivery ? "Home Delivery" : "Click & Collect"}</span><span>${money(ord.fee)}</span></div>
            <div class="cost-row"><span>Sales Tax (${(ord.area.taxRate * 100).toFixed(1)}%)</span><span>${money(ord.tax)}</span></div>
            <div class="cost-row total"><span>Final Total</span><span>${money(ord.total)}</span></div>
          </div>
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
          <button type="button" class="btn btn-secondary" id="btnCopyReceipt">Copy Receipt Summary</button>
          <button type="button" class="btn btn-primary" id="btnDoneResetProto">Reset Prototype (Start New Session)</button>
        </div>
      </div>
    `;

    document.getElementById("btnCopyReceipt").addEventListener("click", () => {
      const text = `IKEA Study Lighting Simulated Receipt | ${ord.orderNumber} | ${ord.timestamp} | Total: ${money(ord.total)} | ${isDelivery ? "Delivery to " + ord.area.zip : ord.area.store + " (" + ord.area.pickupDate + ")"}`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
      }
      setToast("success", "Receipt summary copied (simulated durable record ready for future reference).");
    });

    document.getElementById("btnDoneResetProto").addEventListener("click", resetPrototype);
  }

  // =========================================================================
  // LOCATION MODAL & VALIDATION LOGIC
  // =========================================================================
  function openLocationModal() {
    modalZipInput.value = state.area.zip;
    locationModalBackdrop.classList.remove("hidden");
    setTimeout(() => modalZipInput.focus(), 40);
  }

  function closeLocationModal() {
    locationModalBackdrop.classList.add("hidden");
  }

  function applyValidArea(newArea, requireExplicitApproval) {
    if (requireExplicitApproval && newArea.store !== state.area.store) {
      state.checkout.pendingAreaSwap = newArea;
      render();
      return;
    }
    state.area = { ...newArea };
    state.checkout.zip = newArea.zip;
    state.checkout.city = newArea.city;
    state.checkout.stateCode = newArea.state;
  }

  document.getElementById("btnOpenLocation").addEventListener("click", openLocationModal);
  document.getElementById("btnCloseLocModal").addEventListener("click", closeLocationModal);
  locationModalBackdrop.addEventListener("click", (e) => {
    if (e.target === locationModalBackdrop) closeLocationModal();
  });

  document.getElementById("locationForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const val = modalZipInput.value.trim();
    closeLocationModal();
    if (!/^\d{5}$/.test(val) || !SERVICE_AREAS[val]) {
      openRecoveryS3({
        kind: "invalid-zip",
        returnTo: state.screen === "S3" ? (state.prevScreen || "S1") : state.screen,
        attemptedZip: val,
        preservedSummary: `Previous valid location (${state.area.zip} · ${state.area.store}), ${cartItemCount()} bag item(s), budget target (${money(state.filters.maxBudget)}), and any entered checkout fields remain safely preserved.`
      });
      return;
    }
    const newArea = SERVICE_AREAS[val];
    if (state.screen === "S5" || state.screen === "S6") {
      applyValidArea(newArea, true);
    } else {
      applyValidArea(newArea, false);
      setToast("success", `Updated location to <strong>${val} · ${newArea.store}</strong> (pickup ${newArea.pickupDate}).`);
      render();
    }
  });

  document.getElementById("btnQuickZipPhoenix").addEventListener("click", () => {
    modalZipInput.value = "85281";
  });
  document.getElementById("btnQuickZipInvalid").addEventListener("click", () => {
    modalZipInput.value = "00000";
  });

  // =========================================================================
  // OUT-OF-STOCK FINISH RECOVERY POP-UP MODAL (S3 Overlay on S2)
  // =========================================================================
  function openOosModal(prod, chosen, alt) {
    const bulbLabel = prod.bulbIncluded ? "Built-in Warm 2700K LED" : getBulb(state.selectedBulbId).shortName;
    protoStateBadge.textContent = "State S3: Option / Fulfillment Recovery (Pop-up)";
    oosModalContent.innerHTML = `
      <div class="modal-head">
        <div>
          <span class="eyebrow" style="color:var(--warn);">State S3 · Out-of-Stock Recovery</span>
          <h2 id="oosModalTitle">${escapeHtml(prod.name)} in "${escapeHtml(chosen.label)}" is out of stock</h2>
        </div>
        <button type="button" class="icon-close-btn" id="btnCloseOosModal" aria-label="Close out-of-stock warning">&times;</button>
      </div>
      <p class="modal-desc">
        <strong>${escapeHtml(chosen.label)}</strong> is currently unavailable at <strong>${escapeHtml(state.area.store)}</strong> (ZIP ${escapeHtml(state.area.zip)}). You can stay on this page to preview the finish (<em>Add to Bag</em> stays disabled), or switch to an in-stock finish in one click.
      </p>
      <div class="preserved-box" style="margin:12px 0 16px;">
        <strong>What stayed safely preserved:</strong> ${escapeHtml(prod.name)} (${money(prod.price)}), bulb choice (${escapeHtml(bulbLabel)}), budget limit (${money(state.filters.maxBudget)}), and store (${escapeHtml(state.area.store)}).
      </div>
      <div style="display:flex;flex-direction:column;gap:10px;">
        <button type="button" class="btn btn-primary btn-block" id="btnModalSwitchInStock">
          Switch to ${escapeHtml(alt.label)} (${escapeHtml(alt.stockText)})
        </button>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <button type="button" class="btn btn-secondary" style="flex:1;" id="btnModalKeepPreview">
            Keep Previewing ${escapeHtml(chosen.label)}
          </button>
          <button type="button" class="btn btn-secondary" style="flex:1;" id="btnModalBrowseOthers">
            Browse Other Lamps
          </button>
        </div>
      </div>
    `;
    oosModalBackdrop.classList.remove("hidden");

    document.getElementById("btnCloseOosModal").addEventListener("click", closeOosModal);
    document.getElementById("btnModalKeepPreview").addEventListener("click", closeOosModal);
    document.getElementById("btnModalSwitchInStock").addEventListener("click", () => {
      state.selectedFinishId = alt.id;
      closeOosModal();
      setToast("success", `Switched finish to <strong>${escapeHtml(alt.label)}</strong> (In Stock at ${escapeHtml(state.area.store)}). Your bulb and budget choices were preserved.`);
      render();
    });
    document.getElementById("btnModalBrowseOthers").addEventListener("click", () => {
      closeOosModal();
      goTo("S1");
    });
  }

  function closeOosModal() {
    oosModalBackdrop.classList.add("hidden");
    updateChrome();
  }

  oosModalBackdrop.addEventListener("click", (e) => {
    if (e.target === oosModalBackdrop) closeOosModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (!oosModalBackdrop.classList.contains("hidden")) closeOosModal();
      if (!locationModalBackdrop.classList.contains("hidden")) closeLocationModal();
    }
  });

  // =========================================================================
  // GLOBAL CONTROLS & RESET
  // =========================================================================
  function resetPrototype() {
    state = createInitialState();
    closeLocationModal();
    closeOosModal();
    processingOverlay.classList.add("hidden");
    clearToast();
    setToast("info", "Prototype reset to clean initial state (<strong>S1</strong>) — ready for a fresh walkthrough or usability participant.");
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  document.getElementById("btnGlobalReset").addEventListener("click", resetPrototype);
  document.getElementById("btnLogoHome").addEventListener("click", () => {
    if (state.screen === "S8") return resetPrototype();
    goTo("S1");
  });
  document.getElementById("btnOpenBag").addEventListener("click", () => {
    if (state.screen === "S8") return;
    goTo("S4");
  });

  document.getElementById("btnHelpInfo").addEventListener("click", (e) => {
    const isHidden = scopeBanner.classList.toggle("hidden");
    e.currentTarget.setAttribute("aria-expanded", String(!isHidden));
  });
  document.getElementById("btnCloseScope").addEventListener("click", () => {
    scopeBanner.classList.add("hidden");
    document.getElementById("btnHelpInfo").setAttribute("aria-expanded", "false");
  });

  document.querySelectorAll(".step-pill").forEach((pill) => {
    pill.addEventListener("click", () => {
      if (!pill.disabled) goTo(pill.dataset.step);
    });
  });

  // Master Render Dispatch
  function render() {
    updateChrome();
    renderToast();
    switch (state.screen) {
      case "S1": renderS1(); break;
      case "S2": renderS2(); break;
      case "S3": renderS3(); break;
      case "S4": renderS4(); break;
      case "S5": renderCheckout(false); break;
      case "S6": renderCheckout(true); break;
      case "S7": renderS7(); break;
      case "S8": renderS8(); break;
      default: renderS1();
    }
  }

  // Initial Mount
  render();
})();
