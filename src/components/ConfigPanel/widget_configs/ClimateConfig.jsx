import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';

const ALL_MODES = ['off', 'heat', 'cool', 'auto', 'fan_only', 'dry'];

export default function ClimateConfig({ widget, onChange }) {
  const modes = widget.modes ?? [];
  const state_formats = widget.state_formats ?? {};
  const [openPicker, setOpenPicker] = useState(null); // `${mode}_${field}`

  function toggleMode(mode) {
    const next = modes.includes(mode) ? modes.filter((m) => m !== mode) : [...modes, mode];
    onChange({ modes: next });
  }

  function setStateFormat(mode, field, value) {
    onChange({
      state_formats: {
        ...state_formats,
        [mode]: { ...(state_formats[mode] ?? {}), [field]: value },
      },
    });
  }

  return (
    <div>
      <h3 style={sectionTitle}>Climate</h3>
      <label style={labelStyle}>Enabled modes</label>
      {ALL_MODES.map((m) => (
        <div key={m} style={{ marginBottom: 6 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <input type="checkbox" checked={modes.includes(m)} onChange={() => toggleMode(m)} />
            <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{m}</span>
          </label>
          {modes.includes(m) && (
            <div style={{ display: 'flex', gap: 8, marginTop: 4, paddingLeft: 22 }}>
              {['bgColor', 'textColor'].map((field) => {
                const pickerKey = `${m}_${field}`;
                const color = state_formats[m]?.[field] || '';
                return (
                  <div key={field} style={{ position: 'relative' }}>
                    <label style={{ fontSize: 10, color: '#888', display: 'block', marginBottom: 2 }}>{field === 'bgColor' ? 'BG' : 'Text'}</label>
                    <button
                      onClick={() => setOpenPicker(openPicker === pickerKey ? null : pickerKey)}
                      style={{ width: 28, height: 28, borderRadius: 4, border: '1px solid #ccc', background: color || '#ffffff', cursor: 'pointer' }}
                      title={color || 'not set'}
                    />
                    {openPicker === pickerKey && (
                      <div style={{ position: 'absolute', zIndex: 200, top: '100%', left: 0, background: '#fff', borderRadius: 8, boxShadow: '0 4px 20px #0002', padding: 8 }}>
                        <HexColorPicker color={color || '#ffffff'} onChange={(v) => setStateFormat(m, field, v)} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const sectionTitle = { fontSize: 13, fontWeight: 600, color: '#333', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' };
const labelStyle = { fontSize: 11, color: '#666', display: 'block', marginBottom: 4 };
