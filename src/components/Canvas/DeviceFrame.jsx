// CSS-rendered iPad frame — home button era (iPad 1–Air 1)
// All models share 768×1024 logical points in portrait.
// The outer frame scales via CSS transform to fit available height.

export default function DeviceFrame({ children, scale = 1 }) {
  // Frame constants (portrait orientation, in canvas px before scaling)
  const frameW = 768 + 80;  // screen + bezel left+right
  const frameH = 1024 + 160; // screen + bezel top+bottom

  return (
    <div
      style={{
        transformOrigin: 'top center',
        transform: `scale(${scale})`,
        width: frameW,
        height: frameH,
        position: 'relative',
        flexShrink: 0,
      }}
    >
      {/* Outer frame body */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 40,
          background: '#2a2a2a',
          boxShadow: '0 8px 40px #0006, 0 0 0 2px #555 inset',
        }}
      />

      {/* Camera */}
      <div
        style={{
          position: 'absolute',
          top: 22,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: '#444',
          border: '1px solid #666',
        }}
      />

      {/* Home button */}
      <div
        style={{
          position: 'absolute',
          bottom: 18,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: '#1a1a1a',
          border: '2px solid #555',
          boxShadow: '0 0 0 2px #333 inset',
        }}
      />

      {/* Screen inset */}
      <div
        style={{
          position: 'absolute',
          top: 80,
          left: 40,
          width: 768,
          height: 1024,
          background: '#1a1a2e',
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  );
}
