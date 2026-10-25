/* MineTrack - shared script for dashboard.html and tyres-equipment.html
   - checks that a user is signed in (otherwise goes to the login page)
   - builds the sidebar and top bar
   - shows only the menu links allowed for the user's role (report section 4.8) */
(function () {
  var A = "Admin", M = "Maintenance Manager", T = "Technician", O = "Operator";

  // small line icons
  var ICONS = {
    grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
    truck: '<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
    tyre: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>',
    tool: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    alert: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    chart: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
    search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    caret: '<polyline points="6 9 12 15 18 9"/>',
    pulse: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
    gauge: '<path d="M12 14l4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
    thermo: '<path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>',
    info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
    refresh: '<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>',
    pick: '<path d="M4 20L14 10"/><path d="M5 8c4-4 11-4 15 2"/><path d="M12 12l6-6"/>'
  };
  function svg(name) { return '<svg class="i" viewBox="0 0 24 24">' + ICONS[name] + '</svg>'; }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

  // menu links and which roles may see them
  var NAV = [
    { key: "dashboard",   label: "Dashboard",       href: "dashboard.html",               icon: "grid",  roles: [A, M, T, O] },
    { key: "equipment",   label: "Equipment",       href: "tyres-equipment.html#equipment", icon: "truck", roles: [A, M, T, O] },
    { key: "tyres",       label: "Tyre Management", href: "tyres-equipment.html#tyres",     icon: "tyre",  roles: [A, M, T] },
    { key: "maintenance", label: "Maintenance",     soon: true, icon: "tool",  roles: [A, M, T] },
    { key: "alerts",      label: "Alerts",          soon: true, icon: "alert", roles: [A, M, T], badge: 3 },
    { key: "reports",     label: "Reports",         soon: true, icon: "chart", roles: [A, M] },
    { key: "users",       label: "Users",           soon: true, icon: "users", roles: [A] },
    { key: "settings",    label: "Settings",        soon: true, icon: "gear",  roles: [A] }
  ];

  // ---- who is signed in? ----
  var user = null, storageOk = true;
  try { user = JSON.parse(sessionStorage.getItem("mt_user")); } catch (e) { storageOk = false; }
  if (!user) {
    if (storageOk) { location.replace("login.html"); return; }
    user = { name: "James Mitchell", role: M };   // only if the browser blocks storage
  }

  function initials(n) {
    return n.split(" ").filter(Boolean).slice(0, 2).map(function (w) { return w.charAt(0).toUpperCase(); }).join("") || "U";
  }

  // ---- toast message ----
  var toastEl = document.createElement("div");
  toastEl.className = "toast";
  document.body.appendChild(toastEl);
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }

  // ---- sidebar ----
  var sb = document.getElementById("sidebar");
  if (sb) {
    var h = '<div class="brand"><div class="logo-mark">' + svg("pick") + '</div>' +
            '<div class="brand-text"><b>Mining Equipment</b><small>&amp; Tyre Maintenance</small></div></div>' +
            '<div class="menu-title">WORKSPACE</div><nav class="menu">';
    NAV.forEach(function (n) {
      if (n.roles.indexOf(user.role) === -1) return;
      var link = n.soon ? 'href="#" data-soon="1"' : 'href="' + n.href + '"';
      h += '<a ' + link + ' data-key="' + n.key + '">' + svg(n.icon) + '<span>' + n.label + '</span>' +
           (n.badge ? '<em class="badge">' + n.badge + '</em>' : '') + '</a>';
    });
    h += '</nav><div class="site-box"><small>CURRENT SITE</small><strong>North Ridge Mine</strong><span>Day shift · 06:00–18:00</span></div>' +
         '<div class="ok">All systems operational</div>';
    sb.innerHTML = h;
  }

  // ---- top bar ----
  var tb = document.getElementById("topbar");
  if (tb) {
    tb.innerHTML =
      '<div class="crumb"><small>Mining operations</small><b>' + esc(document.body.getAttribute("data-title") || "Dashboard") + '</b></div>' +
      '<div class="search">' + svg("search") + '<input id="gsearch" type="text" placeholder="Search equipment, tyres, reports..."><kbd>Ctrl K</kbd></div>' +
      '<button class="icon-btn" id="bell" title="Alerts">' + svg("bell") + '<span class="dot"></span></button>' +
      '<div class="user" id="userChip"><div class="avatar">' + esc(initials(user.name)) + '</div>' +
      '<div><b>' + esc(user.name) + '</b><small>' + esc(user.role) + '</small></div>' + svg("caret") +
      '<div class="menu-pop" id="pop"><a href="#" id="logout">Logout</a></div></div>';
  }

  // ---- fill icons placed in the page (data-icon="name") ----
  var spots = document.querySelectorAll("[data-icon]");
  for (var i = 0; i < spots.length; i++) spots[i].innerHTML = svg(spots[i].getAttribute("data-icon"));

  // ---- highlight the current menu link ----
  function setActive(key) {
    var links = document.querySelectorAll(".menu a");
    for (var j = 0; j < links.length; j++) {
      links[j].classList.toggle("active", links[j].getAttribute("data-key") === key);
    }
  }
  setActive(document.body.getAttribute("data-key"));

  // ---- clicks ----
  document.addEventListener("click", function (e) {
    var t = e.target;
    var soon = t.closest ? t.closest("[data-soon]") : null;
    if (soon) { e.preventDefault(); toast("This screen is coming soon in the web prototype."); return; }
    if (t.closest && t.closest("#logout")) {
      e.preventDefault();
      try { sessionStorage.removeItem("mt_user"); } catch (x) {}
      location.href = "login.html";
      return;
    }
    if (t.closest && t.closest("#bell")) { toast("3 critical alerts – see the Critical Alerts panel."); return; }
    var pop = document.getElementById("pop");
    if (pop) {
      if (t.closest && t.closest("#userChip")) pop.classList.toggle("open");
      else pop.classList.remove("open");
    }
  });

  // ---- search box: Enter opens the equipment page with that search; Ctrl+K focuses it ----
  var gs = document.getElementById("gsearch");
  if (gs) {
    gs.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && gs.value.trim()) location.href = "tyres-equipment.html?q=" + encodeURIComponent(gs.value.trim());
    });
    document.addEventListener("keydown", function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); gs.focus(); }
    });
  }

  window.MT = { user: user, setActive: setActive, toast: toast };
})();
