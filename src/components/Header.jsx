import { useState } from 'react';
import { useEditorStore } from '../store/editorStore';

export default function Header({ onImport, onExport, onHelp }) {
  const { pages, device, banner, reset, undo, redo, history, future } = useEditorStore();
  const widgetCount = pages?.reduce((n, p) => n + (p.widgets?.length ?? 0), 0) ?? 0;
  const [showReset, setShowReset] = useState(false);

  function handleReset() {
    if (showReset) { reset(); setShowReset(false); }
    else setShowReset(true);
  }

  return (
    <header style={{
      height: 48,
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      background: '#1a237e',
      color: '#fff',
      gap: 12,
      flexShrink: 0,
      zIndex: 100,
    }}>
      <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em', marginRight: 8 }}>
        MQTTDash Profile Editor
      </span>

      <span style={{ fontSize: 12, color: '#90caf9', flex: 1 }}>
        {widgetCount} widget{widgetCount !== 1 ? 's' : ''}
        {device && <> · {device.name}</>}
      </span>

      {/* Undo/Redo */}
      <button
        onClick={undo}
        disabled={history?.length === 0}
        title="Undo (Ctrl+Z)"
        style={btnStyle(history?.length > 0)}
      >↩ Undo</button>
      <button
        onClick={redo}
        disabled={future?.length === 0}
        title="Redo (Ctrl+Y)"
        style={btnStyle(future?.length > 0)}
      >↪ Redo</button>

      <div style={{ width: 1, height: 24, background: '#3949ab' }} />

      <button onClick={onImport} style={btnStyle(true)}>⬆ Import</button>
      <button onClick={onExport} style={btnStyle(true, '#4caf50')}>⬇ Export</button>

      <div style={{ width: 1, height: 24, background: '#3949ab' }} />

      <button onClick={onHelp} title="Help / Tutorial" style={btnStyle(true, '#5c6bc0')}>? Help</button>

      <div style={{ width: 1, height: 24, background: '#3949ab' }} />

      <button
        onClick={handleReset}
        onBlur={() => setShowReset(false)}
        style={btnStyle(true, showReset ? '#ef5350' : undefined)}
        title={showReset ? 'Click again to confirm reset' : 'New (reset all)'}
      >
        {showReset ? '⚠ Confirm Reset' : '✕ New'}
      </button>
    </header>
  );
}

function btnStyle(enabled, accent) {
  return {
    padding: '4px 10px',
    fontSize: 12,
    fontWeight: 500,
    borderRadius: 4,
    border: 'none',
    background: accent ? accent : enabled ? '#3949ab' : '#283593',
    color: enabled ? '#fff' : '#7986cb',
    cursor: enabled ? 'pointer' : 'default',
    opacity: enabled ? 1 : 0.5,
    transition: 'background 0.15s',
  };
}
