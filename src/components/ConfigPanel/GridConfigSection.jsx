import { useEditorStore } from '../../store/editorStore';

export default function GridConfigSection() {
  const { grid, banner, setBanner, setGridConfig, device, orientation } = useEditorStore();

  const [pw, ph] = device.pixels;
  const [screenW, screenH] = orientation === 'landscape' ? [ph, pw] : [pw, ph];

  const autoW = Math.floor(screenW / grid.columns);
  const autoH = Math.floor(screenH / grid.columns); // just for reference
  const colsFit = Math.floor(screenW / grid.widget_dimensions[0]);
  const rowsFit = Math.floor(screenH / grid.widget_dimensions[1]);

  function num(val, fallback = 0) {
    const v = parseInt(val, 10);
    return isNaN(v) ? fallback : v;
  }

  function refillWidth() {
    setGridConfig({ widget_dimensions: [autoW, grid.widget_dimensions[1]] });
  }

  return (
    <div>
      <h3 style={sectionTitle}>Grid Settings</h3>

      {/* Screen info */}
      <div style={{ background: '#f0f4ff', borderRadius: 5, padding: '6px 8px', marginBottom: 10, fontSize: 11, color: '#444' }}>
        Screen: <strong>{screenW}×{screenH}px</strong>
        {' '} · fits <strong>{colsFit} cols × {rowsFit} rows</strong> at current cell size
      </div>

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
          max={40}
          value={grid.columns}
          onChange={(e) => setGridConfig({ columns: num(e.target.value, 1) })}
          style={{ ...inputStyle, width: 64 }}
        />
      </Field>

      <Field label="Cell width (px)">
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <input
            type="number"
            min={1}
            value={grid.widget_dimensions[0]}
            onChange={(e) => setGridConfig({ widget_dimensions: [num(e.target.value, 1), grid.widget_dimensions[1]] })}
            style={{ ...inputStyle, width: 70 }}
          />
          <button
            onClick={refillWidth}
            title={`Set to ${autoW}px to fill screen width across ${grid.columns} columns`}
            style={{ fontSize: 10, padding: '3px 6px', border: '1px solid #ccc', borderRadius: 4, background: '#fff', cursor: 'pointer', whiteSpace: 'nowrap', color: '#555' }}
          >
            ↔ Fill ({autoW})
          </button>
        </div>
      </Field>

      <Field label="Cell height (px)">
        <input
          type="number"
          min={1}
          value={grid.widget_dimensions[1]}
          onChange={(e) => setGridConfig({ widget_dimensions: [grid.widget_dimensions[0], num(e.target.value, 1)] })}
          style={{ ...inputStyle, width: 70 }}
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
