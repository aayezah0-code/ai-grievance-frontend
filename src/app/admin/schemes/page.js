'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { Plus, Trash2, Edit3, Save, X, Layers, Globe, MapPin } from 'lucide-react';

export default function AdminSchemes() {
  const [schemes, setSchemes] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', description: '', category: '', type: 'Central', state: '',
    eligibility_summary: '', launch_year: '', website_url: '', application_steps: ''
  });

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/schemes`);
    const data = await res.json();
    setSchemes(data);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/schemes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowAddForm(false);
        setFormData({ name: '', description: '', category: '', type: 'Central', state: '', eligibility_summary: '', launch_year: '', website_url: '', application_steps: '' });
        fetchSchemes();
        alert("Scheme added and notification published!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteScheme = async (id) => {
    if (confirm("Are you sure you want to delete this scheme?")) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/schemes/${id}`, { method: 'DELETE' });
      fetchSchemes();
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-content">
        <header className="dashboard-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h1 className="dashboard-title">Scheme Management</h1>
            <p className="dashboard-subtitle">Admin portal to manage government schemes</p>
          </div>
          <button className="add-btn" onClick={() => setShowAddForm(true)}>
            <Plus size={20} /> Add New Scheme
          </button>
        </header>

        {showAddForm && (
          <div className="modal-overlay">
            <div className="admin-modal glass-panel animate-modal-up">
              <header className="modal-header">
                <h2>Add New Government Scheme</h2>
                <button className="close-x" onClick={() => setShowAddForm(false)}><X /></button>
              </header>
              <form onSubmit={handleSubmit} className="admin-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Scheme Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="e.g. PM Internship Scheme" />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <input type="text" name="category" value={formData.category} onChange={handleInputChange} required placeholder="e.g. Education" />
                  </div>
                  <div className="form-group">
                    <label>Type</label>
                    <select name="type" value={formData.type} onChange={handleInputChange}>
                      <option value="Central">Central</option>
                      <option value="State">State</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>State (Optional)</label>
                    <input type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder="e.g. Madhya Pradesh" disabled={formData.type === 'Central'} />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Description</label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} required rows="3" />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Eligibility Summary</label>
                    <input type="text" name="eligibility_summary" value={formData.eligibility_summary} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label>Website URL</label>
                    <input type="url" name="website_url" value={formData.website_url} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label>Launch Year</label>
                    <input type="number" name="launch_year" value={formData.launch_year} onChange={handleInputChange} />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Application Steps (One per line)</label>
                    <textarea name="application_steps" value={formData.application_steps} onChange={handleInputChange} rows="4" placeholder="Step 1: Register...&#10;Step 2: Submit..." />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowAddForm(false)}>Cancel</button>
                  <button type="submit" className="save-btn"><Save size={18} /> Publish Scheme</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="schemes-table-wrap glass-panel animate-fade-in">
          <table className="schemes-table">
            <thead>
              <tr>
                <th>Scheme Name</th>
                <th>Category</th>
                <th>Type</th>
                <th>State</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {schemes.map(s => (
                <tr key={s.id}>
                  <td className="bold">{s.name}</td>
                  <td><span className="cat-badge">{s.category}</span></td>
                  <td>{s.type === 'Central' ? <Globe size={14} style={{verticalAlign:'middle'}} /> : <MapPin size={14} style={{verticalAlign:'middle'}} />} {s.type}</td>
                  <td>{s.state || '-'}</td>
                  <td>
                    <div className="action-btns">
                      <button className="icon-btn edit"><Edit3 size={16} /></button>
                      <button className="icon-btn delete" onClick={() => deleteScheme(s.id)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <style jsx>{`
        .dashboard-layout { display: flex; min-height: 100vh; background: #070314; color: white; font-family: 'Inter', sans-serif; }
        .dashboard-content { flex: 1; padding: 2rem; overflow-y: auto; }
        .dashboard-header { margin-bottom: 2rem; }
        .dashboard-title { font-size: 2rem; font-weight: 800; }
        .dashboard-subtitle { color: rgba(255,255,255,0.5); }

        .add-btn { background: #8b5cf6; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: all 0.2s; }
        .add-btn:hover { background: #7c3aed; transform: scale(1.05); }

        .schemes-table-wrap { border-radius: 20px; overflow: hidden; margin-top: 1rem; }
        .schemes-table { width: 100%; border-collapse: collapse; text-align: left; }
        .schemes-table th { background: rgba(255,255,255,0.05); padding: 1.2rem; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(255,255,255,0.4); }
        .schemes-table td { padding: 1.2rem; border-bottom: 1px solid rgba(255,255,255,0.03); color: rgba(255,255,255,0.8); }
        .schemes-table tr:last-child td { border-bottom: none; }
        .schemes-table tr:hover td { background: rgba(255,255,255,0.02); }
        .bold { font-weight: 700; color: white; }
        .cat-badge { background: rgba(139,92,246,0.15); color: #a78bfa; padding: 0.3rem 0.6rem; border-radius: 8px; font-size: 0.75rem; font-weight: 600; }

        .action-btns { display: flex; gap: 0.5rem; }
        .icon-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 0.5rem; cursor: pointer; color: white; transition: all 0.2s; }
        .icon-btn.edit:hover { background: rgba(59,130,246,0.2); border-color: #3b82f6; color: #3b82f6; }
        .icon-btn.delete:hover { background: rgba(239,68,68,0.2); border-color: #ef4444; color: #ef4444; }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 2rem; }
        .admin-modal { width: 100%; max-width: 800px; max-height: 90vh; overflow-y: auto; border-radius: 24px; padding: 2rem; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .close-x { background: none; border: none; color: white; cursor: pointer; }

        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group label { font-size: 0.85rem; font-weight: 600; color: rgba(255,255,255,0.5); }
        .form-group input, .form-group select, .form-group textarea { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 0.8rem; border-radius: 10px; color: white; outline: none; }
        .form-group input:focus, .form-group textarea:focus { border-color: #8b5cf6; }

        .form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
        .cancel-btn { background: none; border: 1px solid rgba(255,255,255,0.1); color: white; padding: 0.8rem 1.5rem; border-radius: 10px; cursor: pointer; }
        .save-btn { background: #8b5cf6; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 10px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }

        .glass-panel { background: rgba(255,255,255,0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1); }
        .animate-fade-in { animation: fadeIn 0.5s ease-out; }
        .animate-modal-up { animation: modalUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}
