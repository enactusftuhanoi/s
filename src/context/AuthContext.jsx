import React, { createContext, useState, useContext, useEffect } from 'react';
import { WORKER_URL } from '../config/constants';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => sessionStorage.getItem('adminAuth'));
  const [username, setUsername] = useState(() => sessionStorage.getItem('adminUser') || '');
  const [userRole, setUserRole] = useState(() => sessionStorage.getItem('userRole') || 'Member');
  const [userFullname, setUserFullname] = useState(() => localStorage.getItem('userFullname') || '');
  const [currentUserInfo, setCurrentUserInfo] = useState(null);
  const [mustChangePw, setMustChangePw] = useState(false);

  const login = (authToken, user, userData) => {
    setAuth(authToken);
    setUsername(user);
    setCurrentUserInfo(userData);
    setUserRole(userData?.role || 'Member');
    if (userData?.fullname) {
      setUserFullname(userData.fullname);
      localStorage.setItem('userFullname', userData.fullname);
    }
    setMustChangePw(userData?.must_change_password === true);
    sessionStorage.setItem('adminAuth', authToken);
    sessionStorage.setItem('adminUser', user);
    sessionStorage.setItem('userRole', userData?.role || 'Member');
  };

  const logout = () => {
    sessionStorage.removeItem('adminAuth');
    sessionStorage.removeItem('adminUser');
    sessionStorage.removeItem('userRole');
    setAuth(null);
    setUsername('');
    setUserRole('Member');
    setUserFullname('');
    setMustChangePw(false);
    localStorage.removeItem('userFullname');
  };

  const pwChanged = () => {
    setMustChangePw(false);
  };

  return (
    <AuthContext.Provider
      value={{
        auth,
        username,
        userRole,
        userFullname,
        currentUserInfo,
        mustChangePw,
        login,
        logout,
        pwChanged,
        setMustChangePw,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
