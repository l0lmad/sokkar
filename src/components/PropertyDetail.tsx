"use client";

import {
  X,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Building2,
  Tag,
  Layers,
  Phone,
  MessageCircle,
  Clock,
  User,
  ChevronRight,
  ChevronLeft,
  Play,
  ExternalLink,
  Copy,
  Check,
  Share2,
  Edit3,
  Trash2,
} from "lucide-react";
import type { Property } from "@/db/schema";
import { useState } from "react";
import EditPropertyModal from "./EditPropertyModal";

interface PropertyDetailProps {
  property: Property;
  onClose: () => void;
  onDelete?: (property: Property) => void;
  userPhone?: string;
  userName?: string;
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

export default function PropertyDetail({
  property,
  onClose,
  onDelete,
  userPhone,
  userName,
  isAdmin,
}: PropertyDetailProps) {
  const [inquiryData, setInquiryData] = useState({
    name: userName || "",
    phone: userPhone || "",
    whatsapp: "",
    contactTime: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);

  const images = property.images ? JSON.parse(property.images) : [];

  const handleInquiryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setInquiryData({ ...inquiryData, [e.target.name]: e.target.value });
  };

  const handleInquiry = async () => {
    if (!inquiryData.name || !inquiryData.phone) {
      return;
    }
    setSubmitting(true);
    try {
      const clientRes = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: inquiryData.name,
          phone: inquiryData.phone,
          whatsapp: inquiryData.whatsapp || null,
          contactTime: inquiryData.contactTime || null,
          clientType: property.listingType === "rent" ? "tenant" : "buyer",
        }),
      });
      const client = await clientRes.json();

      await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: property.id,
          clientId: client.id,
          message: inquiryData.message || `استفسار عن عقار: ${property.title}`,
        }),
      });

      setSubmitted(true);
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header Image/Video */}
        <div className="relative h-72 bg-gradient-to-br from-orange-200 to-pink-200 flex items-center justify-center">
          {showVideo && property.videoUrl ? (
            <video
              src={property.videoUrl}
              controls
              autoPlay
              className="w-full h-full object-cover"
            />
          ) : images.length > 0 ? (
            <>
              <img
                src={images[currentImageIndex]}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                  >
                    <ChevronRight size={24} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                    {images.map((_: string, i: number) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImageIndex(i)}
                        className={`w-2 h-2 rounded-full ${
                          i === currentImageIndex ? "bg-white" : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <span className="text-8xl">
              {typeIcons[property.propertyType] || "🏢"}
            </span>
          )}

          <div className="absolute top-4 left-4 flex gap-2">
            {isAdmin && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); setEditing(true); }}
                  className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-blue-100 transition-colors text-blue-600"
                  title="تعديل العقار"
                >
                  <Edit3 size={18} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`هل أنت متأكد من حذف "${property.title}"؟`)) {
                      fetch(`/api/properties/${property.id}`, { method: "DELETE" })
                        .then(() => { onDelete?.(property); onClose(); })
                        .catch(console.error);
                    }
                  }}
                  className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-red-100 transition-colors text-red-600"
                  title="حذف العقار"
                >
                  <Trash2 size={18} />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
            >
              <X size={20} />
            </button>
            <button
              onClick={async () => {
                const url = `${window.location.origin}/property/${property.id}`;
                try {
                  await navigator.clipboard.writeText(url);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                } catch {}
              }}
              className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
              title="نسخ رابط العقار"
            >
              {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
            </button>
            <button
              onClick={() => {
                const url = `${window.location.origin}/property/${property.id}`;
                if (navigator.share) navigator.share({ url });
              }}
              className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
              title="مشاركة العقار"
            >
              <Share2 size={18} />
            </button>
          </div>

          {property.videoUrl && (
            <button
              onClick={() => setShowVideo(!showVideo)}
              className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full hover:bg-white transition-colors flex items-center gap-1 text-sm font-medium"
            >
              <Play size={16} />
              {showVideo ? "صور" : "فيديو"}
            </button>
          )}

          <div className="absolute bottom-4 right-4 flex gap-2">
            <span
              className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                property.listingType === "sale"
                  ? "bg-emerald-500 text-white"
                  : "bg-purple-500 text-white"
              }`}
            >
              {property.listingType === "sale" ? "للبيع" : "للإيجار"}
            </span>
          </div>
        </div>

        <div className="p-6">
          {/* Title & Price */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {property.title}
              </h2>
              <div className="flex items-center gap-1 text-gray-500 mt-1">
                <MapPin size={16} />
                <span>
                  {property.address ||
                    `${property.district || ""}، ${property.city}`}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-6">
            <Tag size={20} className="text-orange-500" />
            <span className="text-3xl font-bold text-orange-500">
              {formatPrice(property.price, property.listingType)}
            </span>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <Building2 size={20} className="mx-auto text-gray-400 mb-1" />
              <p className="text-xs text-gray-500">النوع</p>
              <p className="font-bold text-gray-800 text-sm">
                {typeLabels[property.propertyType]}
              </p>
            </div>
            {property.area && (
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <Maximize2 size={20} className="mx-auto text-gray-400 mb-1" />
                <p className="text-xs text-gray-500">المساحة</p>
                <p className="font-bold text-gray-800 text-sm">
                  {property.area} م²
                </p>
              </div>
            )}
            {property.bedrooms !== null && property.bedrooms !== undefined && (
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <Bed size={20} className="mx-auto text-gray-400 mb-1" />
                <p className="text-xs text-gray-500">غرف</p>
                <p className="font-bold text-gray-800 text-sm">
                  {property.bedrooms}
                </p>
              </div>
            )}
            {property.bathrooms !== null && property.bathrooms !== undefined && (
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <Bath size={20} className="mx-auto text-gray-400 mb-1" />
                <p className="text-xs text-gray-500">حمامات</p>
                <p className="font-bold text-gray-800 text-sm">
                  {property.bathrooms}
                </p>
              </div>
            )}
            {property.floor !== null && property.floor !== undefined && (
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <Layers size={20} className="mx-auto text-gray-400 mb-1" />
                <p className="text-xs text-gray-500">الطابق</p>
                <p className="font-bold text-gray-800 text-sm">
                  {property.floor}
                </p>
              </div>
            )}
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <span className="text-lg">📋</span>
              <p className="text-xs text-gray-500">الحالة</p>
              <p className="font-bold text-gray-800 text-sm">
                {statusLabels[property.status]}
              </p>
            </div>
          </div>

          {/* Google Maps Link */}
          {property.mapUrl && (
            <a
              href={property.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 mb-6 bg-blue-50 text-blue-600 font-medium rounded-xl hover:bg-blue-100 transition-colors"
            >
              <MapPin size={18} />
              عرض الموقع على Google Maps
              <ExternalLink size={16} />
            </a>
          )}

          {/* Description */}
          {property.description && (
            <div className="mb-6">
              <h3 className="font-bold text-gray-800 mb-2">الوصف</h3>
              <p className="text-gray-600 leading-relaxed">
                {property.description}
              </p>
            </div>
          )}

          {/* Owner Info - Admin Only */}
          {isAdmin && (property.ownerName || property.ownerPhone || property.ownerWhatsapp) && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <User size={18} className="text-amber-600" />
                بيانات المالك
              </h3>
              <div className="space-y-2 text-sm">
                {property.ownerName && (
                  <p><span className="text-gray-500">الاسم:</span> <span className="font-medium">{property.ownerName}</span></p>
                )}
                {property.ownerPhone && (
                  <p><span className="text-gray-500">التليفون:</span> <span className="font-medium" dir="ltr">{property.ownerPhone}</span></p>
                )}
                {property.ownerWhatsapp && (
                  <p><span className="text-gray-500">واتساب:</span> <span className="font-medium" dir="ltr">{property.ownerWhatsapp}</span></p>
                )}
              </div>
            </div>
          )}

          {/* Inquiry Section */}
          <div className="border-t pt-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Phone size={20} />
              استفسار عن هذا العقار
            </h3>

            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <p className="text-green-700 font-bold text-lg">
                  ✅ تم إرسال استفسارك بنجاح!
                </p>
                <p className="text-green-600 text-sm mt-1">
                  سنتواصل معك على رقم {inquiryData.phone} في أقرب وقت
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      الاسم *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={inquiryData.name}
                      onChange={handleInquiryChange}
                      placeholder="اسمك الكامل"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      رقم الهاتف *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={inquiryData.phone}
                      onChange={handleInquiryChange}
                      placeholder="01012345678"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
                      <MessageCircle size={14} />
                      رقم واتساب (اختياري)
                    </label>
                    <input
                      type="tel"
                      name="whatsapp"
                      value={inquiryData.whatsapp}
                      onChange={handleInquiryChange}
                      placeholder="01012345678"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
                      <Clock size={14} />
                      وقت التواصل المناسب (اختياري)
                    </label>
                    <select
                      name="contactTime"
                      value={inquiryData.contactTime}
                      onChange={handleInquiryChange}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">في أي وقت</option>
                      <option value="morning">الفترة الصباحية (9 ص - 12 م)</option>
                      <option value="afternoon">الفترة الظهرية (12 م - 4 عصراً)</option>
                      <option value="evening">الفترة المسائية (4 عصراً - 8 م)</option>
                      <option value="night">الفترة الليلية (بعد 8 م)</option>
                    </select>
                  </div>
                </div>
                <textarea
                  name="message"
                  placeholder="رسالتك أو استفسارك (اختياري)"
                  value={inquiryData.message}
                  onChange={handleInquiryChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
                <button
                  onClick={handleInquiry}
                  disabled={submitting || !inquiryData.name || !inquiryData.phone}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <Phone size={18} />
                      إرسال الاستفسار
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {editing && (
        <EditPropertyModal
          property={property}
          onClose={() => setEditing(false)}
          onSave={() => { setEditing(false); onClose(); }}
        />
      )}
    </div>
  );
}
