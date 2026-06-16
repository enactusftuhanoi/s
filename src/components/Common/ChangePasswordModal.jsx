import React, { useState } from 'react';
import { WORKER_URL } from '../../config/constants';
import { toast, getPasswordStrength } from './Utils';
import { Icon } from './Icons';

const ChangePasswordModal = ({ auth, onClose }) => {
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [loading, setLoading] = useState(false);
  const strength = getPasswordStrength(newPw);

  const handleChange = async () => {
    if (!currentPw || !newPw || !confirmPw) {
      toast('Điền đầy đủ', 'error');
      return;
    }
    if (newPw !== confirmPw) {
      toast('Không khớp', 'error');
      return;
    }
    if (newPw.length < 6) {
      toast('Tối thiểu 6 ký tự', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${WORKER_URL}/admin/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: auth },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const d = await res.json();
      if (res.ok) {
        toast('Đổi mật khẩu thành công!');
        onClose();
      } else {
        toast(d.error || 'Lỗi', 'error');
      }
    } catch {
      toast('Lỗi kết nối', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">
            <Icon name="key" size={16} style={{ verticalAlign: -2, marginRight: 6 }} /> Change password
          </div>
          <button className="btn-icon" onClick={onClose}>
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Current password</label>
            <input
              className="form-input"
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">New password</label>
            <input
              className="form-input"
              type="password"
              placeholder="At least 6 characters"
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
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Confirm</label>
            <input
              className="form-input"
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
                {confirmPw === newPw ? 'Match' : 'No match'}
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Hủy</button>
          <button className="btn btn-primary" onClick={handleChange} disabled={loading}>
            {loading ? 'Đang lưu...' : <><Icon name="check" size={14} /> Xác nhận</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
