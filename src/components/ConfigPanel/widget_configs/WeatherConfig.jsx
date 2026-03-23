const WEATHER_ATTRS = ['temperature', 'humidity', 'wind_speed', 'pressure', 'visibility', 'dew_point', 'cloud_coverage', 'uv_index', 'precipitation'];

export default function WeatherConfig({ widget, onChange }) {
  const attrs = widget.attrs ?? [];
  const attr_units = widget.attr_units ?? {};

  function toggleAttr(attr) {
    const next = attrs.includes(attr) ? attrs.filter((a) => a !== attr) : [...attrs, attr];
    onChange({ attrs: next });
  }

  function setUnit(attr, value) {
    onChange({ attr_units: { ...attr_units, [attr]: value } });
  }

  return (
    <div>
      <h3 style={sectionTitle}>Weather</h3>
      <div style={{ marginBottom: 8 }}>
        <label style={labelStyle}>Attributes to display</label>
        {WEATHER_ATTRS.map((a) => (
          <label key={a} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, fontSize: 12 }}>
            <input type="checkbox" checked={attrs.includes(a)} onChange={() => toggleAttr(a)} />
            {a}
            {attrs.includes(a) && (
              <input
                type="text"
                value={attr_units[a] ?? ''}
                onChange={(e) => setUnit(a, e.target.value)}
                placeholder="unit"
                style={{ ...inputStyle, width: 60, marginLeft: 'auto' }}
              />
            )}
          </label>
        ))}
      </div>
    </div>
  );
}

const sectionTitle = { fontSize: 13, fontWeight: 600, color: '#333', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' };
const labelStyle = { fontSize: 11, color: '#666', display: 'block', marginBottom: 4 };
const inputStyle = { fontSize: 11, padding: '2px 4px', border: '1px solid #ddd', borderRadius: 4, background: '#fafafa', boxSizing: 'border-box' };
