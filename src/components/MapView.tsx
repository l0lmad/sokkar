"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { Property } from "@/db/schema";
import PropertyDetail from "./PropertyDetail";
import { MapPin, Filter, X, Search, ExternalLink } from "lucide-react";

interface MapViewProps {
  userName?: string;
  userPhone?: string;
  isAdmin?: boolean;
}

const typeIcons: Record<string, string> = {
  apartment: "🏢",
  villa: "🏡",
  studio: "🏠",
  office: "🏗️",
  land: "🌍",
  shop: "🏪",
};

function formatPrice(price: string | number, listingType: string): string {
  const num = typeof price === "string" ? parseFloat(price) : price;
  if (listingType === "rent") {
    return `${num.toLocaleString("ar-EG")} جنيه/شهر`;
  }
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)} مليون جنيه`;
  }
  return `${num.toLocaleString("ar-EG")} جنيه`;
}

// Get coordinates from property
function getPropertyCoords(property: Property): { lat: number; lng: number } | null {
  // First try direct latitude/longitude fields
  if (property.latitude && property.longitude) {
    const lat = parseFloat(property.latitude);
    const lng = parseFloat(property.longitude);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }

  // Fall back to extracting from Google Maps URL
  if (property.mapUrl) {
    const patterns = [
      /@(-?\d+\.\d+),(-?\d+\.\d+)/,
      /ll=(-?\d+\.\d+),(-?\d+\.\d+)/,
      /q=(-?\d+\.\d+),(-?\d+\.\d+)/,
      /place\/[^\/]+\/(-?\d+\.\d+),(-?\d+\.\d+)/,
    ];
    for (const pattern of patterns) {
      const match = property.mapUrl.match(pattern);
      if (match) {
        return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
      }
    }
  }

  return null;
}

export default function MapView({ userName, userPhone, isAdmin }: MapViewProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [listingFilter, setListingFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);
  const [searching, setSearching] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (listingFilter) params.append("listingType", listingFilter);
    if (typeFilter) params.append("propertyType", typeFilter);

    try {
      const res = await fetch(`/api/properties?${params.toString()}`);
      const data = await res.json();
      setProperties(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [listingFilter, typeFilter]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Search for places
  const searchPlaces = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setSearching(true);
    try {
      // Try with Egypt bias first, then fallback without
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=8&accept-language=ar`
      );
      const data = await res.json();
      // Prioritize Egyptian results
      const egResults = data.filter((r: any) => 
        r.display_name?.includes("Egypt") || 
        r.display_name?.includes("مصر") ||
        r.type === "yes" ||
        r.type === "administrative"
      );
      const sorted = egResults.length > 0 ? egResults : data;
      setSearchResults(sorted.slice(0, 8));
    } catch (err) {
      console.error(err);
    }
    setSearching(false);
  };

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      searchPlaces(searchQuery);
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // Go to location
  const goToLocation = (lat: string, lon: string, name: string) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([parseFloat(lat), parseFloat(lon)], 15);
      setSearchQuery(name);
      setSearchResults([]);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;

      if (!mapInstanceRef.current && mapRef.current) {
        mapInstanceRef.current = L.map(mapRef.current).setView(
          [30.0444, 31.2357],
          10
        );

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
        }).addTo(mapInstanceRef.current);
      }

      // Clear existing markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      // Filter properties with valid coordinates
      const propsWithCoords = properties.filter((p) => {
        const coords = getPropertyCoords(p);
        return coords !== null;
      });

      propsWithCoords.forEach((property) => {
        const coords = getPropertyCoords(property);
        if (!coords) return;

        const icon = L.divIcon({
          html: `<div style="
            background: ${
              property.listingType === "sale"
                ? "linear-gradient(135deg, #f97316, #ec4899)"
                : "linear-gradient(135deg, #8b5cf6, #6366f1)"
            };
            color: white;
            padding: 6px 10px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
            font-family: Cairo, sans-serif;
            white-space: nowrap;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            gap: 4px;
            cursor: pointer;
            transform: translate(-50%, -100%);
          ">
            <span>${typeIcons[property.propertyType] || "🏢"}</span>
            <span>${formatPrice(property.price, property.listingType)}</span>
          </div>`,
          className: "custom-marker",
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        });

        const marker = L.marker([coords.lat, coords.lng], { icon }).addTo(
          mapInstanceRef.current!
        );

        marker.bindPopup(`
          <div style="font-family: Cairo, sans-serif; direction: rtl; min-width: 200px;">
            <h3 style="font-size: 14px; font-weight: bold; margin-bottom: 4px;">${property.title}</h3>
            <p style="color: #666; font-size: 12px; margin-bottom: 4px;">📍 ${
              property.district || ""
            } - ${property.city}</p>
            <p style="color: #f97316; font-weight: bold; font-size: 14px; margin-bottom: 8px;">💰 ${formatPrice(
              property.price,
              property.listingType
            )}</p>
            <p style="color: #666; font-size: 11px;">
              ${property.area ? `📐 ${property.area} م²` : ""}
              ${property.bedrooms ? ` | 🛏️ ${property.bedrooms} غرف` : ""}
            </p>
          </div>
        `);

        marker.on("click", () => {
          setSelectedProperty(property);
        });

        markersRef.current.push(marker);
      });

      // Fit bounds
      if (propsWithCoords.length > 0 && mapInstanceRef.current) {
        const group = L.featureGroup(markersRef.current);
        mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
      }
    };

    initMap();
  }, [properties]);

  const propertiesOnMap = properties.filter((p) => getPropertyCoords(p));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <MapPin className="text-orange-500" />
            خريطة العقارات
          </h2>
          <p className="text-gray-500 mt-1">
            ابحث عن منطقة أو اضغط على أي علامة لعرض التفاصيل
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${
            showFilters
              ? "bg-orange-50 border-orange-300 text-orange-600"
              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Filter size={18} />
          فلترة
        </button>
      </div>

      {/* Search Box */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="relative">
          <Search
            size={20}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن منطقة... (مثال: التجمع الخامس، المعادي، الشيخ زايد)"
            className="w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          {searching && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-orange-500 border-t-transparent"></div>
            </div>
          )}
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-2 border border-gray-200 rounded-xl overflow-hidden">
            {searchResults.map((result, i) => (
              <button
                key={i}
                onClick={() => goToLocation(result.lat, result.lon, result.display_name)}
                className="w-full text-right px-4 py-3 hover:bg-orange-50 transition-colors flex items-center gap-2 border-b border-gray-100 last:border-0"
              >
                <MapPin size={16} className="text-orange-500 shrink-0" />
                <span className="text-sm text-gray-700 truncate">
                  {result.display_name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {showFilters && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4 flex flex-wrap gap-4">
          <select
            value={listingFilter}
            onChange={(e) => setListingFilter(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">كل العروض</option>
            <option value="sale">للبيع</option>
            <option value="rent">للإيجار</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">كل الأنواع</option>
            <option value="apartment">شقة</option>
            <option value="villa">فيلا</option>
            <option value="studio">ستوديو</option>
            <option value="office">مكتب</option>
            <option value="land">أرض</option>
            <option value="shop">محل</option>
          </select>
          {(listingFilter || typeFilter) && (
            <button
              onClick={() => {
                setListingFilter("");
                setTypeFilter("");
              }}
              className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-100"
            >
              <X size={16} />
              مسح الفلتر
            </button>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="w-4 h-4 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full"></span>
          للبيع
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="w-4 h-4 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"></span>
          للإيجار
        </div>
        <div className="text-sm text-gray-400">
          | {propertiesOnMap.length} عقار على الخريطة
        </div>
      </div>

      {/* Map Container */}
      <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
          </div>
        )}
        <div ref={mapRef} className="w-full" style={{ height: "600px" }} />
      </div>

      {/* Properties List (without map coordinates) */}
      {properties.length > propertiesOnMap.length && (
        <div className="mt-6">
          <h3 className="text-lg font-bold text-gray-700 mb-3">
            عقارات بدون موقع على الخريطة ({properties.length - propertiesOnMap.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties
              .filter((p) => !getPropertyCoords(p))
              .slice(0, 6)
              .map((property) => (
                <button
                  key={property.id}
                  onClick={() => setSelectedProperty(property)}
                  className="bg-white rounded-xl p-4 border border-gray-100 text-right hover:shadow-md transition-shadow"
                >
                  <p className="font-bold text-gray-800 truncate">{property.title}</p>
                  <p className="text-sm text-gray-500">{property.city}</p>
                  <p className="text-orange-500 font-bold mt-1">
                    {formatPrice(property.price, property.listingType)}
                  </p>
                </button>
              ))}
          </div>
        </div>
      )}

      {selectedProperty && (
        <PropertyDetail
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onDelete={() => { setSelectedProperty(null); fetchProperties(); }}
          userName={userName}
          userPhone={userPhone}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}
