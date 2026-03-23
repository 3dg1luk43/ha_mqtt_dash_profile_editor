import { useEditorStore } from '../store/editorStore';
import { DEVICE_MODELS } from '../data/deviceModels';

export default function DeviceSelector() {
  const { device, setDevice, orientation, setOrientation } = useEditorStore();

  function handleModelChange(e) {
    const model = DEVICE_MODELS.find((m) => m.key === e.target.value);
    if (model) setDevice({ ...model });
  }

  function handleCustomPixels(axis, value) {
    const v = parseInt(value, 10);
    if (isNaN(v) || v < 1) return;
    const updated = { ...device };
    updated.pixels = axis === 'w'
      ? [v, device.pixels[1]]
      : [device.pixels[0], v];
    updated.scale = null; // unknown for custom
    setDevice(updated);
  }

  const [screenW, screenH] = orientation === 'landscape'
    ? [device.pixels[1], device.pixels[0]]
    : device.pixels;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px', background: '#f7f9fc', borderBottom: '1px solid #e8eaed', flexWrap: 'wrap' }}>
      <label style={{ fontSize: 12, color: '#666', fontWeight: 500 }}>Device:</label>
      <select
        value={device.key}
        onChange={handleModelChange}
        style={{ fontSize: 12, padding: '3px 6px', border: '1px solid #ccc', borderRadius: 4, background: '#fff' }}
      >
        {DEVICE_MODELS.map((m) => (
          <option key={m.key} value={m.key}>{m.name}</option>
        ))}
      </select>

      {/* Orientation toggle */}
      <div style={{ display: 'flex', gap: 2 }}>
        {[['portrait', '▯'], ['landscape', '▭']].map(([o, icon]) => (
          <button
            key={o}
            onClick={() => setOrientation(o)}
            title={o.charAt(0).toUpperCase() + o.slice(1)}
            style={{
              padding: '3px 8px',
              fontSize: 13,
              border: '1px solid #ccc',
              borderRadius: 4,
              background: orientation === o ? '#1a237e' : '#fff',
              color: orientation === o ? '#fff' : '#555',
              cursor: 'pointer',
            }}
          >
            {icon}
          </button>
        ))}
      </div>

      {device.key === 'custom' ? (
        <>
          <input
            type="number"
            value={device.pixels[0]}
            onChange={(e) => handleCustomPixels('w', e.target.value)}
            style={{ width: 64, fontSize: 12, padding: '2px 4px', border: '1px solid #ccc', borderRadius: 4 }}
            placeholder="Width px"
          />
          <span style={{ fontSize: 12, color: '#666' }}>×</span>
          <input
            type="number"
            value={device.pixels[1]}
            onChange={(e) => handleCustomPixels('h', e.target.value)}
            style={{ width: 64, fontSize: 12, padding: '2px 4px', border: '1px solid #ccc', borderRadius: 4 }}
            placeholder="Height px"
          />
          <span style={{ fontSize: 11, color: '#888' }}>px — {screenW}×{screenH} ({orientation})</span>
        </>
      ) : (
        <span style={{ fontSize: 11, color: '#888' }}>
          {screenW}×{screenH}px · {device.note}
        </span>
      )}
    </div>
  );
}
