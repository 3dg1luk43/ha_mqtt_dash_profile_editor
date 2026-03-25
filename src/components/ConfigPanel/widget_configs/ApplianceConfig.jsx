import EntityAutocomplete from '../EntityAutocomplete';

export default function ApplianceConfig({ widget, onChange }) {
  return (
    <div>
      <h3 style={sectionTitle}>Appliance</h3>
      <p style={{ fontSize: 11, color: '#888', marginBottom: 10, lineHeight: 1.4 }}>
        <code>entity_id</code> drives running state — off / idle / standby / unavailable / unknown
        dims tile; any other value activates it.
      </p>

      <div style={{ marginBottom: 8 }}>
        <label style={labelStyle}>Running state entity <span style={hint}>(off/idle/standby/unavail = dim)</span></label>
        <EntityAutocomplete
          value={widget.entity_id ?? ''}
          onChange={(v) => onChange({ entity_id: v })}
          placeholder="sensor.washer_state"
        />
      </div>

      <div style={{ marginBottom: 8 }}>
        <label style={labelStyle}>Program entity <span style={hint}>(sensor.* — free text)</span></label>
        <EntityAutocomplete
          value={widget.program_entity ?? ''}
          onChange={(v) => onChange({ program_entity: v })}
          placeholder="sensor.washer_program"
        />
      </div>

      <div style={{ marginBottom: 8 }}>
        <label style={labelStyle}>Time remaining entity <span style={hint}>(minutes → HH:MM)</span></label>
        <EntityAutocomplete
          value={widget.time_entity ?? ''}
          onChange={(v) => onChange({ time_entity: v })}
          placeholder="sensor.washer_remaining_minutes"
        />
      </div>
    </div>
  );
}

const sectionTitle = { fontSize: 13, fontWeight: 600, color: '#333', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' };
const labelStyle = { fontSize: 11, color: '#666', display: 'block', marginBottom: 2 };
const hint = { color: '#aaa', fontWeight: 400 };
const inputStyle = { fontSize: 12, padding: '4px 6px', border: '1px solid #ddd', borderRadius: 4, background: '#fafafa', width: '100%', boxSizing: 'border-box' };
