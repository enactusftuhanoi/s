import React, { useState } from 'react';
import { WORKER_URL } from '../../config/constants';
import { toast } from '../Common/Utils';
import { Icon } from '../Common/Icons';

const EditLinkModal = ({ link, auth, userRole, currentUsername, onClose, onSaved }) => {
  const [url, setUrl] = useState(link.original_url || '');
  const [expiry, setExpiry] = useState(link.expiry_date ? link.expiry_date.split('T')[0] : '');
  const [password, setPassword] = useState('');
  const [clearPw, setClearPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const canEdit = userRole === 'SuperAdmin' || userRole === 'Admin' || link.created_by === currentUsername;

  const handleSave = async () => {
    if (!url) {
      toast('Vui lòng nhập URL', 'error');
      return;
    }
    if (!url.startsWith('http')) {
      toast('URL không hợp lệ', 'error');
      return;
    }
    setLoading(true);
    try {
      const body = { url };
      body.expiryDate = expiry || null;
      body.password = clearPw ? null : (password || undefined);
      if (!clearPw && !password) delete body.password;

      const res = await fetch(`${WORKER_URL}/link/${link.code}/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: auth },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        toast('Đã cập nhật link!');
        onSaved();
        onClose();
      } else {
        toast(data.error || 'Lỗi', 'error');
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
            <Icon name="edit" size={16} style={{ verticalAlign: -2, marginRight: 6 }} />
            Chỉnh sửa link <span className="code-chip" style={{ fontSize: 11, marginLeft: 4 }}>/{link.code}</span>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className="modal-body">
          {!canEdit && (
            <div
              style={{
                background: '#FEE2E2',
                border: '1px solid #FECACA',
                borderRadius: 8,
                padding: '10px 14px',
                fontSize: 13,
                color: '#991B1B',
                marginBottom: 16,
              }}
            >
              ⚠️ Bạn không có quyền chỉnh sửa link này.
            </div>
          )}
          <div className="form-group">
            <label className="form-label">URL đích *</label>
            <input
              className="form-input"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={!canEdit}
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              <Icon name="clock" size={13} style={{ verticalAlign: -2, marginRight: 4 }} /> Expiry Date
            </label>
            <input
              className="form-input"
              type="date"
              value={expiry}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setExpiry(e.target.value)}
              disabled={!canEdit}
            />
            <div className="form-hint">Leave empty = never expires</div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              <Icon name="lock" size={13} style={{ verticalAlign: -2, marginRight: 4 }} /> New Password
            </label>
            <input
              className="form-input"
              type="password"
              placeholder={link.has_password ? 'Leave empty = keep current password' : 'Leave empty = no password required'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setClearPw(false); }}
              disabled={!canEdit || clearPw}
            />
            {link.has_password && canEdit && (
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginTop: 8,
                  fontSize: 12.5,
                  color: 'var(--gray-600)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={clearPw}
                  onChange={(e) => { setClearPw(e.target.checked); if (e.target.checked) setPassword(''); }}
                />
                Remove password (link will not require a password anymore)
              </label>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Hủy</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading || !canEdit}>
            {loading ? 'Đang lưu...' : <><Icon name="check" size={14} /> Lưu thay đổi</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditLinkModal;
