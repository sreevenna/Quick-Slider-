import { useRef, useState } from "react";
import ContactRow from "./ContactRow";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function ContactsTab({
  contacts,
  loading,
  onAdd,
  onFavorite,
  onDelete,
  onCall,
  onToast,
}) {
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const listRef = useRef(null);

  // filter + sort (filter makes a copy, so sort is safe)
  const text = search.toLowerCase();
  const shown = contacts
    .filter((c) => c.name.toLowerCase().includes(text) || c.phone.includes(text))
    .sort((a, b) => a.name.localeCompare(b.name));

  const favorites = shown.filter((c) => c.favorite);

  const groups = {};
  shown.forEach((c) => {
    const L = c.name[0].toUpperCase();
    if (!groups[L]) groups[L] = [];
    groups[L].push(c);
  });

  async function submit() {
    if (!name.trim() || !phone.trim()) return;
    const ok = await onAdd(name.trim(), phone.trim());
    if (ok) {
      setName("");
      setPhone("");
    }
  }

  // import from phone (Android Chrome only)
  async function importContacts() {
    if (!("contacts" in navigator) || !("ContactsManager" in window)) {
      onToast("Import works on Android Chrome only");
      return;
    }
    try {
      const picked = await navigator.contacts.select(["name", "tel"], { multiple: true });
      for (const p of picked) {
        const n = (p.name && p.name[0]) || "";
        const t = (p.tel && p.tel[0]) || "";
        if (n && t && !contacts.some((c) => c.phone === t)) {
          await onAdd(n, t);
        }
      }
    } catch {
      onToast("Import cancelled");
    }
  }

  function jumpTo(L) {
    const target = listRef.current.querySelector("#letter-" + L);
    listRef.current.scrollTo({ top: target.offsetTop, behavior: "smooth" });
  }

  function row(c) {
    return (
      <ContactRow
        key={c.id}
        contact={c}
        onCall={onCall}
        onFavorite={onFavorite}
        onDelete={onDelete}
      />
    );
  }

  return (
    <section className="tab show">
      <input
        id="search"
        placeholder="Search contacts..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <button className="small wide" onClick={importContacts}>
        Import from phone
      </button>

      <div className="add">
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <button onClick={submit}>Add contact</button>
      </div>

      <div className="list-wrap">
        <div id="list" ref={listRef}>
          {loading && <p className="empty">Loading...</p>}
          {!loading && shown.length === 0 && <p className="empty">No contacts found</p>}

          {favorites.length > 0 && (
            <div>
              <div className="letter">★ Favorites</div>
              {favorites.map(row)}
            </div>
          )}

          {Object.keys(groups).sort().map((L) => (
            <div key={L}>
              <div className="letter" id={"letter-" + L}>{L}</div>
              {groups[L].map(row)}
            </div>
          ))}
        </div>

        <div id="az">
          {LETTERS.map((L) => (
            <span key={L} className={groups[L] ? "on" : ""} onClick={() => groups[L] && jumpTo(L)}>
              {L}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}