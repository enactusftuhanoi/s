import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WORKER_URL } from '../../config/constants';
import { toast, formatDate } from '../Common/Utils';
import { Icon } from '../Common/Icons';
import Chart from 'chart.js/auto';

const ProfileView = ({ auth, username }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef(null);
  const performanceChartRef = useRef(null);
  const chartInstances = useRef([]);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${WORKER_URL}/user/profile/${username}`, {
        headers: { Authorization: auth },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setProfile(data);
    } catch {
      toast('Lỗi tải profile', 'error');
    }
    setLoading(false);
  }, [auth, username]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Tính toán stats
  const stats = profile
    ? {
        totalLinks: profile.links?.length || 0,
        totalClicks: profile.links?.reduce((sum, l) => sum + (l.clicks || 0), 0) || 0,
        avgClicksPerLink: profile.links?.length
          ? Math.round(profile.links.reduce((sum, l) => sum + (l.clicks || 0), 0) / profile.links.length)
          : 0,
        topLink: profile.links?.length
          ? profile.links.reduce((max, l) => (l.clicks > (max?.clicks || 0) ? l : max), null)
          : null,
      }
    : null;

  // Biểu đồ distribution
  useEffect(() => {
    if (!profile || !chartRef.current) return;
    if (chartInstances.current[0]) chartInstances.current[0].destroy();

    const ctx = chartRef.current.getContext('2d');
    const links = profile.links || [];

    const noClicks = links.filter((l) => !l.clicks || l.clicks === 0).length;
    const lowClicks = links.filter((l) => l.clicks > 0 && l.clicks <= 10).length;
    const mediumClicks = links.filter((l) => l.clicks > 10 && l.clicks <= 50).length;
    const highClicks = links.filter((l) => l.clicks > 50).length;

    chartInstances.current[0] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Chưa có clicks', '1-10 clicks', '11-50 clicks', '50+ clicks'],
        datasets: [
          {
            data: [noClicks, lowClicks, mediumClicks, highClicks],
            backgroundColor: ['#E5E7EB', '#FEF3C7', '#FCD34D', '#F59E0B'],
            borderColor: 'white',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { font: { family: 'DM Sans', size: 12 }, padding: 12 },
          },
        },
      },
    });
  }, [profile]);

  // Biểu đồ Top links performance
  useEffect(() => {
    if (!profile || !performanceChartRef.current) return;
    if (chartInstances.current[1]) chartInstances.current[1].destroy();

    const ctx = performanceChartRef.current.getContext('2d');
    const topLinks = (profile.links || [])
      .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
      .slice(0, 5);

    chartInstances.current[1] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: topLinks.map((l) => l.code),
        datasets: [
          {
            label: 'Clicks',
            data: topLinks.map((l) => l.clicks || 0),
            backgroundColor: '#F59E0B',
            borderColor: '#F59E0B',
            borderRadius: 8,
            borderSkipped: false,
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: true,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            beginAtZero: true,
            grid: { color: '#F3F4F6' },
            ticks: { color: '#9CA3AF', font: { family: 'DM Sans' } },
          },
          y: {
            grid: { display: false },
            ticks: { color: '#9CA3AF', font: { family: 'DM Sans', weight: 600 } },
          },
        },
      },
    });
  }, [profile]);

  useEffect(() => {
    return () => {
      chartInstances.current.forEach((chart) => chart?.destroy());
    };
  }, []);

  if (loading) return <div className="spinner" style={{ margin: '40px auto' }} />;

  const sortedLinks = [...(profile.links || [])].sort((a, b) => (b.clicks || 0) - (a.clicks || 0));

  return (
    <div className="view-section fade-in" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          background: '#FFFBEB',
          borderRadius: '20px',
          padding: '36px 40px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          border: '1px solid #FEF3C7',
          boxShadow: '0 4px 12px rgba(255, 193, 7, 0.12)',
          gap: 32,
        }}
      >
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#92400E', marginBottom: 8 }}>Chào {profile.fullname},</h2>
          <p style={{ color: '#D97706', marginBottom: 16, fontSize: 14, lineHeight: 1.6, fontWeight: 500 }}>
            {[
              'Hôm nay bạn lại làm thêm được một chút rồi đó.',
              'Ổn áp đấy, cứ thế mà tiếp tục nha.',
              'Làm tốt rồi, đừng quên nghỉ ngơi nữa nhé.',
              'Có tiến triển là được, không cần phải hoàn hảo đâu.',
              'Nhìn vậy thôi chứ bạn đang làm tốt hơn bạn nghĩ đó.',
              'Cứ từ từ thôi, mình vẫn đang đi đúng hướng mà.',
            ][Math.floor(Math.random() * 6)]}
          </p>

          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 11, color: '#B45309', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 2 }}>
                Username
              </div>
              <div style={{ fontSize: 15, color: '#92400E', fontWeight: 1000 }}>{profile.username}</div>
            </div>
            <div style={{ width: 1, height: 20, background: '#FEF3C7' }} />
            <div>
              <div style={{ fontSize: 11, color: '#B45309', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 2 }}>
                Department
              </div>
              <div style={{ fontSize: 13, color: '#92400E', fontWeight: 1000 }}>{profile.department || 'N/A'}</div>
            </div>
            <div style={{ width: 1, height: 20, background: '#FEF3C7' }} />
            <div>
              <div style={{ fontSize: 11, color: '#B45309', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 2 }}>
                Role
              </div>
              <div style={{ fontSize: 13, color: '#92400E', fontWeight: 1000 }}>{profile.role || 'Member'}</div>
            </div>
          </div>
        </div>

        <div
          style={{
            background: '#FDE68A',
            padding: '16px 28px',
            borderRadius: '16px',
            fontWeight: 700,
            color: '#92400E',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            fontSize: 14,
            boxShadow: '0 2px 8px rgba(217, 119, 6, 0.1)',
          }}
        >
          <div style={{ fontSize: 11, color: '#B45309', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 800 }}>
            Status
          </div>
          <div style={{ fontSize: 16, fontWeight: 800 }}>{profile.role || 'Member'}</div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div
          style={{
            background: 'white',
            padding: '24px',
            borderRadius: '20px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            border: '1px solid #F3F4F6',
          }}
        >
          <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, marginBottom: 8 }}>
            Tổng liên kết đã tạo
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#10B981', marginBottom: 4 }}>{stats.totalLinks}</div>
          <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>Liên kết đã tạo</div>
        </div>

        <div
          style={{
            background: 'white',
            padding: '24px',
            borderRadius: '20px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            border: '1px solid #F3F4F6',
          }}
        >
          <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, marginBottom: 8 }}>
            Tổng lượt Click
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#3B82F6', marginBottom: 4 }}>
            {stats.totalClicks.toLocaleString()}
          </div>
          <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>Lượt người click vào</div>
        </div>

        <div
          style={{
            background: 'white',
            padding: '24px',
            borderRadius: '20px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            border: '1px solid #F3F4F6',
          }}
        >
          <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, marginBottom: 8 }}>Ngày tham gia</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#8B5CF6', marginBottom: 4 }}>
            {profile.created_at ? Math.ceil((new Date() - new Date(profile.created_at)) / 86400000) + ' ngày' : 'N/A'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>*Data retrieved from database</div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20, marginBottom: 24 }}>
        <div className="card" style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}>
          <div className="card-header" style={{ borderBottom: '2px solid #FEF3C7' }}>
            <h3 className="card-title">
              <Icon name="chart" size={17} /> Phân bố Performance
            </h3>
          </div>
          <div className="card-body" style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <canvas ref={chartRef} style={{ maxHeight: 280 }} />
          </div>
        </div>

        <div className="card" style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}>
          <div className="card-header" style={{ borderBottom: '2px solid #FEF3C7' }}>
            <h3 className="card-title">
              <Icon name="fire" size={17} color="#F59E0B" /> Top links
            </h3>
          </div>
          <div className="card-body" style={{ height: 320, padding: '20px' }}>
            <canvas ref={performanceChartRef} />
          </div>
        </div>
      </div>

      {/* Detailed Links Table */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header" style={{ borderBottom: '2px solid #FFC107', paddingBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <h3 className="card-title" style={{ fontSize: 17, fontWeight: 700 }}>
              <Icon name="list" size={18} /> Danh sách link chi tiết
            </h3>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'var(--yellow-light)',
                padding: '6px 12px',
                borderRadius: 'var(--radius)',
                fontSize: 13,
                fontWeight: 600,
                color: '#92400E',
              }}
            >
              <span>
                <Icon name="analytics" size={14} />
              </span>
              <span>{sortedLinks.length} links</span>
            </div>
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {sortedLinks.length === 0 ? (
            <div className="empty-state" style={{ padding: '60px 20px' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
              <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Chưa có links nào</p>
              <p style={{ fontSize: 13, color: 'var(--gray-400)' }}>Hãy tạo link đầu tiên của bạn để bắt đầu!</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table style={{ minWidth: '700px' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(90deg, #FFFBEB 0%, #FEF3C7 100%)' }}>
                    <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#92400E' }}>Ranking</th>
                    <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#92400E' }}>Code</th>
                    <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#92400E' }}>Destination</th>
                    <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#92400E', width: 100 }}>Clicks</th>
                    <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#92400E', width: 180 }}>Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedLinks.map((link, idx) => {
                    const maxClicks = Math.max(...sortedLinks.map((l) => l.clicks || 0), 1);
                    const percentage = link.clicks ? Math.round((link.clicks / maxClicks) * 100) : 0;
                    const rank = idx + 1;

                    let badge = '';
                    let badgeColor = '';
                    if (rank === 1) {
                      badge = '01';
                      badgeColor = '#F59E0B';
                    } else if (rank === 2) {
                      badge = '02';
                      badgeColor = '#9CA3AF';
                    } else if (rank === 3) {
                      badge = '03';
                      badgeColor = '#CD7F32';
                    } else if (rank <= 9) {
                      badge = '0' + rank;
                      badgeColor = '#3B82F6';
                    } else if (rank === 10) {
                      badge = '10';
                      badgeColor = '#3B82F6';
                    } else {
                      badge = rank < 10 ? '0' + rank : rank;
                      badgeColor = '#9CA3AF';
                    }

                    const clicksPercentOfTotal =
                      stats.totalClicks > 0 ? Math.round((link.clicks || 0) / stats.totalClicks * 100) : 0;

                    return (
                      <tr
                        key={link.code}
                        style={{
                          background: rank <= 3 ? 'rgba(255, 193, 7, 0.04)' : 'transparent',
                          borderBottom: '1px solid var(--gray-100)',
                          transition: 'background .2s',
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = rank <= 3 ? 'rgba(255, 193, 7, 0.08)' : 'var(--gray-50)')
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = rank <= 3 ? 'rgba(255, 193, 7, 0.04)' : 'transparent')
                        }
                      >
                        <td style={{ padding: '14px 20px' }}>
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              background: typeof badge === 'number' ? 'var(--gray-100)' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: typeof badge === 'number' ? 16 : 24,
                              fontWeight: 700,
                              color: badgeColor,
                            }}
                          >
                            {badge}
                          </div>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <span
                            className="code-chip"
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              background: 'var(--yellow-mid)',
                              color: '#92400E',
                              padding: '5px 11px',
                            }}
                          >
                            {link.code}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: 13, color: 'var(--gray-600)', maxWidth: 300 }}>
                          <div
                            title={link.original_url}
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              fontFamily: 'DM Mono, monospace',
                              fontSize: 12,
                            }}
                          >
                            {link.original_url}
                          </div>
                        </td>
                        <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                          <div
                            style={{
                              fontSize: 16,
                              fontWeight: 800,
                              color: '#F59E0B',
                              background: 'var(--yellow-light)',
                              padding: '6px 12px',
                              borderRadius: 'var(--radius)',
                              display: 'inline-block',
                            }}
                          >
                            {(link.clicks || 0).toLocaleString()}
                          </div>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ flex: 1 }}>
                              <div className="progress-wrap" style={{ height: 8, borderRadius: 4 }}>
                                <div
                                  className="progress-bar"
                                  style={{
                                    width: `${percentage}%`,
                                    borderRadius: 4,
                                    background:
                                      rank === 1
                                        ? '#F59E0B'
                                        : rank === 2
                                        ? '#9CA3AF'
                                        : rank === 3
                                        ? '#CD7F32'
                                        : '#3B82F6',
                                    transition: 'width .3s ease',
                                  }}
                                />
                              </div>
                              <div style={{ fontSize: 10, color: 'var(--gray-400)', marginTop: 3, fontWeight: 600 }}>
                                {percentage}% of top
                              </div>
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: 'var(--gray-600)',
                                fontWeight: 700,
                                minWidth: 45,
                                textAlign: 'center',
                                background: 'var(--gray-100)',
                                padding: '4px 8px',
                                borderRadius: 4,
                              }}
                            >
                              {clicksPercentOfTotal}%
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
