import { WIDGET_TYPES } from '../data/widgetTypes';
import PaletteItem from './PaletteItem';

export default function WidgetPalette() {
  return (
    <aside style={{
      width: 220,
      background: '#fff',
      borderRight: '1px solid #e0e0e0',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '12px 12px 8px', borderBottom: '1px solid #f0f0f0' }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, margin: 0, color: '#333', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Widget Library
        </h2>
        <p style={{ fontSize: 11, color: '#999', margin: '4px 0 0' }}>Drag onto canvas</p>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
        {WIDGET_TYPES.map((t) => (
          <PaletteItem key={t.type} typeDef={t} />
        ))}
      </div>
    </aside>
  );
}
