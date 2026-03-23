import { useEditorStore, effectiveGrid } from '../../store/editorStore';
import { NAV_H, NAV_W } from '../Canvas/GridCanvas';

const NAVBAR_EDGES = ['top', 'bottom', 'left', 'right'];

export default function GridConfigSection() {
  const { grid, banner, setBanner, setGridConfig, setPageGrid, setNavbarEdge, navbar_edge, device, orientation, pages, activePageIndex } = useEditorStore();

  const activePage = pages[activePageIndex];
  const hasPageOverride = !!activePage?.grid;
  // The grid being edited: page override if active, else top-level
  const displayGrid = effectiveGrid(grid, activePage);

  const [pw, ph] = device.points ?? [768, 1024];
  const [screenW, screenH] = orientation === 'landscape' ? [ph, pw] : [pw, ph];

  // Subtract nav bar from usable content area
  const navIsVertical = navbar_edge === 'left' || navbar_edge === 'right';
  const contentW = navIsVertical ? screenW - NAV_W : screenW;
  const contentH = navIsVertical ? screenH : screenH - NAV_H;

  const autoW = Math.floor(contentW / displayGrid.columns);
  const autoH = Math.floor(contentH / displayGrid.columns); // square cells
  const colsFit = Math.floor(contentW / displayGrid.widget_dimensions[0]);
  const rowsFit = Math.floor(contentH / displayGrid.widget_dimensions[1]);

  // Detect overflow: any widget whose right/bottom edge exceeds content area
  const activeWidgets = activePage?.widgets ?? [];
  const cellW = displayGrid.widget_dimensions[0];
  const cellH = displayGrid.widget_dimensions[1];
  const overflowX = activeWidgets.some((w) => (w.x + w.w) * cellW > contentW);
  const overflowY = activeWidgets.some((w) => (w.y + w.h) * cellH > contentH);
  const hasOverflow = overflowX || overflowY;

  function fitToScreen() {
    // Compute cell size so all columns fit in contentW, and all used rows fit in contentH
    const maxRow = activeWidgets.reduce((m, w) => Math.max(m, w.y + w.h), displayGrid.columns);
    const fitW = Math.floor(contentW / displayGrid.columns);
    const fitH = Math.floor(contentH / maxRow);
    patchGrid({ widget_dimensions: [fitW, fitH] });
  }

  function num(val, fallback = 0) {
    const v = parseInt(val, 10);
    return isNaN(v) ? fallback : v;
  }

  function patchGrid(patch) {
    if (hasPageOverride) setPageGrid(activePageIndex, patch);
    else setGridConfig(patch);
  }

  function enablePageOverride() {
    // Copy top-level grid as page override
    setPageGrid(activePageIndex, { ...grid });
  }

  function disablePageOverride() {
    setPageGrid(activePageIndex, null);
  }

  return (
    <div>
      <h3 style={sectionTitle}>Grid Settings</h3>

      {/* Screen info */}
      <div style={{ background: '#f0f4ff', borderRadius: 5, padding: '6px 8px', marginBottom: 8, fontSize: 11, color: '#444' }}>
        Content area: <strong>{contentW}×{contentH}pt</strong>
        {navbar_edge !== 'none' && <span style={{ color: '#888' }}> (nav {navIsVertical ? `−${NAV_W}pt wide` : `−${NAV_H}pt tall`})</span>}
        <br />
        <strong>{colsFit} cols × {rowsFit} rows</strong> fit at current cell size
      </div>

      {/* Overflow warning + auto-fit */}
      {hasOverflow && (
        <div style={{ background: '#fff3e0', border: '1px solid #ffb74d', borderRadius: 5, padding: '6px 8px', marginBottom: 8, fontSize: 11, color: '#7a4100' }}>
          ⚠ Widgets overflow the {overflowX && overflowY ? 'right and bottom edges' : overflowX ? 'right edge' : 'bottom edge'}.
          <button
            onClick={fitToScreen}
            style={{ display: 'block', marginTop: 5, width: '100%', fontSize: 11, padding: '4px 0', border: '1px solid #ffb74d', borderRadius: 4, background: '#ff9800', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
          >
            ↔↕ Auto-fit cells to screen
          </button>
        </div>
      )}

      {/* Page grid override toggle */}
      <div style={{ background: hasPageOverride ? '#fff8e1' : '#f8f9fa', border: `1px solid ${hasPageOverride ? '#ffe082' : '#eee'}`, borderRadius: 5, padding: '6px 8px', marginBottom: 10 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={hasPageOverride}
            onChange={(e) => e.target.checked ? enablePageOverride() : disablePageOverride()}
          />
          <span>
            <strong>Override grid for "{activePage?.name}"</strong>
            {hasPageOverride
              ? ' — changes below affect this page only'
              : ' — changes below affect all pages'}
          </span>
        </label>
      </div>

      <Field label="Navbar edge">
        <div style={{ display: 'flex', gap: 3 }}>
          {NAVBAR_EDGES.map((edge) => (
            <button
              key={edge}
              onClick={() => setNavbarEdge(edge)}
              style={{
                fontSize: 11, padding: '3px 7px', border: '1px solid #ccc', borderRadius: 4,
                background: navbar_edge === edge ? '#1a237e' : '#f5f5f5',
                color: navbar_edge === edge ? '#fff' : '#555',
                cursor: 'pointer', textTransform: 'capitalize',
              }}
            >
              {edge}
            </button>
          ))}
        </div>
      </Field>

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
          value={displayGrid.columns}
          onChange={(e) => patchGrid({ columns: num(e.target.value, 1) })}
          style={{ ...inputStyle, width: 64 }}
        />
      </Field>

      <Field label="Cell width (px)">
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <input
            type="number"
            min={1}
            value={displayGrid.widget_dimensions[0]}
            onChange={(e) => patchGrid({ widget_dimensions: [num(e.target.value, 1), displayGrid.widget_dimensions[1]] })}
            style={{ ...inputStyle, width: 70 }}
          />
          <button
            onClick={() => patchGrid({ widget_dimensions: [autoW, displayGrid.widget_dimensions[1]] })}
            title={`Set to ${autoW}pt to fill content width`}
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
          value={displayGrid.widget_dimensions[1]}
          onChange={(e) => patchGrid({ widget_dimensions: [displayGrid.widget_dimensions[0], num(e.target.value, 1)] })}
          style={{ ...inputStyle, width: 70 }}
        />
      </Field>

      <Field label="Margin X (px)">
        <input
          type="number"
          min={0}
          value={displayGrid.widget_margins[0]}
          onChange={(e) => patchGrid({ widget_margins: [num(e.target.value), displayGrid.widget_margins[1]] })}
          style={{ ...inputStyle, width: 64 }}
        />
      </Field>
      <Field label="Margin Y (px)">
        <input
          type="number"
          min={0}
          value={displayGrid.widget_margins[1]}
          onChange={(e) => patchGrid({ widget_margins: [displayGrid.widget_margins[0], num(e.target.value)] })}
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
