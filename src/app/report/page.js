"use client";
import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { useUser } from '@/context/UserContext';
import { 
  Mic, Send, FileText, CheckCircle, Image as ImageIcon, X, Loader2, 
  AlertTriangle, ShieldAlert, Fingerprint, Zap, ShieldCheck 
} from 'lucide-react';

// --- SUCCESS MODAL COMPONENT ---
const SuccessModal = ({ isOpen, onClose, data, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content ai-modal ai-modal-full animate-modal-in">
        <div className="modal-header">
          <div className="ai-brand">
            <div className="ai-icon-pulse">
              <ShieldCheck size={28} color="#A855F7" />
            </div>
            <h3>Real-time AI Assessment</h3>
          </div>
          {!isLoading && (
            <button className="close-modal" onClick={onClose}>
              <X size={20} />
            </button>
          )}
        </div>

        <div className="modal-body">
          {isLoading ? (
            <div className="ai-loading-container" style={{ padding: '4rem 0' }}>
              <div className="ai-scanner"></div>
              <div className="float-animation">
                <Fingerprint size={64} color="#A855F7" style={{ marginBottom: '1.5rem' }} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Analyzing Evidence...</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: '400px', margin: '0 auto' }}>
                Our forensic AI is cross-referencing your description and images with municipal issue patterns.
              </p>
            </div>
          ) : (
            <>
              <div className="ai-result-header" style={{ marginBottom: '2rem' }}>
                <div className={`status-badge-premium status-resolved`} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <ShieldCheck size={14} />
                  Successfully Routed
                </div>
                <div className="category-badge">
                  {data?.department || 'Public Works'}
                </div>
              </div>

              <div className="ai-grid-layout" style={{ marginBottom: '2.5rem' }}>
                <div className="ai-summary-box">
                  <h4 style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>Inspection Summary</h4>
                  <p style={{ fontSize: '1rem', lineHeight: 1.8, color: '#fff', fontStyle: 'italic' }}>
                    "{data?.ai_summary || "Report processed successfully."}"
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="meta-item">
                        <span>Sentiment</span>
                        <strong style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#A855F7' }}>
                            <Zap size={14} />
                            {data?.sentiment || 'Neutral'}
                        </strong>
                    </div>
                    <div className="meta-item">
                        <span>Confidence</span>
                        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', marginTop: '5px' }}>
                            <div style={{ width: `${data?.confidence_score || 95}%`, height: '100%', background: 'linear-gradient(to right, #7C3AED, #A855F7)', borderRadius: '10px' }}></div>
                        </div>
                    </div>
                    <div className="meta-item">
                        <span>Priority</span>
                        <strong style={{ color: data?.priority?.toLowerCase() === 'high' ? '#ef4444' : '#fff' }}>{data?.priority || 'Medium'}</strong>
                    </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button className="modal-action-btn" onClick={onClose}>
                    Go to My Complaints
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ReportGrievance() {
  const { user } = useUser();
  const router = useRouter();
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [aiData, setAiData] = useState(null);
  
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("Voice input requires Chrome."); return; }
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.onresult = (event) => {
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript + ' ';
      }
      if (final) setText(prev => prev + final);
    };
    recognitionRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imageFile) {
        alert("Please provide at least a text description or an image.");
        return;
    }
    
    setIsSubmitting(true);
    setShowModal(true);
    setAiData(null);

    try {
      let imageUrl = null;

      // 1. Upload image if exists
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/upload`, {
          method: 'POST',
          body: formData
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          imageUrl = uploadData.image_url;
        }
      }

      // 2. Submit complaint
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            citizen_name: name || user?.full_name || "Anonymous", 
            text,
            image_url: imageUrl
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAiData(data);
      } else {
        alert("Server error. Please try again.");
        setShowModal(false);
      }
    } catch (err) {
      console.error(err);
      alert("Cannot connect to server. Make sure the backend is running.");
      setShowModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">

        <header className="welcome-header float-animation">
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <Zap size={20} color="#A855F7" />
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '2px' }}>
                    Emergency Reporting
                </p>
            </div>
            <h1 style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-2px' }}>Report a <span>Grievance</span></h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', maxWidth: '600px', lineHeight: 1.6 }}>
                Submit your complaint with visual evidence. Our AI will perform deep forensic analysis and route it to the correct department.
            </p>
          </div>
          <div className="ai-scanner" style={{ opacity: 0.1 }}></div>
        </header>

        <div className="glass-panel" style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700, color: '#fff' }}>Citizen Name</label>
                <div className="input-with-icon">
                  <FileText className="input-icon" size={18} color="#A855F7" />
                  <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder={user?.full_name || "Your Name"}
                    style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', height: '56px' }}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700, color: '#fff' }}>Visual Evidence</label>
                <div 
                  className="image-upload-zone"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ 
                    border: '1px dashed rgba(168, 85, 247, 0.4)', 
                    borderRadius: '18px', 
                    height: '56px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    cursor: 'pointer',
                    background: 'rgba(0,0,0,0.2)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <input 
                    type="file" 
                    hidden 
                    ref={fileInputRef} 
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                  {imageFile ? (
                    <span style={{ color: '#A855F7', fontWeight: 800, fontSize: '0.9rem' }}>{imageFile.name.substring(0, 25)}...</span>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'rgba(255,255,255,0.4)' }}>
                      <ImageIcon size={20} />
                      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Click to attach evidence</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {imagePreview && (
              <div className="image-preview-container animate-fade-in" style={{ position: 'relative', width: 'fit-content' }}>
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  style={{ maxHeight: '240px', borderRadius: '24px', border: '1px solid rgba(168, 85, 247, 0.3)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }} 
                />
                <button 
                  type="button" 
                  onClick={removeImage}
                  style={{ position: 'absolute', top: '-12px', right: '-12px', background: '#ef4444', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', boxShadow: '0 5px 15px rgba(239, 68, 68, 0.4)' }}
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, color: '#fff' }}>Detailed Description</label>
              <div className="textarea-wrapper">
                <textarea
                  rows="6"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Describe the problem in detail. Mention specific landmarks, duration of the issue, and risks..."
                  style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem', fontSize: '1rem' }}
                />
                <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    className={`mic-btn ${isRecording ? 'listening' : ''}`}
                    onClick={isRecording ? stopRecording : startRecording}
                    style={{ 
                        background: isRecording ? '#ef4444' : 'rgba(168, 85, 247, 0.1)', 
                        border: '1px solid rgba(168, 85, 247, 0.2)', 
                        width: '44px', 
                        height: '44px', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: 'white',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}
                  >
                    <Mic size={20} />
                  </button>
                  {isRecording && <span className="animate-pulse" style={{ fontSize: '0.9rem', color: '#ef4444', display: 'flex', alignItems: 'center', fontWeight: 700 }}>AI is listening...</span>}
                </div>
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={isSubmitting} style={{ height: '64px', borderRadius: '22px' }}>
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Performing AI Forensic Scan...
                </>
              ) : (
                <>
                  <ShieldCheck size={24} />
                  Submit Grievance
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      <SuccessModal 
        isOpen={showModal} 
        onClose={() => {
            setShowModal(false);
            router.push('/my-complaints');
        }}
        data={aiData}
        isLoading={isSubmitting}
      />
    </div>
  );
}
