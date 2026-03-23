// Zustand store for MQTT Dash profile editor
import { create } from 'zustand';
import { DEVICE_MODELS } from '../data/deviceModels';

const defaultGrid = {
  columns: 6,
  widget_dimensions: [120, 120],
  widget_margins: [5, 5],
  widget_size: [1, 1],
  devOverlay: false,
};

const defaultDevice = DEVICE_MODELS[0];

export const useEditorStore = create((set, get) => ({
  device: defaultDevice,
  grid: { ...defaultGrid },
  widgets: [],
  selectedWidgetId: null,
  banner: '',
  history: [],
  future: [],

  setDevice: (device) => set({ device }),
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
  setGridConfig: (patch) => set((state) => ({
    grid: { ...state.grid, ...patch },
    history: [...state.history, { grid: state.grid, widgets: state.widgets }].slice(-50),
    future: [],
  })),
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
    grid: { ...defaultGrid },
    widgets: [],
    selectedWidgetId: null,
    banner: '',
    history: [],
    future: [],
  }),
}));
