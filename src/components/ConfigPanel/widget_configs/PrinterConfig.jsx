import EntityAutocomplete from '../EntityAutocomplete';

const ENTITY_FIELDS = [
  { key: 'nozzle_entity', label: 'Nozzle temp entity' },
  { key: 'bed_entity', label: 'Bed temp entity' },
  { key: 'time_entity', label: 'Print time entity' },
  { key: 'progress_entity', label: 'Progress entity' },
  { key: 'status_entity', label: 'Status entity' },
];

const VISIBLE_ROW_OPTIONS = ['nozzle', 'bed', 'time', 'progress', 'status'];

export default function PrinterConfig({ widget, onChange }) {
  const visible = widget.visible_rows ?? VISIBLE_ROW_OPTIONS;

  function toggleRow(row) {
    const next = visible.includes(row) ? visible.filter((r) => r !== row) : [...visible, row];
    onChange({ visible_rows: next });
  }

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
        <label style={labelStyle}>Visible rows</label>
        {VISIBLE_ROW_OPTIONS.map((r) => (
          <label key={r} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, fontSize: 12, textTransform: 'capitalize' }}>
            <input type="checkbox" checked={visible.includes(r)} onChange={() => toggleRow(r)} />
            {r}
          </label>
        ))}
      </div>
    </div>
  );
}

const sectionTitle = { fontSize: 13, fontWeight: 600, color: '#333', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' };
const labelStyle = { fontSize: 11, color: '#666', display: 'block', marginBottom: 2 };
const inputStyle = { fontSize: 12, padding: '4px 6px', border: '1px solid #ddd', borderRadius: 4, background: '#fafafa', width: '100%', boxSizing: 'border-box' };
