import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const locations = [
  { name: 'GUSIMAWA (WASJ)', coords: [-3.05, 133.883333] as [number, number], type: 'origin' },
  { name: 'ILAGA (WAYL)', coords: [-3.977222, 137.620278] as [number, number], type: 'waypoint' },
  { name: 'SINAK (WABS)', coords: [-3.822728, 137.84115] as [number, number], type: 'dest' },
];

const routeColor = '#3b82f6'; // Blue for the route

// Component to fit bounds
const FitBounds = ({ bounds }: { bounds: L.LatLngBoundsExpression }) => {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [map, bounds]);
  return null;
};

const TacticalMap: React.FC = () => {
  const polylinePositions = locations.map(loc => loc.coords);
  const bounds = L.latLngBounds(locations.map(loc => loc.coords));

  return (
    <div className="h-[300px] w-full rounded-lg overflow-hidden border border-border relative z-0">
      <MapContainer 
        center={[-3.5, 135.5]} 
        zoom={7} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        <FitBounds bounds={bounds} />

        <Polyline 
            positions={polylinePositions} 
            pathOptions={{ color: routeColor, weight: 2, dashArray: '5, 10', opacity: 0.7 }} 
        />

        {locations.map((loc, idx) => (
          <Marker 
            key={idx} 
            position={loc.coords}
            icon={L.divIcon({
                className: 'custom-marker',
                html: `<div style="
                    background-color: ${loc.type === 'origin' ? '#3b82f6' : loc.type === 'dest' ? '#eab308' : '#10b981'};
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    border: 2px solid white;
                    box-shadow: 0 0 10px ${loc.type === 'origin' ? '#3b82f6' : loc.type === 'dest' ? '#eab308' : '#10b981'};
                "></div>`,
                iconSize: [12, 12],
                iconAnchor: [6, 6]
            })}
          >
            <Popup className="font-mono text-[10px]">
              <div className="font-bold">{loc.name}</div>
              <div className="text-gray-500">{loc.coords[0].toFixed(4)}, {loc.coords[1].toFixed(4)}</div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Overlay Title */}
      <div className="absolute top-2 left-2 z-[400] bg-black/50 backdrop-blur-sm px-2 py-1 rounded border border-white/10">
        <div className="text-[10px] font-mono font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            LIVE TACTICAL FEED
        </div>
      </div>
    </div>
  );
};

export default TacticalMap;