export default function ApplianceConfig({ widget, onChange }) {
  return (
    <div>
      <h3 style={sectionTitle}>Appliance</h3>
      <p style={{ fontSize: 11, color: '#888', marginBottom: 10, lineHeight: 1.4 }}>
        Shows on/off state (drives tile color), current program name (large, center),
        and time remaining in HH:MM. Off-state dims tile and shows "OFF".
      </p>
      <div style={{ marginBottom: 8 }}>
        <label style={labelStyle}>State topic <span style={hint}>(on/off)</span></label>
        <input type="text" value={widget.state_topic ?? ''} onChange={(e) => onChange({ state_topic: e.target.value })} placeholder="home/washer/state" style={inputStyle} />
      </div>
      <div style={{ marginBottom: 8 }}>
        <label style={labelStyle}>Program topic <span style={hint}>(program name)</span></label>
        <input type="text" value={widget.program_topic ?? ''} onChange={(e) => onChange({ program_topic: e.target.value })} placeholder="home/washer/program" style={inputStyle} />
      </div>
      <div style={{ marginBottom: 8 }}>
        <label style={labelStyle}>Time topic <span style={hint}>(minutes remaining)</span></label>
        <input type="text" value={widget.time_topic ?? ''} onChange={(e) => onChange({ time_topic: e.target.value })} placeholder="home/washer/time_remaining" style={inputStyle} />
      </div>
    </div>
  );
}
const sectionTitle = { fontSize: 13, fontWeight: 600, color: '#333', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' };
const labelStyle = { fontSize: 11, color: '#666', display: 'block', marginBottom: 2 };
const hint = { color: '#aaa', fontWeight: 400 };
const inputStyle = { fontSize: 12, padding: '4px 6px', border: '1px solid #ddd', borderRadius: 4, background: '#fafafa', width: '100%', boxSizing: 'border-box' };
