import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WORKER_URL, YOUR_DOMAIN } from '../../config/constants';
import { toast } from '../Common/Utils';
import { Icon } from '../Common/Icons';
import ProfileHeader from './ProfileHeader';
import Chart from 'chart.js/auto';

const DashboardView = ({ auth, username }) => {
  const [stats, setStats] = useState(null);
  const [hourly, setHourly] = useState([]);
  const [topUTM, setTopUTM] = useState([]);
  const [loading, setLoading] = useState(true);
  const dailyRef = useRef(null);
  const hourlyRef = useRef(null);
  const dailyInst = useRef(null);
  const hourlyInst = useRef(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [sr, hr, ur] = await Promise.all([
        fetch(`${WORKER_URL}/stats`),
        fetch(`${WORKER_URL}/hourly-stats`),
        fetch(`${WORKER_URL}/top-utm`),
      ]);
      const [sd, hd, ud] = await Promise.all([sr.json(), hr.json(), ur.json()]);
      setStats(sd);
      setHourly(hd || []);
      setTopUTM((ud || []).filter((i) => i.utms?.length > 0).slice(0, 5));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    return () => {
      dailyInst.current?.destroy();
      hourlyInst.current?.destroy();
    };
  }, []);

  useEffect(() => {
    if (!stats?.dailyClicks || !dailyRef.current) return;
    if (dailyInst.current) dailyInst.current.destroy();
    dailyInst.current = new Chart(dailyRef.current.getContext('2d'), {
      type: 'line',
      data: {
        labels: stats.dailyClicks.map((d) => d.date),
        datasets: [
          {
            label: 'Clicks',
            data: stats.dailyClicks.map((d) => d.clicks),
            borderColor: '#FFC107',
            backgroundColor: 'rgba(255,193,7,0.08)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#FFC107',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 7,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: '#F3F4F6' }, ticks: { color: '#9CA3AF', font: { family: 'DM Sans' } } },
          x: { grid: { display: false }, ticks: { color: '#9CA3AF', font: { family: 'DM Sans' } } },
        },
      },
    });
  }, [stats]);

  useEffect(() => {
    if (!hourly.length || !hourlyRef.current) return;
    if (hourlyInst.current) hourlyInst.current.destroy();
    const now = new Date().getHours();
    const f = hourly.filter((d) => d.hour <= now);
    hourlyInst.current = new Chart(hourlyRef.current.getContext('2d'), {
      type: 'bar',
      data: {
        labels: f.map((d) => `${d.hour}:00`),
        datasets: [
          {
            data: f.map((d) => d.clicks || 0),
            backgroundColor: '#FFC107',
            borderRadius: 6,
            borderColor: '#F59E0B',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: '#F3F4F6' }, ticks: { color: '#9CA3AF', font: { family: 'DM Sans' } } },
          x: { grid: { display: false }, ticks: { color: '#9CA3AF', font: { family: 'DM Sans', size: 11 } } },
        },
      },
    });
  }, [hourly]);

  const cards = [
    { label: 'Tổng số link', value: stats?.totalLinks || 0, icon: 'link', color: '#FFC107', bg: '#FFFBEB' },
    { label: 'Tổng lượt click', value: stats?.totalClicks || 0, icon: 'analytics', color: '#3B82F6', bg: '#EFF6FF' },
    { label: 'Hôm nay', value: stats?.todayClicks || 0, icon: 'clock', color: '#10B981', bg: '#ECFDF5' },
    {
      label: 'Link hot nhất',
      value: stats?.topLinks?.[0]?.code ? `/${stats.topLinks[0].code}` : '-',
      icon: 'fire',
      color: '#8B5CF6',
      bg: '#F5F3FF',
    },
  ];

  return (
    <div className="view-section fade-in">
      <ProfileHeader auth={auth} username={username} />

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="spinner" style={{ margin: '0 auto 12px' }} />
          <div style={{ fontSize: 14, color: 'var(--gray-400)' }}>Đang tải...</div>
        </div>
      )}

      {!loading && (
        <>
          <div className="stats-grid">
            {cards.map((s, i) => (
              <div key={i} className="stat-card">
                <div className="stat-bg" style={{ background: s.color }} />
                <div className="stat-icon" style={{ background: s.bg }}>
                  <Icon name={s.icon} size={18} color={s.color} />
                </div>
                <div className="stat-label">{s.label}</div>
                <div
                  className="stat-value"
                  style={{
                    fontSize: s.label === 'Link hot nhất' ? 20 : 28,
                    fontFamily: s.label === 'Link hot nhất' ? 'DM Mono, monospace' : undefined,
                  }}
                >
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <div className="card-title">
                <Icon name="chart" size={16} color="var(--yellow-dark)" /> Lượt click 7 ngày
              </div>
              <button className="refresh-btn" onClick={fetchAll}>
                <Icon name="refresh" size={13} /> Làm mới
              </button>
            </div>
            <div className="card-body">
              <div className="chart-wrap" style={{ height: 240 }}>
                <canvas ref={dailyRef} />
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <div className="card-title">
                <Icon name="clock" size={16} color="var(--blue)" /> Lưu lượng theo giờ hôm nay
              </div>
            </div>
            <div className="card-body">
              <div className="chart-wrap" style={{ height: 200 }}>
                <canvas ref={hourlyRef} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <Icon name="tag" size={16} color="var(--purple)" /> Top nguồn truy cập
                </div>
              </div>
              <div className="card-body" style={{ padding: '16px 20px' }}>
                {topUTM.length === 0 ? (
                  <div className="empty-state" style={{ padding: '24px 0' }}>
                    <p style={{ fontSize: 13 }}>Chưa có dữ liệu UTM</p>
                  </div>
                ) : (
                  topUTM.map((item, i) => {
                    const total = item.totalClicks || 0;
                    return (
                      <div key={i} style={{ marginBottom: i < topUTM.length - 1 ? 16 : 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span
                              style={{
                                width: 22,
                                height: 22,
                                borderRadius: '50%',
                                background: 'var(--yellow)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 11,
                                fontWeight: 700,
                              }}
                            >
                              {i + 1}
                            </span>
                            <span
                              style={{
                                fontFamily: 'DM Mono, monospace',
                                fontSize: 13,
                                color: 'var(--yellow-dark)',
                                fontWeight: 600,
                              }}
                            >
                              /{item.link}
                            </span>
                          </div>
                          <span className="badge badge-gray">{total} clicks</span>
                        </div>
                        {item.utms.slice(0, 3).map(([utm, clicks], j) => {
                          const pct = total > 0 ? Math.round((clicks / total) * 100) : 0;
                          return (
                            <div
                              key={j}
                              style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, fontSize: 12 }}
                            >
                              <span
                                style={{
                                  width: 70,
                                  color: 'var(--gray-500)',
                                  fontFamily: 'DM Mono, monospace',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {utm || 'Direct'}
                              </span>
                              <div style={{ flex: 1 }}>
                                <div className="progress-wrap">
                                  <div className="progress-bar" style={{ width: `${pct}%` }} />
                                </div>
                              </div>
                              <span style={{ width: 28, textAlign: 'right', color: 'var(--gray-600)', fontWeight: 600 }}>
                                {pct}%
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <Icon name="star" size={16} color="var(--yellow-dark)" /> Top 5 link phổ biến
                </div>
              </div>
              <div className="card-body" style={{ padding: '16px 20px' }}>
                {!stats?.topLinks?.length ? (
                  <div className="empty-state" style={{ padding: '24px 0' }}>
                    <p style={{ fontSize: 13 }}>Chưa có dữ liệu</p>
                  </div>
                ) : (
                  stats.topLinks.map((link, i) => {
                    const max = stats.topLinks[0]?.clicks || 1;
                    const pct = Math.round((link.clicks / max) * 100);
                    return (
                      <div key={i} style={{ marginBottom: i < stats.topLinks.length - 1 ? 14 : 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span
                              style={{
                                width: 22,
                                height: 22,
                                borderRadius: '50%',
                                background: i === 0 ? 'var(--yellow)' : 'var(--gray-100)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 11,
                                fontWeight: 700,
                                color: i === 0 ? 'var(--gray-800)' : 'var(--gray-500)',
                              }}
                            >
                              {i + 1}
                            </span>
                            <a
                              href={`https://${YOUR_DOMAIN}/${link.code}`}
                              target="_blank"
                              style={{
                                fontFamily: 'DM Mono, monospace',
                                fontSize: 13,
                                color: 'var(--yellow-dark)',
                                textDecoration: 'none',
                                fontWeight: 600,
                              }}
                            >
                              /{link.code}
                            </a>
                          </div>
                          <span className="badge badge-gray">{link.clicks} clicks</span>
                        </div>
                        <div style={{ paddingLeft: 30 }}>
                          <div className="progress-wrap">
                            <div className="progress-bar" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardView;
