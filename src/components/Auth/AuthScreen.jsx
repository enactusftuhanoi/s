import React, { useState } from 'react';
import { WORKER_URL } from '../../config/constants';
import { toast } from '../Common/Utils';

const AuthScreen = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      toast('Vui lòng nhập đầy đủ', 'error');
      return;
    }
    setLoading(true);
    const auth = 'Basic ' + btoa(username + ':' + password);
    try {
      const res = await fetch(`${WORKER_URL}/admin/current-user`, {
        headers: { Authorization: auth },
      });
      if (res.ok) {
        const userData = await res.json();
        sessionStorage.setItem('adminAuth', auth);
        sessionStorage.setItem('adminUser', username);
        sessionStorage.setItem('userRole', userData.role || 'Member');
        onLogin(auth, username, userData);
      } else {
        toast('Sai tên đăng nhập hoặc mật khẩu', 'error');
      }
    } catch {
      toast('Không thể kết nối server', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/icon.png" alt="" onError={(e) => (e.target.style.display = 'none')} />
          <div>
            <div className="auth-title">URL Shortener</div>
            <div className="auth-subtitle">Enactus FTU Hanoi</div>
          </div>
        </div>
        <div className="auth-form-group">
          <label className="auth-label">Tên đăng nhập</label>
          <input
            className="auth-input"
            type="text"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
        </div>
        <div className="auth-form-group">
          <label className="auth-label">Mật khẩu</label>
          <input
            className="auth-input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
        </div>
        <button className="auth-btn" onClick={handleLogin} disabled={loading}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập →'}
        </button>
      </div>
    </div>
  );
};

export default AuthScreen;
