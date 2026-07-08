"use client";

import { useState } from "react";
import {
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
  ChevronRight,
  ChevronLeft,
  Play,
  ExternalLink,
  Copy,
  Check,
  Share2,
  ArrowRight,
} from "lucide-react";
import type { Property } from "@/db/schema";
import Link from "next/link";

interface Props {
  property: Property;
}

const typeLabels: Record<string, string> = {
  apartment: "شقة",
  villa: "فيلا",
  studio: "ستوديو",
  office: "مكتب",
  land: "أرض",
  shop: "محل",
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

export default function PropertyPublicView({ property }: Props) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [copied, setCopied] = useState(false);

  const [inquiryData, setInquiryData] = useState({ name: "", phone: "", whatsapp: "", contactTime: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const images = property.images ? JSON.parse(property.images) : [];

  const nextImage = () => setCurrentImageIndex((p) => (p + 1) % images.length);
  const prevImage = () => setCurrentImageIndex((p) => (p - 1 + images.length) % images.length);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleInquiryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setInquiryData({ ...inquiryData, [e.target.name]: e.target.value });
  };

  const handleInquiry = async () => {
    if (!inquiryData.name || !inquiryData.phone) return;
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

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Navbar */}
      <div className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors">
            <ArrowRight size={20} />
            <span className="font-medium">العودة للرئيسية</span>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-sm">🏠</span>
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              Sokkar
            </span>
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4">
        {/* Image/Video Header */}
        <div className="relative h-72 sm:h-96 bg-gradient-to-br from-orange-200 to-pink-200 rounded-3xl overflow-hidden mb-6">
          {showVideo && property.videoUrl ? (
            <video src={property.videoUrl} controls autoPlay className="w-full h-full object-cover" />
          ) : images.length > 0 ? (
            <>
              <img src={images[currentImageIndex]} alt={property.title} className="w-full h-full object-cover" />
              {images.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70">
                    <ChevronRight size={24} />
                  </button>
                  <button onClick={nextImage} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70">
                    <ChevronLeft size={24} />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                    {images.map((_: string, i: number) => (
                      <button key={i} onClick={() => setCurrentImageIndex(i)}
                        className={`w-2 h-2 rounded-full ${i === currentImageIndex ? "bg-white" : "bg-white/50"}`} />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-8xl">{typeIcons[property.propertyType] || "🏢"}</span>
            </div>
          )}

          {property.videoUrl && (
            <button onClick={() => setShowVideo(!showVideo)}
              className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full hover:bg-white transition-colors flex items-center gap-1 text-sm font-medium">
              <Play size={16} />
              {showVideo ? "صور" : "فيديو"}
            </button>
          )}

          {/* Share / Copy Link Buttons */}
          <div className="absolute top-4 left-4 flex gap-2">
            <button onClick={copyLink}
              className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors">
              {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
            </button>
            <button onClick={() => { if (navigator.share) navigator.share({ url: window.location.href }); }}
              className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors">
              <Share2 size={18} />
            </button>
          </div>

          <div className="absolute bottom-4 right-4">
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${property.listingType === "sale" ? "bg-emerald-500 text-white" : "bg-purple-500 text-white"}`}>
              {property.listingType === "sale" ? "للبيع" : "للإيجار"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">{property.title}</h1>
              <div className="flex items-center gap-1 text-gray-500 mb-4">
                <MapPin size={16} />
                <span>{property.address || `${property.district || ""}، ${property.city}`}</span>
              </div>

              <div className="flex items-center gap-2 mb-6">
                <Tag size={20} className="text-orange-500" />
                <span className="text-3xl font-bold text-orange-500">{formatPrice(property.price, property.listingType)}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <Building2 size={20} className="mx-auto text-gray-400 mb-1" />
                  <p className="text-xs text-gray-500">النوع</p>
                  <p className="font-bold text-gray-800 text-sm">{typeLabels[property.propertyType]}</p>
                </div>
                {property.area && (
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <Maximize2 size={20} className="mx-auto text-gray-400 mb-1" />
                    <p className="text-xs text-gray-500">المساحة</p>
                    <p className="font-bold text-gray-800 text-sm">{property.area} م²</p>
                  </div>
                )}
                {property.bedrooms !== null && property.bedrooms !== undefined && (
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <Bed size={20} className="mx-auto text-gray-400 mb-1" />
                    <p className="text-xs text-gray-500">غرف</p>
                    <p className="font-bold text-gray-800 text-sm">{property.bedrooms}</p>
                  </div>
                )}
                {property.bathrooms !== null && property.bathrooms !== undefined && (
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <Bath size={20} className="mx-auto text-gray-400 mb-1" />
                    <p className="text-xs text-gray-500">حمامات</p>
                    <p className="font-bold text-gray-800 text-sm">{property.bathrooms}</p>
                  </div>
                )}
                {property.floor !== null && property.floor !== undefined && (
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <Layers size={20} className="mx-auto text-gray-400 mb-1" />
                    <p className="text-xs text-gray-500">الطابق</p>
                    <p className="font-bold text-gray-800 text-sm">{property.floor}</p>
                  </div>
                )}
              </div>

              {property.description && (
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">الوصف</h3>
                  <p className="text-gray-600 leading-relaxed">{property.description}</p>
                </div>
              )}
            </div>

            {/* Map */}
            {property.mapUrl && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin size={18} className="text-orange-500" />
                  موقع العقار
                </h3>
                <a href={property.mapUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-blue-50 text-blue-600 font-medium rounded-xl hover:bg-blue-100 transition-colors mb-3">
                  <MapPin size={18} />
                  عرض على Google Maps
                  <ExternalLink size={16} />
                </a>
                <div className="aspect-video rounded-xl overflow-hidden border">
                  <iframe
                    src={property.mapUrl.replace("https://maps.google.com", "https://maps.google.com/maps/embed?output=embed").replace("https://www.google.com/maps", "https://www.google.com/maps/embed?output=embed")}
                    width="100%"
                    height="100%"
                    style={{ border: 0, minHeight: "300px" }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Phone size={20} />
                استفسار عن هذا العقار
              </h3>

              {submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <p className="text-green-700 font-bold text-lg">✅ تم إرسال استفسارك!</p>
                  <p className="text-green-600 text-sm mt-1">سنواتصل بك قريباً</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">الاسم *</label>
                    <input type="text" name="name" value={inquiryData.name} onChange={handleInquiryChange}
                      placeholder="اسمك الكامل"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">رقم الهاتف *</label>
                    <input type="tel" name="phone" value={inquiryData.phone} onChange={handleInquiryChange}
                      placeholder="01012345678"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
                      <MessageCircle size={14} />
                      واتساب (اختياري)
                    </label>
                    <input type="tel" name="whatsapp" value={inquiryData.whatsapp} onChange={handleInquiryChange}
                      placeholder="01012345678"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
                      <Clock size={14} />
                      وقت التواصل
                    </label>
                    <select name="contactTime" value={inquiryData.contactTime} onChange={handleInquiryChange}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500">
                      <option value="">في أي وقت</option>
                      <option value="morning">الفترة الصباحية</option>
                      <option value="afternoon">الفترة الظهرية</option>
                      <option value="evening">الفترة المسائية</option>
                      <option value="night">الفترة الليلية</option>
                    </select>
                  </div>
                  <textarea name="message" placeholder="رسالتك (اختياري)" value={inquiryData.message} onChange={handleInquiryChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" />
                  <button onClick={handleInquiry}
                    disabled={submitting || !inquiryData.name || !inquiryData.phone}
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {submitting ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <>إرسال الاستفسار</>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Copy Link Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Share2 size={18} className="text-orange-500" />
                مشاركة العقار
              </h3>
              <p className="text-sm text-gray-500 mb-3">انسخ الرابط لإرساله لأي شخص</p>
              <button onClick={copyLink}
                className="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                {copied ? "تم النسخ!" : "نسخ الرابط"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
