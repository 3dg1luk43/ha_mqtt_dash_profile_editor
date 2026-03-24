export default function LightConfig({ widget, onChange }) {
  // dimmable defaults to true when absent (iOS app default)
  const dimmable = widget.dimmable !== false;

  return (
    <div>
      <h3 style={sectionTitle}>Light</h3>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 8 }}>
        <label style={{ fontSize: 12, color: '#555', flexShrink: 0, minWidth: 70 }}>Dimmable</label>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            type="checkbox"
            checked={dimmable}
            onChange={(e) => onChange({ dimmable: e.target.checked })}
            style={{ width: 16, height: 16 }}
          />
          <span style={{ fontSize: 11, color: '#888' }}>Show brightness slider</span>
        </div>
      </div>
    </div>
  );
}

const sectionTitle = { fontSize: 13, fontWeight: 600, color: '#333', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.05em' };
