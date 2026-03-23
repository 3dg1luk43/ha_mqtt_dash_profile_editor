import { useState, useEffect, useRef } from 'react';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useEditorStore } from './store/editorStore';
import { WIDGET_TYPES } from './data/widgetTypes';
import { pixelToCell } from './utils/gridLayout';
import { getFrameDims } from './components/Canvas/GridCanvas';

import Header from './components/Header';
import DeviceSelector from './components/DeviceSelector';
import WidgetPalette from './components/WidgetPalette';
import GridCanvas from './components/Canvas/GridCanvas';
import ConfigPanel from './components/ConfigPanel/ConfigPanel';
import ImportExportModal from './components/ImportExport/ImportExportModal';
import WelcomeModal from './components/WelcomeModal';
import { useEntityStore } from './store/entityStore';

import './App.css';

const WELCOME_KEY = 'mqttdash-welcomed-v1';

export default function App() {
  const [modal, setModal] = useState(null);
  const [showWelcome, setShowWelcome] = useState(() => !localStorage.getItem(WELCOME_KEY));
  const { addWidget, moveWidget, widgets, grid, device, orientation, undo, redo } = useEditorStore();
  const entities = useEntityStore((s) => s.entities);
  const [activeItem, setActiveItem] = useState(null);

  function closeWelcome() {
    localStorage.setItem(WELCOME_KEY, '1');
    setShowWelcome(false);
  }

  const canvasAreaRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ w: 900, h: 700 });

  useEffect(() => {
    if (!canvasAreaRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        setCanvasSize({ w: e.contentRect.width, h: e.contentRect.height });
      }
    });
    ro.observe(canvasAreaRef.current);
    return () => ro.disconnect();
  }, []);

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

  function dropCell(event) {
    // Use over.rect — the actual visual ClientRect of the scaled droppable frame div.
    // This is far more accurate than computing from canvasAreaRef which is the <main> element.
    const { over, delta } = event;
    if (!over) return null;

    const { frameW, frameH, bezelLeft, bezelTop } = getFrameDims(device, orientation);
    const scaleH = (canvasSize.h - 32) / frameH;
    const scaleW = (canvasSize.w - 32) / frameW;
    const scale = Math.min(1, scaleH, scaleW);

    // over.rect is the visual bounding box of the droppable div (the scaled frame)
    const overRect = over.rect;
    const finalX = (event.activatorEvent?.clientX ?? 0) + delta.x;
    const finalY = (event.activatorEvent?.clientY ?? 0) + delta.y;

    // Screen inset starts at bezelLeft/bezelTop within the (unscaled) frame,
    // so in scaled screen-space it's bezelLeft*scale from the frame visual left edge.
    const screenLeft = overRect.left + bezelLeft * scale;
    const screenTop  = overRect.top  + bezelTop  * scale;

    const px = (finalX - screenLeft) / scale;
    const py = (finalY - screenTop)  / scale;
    return pixelToCell(px, py, grid);
  }

  function handleDragEnd(event) {
    setActiveItem(null);
    const { active, over } = event;
    if (!over) return;

    const data = active.data.current;
    if (!data) return;

    const cell = dropCell(event);
    if (!cell) return;

    if (data.dragType === 'new') {
      const typeDef = WIDGET_TYPES.find((t) => t.type === data.widgetType);
      addWidget({
        id: `${data.widgetType}_${Date.now()}`,
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
      moveWidget(data.widgetId, cell.x, cell.y);
    }
  }

  function renderDragPreview() {
    if (!activeItem) return null;
    if (activeItem.dragType === 'new') {
      const t = WIDGET_TYPES.find((w) => w.type === activeItem.widgetType);
      return (
        <div style={{ padding: '8px 14px', background: '#1a237e', color: '#fff', borderRadius: 6, fontSize: 13, opacity: 0.85, boxShadow: '0 4px 16px #0004' }}>
          {t?.icon} {t?.label}
        </div>
      );
    }
    if (activeItem.dragType === 'move') {
      const w = widgets.find((wi) => wi.id === activeItem.widgetId);
      if (!w) return null;
      return (
        <div style={{ padding: '8px 14px', background: '#283593', color: '#fff', borderRadius: 6, fontSize: 12, opacity: 0.75, boxShadow: '0 4px 16px #0004' }}>
          {w.label || w.entity_id || w.type}
        </div>
      );
    }
    return null;
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#f0f2f5' }}>
        <Header onImport={() => setModal('import')} onExport={() => setModal('export')} onHelp={() => setShowWelcome(true)} />
        <DeviceSelector />

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <WidgetPalette />
          <main ref={canvasAreaRef} style={{ flex: 1, overflow: 'hidden', background: '#e4e7ef', position: 'relative' }}>
            <GridCanvas containerWidth={canvasSize.w} containerHeight={canvasSize.h} />
          </main>
          <ConfigPanel />
        </div>
      </div>

      <DragOverlay>{renderDragPreview()}</DragOverlay>
      {modal && <ImportExportModal mode={modal} onClose={() => setModal(null)} />}
      {showWelcome && <WelcomeModal onClose={closeWelcome} />}

      {/* Global entity autocomplete list — referenced by all entity_id inputs */}
      <datalist id="entity-autocomplete">
        {entities.map((e) => <option key={e} value={e} />)}
      </datalist>
    </DndContext>
  );
}
