'use client';
import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Search, Navigation } from 'lucide-react';

const customIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -40],
});

function ChangeView({ center }) {
  const map = useMap();
  map.setView(center, 15);
  return null;
}

function LocationMarker({ position, onSelect }) {
  useMapEvents({ click(e) { onSelect(e.latlng); } });
  return position ? <Marker position={position} icon={customIcon} /> : null;
}

export default function AnimalMapPicker({ onLocationSelect }) {
  const [center, setCenter]   = useState([28.6139, 77.2090]);
  const [marker, setMarker]   = useState(null);
  const [search, setSearch]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSelect = (ll) => { setMarker(ll); };

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!search.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data?.length) {
        const pos = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        setCenter([pos.lat, pos.lng]);
        setMarker(pos);
      }
    } finally { setLoading(false); }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(p => {
      const pos = { lat: p.coords.latitude, lng: p.coords.longitude };
      setCenter([pos.lat, pos.lng]);
      setMarker(pos);
    });
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Search bar inside modal */}
      <div style={{ position:'absolute',top:12,left:12,right:12,zIndex:1000,display:'flex',gap:8 }}>
        <form onSubmit={handleSearch} style={{ display:'flex',gap:8,flex:1 }}>
          <div style={{ position:'relative',flex:1 }}>
            <Search style={{ position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'#a855f7' }} size={15}/>
            <input
              type="text" placeholder="Search location..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ width:'100%',background:'rgba(15,15,35,0.9)',backdropFilter:'blur(10px)',
                border:'1px solid rgba(139,92,246,0.5)',borderRadius:10,padding:'8px 10px 8px 34px',
                color:'white',fontSize:'0.85rem',outline:'none' }}
            />
          </div>
          <button type="submit" disabled={loading}
            style={{ background:'#9333ea',border:'none',color:'white',padding:'0 16px',
              borderRadius:10,fontWeight:700,cursor:'pointer',fontSize:'0.85rem' }}>
            {loading ? '...' : 'Search'}
          </button>
          <button type="button" onClick={useMyLocation}
            style={{ background:'#3b82f6',border:'none',color:'white',padding:'0 12px',
              borderRadius:10,cursor:'pointer',display:'flex',alignItems:'center' }}>
            <Navigation size={16}/>
          </button>
        </form>
      </div>

      <MapContainer center={center} zoom={13} style={{ height:400,width:'100%' }} zoomControl={false}>
        <ChangeView center={center}/>
        <TileLayer
          url="http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          subdomains={['mt0','mt1','mt2','mt3']}
        />
        <LocationMarker position={marker} onSelect={handleSelect}/>
      </MapContainer>

      {/* Confirm button at bottom */}
      <div style={{ padding:'1rem 1.5rem',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
        <span style={{ fontSize:'0.8rem',color:'rgba(255,255,255,0.45)' }}>
          {marker ? `📍 ${marker.lat?.toFixed(5)}, ${marker.lng?.toFixed(5)}` : 'Click on map to pin location'}
        </span>
        <button
          onClick={() => marker && onLocationSelect(marker)}
          disabled={!marker}
          style={{ background: marker ? 'linear-gradient(135deg,#7c3aed,#9333ea)' : 'rgba(255,255,255,0.1)',
            border:'none',color:'white',padding:'0.6rem 1.5rem',borderRadius:10,
            fontWeight:700,fontSize:'0.85rem',cursor: marker ? 'pointer' : 'not-allowed' }}>
          ✓ Confirm Location
        </button>
      </div>

      <style>{`
        .leaflet-tile-container { filter: invert(100%) hue-rotate(225deg) brightness(0.7) contrast(1.2) saturate(1.5); }
        .leaflet-container { background:#050515; }
        .leaflet-marker-icon { filter: drop-shadow(0 0 10px #a855f7); }
      `}</style>
    </div>
  );
}
