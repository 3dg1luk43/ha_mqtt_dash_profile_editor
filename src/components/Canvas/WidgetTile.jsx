import { useRef } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { tileGeometry } from '../../utils/gridLayout';
import { WIDGET_TYPES } from '../../data/widgetTypes';

export default function WidgetTile({ widget, grid, isSelected, hasOverlap, onSelect, onResize, onDelete }) {
  const geo = tileGeometry(widget, grid);
  const typeDef = WIDGET_TYPES.find((t) => t.type === widget.type) ?? { icon: '?', label: widget.type };

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

  // Background from format
  const fmt = widget.format ?? {};
  const bgColor = fmt.bgColor || '#23243a';
  const textColor = fmt.textColor || '#e0e0e0';
  const textSize = fmt.textSize ? `${fmt.textSize}px` : '14px';
  const align = fmt.align || 'center';

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
        background: bgColor,
        borderRadius: 6,
        border: isSelected
          ? '2px solid #4fc3f7'
          : hasOverlap
          ? '2px solid #ef5350'
          : '1px solid rgba(255,255,255,0.08)',
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: isDragging ? 0.4 : 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center',
        justifyContent: 'center',
        padding: '4px 6px',
        boxSizing: 'border-box',
        userSelect: 'none',
        zIndex: isSelected ? 10 : 1,
      }}
    >
      {/* Type icon + label */}
      <span style={{ fontSize: 18, lineHeight: 1 }}>{typeDef.icon}</span>
      <span style={{ color: textColor, fontSize: textSize, lineHeight: 1.2, marginTop: 2, textAlign: align, wordBreak: 'break-word', maxWidth: '100%' }}>
        {widget.label || widget.entity_id || typeDef.label}
      </span>
      {widget.entity_id && widget.label && (
        <span style={{ color: '#888', fontSize: '10px', marginTop: 1, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {widget.entity_id}
        </span>
      )}

      {/* Overlap tooltip */}
      {hasOverlap && (
        <span style={{ position: 'absolute', top: 2, left: 4, fontSize: 9, color: '#ef5350', background: '#200000', padding: '1px 3px', borderRadius: 3 }}>
          overlap
        </span>
      )}

      {/* Delete button — shown on hover via CSS class */}
      <button
        className="widget-delete-btn"
        onClick={(e) => { e.stopPropagation(); onDelete(widget.id); }}
        style={{
          position: 'absolute',
          top: 2,
          right: 2,
          width: 16,
          height: 16,
          borderRadius: '50%',
          border: 'none',
          background: '#ef5350',
          color: '#fff',
          fontSize: 10,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          lineHeight: 1,
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
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: 14,
          height: 14,
          cursor: 'se-resize',
          background: 'rgba(255,255,255,0.15)',
          borderRadius: '4px 0 4px 0',
        }}
      />
    </div>
  );
}
