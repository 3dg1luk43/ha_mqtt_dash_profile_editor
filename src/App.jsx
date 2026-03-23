import { useState, useEffect, useRef } from 'react';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useEditorStore } from './store/editorStore';
import { WIDGET_TYPES } from './data/widgetTypes';
import { pixelToCell } from './utils/gridLayout';

import Header from './components/Header';
import DeviceSelector from './components/DeviceSelector';
import WidgetPalette from './components/WidgetPalette';
import GridCanvas, { FRAME_W, FRAME_H } from './components/Canvas/GridCanvas';
import ConfigPanel from './components/ConfigPanel/ConfigPanel';
import ImportExportModal from './components/ImportExport/ImportExportModal';

import './App.css';

export default function App() {
  const [modal, setModal] = useState(null); // 'import' | 'export' | null
  const { addWidget, moveWidget, widgets, grid, undo, redo } = useEditorStore();
  const [activeItem, setActiveItem] = useState(null); // { dragType, widgetType|widgetId }

  const canvasAreaRef = useRef(null);
  const [canvasH, setCanvasH] = useState(700);

  // Measure canvas area height for iPad frame scaling
  useEffect(() => {
    if (!canvasAreaRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setCanvasH(e.contentRect.height);
    });
    ro.observe(canvasAreaRef.current);
    return () => ro.disconnect();
  }, []);

  // Keyboard undo/redo
  useEffect(() => {
    function handler(e) {
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); }
      if (e.ctrlKey && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); redo(); }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function handleDragStart(event) {
    setActiveItem(event.active.data.current);
  }

  function handleDragEnd(event) {
    setActiveItem(null);
    const { active, over, delta } = event;
    if (!over) return;

    const data = active.data.current;
    if (!data) return;

    if (data.dragType === 'new') {
      // Drop new widget from palette onto canvas
      // Estimate drop cell from pointer position via delta
      const canvasEl = canvasAreaRef.current;
      if (!canvasEl) return;
      const scale = Math.min(1, (canvasH - 32) / FRAME_H);
      const rect = canvasEl.getBoundingClientRect();
      const canvasX = event.activatorEvent?.clientX ?? 0;
      const canvasY = event.activatorEvent?.clientY ?? 0;
      const finalX = canvasX + delta.x;
      const finalY = canvasY + delta.y;

      // Screen origin within canvas div
      const screenLeft = rect.left + 40 * scale;
      const screenTop = rect.top + 80 * scale;
      const px = (finalX - screenLeft) / scale;
      const py = (finalY - screenTop) / scale;
      const cell = pixelToCell(px, py, grid);

      const typeDef = WIDGET_TYPES.find((t) => t.type === data.widgetType);
      const id = `${data.widgetType}_${Date.now()}`;
      addWidget({
        id,
        type: data.widgetType,
        label: typeDef?.label ?? data.widgetType,
        entity_id: '',
        x: cell.x,
        y: cell.y,
        w: 1,
        h: 1,
        format: {},
      });
    } else if (data.dragType === 'move') {
      // Move existing widget
      const w = widgets.find((wi) => wi.id === data.widgetId);
      if (!w) return;
      const canvasEl = canvasAreaRef.current;
      if (!canvasEl) return;
      const scale = Math.min(1, (canvasH - 32) / FRAME_H);
      const rect = canvasEl.getBoundingClientRect();
      const canvasX = event.activatorEvent?.clientX ?? 0;
      const canvasY = event.activatorEvent?.clientY ?? 0;
      const finalX = canvasX + delta.x;
      const finalY = canvasY + delta.y;
      const screenLeft = rect.left + 40 * scale;
      const screenTop = rect.top + 80 * scale;
      const px = (finalX - screenLeft) / scale;
      const py = (finalY - screenTop) / scale;
      const cell = pixelToCell(px, py, grid);
      moveWidget(data.widgetId, cell.x, cell.y);
    }
  }

  // DragOverlay preview tile
  function renderDragPreview() {
    if (!activeItem) return null;
    if (activeItem.dragType === 'new') {
      const t = WIDGET_TYPES.find((w) => w.type === activeItem.widgetType);
      return (
        <div style={{
          padding: '8px 14px',
          background: '#1a237e',
          color: '#fff',
          borderRadius: 6,
          fontSize: 13,
          opacity: 0.85,
          boxShadow: '0 4px 16px #0004',
        }}>
          {t?.icon} {t?.label}
        </div>
      );
    }
    if (activeItem.dragType === 'move') {
      const w = widgets.find((wi) => wi.id === activeItem.widgetId);
      if (!w) return null;
      return (
        <div style={{
          padding: '8px 14px',
          background: '#283593',
          color: '#fff',
          borderRadius: 6,
          fontSize: 12,
          opacity: 0.75,
          boxShadow: '0 4px 16px #0004',
        }}>
          {w.label || w.entity_id || w.type}
        </div>
      );
    }
    return null;
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#f0f2f5' }}>
        <Header onImport={() => setModal('import')} onExport={() => setModal('export')} />
        <DeviceSelector />

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <WidgetPalette />

          {/* Canvas area */}
          <main
            ref={canvasAreaRef}
            style={{ flex: 1, overflow: 'hidden', background: '#e4e7ef', position: 'relative' }}
          >
            <GridCanvas containerHeight={canvasH} />
          </main>

          <ConfigPanel />
        </div>
      </div>

      <DragOverlay>{renderDragPreview()}</DragOverlay>

      {modal && (
        <ImportExportModal mode={modal} onClose={() => setModal(null)} />
      )}
    </DndContext>
  );
}
