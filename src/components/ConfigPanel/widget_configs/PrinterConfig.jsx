import EntityAutocomplete from '../EntityAutocomplete';

const ENTITY_FIELDS = [
  { key: 'nozzle_entity', label: 'Nozzle temp entity' },
  { key: 'bed_entity', label: 'Bed temp entity' },
  { key: 'time_entity', label: 'Print time entity' },
  { key: 'progress_entity', label: 'Progress entity' },
  { key: 'status_entity', label: 'Status entity' },
];

const ALL_ROWS = ['nozzle', 'bed', 'time', 'progress', 'status'];

export default function PrinterConfig({ widget, onChange }) {
  const visible = widget.visible_rows ?? ALL_ROWS;

  function toggleRow(row) {
    const next = visible.includes(row)
      ? visible.filter((r) => r !== row)
      : [...visible, row];
    onChange({ visible_rows: next });
  }

  function moveRow(row, delta) {
    const idx = visible.indexOf(row);
    const next = [...visible];
    const target = idx + delta;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange({ visible_rows: next });
  }

  const unchecked = ALL_ROWS.filter(r => !visible.includes(r));

  return (
    <div>
      <h3 style={sectionTitle}>3D Printer</h3>

      {ENTITY_FIELDS.map(({ key, label }) => (
        <div key={key} style={{ marginBottom: 6 }}>
          <label style={labelStyle}>{label}</label>
          <EntityAutocomplete
            value={widget[key] ?? ''}
            onChange={(v) => onChange({ [key]: v })}
            placeholder="sensor...."
          />
        </div>
      ))}

      <div style={{ marginBottom: 8 }}>
        <label style={labelStyle}>Progress unit</label>
        <input
          type="text"
          value={widget.progress_unit ?? ''}
          onChange={(e) => onChange({ progress_unit: e.target.value })}
          placeholder="e.g. %"
          style={{ ...inputStyle, width: 64 }}
        />
      </div>

      <div>
        <label style={labelStyle}>Visible rows <span style={{ color: '#aaa', fontWeight: 400 }}>(drag order = display order)</span></label>

        {/* Visible rows — ordered, with move buttons */}
        {visible.map((r, i) => (
          <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
            <button onClick={() => moveRow(r, -1)} disabled={i === 0} style={arrowBtn}>↑</button>
            <button onClick={() => moveRow(r, 1)} disabled={i === visible.length - 1} style={arrowBtn}>↓</button>
            <span style={{ flex: 1, fontSize: 12, textTransform: 'capitalize', color: '#333' }}>{r}</span>
            <button onClick={() => toggleRow(r)} style={removeBtn} title="Remove">×</button>
          </div>
        ))}

        {/* Hidden rows — add back */}
        {unchecked.length > 0 && (
          <div style={{ marginTop: 4, borderTop: '1px solid #eee', paddingTop: 4 }}>
            {unchecked.map(r => (
              <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                <span style={{ width: 34 }} />
                <span style={{ flex: 1, fontSize: 12, textTransform: 'capitalize', color: '#bbb' }}>{r}</span>
                <button onClick={() => toggleRow(r)} style={addBtn} title="Add">+</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const sectionTitle = { fontSize: 13, fontWeight: 600, color: '#333', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' };
const labelStyle = { fontSize: 11, color: '#666', display: 'block', marginBottom: 4 };
const inputStyle = { fontSize: 12, padding: '4px 6px', border: '1px solid #ddd', borderRadius: 4, background: '#fafafa', width: '100%', boxSizing: 'border-box' };
const arrowBtn = { padding: '1px 5px', fontSize: 11, border: '1px solid #ddd', borderRadius: 3, background: '#f5f5f5', cursor: 'pointer', lineHeight: 1.4 };
const removeBtn = { padding: '1px 6px', fontSize: 13, border: 'none', background: 'none', cursor: 'pointer', color: '#ccc', lineHeight: 1 };
const addBtn = { padding: '1px 6px', fontSize: 13, border: '1px solid #ddd', borderRadius: 3, background: '#f5f5f5', cursor: 'pointer', color: '#888', lineHeight: 1.4 };
