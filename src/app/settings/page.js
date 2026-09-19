'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useLanguage } from '@/context/LanguageContext';
import { useUser } from '@/context/UserContext';
import { 
  User, 
  Lock, 
  Palette, 
  Bell, 
  MapPin, 
  Globe, 
  ShieldCheck, 
  Database,
  Camera,
  Save,
  Trash2,
  Download,
  Eye,
  EyeOff,
  ChevronRight,
  Monitor,
  Moon,
  Sun,
  Layout,
  Smartphone,
  History,
  Shield
} from 'lucide-react';
import './settings.css';

export default function SettingsPage() {
  const { t } = useLanguage();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Settings State
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Citizen Alpha',
    email: user?.email || 'citizen@connect.gov',
    phone: '+91 98765 43210',
    bio: 'Dedicated to community improvement and civic engagement.'
  });

  const [notifications, setNotifications] = useState({
    complaintUpdates: true,
    aiAlerts: true,
    ngoNotifications: true,
    animalRescue: true,
    govSchemes: false,
    email: true,
    push: true
  });

  const [appearance, setAppearance] = useState({
    darkMode: true,
    themeAccent: 'purple',
    animations: true,
    glassIntensity: 60
  });

  const tabs = [
    { id: 'profile', name: 'Profile', icon: <User size={18} /> },
    { id: 'account', name: 'Account', icon: <Lock size={18} /> },
    { id: 'appearance', name: 'Appearance', icon: <Palette size={18} /> },
    { id: 'notifications', name: 'Notifications', icon: <Bell size={18} /> },
    { id: 'location', name: 'Location', icon: <MapPin size={18} /> },
    { id: 'language', name: 'Language', icon: <Globe size={18} /> },
    { id: 'security', name: 'Security', icon: <ShieldCheck size={18} /> },
    { id: 'privacy', name: 'Data & Privacy', icon: <Database size={18} /> },
  ];

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert('Settings saved successfully!');
    }, 1500);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="settings-section animate-fade-in">
            <h2 className="section-title"><User size={22} color="var(--accent-purple)" /> Profile Settings</h2>
            
            <div className="profile-upload-area">
              <div className="profile-avatar-large">
                <img src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Citizen"} alt="Avatar" />
                <button className="avatar-edit-btn"><Camera size={16} /></button>
              </div>
              <div className="upload-info">
                <h4>Profile Picture</h4>
                <p>JPG, GIF or PNG. Max size of 2MB.</p>
                <div className="upload-actions">
                  <button className="upload-btn">Upload New</button>
                  <button className="remove-btn">Remove</button>
                </div>
              </div>
            </div>

            <div className="settings-grid">
              <div className="settings-field">
                <label>Full Name</label>
                <input type="text" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} />
              </div>
              <div className="settings-field">
                <label>Email Address</label>
                <input type="email" value={profileData.email} onChange={(e) => setProfileData({...profileData, email: e.target.value})} />
              </div>
              <div className="settings-field">
                <label>Phone Number</label>
                <input type="text" value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} />
              </div>
              <div className="settings-field full-width">
                <label>Bio / Status</label>
                <textarea value={profileData.bio} onChange={(e) => setProfileData({...profileData, bio: e.target.value})} />
              </div>
            </div>
          </div>
        );

      case 'account':
        return (
          <div className="settings-section animate-fade-in">
            <h2 className="section-title"><Lock size={22} color="var(--accent-purple)" /> Account Settings</h2>
            
            <div className="settings-grid">
              <div className="settings-field">
                <label>Current Password</label>
                <div className="password-input-wrap">
                  <input type={showPassword ? "text" : "password"} placeholder="••••••••" />
                  <button onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
              </div>
              <div className="settings-field">
                <label>New Password</label>
                <input type="password" placeholder="New Password" />
              </div>
              <div className="settings-field">
                <label>Confirm New Password</label>
                <input type="password" placeholder="Confirm New Password" />
              </div>
            </div>

            <div className="settings-card mt-2">
              <h4>Account Privacy</h4>
              <p>Control who can see your civic activity and contributions.</p>
              <div className="privacy-option">
                <div>
                  <strong>Public Profile</strong>
                  <p>Allow anyone to see your reports and badges</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="settings-section animate-fade-in">
            <h2 className="section-title"><Palette size={22} color="var(--accent-purple)" /> Appearance Settings</h2>
            
            <div className="appearance-grid">
              <div className="appearance-card">
                <div className="mode-selection">
                  <div className={`mode-item ${appearance.darkMode ? 'active' : ''}`} onClick={() => setAppearance({...appearance, darkMode: true})}>
                    <Moon size={24} />
                    <span>Dark Mode</span>
                  </div>
                  <div className={`mode-item ${!appearance.darkMode ? 'active' : ''}`} onClick={() => setAppearance({...appearance, darkMode: false})}>
                    <Sun size={24} />
                    <span>Light Mode</span>
                  </div>
                </div>
              </div>

              <div className="appearance-card">
                <label>Theme Accent</label>
                <div className="accent-colors">
                  {['purple', 'blue', 'cyan', 'pink', 'green'].map(color => (
                    <div 
                      key={color} 
                      className={`accent-dot ${color} ${appearance.themeAccent === color ? 'active' : ''}`}
                      onClick={() => setAppearance({...appearance, themeAccent: color})}
                    />
                  ))}
                </div>
              </div>

              <div className="appearance-card full-width">
                <div className="setting-row">
                  <div>
                    <strong>UI Animations</strong>
                    <p>Enable smooth transitions and motion effects</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={appearance.animations} onChange={(e) => setAppearance({...appearance, animations: e.target.checked})} />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="setting-row mt-2">
                  <div style={{ flex: 1 }}>
                    <strong>Glassmorphism Intensity</strong>
                    <p>Adjust the transparency and blur of platform cards</p>
                    <input 
                      type="range" 
                      min="0" max="100" 
                      value={appearance.glassIntensity} 
                      onChange={(e) => setAppearance({...appearance, glassIntensity: e.target.value})}
                      className="settings-range"
                    />
                  </div>
                  <span className="range-val">{appearance.glassIntensity}%</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="settings-section animate-fade-in">
            <h2 className="section-title"><Bell size={22} color="var(--accent-purple)" /> Notification Settings</h2>
            <div className="settings-card">
              <div className="notification-list">
                {[
                  { id: 'complaintUpdates', label: 'Complaint Status Updates', desc: 'Get notified when your grievance moves to a new stage' },
                  { id: 'aiAlerts', label: 'AI Forensic Alerts', desc: 'Alerts when our AI detects critical civic issues' },
                  { id: 'ngoNotifications', label: 'NGO Response Alerts', desc: 'Notifications from dispatched rescue teams' },
                  { id: 'animalRescue', label: 'Animal Welfare Updates', desc: 'Track rescues and health recoveries' },
                  { id: 'govSchemes', label: 'Government Scheme News', desc: 'Updates on new civic benefits and grants' },
                ].map(item => (
                  <div key={item.id} className="notification-item">
                    <div className="notif-text">
                      <strong>{item.label}</strong>
                      <p>{item.desc}</p>
                    </div>
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={notifications[item.id]} 
                        onChange={(e) => setNotifications({...notifications, [item.id]: e.target.checked})} 
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="settings-card mt-2">
              <h4>Delivery Channels</h4>
              <div className="delivery-grid">
                <div className="delivery-item">
                  <Smartphone size={18} />
                  <span>Push Notifications</span>
                  <label className="toggle-switch mini">
                    <input type="checkbox" checked={notifications.push} onChange={(e) => setNotifications({...notifications, push: e.target.checked})} />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="delivery-item">
                  <Globe size={18} />
                  <span>Email Digest</span>
                  <label className="toggle-switch mini">
                    <input type="checkbox" checked={notifications.email} onChange={(e) => setNotifications({...notifications, email: e.target.checked})} />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'location':
        return (
          <div className="settings-section animate-fade-in">
            <h2 className="section-title"><MapPin size={22} color="var(--accent-purple)" /> Location Settings</h2>
            <div className="settings-card">
              <div className="setting-row">
                <div>
                  <strong>Auto-Detect Location</strong>
                  <p>Use your browser's GPS for precise grievance reporting</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="location-list mt-2">
                <label>Default Reporting Address</label>
                <div className="saved-location">
                  <MapPin size={16} />
                  <div className="loc-info">
                    <strong>Home</strong>
                    <span>123, Civic Square, New Delhi - 110001</span>
                  </div>
                  <button className="edit-btn">Edit</button>
                </div>
                <button className="add-location-btn">+ Add New Address</button>
              </div>
            </div>
          </div>
        );

      case 'language':
        return (
          <div className="settings-section animate-fade-in">
            <h2 className="section-title"><Globe size={22} color="var(--accent-purple)" /> Language Settings</h2>
            <div className="language-grid">
              {[
                { id: 'en', name: 'English', native: 'English' },
                { id: 'hi', name: 'Hindi', native: 'हिंदी' },
                { id: 'ur', name: 'Urdu', native: 'اردو' },
                { id: 'hinglish', name: 'Hinglish', native: 'Hinglish' }
              ].map(lang => (
                <div key={lang.id} className="lang-card active">
                  <div className="lang-check">
                    <div className="check-circle"></div>
                  </div>
                  <div className="lang-info">
                    <strong>{lang.name}</strong>
                    <span>{lang.native}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="settings-section animate-fade-in">
            <h2 className="section-title"><ShieldCheck size={22} color="var(--accent-purple)" /> Security Settings</h2>
            <div className="settings-card">
              <h4>Active Sessions</h4>
              <p>Devices currently logged into your CitizenConnect account.</p>
              <div className="session-list">
                <div className="session-item">
                  <div className="session-icon"><Monitor size={20} /></div>
                  <div className="session-info">
                    <strong>Windows 11 - Chrome</strong>
                    <span>New Delhi, India • Active Now</span>
                  </div>
                  <span className="current-badge">Current</span>
                </div>
                <div className="session-item">
                  <div className="session-icon"><Smartphone size={20} /></div>
                  <div className="session-info">
                    <strong>iPhone 15 Pro - Safari</strong>
                    <span>Mumbai, India • 2 hours ago</span>
                  </div>
                  <button className="logout-session-btn">Revoke</button>
                </div>
              </div>
              <button className="logout-all-btn">Logout From All Devices</button>
            </div>

            <div className="settings-card mt-2">
              <div className="setting-row">
                <div className="flex-row gap-1">
                  <History size={18} color="var(--accent-purple)" />
                  <div>
                    <strong>Login History</strong>
                    <p>View all recent login attempts and IP addresses</p>
                  </div>
                </div>
                <button className="ghost-btn">View Log</button>
              </div>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="settings-section animate-fade-in">
            <h2 className="section-title"><Shield size={22} color="var(--accent-purple)" /> Data & Privacy</h2>
            <div className="privacy-grid">
              <div className="settings-card">
                <div className="flex-row gap-1">
                  <Download size={20} color="var(--accent-blue)" />
                  <div>
                    <strong>Download My Data</strong>
                    <p>Export all your reports, contributions, and profile data in JSON format.</p>
                  </div>
                </div>
                <button className="action-btn-sm mt-1">Export Data</button>
              </div>

              <div className="settings-card">
                <div className="flex-row gap-1">
                  <Trash2 size={20} color="var(--warning)" />
                  <div>
                    <strong>Clear Local Cache</strong>
                    <p>Reset application state and temporary assets stored in your browser.</p>
                  </div>
                </div>
                <button className="action-btn-sm warning mt-1">Clear Cache</button>
              </div>

              <div className="settings-card danger">
                <div className="flex-row gap-1">
                  <Shield size={20} color="var(--danger)" />
                  <div>
                    <strong>Delete Account</strong>
                    <p>Permanently remove your account and all associated civic data. This action is irreversible.</p>
                  </div>
                </div>
                <button className="action-btn-sm danger mt-1">Delete Account</button>
              </div>
            </div>

            <div className="legal-links mt-3">
              <a href="#">Privacy Policy</a>
              <span className="divider">•</span>
              <a href="#">Terms & Conditions</a>
              <span className="divider">•</span>
              <a href="#">Cookie Policy</a>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content settings-main">
        <div className="settings-header animate-slide-down">
          <h1>Platform <span>Settings</span></h1>
          <p>Customize your experience, manage security, and control your civic footprint.</p>
        </div>

        <div className="settings-layout">
          {/* Internal Sidebar */}
          <div className="settings-sidebar animate-slide-right">
            {tabs.map(tab => (
              <button 
                key={tab.id} 
                className={`settings-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.name}</span>
                {activeTab === tab.id && <ChevronRight size={16} className="active-arrow" />}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="settings-content-wrapper">
            <div className="settings-glass-container">
              {renderTabContent()}
              
              <div className="settings-footer">
                <button 
                  className={`save-settings-btn ${isSaving ? 'saving' : ''}`} 
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <div className="loader-dots"><span></span><span></span><span></span></div>
                  ) : (
                    <><Save size={18} /> Save All Changes</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
