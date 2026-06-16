import React, { useState } from 'react';
import { WORKER_URL, YOUR_DOMAIN } from '../../config/constants';
import { toast, copyText } from '../Common/Utils';
import { Icon } from '../Common/Icons';

const CreateLinkView = ({ auth }) => {
  const [url, setUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [expiry, setExpiry] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAdv, setShowAdv] = useState(false);

  const handleCreate = async () => {
    if (!url) {
      toast('Vui lòng nhập URL', 'error');
      return;
    }
    if (alias && !/^[a-zA-Z0-9-]+$/.test(alias)) {
      toast('Alias chỉ dùng chữ, số, gạch ngang', 'error');
      return;
    }
    setLoading(true);
    try {
      const body = { url };
      if (alias) body.customCode = alias;
      if (expiry) body.expiryDate = expiry;
      if (password) body.password = password;
      const res = await fetch(`${WORKER_URL}/shorten`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: auth },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data.shortUrl);
        toast('Tạo link thành công! 🎉');
        setUrl('');
        setAlias('');
        setExpiry('');
        setPassword('');
        setShowAdv(false);
      } else {
        toast(data.error || 'Lỗi', 'error');
      }
    } catch {
      toast('Lỗi kết nối', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="view-section fade-in">
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Icon name="link" size={16} color="var(--yellow-dark)" /> Rút gọn URL mới
            </div>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">URL cần rút gọn *</label>
              <input
                className="form-input"
                type="url"
                placeholder="https://example.com/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Alias tùy chỉnh</label>
              <div className="input-group">
                <div className="form-prefix">{YOUR_DOMAIN}/</div>
                <input
                  className="form-input"
                  placeholder="my-link"
                  maxLength={20}
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                />
              </div>
              <div className="form-hint">Tùy chọn — chữ, số, gạch ngang, tối đa 20 ký tự</div>
            </div>

            <button
              onClick={() => setShowAdv(!showAdv)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                color: 'var(--gray-500)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 0',
                marginBottom: 16,
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              <Icon name={showAdv ? 'close' : 'lock'} size={14} />
              {showAdv ? 'Ẩn tùy chọn nâng cao' : 'Tùy chọn nâng cao (hết hạn, mật khẩu)'}
            </button>

            {showAdv && (
              <div
                style={{
                  background: 'var(--gray-50)',
                  border: '1px solid var(--gray-200)',
                  borderRadius: 10,
                  padding: 16,
                  marginBottom: 18,
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">
                      <Icon name="clock" size={13} style={{ verticalAlign: -2, marginRight: 4 }} /> Ngày hết hạn
                    </label>
                    <input
                      className="form-input"
                      type="date"
                      value={expiry}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setExpiry(e.target.value)}
                    />
                    <div className="form-hint">Để trống = không hết hạn</div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">
                      <Icon name="lock" size={13} style={{ verticalAlign: -2, marginRight: 4 }} /> Mật khẩu bảo vệ
                    </label>
                    <input
                      className="form-input"
                      type="password"
                      placeholder="Để trống = không cần"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 15 }}
              onClick={handleCreate}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Đang tạo...
                </>
              ) : (
                <>
                  <Icon name="link" size={16} /> Rút gọn ngay
                </>
              )}
            </button>

            {result && (
              <div className="result-box">
                <span style={{ fontSize: 13, fontWeight: 600, color: '#92400E' }}>
                  <Icon name="check" size={14} style={{ verticalAlign: -2 }} /> Link đã tạo thành công
                </span>
                <div className="result-url">
                  <input
                    readOnly
                    value={result}
                    style={{
                      flex: 1,
                      padding: '9px 13px',
                      background: 'white',
                      border: '1.5px solid var(--gray-200)',
                      borderRadius: 8,
                      fontSize: 13,
                      fontFamily: 'DM Mono, monospace',
                      color: 'var(--gray-800)',
                      outline: 'none',
                    }}
                  />
                  <button className="btn btn-primary btn-sm" onClick={() => { copyText(result); toast('Đã sao chép!'); }}>
                    <Icon name="copy" size={14} /> Copy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateLinkView;
