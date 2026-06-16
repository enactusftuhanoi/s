import React, { useState } from 'react';
import { YOUR_DOMAIN } from '../../config/constants';
import { toast, copyText } from '../Common/Utils';
import { Icon } from '../Common/Icons';

const UTMModal = ({ code, onClose }) => {
  const [utm, setUtm] = useState('');
  const gen = utm.trim() ? `https://${YOUR_DOMAIN}/${code}?utm=${utm.trim()}` : '';

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">Copy link với UTM</div>
          <button className="btn-icon" onClick={onClose}>
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">UTM source</label>
            <input
              className="form-input"
              placeholder="facebook, google..."
              value={utm}
              onChange={(e) => setUtm(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
            />
            <div className="form-hint">Chỉ chữ, số, gạch ngang/dưới</div>
          </div>
          {gen && (
            <>
              <div className="form-label" style={{ marginBottom: 6 }}>Link đã tạo</div>
              <div className="utm-result">{gen}</div>
            </>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Hủy</button>
          <button
            className="btn btn-primary btn-sm"
            disabled={!gen}
            onClick={() => { copyText(gen); toast('Đã sao chép UTM!'); onClose(); }}
          >
            <Icon name="copy" size={14} /> Sao chép
          </button>
        </div>
      </div>
    </div>
  );
};

export default UTMModal;
