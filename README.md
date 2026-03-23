# MQTTDash Profile Editor

A browser-based visual editor for building [MQTTDash](https://github.com/3dg1luk43/ha_mqtt_dash) dashboard profiles. Design your Home Assistant tablet dashboard by dragging widgets onto an iPad canvas, configuring each one visually, then exporting the profile JSON directly into HA.

**Live editor:** https://3dg1luk43.github.io/ha_mqtt_dash_profile_editor/

---

## Privacy & data storage

> **Everything runs entirely in your browser. There is no backend, no server, and no data is ever transmitted anywhere.**
> All work (widgets, grid settings, entity list) is saved automatically to your browser's **localStorage** only. Clearing browser data will erase it. Use Export to back up your work.

---

## Features

### iPad canvas
- Visual preview of your dashboard rendered inside a CSS iPad frame
- Supports all 8 compatible iPad models (iPad 1–4, mini 1–3, Air 1) plus a custom resolution mode
- **Portrait and landscape** orientation toggle — canvas and cell dimensions update instantly
- Grid scales to fit your browser window while keeping correct proportions

### Widget library
- All 13 supported widget types: **Light, Switch, Scene, Sensor, Value, Person, Button, Label, Clock, Weather, Climate, Camera, Printer**
- Drag any widget type from the palette onto the canvas
- Drop position snaps to the nearest grid cell

### Drag & drop editing
- Drag existing widgets to move them to a new grid position
- Resize widgets with the bottom-right handle — dimensions snap to whole grid cells
- Delete widgets with the × button (visible on hover)
- Red border highlights any overlapping widgets

### Grid configuration
- Set number of **columns** — cell width auto-fills to use the full screen width
- Set **cell height** independently (cells do not have to be squares)
- Configure **margins** inside each cell
- Live info bar shows current screen resolution and how many columns/rows fit

### Widget configuration panel
- Click any widget to open its config panel
- **Common fields:** ID, label, entity ID (with autocomplete), position/size, protected flag
- **Format fields:** text alignment (H + V), text size with live preview, 6 independent color pickers (text, BG, on/off variants) via inline color picker
- **Per-type config:** each widget type shows only its relevant extra fields

### Entity list
- Maintain a personal list of Home Assistant entity IDs (Config Panel → Entities tab)
- **Bulk add**: paste a list of entity IDs (one per line or comma-separated — e.g. copied from HA Developer Tools → States)
- All entity ID inputs across the editor show autocomplete suggestions from your list
- Entities are grouped by domain for easy browsing and management
- Persisted to localStorage — survives page refreshes

### Import / Export
- **Export:** generate the profile JSON, copy to clipboard or download as `.json`
- **Import:** paste JSON directly or load from a file
- Profile format is the flat JSON accepted by the HA `mqtt_dash.set_device_profile` service

### HA Mirror entity checklist
When exporting, the editor scans all widgets and lists every entity ID referenced in the profile. This gives you a ready-made checklist of entities to configure as **mirrored** in the HA integration. The checklist is color-coded by domain and has a "Copy list" button — it is **not** included in the exported JSON.

### Undo / Redo
- Full undo/redo stack (up to 50 steps)
- Keyboard shortcuts: **Ctrl+Z** / **Ctrl+Y** (or Ctrl+Shift+Z)

### Auto-save
- All changes are saved automatically to localStorage
- Refresh the page and your work is exactly where you left it

---

## How to use

### 1. Set up your device
Select your iPad model from the toolbar. The canvas updates to the correct pixel resolution and cell dimensions auto-fill. Toggle portrait/landscape as needed.

### 2. Build your layout
Drag widget types from the **Widget Library** on the left onto the iPad canvas. Drop them where you want them. Resize and move after placement. The grid overlay shows cell boundaries.

### 3. Configure each widget
Click a widget to select it. The right panel shows all fields for that widget type. Set the entity ID (use the autocomplete if you've added your entities), label, size, colors, and any type-specific options.

### 4. Add your entity list (optional but recommended)
Go to **Config Panel → Entities tab**. Paste your entity IDs (copy the entity ID column from HA Developer Tools → States). All entity fields will now autocomplete as you type.

### 5. Export and apply
Click **Export** in the header. Copy the JSON, then in Home Assistant:
1. Go to **Developer Tools → Services**
2. Call `mqtt_dash.set_device_profile`
3. Paste the JSON as the `profile` field

### 6. Configure mirror entities in HA
The Export modal shows a **HA Mirror entities** checklist — all entity IDs your profile uses. Add these to your HA integration's mirror configuration so their states are published to MQTT.

---

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| Ctrl+Z | Undo |
| Ctrl+Y / Ctrl+Shift+Z | Redo |

---

## Supported widget types

| Widget | Entity required | Extra config |
|---|---|---|
| Light | yes | — |
| Switch | yes | — |
| Scene | yes | — |
| Sensor / Value / Person | yes | unit |
| Button | yes | — |
| Label | no | static text |
| Clock | no | time_pattern |
| Weather | yes | attrs, attr_units |
| Climate | yes | modes, per-state colors |
| Camera | no | stream_url, scale_mode, overlay button |
| Printer | no | 5 sensor entities, visible rows |

---

## Compatible devices

| Device | Resolution | Density |
|---|---|---|
| iPad (1st gen) | 768×1024 px | 132 ppi, 1× |
| iPad 2 | 768×1024 px | 132 ppi, 1× |
| iPad (3rd gen) | 1536×2048 px | 264 ppi, 2× Retina |
| iPad (4th gen) | 1536×2048 px | 264 ppi, 2× Retina |
| iPad mini (1st gen) | 768×1024 px | 163 ppi, 1× |
| iPad mini 2 | 1536×2048 px | 326 ppi, 2× Retina |
| iPad mini 3 | 1536×2048 px | 326 ppi, 2× Retina |
| iPad Air (1st gen) | 1536×2048 px | 264 ppi, 2× Retina |
| Custom | user-defined | — |

---

## Local development

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

---

## Deployment

The editor is automatically deployed to GitHub Pages on every push to `main` via the included workflow (`.github/workflows/deploy.yml`). Enable GitHub Pages in your repository settings with **Source: GitHub Actions**.
