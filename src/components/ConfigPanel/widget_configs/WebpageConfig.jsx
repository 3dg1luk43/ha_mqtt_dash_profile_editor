export default function WebpageConfig({ widget, onChange }) {
  return (
    <div>
      <h3 style={sectionTitle}>Webpage</h3>
      <p style={{ fontSize: 11, color: '#888', marginBottom: 10, lineHeight: 1.4 }}>
        Embeds a web page inside the tile. SSL certificate errors are silently bypassed —
        local HTTPS servers without a valid cert work fine.
      </p>
      <div style={{ marginBottom: 8 }}>
        <label style={labelStyle}>URL</label>
        <input
          type="text"
          value={widget.stream_url ?? ''}
          onChange={(e) => onChange({ stream_url: e.target.value })}
          placeholder="http://192.168.1.100/page"
          style={inputStyle}
        />
      </div>
    </div>
  );
}

const sectionTitle = { fontSize: 13, fontWeight: 600, color: '#333', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' };
const labelStyle = { fontSize: 11, color: '#666', display: 'block', marginBottom: 2 };
const inputStyle = { fontSize: 12, padding: '4px 6px', border: '1px solid #ddd', borderRadius: 4, background: '#fafafa', width: '100%', boxSizing: 'border-box' };
