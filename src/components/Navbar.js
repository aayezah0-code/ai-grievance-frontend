'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { useLanguage } from '@/context/LanguageContext';
import { User, Settings, Bell, LogOut, Edit3, ShieldCheck } from 'lucide-react';
import SmartSearch from './SmartSearch';

export default function Navbar() {
  const { user, logout } = useUser();
  const { t } = useLanguage();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="top-navbar">
      {/* Left Side: Brand & Links */}
      <div className="navbar-left">
        <Link href="/dashboard" className="nav-logo-wrap">
          <div className="logo-icon-box">
            <ShieldCheck size={20} color="white" />
          </div>
          <span className="logo-text">CitizenConnect</span>
        </Link>
        
        <div className="nav-main-links">
          <Link href="/" className="nav-link-btn">
            Landing Page
          </Link>
          <Link href="/dashboard" className="nav-link-btn">
            Home
          </Link>
          <Link href="/about" className="nav-link-btn">
            About
          </Link>
        </div>
      </div>

      {/* Center: Smart Search */}
      <div className="navbar-center">
        <SmartSearch />
      </div>

      {/* Right Side: Profile & Notifications */}
      <div className="navbar-right">
        <div className="nav-icon-btn">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </div>

        <div className="profile-trigger-wrap" ref={dropdownRef}>
          <button 
            className={`profile-trigger ${isDropdownOpen ? 'active' : ''}`}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="profile-avatar-container">
              {user?.profile_image_url ? (
                <img src={user.profile_image_url} alt="Profile" className="profile-avatar-img" />
              ) : (
                <div className="profile-avatar-placeholder">
                  {user?.full_name?.charAt(0) || 'C'}
                </div>
              )}
              <div className="avatar-glow"></div>
            </div>
            <div className="user-info-brief">
              <span className="user-name-text">{user?.full_name || 'Citizen'}</span>
              <span className="user-badge-text">Verified <ShieldCheck size={10} style={{display:'inline', marginLeft:2}} /></span>
            </div>
          </button>

          {isDropdownOpen && (
            <div className="profile-dropdown">
              <div className="dropdown-header">
                <p className="dropdown-email">{user?.email}</p>
              </div>
              <div className="dropdown-divider"></div>
              <ul className="dropdown-menu">
                <li>
                  <Link href="/profile" onClick={() => setIsDropdownOpen(false)}>
                    <User size={16} /> <span>{t('sidebar.profile')}</span>
                  </Link>
                </li>
                <li>
                  <Link href="/profile?edit=true" onClick={() => setIsDropdownOpen(false)}>
                    <Edit3 size={16} /> <span>Edit Profile</span>
                  </Link>
                </li>
                <li>
                  <Link href="/notifications" onClick={() => setIsDropdownOpen(false)}>
                    <Bell size={16} /> <span>{t('sidebar.notifications')}</span>
                  </Link>
                </li>
                <li>
                  <Link href="/settings" onClick={() => setIsDropdownOpen(false)}>
                    <Settings size={16} /> <span>{t('sidebar.settings')}</span>
                  </Link>
                </li>
              </ul>
              <div className="dropdown-divider"></div>
              <button className="dropdown-logout" onClick={handleLogout}>
                <LogOut size={16} /> <span>{t('sidebar.logout')}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .top-navbar {
          width: 100%;
          height: 85px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 3rem;
          position: sticky;
          top: 0;
          z-index: 1000;
          background: rgba(11, 16, 35, 0.45);
          backdrop-filter: blur(30px);
          border-bottom: 1px solid rgba(139, 92, 246, 0.2);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(139, 92, 246, 0.1);
        }

        .navbar-left {
          display: flex;
          align-items: center;
          gap: 3rem;
          flex: 1;
        }

        .nav-logo-wrap {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          transition: transform 0.3s ease;
        }

        .nav-logo-wrap:hover {
          transform: scale(1.02);
        }

        .logo-icon-box {
          width: 38px;
          height: 38px;
          background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue));
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 15px rgba(139, 92, 246, 0.3);
        }

        .logo-text {
          font-family: 'Poppins', sans-serif;
          font-size: 1.25rem;
          font-weight: 800;
          color: white;
          letter-spacing: -0.5px;
        }

        .nav-main-links {
          display: flex;
          gap: 1.5rem;
        }

        .nav-link-btn {
          color: rgba(255, 255, 255, 0.65);
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 600;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          padding: 0.6rem 1.4rem;
          border-radius: 14px;
          background: rgba(139, 92, 246, 0.05);
          border: 1px solid rgba(139, 92, 246, 0.15);
        }

        .nav-link-btn:hover {
          color: white;
          background: rgba(139, 92, 246, 0.15);
          border-color: rgba(168, 85, 247, 0.5);
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.3);
          transform: translateY(-2px) scale(1.05);
        }

        .navbar-center {
          flex: 2;
          display: flex;
          justify-content: center;
        }

        .navbar-right {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex: 1;
          justify-content: flex-end;
        }

        .nav-icon-btn {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .nav-icon-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border-color: var(--accent-purple);
        }

        .notification-dot {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 8px;
          height: 8px;
          background: var(--accent-pink);
          border-radius: 50%;
          border: 2px solid #050816;
          box-shadow: 0 0 10px var(--accent-pink);
        }

        .profile-trigger-wrap {
          position: relative;
        }

        .profile-trigger {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0.5rem 0.75rem;
          padding-right: 1rem;
          border-radius: 100px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: white;
        }

        .profile-trigger:hover, .profile-trigger.active {
          background: rgba(139, 92, 246, 0.1);
          border-color: var(--accent-purple);
          box-shadow: 0 0 20px rgba(139, 92, 246, 0.2);
        }

        .profile-avatar-container {
          position: relative;
          width: 38px;
          height: 38px;
        }

        .profile-avatar-img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--accent-purple);
          position: relative;
          z-index: 2;
        }

        .profile-avatar-placeholder {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue));
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          border: 2px solid var(--accent-purple);
          position: relative;
          z-index: 2;
        }

        .avatar-glow {
          position: absolute;
          top: -2px; left: -2px; right: -2px; bottom: -2px;
          background: var(--accent-purple);
          border-radius: 50%;
          filter: blur(8px);
          opacity: 0.4;
          z-index: 1;
        }

        .user-info-brief {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
        }

        .user-name-text {
          font-size: 0.9rem;
          font-weight: 700;
          white-space: nowrap;
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-badge-text {
          font-size: 0.65rem;
          color: var(--accent-cyan);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
        }

        .profile-dropdown {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          width: 240px;
          background: rgba(17, 24, 39, 0.85);
          backdrop-filter: blur(25px);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 20px;
          padding: 1rem;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(139, 92, 246, 0.1);
          animation: dropdownSlide 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        @keyframes dropdownSlide {
          from { opacity: 0; transform: translateY(10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .dropdown-header {
          padding: 0.5rem;
        }

        .dropdown-email {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.5);
          word-break: break-all;
        }

        .dropdown-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
          margin: 0.75rem 0;
        }

        .dropdown-menu {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .dropdown-menu li a {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border-radius: 12px;
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .dropdown-menu li a:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
          padding-left: 1rem;
        }

        .dropdown-logout {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border-radius: 12px;
          color: var(--danger);
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .dropdown-logout:hover {
          background: rgba(239, 68, 68, 0.1);
          padding-left: 1rem;
        }
      `}</style>
    </nav>
  );
}
