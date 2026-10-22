import { useEffect, useRef, useState } from "react";
import "./App.css";
import useLocalStorage from "./useLocalStorage";
import { getContacts, createContact, updateContact, deleteContact } from "./api";
import ContactsTab from "./components/ContactsTab";
import SettingsTab from "./components/SettingsTab";

const getTime = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function App() {
  // STATE
  const [contacts, setContacts] = useState([]);   // comes from the API now
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useLocalStorage("settings", { side: "right", opacity: 0.6 });
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("contacts");
  const [toast, setToast] = useState("");
  const [time, setTime] = useState(getTime());
  const startX = useRef(null);

  function showToast(text) {
    setToast(text);
    setTimeout(() => setToast(""), 2000);
  }

  // LOAD CONTACTS ONCE when the app opens
  useEffect(() => {
    getContacts()
      .then(setContacts)
      .catch(() => showToast("Cannot reach server"))
      .finally(() => setLoading(false));
  }, []);

  // CLOCK
  useEffect(() => {
    const id = setInterval(() => setTime(getTime()), 1000);
    return () => clearInterval(id);
  }, []);

  // API ACTIONS: ask the server, then update the screen
  async function addContact(name, phone) {
    try {
      const created = await createContact(name, phone);
      setContacts((prev) => [...prev, created]);
      return true;
    } catch (err) {
      showToast(err.message);
      return false;
    }
  }

  async function toggleFavorite(id) {
    const contact = contacts.find((c) => c.id === id);
    try {
      const updated = await updateContact(id, { favorite: !contact.favorite });
      setContacts((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch (err) {
      showToast(err.message);
    }
  }

  async function removeContact(id) {
    try {
      await deleteContact(id);
      setContacts((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      showToast(err.message);
    }
  }

  function callContact(c) {
    showToast("Calling " + c.name);
    window.location.href = "tel:" + c.phone.replace(/\s/g, "");
  }

  // SWIPE OR TAP ON THE HANDLE
  function onDown(e) {
    startX.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onMove(e) {
    if (startX.current === null) return;
    const dx = e.clientX - startX.current;
    const inward = settings.side === "right" ? -dx : dx;
    if (inward > 30) {
      setOpen(true);
      startX.current = null;
    }
  }
  function onUp() {
    if (startX.current !== null) setOpen(true);
    startX.current = null;
  }

  return (
    <div className={"phone " + settings.side}>
      <div className="home">
        <h1>{time}</h1>
        <p>Swipe or tap the edge handle</p>
      </div>

      <div
        id="handle"
        style={{ opacity: settings.opacity }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
      />

      <div id="backdrop" className={open ? "show" : ""} onClick={() => setOpen(false)} />

      <aside id="panel" className={open ? "open" : ""}>
        <div className="tabs">
          <button
            className={"tab-btn " + (tab === "contacts" ? "active" : "")}
            onClick={() => setTab("contacts")}
          >
            Contacts
          </button>
          <button
            className={"tab-btn " + (tab === "settings" ? "active" : "")}
            onClick={() => setTab("settings")}
          >
            Settings
          </button>
        </div>

        {tab === "contacts" ? (
          <ContactsTab
            contacts={contacts}
            loading={loading}
            onAdd={addContact}
            onFavorite={toggleFavorite}
            onDelete={removeContact}
            onCall={callContact}
            onToast={showToast}
          />
        ) : (
          <SettingsTab settings={settings} setSettings={setSettings} />
        )}
      </aside>

      <div id="toast" className={toast ? "show" : ""}>{toast}</div>
    </div>
  );
}