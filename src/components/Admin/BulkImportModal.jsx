import React, { useState } from 'react';
import { WORKER_URL } from '../../config/constants';
import { toast } from '../Common/Utils';
import { Icon } from '../Common/Icons';
import Swal from 'sweetalert2';

const BulkImportModal = ({ isOpen, onClose, auth, onImportSuccess, currentUser }) => {
  const [bulkInputText, setBulkInputText] = useState('');
  const [parsedUsers, setParsedUsers] = useState([]);
  const [bulkErrors, setBulkErrors] = useState([]);

  if (!isOpen) return null;

  const handleParseBulkData = () => {
    if (!bulkInputText.trim()) {
      toast('Vui lòng dán dữ liệu vào ô!', 'error');
      return;
    }

    const lines = bulkInputText.split('\n');
    const tempUsers = [];
    const errors = [];

    lines.forEach((line, index) => {
      if (!line.trim()) return;

      const parts = line.split('\t').map((p) => p.trim());

      if (parts.length < 3) {
        errors.push(`Dòng ${index + 1}: Dữ liệu không đủ cột (Cần ít nhất: Họ tên, Phòng ban, Username).`);
        return;
      }

      const [fullname, department, username, email, roleRaw] = parts;
      const role = ['Admin', 'SuperAdmin'].includes(roleRaw) ? roleRaw : 'Member';

      if (!fullname || !username) {
        errors.push(`Dòng ${index + 1}: Thiếu Họ tên hoặc Username.`);
        return;
      }

      if (tempUsers.some((u) => u.username === username)) {
        errors.push(`Dòng ${index + 1}: Username "${username}" bị trùng lặp trong danh sách.`);
        return;
      }

      tempUsers.push({ fullname, department, username, email, role });
    });

    setParsedUsers(tempUsers);
    setBulkErrors(errors);

    if (errors.length > 0) {
      toast(`Phát hiện ${errors.length} lỗi. Vui lòng kiểm tra lại bảng bên dưới.`, 'warning');
    } else {
      toast(`Đã quét thành công ${tempUsers.length} tài khoản!`, 'success');
    }
  };

  const handleUpdateParsedCell = (index, field, value) => {
    const updated = [...parsedUsers];
    updated[index][field] = value;
    setParsedUsers(updated);
  };

  const handleRemoveParsedRow = (index) => {
    setParsedUsers(parsedUsers.filter((_, i) => i !== index));
  };

  const handleSubmitBulkUsers = async () => {
    if (parsedUsers.length === 0) {
      Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Không có dữ liệu hợp lệ để tạo tài khoản.' });
      return;
    }

    const finalUsernames = parsedUsers.map((u) => u.username.trim());
    if (finalUsernames.some((val, i) => finalUsernames.indexOf(val) !== i)) {
      Swal.fire({ icon: 'error', title: 'Lỗi trùng lặp', text: 'Vẫn còn tài khoản bị trùng Username trong bảng chỉnh sửa!' });
      return;
    }

    try {
      const res = await fetch(`${WORKER_URL}/admin/users/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: auth },
        body: JSON.stringify({ users: parsedUsers }),
      });
      const data = await res.json();

      if (res.ok) {
        let msg = `Đã import thành công ${parsedUsers.length} tài khoản!`;
        if (data.errors && data.errors.length > 0) msg += `\n(Bỏ qua ${data.errors.length} dòng lỗi hệ thống)`;

        Swal.fire({ icon: 'success', title: 'Thành công', text: msg });
        onClose();
        setBulkInputText('');
        setParsedUsers([]);
        setBulkErrors([]);
        onImportSuccess();
      } else {
        Swal.fire({ icon: 'error', title: 'Thất bại', text: data.error || 'Có lỗi xảy ra từ máy chủ.' });
      }
    } catch {
      toast('Lỗi kết nối đến máy chủ', 'error');
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '850px' }}>
        <div className="modal-header">
          <div className="modal-title">
            <Icon name="logs" size={16} style={{ verticalAlign: -2, marginRight: 6 }} /> Import tài khoản hàng loạt
          </div>
          <button className="btn-icon" onClick={() => { onClose(); setParsedUsers([]); setBulkErrors([]); }}>
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className="modal-body">
          <div style={{ fontSize: '13px', color: 'var(--gray-600)', marginBottom: '12px', lineHeight: '1.5' }}>
            💡 Hãy sao chép (Copy) các cột dữ liệu trực tiếp từ file Excel hoặc Google Sheets theo đúng thứ tự cấu trúc: <br />
            <strong style={{ color: 'var(--gray-900)' }}>Họ và tên [Tab] Ban [Tab] Username [Tab] Email [Tab] Quyền (Admin/Member)</strong>
          </div>

          <textarea
            className="form-input"
            rows={6}
            style={{
              width: '100%',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '12.5px',
              padding: '12px',
              resize: 'vertical',
              background: 'var(--gray-50)',
              marginBottom: '12px',
              borderRadius: 'var(--radius)',
            }}
            placeholder="Dán dữ liệu vào đây...&#10;Ví dụ:&#10;Đỗ Huyền Trang&#9;BĐH&#9;trangdh&#9;trangdh@example.com&#9;Admin&#10;Dương Minh Anh&#9;ER&#9;anhdm&#9;anhdm@example.com&#9;Member"
            value={bulkInputText}
            onChange={(e) => setBulkInputText(e.target.value)}
          />

          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <button className="btn btn-primary btn-sm" onClick={handleParseBulkData}>
              <Icon name="refresh" size={13} /> Phân tích & Kiểm tra logic
            </button>
            {parsedUsers.length > 0 && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => { setBulkInputText(''); setParsedUsers([]); setBulkErrors([]); }}
              >
                Xóa làm lại
              </button>
            )}
          </div>

          {bulkErrors.length > 0 && (
            <div
              style={{
                background: '#FEE2E2',
                border: '1.5px solid #FCA5A5',
                padding: '12px',
                borderRadius: 'var(--radius)',
                marginBottom: '16px',
                maxHeight: '140px',
                overflowY: 'auto',
              }}
            >
              <div style={{ color: '#991B1B', fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>
                Cảnh báo lỗi dữ liệu nhập vào:
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12.5px', color: '#B91C1C', lineHeight: '1.6' }}>
                {bulkErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {parsedUsers.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--gray-800)' }}>
                Bảng kiểm tra dữ liệu chỉnh sửa ({parsedUsers.length} tài khoản hợp lệ):
              </div>
              <div style={{ maxHeight: '280px', overflowY: 'auto', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
                  <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                    <tr>
                      <th style={{ padding: '8px 12px', background: 'var(--gray-50)', fontSize: '12px', color: 'var(--gray-500)', borderBottom: '1px solid var(--gray-200)' }}>
                        Họ và tên
                      </th>
                      <th style={{ padding: '8px 12px', background: 'var(--gray-50)', fontSize: '12px', color: 'var(--gray-500)', borderBottom: '1px solid var(--gray-200)' }}>
                        Phòng ban
                      </th>
                      <th style={{ padding: '8px 12px', background: 'var(--gray-50)', fontSize: '12px', color: 'var(--gray-500)', borderBottom: '1px solid var(--gray-200)' }}>
                        Username
                      </th>
                      <th style={{ padding: '8px 12px', background: 'var(--gray-50)', fontSize: '12px', color: 'var(--gray-500)', borderBottom: '1px solid var(--gray-200)' }}>
                        Email
                      </th>
                      <th style={{ padding: '8px 12px', background: 'var(--gray-50)', fontSize: '12px', color: 'var(--gray-500)', borderBottom: '1px solid var(--gray-200)' }}>
                        Quyền hạn
                      </th>
                      <th style={{ padding: '8px 12px', background: 'var(--gray-50)', fontSize: '12px', color: 'var(--gray-500)', borderBottom: '1px solid var(--gray-200)', textAlign: 'center' }}>
                        Xóa
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedUsers.map((u, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                        <td style={{ padding: '4px 8px' }}>
                          <input
                            type="text"
                            className="form-input"
                            style={{ padding: '6px 10px', fontSize: '13px', marginBottom: 0 }}
                            value={u.fullname}
                            onChange={(e) => handleUpdateParsedCell(index, 'fullname', e.target.value)}
                          />
                        </td>
                        <td style={{ padding: '4px 8px' }}>
                          <input
                            type="text"
                            className="form-input"
                            style={{ padding: '6px 10px', fontSize: '13px', marginBottom: 0 }}
                            value={u.department}
                            onChange={(e) => handleUpdateParsedCell(index, 'department', e.target.value)}
                          />
                        </td>
                        <td style={{ padding: '4px 8px' }}>
                          <input
                            type="text"
                            className="form-input"
                            style={{ padding: '6px 10px', fontSize: '13px', marginBottom: 0 }}
                            value={u.username}
                            onChange={(e) => handleUpdateParsedCell(index, 'username', e.target.value)}
                          />
                        </td>
                        <td style={{ padding: '4px 8px' }}>
                          <select
                            className="form-input"
                            style={{ padding: '6px 10px', fontSize: '13px', marginBottom: 0 }}
                            value={u.role}
                            onChange={(e) => handleUpdateParsedCell(index, 'role', e.target.value)}
                          >
                            <option value="Member">Member</option>
                            <option value="Admin">Admin</option>
                            {currentUser?.role === 'SuperAdmin' && <option value="SuperAdmin">SuperAdmin</option>}
                          </select>
                        </td>
                        <td style={{ padding: '4px 8px', textAlign: 'center' }}>
                          <button className="btn-icon" style={{ color: 'var(--red)' }} onClick={() => handleRemoveParsedRow(index)}>
                            <Icon name="close" size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer" style={{ borderTop: '1px solid var(--gray-100)', paddingTop: '16px' }}>
          <button className="btn btn-secondary" onClick={() => { onClose(); setParsedUsers([]); setBulkErrors([]); }}>
            Hủy
          </button>
          <button className="btn btn-primary" disabled={parsedUsers.length === 0} onClick={handleSubmitBulkUsers}>
            <Icon name="check" size={14} /> Xác nhận tạo ({parsedUsers.length} Users)
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkImportModal;
