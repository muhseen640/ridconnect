/* =========================================================
   RIDCONNECT — FRONTEND DEMO
   ---------------------------------------------------------
   ⚠️ SECURITY NOTICE (read before shipping anywhere real):
   This file simulates a full marketplace using localStorage.
   Authentication, authorization, verification, payments and
   any other sensitive operation shown here are DEMO ONLY.
   None of it is safe against a malicious client. Before any
   production deployment, every one of these must be re-built
   behind a real server: hashed credentials + sessions/JWT,
   server-side role checks on every write, payment status
   verified by the payment provider's webhook (never the
   browser), and audit logging server-side. Treat everything
   below as UI/UX + data-shape reference, not as security.
   ========================================================= */

(() => {
  "use strict";

  /* =========================================================
     1. STORAGE SERVICE — the only code that touches localStorage.
        Swapping this for a REST/GraphQL client later should not
        require touching any screen-rendering code below.
     ========================================================= */
  const StorageService = (() => {
    const NS = "rc_";
    function get(key, fallback) {
      try {
        const raw = localStorage.getItem(NS + key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (e) {
        console.warn("StorageService.get failed", key, e);
        return fallback;
      }
    }
    function set(key, value) {
      try {
        localStorage.setItem(NS + key, JSON.stringify(value));
        return true;
      } catch (e) {
        console.warn("StorageService.set failed", key, e);
        return false;
      }
    }
    function remove(key) { localStorage.removeItem(NS + key); }
    return { get, set, remove };
  })();

  /* =========================================================
     2. UTILITIES
     ========================================================= */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function genId(prefix) {
    const year = new Date().getFullYear();
    const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `RC-${prefix}-${year}-${rand}`;
  }

  function todayISO() { return new Date().toISOString().slice(0, 10); }

  function escapeHTML(str) {
    return String(str ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  function toast(message, kind = "default") {
    const root = $("#toastRoot");
    const el = document.createElement("div");
    el.className = `toast${kind !== "default" ? " toast--" + kind : ""}`;
    el.textContent = message;
    root.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }

  function iconHTML(name, cls = "icon") {
    return `<svg class="${cls}"><use href="#icon-${name}"/></svg>`;
  }
  function starRating(value, count) {
    return `<span class="rating">${iconHTML("star", "icon icon--star")}<strong>${value.toFixed(1)}</strong>${count !== undefined ? ` <span class="rating__count">(${count})</span>` : ""}</span>`;
  }

  /* =========================================================
     2b. LANGUAGE (English / Hausa)
        Covers primary navigation and key screens per the
        "translation-ready structure" requirement. Deeper form
        labels stay English-first for this phase and can be
        extended the same way — add a data-i18n key in the HTML
        and an entry below.
     ========================================================= */
  const I18N = {
    en: {
      "nav.home": "Home", "nav.findRide": "Find a Ride", "nav.moveGoods": "Move Goods",
      "nav.forTransporters": "For Transporters", "nav.admin": "Admin", "nav.signIn": "Sign in", "nav.signOut": "Sign out",
      "bottomnav.search": "Search", "bottomnav.trips": "Trips", "bottomnav.profile": "Profile",
      "hero.eyebrow": "Suleja · Kwamba · Madalla & nearby towns",
      "hero.titleLine": "Connect. Ride.", "hero.titleAccent": "Deliver.",
      "hero.sub": "Find nearby transport operators for passengers, luggage and goods — verified, rated, and ready to move.",
      "hero.joinTransporter": "Join as a Transporter →",
      "hero.statOperators": "Operators near Suleja", "hero.statTrips": "Trips completed (demo)", "hero.statRating": "Average operator rating",
      "common.pickup": "Pickup", "common.destination": "Destination", "common.phone": "Phone number", "common.continue": "Continue",
      "home.categoryTitle": "What do you need to move?",
      "category.rideTitle": "A Ride", "category.rideDesc": "Nearby Keke Napep operators for you and your passengers.",
      "category.luggageTitle": "Luggage", "category.luggageDesc": "Move bags, parcels and personal items between locations.",
      "category.goodsTitle": "Goods & Cargo", "category.goodsDesc": "Shop and business goods transported reliably.",
      "category.operatorTitle": "Become an Operator", "category.operatorDesc": "Publish your availability and start receiving requests.",
      "how.title": "How Ridconnect works",
      "how.step1Title": "Tell us where", "how.step1Desc": "Enter pickup, destination and what you're moving.",
      "how.step2Title": "Compare nearby operators", "how.step2Desc": "See availability, capacity, rating and estimated fare.",
      "how.step3Title": "Request & connect", "how.step3Desc": "Operator accepts, contact details unlock, trip begins.",
      "how.step4Title": "Track & rate", "how.step4Desc": "Follow status to completion, then leave a review.",
      "auth.title": "Sign in to Ridconnect", "auth.sub": "Demo authentication — no password is transmitted anywhere. Pick a role to explore that experience.",
      "auth.fullName": "Full name", "auth.emergencyContact": "Emergency contact phone (optional)",
      "auth.roleLegend": "I want to use Ridconnect as a…",
      "role.passenger": "Passenger", "role.goodsOwner": "Goods / Luggage Owner", "role.transporter": "Keke Operator / Transporter", "role.admin": "Admin (demo)",
      "search.title": "Where do you want to go?", "luggage.title": "Move Luggage", "goods.title": "Move Goods",
      "onboard.title": "Join as a Transporter", "trips.title": "Your trips & requests", "messages.title": "Messages",
      "support.title": "Need help?",
      "footer.product": "Product", "footer.company": "Company", "footer.becomeOperator": "Become an Operator", "footer.needHelp": "Need Help?",
      "account.title": "Your profile", "account.phone": "Phone number", "account.emergencyContact": "Emergency contact"
    },
    ha: {
      "nav.home": "Gida", "nav.findRide": "Nemo Keke", "nav.moveGoods": "Kai Kaya",
      "nav.forTransporters": "Ga Masu Ababen Hawa", "nav.admin": "Admin", "nav.signIn": "Shiga", "nav.signOut": "Fita",
      "bottomnav.search": "Bincike", "bottomnav.trips": "Tafiye-tafiye", "bottomnav.profile": "Bayanina",
      "hero.eyebrow": "Suleja · Kwamba · Madalla & wasu unguwanni",
      "hero.titleLine": "Haɗa. Yi tafiya.", "hero.titleAccent": "Kai kaya.",
      "hero.sub": "Nemo direbobi kusa da kai domin fasinjoji, kaya da manyan kaya — an tabbatar, an kimanta, kuma a shirye suke.",
      "hero.joinTransporter": "Shiga a matsayin Direba →",
      "hero.statOperators": "Direbobi kusa da Suleja", "hero.statTrips": "Tafiye-tafiyen da aka kammala (misali)", "hero.statRating": "Matsakaicin kimar direba",
      "common.pickup": "Wurin ɗauka", "common.destination": "Wurin isowa", "common.phone": "Lambar waya", "common.continue": "Ci gaba",
      "home.categoryTitle": "Me kake son kai?",
      "category.rideTitle": "Keke", "category.rideDesc": "Direbobin Keke Napep kusa da kai domin kai da fasinjojinka.",
      "category.luggageTitle": "Kaya", "category.luggageDesc": "Kai jaka, fakiti da kayan mutum daga wuri zuwa wuri.",
      "category.goodsTitle": "Manyan Kaya", "category.goodsDesc": "Kai kayan shago da na kasuwanci cikin aminci.",
      "category.operatorTitle": "Zama Direba", "category.operatorDesc": "Buga lokacin da kake samu don karɓar bukatu.",
      "how.title": "Yadda Ridconnect ke aiki",
      "how.step1Title": "Gaya mana inda", "how.step1Desc": "Shigar da wurin ɗauka, wurin isowa da abin da kake kaiwa.",
      "how.step2Title": "Kwatanta direbobi kusa da kai", "how.step2Desc": "Duba samuwa, karfin ɗauka, kima da kudin da ake tsammani.",
      "how.step3Title": "Nemi kuma haɗu", "how.step3Desc": "Direba ya karɓa, lambar waya ta buɗe, tafiya ta fara.",
      "how.step4Title": "Bibiya kuma kimanta", "how.step4Desc": "Bi matakin har sai an kammala, sannan a rubuta ra'ayi.",
      "auth.title": "Shiga Ridconnect", "auth.sub": "Misalin shiga ne kawai — ba a aika kalmar sirri ko'ina. Zaɓi rawar da kake so ka gwada.",
      "auth.fullName": "Cikakken suna", "auth.emergencyContact": "Lambar waya ta gaggawa (zaɓi)",
      "auth.roleLegend": "Ina son yin amfani da Ridconnect a matsayin…",
      "role.passenger": "Fasinja", "role.goodsOwner": "Mai Kaya / Manyan Kaya", "role.transporter": "Direban Keke", "role.admin": "Admin (misali)",
      "search.title": "Ina kake son zuwa?", "luggage.title": "Kai Kaya", "goods.title": "Kai Manyan Kaya",
      "onboard.title": "Shiga a matsayin Direba", "trips.title": "Tafiye-tafiyenka da bukatunka", "messages.title": "Saƙonni",
      "support.title": "Kana bukatar taimako?",
      "footer.product": "Sabis", "footer.company": "Kamfani", "footer.becomeOperator": "Zama Direba", "footer.needHelp": "Kana Bukatar Taimako?",
      "account.title": "Bayaninka", "account.phone": "Lambar waya", "account.emergencyContact": "Lambar gaggawa"
    }
  };

  function currentLang() { return StorageService.get("lang", "en"); }

  function applyLanguage(lang) {
    const dict = I18N[lang] || I18N.en;
    $$("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n;
      if (dict[key]) el.textContent = dict[key];
    });
    $("#langToggle").textContent = lang === "en" ? "HA" : "EN";
    $("#drawerLangValue").textContent = lang === "en" ? "English" : "Hausa";
    document.documentElement.lang = lang;
    StorageService.set("lang", lang);
  }

  $("#langToggle").addEventListener("click", () => {
    applyLanguage(currentLang() === "en" ? "ha" : "en");
    renderAuthUI();
  });

  const PROHIBITED_KEYWORDS = [
    "gun", "firearm", "ammunition", "explosive", "bomb", "weapon",
    "narcotic", "cocaine", "heroin", "hard drug", "illegal drug"
  ];
  function containsProhibited(text) {
    const t = (text || "").toLowerCase();
    return PROHIBITED_KEYWORDS.some((w) => t.includes(w));
  }

  /* =========================================================
     3. DEMO DATA SEEDING
        Clearly labeled as demo data per spec — never real
        personal information.
     ========================================================= */
  const CITIES = [
    {
      id: "suleja",
      name: "Suleja",
      state: "Niger State",
      active: true,
      serviceAreas: ["Suleja Central", "Kwamba", "Madalla", "Zuba Road", "Angwan Doka"]
    },
    {
      id: "abuja",
      name: "Abuja",
      state: "FCT",
      active: false,
      serviceAreas: ["Garki", "Wuse", "Maitama", "Kubwa"]
    }
  ];

  const DEMO_TRANSPORTERS = [
    { name: "Abdul Transport Services", vehicle: "Keke Napep (passenger)", paxCap: 3, luggageCap: "Medium", goodsCap: "Light cargo", area: "Suleja Central", rating: 4.8, trips: 247, verification: "VERIFIED" },
    { name: "Amina Mobility Link", vehicle: "Keke Napep (passenger)", paxCap: 3, luggageCap: "Low", goodsCap: "None", area: "Kwamba", rating: 4.6, trips: 132, verification: "VERIFIED" },
    { name: "Danjuma Cargo Kekes", vehicle: "Keke Napep (cargo)", paxCap: 1, luggageCap: "High", goodsCap: "Heavy cargo", area: "Madalla", rating: 4.4, trips: 89, verification: "VERIFIED" },
    { name: "Suleja Swift Riders", vehicle: "Keke Napep (passenger)", paxCap: 4, luggageCap: "Medium", goodsCap: "Light cargo", area: "Suleja Central", rating: 4.9, trips: 301, verification: "VERIFIED" },
    { name: "Zuba Route Movers", vehicle: "Mini van", paxCap: 6, luggageCap: "High", goodsCap: "Light cargo", area: "Zuba Road", rating: 4.2, trips: 54, verification: "PENDING" },
    { name: "Doka Goods Transit", vehicle: "Pickup truck", paxCap: 0, luggageCap: "High", goodsCap: "Heavy cargo", area: "Angwan Doka", rating: 4.5, trips: 76, verification: "VERIFIED" },
    { name: "Madalla Express Kekes", vehicle: "Keke Napep (passenger)", paxCap: 3, luggageCap: "Low", goodsCap: "None", area: "Madalla", rating: 4.1, trips: 41, verification: "UNVERIFIED" }
  ];

  function seedIfEmpty() {
    if (!StorageService.get("cities")) StorageService.set("cities", CITIES);

    if (!StorageService.get("transporters")) {
      const transporters = DEMO_TRANSPORTERS.map((t, i) => ({
        id: genId("VEHICLE").replace("VEHICLE", "TRANSPORTER"),
        userId: `demo-op-${i}`,
        isDemo: true,
        name: t.name,
        phone: "080" + (10000000 + i * 137).toString().slice(0, 8),
        vehicle: t.vehicle,
        paxCap: t.paxCap,
        luggageCap: t.luggageCap,
        goodsCap: t.goodsCap,
        cityId: "suleja",
        serviceArea: t.area,
        radiusKm: [3, 5, 10][i % 3],
        rating: t.rating,
        ratingCount: Math.max(5, Math.floor(t.trips / 4)),
        completedTrips: t.trips,
        responseRate: 80 + (i * 3) % 20,
        verification: t.verification,
        available: i % 3 !== 2,
        schedule: { days: ["MO", "TU", "WE", "TH", "FR", "SA"], from: "07:00", to: "20:00" },
        featured: i === 0 || i === 3,
        createdAt: new Date().toISOString()
      }));
      StorageService.set("transporters", transporters);
    }

    if (!StorageService.get("requests")) StorageService.set("requests", []);
    if (!StorageService.get("reviews")) StorageService.set("reviews", []);
    if (!StorageService.get("reports")) StorageService.set("reports", []);
    if (!StorageService.get("users")) StorageService.set("users", []);
    if (!StorageService.get("settings")) {
      StorageService.set("settings", { commissionPct: 10, defaultRadiusKm: 5 });
    }
  }
  seedIfEmpty();

  /* =========================================================
     4. SESSION / AUTH (demo only — see security notice above)
     ========================================================= */
  function getSession() { return StorageService.get("session", null); }
  function setSession(session) { StorageService.set("session", session); renderAuthUI(); }
  function clearSession() { StorageService.remove("session"); renderAuthUI(); }

  function renderAuthUI() {
    const session = getSession();
    const chip = $("#roleChip");
    const authBtn = $("#authBtn");
    const dict = I18N[currentLang()] || I18N.en;
    if (session) {
      chip.textContent = `${session.name.split(" ")[0]} · ${roleLabel(session.role)}`;
      chip.classList.remove("hidden");
      authBtn.textContent = dict["nav.signOut"];
    } else {
      chip.classList.add("hidden");
      authBtn.textContent = dict["nav.signIn"];
    }

    const initials = session ? session.name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() : "";
    $("#drawerAvatarInitials").innerHTML = initials ? initials : `<svg class="icon"><use href="#icon-user"/></svg>`;
    $("#drawerName").textContent = session ? session.name : "Guest";
    $("#drawerRole").textContent = session ? roleLabel(session.role) : "Not signed in";
    const drawerAuthBtn = $("#drawerAuthBtn");
    drawerAuthBtn.textContent = session ? dict["nav.signOut"] : dict["nav.signIn"];
    drawerAuthBtn.onclick = () => {
      if (session) { clearSession(); toast("Signed out"); showScreen("home"); }
      else { showScreen("auth"); }
    };
  }

  function roleLabel(role) {
    return { passenger: "Passenger", goods_owner: "Goods Owner", transporter: "Operator", admin: "Admin" }[role] || role;
  }

  function requireAuth(nextScreen) {
    if (!getSession()) {
      toast("Please sign in first");
      showScreen("auth");
      return false;
    }
    return true;
  }

  /* =========================================================
     5. ROUTER
     ========================================================= */
  const SCREEN_IDS = ["home","auth","search","luggage","goods","profile","transporter-onboard","transporter","trips","messages","support","admin","account"];

  function showScreen(name, opts = {}) {
    if (name === "account") {
      const s = getSession();
      if (!s) { name = "auth"; }
      else if (s.role === "transporter") name = "transporter";
      else if (s.role === "admin") name = "admin";
      else name = "account";
    }
    if ((name === "transporter" || name === "admin" || name === "goods" || name === "luggage") && !getSession() && !opts.skipAuthCheck) {
      // Browsing goods/luggage forms is allowed logged-out (like search); dashboards require auth.
      if (name === "transporter" || name === "admin") {
        toast("Please sign in to continue");
        name = "auth";
      }
    }
    SCREEN_IDS.forEach((id) => {
      const el = $("#screen-" + id);
      if (el) el.classList.toggle("is-active", id === name);
    });
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });

    $$(".bottomnav__item").forEach((btn) => btn.classList.remove("is-active"));
    const mapBottom = { home: "home", search: "search", trips: "trips", messages: "messages", account: "account" };
    const activeBottomKey = Object.keys(mapBottom).find((k) => mapBottom[k] === name) || (name === "transporter" || name === "admin" ? "account" : null);
    if (activeBottomKey) {
      const btn = $(`.bottomnav__item[data-nav="${activeBottomKey}"]`);
      if (btn) btn.classList.add("is-active");
    }

    if (name === "transporter") renderTransporterDashboard();
    if (name === "trips") renderUserTrips();
    if (name === "account") renderAccountScreen();
    if (name === "admin") renderAdminDashboard();
    if (name === "transporter-onboard") populateServiceAreaSelect($("#obServiceArea"));
    if (name === "home") renderHomeStats();
  }

  /* =========================================================
     5b. MOBILE DRAWER (account + secondary navigation)
     ========================================================= */
  function openDrawer() {
    $("#navDrawer").classList.remove("hidden");
    $("#navDrawer").setAttribute("aria-hidden", "false");
  }
  function closeDrawer() {
    $("#navDrawer").classList.add("hidden");
    $("#navDrawer").setAttribute("aria-hidden", "true");
  }
  $("#drawerOpenBtn").addEventListener("click", openDrawer);
  $("#drawerCloseBtn").addEventListener("click", closeDrawer);
  $("#drawerBackdrop").addEventListener("click", closeDrawer);
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-drawer-close]")) closeDrawer();
  });
  $("#drawerLangToggle").addEventListener("click", () => {
    applyLanguage(currentLang() === "en" ? "ha" : "en");
    renderAuthUI();
  });

  document.addEventListener("click", (e) => {
    const navBtn = e.target.closest("[data-nav]");
    if (navBtn) {
      e.preventDefault();
      showScreen(navBtn.dataset.nav);
    }
  });

  $("#authBtn").addEventListener("click", () => {
    if (getSession()) {
      clearSession();
      toast("Signed out");
      showScreen("home");
    } else {
      showScreen("auth");
    }
  });

  /* =========================================================
     6. HOME
     ========================================================= */
  function renderHomeStats() {
    const transporters = StorageService.get("transporters", []);
    const requests = StorageService.get("requests", []);
    $("#statOperators").textContent = transporters.length;
    $("#statTrips").textContent = requests.filter((r) => r.status === "COMPLETED" || r.status === "DELIVERED").length + 812; // + baseline demo history
  }

  $("#quickSearchForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const pickup = $("#qPickup").value.trim();
    const dest = $("#qDestination").value.trim();
    showScreen("search");
    $("#rsPickup").value = pickup;
    $("#rsDestination").value = dest;
    runRideSearch();
  });

  /* =========================================================
     7. AUTH FORM
     ========================================================= */
  $("#authForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#authName").value.trim();
    const phone = $("#authPhone").value.trim();
    const pin = $("#authPin").value.trim();
    const emergencyContact = $("#authEmergencyContact").value.trim();
    const role = $$('input[name="role"]').find((r) => r.checked).value;
    if (!name || !phone || !/^\d{4}$/.test(pin)) { toast("Enter your name, phone and a 4-digit PIN", "error"); return; }

    const users = StorageService.get("users", []);
    let user = users.find((u) => u.phone === phone);
    if (!user) {
      user = { id: genId("USER"), name, phone, pin, role, emergencyContact, verification: "UNVERIFIED", createdAt: new Date().toISOString() };
      users.push(user);
      StorageService.set("users", users);
    } else {
      if (user.pin && user.pin !== pin) { toast("Incorrect PIN for this phone number", "error"); return; }
      user.name = name; user.role = role; if (!user.pin) user.pin = pin;
      if (emergencyContact) user.emergencyContact = emergencyContact;
      StorageService.set("users", users);
    }
    setSession(user);
    toast(`Welcome, ${name.split(" ")[0]}`, "success");

    if (role === "transporter") {
      const transporters = StorageService.get("transporters", []);
      if (!transporters.some((t) => t.userId === user.id)) {
        showScreen("transporter-onboard");
        return;
      }
      showScreen("transporter");
    } else if (role === "admin") {
      showScreen("admin");
    } else {
      showScreen("home");
    }
  });

  /* =========================================================
     8. SERVICE AREA HELPERS
     ========================================================= */
  function populateServiceAreaSelect(select) {
    if (!select) return;
    const cities = StorageService.get("cities", []);
    select.innerHTML = "";
    cities.forEach((city) => {
      const group = document.createElement("optgroup");
      group.label = city.active ? city.name : `${city.name} (coming soon)`;
      city.serviceAreas.forEach((area) => {
        const opt = document.createElement("option");
        opt.value = area; opt.textContent = area;
        if (!city.active) opt.disabled = true;
        group.appendChild(opt);
      });
      select.appendChild(group);
    });
  }
  populateServiceAreaSelect($("#tdServiceArea"));

  /* =========================================================
     9. MATCHING ENGINE
        Conceptual score = availability + area/route match +
        capacity fit + reputation − distance penalty.
        Distance is simulated deterministically from area text
        since no live map provider is wired in this prototype
        (see abstraction note in comments below).
     ========================================================= */
  // NOTE: Real distance should come from a MapProvider abstraction
  // (Google Maps / Mapbox / OSM) — not hardcoded here. This stub
  // keeps the UI and matching logic fully working without one.
  function simulatedDistanceKm(seedString) {
    let hash = 0;
    for (let i = 0; i < seedString.length; i++) hash = (hash * 31 + seedString.charCodeAt(i)) >>> 0;
    return +((hash % 480) / 100).toFixed(1); // 0.0 – 4.8 km-ish spread
  }

  function matchTransporters({ pickup, destination, needsPassenger, needsLuggage, needsGoods, minPaxCap, requiredVehicleTypes, radiusKm }) {
    const transporters = StorageService.get("transporters", []);
    const query = `${pickup || ""} ${destination || ""}`.toLowerCase();

    return transporters
      .map((t) => {
        const distance = simulatedDistanceKm(t.id + query);
        const areaMatch = query.includes(t.serviceArea.toLowerCase()) || !pickup;
        const capacityOk =
          (!needsPassenger || t.paxCap >= (minPaxCap || 1)) &&
          (!needsLuggage || t.luggageCap !== "None") &&
          (!needsGoods || t.goodsCap !== "None");
        const vehicleOk = !requiredVehicleTypes || requiredVehicleTypes.length === 0 || requiredVehicleTypes.some(v => t.vehicle.toLowerCase().includes(v.toLowerCase())) || requiredVehicleTypes.includes("Any suitable vehicle");
        const withinRadius = distance <= (radiusKm || 999);

        let score = 0;
        if (t.available) score += 30;
        if (areaMatch) score += 25;
        if (capacityOk) score += 20;
        if (vehicleOk) score += 10;
        score += Math.max(0, 10 - distance * 2); // closer is better
        score += (t.rating - 3) * 5;
        if (t.verification === "VERIFIED") score += 8;
        if (t.featured) score += 5;

        return { t, distance, score, eligible: capacityOk && vehicleOk && withinRadius };
      })
      .filter((r) => r.eligible)
      .sort((a, b) => b.score - a.score);
  }

  function estimateFare(distanceKm, vehicle) {
    const base = vehicle.toLowerCase().includes("van") || vehicle.toLowerCase().includes("truck") ? 2500 : 500;
    const perKm = vehicle.toLowerCase().includes("van") || vehicle.toLowerCase().includes("truck") ? 350 : 150;
    const low = Math.round((base + distanceKm * perKm) / 50) * 50;
    const high = Math.round((low * 1.3) / 50) * 50;
    return `₦${low.toLocaleString()}–₦${high.toLocaleString()}`;
  }

  /* =========================================================
     10. RENDER: OPERATOR CARD
     ========================================================= */
  function verificationBadge(v) {
    if (v === "VERIFIED") return `<span class="badge badge--verified">${iconHTML("check", "icon icon--sm")}Verified</span>`;
    if (v === "PENDING") return `<span class="badge badge--pending">Verification pending</span>`;
    if (v === "SUSPENDED") return `<span class="badge badge--danger">Suspended</span>`;
    if (v === "REJECTED") return `<span class="badge badge--danger">Rejected</span>`;
    return `<span class="badge badge--muted">Unverified</span>`;
  }

  function renderOperatorCard(match, requestType) {
    const { t, distance, score } = match;
    const initials = t.name.split(" ").map((w) => w[0]).slice(0, 2).join("");
    return `
      <div class="operator-card" data-op-id="${t.id}">
        <div class="operator-avatar">${initials}</div>
        <div class="operator-main">
          <h3>${escapeHTML(t.name)} ${verificationBadge(t.verification)}</h3>
          <div class="operator-meta">
            <span>${escapeHTML(t.vehicle)}</span>
            <span>${t.serviceArea}</span>
            <span>${distance.toFixed(1)} km away</span>
            <span>${starRating(t.rating, t.ratingCount)}</span>
            <span>${t.completedTrips} trips</span>
            <span class="badge ${t.available ? "badge--verified" : "badge--muted"}">${t.available ? "Available now" : "Offline"}</span>
            ${t.isDemo ? '<span class="badge badge--demo">Demo availability</span>' : ""}
          </div>
        </div>
        <div class="operator-actions">
          <span class="fare">Est. ${estimateFare(distance, t.vehicle)}</span>
          <button class="btn btn--secondary btn--sm" data-view-profile="${t.id}">View profile</button>
          <button class="btn btn--primary btn--sm" data-request="${requestType}" data-op-id="${t.id}">Request</button>
        </div>
      </div>`;
  }

  document.addEventListener("click", (e) => {
    const viewBtn = e.target.closest("[data-view-profile]");
    if (viewBtn) renderOperatorProfile(viewBtn.dataset.viewProfile);
  });

  function renderOperatorProfile(opId) {
    const t = StorageService.get("transporters", []).find((x) => x.id === opId);
    if (!t) return;
    const reviews = StorageService.get("reviews", []).filter((r) => r.transporterId === opId).slice(-5).reverse();
    $("#profileContent").innerHTML = `
      <button class="text-link" data-nav="search">← Back</button>
      <div class="card">
        <div class="operator-avatar" style="margin-bottom:12px;">${t.name.split(" ").map(w=>w[0]).slice(0,2).join("")}</div>
        <h1 class="page-title">${escapeHTML(t.name)} ${verificationBadge(t.verification)}</h1>
        <p>${escapeHTML(t.vehicle)} · ${t.serviceArea} · service radius ${t.radiusKm} km</p>
        <div class="operator-meta" style="margin-bottom:10px;">
          <span>${starRating(t.rating)} rating (${t.ratingCount} reviews)</span>
          <span>${t.completedTrips} completed trips</span>
          <span>${t.responseRate}% response rate</span>
        </div>
        <p><strong>Capacity:</strong> ${t.paxCap} passengers · Luggage: ${t.luggageCap} · Goods: ${t.goodsCap}</p>
        <p><strong>Schedule:</strong> ${t.schedule.days.join(", ")} · ${t.schedule.from}–${t.schedule.to}</p>
        <button class="btn btn--primary" data-request="ride" data-op-id="${t.id}">Request this operator</button>
        <button class="btn btn--ghost" data-report="transporter" data-report-id="${t.id}" data-report-name="${escapeHTML(t.name)}">Report transporter</button>
      </div>
      <div class="card">
        <h2>Recent reviews</h2>
        ${reviews.length ? reviews.map(r => `<p>${starRating(r.rating)} — "${escapeHTML(r.comment || "No comment")}"</p>`).join("") : "<p>No reviews yet.</p>"}
      </div>`;
    showScreen("profile");
  }

  /* =========================================================
     11. REQUEST CREATION (shared by ride / luggage / goods)
     ========================================================= */
  function createRequest(base) {
    const session = getSession();
    if (!session) { toast("Please sign in to send a request"); showScreen("auth"); return null; }
    const requests = StorageService.get("requests", []);
    const record = {
      id: genId(base.type.toUpperCase()),
      requesterId: session.id,
      requesterName: session.name,
      requesterPhone: session.phone,
      createdAt: new Date().toISOString(),
      status: "REQUESTED",
      ...base
    };
    requests.push(record);
    StorageService.set("requests", requests);
    return record;
  }

  document.addEventListener("click", (e) => {
    const reqBtn = e.target.closest("[data-request]");
    if (!reqBtn) return;
    const type = reqBtn.dataset.request;
    const opId = reqBtn.dataset.opId;
    const transporter = StorageService.get("transporters", []).find((t) => t.id === opId);
    if (!transporter) return;

    let base;
    if (type === "ride") {
      base = {
        type: "ride", transporterId: opId,
        pickup: $("#rsPickup").value || "Not specified",
        destination: $("#rsDestination").value || "Not specified",
        date: $("#rsDate").value || todayISO(),
        time: $("#rsTime").value || "",
        passengers: $("#rsPassengers").value || 1
      };
    } else if (type === "luggage") {
      base = {
        type: "luggage", transporterId: opId,
        pickup: $("#lgPickup").value, destination: $("#lgDestination").value,
        luggageType: $("#lgType").value, count: $("#lgCount").value, weight: $("#lgWeight").value,
        date: $("#lgDate").value || todayISO(), notes: $("#lgNotes").value
      };
    } else if (type === "goods") {
      const notes = $("#gdNotes").value;
      const category = $("#gdCategory").value;
      if (containsProhibited(notes) || containsProhibited(category)) {
        toast("This request appears to include a prohibited item and can't be submitted.", "error");
        return;
      }
      base = {
        type: "goods", transporterId: opId,
        pickup: $("#gdPickup").value, destination: $("#gdDestination").value,
        category, qty: $("#gdQty").value, weightClass: $("#gdWeightClass").value,
        vehicleNeeded: $("#gdVehicle").value, date: $("#gdDate").value || todayISO(),
        deadline: $("#gdDeadline").value, notes
      };
    }
    if (!base) return;
    const record = createRequest(base);
    if (record) {
      toast(`Request sent to ${transporter.name}`, "success");
      renderResultsForType(type);
    }
  });

  function renderResultsForType(type) {
    if (type === "ride") runRideSearch();
    if (type === "luggage") runLuggageSearch();
    if (type === "goods") runGoodsSearch();
  }

  /* =========================================================
     12. SEARCH FORMS
     ========================================================= */
  function runRideSearch() {
    const pickup = $("#rsPickup").value.trim();
    const destination = $("#rsDestination").value.trim();
    const passengers = parseInt($("#rsPassengers").value || "1", 10);
    const radius = parseInt($("#rsRadius").value, 10);
    const wantsLuggage = $("#rsLuggage").checked;

    const matches = matchTransporters({
      pickup, destination, needsPassenger: true, needsLuggage: wantsLuggage,
      minPaxCap: passengers, requiredVehicleTypes: ["Keke Napep", "Mini van"], radiusKm: radius
    });
    const container = $("#rideResults");
    container.innerHTML = matches.length
      ? `<p class="fine-print">${matches.length} operator(s) available within ${radius} km.</p>` + matches.map((m) => renderOperatorCard(m, "ride")).join("")
      : `<div class="empty-state">We couldn't find an available transporter nearby. Try widening your search radius.</div>`;
  }
  $("#rideSearchForm").addEventListener("submit", (e) => { e.preventDefault(); runRideSearch(); });

  function runLuggageSearch() {
    const pickup = $("#lgPickup").value.trim();
    const destination = $("#lgDestination").value.trim();
    const matches = matchTransporters({ pickup, destination, needsLuggage: true, radiusKm: 20 });
    const container = $("#luggageResults");
    container.innerHTML = matches.length
      ? matches.map((m) => renderOperatorCard(m, "luggage")).join("")
      : `<div class="empty-state">No suitable transporters found for this luggage yet. Try again shortly.</div>`;
  }
  $("#luggageForm").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!$("#lgPickup").value.trim() || !$("#lgDestination").value.trim()) return;
    runLuggageSearch();
  });

  function runGoodsSearch() {
    const pickup = $("#gdPickup").value.trim();
    const destination = $("#gdDestination").value.trim();
    const notes = $("#gdNotes").value;
    const category = $("#gdCategory").value;
    if (containsProhibited(notes) || containsProhibited(category)) {
      $("#goodsResults").innerHTML = `<div class="empty-state">This request appears to describe a prohibited item. Please remove it and search again.</div>`;
      return;
    }
    const vehicleWanted = $("#gdVehicle").value;
    const matches = matchTransporters({
      pickup, destination, needsGoods: true,
      requiredVehicleTypes: vehicleWanted === "Any suitable vehicle" ? [] : [vehicleWanted],
      radiusKm: 20
    });
    const container = $("#goodsResults");
    container.innerHTML = matches.length
      ? matches.map((m) => renderOperatorCard(m, "goods")).join("")
      : `<div class="empty-state">No suitable transporters found for this goods request yet.</div>`;
  }
  $("#goodsForm").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!$("#gdPickup").value.trim() || !$("#gdDestination").value.trim()) return;
    runGoodsSearch();
  });

  /* =========================================================
     13. TRANSPORTER ONBOARDING
     ========================================================= */
  $("#onboardForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const session = getSession();
    if (!session) { toast("Please sign in first"); showScreen("auth"); return; }

    const transporters = StorageService.get("transporters", []);
    const existing = transporters.find((t) => t.userId === session.id);
    const record = {
      id: existing ? existing.id : genId("TRANSPORTER"),
      userId: session.id,
      isDemo: false,
      name: $("#obName").value || session.name,
      phone: $("#obPhone").value || session.phone,
      vehicle: $("#obVehicle").value,
      paxCap: parseInt($("#obPaxCap").value || "0", 10),
      luggageCap: $("#obLuggageCap").value,
      goodsCap: $("#obGoodsCap").value,
      cityId: "suleja",
      serviceArea: $("#obServiceArea").value,
      radiusKm: parseInt($("#obRadius").value, 10),
      rating: existing ? existing.rating : 5.0,
      ratingCount: existing ? existing.ratingCount : 0,
      completedTrips: existing ? existing.completedTrips : 0,
      responseRate: existing ? existing.responseRate : 100,
      verification: "PENDING",
      available: false,
      schedule: existing ? existing.schedule : { days: [], from: "08:00", to: "18:00" },
      featured: false,
      createdAt: existing ? existing.createdAt : new Date().toISOString()
    };
    const idx = transporters.findIndex((t) => t.id === record.id);
    if (idx >= 0) transporters[idx] = record; else transporters.push(record);
    StorageService.set("transporters", transporters);

    session.role = "transporter";
    const users = StorageService.get("users", []);
    const uIdx = users.findIndex((u) => u.id === session.id);
    if (uIdx >= 0) { users[uIdx].role = "transporter"; StorageService.set("users", users); }
    setSession(session);

    toast("Submitted for verification — your listing is now Pending", "success");
    showScreen("transporter");
  });

  /* =========================================================
     14. TRANSPORTER DASHBOARD
     ========================================================= */
  const WEEKDAYS = [["SU","Sun"],["MO","Mon"],["TU","Tue"],["WE","Wed"],["TH","Thu"],["FR","Fri"],["SA","Sat"]];

  function currentTransporter() {
    const session = getSession();
    if (!session) return null;
    return StorageService.get("transporters", []).find((t) => t.userId === session.id) || null;
  }

  function renderTransporterDashboard() {
    const session = getSession();
    const t = currentTransporter();
    if (!t) {
      $("#transporterWelcome").textContent = "Complete onboarding to access your dashboard.";
      showScreen("transporter-onboard");
      return;
    }
    $("#transporterWelcome").textContent = `${t.serviceArea} · ${t.vehicle} · ${verificationTextOnly(t.verification)}`;

    const toggle = $("#availToggle");
    toggle.checked = !!t.available;
    $("#availLabel").textContent = t.available ? "Available now" : "Offline";
    $("#availLabel").className = "badge " + (t.available ? "badge--verified" : "badge--muted");
    toggle.onchange = () => {
      const transporters = StorageService.get("transporters", []);
      const idx = transporters.findIndex((x) => x.id === t.id);
      transporters[idx].available = toggle.checked;
      StorageService.set("transporters", transporters);
      $("#availLabel").textContent = toggle.checked ? "Available now" : "Offline";
      $("#availLabel").className = "badge " + (toggle.checked ? "badge--verified" : "badge--muted");
      toast(toggle.checked ? "You're now visible to nearby users" : "You're now hidden from search");
    };

    // Metrics
    const requests = StorageService.get("requests", []).filter((r) => r.transporterId === t.id);
    const active = requests.filter((r) => !["COMPLETED", "DELIVERED", "CANCELLED"].includes(r.status));
    const completed = requests.filter((r) => ["COMPLETED", "DELIVERED"].includes(r.status));
    $("#transporterMetrics").innerHTML = [
      ["Pending requests", requests.filter((r) => r.status === "REQUESTED").length],
      ["Active trips", active.length],
      ["Completed trips", completed.length + t.completedTrips],
      ["Rating", t.rating.toFixed(1) + " / 5"]
    ].map(([label, val]) => `<div class="metric"><div class="metric__value">${val}</div><div class="metric__label">${label}</div></div>`).join("");

    // Schedule
    const scheduleDays = $("#scheduleDays");
    scheduleDays.innerHTML = WEEKDAYS.map(([code, label]) =>
      `<button type="button" class="day-chip ${t.schedule.days.includes(code) ? "is-on" : ""}" data-day="${code}">${label}</button>`
    ).join("");
    scheduleDays.onclick = (e) => {
      const chip = e.target.closest(".day-chip");
      if (!chip) return;
      chip.classList.toggle("is-on");
    };
    populateServiceAreaSelect($("#tdServiceArea"));
    $("#tdServiceArea").value = t.serviceArea;
    $("#tdRadius").value = String(t.radiusKm);

    $("#saveScheduleBtn").onclick = () => {
      const transporters = StorageService.get("transporters", []);
      const idx = transporters.findIndex((x) => x.id === t.id);
      transporters[idx].schedule.days = $$(".day-chip.is-on", scheduleDays).map((c) => c.dataset.day);
      transporters[idx].serviceArea = $("#tdServiceArea").value;
      transporters[idx].radiusKm = parseInt($("#tdRadius").value, 10);
      StorageService.set("transporters", transporters);
      toast("Schedule saved", "success");
    };

    // Incoming requests
    const pending = requests.filter((r) => r.status === "REQUESTED");
    $("#incomingRequests").innerHTML = pending.length
      ? pending.map(requestRowHTML).join("")
      : `<div class="empty-state">No new requests right now.</div>`;

    // My trips
    const inProgress = requests.filter((r) => !["REQUESTED", "CANCELLED"].includes(r.status));
    $("#myTrips").innerHTML = inProgress.length
      ? inProgress.slice().reverse().map(requestRowHTML).join("")
      : `<div class="empty-state">Accepted trips will appear here.</div>`;
  }

  function verificationTextOnly(v) {
    return { VERIFIED: "Verified", PENDING: "Verification pending", SUSPENDED: "Suspended", REJECTED: "Rejected" }[v] || "Unverified";
  }

  const RIDE_FLOW = ["REQUESTED", "FARE_PROPOSED", "ACCEPTED", "CONFIRMED", "DRIVER_ARRIVING", "PICKED_UP", "IN_TRANSIT", "COMPLETED"];
  const GOODS_FLOW = ["REQUESTED", "FARE_PROPOSED", "ACCEPTED", "CONFIRMED", "PICKUP_READY", "PICKED_UP", "IN_TRANSIT", "DELIVERED", "COMPLETED"];
  function flowFor(type) { return type === "ride" ? RIDE_FLOW : GOODS_FLOW; }

  function compressImageFile(file, maxDim = 640, quality = 0.6) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > height && width > maxDim) { height = Math.round(height * (maxDim / width)); width = maxDim; }
          else if (height > maxDim) { width = Math.round(width * (maxDim / height)); height = maxDim; }
          const canvas = document.createElement("canvas");
          canvas.width = width; canvas.height = height;
          canvas.getContext("2d").drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.onerror = () => reject(new Error("Could not read image"));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error("Could not read file"));
      reader.readAsDataURL(file);
    });
  }

  function contactStripHTML(r, phone) {
    const canContact = !["REQUESTED", "FARE_PROPOSED", "CANCELLED"].includes(r.status);
    if (!canContact) return "";
    const waNumber = (phone || "").replace(/[^\d+]/g, "").replace(/^\+/, "");
    const noteHTML = r.meetingNote ? `<p class="meeting-note">"${escapeHTML(r.meetingNote)}"</p>` : "";
    const photoHTML = r.meetingNoteImage ? `<img class="meeting-photo" src="${r.meetingNoteImage}" alt="Meeting location photo" data-view-photo="${r.id}">` : "";
    return `<div class="contact-strip">
      ${phone ? `<a class="btn btn--secondary btn--sm" href="tel:${phone}">Call</a>
      <a class="btn btn--secondary btn--sm" href="https://wa.me/${waNumber}" target="_blank" rel="noopener">WhatsApp</a>` : ""}
      <button class="btn btn--ghost btn--sm" data-meeting-note="${r.id}">${r.meetingNote || r.meetingNoteImage ? "Edit meeting note" : "Add meeting note"}</button>
    </div>${noteHTML}${photoHTML}`;
  }

  document.addEventListener("click", (e) => {
    const photoBtn = e.target.closest("[data-view-photo]");
    if (!photoBtn) return;
    const r = StorageService.get("requests", []).find((req) => req.id === photoBtn.dataset.viewPhoto);
    if (!r || !r.meetingNoteImage) return;
    const modalRoot = $("#modalRoot");
    modalRoot.innerHTML = `
      <div class="modal">
        <h2>Meeting photo</h2>
        <img src="${r.meetingNoteImage}" alt="Meeting location photo" style="width:100%; border-radius:12px; margin-bottom:14px;">
        <button class="btn btn--ghost btn--block" id="closePhotoView">Close</button>
      </div>`;
    modalRoot.classList.remove("hidden");
    $("#closePhotoView").onclick = () => modalRoot.classList.add("hidden");
  });

  function openMeetingNoteModal(requestId) {
    const requests = StorageService.get("requests", []);
    const r = requests.find((req) => req.id === requestId);
    if (!r) return;
    let pendingImage = r.meetingNoteImage || null;
    const modalRoot = $("#modalRoot");

    function render() {
      modalRoot.innerHTML = `
        <div class="modal">
          <h2>Meeting note</h2>
          <p class="page-sub">A quick way to spot each other — e.g. "Wearing a red cap, waiting by the mosque gate" or a photo of where you're standing.</p>
          <label class="field"><span class="field__label">Note (visible to both of you)</span><textarea id="meetingNoteText" rows="3" maxlength="140">${escapeHTML(r.meetingNote || "")}</textarea></label>
          <label class="field"><span class="field__label">Photo (optional)</span>
            <input id="meetingNotePhotoInput" type="file" accept="image/*" capture="environment">
          </label>
          ${pendingImage ? `
            <img src="${pendingImage}" alt="Preview" style="width:100%; border-radius:10px; margin-bottom:10px;">
            <button type="button" class="btn btn--ghost btn--sm" id="removeMeetingPhoto" style="margin-bottom:10px;">Remove photo</button>
          ` : ""}
          <div style="display:flex; gap:10px;">
            <button class="btn btn--primary" id="saveMeetingNote">Save note</button>
            <button class="btn btn--ghost" id="closeMeetingNote">Cancel</button>
          </div>
        </div>`;
      modalRoot.classList.remove("hidden");
      $("#closeMeetingNote").onclick = () => modalRoot.classList.add("hidden");
      const removeBtn = $("#removeMeetingPhoto");
      if (removeBtn) removeBtn.onclick = () => { pendingImage = null; render(); };

      $("#meetingNotePhotoInput").onchange = async (ev) => {
        const file = ev.target.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) { toast("Please choose an image file", "error"); return; }
        try {
          pendingImage = await compressImageFile(file);
          render();
        } catch (err) {
          toast("Could not process that image", "error");
        }
      };

      $("#saveMeetingNote").onclick = () => {
        const text = $("#meetingNoteText").value.trim();
        const reqs = StorageService.get("requests", []);
        const idx = reqs.findIndex((req) => req.id === requestId);
        if (idx === -1) return;
        reqs[idx].meetingNote = text;
        if (pendingImage) reqs[idx].meetingNoteImage = pendingImage;
        else delete reqs[idx].meetingNoteImage;
        const saved = StorageService.set("requests", reqs);
        modalRoot.classList.add("hidden");
        if (saved) {
          toast("Meeting note saved", "success");
        } else {
          toast("Note saved, but the photo was too large for this device's storage — try a smaller photo", "error");
        }
        renderTransporterDashboard();
        renderUserTrips();
      };
    }
    render();
  }

  document.addEventListener("click", (e) => {
    const noteBtn = e.target.closest("[data-meeting-note]");
    if (noteBtn) openMeetingNoteModal(noteBtn.dataset.meetingNote);
  });

  function requestRowHTML(r) {
    const flow = flowFor(r.type);
    const stepIdx = flow.indexOf(r.status);
    const pills = flow.map((s, i) => {
      const cls = r.status === "CANCELLED" ? "" : i < stepIdx ? "is-done" : i === stepIdx ? "is-active" : "";
      return `<span class="status-pill ${cls}">${s.replace(/_/g, " ")}</span>`;
    }).join("");

    let actions = "";
    if (r.status === "REQUESTED") {
      actions = `${r.fareDeclineCount ? `<span class="badge badge--danger">Final chance — passenger declined once</span>` : ""}
                 <button class="btn btn--primary btn--sm" data-accept="${r.id}">Accept</button>
                 <button class="btn btn--ghost btn--sm" data-decline="${r.id}">Decline</button>`;
    } else if (r.status === "FARE_PROPOSED") {
      actions = `<span class="badge badge--pending">Waiting for passenger to confirm ₦${Number(r.agreedFare).toLocaleString()}</span>
                 <button class="btn btn--ghost btn--sm" data-cancel-fare="${r.id}">Revise fare</button>`;
    } else if (r.status === "CANCELLED") {
      actions = `<span class="badge badge--danger">Cancelled</span>`;
    } else if (stepIdx >= 0 && stepIdx < flow.length - 1) {
      actions = `<button class="btn btn--secondary btn--sm" data-advance="${r.id}">Mark: ${flow[stepIdx + 1].replace(/_/g," ")}</button>
                 <button class="btn btn--ghost btn--sm" data-report="customer" data-report-id="${r.requesterId}" data-report-name="${escapeHTML(r.requesterName)}">Report</button>`;
    } else {
      actions = `<span class="badge badge--verified">Completed</span>`;
    }

    let farePill = "";
    if (r.agreedFare && r.status === "FARE_PROPOSED") farePill = `<span class="badge badge--pending">Proposed fare: ₦${Number(r.agreedFare).toLocaleString()}</span>`;
    else if (r.agreedFare) farePill = `<span class="badge badge--verified">Agreed fare: ₦${Number(r.agreedFare).toLocaleString()}</span>`;

    return `<div class="request-item" data-request-id="${r.id}">
      <div>
        <strong>${r.id}</strong> — ${escapeHTML(r.type)} · ${escapeHTML(r.pickup || "")} → ${escapeHTML(r.destination || "")}
        <div class="request-item__meta">${escapeHTML(r.requesterName || "")} · ${r.date || ""} ${r.time || ""}</div>
        <div class="status-track">${pills} ${farePill}</div>
        ${contactStripHTML(r, r.requesterPhone)}
      </div>
      <div class="request-item__actions">${actions}</div>
    </div>`;
  }

  function openFareModal(requestId) {
    const modalRoot = $("#modalRoot");
    modalRoot.innerHTML = `
      <div class="modal">
        <h2>Propose a fare</h2>
        <p class="page-sub">The passenger will need to confirm this fare before the trip is accepted — this protects both sides from mid-trip disputes. Ridconnect does not process this payment.</p>
        <label class="field"><span class="field__label">Proposed fare (₦)</span><input id="fareAmount" type="number" min="0" step="50" placeholder="e.g. 700" required></label>
        <div style="display:flex; gap:10px;">
          <button class="btn btn--primary" id="confirmFare">Send fare proposal</button>
          <button class="btn btn--ghost" id="cancelFare">Cancel</button>
        </div>
      </div>`;
    modalRoot.classList.remove("hidden");
    $("#cancelFare").onclick = () => modalRoot.classList.add("hidden");
    $("#confirmFare").onclick = () => {
      const amount = parseFloat($("#fareAmount").value);
      if (!amount || amount <= 0) { toast("Enter a valid fare amount", "error"); return; }
      const requests = StorageService.get("requests", []);
      const idx = requests.findIndex((r) => r.id === requestId);
      if (idx === -1) return;
      requests[idx].status = "FARE_PROPOSED";
      requests[idx].agreedFare = amount;
      StorageService.set("requests", requests);
      modalRoot.classList.add("hidden");
      toast("Fare proposed — waiting for passenger to confirm", "success");
      renderTransporterDashboard();
      renderUserTrips();
    };
  }

  document.addEventListener("click", (e) => {
    const cancelFareBtn = e.target.closest("[data-cancel-fare]");
    if (cancelFareBtn) {
      const requests = StorageService.get("requests", []);
      const idx = requests.findIndex((r) => r.id === cancelFareBtn.dataset.cancelFare);
      if (idx >= 0) {
        requests[idx].status = "REQUESTED";
        delete requests[idx].agreedFare;
        StorageService.set("requests", requests);
        toast("Proposal withdrawn — you can propose a new fare");
        renderTransporterDashboard();
        renderUserTrips();
      }
      return;
    }
    const acceptFareBtn = e.target.closest("[data-accept-fare]");
    const declineFareBtn = e.target.closest("[data-decline-fare]");
    if (acceptFareBtn || declineFareBtn) {
      const requests = StorageService.get("requests", []);
      const idx = requests.findIndex((r) => r.id === (acceptFareBtn ? acceptFareBtn.dataset.acceptFare : declineFareBtn.dataset.declineFare));
      if (idx >= 0) {
        if (acceptFareBtn) {
          requests[idx].status = "ACCEPTED";
          toast("Fare confirmed — trip accepted", "success");
        } else {
          const declineCount = (requests[idx].fareDeclineCount || 0) + 1;
          requests[idx].fareDeclineCount = declineCount;
          delete requests[idx].agreedFare;
          if (declineCount >= 2) {
            requests[idx].status = "CANCELLED";
            toast("Fare declined again — request cancelled. You can request another operator.");
          } else {
            requests[idx].status = "REQUESTED";
            toast("Fare declined — the operator can propose one new fare.");
          }
        }
        StorageService.set("requests", requests);
        renderTransporterDashboard();
        renderUserTrips();
      }
      return;
    }

    const acceptBtn = e.target.closest("[data-accept]");
    const declineBtn = e.target.closest("[data-decline]");
    const advanceBtn = e.target.closest("[data-advance]");
    if (!acceptBtn && !declineBtn && !advanceBtn) return;
    if (acceptBtn) { openFareModal(acceptBtn.dataset.accept); return; }

    const id = declineBtn ? declineBtn.dataset.decline : advanceBtn.dataset.advance;
    const requests = StorageService.get("requests", []);
    const idx = requests.findIndex((r) => r.id === id);
    if (idx === -1) return;

    if (declineBtn) requests[idx].status = "CANCELLED";
    if (advanceBtn) {
      const flow = flowFor(requests[idx].type);
      const cur = flow.indexOf(requests[idx].status);
      requests[idx].status = flow[Math.min(cur + 1, flow.length - 1)];
      if (requests[idx].status === "COMPLETED" || requests[idx].status === "DELIVERED") {
        bumpTransporterCompletedTrip(requests[idx].transporterId);
      }
    }
    StorageService.set("requests", requests);
    toast("Status updated", "success");
    renderTransporterDashboard();
    renderUserTrips();
  });

  function bumpTransporterCompletedTrip(transporterId) {
    const transporters = StorageService.get("transporters", []);
    const idx = transporters.findIndex((t) => t.id === transporterId);
    if (idx >= 0) { transporters[idx].completedTrips += 1; StorageService.set("transporters", transporters); }
  }

  /* =========================================================
     15. USER TRIPS (passenger / goods owner view) + RATING
     ========================================================= */
  function renderAccountScreen() {
    const session = getSession();
    if (!session) { showScreen("auth"); return; }
    const initials = session.name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
    $("#accountAvatar").textContent = initials;
    $("#accountName").textContent = session.name;
    $("#accountRole").textContent = roleLabel(session.role);
    $("#accountPhone").textContent = session.phone || "—";
    $("#accountEmergency").textContent = session.emergencyContact || "Not set";
    $("#accountSignOutBtn").onclick = () => { clearSession(); toast("Signed out"); showScreen("home"); };
  }

  function renderUserTrips() {
    const session = getSession();
    if (!session) { $("#userTrips").innerHTML = `<div class="empty-state">Sign in to see your requests.</div>`; return; }
    const requests = StorageService.get("requests", []).filter((r) => r.requesterId === session.id);
    if (!requests.length) { $("#userTrips").innerHTML = `<div class="empty-state">No requests yet — try finding a ride or moving goods.</div>`; return; }

    const reviews = StorageService.get("reviews", []);
    $("#userTrips").innerHTML = requests.slice().reverse().map((r) => {
      const flow = flowFor(r.type);
      const stepIdx = flow.indexOf(r.status);
      const pills = flow.map((s, i) => {
        const cls = r.status === "CANCELLED" ? "" : i < stepIdx ? "is-done" : i === stepIdx ? "is-active" : "";
        return `<span class="status-pill ${cls}">${s.replace(/_/g, " ")}</span>`;
      }).join("");
      const isDone = r.status === "COMPLETED" || r.status === "DELIVERED";
      const isActive = !isDone && !["REQUESTED", "CANCELLED", "FARE_PROPOSED"].includes(r.status);
      const alreadyReviewed = reviews.some((rv) => rv.requestId === r.id);
      const transporter = StorageService.get("transporters", []).find((t) => t.id === r.transporterId);
      let actions = "";
      if (r.status === "CANCELLED") actions = `<span class="badge badge--danger">Cancelled</span>`;
      else if (r.status === "FARE_PROPOSED") {
        actions = `<button class="btn btn--primary btn--sm" data-accept-fare="${r.id}">Accept fare</button>
                   <button class="btn btn--ghost btn--sm" data-decline-fare="${r.id}">Decline</button>`;
      }
      else if (r.status === "REQUESTED" && r.fareDeclineCount) {
        actions = `<span class="badge badge--pending">Waiting for the operator's final offer</span>`;
      }
      else if (isDone && !alreadyReviewed) actions = `<button class="btn btn--secondary btn--sm" data-rate="${r.id}">Rate trip</button>`;
      else if (isDone) actions = `<span class="badge badge--verified">${iconHTML("check", "icon icon--sm")}Rated</span>`;
      if (isActive) {
        actions += `<button class="btn btn--secondary btn--sm" data-safety="${r.id}">Safety</button>`;
      }
      if (transporter && r.status !== "CANCELLED") {
        actions += `<button class="btn btn--ghost btn--sm" data-report="transporter" data-report-id="${transporter.id}" data-report-name="${escapeHTML(transporter.name)}">Report</button>`;
      }

      let farePill = "";
      if (r.agreedFare && r.status === "FARE_PROPOSED") farePill = `<span class="badge badge--pending">Proposed fare: ₦${Number(r.agreedFare).toLocaleString()} — needs your confirmation</span>`;
      else if (r.agreedFare) farePill = `<span class="badge badge--verified">Agreed fare: ₦${Number(r.agreedFare).toLocaleString()}</span>`;

      return `<div class="request-item">
        <div>
          <strong>${r.id}</strong> — ${escapeHTML(transporter ? transporter.name : "Operator")}
          <div class="request-item__meta">${escapeHTML(r.pickup || "")} → ${escapeHTML(r.destination || "")} · ${r.date || ""}</div>
          <div class="status-track">${pills} ${farePill}</div>
          ${contactStripHTML(r, transporter ? transporter.phone : "")}
        </div>
        <div class="request-item__actions">${actions}</div>
      </div>`;
    }).join("");
  }

  document.addEventListener("click", (e) => {
    const rateBtn = e.target.closest("[data-rate]");
    if (rateBtn) openRatingModal(rateBtn.dataset.rate);
  });

  function openSafetyModal(requestId) {
    const requests = StorageService.get("requests", []);
    const r = requests.find((req) => req.id === requestId);
    if (!r) return;
    const transporter = StorageService.get("transporters", []).find((t) => t.id === r.transporterId);
    const session = getSession();

    const summary = [
      `Ridconnect trip ${r.id}`,
      `Operator: ${transporter ? transporter.name : "Unknown"} (${transporter ? transporter.phone : "no phone on file"})`,
      `Vehicle: ${transporter ? transporter.vehicle : "n/a"}`,
      `Route: ${r.pickup || "?"} to ${r.destination || "?"}`,
      `Status: ${r.status.replace(/_/g, " ")}`,
      session && session.name ? `Traveler: ${session.name}` : ""
    ].filter(Boolean).join("\n");

    const contact = (session && session.emergencyContact) || "";
    const waNumber = contact.replace(/[^\d+]/g, "");
    const waLink = `https://wa.me/${waNumber ? waNumber.replace(/^\+/, "") : ""}?text=${encodeURIComponent(summary)}`;
    const smsLink = `sms:${contact}?body=${encodeURIComponent(summary)}`;

    const modalRoot = $("#modalRoot");
    modalRoot.innerHTML = `
      <div class="modal">
        <h2>Trip safety</h2>
        <p class="page-sub">Share your trip details with someone you trust, or contact Ridconnect support directly.</p>
        <div class="card" style="white-space:pre-line; font-size:13px; background:var(--surface);">${escapeHTML(summary)}</div>
        ${contact ? `
          <a class="btn btn--primary btn--block" style="margin-top:12px;" href="${waLink}" target="_blank" rel="noopener">Share via WhatsApp</a>
          <a class="btn btn--secondary btn--block" style="margin-top:8px;" href="${smsLink}">Share via SMS</a>
        ` : `<p class="fine-print" style="margin-top:12px;">No emergency contact saved. Add one next time you sign in, or share the summary above manually.</p>`}
        <a class="btn btn--ghost btn--block" style="margin-top:8px;" href="tel:+2348000000000">Call Ridconnect support</a>
        <button class="btn btn--ghost btn--block" style="margin-top:8px;" id="closeSafety">Close</button>
      </div>`;
    modalRoot.classList.remove("hidden");
    $("#closeSafety").onclick = () => modalRoot.classList.add("hidden");
  }

  document.addEventListener("click", (e) => {
    const safetyBtn = e.target.closest("[data-safety]");
    if (safetyBtn) openSafetyModal(safetyBtn.dataset.safety);
  });

  function openReportModal(targetType, targetId, targetName) {
    const modalRoot = $("#modalRoot");
    modalRoot.innerHTML = `
      <div class="modal">
        <h2>Report ${targetType === "transporter" ? "transporter" : "customer"}</h2>
        <p class="page-sub">Reporting ${escapeHTML(targetName)}. Our team reviews every report — this does not notify them directly.</p>
        <label class="field"><span class="field__label">Reason</span>
          <select id="reportReason">
            <option>Did not show up</option>
            <option>Unsafe behavior</option>
            <option>Requested off-platform payment before trip</option>
            <option>Charged more than the agreed fare</option>
            <option>Rude or abusive conduct</option>
            <option>Other</option>
          </select>
        </label>
        <label class="field"><span class="field__label">Details (optional)</span><textarea id="reportDetails" rows="3"></textarea></label>
        <div style="display:flex; gap:10px;">
          <button class="btn btn--primary" id="submitReport">Submit report</button>
          <button class="btn btn--ghost" id="closeReport">Cancel</button>
        </div>
      </div>`;
    modalRoot.classList.remove("hidden");
    $("#closeReport").onclick = () => modalRoot.classList.add("hidden");
    $("#submitReport").onclick = () => {
      const session = getSession();
      const reports = StorageService.get("reports", []);
      reports.push({
        id: genId("REPORT"), targetType, targetId, targetName,
        reporterId: session ? session.id : null, reporterName: session ? session.name : "Guest",
        reason: $("#reportReason").value, details: $("#reportDetails").value.trim(),
        status: "OPEN", createdAt: new Date().toISOString()
      });
      StorageService.set("reports", reports);
      modalRoot.classList.add("hidden");
      toast("Report submitted — our team will review it", "success");
    };
  }

  document.addEventListener("click", (e) => {
    const reportBtn = e.target.closest("[data-report]");
    if (!reportBtn) return;
    openReportModal(reportBtn.dataset.report, reportBtn.dataset.reportId, reportBtn.dataset.reportName);
  });

  function openRatingModal(requestId) {
    const modalRoot = $("#modalRoot");
    modalRoot.innerHTML = `
      <div class="modal">
        <h2>Rate your trip</h2>
        <div class="field">
          <span class="field__label">Rating</span>
          <select id="ratingStars">
            <option value="5">5 — Excellent</option>
            <option value="4">4 — Good</option>
            <option value="3">3 — Okay</option>
            <option value="2">2 — Poor</option>
            <option value="1">1 — Very poor</option>
          </select>
        </div>
        <label class="field"><span class="field__label">Comment (optional)</span><textarea id="ratingComment" rows="3"></textarea></label>
        <div style="display:flex; gap:10px;">
          <button class="btn btn--primary" id="submitRating">Submit rating</button>
          <button class="btn btn--ghost" id="closeRating">Cancel</button>
        </div>
      </div>`;
    modalRoot.classList.remove("hidden");
    $("#closeRating").onclick = () => modalRoot.classList.add("hidden");
    $("#submitRating").onclick = () => {
      const rating = parseInt($("#ratingStars").value, 10);
      const comment = $("#ratingComment").value.trim();
      const requests = StorageService.get("requests", []);
      const request = requests.find((r) => r.id === requestId);
      if (!request) return;

      const reviews = StorageService.get("reviews", []);
      reviews.push({ id: genId("REVIEW"), requestId, transporterId: request.transporterId, rating, comment, createdAt: new Date().toISOString() });
      StorageService.set("reviews", reviews);

      const transporters = StorageService.get("transporters", []);
      const idx = transporters.findIndex((t) => t.id === request.transporterId);
      if (idx >= 0) {
        const t = transporters[idx];
        const newCount = t.ratingCount + 1;
        t.rating = +(((t.rating * t.ratingCount) + rating) / newCount).toFixed(2);
        t.ratingCount = newCount;
        StorageService.set("transporters", transporters);
      }
      modalRoot.classList.add("hidden");
      toast("Thanks for your rating!", "success");
      renderUserTrips();
    };
  }

  /* =========================================================
     16. ADMIN DASHBOARD
     ========================================================= */
  $$("#adminTabs .tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      $$("#adminTabs .tab").forEach((t) => t.classList.remove("is-active"));
      tab.classList.add("is-active");
      $$(".tab-panel").forEach((p) => p.classList.toggle("is-active", p.dataset.panel === tab.dataset.tab));
    });
  });

  function renderAdminDashboard() {
    const session = getSession();
    if (!session || session.role !== "admin") { showScreen("auth"); return; }

    const users = StorageService.get("users", []);
    const transporters = StorageService.get("transporters", []);
    const requests = StorageService.get("requests", []);
    const reports = StorageService.get("reports", []);
    const settings = StorageService.get("settings", { commissionPct: 10, defaultRadiusKm: 5 });

    const activeTrips = requests.filter((r) => !["COMPLETED", "DELIVERED", "CANCELLED"].includes(r.status));
    const completedTrips = requests.filter((r) => ["COMPLETED", "DELIVERED"].includes(r.status));
    const cancelledTrips = requests.filter((r) => r.status === "CANCELLED");
    const goodsDeliveries = requests.filter((r) => r.type === "goods");
    const estRevenue = completedTrips.length * 800 * (settings.commissionPct / 100);

    $("#adminMetrics").innerHTML = [
      ["Total users", users.length],
      ["Active transporters", transporters.filter((t) => t.available).length],
      ["Pending verification", transporters.filter((t) => t.verification === "PENDING").length],
      ["Active trips", activeTrips.length],
      ["Completed trips", completedTrips.length],
      ["Cancelled", cancelledTrips.length],
      ["Open reports", reports.filter((r) => r.status === "OPEN").length],
      ["Est. commission (₦)", Math.round(estRevenue).toLocaleString()]
    ].map(([label, val]) => `<div class="metric"><div class="metric__value">${val}</div><div class="metric__label">${label}</div></div>`).join("");

    function renderOperatorsTable() {
      const q = $("#adminOperatorSearch").value.trim().toLowerCase();
      const status = $("#adminOperatorStatus").value;
      const filtered = transporters.filter((t) =>
        (!q || t.name.toLowerCase().includes(q)) && (!status || t.verification === status)
      );
      $("#adminOperators").innerHTML = `<table>
        <thead><tr><th>Name</th><th>Vehicle</th><th>Area</th><th>Rating</th><th>Trips</th><th>Verification</th><th>Actions</th></tr></thead>
        <tbody>${filtered.map((t) => `
          <tr>
            <td>${escapeHTML(t.name)}</td><td>${escapeHTML(t.vehicle)}</td><td>${t.serviceArea}</td>
            <td>${starRating(t.rating)}</td><td>${t.completedTrips}</td>
            <td>${verificationBadge(t.verification)}</td>
            <td>
              ${t.verification === "PENDING" ? `<button class="btn btn--secondary btn--sm" data-verify="${t.id}">Approve</button><button class="btn btn--ghost btn--sm" data-reject="${t.id}">Reject</button>` : ""}
              ${t.verification !== "VERIFIED" && t.verification !== "PENDING" ? `<button class="btn btn--secondary btn--sm" data-verify="${t.id}">Verify</button>` : ""}
              ${t.verification !== "SUSPENDED" ? `<button class="btn btn--ghost btn--sm" data-suspend="${t.id}">Suspend</button>` : `<button class="btn btn--ghost btn--sm" data-reinstate="${t.id}">Reinstate</button>`}
            </td>
          </tr>`).join("") || `<tr><td colspan="7">No matching transporters.</td></tr>`}</tbody></table>`;
    }
    renderOperatorsTable();
    $("#adminOperatorSearch").oninput = renderOperatorsTable;
    $("#adminOperatorStatus").onchange = renderOperatorsTable;

    function renderRequestsTable() {
      const q = $("#adminRequestSearch").value.trim().toLowerCase();
      const status = $("#adminRequestStatus").value;
      const filtered = requests.filter((r) =>
        (!q || (r.requesterName || "").toLowerCase().includes(q)) && (!status || r.status === status)
      );
      $("#adminRequests").innerHTML = `<table>
        <thead><tr><th>ID</th><th>Type</th><th>Requester</th><th>Route</th><th>Status</th></tr></thead>
        <tbody>${filtered.slice().reverse().slice(0, 50).map((r) => `
          <tr><td>${r.id}</td><td>${r.type}</td><td>${escapeHTML(r.requesterName)}</td>
          <td>${escapeHTML(r.pickup || "")} → ${escapeHTML(r.destination || "")}</td>
          <td>${r.status.replace(/_/g," ")}</td></tr>`).join("") || `<tr><td colspan="5">No matching requests.</td></tr>`}</tbody></table>`;
    }
    renderRequestsTable();
    $("#adminRequestSearch").oninput = renderRequestsTable;
    $("#adminRequestStatus").onchange = renderRequestsTable;

    $("#adminReports").innerHTML = `<table>
      <thead><tr><th>Reported</th><th>Type</th><th>Reason</th><th>Reported by</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>${reports.slice().reverse().map((r) => `
        <tr>
          <td>${escapeHTML(r.targetName)}</td><td>${r.targetType}</td><td>${escapeHTML(r.reason)}</td>
          <td>${escapeHTML(r.reporterName)}</td>
          <td>${r.status === "OPEN" ? '<span class="badge badge--pending">Open</span>' : '<span class="badge badge--verified">Reviewed</span>'}</td>
          <td>${r.status === "OPEN" ? `<button class="btn btn--secondary btn--sm" data-resolve-report="${r.id}">Mark reviewed</button>` : ""}</td>
        </tr>`).join("") || `<tr><td colspan="6">No reports yet.</td></tr>`}</tbody></table>`;

    const cities = StorageService.get("cities", []);
    $("#adminCities").innerHTML = `<table>
      <thead><tr><th>City</th><th>Status</th><th>Service areas</th></tr></thead>
      <tbody>${cities.map((c) => `<tr><td>${c.name}</td><td>${c.active ? '<span class="badge badge--verified">Active</span>' : '<span class="badge badge--muted">Coming soon</span>'}</td><td>${c.serviceAreas.join(", ")}</td></tr>`).join("")}</tbody></table>`;

    $("#addAreaBtn").onclick = () => {
      const areaName = $("#newAreaName").value.trim();
      const cityId = $("#newAreaCity").value;
      if (!areaName) { toast("Enter an area name", "error"); return; }
      const citiesList = StorageService.get("cities", []);
      const city = citiesList.find((c) => c.id === cityId);
      if (!city) return;
      if (city.serviceAreas.some((a) => a.toLowerCase() === areaName.toLowerCase())) { toast("That area already exists", "error"); return; }
      city.serviceAreas.push(areaName);
      StorageService.set("cities", citiesList);
      $("#newAreaName").value = "";
      populateServiceAreaSelect($("#tdServiceArea"));
      populateServiceAreaSelect($("#obServiceArea"));
      toast(`${areaName} added to ${city.name}`, "success");
      renderAdminDashboard();
    };

    $("#settingCommission").value = settings.commissionPct;
    $("#settingRadius").value = settings.defaultRadiusKm;
    $("#saveSettingsBtn").onclick = () => {
      StorageService.set("settings", {
        commissionPct: parseInt($("#settingCommission").value, 10) || 0,
        defaultRadiusKm: parseInt($("#settingRadius").value, 10) || 5
      });
      toast("Settings saved", "success");
    };
  }

  document.addEventListener("click", (e) => {
    const verifyBtn = e.target.closest("[data-verify]");
    const rejectBtn = e.target.closest("[data-reject]");
    const suspendBtn = e.target.closest("[data-suspend]");
    const reinstateBtn = e.target.closest("[data-reinstate]");
    const resolveReportBtn = e.target.closest("[data-resolve-report]");

    if (resolveReportBtn) {
      const reports = StorageService.get("reports", []);
      const idx = reports.findIndex((r) => r.id === resolveReportBtn.dataset.resolveReport);
      if (idx >= 0) { reports[idx].status = "REVIEWED"; StorageService.set("reports", reports); toast("Report marked reviewed", "success"); renderAdminDashboard(); }
      return;
    }
    if (!verifyBtn && !rejectBtn && !suspendBtn && !reinstateBtn) return;
    const id = verifyBtn ? verifyBtn.dataset.verify : rejectBtn ? rejectBtn.dataset.reject : suspendBtn ? suspendBtn.dataset.suspend : reinstateBtn.dataset.reinstate;
    const transporters = StorageService.get("transporters", []);
    const idx = transporters.findIndex((t) => t.id === id);
    if (idx === -1) return;
    if (verifyBtn) transporters[idx].verification = "VERIFIED";
    if (rejectBtn) { transporters[idx].verification = "REJECTED"; transporters[idx].available = false; }
    if (suspendBtn) { transporters[idx].verification = "SUSPENDED"; transporters[idx].available = false; }
    if (reinstateBtn) transporters[idx].verification = "PENDING";
    StorageService.set("transporters", transporters);
    toast("Transporter updated", "success");
    renderAdminDashboard();
  });

  /* =========================================================
     17. OFFLINE / NETWORK STATUS
     ========================================================= */
  function updateOfflineBanner() {
    $("#offlineBanner").classList.toggle("hidden", navigator.onLine);
  }
  window.addEventListener("online", updateOfflineBanner);
  window.addEventListener("offline", updateOfflineBanner);
  updateOfflineBanner();

  /* =========================================================
     18. PWA — SERVICE WORKER REGISTRATION
        Requires HTTPS (or localhost) and the accompanying
        manifest.json / service-worker.js shipped alongside
        this file. See README notes for production deployment.
     ========================================================= */
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("service-worker.js").catch(() => {
        /* Fails gracefully when served from file:// or without HTTPS — expected in local preview. */
      });
    });
  }

  /* =========================================================
     19. INITIAL RENDER
     ========================================================= */
  renderAuthUI();
  renderHomeStats();
  applyLanguage(currentLang());
  showScreen("home");
})();
