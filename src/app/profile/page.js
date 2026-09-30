'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import BoxParticles from '@/components/BoxParticles';
import { useUser } from '@/context/UserContext';
import { useLanguage } from '@/context/LanguageContext';
import { getMediaUrl } from '@/utils/media';
import { 
  Camera, Save, X, Edit3, ShieldCheck, Mail, Phone, MapPin, 
  Map, Navigation, Hash, Lock, Award, TrendingUp, CheckCircle, Clock, User
} from 'lucide-react';

export default function ProfilePage() {
  return (
    <Suspense fallback={<div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'white',fontSize:'1.2rem'}}>Loading Profile...</div>}>
      <ProfilePageContent />
    </Suspense>
  );
}

function ProfilePageContent() {
  const { user, updateUser, refreshUser } = useUser();
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const isInitialEdit = searchParams.get('edit') === 'true';

  const [isEditing, setIsEditing] = useState(isInitialEdit);
  const [formData, setFormData] = useState({
    full_name: '',
    mobile_no: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    password: '••••••••' // Placeholder for UI
  });
  const [stats, setStats] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        mobile_no: user.mobile_no || '',
        email: user.email || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || '',
        password: '••••••••'
      });
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user?.id && !user?.user_id) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/users/stats/${user.id || user.user_id}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Error fetching user stats:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/users/update/${user.id || user.user_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.full_name,
          mobile_no: formData.mobile_no,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        })
      });

      if (res.ok) {
        const data = await res.json();
        updateUser(data.user);
        setIsEditing(false);
        alert("Profile updated successfully!");
      } else {
        alert("Failed to update profile.");
      }
    } catch (err) {
      alert("Server error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    const body = new FormData();
    body.append('file', file);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/users/profile-image/${user.id || user.user_id}`, {
        method: 'POST',
        body: body
      });

      if (res.ok) {
        const data = await res.json();
        updateUser({ profile_image_url: data.profile_image_url });
      }
    } catch (err) {
      console.error("Error uploading image:", err);
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="dashboard-container" style={{ background: 'transparent' }}>
      <Sidebar />
      <main className="main-content">

        <div className="profile-page-content">
          <div className="profile-header-section animate-fade-in">
            <h1 className="profile-title">Citizen <span>Profile</span></h1>
            <p className="profile-subtitle">Manage your digital identity and track your civic impact</p>
          </div>

          <div className="profile-grid">
            {/* Main Information Card */}
            <div className="profile-main-card glass-panel animate-slide-up">
              <BoxParticles />
              <div className="profile-card-content-wrap" style={{ position: 'relative', zIndex: 1 }}>
                <div className="profile-card-header">
                <div className="profile-image-wrap">
                  <div className="profile-avatar-large">
                    {user?.profile_image_url ? (
                      <img
                        src={getMediaUrl(user.profile_image_url)}
                        alt="Profile"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="avatar-placeholder-large">{formData.full_name?.charAt(0) || 'C'}</div>
                    )}
                    <div className="avatar-glow-large"></div>
                    
                    <button 
                      className="edit-image-btn" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? <Clock size={16} className="animate-spin" /> : <Camera size={16} />}
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageUpload} 
                      accept="image/*" 
                      style={{display:'none'}} 
                    />
                  </div>

                  <div className="profile-title-area">
                    <h2>{user?.full_name || 'Citizen'}</h2>
                    <div className="badge-row">
                      <span className="badge citizen-badge">
                        <ShieldCheck size={14} /> Official Citizen
                      </span>
                      {stats?.community_level && (
                        <span className="badge level-badge">
                          <Award size={14} /> {stats.community_level}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {!isEditing ? (
                  <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
                    <Edit3 size={18} /> Edit Profile
                  </button>
                ) : (
                  <div className="action-buttons">
                    <button className="cancel-btn" onClick={() => setIsEditing(false)}>
                      <X size={18} /> Cancel
                    </button>
                    <button className="save-btn" onClick={handleSave} disabled={isSaving}>
                      <Save size={18} /> {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>

              <div className="profile-form-grid">
                <div className="form-column">
                  <div className={`input-container ${isEditing ? 'editable' : ''}`}>
                    <label><User size={14} /> Full Name</label>
                    <input 
                      name="full_name" 
                      value={formData.full_name} 
                      onChange={handleInputChange} 
                      disabled={!isEditing}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className={`input-container ${isEditing ? 'editable' : ''}`}>
                    <label><Phone size={14} /> Mobile Number</label>
                    <input 
                      name="mobile_no" 
                      value={formData.mobile_no} 
                      onChange={handleInputChange} 
                      disabled={!isEditing}
                      placeholder="Enter mobile number"
                    />
                  </div>
                  <div className={`input-container ${isEditing ? 'editable' : ''}`}>
                    <label><Mail size={14} /> Email Address</label>
                    <input 
                      name="email" 
                      value={formData.email} 
                      onChange={handleInputChange} 
                      disabled={!isEditing}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div className={`input-container`}>
                    <label><Lock size={14} /> Password</label>
                    <input 
                      name="password" 
                      value={formData.password} 
                      disabled={true} 
                      type="password"
                    />
                    <span className="input-hint">Password encryption active</span>
                  </div>
                </div>

                <div className="form-column">
                  <div className={`input-container ${isEditing ? 'editable' : ''}`}>
                    <label><MapPin size={14} /> User Address</label>
                    <input 
                      name="address" 
                      value={formData.address} 
                      onChange={handleInputChange} 
                      disabled={!isEditing}
                      placeholder="Enter full address"
                    />
                  </div>
                  <div className="form-row-2">
                    <div className={`input-container ${isEditing ? 'editable' : ''}`}>
                      <label><Map size={14} /> City</label>
                      <input 
                        name="city" 
                        value={formData.city} 
                        onChange={handleInputChange} 
                        disabled={!isEditing}
                      />
                    </div>
                    <div className={`input-container ${isEditing ? 'editable' : ''}`}>
                      <label><Navigation size={14} /> State</label>
                      <input 
                        name="state" 
                        value={formData.state} 
                        onChange={handleInputChange} 
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  <div className={`input-container ${isEditing ? 'editable' : ''}`}>
                    <label><Hash size={14} /> Pincode</label>
                    <input 
                      name="pincode" 
                      value={formData.pincode} 
                      onChange={handleInputChange} 
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>
              </div>
            </div>

            {/* Sidebar Widgets */}
            <div className="profile-sidebar-column">
              {/* Stats Card */}
              <div className="stats-widget glass-panel animate-slide-up delay-1">
                <BoxParticles />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <h3 className="widget-title"><TrendingUp size={18} /> Activity Stats</h3>
                <div className="stats-mini-grid">
                  <div className="stat-item">
                    <div className="stat-val">{stats?.complaints_submitted || 0}</div>
                    <div className="stat-lab">Complaints</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-val">{stats?.resolved_complaints || 0}</div>
                    <div className="stat-lab">Resolved</div>
                  </div>
                  <div className="stat-item highlight">
                    <div className="stat-val">{stats?.contribution_score || 0}</div>
                    <div className="stat-lab">Score</div>
                  </div>
                </div>
                
                <div className="progress-section">
                  <div className="progress-header">
                    <span>Community Participation</span>
                    <span>{stats?.participation_percent || 0}%</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${stats?.participation_percent || 0}%` }}></div>
                  </div>
                </div>
                </div>
              </div>

              {/* Achievements Card */}
              <div className="achievements-widget glass-panel animate-slide-up delay-2">
                <BoxParticles />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <h3 className="widget-title"><Award size={18} /> Achievement Badges</h3>
                <div className="badges-grid">
                  {stats?.badges?.map(badge => (
                    <div key={badge.id} className={`badge-item ${badge.earned ? 'earned' : 'locked'}`}>
                      <div className="badge-icon">{badge.icon}</div>
                      <div className="badge-name">{badge.name}</div>
                    </div>
                  ))}
                </div>
              </div>
              </div>

              {/* Support Card */}
              <div className="support-widget glass-panel animate-slide-up delay-3">
                <BoxParticles />
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                  <div className="support-icon"><CheckCircle size={32} /></div>
                <h4>Verification Status</h4>
                <p>Your profile is AI-verified for high-priority routing.</p>
                <div className="verification-pill">Verified Identity</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .profile-page-content {
          padding: 1rem 3.5rem 3.5rem;
        }

        .profile-header-section {
          margin-bottom: 3rem;
        }

        .profile-title {
          font-size: 3rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
        }

        .profile-title span {
          background: linear-gradient(to right, var(--accent-neon-purple), var(--accent-blue));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 10px rgba(168, 85, 247, 0.3));
        }

        .profile-subtitle {
          color: rgba(255, 255, 255, 0.6);
          font-size: 1.1rem;
        }

        .profile-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 2rem;
        }

        .glass-panel {
          position: relative;
          overflow: hidden;
          background: rgba(17, 24, 39, 0.55);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 32px;
          box-shadow: 0 0 25px rgba(168, 85, 247, 0.1);
          transition: all 0.3s ease;
        }

        .profile-main-card {
          padding: 3rem;
        }

        .profile-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 3.5rem;
        }

        .profile-image-wrap {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .profile-avatar-large {
          position: relative;
          width: 120px;
          height: 120px;
        }

        .profile-avatar-large img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid var(--accent-neon-purple);
          position: relative;
          z-index: 2;
        }

        .avatar-placeholder-large {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-neon-purple), var(--accent-blue));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          font-weight: 800;
          color: white;
          border: 3px solid var(--accent-neon-purple);
          position: relative;
          z-index: 2;
        }

        .avatar-glow-large {
          position: absolute;
          top: -5px; left: -5px; right: -5px; bottom: -5px;
          background: var(--accent-neon-purple);
          border-radius: 50%;
          filter: blur(15px);
          opacity: 0.3;
          z-index: 1;
          animation: ambientPulse 3s infinite alternate;
        }

        @keyframes ambientPulse {
          from { opacity: 0.2; transform: scale(1); }
          to { opacity: 0.5; transform: scale(1.05); }
        }

        .edit-image-btn {
          position: absolute;
          bottom: 5px;
          right: 5px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--accent-neon-purple);
          border: 3px solid #050816;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 3;
          transition: all 0.2s ease;
        }

        .edit-image-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 0 15px var(--accent-neon-purple);
        }

        .profile-title-area h2 {
          font-size: 2rem;
          margin-bottom: 0.75rem;
        }

        .badge-row {
          display: flex;
          gap: 0.75rem;
        }

        .badge {
          padding: 0.4rem 0.9rem;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .citizen-badge {
          background: rgba(6, 182, 212, 0.1);
          color: var(--accent-cyan);
          border: 1px solid rgba(6, 182, 212, 0.3);
        }

        .level-badge {
          background: rgba(168, 85, 247, 0.1);
          color: var(--accent-neon-purple);
          border: 1px solid rgba(168, 85, 247, 0.3);
        }

        .edit-profile-btn {
          padding: 0.9rem 1.8rem;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          transition: all 0.3s ease;
        }

        .edit-profile-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--accent-neon-purple);
          transform: translateY(-2px);
        }

        .action-buttons {
          display: flex;
          gap: 0.75rem;
        }

        .save-btn {
          padding: 0.9rem 1.8rem;
          border-radius: 20px;
          background: linear-gradient(135deg, var(--accent-neon-purple), var(--accent-blue));
          border: none;
          color: white;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          box-shadow: 0 10px 25px rgba(168, 85, 247, 0.3);
          transition: all 0.3s ease;
        }

        .save-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 35px rgba(168, 85, 247, 0.5);
        }

        .cancel-btn {
          padding: 0.9rem 1.8rem;
          border-radius: 20px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          transition: all 0.3s ease;
        }

        .profile-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
        }

        .form-column {
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }

        .input-container {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          transition: all 0.3s ease;
        }

        .input-container label {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.4);
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .input-container input {
          width: 100%;
          background: rgba(11, 16, 35, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 1.1rem 1.4rem;
          border-radius: 18px;
          color: white;
          font-size: 1rem;
          transition: all 0.3s ease;
          outline: none;
        }

        .input-container.editable input {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);
        }

        .input-container.editable input:focus {
          border-color: var(--accent-neon-purple);
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.15);
        }

        .input-hint {
          font-size: 0.7rem;
          color: var(--accent-cyan);
          opacity: 0.6;
          font-style: italic;
        }

        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }

        /* Widgets Styles */
        .profile-sidebar-column {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .widget-title {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: white;
        }

        .stats-widget, .achievements-widget, .support-widget {
          padding: 2rem;
        }

        .stats-mini-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-item {
          text-align: center;
          padding: 1rem 0.5rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .stat-item.highlight {
          background: rgba(168, 85, 247, 0.1);
          border-color: rgba(168, 85, 247, 0.2);
        }

        .stat-val {
          font-size: 1.5rem;
          font-weight: 800;
          margin-bottom: 0.25rem;
        }

        .stat-lab {
          font-size: 0.65rem;
          color: rgba(255, 255, 255, 0.4);
          font-weight: 700;
          text-transform: uppercase;
        }

        .progress-section {
          margin-top: 1.5rem;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 0.75rem;
        }

        .progress-bar-bg {
          height: 8px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(to right, var(--accent-neon-purple), var(--accent-blue));
          border-radius: 10px;
          box-shadow: 0 0 10px var(--accent-neon-purple);
          transition: width 1s ease-out;
        }

        .badges-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .badge-item {
          padding: 1rem;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
        }

        .badge-item.earned {
          background: rgba(139, 92, 246, 0.08);
          border-color: rgba(139, 92, 246, 0.2);
        }

        .badge-item.locked {
          opacity: 0.4;
          filter: grayscale(1);
        }

        .badge-icon {
          font-size: 1.5rem;
        }

        .badge-name {
          font-size: 0.7rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.7);
          text-align: center;
        }

        .support-widget {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(59, 130, 246, 0.1));
          border-color: rgba(6, 182, 212, 0.2);
        }

        .support-icon {
          color: var(--accent-cyan);
          filter: drop-shadow(0 0 10px rgba(6, 182, 212, 0.4));
        }

        .support-widget h4 {
          font-size: 1.2rem;
          font-weight: 700;
        }

        .support-widget p {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.5;
        }

        .verification-pill {
          padding: 0.5rem 1.25rem;
          background: var(--accent-cyan);
          color: #050816;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
        }

        /* Animations */
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }

        .animate-slide-up {
          opacity: 0;
          animation: slideUp 0.8s ease-out forwards;
        }

        .delay-1 { animation-delay: 0.2s; }
        .delay-2 { animation-delay: 0.4s; }
        .delay-3 { animation-delay: 0.6s; }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-spin {
          animation: spin 2s linear infinite;
        }
      `}</style>
    </div>
  );
}
