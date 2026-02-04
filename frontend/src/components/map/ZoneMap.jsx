import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './ZoneMap.css';

// Fix for default marker icons in React Leaflet
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const ChangeView = ({ center }) => {
    const map = useMap();
    map.setView(center);
    return null;
}

const ZoneMap = ({ zones, selectedZone, onZoneSelect }) => {
    // Default center for Coimbatore
    const defaultCenter = [11.0168, 76.9558];
    const center = selectedZone ? [selectedZone.coordinates.lat, selectedZone.coordinates.lng] : defaultCenter;

    // Simulate "Risk Corridors" (Lines connecting zones)
    // In a real app, this would come from the backend "connections" graph
    const corridors = zones.length > 1 ? zones.map((z, i) => {
        if (i < zones.length - 1) {
            return [
                [z.coordinates.lat, z.coordinates.lng],
                [zones[i + 1].coordinates.lat, zones[i + 1].coordinates.lng]
            ];
        } else {
            // Connect last to first to close loop? Or just leaving open.
            return null;
        }
    }).filter(Boolean) : [];

    return (
        <div className="zone-map-container">
            <MapContainer center={center} zoom={13} scrollWheelZoom={true} className="leaflet-map">
                <ChangeView center={center} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Draw Zones */}
                {zones.map(zone => (
                    <React.Fragment key={zone.id}>
                        <Marker
                            position={[zone.coordinates.lat, zone.coordinates.lng]}
                            eventHandlers={{
                                click: () => onZoneSelect(zone),
                            }}
                        >
                            <Popup>
                                <strong>{zone.name}</strong><br />
                                Pop Density: {zone.infrastructure.populationDensity}
                            </Popup>
                        </Marker>

                        {/* Zone Risk Circle Visual */}
                        <Circle
                            center={[zone.coordinates.lat, zone.coordinates.lng]}
                            pathOptions={{ fillColor: 'red', color: 'red' }}
                            radius={300}
                        />
                    </React.Fragment>
                ))}

                {/* Draw Corridors */}
                {corridors.map((positions, idx) => (
                    <Polyline
                        key={idx}
                        positions={positions}
                        pathOptions={{ color: 'orange', dashArray: '10, 10', weight: 4 }}
                    >
                        <Popup>Risk Transmission Corridor</Popup>
                    </Polyline>
                ))}

            </MapContainer>
            <div className="map-legend">
                <span className="legend-item"><span className="dot red"></span> High Risk Zone</span>
                <span className="legend-item"><span className="line orange"></span> Infrastructure Corridor</span>
            </div>
        </div>
    );
};

export default ZoneMap;
