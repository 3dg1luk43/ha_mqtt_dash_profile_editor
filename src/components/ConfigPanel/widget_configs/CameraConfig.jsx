export default function CameraConfig({ widget, onChange }) {
  const overlay = widget.overlay_button ?? {};

  function setOverlay(field, value) {
    onChange({ overlay_button: { ...overlay, [field]: value } });
  }

  return (
    <div>
      <h3 style={sectionTitle}>Camera</h3>
      <div style={{ marginBottom: 8 }}>
        <label style={labelStyle}>Stream URL</label>
        <input
          type="text"
          value={widget.stream_url ?? ''}
          onChange={(e) => onChange({ stream_url: e.target.value })}
          placeholder="http://..."
          style={inputStyle}
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>Scale mode</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {['fit', 'stretch'].map((m) => (
            <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
              <input
                type="radio"
                name="scale_mode"
                value={m}
                checked={(widget.scale_mode ?? 'fit') === m}
                onChange={() => onChange({ scale_mode: m })}
              />
              {m}
            </label>
          ))}
        </div>
      </div>

      <h4 style={{ fontSize: 12, fontWeight: 600, color: '#444', margin: '0 0 6px' }}>Overlay Button (optional)</h4>
      <div style={{ marginBottom: 6 }}>
        <label style={labelStyle}>Button label</label>
        <input type="text" value={overlay.label ?? ''} onChange={(e) => setOverlay('label', e.target.value)} placeholder="e.g. Light" style={inputStyle} />
      </div>
      <div style={{ marginBottom: 6 }}>
        <label style={labelStyle}>Entity ID</label>
        <input type="text" value={overlay.entity_id ?? ''} onChange={(e) => setOverlay('entity_id', e.target.value)} placeholder="light.camera_light" style={inputStyle} />
      </div>
      <div style={{ marginBottom: 6 }}>
        <label style={labelStyle}>Action</label>
        <select value={overlay.action ?? 'toggle'} onChange={(e) => setOverlay('action', e.target.value)} style={inputStyle}>
          <option value="toggle">toggle</option>
          <option value="turn_on">turn_on</option>
          <option value="turn_off">turn_off</option>
        </select>
      </div>
    </div>
  );
}

const sectionTitle = { fontSize: 13, fontWeight: 600, color: '#333', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' };
const labelStyle = { fontSize: 11, color: '#666', display: 'block', marginBottom: 2 };
const inputStyle = { fontSize: 12, padding: '4px 6px', border: '1px solid #ddd', borderRadius: 4, background: '#fafafa', width: '100%', boxSizing: 'border-box' };
