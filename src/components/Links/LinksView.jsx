import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { WORKER_URL, YOUR_DOMAIN } from '../../config/constants';
import { toast, copyText, confirmDialog, formatDate, isExpired } from '../Common/Utils';
import { Icon } from '../Common/Icons';
import { LinkStatusBadges } from '../Common/Badges';
import QRModal from './QRModal';
import UTMModal from './UTMModal';
import EditLinkModal from './EditLinkModal';

const LinksView = ({ auth, userRole, currentUsername }) => {
  const [links, setLinks] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState(null);
  const [utmCode, setUtmCode] = useState(null);
  const [editLink, setEditLink] = useState(null);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');

  const fetchLinks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${WORKER_URL}/links`, { headers: { Authorization: auth } });
      setLinks(await res.json());
    } catch {
      toast('Lỗi tải link', 'error');
    }
    setLoading(false);
  }, [auth]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const filtered = useMemo(() => {
    let arr = links.filter(
      (l) =>
        !search ||
        l.code.toLowerCase().includes(search.toLowerCase()) ||
        l.original_url.toLowerCase().includes(search.toLowerCase())
    );
    arr = [...arr].sort((a, b) => {
      let va = a[sortBy],
        vb = b[sortBy];
      if (sortBy === 'clicks') {
        va = va || 0;
        vb = vb || 0;
      }
      return sortDir === 'asc' ? (va > vb ? 1 : -1) : va < vb ? 1 : -1;
    });
    return arr;
  }, [links, search, sortBy, sortDir]);

  const handleDelete = async (code) => {
    const res = await confirmDialog('Xóa link?', `Xóa /${code}? Không thể hoàn tác.`, 'Xóa');
    if (!res.isConfirmed) return;
    try {
      const r = await fetch(`${WORKER_URL}/delete/${code}`, { method: 'DELETE', headers: { Authorization: auth } });
      if (r.ok) {
        toast(`Đã xóa /${code}`);
        fetchLinks();
      } else {
        const d = await r.json();
        toast(d.error || 'Lỗi', 'error');
      }
    } catch {
      toast('Lỗi kết nối', 'error');
    }
  };

  const exportExcel = () => {
    if (!window.XLSX) {
      toast('Chưa tải thư viện Excel', 'error');
      return;
    }
    const ws = window.XLSX.utils.json_to_sheet(
      links.map((l) => ({
        'Short Code': l.code,
        'Short URL': `https://${YOUR_DOMAIN}/${l.code}`,
        'Original URL': l.original_url,
        Clicks: l.clicks || 0,
        Status: isExpired(l.expiry_date) ? 'Hết hạn' : 'Active',
        Expiry: l.expiry_date || '-',
        'Has Password': l.has_password ? 'Yes' : 'No',
        'Created By': l.created_by,
        'Created At': formatDate(l.created_at),
      }))
    );
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, 'Links');
    window.XLSX.writeFile(wb, `links-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast('Đã xuất Excel!');
  };

  const toggleLinkPublic = async (code, currentStatus) => {
    try {
      const res = await fetch(`${WORKER_URL}/link/${code}/toggle-public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: auth },
        body: JSON.stringify({ is_public: !currentStatus }),
      });
      if (res.ok) {
        toast(!currentStatus ? 'Đã chuyển sang Public' : 'Đã chuyển sang Private');
        fetchLinks();
      } else {
        toast('Không có quyền', 'error');
      }
    } catch {
      toast('Lỗi kết nối', 'error');
    }
  };

  const sortClick = (col) => {
    setSortBy(col);
    setSortDir(sortBy === col && sortDir === 'desc' ? 'asc' : 'desc');
  };
  const sortInd = (col) => (sortBy === col ? (sortDir === 'desc' ? ' ↓' : ' ↑') : '');

    return (
    <div className="view-section fade-in">
      {qrCode && <QRModal code={qrCode} onClose={() => setQrCode(null)} />}
      {utmCode && <UTMModal code={utmCode} onClose={() => setUtmCode(null)} />}
      {editLink && (
        <EditLinkModal
          link={editLink}
          auth={auth}
          userRole={userRole}
          currentUsername={currentUsername}
          onClose={() => setEditLink(null)}
          onSaved={fetchLinks}
        />
      )}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
            <div style={{ position: 'relative', width: 280 }}>
              <Icon
                name="search"
                size={15}
                color="var(--gray-400)"
                style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                className="form-input"
                style={{ paddingLeft: 36, marginBottom: 0 }}
                placeholder="Tìm kiếm link..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <span className="badge badge-gray">{filtered.length} link</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={exportExcel}>
              <Icon name="download" size={14} /> Excel
            </button>
            <button className="refresh-btn" onClick={fetchLinks}>
              <Icon name="refresh" size={13} /> Làm mới
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
            <div className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Icon name="link" size={36} color="var(--gray-300)" />
            <p>Không có link nào{search ? ` khớp với "${search}"` : ''}</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Short URL</th>
                  <th>Destination</th>
                  <th style={{ cursor: 'pointer' }} onClick={() => sortClick('clicks')}>
                    Clicks{sortInd('clicks')}
                  </th>
                  <th>Status</th>
                  <th style={{ cursor: 'pointer' }} onClick={() => sortClick('created_at')}>
                    Created at{sortInd('created_at')}
                  </th>
                  <th>Owner</th>
                  <th style={{ textAlign: 'center' }}>View</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((link) => (
                  <tr key={link.code} style={{ opacity: isExpired(link.expiry_date) ? 0.7 : 1 }}>
                    <td>
                      <span className="code-chip">{link.code}</span>
                    </td>
                    <td>
                      <a
                        href={`https://${YOUR_DOMAIN}/${link.code}`}
                        target="_blank"
                        style={{
                          color: 'var(--yellow-dark)',
                          fontFamily: 'DM Mono, monospace',
                          fontSize: 12.5,
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        {YOUR_DOMAIN}/{link.code} <Icon name="external" size={12} />
                      </a>
                    </td>
                    <td>
                      <div
                        style={{
                          maxWidth: 180,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontSize: 12.5,
                          color: 'var(--gray-500)',
                        }}
                        title={link.original_url}
                      >
                        {link.original_url}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-gray">
                        <Icon name="analytics" size={11} />
                        {link.clicks || 0}
                      </span>
                    </td>
                    <td>
                      <LinkStatusBadges link={link} />
                    </td>
                    <td style={{ fontSize: 12.5, color: 'var(--gray-500)', whiteSpace: 'nowrap' }}>
                      {formatDate(link.created_at)}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--gray-500)' }}>{link.created_by || 'unknown'}</td>
                    <td style={{ textAlign: 'center' }}>
                      {(userRole === 'Admin' || userRole === 'SuperAdmin') ? (
                        <span
                          className={`badge ${link.is_public ? 'badge-green' : 'badge-gray'}`}
                          onClick={() => toggleLinkPublic(link.code, link.is_public)}
                          style={{ cursor: 'pointer' }}
                          title={link.is_public ? 'Nhấn để chuyển sang Private' : 'Nhấn để chuyển sang Public'}
                        >
                          <Icon name={link.is_public ? 'globe' : 'lock'} size={12} />
                          {link.is_public ? ' Public' : ' Private'}
                        </span>
                      ) : (
                        <span className={`badge ${link.is_public ? 'badge-green' : 'badge-gray'}`}>
                          <Icon name={link.is_public ? 'globe' : 'lock'} size={12} />
                          {link.is_public ? ' Public' : ' Private'}
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                        <button
                          className="btn-icon"
                          title="Copy"
                          onClick={() => {
                            copyText(`https://${YOUR_DOMAIN}/${link.code}`);
                            toast('Đã sao chép!');
                          }}
                        >
                          <Icon name="copy" size={15} />
                        </button>
                        <button
                          className="btn-icon"
                          title="QR"
                          onClick={() => setQrCode(link.code)}
                          style={{ color: 'var(--purple)' }}
                        >
                          <Icon name="qr" size={15} />
                        </button>
                        <button
                          className="btn-icon"
                          title="UTM"
                          onClick={() => setUtmCode(link.code)}
                          style={{ color: 'var(--blue)' }}
                        >
                          <Icon name="tag" size={15} />
                        </button>
                        {(link.created_by === currentUsername || userRole === 'Admin' || userRole === 'SuperAdmin') && (
                          <button
                            className="btn-icon"
                            title="Chỉnh sửa"
                            onClick={() => setEditLink(link)}
                            style={{ color: 'var(--orange)' }}
                          >
                            <Icon name="edit" size={15} />
                          </button>
                        )}
                        {(link.created_by === currentUsername || userRole === 'Admin' || userRole === 'SuperAdmin') && (
                          <button
                            className="btn-icon"
                            title="Xóa"
                            onClick={() => handleDelete(link.code)}
                            style={{ color: 'var(--red)' }}
                          >
                            <Icon name="trash" size={15} />
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
    </div>
  );
};

export default LinksView;
