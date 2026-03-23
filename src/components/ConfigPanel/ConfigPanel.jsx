import { useEditorStore } from '../../store/editorStore';
import GridConfigSection from './GridConfigSection';
import CommonFields from './CommonFields';
import FormatFields from './FormatFields';
import SensorConfig from './widget_configs/SensorConfig';
import LabelConfig from './widget_configs/LabelConfig';
import ClockConfig from './widget_configs/ClockConfig';
import WeatherConfig from './widget_configs/WeatherConfig';
import ClimateConfig from './widget_configs/ClimateConfig';
import CameraConfig from './widget_configs/CameraConfig';
import PrinterConfig from './widget_configs/PrinterConfig';

const SENSOR_TYPES = ['sensor', 'value', 'person'];

export default function ConfigPanel() {
  const { widgets, selectedWidgetId, updateWidget } = useEditorStore();
  const selected = widgets.find((w) => w.id === selectedWidgetId);

  function handleChange(patch) {
    if (selected) updateWidget(selected.id, patch);
  }

  function handleFormatChange(format) {
    handleChange({ format });
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

      <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
        {!selected ? (
          <GridConfigSection />
        ) : (
          <>
            <CommonFields widget={selected} onChange={handleChange} />
            <div style={divider} />
            <TypeConfig widget={selected} onChange={handleChange} />
            <div style={divider} />
            <FormatFields format={selected.format} onChange={handleFormatChange} />
          </>
        )}
      </div>
    </aside>
  );
}

function TypeConfig({ widget, onChange }) {
  const t = widget.type;
  if (SENSOR_TYPES.includes(t)) return <SensorConfig widget={widget} onChange={onChange} />;
  if (t === 'label') return <LabelConfig widget={widget} onChange={onChange} />;
  if (t === 'clock') return <ClockConfig widget={widget} onChange={onChange} />;
  if (t === 'weather') return <WeatherConfig widget={widget} onChange={onChange} />;
  if (t === 'climate') return <ClimateConfig widget={widget} onChange={onChange} />;
  if (t === 'camera') return <CameraConfig widget={widget} onChange={onChange} />;
  if (t === 'printer') return <PrinterConfig widget={widget} onChange={onChange} />;
  return null; // light, switch, scene, button — no extra fields
}

function getIcon(type) {
  const icons = { light: '💡', switch: '🔀', scene: '🎬', sensor: '📟', value: '🔢', person: '🧑', button: '🔘', label: '🏷️', clock: '⏰', weather: '🌦️', climate: '🌡️', camera: '📷', printer: '🖨️' };
  return icons[type] ?? '?';
}

const divider = { height: 1, background: '#f0f0f0', margin: '12px 0' };
