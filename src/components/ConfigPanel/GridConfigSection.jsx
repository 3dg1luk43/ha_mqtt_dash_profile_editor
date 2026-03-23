import { useEditorStore } from '../../store/editorStore';

export default function GridConfigSection() {
  const { grid, banner, setGridConfig } = useEditorStore();
  // banner stored in top-level store
  const setBanner = useEditorStore((s) => s.setBanner);

  function num(val, fallback = 0) {
    const v = parseInt(val, 10);
    return isNaN(v) ? fallback : v;
  }

  return (
    <div>
      <h3 style={sectionTitle}>Grid Settings</h3>
      <Field label="Banner text">
        <input
          type="text"
          value={banner ?? ''}
          onChange={(e) => setBanner(e.target.value)}
          style={inputStyle}
          placeholder="e.g. Main Panel"
        />
      </Field>
      <Field label="Columns">
        <input
          type="number"
          min={1}
          max={20}
          value={grid.columns}
          onChange={(e) => setGridConfig({ columns: num(e.target.value, 1) })}
          style={{ ...inputStyle, width: 64 }}
        />
      </Field>
      <Field label="Cell width (px)">
        <input
          type="number"
          min={40}
          value={grid.widget_dimensions[0]}
          onChange={(e) => setGridConfig({ widget_dimensions: [num(e.target.value, 40), grid.widget_dimensions[1]] })}
          style={{ ...inputStyle, width: 72 }}
        />
      </Field>
      <Field label="Cell height (px)">
        <input
          type="number"
          min={40}
          value={grid.widget_dimensions[1]}
          onChange={(e) => setGridConfig({ widget_dimensions: [grid.widget_dimensions[0], num(e.target.value, 40)] })}
          style={{ ...inputStyle, width: 72 }}
        />
      </Field>
      <Field label="Margin X (px)">
        <input
          type="number"
          min={0}
          value={grid.widget_margins[0]}
          onChange={(e) => setGridConfig({ widget_margins: [num(e.target.value), grid.widget_margins[1]] })}
          style={{ ...inputStyle, width: 64 }}
        />
      </Field>
      <Field label="Margin Y (px)">
        <input
          type="number"
          min={0}
          value={grid.widget_margins[1]}
          onChange={(e) => setGridConfig({ widget_margins: [grid.widget_margins[0], num(e.target.value)] })}
          style={{ ...inputStyle, width: 64 }}
        />
      </Field>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 8 }}>
      <label style={{ fontSize: 12, color: '#555', flexShrink: 0 }}>{label}</label>
      {children}
    </div>
  );
}

const sectionTitle = { fontSize: 13, fontWeight: 600, color: '#333', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.05em' };
const inputStyle = { fontSize: 12, padding: '4px 6px', border: '1px solid #ddd', borderRadius: 4, background: '#fafafa', width: '100%' };
