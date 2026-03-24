import { useRef } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { tileGeometry } from '../../utils/gridLayout';
import WidgetPreview from './WidgetPreview';

// iOS app default colors (matched from DashboardViewController.m)
const TYPE_BG = {
  light:  (fmt) => fmt.offBgColor || '#333347',   // rgba(0.20, 0.20, 0.28)
  switch: (fmt) => fmt.offBgColor || '#333347',
  scene:  (fmt) => fmt.offBgColor || '#333333',   // rgba(0.20, 0.20, 0.20)
  button: (fmt) => fmt.bgColor    || '#594040',   // rgba(0.35, 0.25, 0.25)
};

export default function WidgetTile({ widget, grid, isSelected, hasOverlap, onSelect, onResize, onDelete }) {
  const geo = tileGeometry(widget, grid);

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: widget.id,
    data: { dragType: 'move', widgetId: widget.id },
  });

  // Resize handle
  const resizeRef = useRef(null);
  const resizeState = useRef(null);

  function onResizePointerDown(e) {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    resizeState.current = {
      startX: e.clientX,
      startY: e.clientY,
      origW: widget.w,
      origH: widget.h,
    };
  }

  function onResizePointerMove(e) {
    if (!resizeState.current) return;
    const cellW = grid.widget_dimensions[0];
    const cellH = grid.widget_dimensions[1];
    const dx = e.clientX - resizeState.current.startX;
    const dy = e.clientY - resizeState.current.startY;
    const newW = Math.max(1, resizeState.current.origW + Math.round(dx / cellW));
    const newH = Math.max(1, resizeState.current.origH + Math.round(dy / cellH));
    onResize(widget.id, newW, newH);
  }

  function onResizePointerUp() {
    resizeState.current = null;
  }

  const fmt = widget.format ?? {};
  const typeBgFn = TYPE_BG[widget.type];
  // iOS default tile bg: rgba(0.18, 0.18, 0.18) = #2e2e2e; editor keeps the dark-blue default
  let bgColor = typeBgFn ? typeBgFn(fmt) : (fmt.bgColor || '#23243a');

  // Climate: tint with the "off" (or first) state color at 25% opacity
  let background = bgColor;
  if (widget.type === 'climate' && widget.state_formats) {
    const offFmt = widget.state_formats.off ?? Object.values(widget.state_formats)[0];
    if (offFmt?.bgColor) {
      background = `linear-gradient(${offFmt.bgColor}40, ${offFmt.bgColor}40), ${bgColor}`;
    }
  }

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={(e) => { e.stopPropagation(); onSelect(widget.id); }}
      style={{
        position: 'absolute',
        left: geo.left,
        top: geo.top,
        width: geo.width,
        height: geo.height,
        background,
        borderRadius: 8,
        border: isSelected
          ? '2px solid #4fc3f7'
          : hasOverlap
          ? '2px solid #ef5350'
          : '1px solid rgba(255,255,255,0.08)',
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: isDragging ? 0.4 : 1,
        overflow: 'hidden',
        boxSizing: 'border-box',
        userSelect: 'none',
        zIndex: isSelected ? 10 : 1,
      }}
    >
      <WidgetPreview widget={widget} tileW={geo.width} tileH={geo.height} />

      {/* Overlap badge */}
      {hasOverlap && (
        <span style={{
          position: 'absolute', top: 2, left: 4,
          fontSize: 9, color: '#ef5350',
          background: '#200000', padding: '1px 3px', borderRadius: 3,
          pointerEvents: 'none',
        }}>
          overlap
        </span>
      )}

      {/* Delete button — shown on hover via CSS class */}
      <button
        className="widget-delete-btn"
        onClick={(e) => { e.stopPropagation(); onDelete(widget.id); }}
        style={{
          position: 'absolute', top: 2, right: 2,
          width: 16, height: 16, borderRadius: '50%',
          border: 'none', background: '#ef5350', color: '#fff',
          fontSize: 10, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 0, lineHeight: 1,
        }}
      >
        ×
      </button>

      {/* Resize handle */}
      <div
        ref={resizeRef}
        onPointerDown={onResizePointerDown}
        onPointerMove={onResizePointerMove}
        onPointerUp={onResizePointerUp}
        style={{
          position: 'absolute', bottom: 0, right: 0,
          width: 14, height: 14,
          cursor: 'se-resize',
          background: 'rgba(255,255,255,0.15)',
          borderRadius: '4px 0 4px 0',
        }}
      />
    </div>
  );
}
