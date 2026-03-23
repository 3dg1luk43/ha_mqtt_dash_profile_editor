// Zustand store for MQTT Dash profile editor
import { create } from 'zustand';
import { DEVICE_MODELS } from '../data/deviceModels';

const defaultDevice = DEVICE_MODELS[0];

/** Compute cell dimensions that fill the screen width exactly. */
function autoCell(device, orientation, columns, prevCellH) {
  const [pw, ph] = device.pixels;
  const screenW = orientation === 'landscape' ? ph : pw;
  const cellW = Math.floor(screenW / columns);
  // Keep cell height unchanged unless it was identical to old width (was square)
  return [cellW, prevCellH ?? cellW];
}

const initCellDims = autoCell(defaultDevice, 'portrait', 6, null);
const defaultGrid = {
  columns: 6,
  widget_dimensions: initCellDims,
  widget_margins: [5, 5],
  widget_size: [1, 1],
  devOverlay: false,
};

export const useEditorStore = create((set, get) => ({
  device: defaultDevice,
  orientation: 'portrait',
  grid: { ...defaultGrid },
  widgets: [],
  selectedWidgetId: null,
  banner: '',
  history: [],
  future: [],

  // When device changes: recompute cell width to fill new screen, keep cell height ratio
  setDevice: (device) => set((state) => {
    const oldCellH = state.grid.widget_dimensions[1];
    const dims = autoCell(device, state.orientation, state.grid.columns, oldCellH);
    return { device, grid: { ...state.grid, widget_dimensions: dims } };
  }),

  // When orientation flips: recompute cell width for new screen width, keep height
  setOrientation: (orientation) => set((state) => {
    const oldCellH = state.grid.widget_dimensions[1];
    const dims = autoCell(state.device, orientation, state.grid.columns, oldCellH);
    return { orientation, grid: { ...state.grid, widget_dimensions: dims } };
  }),

  setGrid: (grid) => set({ grid }),
  setWidgets: (widgets) => set({ widgets }),
  setBanner: (banner) => set({ banner }),
  selectWidget: (id) => set({ selectedWidgetId: id }),

  addWidget: (widget) => set((state) => ({
    widgets: [...state.widgets, widget],
    history: [...state.history, { grid: state.grid, widgets: state.widgets }].slice(-50),
    future: [],
  })),
  updateWidget: (id, patch) => set((state) => ({
    widgets: state.widgets.map(w => w.id === id ? { ...w, ...patch } : w),
    history: [...state.history, { grid: state.grid, widgets: state.widgets }].slice(-50),
    future: [],
  })),
  removeWidget: (id) => set((state) => ({
    widgets: state.widgets.filter(w => w.id !== id),
    history: [...state.history, { grid: state.grid, widgets: state.widgets }].slice(-50),
    future: [],
  })),
  moveWidget: (id, x, y) => set((state) => ({
    widgets: state.widgets.map(w => w.id === id ? { ...w, x, y } : w),
    history: [...state.history, { grid: state.grid, widgets: state.widgets }].slice(-50),
    future: [],
  })),
  resizeWidget: (id, w, h) => set((state) => ({
    widgets: state.widgets.map(widget => widget.id === id ? { ...widget, w, h } : widget),
    history: [...state.history, { grid: state.grid, widgets: state.widgets }].slice(-50),
    future: [],
  })),

  // When columns change: recompute cell width; when other grid props change: pass through
  setGridConfig: (patch) => set((state) => {
    const newCols = patch.columns ?? state.grid.columns;
    let newDims = patch.widget_dimensions ?? state.grid.widget_dimensions;
    // Only auto-fit width if columns changed (not if user explicitly set widget_dimensions)
    if (patch.columns !== undefined && patch.widget_dimensions === undefined) {
      const oldCellH = state.grid.widget_dimensions[1];
      newDims = autoCell(state.device, state.orientation, newCols, oldCellH);
    }
    return {
      grid: { ...state.grid, ...patch, widget_dimensions: newDims },
      history: [...state.history, { grid: state.grid, widgets: state.widgets }].slice(-50),
      future: [],
    };
  }),

  undo: () => set((state) => {
    if (state.history.length === 0) return {};
    const prev = state.history[state.history.length - 1];
    return {
      grid: prev.grid,
      widgets: prev.widgets,
      history: state.history.slice(0, -1),
      future: [{ grid: state.grid, widgets: state.widgets }, ...state.future].slice(0, 50),
    };
  }),
  redo: () => set((state) => {
    if (state.future.length === 0) return {};
    const next = state.future[0];
    return {
      grid: next.grid,
      widgets: next.widgets,
      history: [...state.history, { grid: state.grid, widgets: state.widgets }].slice(-50),
      future: state.future.slice(1),
    };
  }),
  reset: () => set({
    device: defaultDevice,
    orientation: 'portrait',
    grid: { ...defaultGrid },
    widgets: [],
    selectedWidgetId: null,
    banner: '',
    history: [],
    future: [],
  }),
}));
