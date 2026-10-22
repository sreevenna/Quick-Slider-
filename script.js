// 1. DATA (saved in the browser). Sample contacts to start with.
const sample = [
  { id: 1, name: "Aarav Sharma", phone: "+91 98765 43210", favorite: false },
  { id: 2, name: "Anita Patel", phone: "+91 91234 56789", favorite: true },
  { id: 3, name: "Arjun Mehta", phone: "+91 99887 76654", favorite: false },
  { id: 4, name: "Bhavana Singh", phone: "+91 87654 32109", favorite: false },
  { id: 5, name: "Brandon Roy", phone: "+1 415 555 1234", favorite: false },
  { id: 6, name: "Chirag Joshi", phone: "+91 90909 10101", favorite: false },
];
let contacts = JSON.parse(localStorage.getItem("contacts")) || sample;
let settings = JSON.parse(localStorage.getItem("settings")) || { side: "right", opacity: 0.6 };

// 2. ELEMENTS
const phone = document.getElementById("phone");
const handle = document.getElementById("handle");
const panel = document.getElementById("panel");
const backdrop = document.getElementById("backdrop");
const list = document.getElementById("list");
const az = document.getElementById("az");
const searchInput = document.getElementById("search");
const toast = document.getElementById("toast");

function save() {
  localStorage.setItem("contacts", JSON.stringify(contacts));
  localStorage.setItem("settings", JSON.stringify(settings));
}

// 3. OPEN / CLOSE THE PANEL
function openPanel() {
  panel.classList.add("open");
  backdrop.classList.add("show");
}
function closePanel() {
  panel.classList.remove("open");
  backdrop.classList.remove("show");
}
backdrop.onclick = closePanel;

// 4. SWIPE OR TAP ON THE HANDLE
let startX = null;
handle.addEventListener("pointerdown", (e) => {
  startX = e.clientX;
  handle.setPointerCapture(e.pointerId);
});
handle.addEventListener("pointermove", (e) => {
  if (startX === null) return;
  const dx = e.clientX - startX;
  const inward = settings.side === "right" ? -dx : dx;
  if (inward > 30) {
    openPanel();
    startX = null;
  }
});
handle.addEventListener("pointerup", () => {
  if (startX !== null) openPanel();
  startX = null;
});

// 5. MESSAGE AT THE BOTTOM
function showToast(text) {
  toast.textContent = text;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1500);
}

// 6. CONTACT ACTIONS
function toggleFavorite(id) {
  const c = contacts.find((x) => x.id === id);
  c.favorite = !c.favorite;
  save();
  renderContacts();
}
function removeContact(id) {
  contacts = contacts.filter((x) => x.id !== id);
  save();
  renderContacts();
}
function callContact(c) {
  showToast("Calling " + c.name);
  window.location.href = "tel:" + c.phone.replace(/\s/g, "");
}

// 7. BUILD ONE CONTACT ROW
function makeRow(c) {
  const row = document.createElement("div");
  row.className = "row";

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = c.name[0].toUpperCase();

  const info = document.createElement("div");
  info.className = "info";
  info.onclick = () => callContact(c); // tap to call
  const nameEl = document.createElement("b");
  nameEl.textContent = c.name;
  const phoneEl = document.createElement("small");
  phoneEl.textContent = c.phone;
  info.append(nameEl, phoneEl);

  const fav = document.createElement("button");
  fav.className = "icon-btn";
  fav.textContent = c.favorite ? "★" : "☆";
  fav.onclick = () => toggleFavorite(c.id);

  const del = document.createElement("button");
  del.className = "icon-btn";
  del.textContent = "✕";
  del.onclick = () => removeContact(c.id);

  row.append(avatar, info, fav, del);
  return row;
}

function makeHeading(text, id) {
  const h = document.createElement("div");
  h.className = "letter";
  h.textContent = text;
  if (id) h.id = id;
  return h;
}

// 8. DRAW THE CONTACT LIST + A-Z BAR
function renderContacts() {
  const text = searchInput.value.toLowerCase();

  const shown = contacts
    .filter((c) => c.name.toLowerCase().includes(text) || c.phone.includes(text))
    .sort((a, b) => a.name.localeCompare(b.name));

  list.innerHTML = "";

  if (shown.length === 0) {
    const e = document.createElement("p");
    e.className = "empty";
    e.textContent = "No contacts found";
    list.appendChild(e);
  }

  // favorites first
  const favs = shown.filter((c) => c.favorite);
  if (favs.length) {
    list.appendChild(makeHeading("★ Favorites"));
    favs.forEach((c) => list.appendChild(makeRow(c)));
  }

  // group by first letter
  const groups = {};
  shown.forEach((c) => {
    const L = c.name[0].toUpperCase();
    if (!groups[L]) groups[L] = [];
    groups[L].push(c);
  });
  Object.keys(groups).sort().forEach((L) => {
    list.appendChild(makeHeading(L, "letter-" + L));
    groups[L].forEach((c) => list.appendChild(makeRow(c)));
  });

  // A-Z bar
  az.innerHTML = "";
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach((L) => {
    const s = document.createElement("span");
    s.textContent = L;
    if (groups[L]) {
      s.className = "on";
      s.onclick = () => {
        const target = document.getElementById("letter-" + L);
        list.scrollTo({ top: target.offsetTop, behavior: "smooth" });
      };
    }
    az.appendChild(s);
  });
}
searchInput.oninput = renderContacts;

// 9. ADD A CONTACT MANUALLY
document.getElementById("addBtn").onclick = () => {
  const name = document.getElementById("cName").value.trim();
  const phoneNo = document.getElementById("cPhone").value.trim();
  if (!name || !phoneNo) return;

  contacts.push({ id: Date.now() + Math.random(), name, phone: phoneNo, favorite: false });
  document.getElementById("cName").value = "";
  document.getElementById("cPhone").value = "";
  save();
  renderContacts();
};

// 10. IMPORT FROM THE PHONE (Android Chrome only)
document.getElementById("importBtn").onclick = async () => {
  if (!("contacts" in navigator) || !("ContactsManager" in window)) {
    showToast("Import works on Android Chrome only");
    return;
  }
  try {
    const picked = await navigator.contacts.select(["name", "tel"], { multiple: true });
    picked.forEach((p) => {
      const name = (p.name && p.name[0]) || "";
      const tel = (p.tel && p.tel[0]) || "";
      if (name && tel && !contacts.some((c) => c.phone === tel)) {
        contacts.push({ id: Date.now() + Math.random(), name, phone: tel, favorite: false });
      }
    });
    save();
    renderContacts();
  } catch (err) {
    showToast("Import cancelled");
  }
};

// 11. TABS
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.onclick = () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("show"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("show");
  };
});

// 12. SETTINGS
const sideSelect = document.getElementById("side");
const opacityInput = document.getElementById("opacity");

function applySettings() {
  phone.className = "phone " + settings.side;
  handle.style.opacity = settings.opacity;
  sideSelect.value = settings.side;
  opacityInput.value = settings.opacity;
}
sideSelect.onchange = () => {
  settings.side = sideSelect.value;
  save();
  applySettings();
};
opacityInput.oninput = () => {
  settings.opacity = opacityInput.value;
  save();
  applySettings();
};

// 13. CLOCK ON HOME SCREEN
function tick() {
  document.getElementById("time").textContent = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}
setInterval(tick, 1000);

// START
tick();
applySettings();
renderContacts();