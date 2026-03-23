import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';

export default function FormatFields({ format = {}, onChange }) {
  const [openPicker, setOpenPicker] = useState(null);

  function setFmt(key, value) {
    onChange({ ...format, [key]: value });
  }

  function clearFmt(key) {
    const next = { ...format };
    delete next[key];
    onChange(next);
  }

  const colorFields = [
    { key: 'textColor', label: 'Text color' },
    { key: 'bgColor', label: 'BG color' },
    { key: 'onTextColor', label: 'ON text' },
    { key: 'offTextColor', label: 'OFF text' },
    { key: 'onBgColor', label: 'ON bg' },
    { key: 'offBgColor', label: 'OFF bg' },
  ];

  return (
    <div style={{ marginTop: 8 }}>
      <h3 style={sectionTitle}>Format</h3>

      {/* Alignment */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>H-Align</label>
          <SegmentedControl
            value={format.align || 'center'}
            options={[['left', '←'], ['center', '↔'], ['right', '→']]}
            onChange={(v) => setFmt('align', v)}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>V-Align</label>
          <SegmentedControl
            value={format.vAlign || 'middle'}
            options={[['top', '↑'], ['middle', '↕'], ['bottom', '↓']]}
            onChange={(v) => setFmt('vAlign', v)}
          />
        </div>
      </div>

      {/* Text size */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <label style={labelStyle}>Text size</label>
        <input
          type="number"
          min={8}
          max={120}
          value={format.textSize ?? 16}
          onChange={(e) => setFmt('textSize', parseInt(e.target.value, 10) || 16)}
          style={{ ...inputStyle, width: 64 }}
        />
        <span style={{ fontSize: 12, color: '#888' }}>px</span>
        <span style={{ fontSize: format.textSize ?? 16, color: '#444', lineHeight: 1 }}>Aa</span>
      </div>

      {/* Wrap + maxLines */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 4 }}>
          <input
            type="checkbox"
            checked={format.wrap !== false}
            onChange={(e) => setFmt('wrap', e.target.checked)}
            style={{ width: 14, height: 14 }}
          />
          Wrap text
        </label>
        <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 4 }}>
          Max lines:
          <input
            type="number"
            min={1}
            value={format.maxLines ?? 1}
            onChange={(e) => setFmt('maxLines', parseInt(e.target.value, 10) || 1)}
            style={{ ...inputStyle, width: 48 }}
          />
        </label>
      </div>

      {/* Color pickers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {colorFields.map(({ key, label }) => (
          <ColorField
            key={key}
            label={label}
            value={format[key] || ''}
            isOpen={openPicker === key}
            onToggle={() => setOpenPicker(openPicker === key ? null : key)}
            onChange={(v) => setFmt(key, v)}
            onClear={() => clearFmt(key)}
          />
        ))}
      </div>
    </div>
  );
}

function ColorField({ label, value, isOpen, onToggle, onChange, onClear }) {
  return (
    <div style={{ position: 'relative' }}>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button
          onClick={onToggle}
          style={{
            width: 24,
            height: 24,
            borderRadius: 4,
            border: '1px solid #ccc',
            background: value || '#ffffff',
            cursor: 'pointer',
            flexShrink: 0,
          }}
          title={value || 'Not set'}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#rrggbb"
          style={{ ...inputStyle, width: '100%', flex: 1 }}
        />
        {value && (
          <button onClick={onClear} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#999', fontSize: 14, padding: 0 }}>×</button>
        )}
      </div>
      {isOpen && (
        <div style={{ position: 'absolute', zIndex: 200, top: '100%', left: 0, background: '#fff', borderRadius: 8, boxShadow: '0 4px 20px #0002', padding: 8 }}>
          <HexColorPicker color={value || '#ffffff'} onChange={onChange} />
          <button onClick={onClear} style={{ marginTop: 6, width: '100%', fontSize: 11, padding: '3px 0', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer', background: '#f5f5f5' }}>
            Clear
          </button>
        </div>
      )}
    </div>
  );
}

function SegmentedControl({ value, options, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {options.map(([v, lbl]) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          style={{
            flex: 1,
            padding: '3px 0',
            border: '1px solid #ccc',
            borderRadius: 4,
            background: value === v ? '#1a237e' : '#f5f5f5',
            color: value === v ? '#fff' : '#555',
            fontSize: 13,
            cursor: 'pointer',
          }}
          title={v}
        >
          {lbl}
        </button>
      ))}
    </div>
  );
}

const sectionTitle = { fontSize: 13, fontWeight: 600, color: '#333', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' };
const labelStyle = { fontSize: 11, color: '#666', display: 'block', marginBottom: 2 };
const inputStyle = { fontSize: 12, padding: '3px 5px', border: '1px solid #ddd', borderRadius: 4, background: '#fafafa', boxSizing: 'border-box' };
