export default function ContactRow({ contact, onCall, onFavorite, onDelete }) {
  return (
    <div className="row">
      <div className="avatar">{contact.name[0].toUpperCase()}</div>

      <div className="info" onClick={() => onCall(contact)}>
        <b>{contact.name}</b>
        <small>{contact.phone}</small>
      </div>

      <button className="icon-btn" onClick={() => onFavorite(contact.id)}>
        {contact.favorite ? "★" : "☆"}
      </button>
      <button className="icon-btn" onClick={() => onDelete(contact.id)}>
        ✕
      </button>
    </div>
  );
}