import { useState } from 'react';
import { useEditorStore } from '../../store/editorStore';

export default function PageTabs() {
  const { pages, activePageIndex, setActivePage, addPage, removePage, renamePage } = useEditorStore();
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState('');

  function startRename(i, name) {
    setEditingIndex(i);
    setEditValue(name);
  }

  function commitRename() {
    if (editingIndex !== null && editValue.trim()) {
      renamePage(editingIndex, editValue.trim());
    }
    setEditingIndex(null);
  }

  function handleRemove(e, i) {
    e.stopPropagation();
    if (pages.length <= 1) return;
    const page = pages[i];
    if (page.widgets.length > 0 && !window.confirm(`Delete "${page.name}" and its ${page.widgets.length} widget(s)?`)) return;
    removePage(i);
  }

  return (
    <div style={{
      height: 40,
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      padding: '0 8px',
      background: '#1e2030',
      borderTop: '1px solid #2a2d40',
      flexShrink: 0,
      overflowX: 'auto',
    }}>
      {pages.map((page, i) => {
        const isActive = i === activePageIndex;
        return (
          <div
            key={page.id}
            onClick={() => setActivePage(i)}
            onDoubleClick={() => startRename(i, page.name)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 10px',
              borderRadius: '4px 4px 0 0',
              background: isActive ? '#2e3250' : 'transparent',
              borderBottom: isActive ? '2px solid #5c7aff' : '2px solid transparent',
              cursor: 'pointer',
              userSelect: 'none',
              flexShrink: 0,
              minWidth: 60,
            }}
          >
            {editingIndex === i ? (
              <input
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setEditingIndex(null); }}
                onClick={(e) => e.stopPropagation()}
                style={{ fontSize: 12, background: '#1a1c2e', color: '#fff', border: '1px solid #5c7aff', borderRadius: 3, padding: '1px 4px', width: 80 }}
              />
            ) : (
              <span style={{ fontSize: 12, color: isActive ? '#fff' : '#8899cc', fontWeight: isActive ? 600 : 400 }}>
                {page.name}
              </span>
            )}
            {pages.length > 1 && (
              <button
                onClick={(e) => handleRemove(e, i)}
                title="Delete page"
                style={{ border: 'none', background: 'none', color: '#556', cursor: 'pointer', fontSize: 13, padding: '0 1px', lineHeight: 1 }}
              >
                ×
              </button>
            )}
          </div>
        );
      })}

      <button
        onClick={() => addPage(`Page ${pages.length + 1}`)}
        title="Add page"
        style={{ flexShrink: 0, border: '1px dashed #3a3f60', borderRadius: 4, background: 'none', color: '#667', cursor: 'pointer', padding: '3px 8px', fontSize: 13, marginLeft: 4 }}
      >
        + page
      </button>

      <span style={{ marginLeft: 'auto', fontSize: 10, color: '#445', flexShrink: 0 }}>
        Double-click tab to rename
      </span>
    </div>
  );
}
