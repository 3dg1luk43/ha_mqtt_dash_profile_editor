import { useState } from 'react';

const STEPS = [
  {
    title: 'Welcome to MQTTDash Profile Editor',
    content: (
      <div>
        <p style={p}>
          A visual drag-and-drop editor for building <strong>Home Assistant MQTTDash</strong> dashboard profiles.
          Design your tablet layout here, export the JSON, and paste it straight into HA.
        </p>

        <div style={disclaimerBox}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6, color: '#1a237e' }}>
            🔒 Privacy — no backend, no tracking
          </div>
          <p style={{ ...p, margin: 0, color: '#333' }}>
            Everything runs <strong>entirely in your browser</strong>. No data is sent anywhere.
            Your widgets, grid settings, and entity list are saved to your browser's{' '}
            <strong>localStorage</strong> only — clearing browser data will erase them.
            Use <strong>Export → Download .json</strong> to back up your work.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
          {[
            ['🖱️', 'Drag & drop', 'Drag widget types onto the canvas. Move and resize freely.'],
            ['📱', 'Real resolution', 'Previews at actual device pixel dimensions — Retina included.'],
            ['⚙️', 'Full config', 'Per-widget properties, colors, entity IDs, and format options.'],
            ['⬇️', 'Export to HA', 'One-click JSON export ready for mqtt_dash.set_device_profile.'],
          ].map(([icon, title, desc]) => (
            <div key={title} style={featureCard}>
              <div style={{ fontSize: 20 }}>{icon}</div>
              <div style={{ fontWeight: 600, fontSize: 12, color: '#222' }}>{title}</div>
              <div style={{ fontSize: 11, color: '#777', lineHeight: 1.4 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    title: '1 — Select your device & orientation',
    content: (
      <div>
        <img src={null} alt="" style={{ display: 'none' }} />
        <p style={p}>
          Use the <strong>toolbar below the header</strong> to choose your iPad model. The canvas immediately
          updates to that device's physical pixel resolution — 768×1024 for 1× models,
          1536×2048 for Retina 2× models.
        </p>
        <StepBox icon="▯ / ▭" label="Portrait / Landscape toggle">
          Switch orientation at any time. Cell widths auto-recalculate to fill the new screen width.
        </StepBox>
        <StepBox icon="Custom" label="Custom resolution">
          Pick <strong>Custom</strong> in the dropdown and enter any W×H pixel dimensions — useful for
          non-standard screens.
        </StepBox>
        <StepBox icon="⚙ Grid (Config Panel)" label="Grid settings">
          Adjust <strong>columns</strong>, cell width & height (cells don't have to be squares), and margins.
          The <strong>↔ Fill</strong> button resets cell width to perfectly divide the screen.
        </StepBox>
      </div>
    ),
  },
  {
    title: '2 — Add & arrange widgets',
    content: (
      <div>
        <p style={p}>
          The <strong>Widget Library</strong> on the left lists all 13 supported widget types.
          Drag any widget from the palette onto the iPad canvas — it snaps to the nearest grid cell.
        </p>
        <StepBox icon="🖱️" label="Drag to place">
          Drag from the palette onto the canvas. The grid overlay shows cell boundaries as you hover.
        </StepBox>
        <StepBox icon="↔↕" label="Resize">
          Grab the <strong>bottom-right handle</strong> on any placed widget and drag to resize in whole-cell increments.
        </StepBox>
        <StepBox icon="✕" label="Delete">
          Hover a widget and click the <strong>× button</strong> in the top-right corner to remove it.
        </StepBox>
        <StepBox icon="🔴" label="Overlap warning">
          Widgets with a <strong>red border</strong> overlap another widget — fix by moving or resizing.
        </StepBox>
        <div style={tipBox}>
          <strong>Ctrl+Z</strong> undoes the last action. <strong>Ctrl+Y</strong> redoes it. Up to 50 steps.
        </div>
      </div>
    ),
  },
  {
    title: '3 — Configure widgets',
    content: (
      <div>
        <p style={p}>
          <strong>Click any widget</strong> on the canvas to select it. The right panel switches to that
          widget's configuration.
        </p>
        <StepBox icon="ID" label="Common fields">
          Set the widget <strong>ID</strong> (used in HA), display <strong>label</strong>,{' '}
          <strong>entity ID</strong>, grid position (x/y/w/h), and whether it's <em>protected</em>{' '}
          (requires long-press to activate).
        </StepBox>
        <StepBox icon="🎨" label="Format">
          Control horizontal and vertical text alignment, text size, and up to 6 colors
          (text, background, on/off variants). Click the color swatch to open an inline picker.
        </StepBox>
        <StepBox icon="🔧" label="Type-specific options">
          Each widget type shows only its own extra fields — e.g. Weather shows attribute
          checkboxes, Climate shows mode toggles with per-state colors, Camera shows stream URL.
        </StepBox>
        <div style={tipBox}>
          Click an empty area of the canvas to deselect — the right panel shows grid settings.
        </div>
      </div>
    ),
  },
  {
    title: '4 — Entity list & autocomplete',
    content: (
      <div>
        <p style={p}>
          Build a personal list of your Home Assistant entity IDs. These appear as autocomplete
          suggestions on every entity field in the editor — no connection to HA required.
        </p>
        <StepBox icon="🗂" label="Open the Entities tab">
          Click on an empty area of the canvas, then in the right panel click the{' '}
          <strong>Entities</strong> tab.
        </StepBox>
        <StepBox icon="📋" label="Bulk add (recommended)">
          In HA, go to <strong>Developer Tools → States</strong>, select all entity IDs, copy and paste
          them into the <strong>Bulk add</strong> tab. One entity per line or comma-separated — the
          editor de-duplicates automatically.
        </StepBox>
        <StepBox icon="🔤" label="Autocomplete">
          Once entities are in your list, any entity ID input shows matching suggestions as you type.
          Entities are grouped by domain (light, switch, sensor…).
        </StepBox>
        <div style={tipBox}>
          Your entity list is saved to localStorage and persists across page refreshes.
        </div>
      </div>
    ),
  },
  {
    title: '5 — Export & apply to HA',
    content: (
      <div>
        <p style={p}>
          When your layout is ready, click <strong>Export</strong> in the header.
        </p>
        <StepBox icon="📋" label="Copy or download">
          Use <strong>Copy JSON</strong> to copy to clipboard, or <strong>Download .json</strong> to save a file.
          The JSON is in the flat format accepted by the HA integration.
        </StepBox>
        <StepBox icon="⬇️" label="Apply in Home Assistant">
          In HA go to <strong>Developer Tools → Services</strong>, call{' '}
          <code style={code}>mqtt_dash.set_device_profile</code> and paste the JSON as the{' '}
          <code style={code}>profile</code> field. The tablet updates immediately.
        </StepBox>
        <StepBox icon="🔗" label="Mirror entities checklist">
          Below the JSON preview, the export modal lists every entity ID used in your profile
          under <strong>HA Mirror entities</strong>. Add these to the integration's mirror
          configuration so their states are published over MQTT.
          This list is <em>not</em> included in the exported JSON — it's a reference only.
        </StepBox>
        <div style={tipBox}>
          Use <strong>Import</strong> to reload a saved profile back into the editor at any time.
        </div>
      </div>
    ),
  },
];

export default function WelcomeModal({ onClose }) {
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;

  return (
    <div style={overlay}>
      <div style={modal}>
        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 20 }}>
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              style={{
                width: i === step ? 20 : 8,
                height: 8,
                borderRadius: 4,
                border: 'none',
                background: i === step ? '#1a237e' : '#d0d5e8',
                cursor: 'pointer',
                padding: 0,
                transition: 'width 0.2s, background 0.2s',
              }}
            />
          ))}
        </div>

        {/* Step content */}
        <div style={{ minHeight: 340 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 14px', color: '#1a237e' }}>
            {STEPS[step].title}
          </h2>
          {STEPS[step].content}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            style={navBtn(false, step === 0)}
          >
            ← Back
          </button>

          <span style={{ fontSize: 11, color: '#bbb' }}>{step + 1} / {STEPS.length}</span>

          {isLast ? (
            <button onClick={onClose} style={navBtn(true, false)}>
              Get started →
            </button>
          ) : (
            <button onClick={() => setStep((s) => s + 1)} style={navBtn(true, false)}>
              Next →
            </button>
          )}
        </div>

        {/* Skip */}
        {!isLast && (
          <div style={{ textAlign: 'center', marginTop: 10 }}>
            <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 12, color: '#bbb', cursor: 'pointer' }}>
              Skip tutorial
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StepBox({ icon, label, children }) {
  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 10, padding: '8px 10px', background: '#f8f9ff', borderRadius: 6, border: '1px solid #e8ecf8' }}>
      <div style={{ fontSize: 16, flexShrink: 0, width: 24, textAlign: 'center', marginTop: 1 }}>{icon}</div>
      <div>
        <div style={{ fontWeight: 600, fontSize: 12, color: '#222', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 12, color: '#555', lineHeight: 1.5 }}>{children}</div>
      </div>
    </div>
  );
}

const p = { fontSize: 13, color: '#444', lineHeight: 1.6, margin: '0 0 12px' };
const disclaimerBox = { background: '#e8eaf6', border: '1px solid #c5cae9', borderRadius: 6, padding: '10px 12px', marginTop: 4 };
const featureCard = { background: '#f8f9ff', border: '1px solid #e8ecf8', borderRadius: 6, padding: '10px 10px', display: 'flex', flexDirection: 'column', gap: 4 };
const tipBox = { background: '#fff8e1', border: '1px solid #ffe082', borderRadius: 5, padding: '7px 10px', fontSize: 12, color: '#5d4037', marginTop: 10 };
const code = { background: '#f0f0f0', borderRadius: 3, padding: '1px 4px', fontFamily: 'monospace', fontSize: 12 };
const overlay = { position: 'fixed', inset: 0, background: 'rgba(10,15,40,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 };
const modal = { background: '#fff', borderRadius: 12, padding: 28, width: 540, maxWidth: '92vw', maxHeight: '92vh', overflow: 'auto', boxShadow: '0 12px 48px rgba(0,0,0,0.25)' };
function navBtn(primary, disabled) {
  return {
    padding: '7px 18px', fontSize: 13, fontWeight: 600, borderRadius: 6, border: 'none',
    background: disabled ? '#f0f0f0' : primary ? '#1a237e' : '#f0f0f0',
    color: disabled ? '#bbb' : primary ? '#fff' : '#444',
    cursor: disabled ? 'default' : 'pointer',
  };
}
