import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { WORKER_URL } from '../../config/constants';
import { toast } from '../Common/Utils';
import { Icon } from '../Common/Icons';
import { ACTION_LABELS, ACTION_COLORS } from '../../config/constants';

const AnalyticsView = () => {
  const [logs, setLogs] = useState({
    clickLogs: [],
    actionLogs: [],
    users: {},
    adminUsersCount: 0,
    todayStats: { clicks: 0, actions: 0, newLinks: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${WORKER_URL}/logs`);
      setLogs(await res.json());
    } catch {
      toast('Lỗi tải logs', 'error');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const todayClicks = logs.todayStats?.clicks || 0;
  const todayActions = logs.todayStats?.actions || 0;
  const todayNewLinks = logs.todayStats?.newLinks || 0;

  const deviceStats = useMemo(() => {
    const d = {};
    (logs.clickLogs || []).forEach((l) => {
      const ua = (l.ua || '').toLowerCase();
      const dev = ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')
        ? 'Mobile'
        : ua.includes('tablet') || ua.includes('ipad')
        ? 'Tablet'
        : ua.length > 0
        ? 'Desktop'
        : 'Unknown';
      d[dev] = (d[dev] || 0) + 1;
    });
    return Object.entries(d).sort((a, b) => b[1] - a[1]);
  }, [logs]);

  const geoStats = useMemo(() => {
    const c = {};
    (logs.clickLogs || []).forEach((l) => {
      const co = l.country || 'Unknown';
      c[co] = (c[co] || 0) + 1;
    });
    return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [logs]);

  return (
    <div className="view-section fade-in">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Clicks hôm nay', value: todayClicks, color: 'var(--yellow-dark)' },
          { label: 'Link tạo hôm nay', value: todayNewLinks, color: 'var(--blue)' },
          { label: 'Hành động hôm nay', value: todayActions, color: 'var(--green)' },
          { label: 'Tổng tài khoản', value: logs.adminUsersCount || 0, color: 'var(--purple)' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: 18 }}>
            <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <div className="tab-group">
          {[
            ['overview', 'Tổng quan'],
            ['clicks', 'Click logs'],
            ['actions', 'Action logs'],
          ].map(([k, v]) => (
            <button key={k} className={`tab-btn ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <div className="spinner" />
        </div>
      ) : tab === 'overview' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Icon name="globe" size={15} color="var(--blue)" /> Thiết bị truy cập
              </div>
            </div>
            <div className="card-body">
              {deviceStats.length === 0 ? (
                <div className="empty-state" style={{ padding: '24px 0' }}>
                  <p style={{ fontSize: 13 }}>Chưa có dữ liệu<br /><span style={{ fontSize: 11, color: 'var(--gray-400)' }}>Deploy worker mới để bắt đầu thu thập</span></p>
                </div>
              ) : (
                deviceStats.map(([dev, cnt], i) => {
                  const total = deviceStats.reduce((s, [, c]) => s + c, 0);
                  const pct = total > 0 ? Math.round((cnt / total) * 100) : 0;
                  const cols = ['var(--yellow)', 'var(--blue)', 'var(--green)', 'var(--purple)'];
                  return (
                    <div key={i} style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                        <span style={{ fontWeight: 500 }}>{dev}</span>
                        <span style={{ color: 'var(--gray-500)' }}>{cnt} ({pct}%)</span>
                      </div>
                      <div className="progress-wrap">
                        <div className="progress-bar" style={{ width: `${pct}%`, background: cols[i % cols.length] }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Icon name="globe" size={15} color="var(--green)" /> Vị trí địa lý
              </div>
            </div>
            <div className="card-body">
              {geoStats.length === 0 ? (
                <div className="empty-state" style={{ padding: '24px 0' }}>
                  <p style={{ fontSize: 13 }}>Chưa có dữ liệu<br /><span style={{ fontSize: 11, color: 'var(--gray-400)' }}>Deploy worker mới để bắt đầu thu thập</span></p>
                </div>
              ) : (
                geoStats.map(([co, cnt], i) => {
                  const total = geoStats.reduce((s, [, c]) => s + c, 0);
                  const pct = total > 0 ? Math.round((cnt / total) * 100) : 0;
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, fontSize: 13 }}>
                      <span style={{ width: 80, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{co}</span>
                      <div style={{ flex: 1 }}>
                        <div className="progress-wrap">
                          <div className="progress-bar" style={{ width: `${pct}%`, background: 'var(--green)' }} />
                        </div>
                      </div>
                      <span style={{ width: 36, textAlign: 'right', color: 'var(--gray-500)' }}>{cnt}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : tab === 'clicks' ? (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Icon name="chart" size={15} color="var(--yellow-dark)" /> Click logs ({(logs.clickLogs || []).length})
            </div>
            <button className="refresh-btn" onClick={fetchLogs}>
              <Icon name="refresh" size={13} /> Làm mới
            </button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>IP</th>
                  <th>Tên</th>
                  <th>Link</th>
                  <th>UTM</th>
                  <th>Country</th>
                  <th>Đích đến</th>
                </tr>
              </thead>
              <tbody>
                {(logs.clickLogs || []).length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--gray-400)' }}>Chưa có log</td>
                  </tr>
                ) : (
                  (logs.clickLogs || []).map((l, i) => (
                    <tr key={i}>
                      <td style={{ fontSize: 12, fontFamily: 'DM Mono, monospace', whiteSpace: 'nowrap' }}>{l.time}</td>
                      <td style={{ fontSize: 12, fontFamily: 'DM Mono, monospace' }}>{l.ip}</td>
                      <td style={{ fontSize: 13 }}>
                        {l.user && l.user !== 'unknown' ? l.user : <span style={{ color: 'var(--gray-400)', fontSize: 12 }}>—</span>}
                      </td>
                      <td>
                        <a href={`https://${YOUR_DOMAIN}/${l.code}`} target="_blank" className="code-chip" style={{ textDecoration: 'none' }}>
                          /{l.code}
                        </a>
                      </td>
                      <td>
                        <span className="badge badge-yellow">{l.utm || 'Direct'}</span>
                      </td>
                      <td style={{ fontSize: 12 }}>
                        {l.country && l.country !== 'Unknown' ? l.country : <span style={{ color: 'var(--gray-400)' }}>—</span>}
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--gray-500)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {l.target}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Icon name="logs" size={15} color="var(--purple)" /> Action logs ({(logs.actionLogs || []).length})
            </div>
            <button className="refresh-btn" onClick={fetchLogs}>
              <Icon name="refresh" size={13} /> Làm mới
            </button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>IP</th>
                  <th>Người dùng</th>
                  <th>Hành động</th>
                  <th>Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {(logs.actionLogs || []).length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--gray-400)' }}>Chưa có log</td>
                  </tr>
                ) : (
                  (logs.actionLogs || []).map((l, i) => {
                    let detail = '';
                    if (l.details?.code) detail = `/${l.details.code}`;
                    if (l.details?.url) detail += ` → ${l.details.url.substring(0, 40)}...`;
                    if (l.details?.username) detail = l.details.username;
                    return (
                      <tr key={i}>
                        <td style={{ fontSize: 12, fontFamily: 'DM Mono, monospace', whiteSpace: 'nowrap' }}>{l.time}</td>
                        <td style={{ fontSize: 12, fontFamily: 'DM Mono, monospace' }}>{l.ip}</td>
                        <td>{l.user || <span style={{ color: 'var(--gray-400)', fontSize: 13 }}>—</span>}</td>
                        <td>
                          <span className={`badge ${ACTION_COLORS[l.action] || 'badge-gray'}`}>
                            {ACTION_LABELS[l.action] || l.action}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--gray-500)' }}>{detail || '-'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsView;
