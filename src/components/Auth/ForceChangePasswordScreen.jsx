import React, { useState } from 'react';
import { WORKER_URL } from '../../config/constants';
import { toast, getPasswordStrength } from '../Common/Utils';
import { Icon } from '../Common/Icons';

const ForceChangePasswordScreen = ({ auth, username, onSuccess }) => {
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [loading, setLoading] = useState(false);
  const strength = getPasswordStrength(newPw);

  const handleChange = async () => {
    if (!currentPw || !newPw || !confirmPw) {
      toast('Vui lòng điền đầy đủ', 'error');
      return;
    }
    if (newPw !== confirmPw) {
      toast('Mật khẩu xác nhận không khớp', 'error');
      return;
    }
    if (newPw.length < 6) {
      toast('Tối thiểu 6 ký tự', 'error');
      return;
    }
    if (strength.score < 2) {
      toast('Mật khẩu quá yếu', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${WORKER_URL}/admin/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: auth },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const data = await res.json();
      if (res.ok) {
        toast('Đổi mật khẩu thành công!');
        setTimeout(() => onSuccess(), 800);
      } else {
        toast(data.error || 'Lỗi', 'error');
      }
    } catch {
      toast('Lỗi kết nối', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="force-pw-screen">
      <div className="force-pw-card fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'var(--yellow-mid)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="shield" size={22} color="var(--yellow-dark)" />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Đặt mật khẩu mới</div>
            <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>
              URL Shortener · Enactus FTU Hanoi
            </div>
          </div>
        </div>
        <div className="force-pw-banner">
          <span style={{ fontSize: 22, flexShrink: 0 }}>🔐</span>
          <div className="force-pw-banner-text">
            <strong>Yêu cầu đổi mật khẩu</strong>
            Tài khoản <b>{username}</b> đang dùng mật khẩu mặc định hoặc vừa được reset.
          </div>
        </div>
        <div className="auth-form-group">
          <label className="auth-label">Mật khẩu hiện tại</label>
          <input
            className="auth-input"
            type="password"
            value={currentPw}
            onChange={(e) => setCurrentPw(e.target.value)}
          />
        </div>
        <div className="auth-form-group">
          <label className="auth-label">Mật khẩu mới</label>
          <input
            className="auth-input"
            type="password"
            placeholder="Ít nhất 6 ký tự"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
          />
          {newPw && (
            <>
              <div
                className="pw-strength"
                style={{
                  background: `linear-gradient(to right,${strength.color} ${strength.pct}%,var(--gray-200) ${strength.pct}%)`,
                }}
              />
              <div className="pw-strength-text" style={{ color: strength.color }}>
                {strength.label}
              </div>
            </>
          )}
        </div>
        <div className="auth-form-group">
          <label className="auth-label">Xác nhận mật khẩu mới</label>
          <input
            className="auth-input"
            type="password"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleChange()}
          />
          {confirmPw && newPw && (
            <div
              style={{
                fontSize: 12,
                marginTop: 5,
                color: confirmPw === newPw ? '#10B981' : '#EF4444',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Icon
                name={confirmPw === newPw ? 'check' : 'close'}
                size={13}
                color={confirmPw === newPw ? '#10B981' : '#EF4444'}
              />
              {confirmPw === newPw ? 'Khớp' : 'Chưa khớp'}
            </div>
          )}
        </div>
        <button className="auth-btn" onClick={handleChange} disabled={loading}>
          {loading ? 'Đang lưu...' : 'Xác nhận & Vào ứng dụng'}
        </button>
      </div>
    </div>
  );
};

export default ForceChangePasswordScreen;
