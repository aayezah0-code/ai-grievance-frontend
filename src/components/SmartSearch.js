'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, Zap } from 'lucide-react';

const SEARCH_MAPPING = [
  { keywords: ['complaints', 'report', 'grievance', 'issue'], path: '/my-complaints', label: 'My Complaints', icon: '📝' },
  { keywords: ['animal', 'dog', 'cat', 'rescue', 'welfare'], path: '/animal-welfare', label: 'Animal Welfare', icon: '🐾' },
  { keywords: ['donation', 'donate', 'money', 'help', 'fund'], path: '/donations', label: 'Donations', icon: '💰' },
  { keywords: ['scheme', 'government', 'benefit', 'policy'], path: '/schemes', label: 'Government Schemes', icon: '🏛️' },
  { keywords: ['profile', 'account', 'user', 'me'], path: '/profile', label: 'User Profile', icon: '👤' },
  { keywords: ['settings', 'config', 'preference', 'password', 'edit'], path: '/profile?edit=true', label: 'Settings', icon: '⚙️' },
  { keywords: ['notifications', 'bell', 'alerts', 'news'], path: '/notifications', label: 'Notifications', icon: '🔔' },
  { keywords: ['social', 'help', 'community', 'impact', 'support'], path: '/social-help', label: 'Social Help', icon: '🤝' },
  { keywords: ['admin', 'dashboard', 'control'], path: '/admin', label: 'Admin Dashboard', icon: '🛡️' },
  { keywords: ['about', 'mission', 'vision'], path: '/about', label: 'About CitizenConnect', icon: 'ℹ️' },
];

export default function SmartSearch() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    const filtered = SEARCH_MAPPING.filter(item => 
      item.keywords.some(k => k.includes(query.toLowerCase())) ||
      item.label.toLowerCase().includes(query.toLowerCase())
    );
    setSuggestions(filtered);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (path) => {
    router.push(path);
    setIsOpen(false);
    setQuery('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && suggestions.length > 0) {
      handleSelect(suggestions[0].path);
    }
  };

  return (
    <div className="smart-search-container" ref={dropdownRef}>
      <div className={`search-input-wrapper ${isOpen ? 'focused' : ''}`}>
        <Search className="search-icon" size={18} />
        <input
          type="text"
          placeholder="Search features (e.g. 'complaints', 'animal')..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="search-input"
        />
        <div className="search-shortcut">⌘K</div>
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="search-dropdown">
          <div className="dropdown-label">Quick Navigation</div>
          {suggestions.map((item, idx) => (
            <div 
              key={idx} 
              className="suggestion-item"
              onClick={() => handleSelect(item.path)}
            >
              <span className="suggestion-icon">{item.icon}</span>
              <span className="suggestion-text">{item.label}</span>
              <ArrowRight className="suggestion-arrow" size={14} />
            </div>
          ))}
          <div className="search-footer">
            <Zap size={12} /> Powered by Smart Navigator
          </div>
        </div>
      )}

      <style jsx>{`
        .smart-search-container {
          position: relative;
          width: 100%;
          max-width: 450px;
          margin: 0 2rem;
        }

        .search-input-wrapper {
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 0.6rem 1rem;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(10px);
        }

        .search-input-wrapper.focused {
          background: rgba(139, 92, 246, 0.05);
          border-color: rgba(139, 92, 246, 0.5);
          box-shadow: 0 0 25px rgba(139, 92, 246, 0.15);
          transform: translateY(-1px);
        }

        .search-icon {
          color: rgba(255, 255, 255, 0.4);
          margin-right: 0.75rem;
          transition: color 0.3s ease;
        }

        .search-input-wrapper.focused .search-icon {
          color: var(--accent-purple);
        }

        .search-input {
          background: transparent;
          border: none;
          color: white;
          font-size: 0.9rem;
          width: 100%;
          outline: none;
          font-weight: 500;
        }

        .search-input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        .search-shortcut {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.05);
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 700;
          margin-left: 0.5rem;
        }

        .search-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          left: 0;
          right: 0;
          background: rgba(10, 15, 30, 0.9);
          backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 0.75rem;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
          z-index: 1000;
          animation: dropdownIn 0.3s ease-out;
        }

        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .dropdown-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.3);
          font-weight: 800;
          letter-spacing: 1px;
          margin: 0.5rem 0.75rem;
        }

        .suggestion-item {
          display: flex;
          align-items: center;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          gap: 0.75rem;
        }

        .suggestion-item:hover {
          background: rgba(255, 255, 255, 0.05);
          padding-left: 1.25rem;
        }

        .suggestion-icon {
          font-size: 1.1rem;
        }

        .suggestion-text {
          flex: 1;
          color: rgba(255, 255, 255, 0.8);
          font-weight: 500;
          font-size: 0.9rem;
        }

        .suggestion-arrow {
          opacity: 0;
          color: var(--accent-purple);
          transition: all 0.2s ease;
        }

        .suggestion-item:hover .suggestion-arrow {
          opacity: 1;
          transform: translateX(3px);
        }

        .search-footer {
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 0.65rem;
          color: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
