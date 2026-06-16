import React, { useState, useEffect, useCallback } from 'react';
import { WORKER_URL } from '../../config/constants';
import { toast, formatDate } from '../Common/Utils';
import { Icon } from '../Common/Icons';
import Swal from 'sweetalert2';
import BulkImportModal from './BulkImportModal';
import EmailModal from './EmailModal';

const AdminView = ({ auth, currentUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [publicMode, setPublicMode] = useState(false);
  const [selLogs, setSelLogs] = useState(null);
  const [form, setForm] = useState({ fullname: '', department: '', username: '', email: '', role: 'Member' });
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${WORKER_URL}/admin/users`, { headers: { Authorization: auth } });
      if (res.status === 403) {
        toast('Không có quyền', 'error');
        return;
      }
      setUsers(await res.json());
    } catch {
      toast('Lỗi tải users', 'error');
    }
    setLoading(false);
  }, [auth]);

  const fetchPublicMode = useCallback(async () => {
    try {
      const res = await fetch(`${WORKER_URL}/admin/settings/public`, { headers: { Authorization: auth } });
      const d = await res.json();
      setPublicMode(d.enabled);
    } catch {}
  }, [auth]);

  useEffect(() => {
    fetchUsers();
    fetchPublicMode();
  }, [fetchUsers, fetchPublicMode]);

  const saveUser = async () => {
    if (!form.username) {
      toast('Nhập username', 'error');
      return;
    }
    try {
      const method = editingUser ? 'PUT' : 'POST';
      const url = editingUser
        ? `${WORKER_URL}/admin/users/${editingUser.username}`
        : `${WORKER_URL}/admin/users`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: auth },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast(
          editingUser
            ? 'Cập nhật thành công'
            : `Tạo user "${form.username}" thành công! Mật khẩu = username, phải đổi khi đăng nhập lần đầu.`,
          'success',
          4000
        );
        fetchUsers();
        setShowModal(false);
        setEditingUser(null);
        setForm({ fullname: '', department: '', username: '', email: '', role: 'Member' });
      } else {
        const e = await res.json();
        toast(e.error || 'Lỗi', 'error');
      }
    } catch {
      toast('Lỗi kết nối', 'error');
    }
  };

  const resetPw = async (username) => {
    const r = await Swal.fire({
      title: 'Reset mật khẩu?',
      text: `Mật khẩu mới = "${username}". User phải đổi khi đăng nhập lại.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FFC107',
      cancelButtonText: 'Hủy',
      confirmButtonText: 'Reset',
    });
    if (!r.isConfirmed) return;
    try {
      const res = await fetch(`${WORKER_URL}/admin/users/${username}/reset-password`, {
        method: 'POST',
        headers: { Authorization: auth },
      });
      if (res.ok) toast(`Đã reset. Mật khẩu mới = "${username}"`);
    } catch {
      toast('Lỗi', 'error');
    }
  };

  const toggleStatus = async (username) => {
    try {
      const res = await fetch(`${WORKER_URL}/admin/users/${username}/toggle-status`, {
        method: 'POST',
        headers: { Authorization: auth },
      });
      if (res.ok) {
        toast('Đã thay đổi trạng thái');
        fetchUsers();
      }
    } catch {
      toast('Lỗi', 'error');
    }
  };

  const deleteUser = async (username) => {
    const r = await Swal.fire({
      title: 'Xóa user?',
      text: `Xóa "${username}"? Không thể hoàn tác.`,
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonText: 'Hủy',
      confirmButtonText: 'Xóa',
    });
    if (!r.isConfirmed) return;
    try {
      const res = await fetch(`${WORKER_URL}/admin/users/${username}`, {
        method: 'DELETE',
        headers: { Authorization: auth },
      });
      if (res.ok) {
        toast('Đã xóa user');
        fetchUsers();
      }
    } catch {
      toast('Lỗi', 'error');
    }
  };

  const viewLogs = async (username) => {
    try {
      const res = await fetch(`${WORKER_URL}/admin/logs/${username}`, {
        headers: { Authorization: auth },
      });
      setSelLogs({ username, logs: await res.json() });
    } catch {
      toast('Lỗi tải logs', 'error');
    }
  };

  const togglePM = async () => {
    try {
      const res = await fetch(`${WORKER_URL}/admin/settings/public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: auth },
        body: JSON.stringify({ enabled: !publicMode }),
      });
      if (res.ok) {
        setPublicMode(!publicMode);
        toast(publicMode ? 'Đã chuyển Private Mode' : 'Đã chuyển Public Mode');
      }
    } catch {
      toast('Lỗi', 'error');
    }
  };

  const roleColor = { SuperAdmin: 'badge-purple', Admin: 'badge-blue', Member: 'badge-gray' };
    return (
    <div className="view-section fade-in">
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <div className="card-title">
            <Icon name="globe" size={16} color="var(--yellow-dark)" /> Chế độ xem link
          </div>
          <button className={`btn ${publicMode ? 'btn-primary' : 'btn-secondary'}`} onClick={togglePM}>
            <Icon name={publicMode ? 'check' : 'lock'} size={14} />
            {publicMode ? 'Public Mode' : 'Private Mode'}
          </button>
        </div>
        <div className="card-body">
          <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>
            {publicMode
              ? 'Tất cả thành viên xem được link được đánh dấu public.'
              : 'Mỗi thành viên chỉ xem link mình tạo.'}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div className="card-title" style={{ margin: 0 }}>
            <Icon name="user" size={16} color="var(--purple)" /> Quản lý tài khoản
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-sm"
              style={{
                background: '#EFF6FF',
                color: '#1E40AF',
                border: '1px solid #BFDBFE',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
              onClick={() => setShowEmailModal(true)}
            >
              <Icon name="mail" size={14} /> Gửi mail hệ thống
            </button>
            <button
              className="btn btn-secondary btn-sm"
              style={{ background: 'var(--yellow-mid)', color: '#92400E', border: '1px solid #FDE68A' }}
              onClick={() => setShowBulkModal(true)}
            >
              <Icon name="logs" size={13} style={{ marginRight: '4px', verticalAlign: '-1px' }} /> Import hàng loạt
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                setEditingUser(null);
                setForm({ fullname: '', department: '', username: '', email: '', role: 'Member' });
                setShowModal(true);
              }}
            >
              <Icon name="user" size={14} /> Add user
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Department</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Password</th>
                  <th>Created at</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.username} style={{ opacity: u.status === 'disabled' ? 0.5 : 1 }}>
                    <td style={{ fontWeight: 500 }}>{u.fullname || '-'}</td>
                    <td style={{ fontSize: 12.5, color: 'var(--gray-500)' }}>{u.department || '-'}</td>
                    <td>
                      <span className="code-chip">{u.username}</span>
                    </td>
                    <td style={{ fontSize: 12.5 }}>{u.email || '-'}</td>
                    <td>
                      <span className={`badge ${roleColor[u.role] || 'badge-gray'}`}>{u.role}</span>
                    </td>
                    <td>
                      <span className={`badge ${u.status === 'active' ? 'badge-green' : 'badge-red'}`}>
                        {u.status === 'active' ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td>
                      {u.must_change_password ? (
                        <span className="badge badge-orange">
                          <Icon name="lock" size={11} /> Cần đổi
                        </span>
                      ) : (
                        <span className="badge badge-green">
                          <Icon name="check" size={11} /> OK
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: 12 }}>{formatDate(u.created_at)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button
                          className="btn-icon"
                          title="Sửa"
                          onClick={() => {
                            setEditingUser(u);
                            setForm({
                              fullname: u.fullname || '',
                              department: u.department || '',
                              username: u.username,
                              email: u.email || '',
                              role: u.role,
                            });
                            setShowModal(true);
                          }}
                        >
                          <Icon name="edit" size={14} />
                        </button>
                        <button className="btn-icon" title="Reset mật khẩu" onClick={() => resetPw(u.username)}>
                          <Icon name="key" size={14} />
                        </button>
                        <button
                          className="btn-icon"
                          title={u.status === 'active' ? 'Disable' : 'Enable'}
                          onClick={() => toggleStatus(u.username)}
                        >
                          <Icon name={u.status === 'active' ? 'close' : 'check'} size={14} />
                        </button>
                        <button className="btn-icon" title="Logs" onClick={() => viewLogs(u.username)}>
                          <Icon name="logs" size={14} />
                        </button>
                        {u.username !== 'superadmin' && (
                          <button
                            className="btn-icon"
                            title="Xóa"
                            onClick={() => deleteUser(u.username)}
                            style={{ color: 'var(--red)' }}
                          >
                            <Icon name="trash" size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <BulkImportModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        auth={auth}
        onImportSuccess={fetchUsers}
        currentUser={currentUser}
      />

      <EmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        auth={auth}
        users={users}
      />

      {showModal && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editingUser ? 'Sửa user' : 'Thêm user mới'}</div>
              <button className="btn-icon" onClick={() => setShowModal(false)}>
                <Icon name="close" size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  className="form-input"
                  value={form.fullname}
                  onChange={(e) => setForm({ ...form, fullname: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <input
                  className="form-input"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  className="form-input"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  className="form-input"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  disabled={!!editingUser}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  className="form-input"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="Member">Member</option>
                  <option value="Admin">Admin</option>
                  {currentUser?.role === 'SuperAdmin' && <option value="SuperAdmin">SuperAdmin</option>}
                </select>
              </div>
              {!editingUser && (
                <div
                  style={{
                    background: 'var(--yellow-light)',
                    border: '1px solid var(--yellow-mid)',
                    borderRadius: 8,
                    padding: '10px 14px',
                    fontSize: 12.5,
                    color: '#92400E',
                  }}
                >
                  🔐 Mật khẩu mặc định = username. User phải đổi khi đăng nhập lần đầu.
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Hủy
              </button>
              <button className="btn btn-primary" onClick={saveUser}>
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {selLogs && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setSelLogs(null)}>
          <div className="modal" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <div className="modal-title">Logs của {selLogs.username}</div>
              <button className="btn-icon" onClick={() => setSelLogs(null)}>
                <Icon name="close" size={18} />
              </button>
            </div>
            <div className="modal-body">
              {selLogs.logs.length === 0 ? (
                <div className="empty-state">
                  <p>Chưa có logs</p>
                </div>
              ) : (
                <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                  {selLogs.logs.map((l, i) => (
                    <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid var(--gray-100)', fontSize: 12 }}>
                      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'var(--gray-500)' }}>
                        {l.time}
                      </div>
                      <div>
                        <span className="badge badge-gray">{l.action}</span>
                        {l.details?.code && ` /${l.details.code}`}
                        {l.details?.username && ` ${l.details.username}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminView;
