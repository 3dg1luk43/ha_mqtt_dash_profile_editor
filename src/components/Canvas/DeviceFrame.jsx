// CSS-rendered iPad frame (home-button era)
// Accepts actual screen dimensions — portrait or landscape.

export default function DeviceFrame({ screenW, screenH, orientation = 'portrait', children }) {
  const isLandscape = orientation === 'landscape';

  // Bezel sizes (unscaled px)
  const bezelSide = isLandscape ? 80 : 40;   // left/right bezel
  const bezelTop = isLandscape ? 40 : 80;    // top bezel
  const bezelBottom = isLandscape ? 40 : 80; // bottom bezel (contains home button)
  const homeBezel = 80; // the side that has the home button

  const frameW = screenW + 2 * bezelSide;
  const frameH = screenH + bezelTop + bezelBottom;

  // Home button position
  const homeBtn = isLandscape
    ? { right: 16, top: '50%', transform: 'translateY(-50%)', position: 'absolute' }
    : { bottom: 16, left: '50%', transform: 'translateX(-50%)', position: 'absolute' };

  // Camera position
  const camera = isLandscape
    ? { left: 16, top: '50%', transform: 'translateY(-50%)', position: 'absolute' }
    : { top: 22, left: '50%', transform: 'translateX(-50%)', position: 'absolute' };

  return (
    <div style={{ width: frameW, height: frameH, position: 'relative', flexShrink: 0 }}>
      {/* Outer frame body */}
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 40,
        background: '#2a2a2a',
        boxShadow: '0 8px 40px #0006, 0 0 0 2px #555 inset',
      }} />

      {/* Camera dot */}
      <div style={{
        ...camera,
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: '#444',
        border: '1px solid #666',
      }} />

      {/* Home button */}
      <div style={{
        ...homeBtn,
        width: 48,
        height: 48,
        borderRadius: '50%',
        background: '#1a1a1a',
        border: '2px solid #555',
        boxShadow: '0 0 0 2px #333 inset',
      }} />

      {/* Screen */}
      <div style={{
        position: 'absolute',
        top: bezelTop,
        left: bezelSide,
        width: screenW,
        height: screenH,
        background: '#1a1a2e',
        overflow: 'hidden',
      }}>
        {children}
      </div>
    </div>
  );
}
