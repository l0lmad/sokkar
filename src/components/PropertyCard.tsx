"use client";

import {
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Building2,
  Tag,
  Eye,
  Edit3,
  Trash2,
  Play,
} from "lucide-react";
import type { Property } from "@/db/schema";

interface PropertyCardProps {
  property: Property;
  onView: (property: Property) => void;
  onEdit?: (property: Property) => void;
  onDelete?: (property: Property) => void;
  isAdmin?: boolean;
}

const typeLabels: Record<string, string> = {
  apartment: "شقة",
  villa: "فيلا",
  studio: "ستوديو",
  office: "مكتب",
  land: "أرض",
  shop: "محل",
};

const statusLabels: Record<string, string> = {
  available: "متاح",
  sold: "تم البيع",
  rented: "مؤجر",
  pending: "قيد التفاوض",
};

const statusColors: Record<string, string> = {
  available: "bg-green-100 text-green-700",
  sold: "bg-red-100 text-red-700",
  rented: "bg-blue-100 text-blue-700",
  pending: "bg-yellow-100 text-yellow-700",
};

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

export default function PropertyCard({
  property,
  onView,
  onEdit,
  onDelete,
  isAdmin = false,
}: PropertyCardProps) {
  const images = property.images ? JSON.parse(property.images) : [];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group">
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center">
        {images.length > 0 ? (
          <img
            src={images[0]}
            alt={property.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-6xl group-hover:scale-110 transition-transform">
            {typeIcons[property.propertyType] || "🏢"}
          </span>
        )}

        {/* Video indicator */}
        {property.videoUrl && (
          <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
            <Play size={12} />
            فيديو
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 right-3 flex gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              property.listingType === "sale"
                ? "bg-emerald-500 text-white"
                : "bg-purple-500 text-white"
            }`}
          >
            {property.listingType === "sale" ? "للبيع" : "للإيجار"}
          </span>
          {property.featured && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-orange-500 to-pink-500 text-white">
              ⭐ مميز
            </span>
          )}
        </div>

        <div className="absolute top-3 left-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              statusColors[property.status] || "bg-gray-100 text-gray-700"
            }`}
          >
            {statusLabels[property.status] || property.status}
          </span>
        </div>

        {/* Admin Actions */}
        {isAdmin && (
          <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(property);
                }}
                className="p-2 bg-white rounded-lg shadow-lg hover:bg-blue-50 text-blue-600"
              >
                <Edit3 size={16} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(property);
                }}
                className="p-2 bg-white rounded-lg shadow-lg hover:bg-red-50 text-red-600"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-lg text-gray-800 line-clamp-1 flex-1">
            {property.title}
          </h3>
        </div>

        <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
          <MapPin size={14} />
          <span>
            {property.district ? `${property.district}، ` : ""}
            {property.city}
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-4">
          <Tag size={16} className="text-orange-500" />
          <span className="text-xl font-bold text-orange-500">
            {formatPrice(property.price, property.listingType)}
          </span>
        </div>

        {/* Details */}
        <div className="flex items-center gap-4 text-gray-500 text-sm mb-4">
          <div className="flex items-center gap-1">
            <Building2 size={14} />
            <span>{typeLabels[property.propertyType]}</span>
          </div>
          {property.area && (
            <div className="flex items-center gap-1">
              <Maximize2 size={14} />
              <span>{property.area} م²</span>
            </div>
          )}
          {property.bedrooms !== null &&
            property.bedrooms !== undefined &&
            property.bedrooms > 0 && (
              <div className="flex items-center gap-1">
                <Bed size={14} />
                <span>{property.bedrooms}</span>
              </div>
            )}
          {property.bathrooms !== null &&
            property.bathrooms !== undefined &&
            property.bathrooms > 0 && (
              <div className="flex items-center gap-1">
                <Bath size={14} />
                <span>{property.bathrooms}</span>
              </div>
            )}
        </div>

        {/* Action */}
        <button
          onClick={() => onView(property)}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
        >
          <Eye size={18} />
          عرض التفاصيل
        </button>
      </div>
    </div>
  );
}
