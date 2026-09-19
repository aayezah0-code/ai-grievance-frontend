'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        // Fetch fresh data from backend if user_id exists
        if (parsedUser.user_id || parsedUser.id) {
          fetchUserData(parsedUser.user_id || parsedUser.id);
        }
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    }
    setLoading(false);
  }, []);

  const fetchUserData = async (userId) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/users/me/${userId}`);
      if (res.ok) {
        const freshData = await res.json();
        // Use functional update to avoid stale closure bug
        setUser(prev => {
          const updatedUser = { ...(prev || {}), ...freshData, id: userId, user_id: userId };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          return updatedUser;
        });
      }
    } catch (err) {
      console.error("Error fetching fresh user data:", err);
    }
  };

  const updateUser = (userData) => {
    setUser(prev => {
      const updatedUser = { ...(prev || {}), ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <UserContext.Provider value={{ user, setUser, updateUser, logout, loading, refreshUser: () => fetchUserData(user?.id || user?.user_id) }}>
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
