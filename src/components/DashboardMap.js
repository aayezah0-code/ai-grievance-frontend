'use client';
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Search, Navigation } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

// Fix for default marker icons
const customIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// Helper component to move the map
function ChangeView({ center }) {
  const map = useMap();
  map.setView(center, 15);
  return null;
}

function LocationMarker({ position, onLocationSelect }) {
  const map = useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={customIcon} />
  );
}

export default function DashboardMap({ onLocationSelect }) {
  const { t } = useLanguage();
  const [mapCenter, setMapCenter] = useState([28.6139, 77.2090]); // Default New Delhi
  const [markerPos, setMarkerPos] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleLocationSelect = (latlng) => {
    setMarkerPos(latlng);
    onLocationSelect(latlng);
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newPos = { lat: parseFloat(lat), lng: parseFloat(lon) };
        setMapCenter([newPos.lat, newPos.lng]);
        handleLocationSelect(newPos);
      } else {
        alert(t('map.locationNotFound'));
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert(t('map.geolocationNotSupported'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition((position) => {
      const newPos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      setMapCenter([newPos.lat, newPos.lng]);
      handleLocationSelect(newPos);
    }, () => {
      alert(t('map.unableToRetrieveLocation'));
    });
  };

  return (
    <div className="map-container google-map-themed" style={{ position: 'relative' }}>
      {/* Floating Search Bar */}
      <div className="map-search-bar">
        <form onSubmit={handleSearch} style={{ display: 'flex', width: '100%', gap: '8px' }}>
          <div className="search-input-wrapper">
            <Search className="search-icon" size={16} />
            <input 
              type="text" 
              placeholder={t('map.searchPlaceholder')} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="search-btn" disabled={isSearching}>
            {isSearching ? '...' : t('map.search')}
          </button>
          <button type="button" onClick={useCurrentLocation} className="location-btn" title={t('map.useMyLocation')}>
            <Navigation size={18} />
          </button>
        </form>
      </div>

      <MapContainer 
        center={mapCenter} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <ChangeView center={mapCenter} />
        <TileLayer
          url="http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
          attribution='&copy; Google Maps'
        />
        <LocationMarker position={markerPos} onLocationSelect={handleLocationSelect} />
      </MapContainer>

      <style jsx global>{`
        .map-search-bar {
          position: absolute;
          top: 15px;
          left: 15px;
          right: 15px;
          z-index: 1000;
          display: flex;
          gap: 10px;
        }

        .search-input-wrapper {
          position: relative;
          flex: 1;
        }

        .search-input-wrapper input {
          width: 100%;
          background: rgba(15, 15, 35, 0.85);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(139, 92, 246, 0.5);
          border-radius: 10px;
          padding: 8px 10px 8px 35px;
          color: white;
          font-size: 0.9rem;
          outline: none;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }

        .search-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--accent-purple);
        }

        .search-btn, .location-btn {
          background: var(--accent-purple);
          border: none;
          color: white;
          border-radius: 10px;
          padding: 0 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
        }

        .location-btn {
          padding: 0 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--accent-blue);
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        }

        .search-btn:hover, .location-btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.1);
        }

        .google-map-themed .leaflet-tile-container {
          filter: 
            invert(100%) 
            hue-rotate(225deg) 
            brightness(0.7) 
            contrast(1.2) 
            saturate(1.5);
        }
        
        .google-map-themed .leaflet-container {
          background: #050515;
        }

        .google-map-themed .leaflet-marker-icon {
          filter: drop-shadow(0 0 10px var(--accent-purple));
        }

        .google-map-themed .leaflet-tile {
          opacity: 0.85;
        }
      `}</style>
    </div>
  );
}
