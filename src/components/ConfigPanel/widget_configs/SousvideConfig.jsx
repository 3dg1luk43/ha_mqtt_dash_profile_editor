export default function SousvideConfig({ widget, onChange }) {
  return (
    <div>
      <h3 style={sectionTitle}>Sous Vide</h3>
      <p style={{ fontSize: 11, color: '#888', marginBottom: 10, lineHeight: 1.4 }}>
        Displays current temperature (top, large) and time remaining in HH:MM (below).
        Off-state (off / unavailable) dims the tile to 40%.
      </p>
      <div style={{ marginBottom: 8 }}>
        <label style={labelStyle}>State topic <span style={hint}>(temperature value)</span></label>
        <input type="text" value={widget.state_topic ?? ''} onChange={(e) => onChange({ state_topic: e.target.value })} placeholder="home/sousvide/temperature" style={inputStyle} />
      </div>
      <div style={{ marginBottom: 8 }}>
        <label style={labelStyle}>Time topic <span style={hint}>(minutes remaining)</span></label>
        <input type="text" value={widget.time_topic ?? ''} onChange={(e) => onChange({ time_topic: e.target.value })} placeholder="home/sousvide/time_remaining" style={inputStyle} />
      </div>
      <div style={{ marginBottom: 8 }}>
        <label style={labelStyle}>Unit</label>
        <input type="text" value={widget.unit ?? '°C'} onChange={(e) => onChange({ unit: e.target.value })} placeholder="°C" style={{ ...inputStyle, width: 60 }} />
      </div>
    </div>
  );
}
const sectionTitle = { fontSize: 13, fontWeight: 600, color: '#333', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' };
const labelStyle = { fontSize: 11, color: '#666', display: 'block', marginBottom: 2 };
const hint = { color: '#aaa', fontWeight: 400 };
const inputStyle = { fontSize: 12, padding: '4px 6px', border: '1px solid #ddd', borderRadius: 4, background: '#fafafa', width: '100%', boxSizing: 'border-box' };
