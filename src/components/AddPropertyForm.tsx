"use client";

import { useState } from "react";
import { PlusCircle, CheckCircle, MapPin, Image, Video, X, Plus, ExternalLink, User, Globe } from "lucide-react";

const propertyTypes = [
  { value: "apartment", label: "شقة" },
  { value: "villa", label: "فيلا" },
  { value: "studio", label: "ستوديو" },
  { value: "office", label: "مكتب" },
  { value: "land", label: "أرض" },
  { value: "shop", label: "محل" },
];

const cities = ["القاهرة", "الجيزة", "الإسكندرية"];

export default function AddPropertyForm({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
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
    latitude: "",
    longitude: "",
    featured: false,
    videoUrl: "",
    ownerName: "",
    ownerPhone: "",
    ownerWhatsapp: "",
  });

  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
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

      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setSuccess(true);
        setFormData({
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
          latitude: "",
          longitude: "",
          featured: false,
          videoUrl: "",
          ownerName: "",
          ownerPhone: "",
          ownerWhatsapp: "",
        });
        setImages([]);
        setTimeout(() => {
          setSuccess(false);
          onSuccess?.();
        }, 2000);
      } else {
        setError("حدث خطأ أثناء إضافة العقار");
      }
    } catch (err) {
      setError("حدث خطأ في الاتصال");
    }
    setSubmitting(false);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <PlusCircle className="text-orange-500" />
          إضافة عقار جديد
        </h2>
        <p className="text-gray-500 mt-1">أضف عقار جديد إلى قاعدة البيانات</p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <CheckCircle className="text-green-500" />
          <span className="text-green-700 font-medium">
            تم إضافة العقار بنجاح!
          </span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <span className="text-red-700">{error}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Title */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              عنوان العقار *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="مثال: شقة فاخرة في التجمع الخامس"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              الوصف
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="وصف تفصيلي للعقار..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
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
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                type="button"
                onClick={addImage}
                className="px-4 py-3 bg-orange-100 text-orange-600 rounded-xl hover:bg-orange-200 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              أضف روابط صور من الإنترنت
            </p>
          </div>

          {/* Video URL */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <Video size={16} />
              رابط الفيديو
            </label>
            <input
              type="url"
              name="videoUrl"
              value={formData.videoUrl}
              onChange={handleChange}
              placeholder="رابط فيديو YouTube أو رابط مباشر"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              نوع العقار
            </label>
            <select
              name="propertyType"
              value={formData.propertyType}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
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
            <label className="block text-sm font-bold text-gray-700 mb-2">
              نوع العرض
            </label>
            <select
              name="listingType"
              value={formData.listingType}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="sale">للبيع</option>
              <option value="rent">للإيجار</option>
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              السعر (جنيه) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="مثال: 2500000"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          {/* Area */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              المساحة (م²)
            </label>
            <input
              type="number"
              name="area"
              value={formData.area}
              onChange={handleChange}
              placeholder="مثال: 200"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Bedrooms */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              غرف النوم
            </label>
            <input
              type="number"
              name="bedrooms"
              value={formData.bedrooms}
              onChange={handleChange}
              placeholder="3"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Bathrooms */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              الحمامات
            </label>
            <input
              type="number"
              name="bathrooms"
              value={formData.bathrooms}
              onChange={handleChange}
              placeholder="2"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Floor */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              الطابق
            </label>
            <input
              type="number"
              name="floor"
              value={formData.floor}
              onChange={handleChange}
              placeholder="5"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              المدينة *
            </label>
            <select
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* District */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              الحي / المنطقة
            </label>
            <input
              type="text"
              name="district"
              value={formData.district}
              onChange={handleChange}
              placeholder="التجمع الخامس"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              العنوان التفصيلي
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="شارع التسعين، التجمع الخامس"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Google Maps URL */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
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
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {formData.mapUrl && (
                <a
                  href={formData.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 flex items-center gap-1"
                >
                  <ExternalLink size={18} />
                </a>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              افتح Google Maps ← حدد موقع العقار ← انقر على مشاركة ← انسخ الرابط
            </p>
          </div>

          {/* Latitude / Longitude */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              خط العرض (Latitude)
            </label>
            <input
              type="text"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              placeholder="مثال: 30.0444"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              خط الطول (Longitude)
            </label>
            <input
              type="text"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              placeholder="مثال: 31.2357"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
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

          {/* Owner Info - Hidden from buyers */}
          <div className="md:col-span-2 border-t pt-6 mt-2">
            <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
              <User size={20} className="text-orange-500" />
              بيانات المالك (لن تظهر للمشتري)
            </h3>
            <p className="text-xs text-gray-400 mb-4">هذه البيانات خاصة بالإدارة فقط</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  اسم المالك
                </label>
                <input
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  placeholder="اسم صاحب العقار"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  رقم التليفون
                </label>
                <input
                  type="tel"
                  name="ownerPhone"
                  value={formData.ownerPhone}
                  onChange={handleChange}
                  placeholder="01012345678"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  رقم واتساب
                </label>
                <input
                  type="tel"
                  name="ownerWhatsapp"
                  value={formData.ownerWhatsapp}
                  onChange={handleChange}
                  placeholder="01012345678"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full py-3.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              جاري الإضافة...
            </>
          ) : (
            <>
              <PlusCircle size={20} />
              إضافة العقار
            </>
          )}
        </button>
      </form>
    </div>
  );
}
