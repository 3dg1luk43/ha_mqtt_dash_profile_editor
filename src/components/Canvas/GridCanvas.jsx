import { useDroppable } from '@dnd-kit/core';
import { useEditorStore } from '../../store/editorStore';
import DeviceFrame from './DeviceFrame';
import GridOverlay from './GridOverlay';
import WidgetTile from './WidgetTile';
import { findOverlaps } from '../../utils/gridLayout';

export function getFrameDims(device, orientation) {
  const [pw, ph] = device.points;
  const [screenW, screenH] = orientation === 'landscape' ? [ph, pw] : [pw, ph];
  const bezelSide = orientation === 'landscape' ? 80 : 40;
  const bezelTop  = orientation === 'landscape' ? 40 : 80;
  const bezelBot  = orientation === 'landscape' ? 40 : 80;
  const frameW = screenW + 2 * bezelSide;
  const frameH = screenH + bezelTop + bezelBot;
  const bezelLeft = bezelSide;
  return { screenW, screenH, frameW, frameH, bezelLeft, bezelTop };
}

export default function GridCanvas({ containerWidth, containerHeight }) {
  const { grid, widgets, selectedWidgetId, selectWidget, moveWidget, resizeWidget, removeWidget, device, orientation } = useEditorStore();

  const { screenW, screenH, frameW, frameH } = getFrameDims(device, orientation);

  // Scale to fit container — constrain by both axes
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
          borderRadius: 40,
        }}
        onClick={() => selectWidget(null)}
      >
        <DeviceFrame screenW={screenW} screenH={screenH} orientation={orientation}>
          <GridOverlay grid={grid} width={screenW} height={screenH} />
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
