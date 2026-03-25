import { WIDGET_TYPES } from '../../data/widgetTypes';

// Simulated values for each unit type — makes sensors look realistic in the preview
const MOCK_VALUES_BY_UNIT = {
  '°C': '21.5', '°F': '70.7', '%': '65', 'W': '1,240', 'kW': '3.2',
  'kWh': '12.4', 'V': '230', 'A': '5.4', 'lx': '450', 'ppm': '412',
  'hPa': '1013', 'mbar': '1013', 'km/h': '18', 'm/s': '5', 'mph': '11',
  'mm': '0.2', 'L': '142', 'L/min': '8.4', 'dB': '42', 'μg/m³': '8',
};

function formatTimePattern(pattern, date) {
  const h24 = date.getHours();
  const h12 = h24 % 12 || 12;
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  return (pattern || 'HH:MM:SS')
    .replace('HH', String(h24).padStart(2, '0'))
    .replace('H', String(h24))
    .replace('hh', String(h12).padStart(2, '0'))
    .replace('h', String(h12))
    .replace('MM', mm)
    .replace('SS', ss)
    .replace('A', ampm)
    .replace('a', ampm.toLowerCase());
}

const MOCK_WEATHER_ATTRS = {
  temperature: '18', humidity: '65', wind_speed: '12',
  pressure: '1013', feels_like: '16', uv_index: '3',
  wind_bearing: '245', visibility: '10',
};

const MOCK_PRINTER = {
  nozzle:   ['Nozzle',   '215', '°C'],
  bed:      ['Bed',      '60',  '°C'],
  time:     ['Time',     '01:23', ''],
  progress: ['Progress', '45',  '%'],
  status:   ['Status',   'Printing', ''],
};

// ---- sub-renderers --------------------------------------------------------

function TitleLabel({ text }) {
  return (
    <span style={{
      color: '#9e9e9e', fontSize: '11px', fontWeight: 'bold',
      lineHeight: '14px', overflow: 'hidden', textOverflow: 'ellipsis',
      whiteSpace: 'nowrap', width: '100%', flexShrink: 0,
    }}>
      {text}
    </span>
  );
}

// ---- main component -------------------------------------------------------

/**
 * Renders a faithful iOS-app preview of a widget tile.
 * tileW / tileH are the outer pixel dimensions of the tile (including any border).
 */
export default function WidgetPreview({ widget, tileW, tileH }) {
  const { type, format = {} } = widget;
  const textColor = format.textColor || '#e0e0e0';
  const align = format.align || 'center';
  const vAlign = format.vAlign || 'middle';
  const displayLabel = widget.label || widget.entity_id || type;

  const jc = (a) => a === 'left' ? 'flex-start' : a === 'right' ? 'flex-end' : 'center';
  const colStyle = {
    display: 'flex', flexDirection: 'column',
    width: '100%', height: '100%',
    overflow: 'hidden', padding: '4px 6px',
    boxSizing: 'border-box',
  };

  // inner content height after padding
  const IH = tileH - 8;
  const IW = tileW - 12;

  switch (type) {

    // ---- stateful on/off buttons -----------------------------------------
    case 'light':
    case 'switch':
    case 'scene':
    case 'button': {
      const textSize = format.textSize
        ? `${format.textSize}px`
        : `${Math.max(13, Math.min(20, IH * 0.32))}px`;
      const showSlider = type === 'light' && widget.dimmable;
      const va = vAlign === 'top' ? 'flex-start' : vAlign === 'bottom' ? 'flex-end' : 'center';

      return (
        <div style={{
          ...colStyle,
          alignItems: jc(align),
          justifyContent: showSlider ? 'center' : va,
        }}>
          <span style={{
            color: textColor, fontSize: textSize,
            fontWeight: 'bold', textAlign: align, lineHeight: 1.25,
          }}>
            {displayLabel}
          </span>
          {showSlider && (
            <div style={{
              width: '100%', height: 7, marginTop: 8, borderRadius: 4,
              background: 'rgba(255,255,255,0.12)', overflow: 'hidden', flexShrink: 0,
            }}>
              <div style={{ width: '70%', height: '100%', background: 'rgba(255,255,255,0.38)', borderRadius: 4 }} />
            </div>
          )}
        </div>
      );
    }

    // ---- sensor / value / person -----------------------------------------
    case 'sensor':
    case 'value':
    case 'person': {
      const unit = widget.unit || '';
      const mockValue =
        widget.preview_value != null ? widget.preview_value
        : type === 'person' ? 'home'
        : (MOCK_VALUES_BY_UNIT[unit] || '—');
      const baseSize = format.textSize
        ? Number(format.textSize)
        : Math.max(18, Math.min(36, IH * 0.44));
      const unitSize = baseSize * 0.5;

      return (
        <div style={colStyle}>
          <TitleLabel text={displayLabel} />
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: jc(align), minHeight: 0 }}>
            <span style={{ color: textColor, fontSize: `${baseSize}px`, fontWeight: 'bold', lineHeight: 1 }}>
              {mockValue}
            </span>
            {unit && (
              <span style={{
                color: textColor, fontSize: `${unitSize}px`,
                marginLeft: 4, lineHeight: 1,
              }}>
                {unit}
              </span>
            )}
          </div>
        </div>
      );
    }

    // ---- static label ----------------------------------------------------
    case 'label': {
      const lblText = widget.text || displayLabel;
      const lblSize = format.textSize
        ? `${format.textSize}px`
        : `${Math.max(13, Math.min(22, IH * 0.3))}px`;
      const va = vAlign === 'top' ? 'flex-start' : vAlign === 'bottom' ? 'flex-end' : 'center';
      return (
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', alignItems: va, justifyContent: jc(align),
          padding: '4px 6px', boxSizing: 'border-box',
        }}>
          <span style={{ color: textColor, fontSize: lblSize, fontWeight: 'bold', textAlign: align, wordBreak: 'break-word', lineHeight: 1.3 }}>
            {lblText}
          </span>
        </div>
      );
    }

    // ---- clock -----------------------------------------------------------
    case 'clock': {
      const timeStr = formatTimePattern(widget.time_pattern, new Date());
      const clockSize = format.textSize
        ? `${format.textSize}px`
        : `${Math.max(16, Math.min(36, IH * 0.46))}px`;
      return (
        <div style={{
          width: '100%', height: '100%', padding: '4px 6px',
          boxSizing: 'border-box', display: 'flex',
          alignItems: 'center', justifyContent: jc(align),
        }}>
          <span style={{
            color: textColor, fontSize: clockSize, fontWeight: 'bold',
            fontVariantNumeric: 'tabular-nums', textAlign: align,
          }}>
            {timeStr}
          </span>
        </div>
      );
    }

    // ---- weather ---------------------------------------------------------
    case 'weather': {
      const attrs = widget.attrs || [];
      const attrUnits = widget.attr_units || {};
      const mainSize = format.textSize
        ? `${format.textSize}px`
        : `${Math.max(14, Math.min(22, IH * 0.26))}px`;
      const titleH = widget.label ? 14 : 0;
      const mainH = Math.max(14, IH * 0.28);
      const maxRows = Math.floor((IH - titleH - mainH - 4) / 15);

      return (
        <div style={colStyle}>
          {widget.label && <TitleLabel text={widget.label} />}
          <span style={{
            color: textColor, fontSize: mainSize, fontWeight: 'bold',
            textAlign: 'center', lineHeight: 1.3, flexShrink: 0,
          }}>
            sunny
          </span>
          <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 1 }}>
            {attrs.slice(0, maxRows).map((attr, i) => {
              const unit = attrUnits[attr] || '';
              const val = MOCK_WEATHER_ATTRS[attr] || '--';
              return (
                <div key={i} style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px', textAlign: 'center', lineHeight: '15px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {attr.replace(/_/g, ' ')}: {val}{unit ? ` ${unit}` : ''}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // ---- climate ---------------------------------------------------------
    case 'climate': {
      const modes = widget.modes || ['off', 'heat', 'cool', 'auto'];
      const stateFormats = widget.state_formats || {};
      const tempSize = `${Math.max(13, Math.min(22, IH * 0.24))}px`;
      const btnH = Math.max(14, Math.min(22, IH * 0.2));
      const btnFontSize = Math.max(8, Math.min(10, IW / modes.length * 0.55));

      return (
        <div style={{ ...colStyle, gap: 3 }}>
          <TitleLabel text={displayLabel} />
          <span style={{ color: textColor, fontSize: tempSize, fontWeight: 'bold', textAlign: 'center', flexShrink: 0, lineHeight: 1.2 }}>
            -- / --
          </span>
          {/* Mode selector */}
          <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
            {modes.slice(0, 6).map((m, i) => {
              const mFmt = stateFormats[m] || {};
              return (
                <div key={i} style={{
                  flex: 1, background: mFmt.bgColor || '#444',
                  color: mFmt.textColor || '#bbb',
                  fontSize: `${btnFontSize}px`,
                  textAlign: 'center', borderRadius: 3,
                  height: btnH, lineHeight: `${btnH}px`,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {m}
                </div>
              );
            })}
          </div>
          {/* Temp buttons */}
          <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', textAlign: 'center', borderRadius: 4, fontSize: '14px', color: '#aaa', height: btnH, lineHeight: `${btnH}px` }}>−</div>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', textAlign: 'center', borderRadius: 4, fontSize: '14px', color: '#aaa', height: btnH, lineHeight: `${btnH}px` }}>+</div>
          </div>
        </div>
      );
    }

    // ---- camera ----------------------------------------------------------
    case 'camera': {
      const hasOverlay = widget.overlay_button?.label;
      const iconSize = Math.max(14, Math.min(28, Math.min(IW, IH) * 0.32));
      return (
        <div style={{ position: 'absolute', inset: 0, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: iconSize, opacity: 0.28 }}>📷</span>
          {hasOverlay && (
            <div style={{ position: 'absolute', bottom: 6, right: 6, background: 'rgba(40,40,40,0.88)', color: '#aaa', fontSize: '9px', borderRadius: 3, padding: '2px 5px' }}>
              {widget.overlay_button.label}
            </div>
          )}
        </div>
      );
    }

    // ---- 3D printer (Garmin-style field grid) ----------------------------
    case 'printer':
    case 'printer3d': {
      const visible = widget.visible_rows || ['nozzle', 'bed', 'time', 'progress', 'status'];
      const hasStatus = visible.includes('status');
      const fieldKeys = ['nozzle', 'bed', 'time', 'progress'].filter(r => visible.includes(r));

      const hdrH = 20;
      const bodyH = IH - hdrH;
      const nCols = fieldKeys.length <= 1 ? 1 : 2;
      const nRows = Math.ceil(fieldKeys.length / Math.max(1, nCols));
      const cellH = nRows > 0 ? bodyH / nRows : bodyH;
      const valueFs = Math.max(10, Math.min(cellH * 0.50, 44));
      const fldFs   = Math.max(7,  Math.min(cellH * 0.20, 10));

      const MOCK_FIELDS = {
        nozzle:   { val: '215°C', lbl: 'NOZZLE',    prog: false },
        bed:      { val: '60°C',  lbl: 'BED',        prog: false },
        time:     { val: '01:23', lbl: 'REMAINING',  prog: false },
        progress: { val: '45%',   lbl: 'PROGRESS',   prog: true  },
      };

      return (
        <div style={{ width: '100%', height: '100%', boxSizing: 'border-box', overflow: 'hidden', padding: '0 4px 4px' }}>
          {/* Header: label + status */}
          <div style={{
            height: hdrH, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderBottom: '0.5px solid rgba(255,255,255,0.12)',
          }}>
            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: 'bold' }}>
              {displayLabel || '3D Printer'}
            </span>
            {hasStatus && (
              <span style={{ color: '#4de06a', fontSize: 10 }}>Printing</span>
            )}
          </div>
          {/* Field cell grid */}
          {fieldKeys.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${nCols}, 1fr)`,
              height: bodyH,
              overflow: 'hidden',
            }}>
              {fieldKeys.map((row, i) => {
                const m = MOCK_FIELDS[row] || { val: '--', lbl: row.toUpperCase(), prog: false };
                const col    = i % nCols;
                const rowIdx = Math.floor(i / nCols);
                return (
                  <div key={row} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    borderLeft: col > 0 ? '0.5px solid rgba(255,255,255,0.12)' : 'none',
                    borderTop: rowIdx > 0 ? '0.5px solid rgba(255,255,255,0.12)' : 'none',
                    overflow: 'hidden', gap: 1,
                  }}>
                    <span style={{ color: textColor, fontSize: `${valueFs}px`, fontWeight: 'bold', lineHeight: 1.1, textAlign: 'center' }}>
                      {m.val}
                    </span>
                    {m.prog && (
                      <div style={{ width: '72%', height: 3, background: 'rgba(255,255,255,0.15)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: '45%', height: '100%', background: '#4d9fe0', borderRadius: 3 }} />
                      </div>
                    )}
                    <span style={{ color: 'rgba(255,255,255,0.38)', fontSize: `${fldFs}px` }}>
                      {m.lbl}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    // ---- countdown timer -------------------------------------------------
    case 'timer': {
      const defaultSecs = widget.default_seconds || 300;
      const mm = String(Math.floor(defaultSecs / 60)).padStart(2, '0');
      const ss = String(defaultSecs % 60).padStart(2, '0');
      const timeStr = `${mm}:${ss}`;
      const configurable = widget.configurable !== false;
      const btnH = Math.max(14, Math.min(24, IH * 0.2));
      const dispH = IH - 14 - (configurable ? btnH + 6 : 0);
      const timerFs = `${Math.max(15, Math.min(36, dispH * 0.62))}px`;

      return (
        <div style={colStyle}>
          <span style={{ color: '#9e9e9e', fontSize: '11px', fontWeight: 'bold', lineHeight: '14px', textAlign: 'center', flexShrink: 0 }}>
            {displayLabel || 'Timer'}
          </span>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
            <span style={{ color: textColor, fontSize: timerFs, fontWeight: 'bold', fontVariantNumeric: 'tabular-nums' }}>
              {timeStr}
            </span>
          </div>
          {configurable && (
            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.15)', textAlign: 'center', borderRadius: 4, fontSize: '14px', color: '#ccc', height: btnH, lineHeight: `${btnH}px` }}>−</div>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.15)', textAlign: 'center', borderRadius: 4, fontSize: '14px', color: '#ccc', height: btnH, lineHeight: `${btnH}px` }}>+</div>
            </div>
          )}
        </div>
      );
    }

    // ---- embedded webpage ------------------------------------------------
    case 'webpage': {
      const url = widget.stream_url;
      const shortUrl = url
        ? (url.length > 26 ? url.slice(0, 24) + '…' : url)
        : 'no URL configured';
      const iconFs = Math.max(14, Math.min(24, IH * 0.22));
      return (
        <div style={colStyle}>
          {widget.label && <TitleLabel text={widget.label} />}
          <div style={{
            flex: 1, minHeight: 0, background: '#111', borderRadius: 3,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 4,
          }}>
            <span style={{ fontSize: iconFs, opacity: 0.2 }}>🌐</span>
            <span style={{ color: '#555', fontSize: '9px', textAlign: 'center', padding: '0 4px' }}>{shortUrl}</span>
          </div>
        </div>
      );
    }

    // ---- Mealie recipe browser -------------------------------------------
    case 'mealie': {
      const mockRecipes = [
        { name: 'Pasta Carbonara',      tags: ['Italian', 'Quick'] },
        { name: 'Chicken Tikka Masala', tags: ['Indian']           },
        { name: 'Greek Salad',          tags: ['Vegetarian']       },
        { name: 'Beef Stir Fry',        tags: ['Asian', 'Quick']   },
        { name: 'Lemon Risotto',        tags: ['Italian']          },
        { name: 'Tacos',                tags: ['Mexican']          },
      ];
      const fontSize = format.textSize || 10;
      const gap = 3;
      const cardW = Math.floor((IW - gap) / 2);

      // Simple deterministic hue from tag name (mirrors iOS mealieTagColor)
      function tagHue(name) {
        let h = 5381;
        for (let i = 0; i < name.length; i++) h = (h * 33 ^ name.charCodeAt(i)) >>> 0;
        return (h % 360);
      }

      return (
        <div style={colStyle}>
          <TitleLabel text={widget.label || 'Recipes'} />
          <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap, alignContent: 'flex-start' }}>
              {mockRecipes.map((r, i) => (
                <div key={i} style={{
                  width: cardW, background: 'rgba(255,255,255,0.12)', borderRadius: 4,
                  padding: '4px 5px', boxSizing: 'border-box',
                }}>
                  <div style={{ color: '#fff', fontSize, fontWeight: 500, lineHeight: 1.3, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.name}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {r.tags.slice(0, 2).map((t) => (
                      <span key={t} style={{
                        fontSize: Math.max(7, fontSize - 2), padding: '1px 4px',
                        borderRadius: 8, color: '#fff',
                        background: `hsl(${tagHue(t)},55%,42%)`,
                      }}>{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // ---- sous vide cooker ------------------------------------------------
    case 'sousvide': {
      const unit = widget.unit || '°C';
      const tempFs = `${Math.max(12, Math.min(20, IH * 0.22))}px`;
      return (
        <div style={{ ...colStyle, justifyContent: 'space-evenly', alignItems: 'center' }}>
          {displayLabel && <TitleLabel text={displayLabel} />}
          <span style={{ color: '#555', fontSize: '11px', fontWeight: 'bold', letterSpacing: 1 }}>IDLE</span>
          <span style={{ color: '#555', fontSize: tempFs, fontWeight: 'bold' }}>—{unit} / —{unit}</span>
          <span style={{ color: '#555', fontSize: '11px' }}>--:--</span>
        </div>
      );
    }

    // ---- appliance (washer, dryer, etc.) ---------------------------------
    case 'appliance': {
      const stateFs = `${Math.max(13, Math.min(20, IH * 0.2))}px`;
      return (
        <div style={{ ...colStyle, justifyContent: 'space-evenly', alignItems: 'stretch' }}>
          <TitleLabel text={displayLabel} />
          <span style={{ color: '#666', fontSize: stateFs, fontWeight: 'bold', textAlign: 'center' }}>OFF</span>
          <span style={{ color: '#555', fontSize: '11px', textAlign: 'center' }}>—</span>
        </div>
      );
    }

    // ---- fallback --------------------------------------------------------
    default: {
      const typeDef = WIDGET_TYPES.find((t) => t.type === type) ?? { icon: '?', label: type };
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4px 6px', boxSizing: 'border-box' }}>
          <span style={{ fontSize: Math.min(18, IH * 0.3) }}>{typeDef.icon}</span>
          <span style={{ color: textColor, fontSize: '12px', marginTop: 2, textAlign: 'center' }}>{displayLabel}</span>
        </div>
      );
    }
  }
}
