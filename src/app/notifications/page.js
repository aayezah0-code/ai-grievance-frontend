'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { Bell, CheckCircle, Clock, Info, ExternalLink, Zap, MapPin, AlertTriangle, Sparkles, Flame, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
  "Uttarakhand", "West Bengal", "Delhi", "Puducherry"
];

export default function Notifications() {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchNotifications();
  }, [selectedState]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/notifications`;
      if (selectedState) url += `?state=${encodeURIComponent(selectedState)}`;
      
      const res = await fetch(url);
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/notifications/${id}/read`, { method: 'POST' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotifClick = (notif) => {
    markAsRead(notif.id);
    if (notif.linked_scheme_id) {
      router.push(`/schemes?openSchemeId=${notif.linked_scheme_id}`);
    } else if (notif.link) {
      router.push(notif.link);
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'Urgent': return <Flame size={14} className="urgent-icon" />;
      case 'High': return <AlertTriangle size={14} className="high-icon" />;
      default: return <Sparkles size={14} className="normal-icon" />;
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-content">
        <header className="dashboard-header">
          <div className="header-top">
            <div>
              <h1 className="dashboard-title">{t('notifications.title')}</h1>
              <p className="dashboard-subtitle">{t('notifications.subtitle')}</p>
            </div>
            
            <div className="state-filter glass-panel">
              <MapPin size={18} className="map-icon" />
              <select 
                value={selectedState} 
                onChange={(e) => setSelectedState(e.target.value)}
                className="state-select"
              >
                <option value="">{t('notifications.allStates')}</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="filter-chips">
            <span className="filter-chip active">All Alerts</span>
            <span className="filter-chip">Ending Soon</span>
            <span className="filter-chip">Recently Added</span>
            <span className="filter-chip">Trending</span>
          </div>
        </header>

        <div className="notifications-container">
          {loading ? (
            <div className="loading-state">
              <div className="shimmer-card"></div>
              <div className="shimmer-card"></div>
              <div className="shimmer-card"></div>
            </div>
          ) : notifications.length > 0 ? (
            <div className="notif-list animate-slide-up">
              {notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`notif-card glass-panel ${notif.is_read ? 'read' : 'unread'} priority-${notif.priority.toLowerCase()}`}
                  onClick={() => handleNotifClick(notif)}
                >
                  <div className="notif-accent" />
                  
                  <div className="notif-main">
                    <div className="notif-icon-wrap">
                      {notif.category === 'Scheme' ? <Zap size={20} /> : <Bell size={20} />}
                    </div>
                    
                    <div className="notif-body">
                      <div className="notif-header">
                        <div className="notif-meta">
                          {notif.priority !== 'Normal' && (
                            <span className={`priority-badge ${notif.priority.toLowerCase()}`}>
                              {getPriorityIcon(notif.priority)}
                              {t(`notifications.priority.${notif.priority}`)}
                            </span>
                          )}
                          {notif.state && <span className="state-badge"><MapPin size={12}/> {notif.state}</span>}
                          <span className="cat-badge">{t(`notifications.category.${notif.category}`)}</span>
                        </div>
                        <span className="notif-time">
                          <Clock size={12} /> 
                          {new Date(notif.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <h4 className="notif-title">{notif.title}</h4>
                      <p className="notif-text">{notif.content}</p>
                      
                      {notif.linked_scheme_id && (
                        <div className="action-hint">
                          {t('notifications.viewScheme')} <ChevronRight size={14} />
                        </div>
                      )}
                    </div>
                  </div>
                  {!notif.is_read && <div className="unread-dot" />}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state glass-panel animate-fade-in">
              <Bell size={48} color="rgba(255,255,255,0.1)" />
              <h3>{t('notifications.noNotifications')}</h3>
              <p>{t('notifications.noNotificationsHint')}</p>
              <button className="reset-btn" onClick={() => setSelectedState('')}>{t('notifications.allStates')}</button>
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        .dashboard-layout { display: flex; min-height: 100vh; background: #030014; color: white; font-family: 'Inter', sans-serif; }
        .dashboard-content { flex: 1; padding: 3rem 4rem; overflow-y: auto; margin-left: 260px; }
        @media (max-width: 1024px) { .dashboard-content { margin-left: 0; padding: 2rem; } }

        .dashboard-header { margin-bottom: 3rem; }
        .header-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; gap: 2rem; }
        .dashboard-title { font-size: 3rem; font-weight: 900; background: linear-gradient(135deg, #fff, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: -0.02em; }
        .dashboard-subtitle { color: rgba(255,255,255,0.5); margin-top: 0.5rem; font-size: 1.1rem; }

        .state-filter { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 1.25rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); }
        .map-icon { color: #3b82f6; }
        .state-select { background: transparent; border: none; color: white; font-weight: 700; outline: none; cursor: pointer; padding: 0.5rem 0; }
        .state-select option { background: #030014; }

        .filter-chips { display: flex; gap: 1rem; }
        .filter-chip { padding: 0.6rem 1.2rem; border-radius: 99px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); font-size: 0.85rem; font-weight: 600; color: rgba(255,255,255,0.5); cursor: pointer; transition: all 0.2s; }
        .filter-chip.active { background: #3b82f6; color: white; border-color: transparent; box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
        .filter-chip:hover:not(.active) { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.1); }

        .notifications-container { max-width: 900px; }
        .notif-list { display: flex; flex-direction: column; gap: 1.25rem; }
        
        .notif-card { 
          display: flex; flex-direction: column; padding: 0; border-radius: 24px; 
          cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative;
          border: 1px solid rgba(255,255,255,0.06); overflow: hidden;
        }
        .notif-card:hover { transform: translateX(10px) scale(1.01); background: rgba(255,255,255,0.06); border-color: rgba(59,130,246,0.3); box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
        .notif-card.unread { background: rgba(59,130,246,0.03); border-color: rgba(59,130,246,0.15); }
        .notif-card.read { opacity: 0.7; }

        .notif-accent { height: 4px; width: 100%; background: linear-gradient(90deg, #3b82f6, transparent); opacity: 0; transition: opacity 0.3s; }
        .notif-card:hover .notif-accent { opacity: 1; }
        .priority-urgent .notif-accent { background: linear-gradient(90deg, #ef4444, transparent); opacity: 1; }
        .priority-high .notif-accent { background: linear-gradient(90deg, #f59e0b, transparent); opacity: 1; }

        .notif-main { display: flex; gap: 1.5rem; padding: 1.75rem; }
        .notif-icon-wrap { 
          width: 56px; height: 56px; background: rgba(255,255,255,0.05); 
          border-radius: 18px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          color: #3b82f6; border: 1px solid rgba(255,255,255,0.08);
        }
        .priority-urgent .notif-icon-wrap { color: #ef4444; border-color: rgba(239, 68, 68, 0.2); }

        .notif-body { flex: 1; }
        .notif-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
        .notif-meta { display: flex; align-items: center; gap: 0.75rem; }
        
        .priority-badge { display: flex; align-items: center; gap: 0.3rem; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; padding: 0.3rem 0.75rem; border-radius: 8px; }
        .priority-badge.urgent { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }
        .priority-badge.high { background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.2); }
        
        .state-badge { font-size: 0.75rem; font-weight: 700; color: #3b82f6; display: flex; align-items: center; gap: 0.3rem; }
        .cat-badge { font-size: 0.75rem; font-weight: 700; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.05em; }

        .notif-title { margin: 0 0 0.5rem; font-size: 1.25rem; font-weight: 800; color: white; }
        .notif-text { margin: 0 0 1.25rem; color: rgba(255,255,255,0.6); line-height: 1.6; font-size: 1rem; }
        
        .action-hint { display: flex; align-items: center; gap: 0.4rem; color: #3b82f6; font-weight: 700; font-size: 0.85rem; }
        .notif-time { font-size: 0.75rem; color: rgba(255,255,255,0.3); display: flex; align-items: center; gap: 0.4rem; font-weight: 600; }

        .unread-dot { position: absolute; top: 1.75rem; right: 1.75rem; width: 12px; height: 12px; background: #3b82f6; border-radius: 50%; box-shadow: 0 0 15px #3b82f6; }
        .priority-urgent .unread-dot { background: #ef4444; box-shadow: 0 0 15px #ef4444; }

        .empty-state { text-align: center; padding: 6rem 2rem; border-radius: 32px; display: flex; flex-direction: column; align-items: center; gap: 1.5rem; }
        .empty-state h3 { font-size: 1.75rem; font-weight: 800; margin: 0; }
        .empty-state p { color: rgba(255,255,255,0.4); font-size: 1.1rem; margin: 0; }
        .reset-btn { background: #3b82f6; border: none; padding: 0.8rem 2rem; border-radius: 99px; color: white; font-weight: 700; cursor: pointer; transition: 0.3s; }

        .shimmer-card { height: 140px; background: rgba(255,255,255,0.03); border-radius: 24px; margin-bottom: 1.25rem; position: relative; overflow: hidden; }
        .shimmer-card::after { content: ""; position: absolute; inset: 0; transform: translateX(-100%); background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent); animation: shimmer 2s infinite; }
        @keyframes shimmer { 100% { transform: translateX(100%); } }

        .glass-panel { background: rgba(255,255,255,0.03); backdrop-filter: blur(20px); }
        .animate-slide-up { animation: slideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1); }
        .animate-fade-in { animation: fadeIn 0.6s ease-out; }
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
