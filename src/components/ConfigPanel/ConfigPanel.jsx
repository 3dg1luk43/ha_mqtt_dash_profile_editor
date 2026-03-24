import { useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
import GridConfigSection from './GridConfigSection';
import EntityManager from './EntityManager';
import CommonFields from './CommonFields';
import FormatFields from './FormatFields';
import SensorConfig from './widget_configs/SensorConfig';
import LabelConfig from './widget_configs/LabelConfig';
import ClockConfig from './widget_configs/ClockConfig';
import WeatherConfig from './widget_configs/WeatherConfig';
import ClimateConfig from './widget_configs/ClimateConfig';
import CameraConfig from './widget_configs/CameraConfig';
import PrinterConfig from './widget_configs/PrinterConfig';
import TimerConfig from './widget_configs/TimerConfig';
import WebpageConfig from './widget_configs/WebpageConfig';
import MealieConfig from './widget_configs/MealieConfig';
import SousvideConfig from './widget_configs/SousvideConfig';
import ApplianceConfig from './widget_configs/ApplianceConfig';
import LightConfig from './widget_configs/LightConfig';

const SENSOR_TYPES = ['sensor', 'value', 'person'];

export default function ConfigPanel() {
  const { pages, activePageIndex, selectedWidgetId, updateWidget } = useEditorStore();
  const widgets = pages[activePageIndex]?.widgets ?? [];
  const selected = widgets.find((w) => w.id === selectedWidgetId);
  const [noSelTab, setNoSelTab] = useState('grid'); // 'grid' | 'entities'

  function handleChange(patch) {
    if (selected) updateWidget(selected.id, patch);
  }

  return (
    <aside style={{
      width: 340,
      background: '#fff',
      borderLeft: '1px solid #e0e0e0',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '10px 12px', borderBottom: '1px solid #f0f0f0', flexShrink: 0 }}>
        <h2 style={{ fontSize: 13, fontWeight: 600, margin: 0, color: '#333', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {selected ? `${getIcon(selected.type)} ${selected.type}` : 'Config Panel'}
        </h2>
        {selected && (
          <p style={{ fontSize: 11, color: '#999', margin: '2px 0 0' }}>
            {selected.label || selected.entity_id || 'unnamed'} · {selected.w}×{selected.h} cells
          </p>
        )}
      </div>

      {/* Tab bar — only when no widget selected */}
      {!selected && (
        <div style={{ display: 'flex', borderBottom: '1px solid #f0f0f0', flexShrink: 0 }}>
          {[['grid', '⚙ Grid'], ['entities', '🗂 Entities']].map(([t, lbl]) => (
            <button key={t} onClick={() => setNoSelTab(t)} style={{
              flex: 1, padding: '7px 0', fontSize: 12, border: 'none', background: 'none', cursor: 'pointer',
              borderBottom: noSelTab === t ? '2px solid #1a237e' : '2px solid transparent',
              color: noSelTab === t ? '#1a237e' : '#777', fontWeight: noSelTab === t ? 600 : 400,
            }}>{lbl}</button>
          ))}
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
        {selected ? (
          <>
            <CommonFields widget={selected} onChange={handleChange} />
            <div style={divider} />
            <TypeConfig widget={selected} onChange={handleChange} />
            <div style={divider} />
            <FormatFields format={selected.format} onChange={(format) => handleChange({ format })} />
          </>
        ) : noSelTab === 'grid' ? (
          <GridConfigSection />
        ) : (
          <EntityManager />
        )}
      </div>
    </aside>
  );
}

function TypeConfig({ widget, onChange }) {
  const t = widget.type;
  if (t === 'light') return <LightConfig widget={widget} onChange={onChange} />;
  if (SENSOR_TYPES.includes(t)) return <SensorConfig widget={widget} onChange={onChange} />;
  if (t === 'label') return <LabelConfig widget={widget} onChange={onChange} />;
  if (t === 'clock') return <ClockConfig widget={widget} onChange={onChange} />;
  if (t === 'weather') return <WeatherConfig widget={widget} onChange={onChange} />;
  if (t === 'climate') return <ClimateConfig widget={widget} onChange={onChange} />;
  if (t === 'camera') return <CameraConfig widget={widget} onChange={onChange} />;
  if (t === 'printer') return <PrinterConfig widget={widget} onChange={onChange} />;
  if (t === 'timer') return <TimerConfig widget={widget} onChange={onChange} />;
  if (t === 'webpage') return <WebpageConfig widget={widget} onChange={onChange} />;
  if (t === 'mealie') return <MealieConfig widget={widget} onChange={onChange} />;
  if (t === 'sousvide') return <SousvideConfig widget={widget} onChange={onChange} />;
  if (t === 'appliance') return <ApplianceConfig widget={widget} onChange={onChange} />;
  return null;
}

function getIcon(type) {
  const icons = { light: '💡', switch: '🔀', scene: '🎬', sensor: '📟', value: '🔢', person: '🧑', button: '🔘', label: '🏷️', clock: '⏰', weather: '🌦️', climate: '🌡️', camera: '📷', printer: '🖨️', timer: '⏱️', webpage: '🌐', mealie: '🍽️', sousvide: '♨️', appliance: '🏠' };
  return icons[type] ?? '?';
}

const divider = { height: 1, background: '#f0f0f0', margin: '12px 0' };
