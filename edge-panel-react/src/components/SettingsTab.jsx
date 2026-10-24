export default function SettingsTab({ settings, setSettings, user, onLogout }) {
  return (
    <section className="tab show">
      <p>
        Signed in as <b>{user.name}</b>
        <br />
        <small>{user.email}</small>
      </p>

      <label>
        Panel side
        <select
          value={settings.side}
          onChange={(e) => setSettings({ ...settings, side: e.target.value })}
        >
          <option value="right">Right</option>
          <option value="left">Left</option>
        </select>
      </label>

      <label>
        Handle opacity
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.1"
          value={settings.opacity}
          onChange={(e) => setSettings({ ...settings, opacity: Number(e.target.value) })}
        />
      </label>

      <button onClick={onLogout}>Log out</button>
    </section>
  );
}