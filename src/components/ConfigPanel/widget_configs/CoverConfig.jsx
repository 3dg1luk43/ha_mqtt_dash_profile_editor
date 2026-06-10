import EntityAutocomplete from '../EntityAutocomplete';

const CONTROL_OPTIONS = [
  ['buttons', 'Open / Stop / Close buttons'],
  ['slider', 'Position slider'],
  ['presets', 'Position preset buttons'],
  ['tilt', 'Tilt controls'],
];

const DEFAULT_PRESETS = [0, 25, 75, 100];

export default function CoverConfig({ widget, onChange }) {
  const controls = Array.isArray(widget.cover_controls) ? widget.cover_controls : [];
  const layout = widget.cover_layout || 'auto';
  const presets = Array.isArray(widget.position_presets) ? widget.position_presets : DEFAULT_PRESETS;

  function toggleControl(key, on) {
    const next = on ? [...new Set([...controls, key])] : controls.filter((c) => c !== key);
    onChange({ cover_controls: next });
  }

  function setPresetsFromText(text) {
    const vals = text
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => Number.isFinite(n))
      .map((n) => Math.max(0, Math.min(100, n)));
    onChange({ position_presets: vals });
  }

  const presetsEnabled = controls.includes('presets');

  return (
    <div>
      <h3 style={sectionTitle}>Cover</h3>
      <p style={{ fontSize: 11, color: '#888', marginBottom: 10, lineHeight: 1.4 }}>
        Binds to a <code>cover.*</code> entity (blinds, shades, garage doors). The
        entity must be in <code>mirror_entities</code> (or use auto-mirror).
      </p>

      <div style={{ marginBottom: 10 }}>
        <label style={labelStyle}>Cover entity</label>
        <EntityAutocomplete
          value={widget.entity_id ?? ''}
          onChange={(v) => onChange({ entity_id: v })}
          placeholder="cover.bedroom_blinds"
        />
      </div>

      <label style={labelStyle}>Controls</label>
      <p style={{ fontSize: 10, color: '#999', margin: '0 0 6px', lineHeight: 1.4 }}>
        Leave all unchecked to <strong>auto-detect</strong> from the cover&apos;s
        <code> supported_features</code>. Check options to force a specific set — they
        stack and lay out elastically (horizontal in wide tiles, vertical in tall ones).
      </p>
      <div style={{ marginBottom: 10 }}>
        {CONTROL_OPTIONS.map(([key, lbl]) => (
          <label key={key} style={checkRow}>
            <input
              type="checkbox"
              checked={controls.includes(key)}
              onChange={(e) => toggleControl(key, e.target.checked)}
              style={{ width: 15, height: 15 }}
            />
            <span style={{ fontSize: 12, color: '#444' }}>{lbl}</span>
          </label>
        ))}
      </div>

      <div style={{ marginBottom: 10 }}>
        <label style={labelStyle}>Button layout</label>
        <select
          value={layout}
          onChange={(e) => onChange({ cover_layout: e.target.value })}
          style={selectStyle}
        >
          <option value="auto">Auto (from tile shape)</option>
          <option value="horizontal">Horizontal</option>
          <option value="vertical">Vertical</option>
        </select>
      </div>

      {presetsEnabled && (
        <div style={{ marginBottom: 8 }}>
          <label style={labelStyle}>Position presets (%)</label>
          <input
            type="text"
            defaultValue={presets.join(', ')}
            onBlur={(e) => setPresetsFromText(e.target.value)}
            placeholder="0, 25, 75, 100"
            style={inputStyle}
          />
          <p style={{ fontSize: 10, color: '#999', margin: '3px 0 0' }}>
            Comma-separated percentages (0–100). Each becomes a button that sets the cover position.
          </p>
        </div>
      )}
    </div>
  );
}

const sectionTitle = { fontSize: 13, fontWeight: 600, color: '#333', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' };
const labelStyle = { fontSize: 11, color: '#666', display: 'block', marginBottom: 2 };
const checkRow = { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, cursor: 'pointer' };
const selectStyle = { width: '100%', padding: '5px 6px', fontSize: 12, border: '1px solid #ccc', borderRadius: 4, boxSizing: 'border-box' };
const inputStyle = { width: '100%', padding: '5px 6px', fontSize: 12, border: '1px solid #ccc', borderRadius: 4, boxSizing: 'border-box' };
