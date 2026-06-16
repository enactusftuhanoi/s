import React, { useState, useEffect } from 'react';
import { WORKER_URL } from '../../config/constants';
import { Icon } from '../Common/Icons';

const ProfileHeader = ({ auth, username }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${WORKER_URL}/user/profile/${username}`, {
          headers: { Authorization: auth },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setProfile(data);
      } catch {
        // Không hiển thị toast để tránh spam
      } finally {
        setLoading(false);
      }
    };
    if (username) fetchProfile();
  }, [auth, username]);

  if (loading) {
    return (
      <div
        style={{
          background: '#FFFBEB',
          borderRadius: '20px',
          padding: '36px 40px',
          marginBottom: '24px',
          border: '1px solid #FEF3C7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div className="spinner" style={{ width: 24, height: 24 }} />
      </div>
    );
  }

  if (!profile) return null;

  const quotes = [
    'Hôm nay bạn lại làm thêm được một chút rồi đó.',
    'Ổn áp đấy, cứ thế mà tiếp tục nha.',
    'Làm tốt rồi, đừng quên nghỉ ngơi nữa nhé.',
    'Có tiến triển là được, không cần phải hoàn hảo đâu.',
    'Nhìn vậy thôi chứ bạn đang làm tốt hơn bạn nghĩ đó.',
    'Cứ từ từ thôi, mình vẫn đang đi đúng hướng mà.',
  ];
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
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
        flexWrap: 'wrap',
      }}
    >
      <div style={{ flex: 1 }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#92400E', marginBottom: 8 }}>
          Chào {profile.fullname},
        </h2>
        <p style={{ color: '#D97706', marginBottom: 16, fontSize: 14, lineHeight: 1.6, fontWeight: 500 }}>
          {randomQuote}
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
  );
};

export default ProfileHeader;
