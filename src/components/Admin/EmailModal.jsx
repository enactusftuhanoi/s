import React, { useState } from 'react';
import { WORKER_URL } from '../../config/constants';
import { toast } from '../Common/Utils';
import { Icon } from '../Common/Icons';

const EmailModal = ({ isOpen, onClose, auth, users }) => {
  const [emailForm, setEmailForm] = useState({
    recipient_type: 'all',
    selected_users: [],
    selected_role: 'Member',
    subject: 'Chào mừng bạn đến hệ thống URL Shortener Enactus FTU Hanoi',
    template: 'welcome',
    body: 'Chào {fullname},\n\nBạn đã tạo tài khoản trên hệ thống URL Shortener Enactus FTU Hanoi.\n\nLink: https://s.enactusftuhanoi.id.vn\nUsername: {username}\nMật khẩu mặc định: {username}\n\nVui lòng đổi mật khẩu khi đăng nhập lần đầu.\n\nTrân trọng,\nEnactus FTU Hanoi',
    sending: false,
    sendLog: [],
  });

  if (!isOpen) return null;

  const getEmailTemplate = (type) => {
    const templates = {
      welcome: {
        subject: 'Chào mừng bạn đến hệ thống URL Shortener Enactus FTU Hanoi',
        body: 'Chào {fullname},\n\nBạn đã tạo tài khoản trên hệ thống URL Shortener Enactus FTU Hanoi.\n\n📌 Thông tin tài khoản:\n- Link: https://s.enactusftuhanoi.id.vn\n- Username: {username}\n- Mật khẩu: {username}\n\n⚠️ Vui lòng đổi mật khẩu khi đăng nhập.\n\nTrân trọng,\nEnactus FTU Hanoi',
      },
      general: {
        subject: 'Thông báo từ Enactus FTU Hanoi',
        body: 'Chào {fullname},\n\nVui lòng nhập nội dung thông báo.\n\nTrân trọng,\nEnactus FTU Hanoi',
      },
      password_reset: {
        subject: 'Đặt lại mật khẩu',
        body: 'Chào {fullname},\n\nMật khẩu mới của bạn là: {username}\n\nVui lòng đổi khi đăng nhập.\n\nTrân trọng,\nEnactus FTU Hanoi',
      },
    };
    return templates[type] || templates.general;
  };

  const getRecipientList = () => {
    if (emailForm.recipient_type === 'all') return users;
    if (emailForm.recipient_type === 'role') return users.filter((u) => u.role === emailForm.selected_role);
    if (emailForm.recipient_type === 'specific') return users.filter((u) => emailForm.selected_users.includes(u.username));
    return [];
  };

  const handleSendEmail = async () => {
    const recipients = getRecipientList();
    if (recipients.length === 0) {
      toast('Chọn ít nhất 1 người', 'error');
      return;
    }
    if (!emailForm.subject.trim() || !emailForm.body.trim()) {
      toast('Nhập tiêu đề & nội dung', 'error');
      return;
    }

    setEmailForm({ ...emailForm, sending: true, sendLog: [] });
    try {
      const res = await fetch(`${WORKER_URL}/admin/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: auth },
        body: JSON.stringify({
          recipients: recipients.map((u) => ({
            username: u.username,
            email: u.email || u.username + '@enactus.local',
            fullname: u.fullname,
            department: u.department,
          })),
          subject: emailForm.subject,
          body: emailForm.body,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmailForm({ ...emailForm, sending: false, sendLog: data.log || [] });
        toast(`Gửi thành công cho ${recipients.length} người!`, 'success', 2000);
      } else {
        toast(data.error || 'Lỗi', 'error');
        setEmailForm({ ...emailForm, sending: false });
      }
    } catch {
      toast('Lỗi kết nối', 'error');
      setEmailForm({ ...emailForm, sending: false });
    }
  };

  const handleTemplateChange = (template) => {
    const tmpl = getEmailTemplate(template);
    setEmailForm({ ...emailForm, template, subject: tmpl.subject, body: tmpl.body });
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && !emailForm.sending && onClose()}>
      <div className="modal" style={{ maxWidth: 700, maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <div className="modal-title">Gửi mail hệ thống</div>
          <button className="btn-icon" onClick={onClose} disabled={emailForm.sending}>
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className="modal-body">
          {emailForm.sendLog.length > 0 ? (
            <div>
              <h3 style={{ fontSize: 14, marginBottom: 12, fontWeight: 600 }}>Kết quả:</h3>
              <div style={{ maxHeight: 300, overflowY: 'auto', border: '1px solid var(--gray-200)', borderRadius: 8, padding: 12 }}>
                {emailForm.sendLog.map((log, i) => (
                  <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid var(--gray-100)', fontSize: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{log.recipient}</span>
                      <span className={`badge ${log.success ? 'badge-green' : 'badge-red'}`}>
                        {log.success ? '✓ OK' : '✗ Lỗi'}
                      </span>
                    </div>
                    {log.message && (
                      <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 3 }}>{log.message}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">Gửi tới</label>
                <select
                  className="form-input"
                  value={emailForm.recipient_type}
                  onChange={(e) =>
                    setEmailForm({ ...emailForm, recipient_type: e.target.value, selected_users: [] })
                  }
                >
                  <option value="all">Tất cả ({users.length} người)</option>
                  <option value="role">Theo vai trò</option>
                  <option value="specific">Chọn từng người</option>
                </select>
              </div>

              {emailForm.recipient_type === 'role' && (
                <div className="form-group">
                  <label className="form-label">Vai trò</label>
                  <select
                    className="form-input"
                    value={emailForm.selected_role}
                    onChange={(e) => setEmailForm({ ...emailForm, selected_role: e.target.value })}
                  >
                    <option value="Member">Member ({users.filter((u) => u.role === 'Member').length})</option>
                    <option value="Admin">Admin ({users.filter((u) => u.role === 'Admin').length})</option>
                    <option value="SuperAdmin">SuperAdmin ({users.filter((u) => u.role === 'SuperAdmin').length})</option>
                  </select>
                </div>
              )}

              {emailForm.recipient_type === 'specific' && (
                <div className="form-group">
                  <label className="form-label">
                    Chọn thành viên ({emailForm.selected_users.length}/{users.length})
                  </label>
                  <div
                    style={{
                      border: '1px solid var(--gray-200)',
                      borderRadius: 8,
                      maxHeight: 150,
                      overflowY: 'auto',
                      padding: 8,
                    }}
                  >
                    {users.map((u) => (
                      <label key={u.username} style={{ display: 'flex', alignItems: 'center', padding: '6px 8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={emailForm.selected_users.includes(u.username)}
                          onChange={(e) =>
                            setEmailForm({
                              ...emailForm,
                              selected_users: e.target.checked
                                ? [...emailForm.selected_users, u.username]
                                : emailForm.selected_users.filter((n) => n !== u.username),
                            })
                          }
                          style={{ marginRight: 8 }}
                        />
                        <span style={{ fontSize: 13 }}>{u.fullname || u.username}</span>
                      </label>
                    ))}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 6 }}>
                    → Sẽ gửi: {getRecipientList().length} người
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Mẫu</label>
                <select
                  className="form-input"
                  value={emailForm.template}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                >
                  <option value="welcome">Chào mừng</option>
                  <option value="general">Thông báo chung</option>
                  <option value="password_reset">Đặt lại mật khẩu</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Tiêu đề</label>
                <input
                  type="text"
                  className="form-input"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nội dung</label>
                <textarea
                  className="form-input"
                  style={{ minHeight: 120, fontFamily: 'DM Mono, monospace', fontSize: 12 }}
                  value={emailForm.body}
                  onChange={(e) => setEmailForm({ ...emailForm, body: e.target.value })}
                />
                <div className="form-hint">Biến: {'{fullname}'}, {'{username}'}, {'{email}'}, {'{department}'}</div>
              </div>
            </>
          )}
        </div>
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div></div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn btn-secondary"
              onClick={() => {
                onClose();
                setEmailForm({ ...emailForm, sendLog: [] });
              }}
              disabled={emailForm.sending}
            >
              Hủy
            </button>
            {emailForm.sendLog.length === 0 && (
              <button
                className="btn btn-primary"
                onClick={handleSendEmail}
                disabled={emailForm.sending || getRecipientList().length === 0}
              >
                {emailForm.sending ? '⏳ Gửi...' : `Gửi (${getRecipientList().length})`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailModal;
