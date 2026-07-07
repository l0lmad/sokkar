"use client";

import { useState } from "react";
import { X, Save, Plus, Image, Video, MapPin, ExternalLink, User } from "lucide-react";
import type { Property } from "@/db/schema";

interface EditPropertyModalProps {
  property: Property;
  onClose: () => void;
  onSave: () => void;
}

const propertyTypes = [
  { value: "apartment", label: "شقة" },
  { value: "villa", label: "فيلا" },
  { value: "studio", label: "ستوديو" },
  { value: "office", label: "مكتب" },
  { value: "land", label: "أرض" },
  { value: "shop", label: "محل" },
];

const statusOptions = [
  { value: "available", label: "متاح" },
  { value: "sold", label: "تم البيع" },
  { value: "rented", label: "مؤجر" },
  { value: "pending", label: "قيد التفاوض" },
];

export default function EditPropertyModal({
  property,
  onClose,
  onSave,
}: EditPropertyModalProps) {
  const existingImages = property.images ? JSON.parse(property.images) : [];

  const [formData, setFormData] = useState({
    title: property.title,
    description: property.description || "",
    propertyType: property.propertyType,
    listingType: property.listingType,
    status: property.status,
    price: property.price,
    area: property.area?.toString() || "",
    bedrooms: property.bedrooms?.toString() || "",
    bathrooms: property.bathrooms?.toString() || "",
    floor: property.floor?.toString() || "",
    city: property.city,
    district: property.district || "",
    address: property.address || "",
    mapUrl: property.mapUrl || "",
    latitude: property.latitude || "",
    longitude: property.longitude || "",
    featured: property.featured || false,
    videoUrl: property.videoUrl || "",
    ownerName: property.ownerName || "",
    ownerPhone: property.ownerPhone || "",
    ownerWhatsapp: property.ownerWhatsapp || "",
  });

  const [images, setImages] = useState<string[]>(existingImages);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const target = e.target;
    const value =
      target instanceof HTMLInputElement && target.type === "checkbox"
        ? target.checked
        : target.value;
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
    setSubmitting(true);
    setError("");

    try {
      const body: Record<string, unknown> = {
        title: formData.title,
        description: formData.description || null,
        propertyType: formData.propertyType,
        listingType: formData.listingType,
        status: formData.status,
        price: formData.price,
        city: formData.city,
        district: formData.district || null,
        address: formData.address || null,
        mapUrl: formData.mapUrl || null,
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
        featured: formData.featured,
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

      const res = await fetch(`/api/properties/${property.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        onSave();
      } else {
        setError("حدث خطأ أثناء حفظ التعديلات");
      }
    } catch (err) {
      setError("حدث خطأ في الاتصال");
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-800">تعديل العقار</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1">
                عنوان العقار
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1">
                الوصف
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              />
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                نوع العقار
              </label>
              <select
                name="propertyType"
                value={formData.propertyType}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {propertyTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Listing Type */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                نوع العرض
              </label>
              <select
                name="listingType"
                value={formData.listingType}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="sale">للبيع</option>
                <option value="rent">للإيجار</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                الحالة
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {statusOptions.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                السعر (جنيه)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            {/* Area */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                المساحة (م²)
              </label>
              <input
                type="number"
                name="area"
                value={formData.area}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Bedrooms */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                غرف النوم
              </label>
              <input
                type="number"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Bathrooms */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                الحمامات
              </label>
              <input
                type="number"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Floor */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                الطابق
              </label>
              <input
                type="number"
                name="floor"
                value={formData.floor}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                المدينة
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            {/* District */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                الحي
              </label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1">
                العنوان التفصيلي
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Google Maps URL */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                <MapPin size={16} />
                رابط الموقع على Google Maps
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  name="mapUrl"
                  value={formData.mapUrl}
                  onChange={handleChange}
                  placeholder="https://maps.google.com/..."
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                {formData.mapUrl && (
                  <a
                    href={formData.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 flex items-center gap-1"
                  >
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                افتح Google Maps → اختر الموقع → انقر على مشاركة → انسخ الرابط
              </p>
            </div>

            {/* Latitude / Longitude */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                خط العرض (Latitude)
              </label>
              <input
                type="text"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="مثال: 30.0444"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                خط الطول (Longitude)
              </label>
              <input
                type="text"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="مثال: 31.2357"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
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
                      <img
                        src={img}
                        alt={`صورة ${i + 1}`}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="رابط الصورة (URL)"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  type="button"
                  onClick={addImage}
                  className="px-4 py-2.5 bg-orange-100 text-orange-600 rounded-xl hover:bg-orange-200 transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            {/* Video URL */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                <Video size={16} />
                رابط الفيديو
              </label>
              <input
                type="url"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleChange}
                placeholder="رابط فيديو YouTube أو رابط مباشر"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Featured */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <span className="font-medium text-gray-700">عقار مميز ⭐</span>
              </label>
            </div>

            {/* Owner Info */}
            <div className="md:col-span-2 border-t pt-6 mt-2">
              <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
                <User size={20} className="text-orange-500" />
                بيانات المالك (خاص بالإدارة)
              </h3>
              <p className="text-xs text-gray-400 mb-4">هذه البيانات لا تظهر للمشتري</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    اسم المالك
                  </label>
                  <input
                    type="text"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    رقم التليفون
                  </label>
                  <input
                    type="tel"
                    name="ownerPhone"
                    value={formData.ownerPhone}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    رقم واتساب
                  </label>
                  <input
                    type="tel"
                    name="ownerWhatsapp"
                    value={formData.ownerWhatsapp}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              ) : (
                <Save size={20} />
              )}
              حفظ التعديلات
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
