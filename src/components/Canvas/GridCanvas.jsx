import { useRef } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useEditorStore } from '../../store/editorStore';
import DeviceFrame from './DeviceFrame';
import GridOverlay from './GridOverlay';
import WidgetTile from './WidgetTile';
import { pixelToCell, findOverlaps } from '../../utils/gridLayout';

// iPad screen dimensions in points (fixed for all supported models)
const SCREEN_W = 768;
const SCREEN_H = 1024;
// Frame outer dims
const FRAME_W = SCREEN_W + 80;
const FRAME_H = SCREEN_H + 160;

export default function GridCanvas({ containerHeight }) {
  const { grid, widgets, selectedWidgetId, selectWidget, moveWidget, resizeWidget, removeWidget, addWidget } = useEditorStore();

  // Scale to fit container height with some padding
  const scale = Math.min(1, (containerHeight - 32) / FRAME_H);

  const canvasRef = useRef(null);

  const { setNodeRef, isOver } = useDroppable({ id: 'grid-canvas' });

  // Compute overlap sets
  const overlappingIds = new Set();
  widgets.forEach((w) => {
    if (findOverlaps(w, widgets).length > 0) overlappingIds.add(w.id);
  });

  // Convert drop pointer offset to grid cell
  function getDropCell(pointerX, pointerY) {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    // Pointer relative to screen inset origin (accounting for scale & frame bezel)
    const screenLeft = rect.left + 40 * scale;
    const screenTop = rect.top + 80 * scale;
    const px = (pointerX - screenLeft) / scale;
    const py = (pointerY - screenTop) / scale;
    return pixelToCell(px, py, grid);
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        height: '100%',
        paddingTop: 16,
        overflow: 'hidden',
      }}
    >
      <div
        ref={(el) => { setNodeRef(el); canvasRef.current = el; }}
        style={{
          transformOrigin: 'top center',
          transform: `scale(${scale})`,
          width: FRAME_W,
          height: FRAME_H,
          flexShrink: 0,
          position: 'relative',
          outline: isOver ? '3px solid #4fc3f7' : 'none',
          borderRadius: 40,
        }}
        onClick={() => selectWidget(null)}
      >
        <DeviceFrame scale={1}>
          {/* Grid overlay */}
          <GridOverlay grid={grid} width={SCREEN_W} height={SCREEN_H} />

          {/* Widget tiles */}
          {widgets.map((w) => (
            <WidgetTile
              key={w.id}
              widget={w}
              grid={grid}
              isSelected={w.id === selectedWidgetId}
              hasOverlap={overlappingIds.has(w.id)}
              onSelect={selectWidget}
              onResize={resizeWidget}
              onDelete={removeWidget}
            />
          ))}
        </DeviceFrame>
      </div>
    </div>
  );
}

// Export helper used by App to resolve drops
export { SCREEN_W, SCREEN_H, FRAME_W, FRAME_H };
