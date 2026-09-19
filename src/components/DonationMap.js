'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Search, MapPin, AlertTriangle, ArrowRight, Heart, Sparkles, Navigation } from 'lucide-react';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then(mod => mod.CircleMarker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

export default function DonationMap() {
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [mapSearch, setMapSearch] = useState('');

  useEffect(() => {
    setIsClient(true);
    fetchHotspots();
  }, []);

  const fetchHotspots = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/donations/hotspots`);
      const data = await res.json();
      setHotspots(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'Critical Zone': return '#ef4444'; // Red
      case 'High Risk': return '#f59e0b'; // Orange
      case 'Moderate Risk': return '#3b82f6'; // Blue
      default: return '#06b6d4'; // Cyan
    }
  };

  if (!isClient) return null;

  return (
    <div className="map-dashboard-container animate-fade-in">
      <div className="map-overlay-top">
        <div className="floating-search-bar">
          <div className="search-input-wrap">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search crisis zones..." 
              value={mapSearch}
              onChange={(e) => setMapSearch(e.target.value)}
            />
          </div>
          <button className="search-btn">Find Areas</button>
          <button className="nav-btn"><Navigation size={18} /></button>
        </div>

        <div className="floating-legend">
          <div className="legend-item"><span className="dot red"></span> Critical</div>
          <div className="legend-item"><span className="dot orange"></span> High</div>
          <div className="legend-item"><span className="dot blue"></span> Moderate</div>
          <div className="legend-item"><span className="dot cyan"></span> Low</div>
        </div>
      </div>

      <MapContainer 
        center={[20.5937, 78.9629]} 
        zoom={5} 
        style={{ height: '100%', width: '100%', zIndex: 1 }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; CARTO'
        />
        
        {hotspots.map((spot) => (
          <CircleMarker 
            key={spot.id}
            center={spot.coords}
            radius={10 + (spot.complaint_count * 2)}
            className={`soft-pulse-marker ${spot.risk_level.toLowerCase().replace(/\s+/g, '-')}`}
            pathOptions={{ 
              fillColor: getRiskColor(spot.risk_level), 
              color: getRiskColor(spot.risk_level),
              weight: 2,
              fillOpacity: 0.15
            }}
          >
            <Popup>
              <div className="light-map-popup">
                <div className="popup-header">
                  <span className="popup-risk" style={{ color: getRiskColor(spot.risk_level), backgroundColor: `${getRiskColor(spot.risk_level)}15` }}>
                    {spot.risk_level}
                  </span>
                  <span className="popup-count">{spot.complaint_count} Reports</span>
                </div>
                <h4 className="popup-title">{spot.location}</h4>
                <div className="popup-dept">
                  <AlertTriangle size={12} />
                  {spot.main_issue}
                </div>
                <p className="popup-summary">{spot.ai_summary}</p>
                
                {spot.related_campaign && (
                  <div className="popup-campaign">
                    <div className="camp-label">RELATED SUPPORT</div>
                    <div className="camp-title">{spot.related_campaign.title}</div>
                    <button className="camp-btn">
                      Support Now <ArrowRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      <div className="map-overlay-bottom">
        <div className="floating-info-card">
          <div className="info-badge">
            <Sparkles size={12} className="sparkle-icon" />
            AI Monitoring Active
          </div>
          <div className="info-stats">
            <div className="stat">
              <span className="stat-val">{hotspots.length}</span>
              <span className="stat-label">Hotspots</span>
            </div>
            <div className="divider"></div>
            <div className="stat">
              <span className="stat-val">{hotspots.reduce((acc, spot) => acc + spot.complaint_count, 0)}</span>
              <span className="stat-label">Reports</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .map-dashboard-container { 
          position: relative; 
          width: 100%; 
          height: 600px; 
          border-radius: 24px; 
          overflow: hidden; 
          margin-bottom: 4rem;
          background: #f8fafc;
          border: 1px solid rgba(168, 85, 247, 0.15);
          box-shadow: 0 20px 40px rgba(0,0,0,0.05), 0 0 20px rgba(168, 85, 247, 0.05);
        }
        
        .map-overlay-top {
          position: absolute;
          top: 1.5rem;
          left: 1.5rem;
          right: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          z-index: 1000;
          pointer-events: none;
        }

        .floating-search-bar {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          padding: 0.5rem;
          border-radius: 99px;
          border: 1px solid rgba(168, 85, 247, 0.2);
          box-shadow: 0 8px 25px rgba(0,0,0,0.06);
          pointer-events: auto;
        }

        .search-input-wrap {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0 1rem;
        }

        .search-icon { color: #8b5cf6; }

        .search-input-wrap input {
          border: none;
          background: transparent;
          outline: none;
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
          font-weight: 500;
          color: #334155;
          width: 200px;
        }
        .search-input-wrap input::placeholder { color: #94a3b8; }

        .search-btn {
          background: linear-gradient(135deg, #a855f7, #6366f1);
          color: white;
          border: none;
          padding: 0.6rem 1.2rem;
          border-radius: 99px;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          transition: 0.2s;
          box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);
        }
        .search-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 15px rgba(168, 85, 247, 0.4); }

        .nav-btn {
          background: white;
          border: 1px solid rgba(168, 85, 247, 0.2);
          color: #8b5cf6;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: 0.2s;
        }
        .nav-btn:hover { background: #f3e8ff; }

        .floating-legend {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(12px);
          padding: 1rem 1.25rem;
          border-radius: 16px;
          border: 1px solid rgba(168, 85, 247, 0.15);
          box-shadow: 0 10px 30px rgba(0,0,0,0.06);
          pointer-events: auto;
        }
        .legend-item { display: flex; align-items: center; gap: 0.6rem; font-size: 0.75rem; font-weight: 700; color: #475569; letter-spacing: 0.05em; text-transform: uppercase; }
        .dot { width: 8px; height: 8px; border-radius: 50%; }
        .red { background: #ef4444; box-shadow: 0 0 6px rgba(239, 68, 68, 0.5); }
        .orange { background: #f59e0b; box-shadow: 0 0 6px rgba(245, 158, 11, 0.5); }
        .blue { background: #3b82f6; box-shadow: 0 0 6px rgba(59, 130, 246, 0.5); }
        .cyan { background: #06b6d4; box-shadow: 0 0 6px rgba(6, 182, 212, 0.5); }

        .map-overlay-bottom {
          position: absolute;
          bottom: 1.5rem;
          left: 1.5rem;
          z-index: 1000;
          pointer-events: none;
        }

        .floating-info-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(12px);
          padding: 1rem;
          border-radius: 20px;
          border: 1px solid rgba(168, 85, 247, 0.2);
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          pointer-events: auto;
          display: inline-flex;
          flex-direction: column;
          gap: 0.8rem;
        }

        .info-badge {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.7rem;
          font-weight: 800;
          color: #8b5cf6;
          background: #f3e8ff;
          padding: 0.3rem 0.75rem;
          border-radius: 99px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .sparkle-icon { color: #a855f7; }

        .info-stats {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0 0.5rem;
        }
        .stat { display: flex; flex-direction: column; }
        .stat-val { font-size: 1.5rem; font-weight: 900; color: #0f172a; line-height: 1; margin-bottom: 0.2rem; }
        .stat-label { font-size: 0.65rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
        .divider { width: 1px; height: 30px; background: #e2e8f0; }

        :global(.leaflet-container) { background: #f8fafc !important; font-family: 'Inter', sans-serif; }
        :global(.leaflet-tile-pane) { filter: saturate(1.2) hue-rotate(200deg) brightness(1.05); opacity: 0.8; }
        
        :global(.soft-pulse-marker path) { transform-origin: center; animation: softPulse 2.5s ease-out infinite; }
        
        :global(.leaflet-popup-content-wrapper) { 
          background: rgba(255, 255, 255, 0.95) !important; 
          backdrop-filter: blur(12px); 
          border: 1px solid rgba(168, 85, 247, 0.2); 
          border-radius: 20px !important; 
          color: #1e293b !important; 
          box-shadow: 0 15px 40px rgba(0,0,0,0.1), 0 0 20px rgba(168, 85, 247, 0.05); 
          overflow: hidden; 
          padding: 0 !important; 
        }
        :global(.leaflet-popup-content) { margin: 0 !important; width: 260px !important; }
        :global(.leaflet-popup-tip) { background: rgba(255, 255, 255, 0.95) !important; border: 1px solid rgba(168, 85, 247, 0.2); }

        .light-map-popup { padding: 1.25rem; }
        
        .popup-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
        .popup-risk { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; padding: 0.25rem 0.6rem; border-radius: 6px; }
        .popup-count { font-size: 0.7rem; color: #64748b; font-weight: 700; }
        
        .popup-title { font-size: 1.1rem; font-weight: 800; margin-bottom: 0.4rem; color: #0f172a; line-height: 1.3; }
        .popup-dept { display: flex; align-items: center; gap: 0.4rem; font-size: 0.75rem; font-weight: 700; color: #8b5cf6; margin-bottom: 0.75rem; }
        .popup-summary { font-size: 0.8rem; color: #475569; line-height: 1.5; margin-bottom: 1.25rem; }
        
        .popup-campaign { padding-top: 1rem; border-top: 1px solid #e2e8f0; }
        .camp-label { font-size: 0.6rem; font-weight: 800; color: #8b5cf6; margin-bottom: 0.4rem; letter-spacing: 0.05em; }
        .camp-title { font-size: 0.85rem; font-weight: 700; color: #1e293b; margin-bottom: 0.8rem; line-height: 1.3; }
        .camp-btn { width: 100%; background: #f1f5f9; border: 1px solid #e2e8f0; color: #334155; padding: 0.6rem; border-radius: 10px; font-weight: 700; font-size: 0.75rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: 0.2s; }
        .camp-btn:hover { background: #e2e8f0; color: #0f172a; }

        .animate-fade-in { animation: fadeIn 0.8s ease-out; }
        
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes softPulse { 0% { stroke-width: 0; opacity: 1; } 100% { stroke-width: 15px; opacity: 0; } }
      `}</style>
    </div>
  );
}
