import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Compass, Search } from "lucide-react";

const PRESET_LOCATIONS = [
  { name: "Colombo (Galle Face)", lat: 6.9271, lng: 79.8436, label: "Galle Face Green, Colombo 03" },
  { name: "Kandy (Lake View)", lat: 7.2906, lng: 80.6337, label: "Kandy Lake Round, Kandy" },
  { name: "Galle (Fort & Lighthouse)", lat: 6.0328, lng: 80.2170, label: "Galle Fort Lighthouse, Galle" },
  { name: "Negombo (Beach Park)", lat: 7.2098, lng: 79.8407, label: "Negombo Beach Road, Negombo" },
  { name: "Mount Lavinia (Hotel)", lat: 6.8344, lng: 79.8638, label: "Mount Lavinia Hotel, Colombo" },
];

export default function LocationPickerMap({ value, onChange, onCoordinatesChange }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [coords, setCoords] = useState({ lat: 6.9271, lng: 79.8436 });
  const [addressDisplay, setAddressDisplay] = useState(value || "Galle Face Green, Colombo 03");
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mapReady, setMapReady] = useState(false);

  // Sync external value change
  useEffect(() => {
    if (value && value !== addressDisplay) {
      setAddressDisplay(value);
    }
  }, [value]);

  // Reverse geocode via Nominatim
  const reverseGeocode = async (lat, lng) => {
    setIsGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            "Accept-Language": "en",
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        const venueName =
          data.name ||
          data.address?.amenity ||
          data.address?.building ||
          data.address?.road ||
          data.address?.suburb ||
          "";
        const city =
          data.address?.city ||
          data.address?.town ||
          data.address?.village ||
          data.address?.county ||
          "";
        const formatted = venueName && city
          ? `${venueName}, ${city}`
          : data.display_name?.split(",").slice(0, 3).join(",") || `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

        setAddressDisplay(formatted);
        onChange?.(formatted);
        onCoordinatesChange?.({ lat, lng });
      }
    } catch (e) {
      console.warn("Reverse geocode failed:", e);
      const fallback = `Point (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
      setAddressDisplay(fallback);
      onChange?.(fallback);
      onCoordinatesChange?.({ lat, lng });
    } finally {
      setIsGeocoding(false);
    }
  };

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initMap = () => {
      if (typeof window === "undefined" || !window.L) {
        // Retry if leaflet script not yet loaded
        setTimeout(initMap, 200);
        return;
      }

      if (mapInstanceRef.current) return;

      const L = window.L;
      const initialLat = coords.lat;
      const initialLng = coords.lng;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 14,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom marker icon
      const pinIcon = L.divIcon({
        className: "custom-map-pin-icon",
        html: `
          <div style="
            position: relative;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #2563eb;
            color: white;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 4px 14px rgba(37,99,235,0.6);
            border: 2px solid white;
          ">
            <span style="transform: rotate(45deg); font-size: 14px; font-weight: bold;">📷</span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([initialLat, initialLng], {
        icon: pinIcon,
        draggable: true,
      }).addTo(map);

      marker.bindPopup("<b>Selected Event Venue</b><br/>Drag or click to move location.").openPopup();

      // Click on map to move marker
      map.on("click", (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setCoords({ lat, lng });
        reverseGeocode(lat, lng);
      });

      // Drag marker
      marker.on("dragend", (e) => {
        const { lat, lng } = e.target.getLatLng();
        setCoords({ lat, lng });
        reverseGeocode(lat, lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
      setMapReady(true);
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  const handleSelectPreset = (preset) => {
    setCoords({ lat: preset.lat, lng: preset.lng });
    setAddressDisplay(preset.label);
    onChange?.(preset.label);
    onCoordinatesChange?.({ lat: preset.lat, lng: preset.lng });

    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([preset.lat, preset.lng], 15);
      markerRef.current.setLatLng([preset.lat, preset.lng]);
      markerRef.current.setPopupContent(`<b>${preset.name}</b><br/>${preset.label}`).openPopup();
    }
  };

  const handleSearchAddress = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;

    setIsGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
        { headers: { "Accept-Language": "en" } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const item = data[0];
          const lat = parseFloat(item.lat);
          const lng = parseFloat(item.lon);
          const label = item.display_name.split(",").slice(0, 3).join(",");

          setCoords({ lat, lng });
          setAddressDisplay(label);
          onChange?.(label);
          onCoordinatesChange?.({ lat, lng });

          if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.setView([lat, lng], 15);
            markerRef.current.setLatLng([lat, lng]);
            markerRef.current.setPopupContent(`<b>Found Location</b><br/>${label}`).openPopup();
          }
        }
      }
    } catch (err) {
      console.warn("Search geocode failed:", err);
    } finally {
      setIsGeocoding(false);
    }
  };

  return (
    <div className="location-picker-container" style={{ marginTop: 8 }}>
      {/* Search & Address Display Bar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: 36, fontSize: "0.84rem" }}
            placeholder="Search venue, landmark, or street on map..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearchAddress(e)}
          />
        </div>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          style={{ padding: "0 14px", display: "flex", alignItems: "center", gap: 6 }}
          onClick={handleSearchAddress}
          disabled={isGeocoding}
        >
          <Navigation size={13} /> {isGeocoding ? "Finding..." : "Locate"}
        </button>
      </div>

      {/* Quick Location Pills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", alignSelf: "center", marginRight: 2 }}>
          Popular Venues:
        </span>
        {PRESET_LOCATIONS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            className="map-preset-pill"
            onClick={() => handleSelectPreset(preset)}
          >
            <Compass size={11} style={{ marginRight: 3, verticalAlign: "-1px" }} />
            {preset.name}
          </button>
        ))}
      </div>

      {/* Map Element */}
      <div
        style={{
          position: "relative",
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
          border: "1px solid rgba(59,130,246,0.25)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
        }}
      >
        <div
          ref={mapContainerRef}
          style={{
            width: "100%",
            height: 240,
            background: "#1e293b",
            zIndex: 1,
          }}
        />

        {/* Floating Hint Overlay */}
        <div
          style={{
            position: "absolute",
            bottom: 10,
            left: 10,
            right: 10,
            zIndex: 500,
            background: "rgba(10, 20, 38, 0.88)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            padding: "8px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "0.75rem",
            color: "var(--white)",
            pointerEvents: "none",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, overflow: "hidden" }}>
            <MapPin size={14} color="#60a5fa" style={{ flexShrink: 0 }} />
            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {isGeocoding ? "Resolving location address..." : addressDisplay || "Click on map to drop pin"}
            </span>
          </div>
          <span style={{ fontSize: "0.68rem", color: "#34d399", fontWeight: 600, flexShrink: 0, marginLeft: 8 }}>
            ✓ Pin Selected
          </span>
        </div>
      </div>

      <style>{`
        .map-preset-pill {
          background: rgba(37,99,235,0.12);
          border: 1px solid rgba(59,130,246,0.28);
          color: #93c5fd;
          font-size: 0.72rem;
          padding: 3px 9px;
          border-radius: 9999px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .map-preset-pill:hover {
          background: rgba(37,99,235,0.3);
          border-color: #60a5fa;
          color: #ffffff;
        }
        .leaflet-container {
          font-family: inherit;
        }
      `}</style>
    </div>
  );
}
