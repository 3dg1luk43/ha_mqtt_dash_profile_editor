import EntityAutocomplete from '../EntityAutocomplete';

export default function CoverConfig({ widget, onChange }) {
  return (
    <div>
      <h3 style={sectionTitle}>Cover</h3>
      <p style={{ fontSize: 11, color: '#888', marginBottom: 10, lineHeight: 1.4 }}>
        Binds to a <code>cover.*</code> entity (blinds, shades, garage doors). The
        controls shown on the tile adapt to the entity&apos;s <code>supported_features</code>:
        open/close, a stop button (when supported), a position slider (when the cover
        reports position), and tilt controls (when supported). Enable
        <em> Protected</em> below to require a confirmation tap — recommended for garage
        doors. The entity must be in <code>mirror_entities</code> (or use auto-mirror).
      </p>

      <div style={{ marginBottom: 8 }}>
        <label style={labelStyle}>Cover entity</label>
        <EntityAutocomplete
          value={widget.entity_id ?? ''}
          onChange={(v) => onChange({ entity_id: v })}
          placeholder="cover.bedroom_blinds"
        />
      </div>
    </div>
  );
}

const sectionTitle = { fontSize: 13, fontWeight: 600, color: '#333', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' };
const labelStyle = { fontSize: 11, color: '#666', display: 'block', marginBottom: 2 };
