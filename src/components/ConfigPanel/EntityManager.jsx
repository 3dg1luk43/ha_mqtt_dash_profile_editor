import { useState } from 'react';
import { useEntityStore } from '../../store/entityStore';
import { useHaStore } from '../../store/haStore';

export default function EntityManager() {
  const { entities, addEntity, removeEntity, bulkAdd, clearAll } = useEntityStore();
  const { haUrl, accessToken } = useHaStore();

  const [singleInput, setSingleInput] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [tab, setTab] = useState('list'); // 'list' | 'bulk' | 'sync'
  const [filter, setFilter] = useState('');
  const [syncStatus, setSyncStatus] = useState('');
  const [syncing, setSyncing] = useState(false);

  function handleAdd() {
    addEntity(singleInput);
    setSingleInput('');
  }

  function handleBulkAdd() {
    if (bulkInput.trim()) {
      bulkAdd(bulkInput);
      setBulkInput('');
      setTab('list');
    }
  }

  async function handleSyncFromHA() {
    const url = (haUrl || '').replace(/\/$/, '');
    const token = accessToken;
    if (!url || !token) {
      setSyncStatus('error:Connect to HA first (use Import/Export → Send to HA to set credentials).');
      return;
    }
    setSyncing(true);
    setSyncStatus('');
    try {
      const res = await fetch(`${url}/api/ha_mqtt_dash/entities`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => res.status);
        setSyncStatus(`error:${res.status}: ${txt}`);
        return;
      }
      const data = await res.json();
      if (!Array.isArray(data.entities)) {
        setSyncStatus('error:Unexpected response format.');
        return;
      }
      bulkAdd(data.entities.join('\n'));
      setSyncStatus(`ok:Imported ${data.entities.length} entities from HA.`);
    } catch (e) {
      setSyncStatus(`error:${e.message}`);
    } finally {
      setSyncing(false);
    }
  }

  const filtered = filter
    ? entities.filter((e) => e.toLowerCase().includes(filter.toLowerCase()))
    : entities;

  // Group by domain for readability
  const grouped = {};
  filtered.forEach((e) => {
    const domain = e.includes('.') ? e.split('.')[0] : 'other';
    if (!grouped[domain]) grouped[domain] = [];
    grouped[domain].push(e);
  });

  const statusIsError = syncStatus.startsWith('error:');
  const statusMsg = syncStatus.replace(/^(ok|error):/, '');

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h3 style={sectionTitle}>Entity List</h3>
        <span style={{ fontSize: 11, color: '#999' }}>{entities.length} saved</span>
      </div>

      <p style={{ fontSize: 11, color: '#888', marginBottom: 8, lineHeight: 1.4 }}>
        Entity IDs saved here appear as autocomplete options on all entity fields.
      </p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 10, borderBottom: '1px solid #eee' }}>
        {[['list', 'List'], ['bulk', 'Bulk add'], ['sync', '⟳ Sync from HA']].map(([t, lbl]) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '4px 10px', fontSize: 12, border: 'none', background: 'none', cursor: 'pointer',
            borderBottom: tab === t ? '2px solid #1a237e' : '2px solid transparent',
            color: tab === t ? '#1a237e' : '#666', fontWeight: tab === t ? 600 : 400,
          }}>{lbl}</button>
        ))}
      </div>

      {tab === 'list' && (
        <>
          {/* Add single */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
            <input
              type="text"
              value={singleInput}
              onChange={(e) => setSingleInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="light.bedroom"
              style={{ flex: 1, fontSize: 12, padding: '4px 6px', border: '1px solid #ddd', borderRadius: 4 }}
            />
            <button onClick={handleAdd} style={btnStyle('#1a237e')}>+ Add</button>
          </div>

          {/* Filter */}
          {entities.length > 5 && (
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter entities..."
              style={{ width: '100%', fontSize: 11, padding: '3px 6px', border: '1px solid #eee', borderRadius: 4, marginBottom: 6, boxSizing: 'border-box' }}
            />
          )}

          {/* Entity list grouped by domain */}
          {entities.length === 0 ? (
            <p style={{ fontSize: 11, color: '#bbb', textAlign: 'center', padding: '16px 0' }}>
              No entities yet — add one above, use Bulk add, or Sync from HA
            </p>
          ) : (
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {Object.entries(grouped).sort().map(([domain, ids]) => (
                <div key={domain} style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 10, color: '#999', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
                    {domain}
                  </div>
                  {ids.map((id) => (
                    <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 0' }}>
                      <span style={{ flex: 1, fontSize: 12, color: '#333', fontFamily: 'monospace' }}>{id}</span>
                      <button
                        onClick={() => removeEntity(id)}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ccc', fontSize: 14, padding: '0 2px', lineHeight: 1 }}
                        title="Remove"
                      >×</button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {entities.length > 0 && (
            <button
              onClick={() => { if (window.confirm('Clear all entities?')) clearAll(); }}
              style={{ ...btnStyle('#ef5350'), marginTop: 8, fontSize: 11 }}
            >
              Clear all
            </button>
          )}
        </>
      )}

      {tab === 'bulk' && (
        <>
          <p style={{ fontSize: 11, color: '#777', marginBottom: 6 }}>
            Paste entity IDs — one per line, or comma-separated.<br />
            Tip: copy from HA Developer Tools → States.
          </p>
          <textarea
            value={bulkInput}
            onChange={(e) => setBulkInput(e.target.value)}
            placeholder={'light.bedroom\nswitch.kitchen\nsensor.temperature'}
            rows={8}
            style={{ width: '100%', fontSize: 12, padding: 6, border: '1px solid #ddd', borderRadius: 4, fontFamily: 'monospace', resize: 'vertical', boxSizing: 'border-box' }}
          />
          <button onClick={handleBulkAdd} style={{ ...btnStyle('#1a237e'), marginTop: 6 }}>
            Add all
          </button>
        </>
      )}

      {tab === 'sync' && (
        <>
          <p style={{ fontSize: 11, color: '#777', marginBottom: 10, lineHeight: 1.5 }}>
            Fetches all entity IDs directly from your Home Assistant instance via the MQTTDash API.
            <br /><br />
            Requires HA credentials — connect first using <strong>Import/Export → Send to HA</strong>.
          </p>

          {haUrl && accessToken ? (
            <div style={{ background: '#e8f5e9', border: '1px solid #a5d6a7', borderRadius: 4, padding: '6px 10px', marginBottom: 10, fontSize: 11, color: '#2e7d32' }}>
              Connected to: <strong>{haUrl}</strong>
            </div>
          ) : (
            <div style={{ background: '#fff3e0', border: '1px solid #ffcc80', borderRadius: 4, padding: '6px 10px', marginBottom: 10, fontSize: 11, color: '#e65100' }}>
              Not connected — open Import/Export and authenticate with HA first.
            </div>
          )}

          <button
            onClick={handleSyncFromHA}
            disabled={syncing || !haUrl || !accessToken}
            style={{ ...btnStyle('#1a237e'), opacity: (!haUrl || !accessToken) ? 0.5 : 1, cursor: (!haUrl || !accessToken) ? 'not-allowed' : 'pointer' }}
          >
            {syncing ? 'Fetching…' : '⟳ Fetch entity list from HA'}
          </button>

          {statusMsg && (
            <div style={{
              marginTop: 10, padding: '6px 10px', borderRadius: 4, fontSize: 11,
              background: statusIsError ? '#fdecea' : '#e8f5e9',
              border: `1px solid ${statusIsError ? '#ef9a9a' : '#a5d6a7'}`,
              color: statusIsError ? '#c62828' : '#2e7d32',
            }}>
              {statusMsg}
            </div>
          )}
        </>
      )}
    </div>
  );
}

const sectionTitle = { fontSize: 13, fontWeight: 600, color: '#333', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' };
function btnStyle(bg) {
  return { padding: '4px 10px', fontSize: 12, fontWeight: 500, border: 'none', borderRadius: 4, background: bg, color: '#fff', cursor: 'pointer' };
}
