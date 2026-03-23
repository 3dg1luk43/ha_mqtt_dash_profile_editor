import { useState, useRef } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { buildProfile, parseProfile, profileToState } from '../../utils/profileExport';

export default function ImportExportModal({ mode, onClose }) {
  // mode: 'import' | 'export'
  const state = useEditorStore();
  const { setWidgets, setGridConfig, setBanner } = useEditorStore();

  const [tab, setTab] = useState('paste'); // 'paste' | 'file'
  const [pasteValue, setPasteValue] = useState('');
  const [parseError, setParseError] = useState('');
  const [copyDone, setCopyDone] = useState(false);
  const fileInputRef = useRef(null);

  const profileJson = mode === 'export' ? JSON.stringify(buildProfile(state), null, 2) : '';

  function handleCopy() {
    navigator.clipboard.writeText(profileJson).then(() => {
      setCopyDone(true);
      setTimeout(() => setCopyDone(false), 2000);
    });
  }

  function handleDownload() {
    const blob = new Blob([profileJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mqtt_dash_profile.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function doImport(jsonStr) {
    const result = parseProfile(jsonStr);
    if (!result.ok) { setParseError(result.error); return; }
    const s = profileToState(result.data);
    setGridConfig(s.grid);
    setWidgets(s.widgets);
    setBanner(s.banner ?? '');
    setParseError('');
    onClose();
  }

  function handlePasteImport() {
    doImport(pasteValue);
  }

  function handleFileImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => doImport(ev.target.result);
    reader.readAsText(file);
  }

  return (
    <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={modalStyle}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>
            {mode === 'export' ? '⬇ Export Profile' : '⬆ Import Profile'}
          </h2>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 20, cursor: 'pointer', color: '#666' }}>×</button>
        </div>

        {mode === 'export' && (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <button onClick={handleCopy} style={actionBtn(copyDone ? '#4caf50' : '#1a237e')}>
                {copyDone ? '✓ Copied!' : '📋 Copy JSON'}
              </button>
              <button onClick={handleDownload} style={actionBtn('#37474f')}>
                ⬇ Download .json
              </button>
            </div>
            <pre style={{
              background: '#1e1e2e',
              color: '#cdd6f4',
              padding: 12,
              borderRadius: 6,
              fontSize: 11,
              overflow: 'auto',
              maxHeight: 400,
              margin: 0,
              fontFamily: 'monospace',
            }}>
              {profileJson}
            </pre>
          </>
        )}

        {mode === 'import' && (
          <>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 0, marginBottom: 12, borderBottom: '1px solid #e0e0e0' }}>
              {[['paste', '📋 Paste JSON'], ['file', '📁 Load file']].map(([t, lbl]) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    padding: '6px 16px',
                    fontSize: 13,
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    borderBottom: tab === t ? '2px solid #1a237e' : '2px solid transparent',
                    color: tab === t ? '#1a237e' : '#666',
                    fontWeight: tab === t ? 600 : 400,
                  }}
                >
                  {lbl}
                </button>
              ))}
            </div>

            {tab === 'paste' && (
              <>
                <textarea
                  value={pasteValue}
                  onChange={(e) => setPasteValue(e.target.value)}
                  placeholder='Paste profile JSON here...'
                  rows={10}
                  style={{ width: '100%', boxSizing: 'border-box', fontSize: 12, padding: 8, border: '1px solid #ddd', borderRadius: 4, fontFamily: 'monospace', resize: 'vertical' }}
                />
                <button onClick={handlePasteImport} style={{ ...actionBtn('#1a237e'), marginTop: 8 }}>
                  Import
                </button>
              </>
            )}

            {tab === 'file' && (
              <div style={{ textAlign: 'center', padding: 24 }}>
                <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileImport} style={{ display: 'none' }} />
                <button onClick={() => fileInputRef.current?.click()} style={actionBtn('#37474f')}>
                  📁 Choose JSON file
                </button>
              </div>
            )}

            {parseError && (
              <p style={{ color: '#ef5350', fontSize: 12, marginTop: 8, background: '#fff5f5', padding: '6px 8px', borderRadius: 4 }}>
                Error: {parseError}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalStyle = {
  background: '#fff',
  borderRadius: 10,
  padding: 24,
  width: 560,
  maxWidth: '90vw',
  maxHeight: '90vh',
  overflow: 'auto',
  boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
};

function actionBtn(color) {
  return {
    padding: '7px 14px',
    fontSize: 13,
    fontWeight: 500,
    borderRadius: 5,
    border: 'none',
    background: color,
    color: '#fff',
    cursor: 'pointer',
  };
}
