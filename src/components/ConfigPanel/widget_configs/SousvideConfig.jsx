export default function SousvideConfig({ widget, onChange }) {
  return (
    <div>
      <h3 style={sectionTitle}>Sous Vide</h3>
      <p style={{ fontSize: 11, color: '#888', marginBottom: 10, lineHeight: 1.4 }}>
        <code>entity_id</code> drives active state — value <strong>cooking</strong> activates the tile;
        anything else (idle / off / unavailable) dims it.
      </p>

      <div style={{ marginBottom: 8 }}>
        <label style={labelStyle}>Current temp entity <span style={hint}>(sensor.*)</span></label>
        <input
          type="text"
          value={widget.temp_entity ?? ''}
          onChange={(e) => onChange({ temp_entity: e.target.value })}
          placeholder="sensor.sv_temperature"
          list="entity-autocomplete"
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: 8 }}>
        <label style={labelStyle}>Target temp entity <span style={hint}>(sensor.*)</span></label>
        <input
          type="text"
          value={widget.target_entity ?? ''}
          onChange={(e) => onChange({ target_entity: e.target.value })}
          placeholder="sensor.sv_target_temperature"
          list="entity-autocomplete"
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: 8 }}>
        <label style={labelStyle}>Time remaining entity <span style={hint}>(minutes → HH:MM)</span></label>
        <input
          type="text"
          value={widget.time_entity ?? ''}
          onChange={(e) => onChange({ time_entity: e.target.value })}
          placeholder="sensor.sv_remaining_minutes"
          list="entity-autocomplete"
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: 8 }}>
        <label style={labelStyle}>Unit</label>
        <input
          type="text"
          value={widget.unit ?? '°C'}
          onChange={(e) => onChange({ unit: e.target.value })}
          placeholder="°C"
          style={{ ...inputStyle, width: 60 }}
        />
      </div>
    </div>
  );
}

const sectionTitle = { fontSize: 13, fontWeight: 600, color: '#333', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' };
const labelStyle = { fontSize: 11, color: '#666', display: 'block', marginBottom: 2 };
const hint = { color: '#aaa', fontWeight: 400 };
const inputStyle = { fontSize: 12, padding: '4px 6px', border: '1px solid #ddd', borderRadius: 4, background: '#fafafa', width: '100%', boxSizing: 'border-box' };
