import { useDraggable } from '@dnd-kit/core';

export default function PaletteItem({ typeDef }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${typeDef.type}`,
    data: { dragType: 'new', widgetType: typeDef.type },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      title={typeDef.description}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 10px',
        marginBottom: 4,
        borderRadius: 6,
        background: isDragging ? '#e3f2fd' : '#f5f5f5',
        border: '1px solid #e0e0e0',
        cursor: 'grab',
        opacity: isDragging ? 0.5 : 1,
        userSelect: 'none',
        fontSize: 13,
      }}
    >
      <span style={{ fontSize: 18 }}>{typeDef.icon}</span>
      <span style={{ fontWeight: 500, color: '#333' }}>{typeDef.label}</span>
    </div>
  );
}
