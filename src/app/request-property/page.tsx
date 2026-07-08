"use client";

import { useState, useRef } from "react";
import { PlusCircle, CheckCircle, X, Plus, Upload, Image, Video, MapPin, User, ArrowRight } from "lucide-react";
import Link from "next/link";

const propertyTypes = [
  { value: "apartment", label: "شقة" },
  { value: "villa", label: "فيلا" },
  { value: "studio", label: "ستوديو" },
  { value: "office", label: "مكتب" },
  { value: "land", label: "أرض" },
  { value: "shop", label: "محل" },
];

const cities = ["القاهرة", "الجيزة", "الإسكندرية"];

export default function RequestPropertyPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    propertyType: "apartment",
    listingType: "sale",
    price: "",
    area: "",
    bedrooms: "",
    bathrooms: "",
    floor: "",
    city: "القاهرة",
    district: "",
    address: "",
    mapUrl: "",
    videoUrl: "",
    ownerName: "",
    ownerPhone: "",
    ownerWhatsapp: "",
  });
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target;
    const value = target instanceof HTMLInputElement && target.type === "checkbox" ? target.checked : target.value;
    setFormData({ ...formData, [target.name]: value });
  };

  const addImage = () => {
    if (newImageUrl.trim()) {
      setImages([...images, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.price) {
      setError("يرجى ملء الحقول المطلوبة");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const body: Record<string, unknown> = {
        title: formData.title,
        description: formData.description || null,
        propertyType: formData.propertyType,
        listingType: formData.listingType,
        price: formData.price,
        city: formData.city,
        district: formData.district || null,
        address: formData.address || null,
        mapUrl: formData.mapUrl || null,
        featured: false,
        isApproved: false,
        status: "pending",
        images: images.length > 0 ? JSON.stringify(images) : null,
        videoUrl: formData.videoUrl || null,
        ownerName: formData.ownerName || null,
        ownerPhone: formData.ownerPhone || null,
        ownerWhatsapp: formData.ownerWhatsapp || null,
      };

      if (formData.area) body.area = parseInt(formData.area);
      if (formData.bedrooms) body.bedrooms = parseInt(formData.bedrooms);
      if (formData.bathrooms) body.bathrooms = parseInt(formData.bathrooms);
      if (formData.floor) body.floor = parseInt(formData.floor);

      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setSuccess(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const data = await res.json();
        setError(data.error || "حدث خطأ أثناء إرسال الطلب");
      }
    } catch {
      setError("حدث خطأ في الاتصال");
    }
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white rounded-3xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} className="text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">تم إرسال طلبك بنجاح! 🎉</h1>
          <p className="text-gray-500 mb-6">سيتم مراجعة طلبك من قبل الإدارة والرد عليك في أقرب وقت</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity">
            <ArrowRight size={20} />
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors">
            <ArrowRight size={20} />
            <span className="font-medium">العودة</span>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-sm">🏠</span>
            </div>
            <span className="font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">Sokkar</span>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <PlusCircle className="text-orange-500" />
            طلب إضافة عقار
          </h1>
          <p className="text-gray-500 mt-1">املأ البيانات وسيتم مراجعة طلبك من الإدارة</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <span className="text-red-700">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">عنوان العقار *</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange}
                placeholder="مثال: شقة فاخرة في التجمع الخامس"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" required />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">الوصف</label>
              <textarea name="description" value={formData.description} onChange={handleChange}
                rows={3} placeholder="وصف تفصيلي للعقار..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" />
            </div>

            {/* Images */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Image size={16} />
                صور العقار
              </label>

              {images.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {images.map((img, i) => (
                    <div key={i} className="relative group">
                      <img src={img} alt={`صورة ${i + 1}`} className="w-20 h-20 object-cover rounded-lg" />
                      <button type="button" onClick={() => removeImage(i)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2 mb-2">
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-4 py-3 bg-orange-100 text-orange-600 rounded-xl hover:bg-orange-200 transition-colors flex items-center gap-2">
                  {uploading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-orange-500 border-t-transparent"></div>
                  ) : (
                    <Upload size={20} />
                  )}
                  رفع صور
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    setUploading(true);
                    for (const file of files) {
                      const fd = new FormData();
                      fd.append("file", file);
                      try {
                        const res = await fetch("/api/upload", { method: "POST", body: fd });
                        const data = await res.json();
                        if (data.url) setImages((prev) => [...prev, data.url]);
                      } catch {}
                    }
                    setUploading(false);
                    if (e.target) e.target.value = "";
                  }} />
                <input type="url" placeholder="أو رابط صورة" value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <button type="button" onClick={addImage}
                  className="px-4 py-3 bg-orange-100 text-orange-600 rounded-xl hover:bg-orange-200 transition-colors">
                  <Plus size={20} />
                </button>
              </div>
            </div>

            {/* Video */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Video size={16} />
                فيديو العقار
              </label>
              <input type="url" name="videoUrl" value={formData.videoUrl} onChange={handleChange}
                placeholder="رابط فيديو YouTube"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">نوع العقار</label>
              <select name="propertyType" value={formData.propertyType} onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500">
                {propertyTypes.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">نوع العرض</label>
              <select name="listingType" value={formData.listingType} onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="sale">للبيع</option>
                <option value="rent">للإيجار</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">السعر (جنيه) *</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange}
                placeholder="مثال: 2500000"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" required />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">المساحة (م²)</label>
              <input type="number" name="area" value={formData.area} onChange={handleChange}
                placeholder="200"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">غرف النوم</label>
              <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange}
                placeholder="3"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">الحمامات</label>
              <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange}
                placeholder="2"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">الطابق</label>
              <input type="number" name="floor" value={formData.floor} onChange={handleChange}
                placeholder="5"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">المدينة *</label>
              <select name="city" value={formData.city} onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500">
                {cities.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">الحي / المنطقة</label>
              <input type="text" name="district" value={formData.district} onChange={handleChange}
                placeholder="التجمع الخامس"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">العنوان التفصيلي</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange}
                placeholder="شارع التسعين، التجمع الخامس"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <MapPin size={16} />
                رابط الموقع على Google Maps
              </label>
              <input type="url" name="mapUrl" value={formData.mapUrl} onChange={handleChange}
                placeholder="https://maps.google.com/..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>

            {/* Owner Info */}
            <div className="md:col-span-2 border-t pt-6 mt-2">
              <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
                <User size={20} className="text-orange-500" />
                بيانات التواصل
              </h3>
              <p className="text-xs text-gray-400 mb-4">للتواصل معك بخصوص الطلب</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">الاسم</label>
                  <input type="text" name="ownerName" value={formData.ownerName} onChange={handleChange}
                    placeholder="اسمك"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">رقم التليفون</label>
                  <input type="tel" name="ownerPhone" value={formData.ownerPhone} onChange={handleChange}
                    placeholder="01012345678"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">رقم واتساب</label>
                  <input type="tel" name="ownerWhatsapp" value={formData.ownerWhatsapp} onChange={handleChange}
                    placeholder="01012345678"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
              </div>
            </div>
          </div>

          <button type="submit" disabled={submitting}
            className="mt-6 w-full py-3.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            ) : (
              <><PlusCircle size={20} />إرسال طلب الإضافة</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
