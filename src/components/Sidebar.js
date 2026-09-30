'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Heart, 
  HandHelping, 
  ScrollText, 
  Gift, 
  Bell, 
  User, 
  Settings, 
  HelpCircle, 
  LogOut,
  Globe,
  Shield
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { language, changeLanguage, t } = useLanguage();
  const { logout, user } = useUser();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/notifications`);
      const data = await res.json();
      setUnreadCount(data.filter(n => !n.is_read).length);
    } catch (err) {}
  };
  const menuItems = [
    { name: t('sidebar.dashboard'), icon: <LayoutDashboard size={20} />, path: '/dashboard', color: 'soft-purple' },
    { name: t('sidebar.myComplaints'), icon: <ClipboardList size={20} />, path: '/my-complaints', color: 'deep-purple' },
    { name: t('sidebar.animalWelfare'), icon: <Heart size={20} />, path: '/animal-welfare', color: 'green' },
    { name: t('sidebar.socialHelp'), icon: <HandHelping size={20} />, path: '/social-help', color: 'dark-pink' },
    { name: t('sidebar.govSchemes'), icon: <ScrollText size={20} />, path: '/schemes', color: 'blue' },
    { name: t('sidebar.donations'), icon: <Gift size={20} />, path: '/donations', color: 'dark-blue' },
    { 
      name: t('sidebar.notifications'), 
      color: 'red',
      icon: (
        <div style={{ position: 'relative' }}>
          <Bell size={20} />
          {unreadCount > 0 && (
            <div style={{ 
              position: 'absolute', top: -5, right: -5, background: '#ef4444', 
              color: 'white', fontSize: '10px', width: 15, height: 15, 
              borderRadius: '50%', display: 'flex', alignItems: 'center', 
              justifyContent: 'center', fontWeight: 'bold', border: '1px solid #070314' 
            }}>
              {unreadCount}
            </div>
          )}
        </div>
      ), 
      path: '/notifications' 
    },
    { name: t('sidebar.profile'), icon: <User size={20} />, path: '/profile', color: 'light-blue' },
    { name: t('sidebar.settings'), icon: <Settings size={20} />, path: '/settings', color: 'light-blue' },
    { name: t('sidebar.support'), icon: <HelpCircle size={20} />, path: '/support', color: 'light-blue' },
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div style={{
          width: 32, height: 32, background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
          borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <rect x="3" y="3" width="7" height="7" rx="1"></rect>
            <rect x="14" y="3" width="7" height="7" rx="1"></rect>
            <rect x="14" y="14" width="7" height="7" rx="1"></rect>
            <rect x="3" y="14" width="7" height="7" rx="1"></rect>
          </svg>
        </div>
        CitizenConnect
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link 
            key={item.path} 
            href={item.path}
            className={`nav-item ${item.color} ${pathname === item.path ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div className="language-selector" style={{ position: 'relative', display: 'flex', alignItems: 'center', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '0.5rem' }}>
          <Globe size={18} style={{ color: 'var(--text-secondary)', marginLeft: '0.5rem' }} />
          <select 
            value={language} 
            onChange={(e) => changeLanguage(e.target.value)}
            style={{ 
              background: 'transparent', border: 'none', color: 'white', width: '100%', 
              padding: '0.5rem', outline: 'none', cursor: 'pointer', appearance: 'none', fontSize: '0.9rem'
            }}
          >
            <option value="en" style={{background: '#0f172a'}}>English</option>
            <option value="hi" style={{background: '#0f172a'}}>हिंदी (Hindi)</option>
            <option value="mr" style={{background: '#0f172a'}}>मराठी (Marathi)</option>
            <option value="gu" style={{background: '#0f172a'}}>ગુજરાતી (Gujarati)</option>
            <option value="ta" style={{background: '#0f172a'}}>தமிழ் (Tamil)</option>
            <option value="ml" style={{background: '#0f172a'}}>മലയാളം (Malayalam)</option>
            <option value="ur" style={{background: '#0f172a'}}>اردو (Urdu)</option>
          </select>
          <div style={{ position: 'absolute', right: '12px', pointerEvents: 'none', color: 'var(--text-secondary)' }}>▼</div>
        </div>

        <button onClick={handleLogout} className="nav-item" style={{ border: 'none', background: 'none', cursor: 'pointer', width: '100%' }}>
          <LogOut size={20} />
          <span>{t('sidebar.logout')}</span>
        </button>
      </div>
    </div>
  );
}
