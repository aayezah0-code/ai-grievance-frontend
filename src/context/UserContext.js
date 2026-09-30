'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchUserData(userId, preservedData) {
    if (!userId) return;
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(apiBase + '/api/users/me/' + userId);
      if (res.ok) {
        const freshData = await res.json();
        setUser(function(prev) {
          const existing = prev || {};
          const pd = preservedData || {};
          const updatedUser = {
            ...existing,
            ...freshData,
            id: userId,
            user_id: userId,
            access_token: existing.access_token || pd.access_token || null,
            role: freshData.role || existing.role || pd.role || 'citizen',
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          return updatedUser;
        });
      }
    } catch (err) {
      console.error('[UserContext] fetchUserData error:', err);
    }
  }

  useEffect(function() {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      setLoading(false);
      return;
    }
    let parsedUser;
    try {
      parsedUser = JSON.parse(savedUser);
    } catch (e) {
      console.error('[UserContext] localStorage parse error:', e);
      localStorage.removeItem('user');
      setLoading(false);
      return;
    }
    setUser(parsedUser);
    const uid = parsedUser.user_id || parsedUser.id;
    if (uid) {
      fetchUserData(uid, parsedUser).then(function() {
        setLoading(false);
      }).catch(function() {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  function updateUser(userData) {
    setUser(function(prev) {
      const updatedUser = { ...(prev || {}), ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('user');
  }

  return (
    <UserContext.Provider value={{
      user: user,
      setUser: setUser,
      updateUser: updateUser,
      logout: logout,
      loading: loading,
      refreshUser: function() {
        return fetchUserData(user && (user.id || user.user_id), user || {});
      },
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
