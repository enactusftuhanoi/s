import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthScreen from './components/Auth/AuthScreen';
import ForceChangePasswordScreen from './components/Auth/ForceChangePasswordScreen';
import Sidebar from './components/Layout/Sidebar';
import Topbar from './components/Layout/Topbar';
import BottomNav from './components/Layout/BottomNav';
import ChangePasswordModal from './components/Common/ChangePasswordModal';
import DashboardView from './components/Dashboard/DashboardView';
import CreateLinkView from './components/Links/CreateLinkView';
import LinksView from './components/Links/LinksView';
import AnalyticsView from './components/Analytics/AnalyticsView';
import AdminView from './components/Admin/AdminView';
import ProfileView from './components/Profile/ProfileView';

const AppContent = () => {
  const { auth, username, userRole, userFullname, mustChangePw, login, logout, pwChanged } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showChangePw, setShowChangePw] = useState(false);

  if (!auth) {
    return <AuthScreen onLogin={login} />;
  }

  if (mustChangePw) {
    return <ForceChangePasswordScreen auth={auth} username={username} onSuccess={pwChanged} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView auth={auth} username={username} />;
      case 'create':
        return <CreateLinkView auth={auth} />;
      case 'links':
        return <LinksView auth={auth} userRole={userRole} currentUsername={username} />;
      case 'analytics':
        return <AnalyticsView />;
      case 'admin':
        return <AdminView auth={auth} currentUser={{ username, role: userRole }} />;
      case 'profile':
        return <ProfileView auth={auth} username={username} />;
      default:
        return <DashboardView auth={auth} username={username} />;
    }
  };

  return (
    <>
      {showChangePw && <ChangePasswordModal auth={auth} onClose={() => setShowChangePw(false)} />}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={logout}
        username={username}
        userRole={userRole}
        userFullname={userFullname}
        onShowChangePw={() => setShowChangePw(true)}
      />
      <main className="main">
        <Topbar activeTab={activeTab} />
        <div className="content" style={{ position: 'relative' }}>
          {renderContent()}
        </div>
      </main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} userRole={userRole} />
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
