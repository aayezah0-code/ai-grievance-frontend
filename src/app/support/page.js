'use client';
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Search, 
  MessageSquare, 
  Mail, 
  Phone, 
  HelpCircle, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Activity, 
  Send,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  Settings,
  Heart,
  Globe,
  Star
} from 'lucide-react';
import './support.css';

export default function HelpSupportPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(0);

  const faqs = [
    { 
      id: 1, 
      category: 'Complaints',
      question: 'How do I submit a new grievance?', 
      answer: 'Go to the Dashboard, describe your issue in the text area, upload an optional image of the problem, and click "Submit Grievance". Our AI will automatically analyze and route it.' 
    },
    { 
      id: 2, 
      category: 'AI Analysis',
      question: 'How does the AI forensic analysis work?', 
      answer: 'Our system uses Gemini-1.5-Pro to inspect your description and images. It identifies the issue type, severity, and department, and provides a summarized inspection report for officials.' 
    },
    { 
      id: 3, 
      category: 'Tracking',
      question: 'Can I track my complaint in real-time?', 
      answer: 'Yes, navigate to "My Complaints" to see the status of all your submissions. Each complaint has a live timeline showing assignments and resolution progress.' 
    },
    { 
      id: 4, 
      category: 'Animal Welfare',
      question: 'How to report an animal in distress?', 
      answer: 'Use the dedicated "Animal Welfare" section. You can upload photos/videos of the animal, and our AI will detect the species and condition before alerting the nearest NGO.' 
    },
    { 
      id: 5, 
      category: 'Donations',
      question: 'Are my donations secure?', 
      answer: 'Absolutely. We use industry-standard encryption for all financial transactions and provide direct receipts for every contribution to civic projects or NGOs.' 
    },
    { 
      id: 6, 
      category: 'Account',
      question: 'How can I change my profile settings?', 
      answer: 'Navigate to the "Settings" page from the sidebar. You can update your contact information, appearance preferences, and security settings there.' 
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Support ticket submitted successfully. Ticket ID: #TC-8821');
    }, 1500);
  };

  const platformStatus = [
    { name: 'AI Assessment Engine', status: 'Operational', color: '#10b981' },
    { name: 'Server Connectivity', status: 'Operational', color: '#10b981' },
    { name: 'Emergency Dispatch', status: 'Delayed (High Traffic)', color: '#f59e0b' },
    { name: 'Map Services', status: 'Operational', color: '#10b981' }
  ];

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content support-main">
        
        {/* Support Hero */}
        <section className="support-hero animate-fade-in">
          <div className="hero-content">
            <div className="support-badge">24/7 CITIZEN ASSISTANCE</div>
            <h1>How can we <span>Help</span> you today?</h1>
            <p>Search our knowledge base, explore guides, or contact our dedicated civic support team.</p>
            
            <div className="support-search-wrap">
              <Search className="search-icon" size={22} />
              <input 
                type="text" 
                placeholder="Search for help topics, FAQs, or guides..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="search-btn">Search</button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="floating-orb purple"></div>
            <div className="floating-orb blue"></div>
            <div className="support-illustration">
              <MessageSquare size={120} color="var(--accent-purple)" opacity={0.2} />
              <ShieldAlert size={80} color="var(--accent-blue)" opacity={0.3} className="shield-float" />
            </div>
          </div>
        </section>

        <div className="support-grid">
          {/* Support Channels */}
          <section className="support-channels">
            <div className="channels-row">
              <div className="channel-card">
                <div className="channel-icon chat"><MessageSquare size={24} /></div>
                <h3>Live Chat</h3>
                <p>Chat with a civic officer for immediate assistance.</p>
                <button className="channel-btn">Start Chat</button>
              </div>
              <div className="channel-card">
                <div className="channel-icon email"><Mail size={24} /></div>
                <h3>Email Support</h3>
                <p>Send us a detailed query and we'll reply within 24h.</p>
                <button className="channel-btn">Send Email</button>
              </div>
              <div className="channel-card emergency">
                <div className="channel-icon call"><Phone size={24} /></div>
                <h3>Emergency</h3>
                <p>Direct line for life-threatening civic emergencies.</p>
                <button className="channel-btn">Call Now</button>
              </div>
            </div>
          </section>

          {/* FAQs & Platform Status */}
          <div className="support-flex-layout">
            <div className="support-column-left">
              <section className="faq-section glass-card">
                <h2 className="section-title"><HelpCircle size={22} color="var(--accent-purple)" /> Frequently Asked Questions</h2>
                <div className="faq-list">
                  {filteredFaqs.length > 0 ? (
                    filteredFaqs.map(faq => (
                      <div key={faq.id} className={`faq-item ${activeFaq === faq.id ? 'active' : ''}`}>
                        <button className="faq-question" onClick={() => setActiveFaq(activeFaq === faq.id ? null : faq.id)}>
                          <span>{faq.question}</span>
                          <ChevronDown size={18} className="faq-arrow" />
                        </button>
                        <div className="faq-answer">
                          <p>{faq.answer}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-results">No FAQs found matching your search.</p>
                  )}
                </div>
              </section>

              <section className="user-guides mt-2">
                <h2 className="section-title"><FileText size={22} color="var(--accent-purple)" /> Quick Start Guides</h2>
                <div className="guide-grid">
                  {[
                    { title: 'Submitting Reports', desc: 'Step-by-step guide on reporting civic issues.', icon: <CheckCircle /> },
                    { title: 'AI Forensic Reports', desc: 'Understanding the AI analysis breakdown.', icon: <Activity /> },
                    { title: 'NGO Partnerships', desc: 'How we collaborate with local rescue teams.', icon: <Heart /> },
                    { title: 'Scheme Applications', desc: 'How to apply for government civic benefits.', icon: <Settings /> }
                  ].map((guide, i) => (
                    <div key={i} className="guide-card">
                      <div className="guide-icon">{guide.icon}</div>
                      <div className="guide-text">
                        <h4>{guide.title}</h4>
                        <p>{guide.desc}</p>
                      </div>
                      <ChevronRight size={16} className="guide-arrow" />
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="support-column-right">
              <section className="report-problem glass-card">
                <h2 className="section-title"><ShieldAlert size={22} color="var(--danger)" /> Report a Platform Issue</h2>
                <form onSubmit={handleTicketSubmit} className="support-form">
                  <div className="form-group">
                    <label>Issue Category</label>
                    <select>
                      <option>Technical Bug</option>
                      <option>Incorrect AI Analysis</option>
                      <option>Map Loading Issue</option>
                      <option>Account Access</option>
                      <option>Feature Request</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Issue Title</label>
                    <input type="text" placeholder="Short summary of the problem" required />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea placeholder="Describe exactly what happened..." required></textarea>
                  </div>
                  <div className="form-group">
                    <label>Priority Level</label>
                    <div className="priority-select">
                      <button type="button" className="p-btn low">Low</button>
                      <button type="button" className="p-btn med active">Medium</button>
                      <button type="button" className="p-btn high">High</button>
                    </div>
                  </div>
                  <button type="submit" className="ticket-submit-btn" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : <><Send size={18} /> Submit Support Ticket</>}
                  </button>
                </form>
              </section>

              <section className="platform-status glass-card mt-2">
                <h2 className="section-title"><Activity size={22} color="var(--accent-cyan)" /> Platform Status</h2>
                <div className="status-list">
                  {platformStatus.map((item, i) => (
                    <div key={i} className="status-item">
                      <div className="status-info">
                        <strong>{item.name}</strong>
                        <span style={{ color: item.color }}>{item.status}</span>
                      </div>
                      <div className="status-indicator" style={{ background: item.color, boxShadow: `0 0 10px ${item.color}` }}></div>
                    </div>
                  ))}
                </div>
                <div className="status-footer">
                  <Globe size={14} /> All systems operational globally.
                </div>
              </section>

              <section className="feedback-section glass-card mt-2">
                <h2 className="section-title"><Star size={22} color="var(--warning)" /> Feedback</h2>
                <div className="rating-wrap">
                  <p>Rate your experience with CitizenConnect</p>
                  <div className="stars">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star 
                        key={s} 
                        size={24} 
                        fill={s <= rating ? "var(--warning)" : "transparent"} 
                        color={s <= rating ? "var(--warning)" : "rgba(255,255,255,0.2)"}
                        onClick={() => setRating(s)}
                        style={{ cursor: 'pointer' }}
                      />
                    ))}
                  </div>
                </div>
                <textarea placeholder="Tell us how we can improve..." className="mt-1"></textarea>
                <button className="feedback-submit-btn">Send Feedback</button>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
