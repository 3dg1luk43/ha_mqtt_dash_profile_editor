export default function SensorConfig({ widget, onChange }) {
  return (
    <div>
      <h3 style={sectionTitle}>Sensor</h3>
      <div style={{ marginBottom: 8 }}>
        <label style={labelStyle}>Unit</label>
        <input
          type="text"
          value={widget.unit ?? ''}
          onChange={(e) => onChange({ unit: e.target.value })}
          placeholder="e.g. °C, %, W"
          style={inputStyle}
        />
      </div>
    </div>
  );
}

const sectionTitle = { fontSize: 13, fontWeight: 600, color: '#333', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' };
const labelStyle = { fontSize: 11, color: '#666', display: 'block', marginBottom: 2 };
const inputStyle = { fontSize: 12, padding: '4px 6px', border: '1px solid #ddd', borderRadius: 4, background: '#fafafa', width: '100%', boxSizing: 'border-box' };
