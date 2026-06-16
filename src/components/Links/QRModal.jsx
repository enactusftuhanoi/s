import React, { useRef, useEffect } from 'react';
import { YOUR_DOMAIN } from '../../config/constants';
import { toast, copyText } from '../Common/Utils';
import { Icon } from '../Common/Icons';

const QRModal = ({ code, onClose }) => {
  const qrRef = useRef(null);
  const url = `https://${YOUR_DOMAIN}/${code}`;

  useEffect(() => {
    if (qrRef.current) {
      qrRef.current.innerHTML = '';
      new QRCode(qrRef.current, {
        text: url,
        width: 200,
        height: 200,
        colorDark: '#1F2937',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H,
      });
    }
  }, [code, url]);

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;
    const a = document.createElement('a');
    a.download = `qr-${code}.png`;
    a.href = canvas.toDataURL();
    a.click();
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">
            QR Code — /{code}
          </div>
          <button className="btn-icon" onClick={onClose}>
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className="modal-body">
          <div className="qr-container">
            <div ref={qrRef} style={{ padding: 16, background: 'white', borderRadius: 12, border: '1px solid #E5E7EB' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 4 }}>Link rút gọn</div>
              <div
                style={{
                  fontFamily: 'DM Mono, monospace',
                  fontSize: 13,
                  color: 'var(--gray-700)',
                  background: 'var(--gray-50)',
                  padding: '6px 12px',
                  borderRadius: 8,
                }}
              >
                {url}
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={() => { copyText(url); toast('Đã sao chép!'); }}>
            <Icon name="copy" size={14} /> Sao chép
          </button>
          <button className="btn btn-primary btn-sm" onClick={downloadQR}>
            <Icon name="download" size={14} /> Tải QR
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRModal;
