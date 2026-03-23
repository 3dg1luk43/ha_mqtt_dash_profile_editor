function fmtSeconds(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m ${sec}s`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

export default function TimerConfig({ widget, onChange }) {
  const secs = widget.default_seconds ?? 300;

  function num(val) {
    const v = parseInt(val, 10);
    return isNaN(v) || v < 1 ? 1 : v;
  }

  return (
    <div>
      <h3 style={sectionTitle}>Timer</h3>
      <p style={{ fontSize: 11, color: '#888', marginBottom: 10, lineHeight: 1.4 }}>
        Local countdown — no entity or MQTT required. State (running/paused) persists
        across page switches and profile reloads via the widget <code>id</code>.
      </p>

      <div style={{ marginBottom: 8 }}>
        <label style={labelStyle}>Default duration (seconds)</label>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input
            type="number"
            min={1}
            value={secs}
            onChange={(e) => onChange({ default_seconds: num(e.target.value) })}
            style={{ ...inputStyle, width: 80 }}
          />
          <span style={{ fontSize: 12, color: '#888' }}>= {fmtSeconds(secs)}</span>
        </div>
      </div>

      {/* Quick-set presets */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {[[30,'30s'],[60,'1m'],[180,'3m'],[300,'5m'],[600,'10m'],[900,'15m'],[1800,'30m'],[3600,'1h']].map(([v, lbl]) => (
          <button
            key={v}
            onClick={() => onChange({ default_seconds: v })}
            style={{
              fontSize: 11,
              padding: '2px 8px',
              border: '1px solid #ddd',
              borderRadius: 3,
              background: secs === v ? '#1a237e' : '#f5f5f5',
              color: secs === v ? '#fff' : '#555',
              cursor: 'pointer',
            }}
          >
            {lbl}
          </button>
        ))}
      </div>
    </div>
  );
}

const sectionTitle = { fontSize: 13, fontWeight: 600, color: '#333', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' };
const labelStyle = { fontSize: 11, color: '#666', display: 'block', marginBottom: 2 };
const inputStyle = { fontSize: 12, padding: '4px 6px', border: '1px solid #ddd', borderRadius: 4, background: '#fafafa', boxSizing: 'border-box' };
