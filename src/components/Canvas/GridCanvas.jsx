import { useDroppable } from '@dnd-kit/core';
import { useEditorStore, effectiveGrid } from '../../store/editorStore';
import DeviceFrame from './DeviceFrame';
import GridOverlay from './GridOverlay';
import WidgetTile from './WidgetTile';
import { findOverlaps, tileGeometry } from '../../utils/gridLayout';

export function getFrameDims(device, orientation) {
  // Use logical points — the coordinate system MQTTDash uses for layout.
  // All iPads are 768×1024 pt; bezel is a fixed pt value (approx real physical size).
  const [pw, ph] = device.points ?? [768, 1024];
  const [screenW, screenH] = orientation === 'landscape' ? [ph, pw] : [pw, ph];
  const bezelSide = orientation === 'landscape' ? 50 : 32;
  const bezelTop  = orientation === 'landscape' ? 32 : 50;
  const bezelBot  = orientation === 'landscape' ? 32 : 50;
  const frameW = screenW + 2 * bezelSide;
  const frameH = screenH + bezelTop + bezelBot;
  return { screenW, screenH, frameW, frameH, bezelLeft: bezelSide, bezelTop };
}

export default function GridCanvas({ containerWidth, containerHeight, dropPreview }) {
  const { grid, pages, activePageIndex, selectedWidgetId, selectWidget, resizeWidget, removeWidget, device, orientation } = useEditorStore();

  const activePage = pages[activePageIndex] ?? pages[0];
  const widgets = activePage?.widgets ?? [];
  const pageGrid = effectiveGrid(grid, activePage);

  const { screenW, screenH, frameW, frameH } = getFrameDims(device, orientation);

  const scaleH = (containerHeight - 32) / frameH;
  const scaleW = (containerWidth - 32) / frameW;
  const scale = Math.min(1, scaleH, scaleW);

  const { setNodeRef, isOver } = useDroppable({ id: 'grid-canvas' });

  const overlappingIds = new Set();
  widgets.forEach((w) => {
    if (findOverlaps(w, widgets).length > 0) overlappingIds.add(w.id);
  });

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      height: '100%',
      paddingTop: 16,
      overflow: 'hidden',
    }}>
      <div
        ref={setNodeRef}
        style={{
          transformOrigin: 'top center',
          transform: `scale(${scale})`,
          width: frameW,
          height: frameH,
          flexShrink: 0,
          position: 'relative',
          outline: isOver ? '3px solid #4fc3f7' : 'none',
          borderRadius: 40 * (device.scale ?? 1),
        }}
        onClick={() => selectWidget(null)}
      >
        <DeviceFrame screenW={screenW} screenH={screenH} orientation={orientation}>
          <GridOverlay grid={pageGrid} width={screenW} height={screenH} />
          {dropPreview && (() => {
            const geo = tileGeometry(dropPreview, pageGrid);
            return (
              <div style={{
                position: 'absolute',
                left: geo.left,
                top: geo.top,
                width: geo.width,
                height: geo.height,
                background: 'rgba(79,195,247,0.18)',
                border: '2px dashed #4fc3f7',
                borderRadius: 6,
                pointerEvents: 'none',
                zIndex: 5,
              }} />
            );
          })()}
          {widgets.map((w) => (
            <WidgetTile
              key={w.id}
              widget={w}
              grid={pageGrid}
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
