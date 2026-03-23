import { useState, useEffect, useRef } from 'react';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useEditorStore } from './store/editorStore';
import { WIDGET_TYPES } from './data/widgetTypes';
import { pixelToCell, tileGeometry } from './utils/gridLayout';
import { getFrameDims } from './components/Canvas/GridCanvas';
import { parseProfile, profileToState } from './utils/profileExport';

import Header from './components/Header';
import DeviceSelector from './components/DeviceSelector';
import WidgetPalette from './components/WidgetPalette';
import GridCanvas from './components/Canvas/GridCanvas';
import { getNavOffset } from './components/Canvas/GridCanvas';
import ConfigPanel from './components/ConfigPanel/ConfigPanel';
import ImportExportModal from './components/ImportExport/ImportExportModal';
import WelcomeModal from './components/WelcomeModal';
import { useEntityStore } from './store/entityStore';

import './App.css';

const WELCOME_KEY = 'mqttdash-welcomed-v1';

export default function App() {
  const [modal, setModal] = useState(null);
  const [showWelcome, setShowWelcome] = useState(() => !localStorage.getItem(WELCOME_KEY));
  const { addWidget, moveWidget, pages, activePageIndex, grid, device, orientation, navbar_edge, undo, redo, setGridConfig, setPages, setBanner, setNavbarEdge } = useEditorStore();
  const widgets = pages[activePageIndex]?.widgets ?? [];

  // Auto-import shared profile from URL hash
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith('#profile=')) return;
    try {
      // Reverse URL-safe base64: restore + and / then re-pad to multiple of 4
      const raw = hash.slice('#profile='.length).replace(/-/g, '+').replace(/_/g, '/');
      const padded = raw + '='.repeat((4 - raw.length % 4) % 4);
      const json = decodeURIComponent(atob(padded));
      const result = parseProfile(json);
      if (result.ok) {
        const s = profileToState(result.data);
        setGridConfig(s.grid);
        setPages(s.pages);
        setBanner(s.banner ?? '');
        if (s.navbar_edge) setNavbarEdge(s.navbar_edge);
      }
    } catch (_) { /* ignore malformed share links */ }
    history.replaceState(null, '', window.location.pathname);
  }, []);
  const entities = useEntityStore((s) => s.entities);
  const [activeItem, setActiveItem] = useState(null);
  const [dropPreview, setDropPreview] = useState(null);

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
    setDropPreview(null);
  }

  function handleDragMove(event) {
    if (!event.over) { setDropPreview(null); return; }
    const data = event.active.data.current;
    if (!data) return;
    const cell = dropCell(event);
    if (!cell) { setDropPreview(null); return; }
    let w = 1, h = 1;
    if (data.dragType === 'move') {
      const wi = widgets.find((x) => x.id === data.widgetId);
      if (wi) { w = wi.w; h = wi.h; }
    }
    setDropPreview((prev) => {
      if (prev?.x === cell.x && prev?.y === cell.y && prev?.w === w && prev?.h === h) return prev;
      return { x: cell.x, y: cell.y, w, h };
    });
  }

  function getCanvasScale() {
    const { frameW, frameH } = getFrameDims(device, orientation);
    return Math.min(1, (canvasSize.h - 32) / frameH, (canvasSize.w - 32) / frameW);
  }

  function dropCell(event) {
    // Use over.rect — the actual visual ClientRect of the scaled droppable frame div.
    const { over, delta, active } = event;
    if (!over) return null;

    const { frameW, frameH, bezelLeft, bezelTop } = getFrameDims(device, orientation);
    const scale = Math.min(1, (canvasSize.h - 32) / frameH, (canvasSize.w - 32) / frameW);

    const overRect = over.rect;
    const finalX = (event.activatorEvent?.clientX ?? 0) + delta.x;
    const finalY = (event.activatorEvent?.clientY ?? 0) + delta.y;

    // Screen origin in screen-space
    const screenLeft = overRect.left + bezelLeft * scale;
    const screenTop  = overRect.top  + bezelTop  * scale;

    // Nav bar offset: widget content area starts after the nav bar
    const navOff = getNavOffset(navbar_edge);
    let px = (finalX - screenLeft) / scale - navOff.x;
    let py = (finalY - screenTop)  / scale - navOff.y;

    // For move drags: offset by grab position so widget top-left aligns to drop cell.
    const data = active?.data?.current;
    if (data?.dragType === 'move') {
      const wi = widgets.find((x) => x.id === data.widgetId);
      if (wi) {
        const pageGrid = pages[activePageIndex]?.grid ?? grid;
        const geo = tileGeometry(wi, pageGrid);
        const grabX = (event.activatorEvent.clientX - screenLeft) / scale - navOff.x - geo.left;
        const grabY = (event.activatorEvent.clientY - screenTop)  / scale - navOff.y - geo.top;
        px -= grabX;
        py -= grabY;
      }
    }

    return pixelToCell(px, py, grid);
  }

  function handleDragEnd(event) {
    setActiveItem(null);
    setDropPreview(null);
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
    const csScale = getCanvasScale();
    const cellW = grid.widget_dimensions[0] * csScale;
    const cellH = grid.widget_dimensions[1] * csScale;

    let tileW, tileH, icon, label, bgColor, textColor;

    if (activeItem.dragType === 'new') {
      const t = WIDGET_TYPES.find((x) => x.type === activeItem.widgetType);
      tileW = cellW; tileH = cellH;
      icon = t?.icon ?? '?'; label = t?.label ?? activeItem.widgetType;
      bgColor = '#23243a'; textColor = '#e0e0e0';
    } else if (activeItem.dragType === 'move') {
      const wi = widgets.find((x) => x.id === activeItem.widgetId);
      if (!wi) return null;
      const t = WIDGET_TYPES.find((x) => x.type === wi.type) ?? { icon: '?', label: wi.type };
      tileW = wi.w * cellW; tileH = wi.h * cellH;
      icon = t.icon; label = wi.label || wi.entity_id || t.label;
      bgColor = wi.format?.bgColor || '#23243a';
      textColor = wi.format?.textColor || '#e0e0e0';
    } else {
      return null;
    }

    return (
      <div style={{
        width: tileW, height: tileH,
        background: bgColor,
        borderRadius: 6,
        border: '2px solid #4fc3f7',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        opacity: 0.82,
        boxShadow: '0 4px 20px #0005',
        overflow: 'hidden',
        pointerEvents: 'none',
        padding: '4px 6px',
        boxSizing: 'border-box',
      }}>
        <span style={{ fontSize: Math.max(12, cellH * 0.3), lineHeight: 1 }}>{icon}</span>
        <span style={{ color: textColor, fontSize: Math.max(9, cellH * 0.12), marginTop: 2, textAlign: 'center', wordBreak: 'break-word', maxWidth: '100%' }}>{label}</span>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragMove={handleDragMove} onDragEnd={handleDragEnd}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#f0f2f5' }}>
        <Header onImport={() => setModal('import')} onExport={() => setModal('export')} onHelp={() => setShowWelcome(true)} />
        <DeviceSelector />

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <WidgetPalette />
          <main ref={canvasAreaRef} style={{ flex: 1, overflow: 'hidden', background: '#e4e7ef', position: 'relative' }}>
            <GridCanvas
              containerWidth={canvasSize.w}
              containerHeight={canvasSize.h}
              dropPreview={dropPreview}
            />
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
