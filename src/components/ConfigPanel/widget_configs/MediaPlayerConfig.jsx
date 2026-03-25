import EntityAutocomplete from '../EntityAutocomplete';

export default function MediaPlayerConfig({ widget, onChange }) {
  return (
    <div>
      <h3 style={sectionTitle}>Media Player</h3>
      <p style={{ fontSize: 11, color: '#888', marginBottom: 10, lineHeight: 1.4 }}>
        Binds to a <code>media_player.*</code> entity. Displays song title, artist,
        play/pause, next/previous controls, and a seekable progress bar. The entity must
        be in <code>mirror_entities</code> (or use auto-mirror).
      </p>

      <div style={{ marginBottom: 8 }}>
        <label style={labelStyle}>Media player entity</label>
        <EntityAutocomplete
          value={widget.entity_id ?? ''}
          onChange={(v) => onChange({ entity_id: v })}
          placeholder="media_player.living_room"
        />
      </div>
    </div>
  );
}

const sectionTitle = { fontSize: 13, fontWeight: 600, color: '#333', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' };
const labelStyle = { fontSize: 11, color: '#666', display: 'block', marginBottom: 2 };
