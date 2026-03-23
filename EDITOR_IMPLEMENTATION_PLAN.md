# MQTTDash Profile Editor — Implementation Plan

## Overview
Build a standalone React+Vite SPA — interactive profile editor with a drag-and-drop iPad canvas, widget library, full property panels, and JSON import/export. Hosted on GitHub Pages from `/ha_mqtt_dash_profile_editor`.

---

## Device Model Table

| Model              | Logical Points (W×H) | Physical Pixels (W×H) | Pixel Density (ppi) | Scale | Aspect Ratio | Notes         |
|--------------------|---------------------|-----------------------|---------------------|-------|--------------|---------------|
| iPad 1st gen       | 768 × 1024          | 768 × 1024            | 132                 | 1x    | 3:4          | non-Retina    |
| iPad 2             | 768 × 1024          | 768 × 1024            | 132                 | 1x    | 3:4          | non-Retina    |
| iPad 3rd gen       | 768 × 1024          | 1536 × 2048           | 264                 | 2x    | 3:4          | Retina        |
| iPad 4th gen       | 768 × 1024          | 1536 × 2048           | 264                 | 2x    | 3:4          | Retina        |
| iPad mini 1        | 768 × 1024          | 768 × 1024            | 163                 | 1x    | 3:4          | non-Retina    |
| iPad mini 2        | 768 × 1024          | 1536 × 2048           | 326                 | 2x    | 3:4          | Retina        |
| iPad mini 3        | 768 × 1024          | 1536 × 2048           | 326                 | 2x    | 3:4          | Retina        |
| iPad Air 1         | 768 × 1024          | 1536 × 2048           | 264                 | 2x    | 3:4          | Retina        |

All use 768×1024 points (portrait), 3:4 aspect. Only iPad 1, 2, mini 1 are non-Retina (1x scale); all others are Retina (2x).

---

## Phase 1: Project Scaffold
- Scaffold Vite+React inside `/root/ha_mqtt_dash_profile_editor` (no TypeScript)
- Install deps: `@dnd-kit/core @dnd-kit/utilities react-colorful zustand`
- Configure `vite.config.js` with `base: '/ha_mqtt_dash_profile_editor/'` for GitHub Pages
- Add `.github/workflows/deploy.yml` (build → deploy to gh-pages branch via `actions/deploy-pages`)
- Create `src/data/widgetTypes.js` — schema definitions for all 13 widget types with every configurable param, types, defaults, and labels
- Create `src/data/deviceModels.js` — all 8 iPad models from compatibility chart (screen points width/height, pixel density label, orientation modes) + custom resolution entry
- Create `src/store/editorStore.js` (Zustand store) — state shape: `{ device, grid, widgets, selectedWidgetId, history }` with actions for CRUD, undo/redo

## Phase 2: iPad Canvas + Grid Rendering
- `DeviceFrame.jsx` — CSS-rendered iPad frame (rounded rect bezel, home button circle, camera dot, screen inset area); accepts `width`, `height` props in points; outer frame scales via CSS `transform: scale()` to fit available preview panel height
- `GridCanvas.jsx` — wraps DeviceFrame, renders the grid overlay and widget tiles; implements drop zone for new widgets from palette
- `GridOverlay.jsx` — draws faint grid cell lines using calculated cell geometry (mirrors exact app math: `cellW = floor(screenWidth / columns)`, `posX = x*cellW + marginX`, `posY = y*(cellH+marginY) + marginY`, `tileW = w*cellW - 2*marginX`, `tileH = h*cellH - 2*marginY`)
- `WidgetTile.jsx` — absolutely-positioned widget preview on canvas; shows type icon + label + entity_id; selection highlight ring; resize handles on right/bottom edges; delete (×) button on hover
- `DeviceSelector.jsx` — top-of-canvas bar: device model dropdown (all 8 iPads + Custom), orientation toggle (portrait/landscape), custom W×H number inputs (shown when Custom selected)

## Phase 3: Drag & Drop
- Wrap app with `DndContext` from @dnd-kit/core; use `PointerSensor` for both mouse and touch
- `PaletteItem.jsx` (in `WidgetPalette.jsx`) — each widget type is a `useDraggable` source carrying `{ dragType: 'new', widgetType }`
- Canvas drop zone uses `useDroppable`; on drop a new widget is created at the nearest valid grid cell (computed from pointer offset relative to canvas origin)
- `WidgetTile.jsx` also implements `useDraggable` carrying `{ dragType: 'move', widgetId }` — on drop updates widget x/y
- Resize: WidgetTile bottom-right handle uses `usePointerCapture` pattern (custom `onPointerDown/Move/Up`) to update w/h live
- Drag ghost: `DragOverlay` renders a semi-transparent preview tile during drag; grid cells highlight on hover to show drop target

## Phase 4: Widget Config Panel
- `ConfigPanel.jsx` (right sidebar) — shows `GridConfigSection` when nothing selected; shows widget form when widget selected
- `GridConfigSection.jsx` — columns (number), widget_dimensions (WxH), widget_margins (XxY), banner text, devOverlay toggle
- `CommonFields.jsx` — label (text), entity_id (text), x / y / w / h (number), protected (checkbox)
- `FormatFields.jsx` — collapsible section for all format keys:
    - align (left/center/right segmented), vAlign (top/middle/bottom segmented)
    - textSize (number + px preview), textColor, bgColor, onTextColor, offTextColor, onBgColor, offBgColor (each a `react-colorful` HexColorInput + swatch popup picker), wrap (toggle), maxLines (number)
- Per-type config components (each renders only the fields relevant to that type):
    - `LightConfig.jsx` — no extra fields (topics auto-generated by HA)
    - `SwitchConfig.jsx` — no extra fields
    - `SceneConfig.jsx` — no extra fields  
    - `SensorConfig.jsx` — unit (text)
    - `ButtonConfig.jsx` — no extra fields
    - `LabelConfig.jsx` — text (textarea)
    - `ClockConfig.jsx` — time_pattern (text with placeholder showing token reference)
    - `WeatherConfig.jsx` — attrs (multi-checkbox list of 9 attr names), attr_units (key-value table)
    - `ClimateConfig.jsx` — modes (multi-checkbox: off/heat/cool/auto/fan_only/dry), state_formats (per-state color pickers)
    - `CameraConfig.jsx` — stream_url (text), scale_mode (fit/stretch radio), overlay_button (sub-form: label, entity_id, action dropdown)
    - `PrinterConfig.jsx` — nozzle_entity, bed_entity, time_entity, progress_entity, status_entity (entity text inputs), progress_unit (text), visible_rows (multi-checkbox of 5 rows)

## Phase 5: Import / Export
- `JsonPreview.jsx` — right-sidebar bottom panel OR dedicated modal; shows live-generated profile JSON (syntax-highlighted with `<pre>`)
- `profileExport.js` util — generates export JSON in the flat format accepted by HA: `{ banner, grid: {...}, widgets: [...] }` — widget entries include all non-empty fields; omit MQTT topics (HA generates those)
- `ImportExportPanel.jsx` (triggered from header buttons):
    - **Export:** two buttons: "Copy JSON" (navigator.clipboard), "Download .json" (Blob URL click)
    - **Import:** tabbed: (a) paste textarea → parse → load, (b) file input → FileReader → parse → load; validates JSON and shows parse error if invalid
- Header shows widget count + device name; includes "New" (reset), "Import", "Export" buttons

## Phase 6: Polish & Deployment
- Overlap detection: after any move/resize, scan widgets for bounding box intersections → add red warning border + tooltip "overlaps with [widget]"
- Undo/redo: store snapshot of `{ grid, widgets }` in `history[]` array; Ctrl+Z / Ctrl+Y keyboard handlers
- Responsive layout: 3-column CSS flex/grid (palette 220px | canvas flex-fill | config 380px); canvas scales iPad frame to fit vertically
- README.md explaining: what it is, how to use it, how to paste output into HA (`set_device_profile`), link to GitHub Pages
- `index.html` — set page title, meta description, viewport

---

## File Structure
```
mqttdash-profile-editor/
├── .github/workflows/deploy.yml
├── public/favicon.svg
├── src/
│   ├── main.jsx
│   ├── App.jsx + App.css
│   ├── store/editorStore.js
│   ├── data/widgetTypes.js
│   ├── data/deviceModels.js
│   ├── utils/gridLayout.js
│   ├── utils/profileExport.js
│   └── components/
│       ├── Header.jsx
│       ├── DeviceSelector.jsx
│       ├── WidgetPalette.jsx
│       ├── PaletteItem.jsx
│       ├── Canvas/GridCanvas.jsx
│       ├── Canvas/DeviceFrame.jsx
│       ├── Canvas/GridOverlay.jsx
│       ├── Canvas/WidgetTile.jsx
│       ├── ConfigPanel/ConfigPanel.jsx
│       ├── ConfigPanel/GridConfigSection.jsx
│       ├── ConfigPanel/CommonFields.jsx
│       ├── ConfigPanel/FormatFields.jsx
│       ├── ConfigPanel/widget_configs/LightConfig.jsx
│       ├── ConfigPanel/widget_configs/SensorConfig.jsx
│       ├── ConfigPanel/widget_configs/LabelConfig.jsx
│       ├── ConfigPanel/widget_configs/ClockConfig.jsx
│       ├── ConfigPanel/widget_configs/WeatherConfig.jsx
│       ├── ConfigPanel/widget_configs/ClimateConfig.jsx
│       ├── ConfigPanel/widget_configs/CameraConfig.jsx
│       ├── ConfigPanel/widget_configs/PrinterConfig.jsx
│       └── ImportExport/ImportExportModal.jsx
├── index.html
├── package.json
└── vite.config.js
```

## Verification
- `npm run build` completes without errors
- Local `npm run dev` — palette items can be dragged to canvas, widgets appear at correct grid cells
- Select widget → config panel shows all type-specific fields
- All 13 widget types can be added and configured
- Export → copy → paste into HA developer tools as `profile` field in `set_device_profile` call → device receives and renders correctly
- Import → paste test_profile.json → all widgets appear correctly positioned on canvas
- All 8 iPad device models render correct frame proportions
- Custom resolution (e.g. 768×1024) renders identically to iPad 1 preset
- GitHub Actions deploy workflow completes and editor is live on GitHub Pages
- Overlap warning fires when two widgets share grid cells

## Decisions
- Export format: flat JSON (banner/grid/widgets top-level) — HA normalizer accepts this
- No entity validation — fully offline, free-text entity IDs
- No TypeScript — vanilla JSX for simpler code
- CSS: custom (no Tailwind/MUI) — tight control, no external stylesheet load on Pages
- All iPad models have same 768×1024 logical resolution; difference is noted as pixel density label only
- Undo/redo: simple snapshot array (not command pattern), max 50 history entries
