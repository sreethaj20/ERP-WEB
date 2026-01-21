import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function ShiftExtensions() {
  const { listAssignedShiftExtensions, updateShiftExtensionStatus } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [error, setError] = useState('');
  const [q, setQ] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const rows = await listAssignedShiftExtensions(filter);
      setItems(Array.isArray(rows) ? rows : []);
    } catch (e) {
      setError(e?.message || 'Failed to load shift extensions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const onUpd = () => load();
    window.addEventListener('erp-shift-requests-updated', onUpd);
    return () => window.removeEventListener('erp-shift-requests-updated', onUpd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter(r => (
      String(r.employeeEmail||'').toLowerCase().includes(term) ||
      String(r.shiftType||'').toLowerCase().includes(term) ||
      String(r.status||'').toLowerCase().includes(term)
    ));
  }, [items, q]);

  const act = async (id, status, currentStatus) => {
    const cur = String(currentStatus || '').toLowerCase();
    if (cur === 'approved' || cur === 'rejected') {
      return; // already finalized; do nothing
    }
    try {
      await updateShiftExtensionStatus(id, status);
      await load();
    } catch (e) {
      alert(e?.message || 'Action failed');
    }
  };

  const Badge = ({ status }) => {
    const s = String(status||'').toLowerCase();
    const palette = s === 'approved'
      ? { bg: '#ECFDF5', text: '#065F46', bd: '#10B981' }
      : s === 'rejected'
        ? { bg: '#FEF2F2', text: '#991B1B', bd: '#EF4444' }
        : { bg: '#EFF6FF', text: '#1E40AF', bd: '#3B82F6' };
    return (
      <span style={{
        display: 'inline-block', padding: '4px 10px', borderRadius: 999,
        background: palette.bg, color: palette.text, border: `1px solid ${palette.bd}`, fontWeight: 600, fontSize: 12
      }}>
        {String(status).charAt(0).toUpperCase() + String(status).slice(1)}
      </span>
    );
  };

  const ActionBtn = ({ kind = 'approve', disabled, onClick, children }) => {
    const isApprove = kind === 'approve';
    const styles = isApprove
      ? { bg: '#10B981', bgH: '#059669' }
      : { bg: '#EF4444', bgH: '#DC2626' };
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        style={{
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          background: styles.bg,
          color: 'white',
          border: 'none',
          padding: '8px 12px',
          borderRadius: 8,
          fontWeight: 600,
          transition: 'all .15s ease',
        }}
        onMouseOver={(e) => !disabled && (e.currentTarget.style.background = styles.bgH)}
        onMouseOut={(e) => !disabled && (e.currentTarget.style.background = styles.bg)}
      >
        {children}
      </button>
    );
  };

  return (
    <div style={page}>
      <div style={headerWrap}>
        <div>
          <h2 style={title}>Shift Extension Requests</h2>
          {/* <p style={subtitle}>Review and act on your team’s login extension requests.</p> */}
        </div>
        <div style={toolbar}>
          <div style={segmented}>
            {['pending','approved','rejected',''].map((f, i) => (
              <button
                key={i}
                onClick={() => setFilter(f)}
                style={{
                  ...segmentBtn,
                  ...(filter === f ? segmentBtnActive : {})
                }}
              >{f ? f.charAt(0).toUpperCase()+f.slice(1) : 'All'}</button>
            ))}
          </div>
          <div style={searchWrap}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search employee, status..."
              style={searchInput}
            />
            <button onClick={load} style={refreshBtn}>Refresh</button>
          </div>
        </div>
      </div>

      {error && <div style={errorBox}>{error}</div>}

      <div style={card}>
        {loading ? (
          <div style={skeletonRow}>Loading requests…</div>
        ) : filtered.length === 0 ? (
          <div style={emptyWrap}>
            <div style={emptyIcon}>⏱️</div>
            <div style={{ fontWeight: 700, fontSize: 18, marginTop: 4 }}>No requests found</div>
            <div style={{ color: '#6B7280', marginTop: 2 }}>Try changing the filter or refreshing.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            {(() => { const showActions = filter === 'pending'; return (
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Employee ID</th>
                  <th style={th}>Employee</th>
                  <th style={th}>Shift</th>
                  
                  
                  <th style={th}>Status</th>
                  <th style={th}>Requested</th>
                  {showActions && <th style={th}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, idx) => (
                  <tr key={r.id} style={{ background: idx % 2 ? '#FCFCFD' : 'white' }}>
                    <td style={td}>{r.employeeId || '-'}</td>
                    <td style={td}>
                      <div style={{ fontWeight: 600 }}>{r.employeeEmail}</div>
                    </td>
                    <td style={td}>{r.shiftType || '-'}</td>
                    <td style={td}><Badge status={r.status} /></td>
                    <td style={td}>{r.createdAt ? new Date(r.createdAt).toLocaleString() : '-'}</td>
                    {showActions && (
                      <td style={{ ...td, whiteSpace: 'nowrap' }}>
                        {(() => {
                          const s = String(r.status).toLowerCase();
                          const isFinal = s === 'approved' || s === 'rejected';
                          return (
                            <>
                              <ActionBtn
                                kind="approve"
                                disabled={isFinal}
                                onClick={() => act(r.id, 'approved', r.status)}
                              >Approve</ActionBtn>
                              <span style={{ display: 'inline-block', width: 8 }} />
                              <ActionBtn
                                kind="reject"
                                disabled={isFinal}
                                onClick={() => act(r.id, 'rejected', r.status)}
                              >Reject</ActionBtn>
                            </>
                          );
                        })()}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            ); })()}
          </div>
        )}
      </div>
    </div>
  );
}

const page = { padding: 20, maxWidth: 1200, margin: '0 auto' };
const headerWrap = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, marginBottom: 16 };
const title = { margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: -.3 };
const subtitle = { margin: '4px 0 0', color: '#6B7280' };
const toolbar = { display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' };
const segmented = { display: 'inline-flex', padding: 4, background: '#F3F4F6', borderRadius: 12, border: '1px solid #E5E7EB' };
const segmentBtn = { border: 'none', background: 'transparent', padding: '6px 12px', borderRadius: 8, fontWeight: 600, color: '#374151', cursor: 'pointer' };
const segmentBtnActive = { background: 'white', boxShadow: '0 1px 0 rgba(0,0,0,.04)', color: '#111827', border: '1px solid #E5E7EB' };
const searchWrap = { display: 'flex', gap: 8 };
const searchInput = { padding: '8px 10px', borderRadius: 8, border: '1px solid #E5E7EB', minWidth: 260 };
const refreshBtn = { padding: '8px 12px', borderRadius: 8, border: '1px solid #E5E7EB', background: 'white', cursor: 'pointer', fontWeight: 600 };

const card = { background: 'white', border: '1px solid #E5E7EB', borderRadius: 12, padding: 12 };
const table = { width: '100%', borderCollapse: 'separate', borderSpacing: 0 };
const th = { textAlign: 'left', padding: '12px 10px', borderBottom: '1px solid #E5E7EB', fontSize: 12, letterSpacing: .3, color: '#6B7280', textTransform: 'uppercase' };
const td = { padding: '12px 10px', borderBottom: '1px solid #F3F4F6', color: '#111827' };
const errorBox = { background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA', padding: 10, borderRadius: 8, marginBottom: 12 };
const emptyWrap = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 12px', color: '#6B7280' };
const emptyIcon = { fontSize: 42, opacity: .8 };
const skeletonRow = { padding: 24, color: '#6B7280' };
