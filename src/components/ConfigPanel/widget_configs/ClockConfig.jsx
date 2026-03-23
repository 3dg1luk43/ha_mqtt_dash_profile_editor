export default function ClockConfig({ widget, onChange }) {
  return (
    <div>
      <h3 style={sectionTitle}>Clock</h3>
      <div style={{ marginBottom: 8 }}>
        <label style={labelStyle}>Time pattern</label>
        <input
          type="text"
          value={widget.time_pattern ?? ''}
          onChange={(e) => onChange({ time_pattern: e.target.value })}
          placeholder="e.g. HH:MM:SS"
          style={inputStyle}
        />
        <p style={{ fontSize: 10, color: '#999', margin: '4px 0 0' }}>
          Tokens: HH (24h hour), hh (12h), MM (min), SS (sec), DD (day), Mo (month), YY (year)
        </p>
      </div>
    </div>
  );
}

const sectionTitle = { fontSize: 13, fontWeight: 600, color: '#333', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' };
const labelStyle = { fontSize: 11, color: '#666', display: 'block', marginBottom: 2 };
const inputStyle = { fontSize: 12, padding: '4px 6px', border: '1px solid #ddd', borderRadius: 4, background: '#fafafa', width: '100%', boxSizing: 'border-box' };
