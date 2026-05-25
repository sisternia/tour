import React, { forwardRef } from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

interface MapProps {
  tour: any;
  height?: number | `${number}%` | 'auto';
  onMapTouch?: (isTouching: boolean) => void;
}

const Map = forwardRef<any, MapProps>(({ tour, height = 300, onMapTouch }, ref) => {

  const getScheduleDate = (startDateStr: string, dayNumber: number) => {
    if (!startDateStr) return "";
    const startDate = new Date(startDateStr);
    const targetDate = new Date(startDate);
    targetDate.setDate(startDate.getDate() + (dayNumber - 1));
    return targetDate.toLocaleDateString("vi-VN", { day: 'numeric', month: 'numeric', year: 'numeric' });
  };

  const getLeafletHTML = (tourData: any) => {
    const schedules = tourData.schedules || [];
    const markers: any[] = [];
    
    if (tourData.tour_latit && tourData.tour_longit) {
      markers.push({
        lat: tourData.tour_latit,
        lng: tourData.tour_longit,
        title: "<b>Điểm khởi hành</b><br>" + (tourData.tour_add || ""),
        isStart: true
      });
    }

    schedules.forEach((s: any) => {
      if (s.tour_sche_latit && s.tour_sche_longit) {
        const timeRange = s.time_sche_end ? `${s.time_sche_start} - ${s.time_sche_end}` : s.time_sche_start;
        const scheDate = getScheduleDate(tourData.time?.date_start, s.day_number);
        const routeBtn = `<button onclick="window.showRoute(${s.tour_sche_latit}, ${s.tour_sche_longit})" style="margin-top: 8px; width: 100%; background: #007BFF; color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-weight: bold;">Dẫn đường tới đây</button>`;
        
        markers.push({
          lat: s.tour_sche_latit,
          lng: s.tour_sche_longit,
          title: `<b style="color: #007BFF; font-size: 14px;">Ngày ${s.day_number} (${scheDate})</b><br><span style="color: #666;">${timeRange}</span><br><b>${s.tour_sche_name}</b><br>${routeBtn}`,
          isStart: false,
          day: s.day_number,
          time: s.time_sche_start
        });
      }
    });

    const centerLat = markers[0]?.lat || 10.7626;
    const centerLng = markers[0]?.lng || 106.6602;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet-control-geocoder/dist/Control.Geocoder.css" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script src="https://unpkg.com/leaflet-control-geocoder/dist/Control.Geocoder.js"></script>
        <script src="https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.js"></script>
        <style>
          body { margin: 0; padding: 0; }
          #map { height: 100vh; width: 100vw; }
          .custom-marker {
            background-color: #007BFF;
            color: white;
            border-radius: 50%;
            width: 24px !important;
            height: 24px !important;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 12px;
            border: 2px solid white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          }
          .start-marker { background-color: #FF3B30; }
          .leaflet-popup-content { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 5px; line-height: 1.5; }
          .leaflet-control-geocoder { border-radius: 12px !important; box-shadow: 0 4px 15px rgba(0,0,0,0.15) !important; border: none !important; }
          .leaflet-routing-container { 
            display: none; /* Hide the instructions panel */
          }
          .refresh-btn {
            background: white;
            width: 30px;
            height: 30px;
            line-height: 30px;
            text-align: center;
            cursor: pointer;
            box-shadow: 0 1px 5px rgba(0,0,0,0.4);
            border-radius: 4px;
            font-size: 18px;
            color: #333;
            margin-left: 5px !important;
          }
          .refresh-btn:hover { background: #f4f4f4; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = L.map('map').setView([${centerLat}, ${centerLng}], 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OSM' }).addTo(map);
          const searchLayer = L.layerGroup().addTo(map);
          const geocoder = L.Control.geocoder({ 
            query: "", 
            placeholder: "Tìm kiếm địa điểm...", 
            defaultMarkGeocode: false, 
            geocoder: L.Control.Geocoder.nominatim() 
          }).addTo(map);

          geocoder.on('markgeocode', function(e) {
            searchLayer.clearLayers();
            const bbox = e.geocode.bbox;
            const poly = L.polygon([
              bbox.getSouthEast(),
              bbox.getNorthEast(),
              bbox.getNorthWest(),
              bbox.getSouthWest()
            ]);
            map.fitBounds(poly.getBounds());
            
            const marker = L.marker(e.geocode.center)
              .addTo(searchLayer)
              .bindPopup(\`<b>\${e.geocode.name}</b><br><button onclick="window.showRoute(\${e.geocode.center.lat}, \${e.geocode.center.lng})" style="margin-top: 8px; width: 100%; background: #007BFF; color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-weight: bold;">Dẫn đường tới đây</button>\`)
              .openPopup();
          });

          map.on('click', async function(e) {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;
            
            searchLayer.clearLayers();
            
            const marker = L.marker([lat, lng])
              .addTo(searchLayer)
              .bindPopup('<span style="color: #666;">Đang tải địa chỉ...</span>')
              .openPopup();
              
            try {
              const response = await fetch(\`https://nominatim.openstreetmap.org/reverse?format=json&lat=\${lat}&lon=\${lng}\`);
              const data = await response.json();
              if (data && data.display_name) {
                const address = data.display_name;
                marker.bindPopup(\`<b>\${address}</b><br><button onclick="window.showRoute(\${lat}, \${lng})" style="margin-top: 8px; width: 100%; background: #007BFF; color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-weight: bold;">Dẫn đường tới đây</button>\`).openPopup();
                
                const searchInput = document.querySelector('.leaflet-control-geocoder-form input');
                if (searchInput) {
                  searchInput.value = address;
                }
              } else {
                marker.bindPopup(\`<b>Tọa độ: \${lat.toFixed(4)}, \${lng.toFixed(4)}</b><br><button onclick="window.showRoute(\${lat}, \${lng})" style="margin-top: 8px; width: 100%; background: #007BFF; color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-weight: bold;">Dẫn đường tới đây</button>\`).openPopup();
              }
            } catch (error) {
              marker.bindPopup('Không thể tải địa chỉ').openPopup();
            }
          });

          // Custom Refresh Button
          const RefreshControl = L.Control.extend({
            options: { position: 'topright' },
            onAdd: function() {
              const div = L.DomUtil.create('div', 'leaflet-bar refresh-btn');
              div.innerHTML = '↺';
              div.title = 'Làm mới bản đồ';
              div.onclick = function(e) {
                L.DomEvent.stopPropagation(e);
                window.resetMap();
              };
              return div;
            }
          });
          map.addControl(new RefreshControl());

          const markers = ${JSON.stringify(markers)};
          const startPoint = markers.find(m => m.isStart);
          const leafletMarkers = {};
          let routingControl = null;

          window.showRoute = (lat, lng) => {
            if (routingControl) {
              map.removeControl(routingControl);
            }
            if (!startPoint) {
              alert("Không có điểm khởi đầu để vẽ đường đi.");
              return;
            }
            routingControl = L.Routing.control({
              waypoints: [
                L.latLng(startPoint.lat, startPoint.lng),
                L.latLng(lat, lng)
              ],
              lineOptions: {
                styles: [{ color: '#007BFF', weight: 6, opacity: 0.8 }]
              },
              addWaypoints: false,
              draggableWaypoints: false,
              fitSelectedRoutes: true,
              show: false,
              createMarker: function() { return null; }
            }).addTo(map);
          };

          window.resetMap = () => {
            if (routingControl) {
              map.removeControl(routingControl);
              routingControl = null;
            }
            searchLayer.clearLayers();
            if (markers.length > 1) {
              const group = new L.featureGroup(Object.values(leafletMarkers));
              map.fitBounds(group.getBounds().pad(0.1));
            }
          };

          markers.forEach((m, i) => {
            let icon;
            if (m.isStart) {
              icon = L.divIcon({ className: 'custom-marker start-marker', html: 'S', iconSize: [24, 24], iconAnchor: [12, 12] });
            } else {
              icon = L.divIcon({ className: 'custom-marker', html: m.day || '?', iconSize: [24, 24], iconAnchor: [12, 12] });
            }
            const marker = L.marker([m.lat, m.lng], { icon }).addTo(map).bindPopup(m.title);
            leafletMarkers[i] = marker;
          });
          if (markers.length > 1) {
            const group = new L.featureGroup(Object.values(leafletMarkers));
            map.fitBounds(group.getBounds().pad(0.1));
          }
          window.addEventListener('message', (event) => {
            let data;
            try { data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data; } catch(e) { return; }
            if (data.type === 'FOCUS_MARKER') {
              const targetIndex = data.index + 1; 
              const m = markers[targetIndex];
              if (m) { map.setView([m.lat, m.lng], 16); leafletMarkers[targetIndex].openPopup(); }
            }
          });
        </script>
      </body>
      </html>
    `;
  };

  return (
    <View style={[styles.mapContainer, { height }]}>
      {Platform.OS === 'web' ? (
        <iframe
          id="tour-map-iframe"
          srcDoc={getLeafletHTML(tour)}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Tour Map"
        />
      ) : (
        <WebView 
          ref={ref} 
          originWhitelist={['*']} 
          source={{ html: getLeafletHTML(tour) }} 
          style={{ flex: 1 }} 
          scrollEnabled={false} 
          nestedScrollEnabled={true}
          onTouchStart={() => onMapTouch?.(true)}
          onTouchEnd={() => onMapTouch?.(false)}
          onTouchCancel={() => onMapTouch?.(false)}
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  mapContainer: { width: "100%", borderRadius: 20, overflow: "hidden", marginBottom: 20 },
});

export default Map;
