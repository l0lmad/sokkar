"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle, XCircle, Clock, Building2, Phone, Image as ImageIcon, Video, ExternalLink } from "lucide-react";
import type { Property } from "@/db/schema";

const typeLabels: Record<string, string> = {
  apartment: "شقة", villa: "فيلا", studio: "ستوديو", office: "مكتب", land: "أرض", shop: "محل",
};

function formatPrice(price: string | number, listingType: string): string {
  const num = typeof price === "string" ? parseFloat(price) : price;
  if (listingType === "rent") return `${num.toLocaleString("ar-EG")} جنيه/شهر`;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)} مليون جنيه`;
  return `${num.toLocaleString("ar-EG")} جنيه`;
}

export default function PendingApprovals() {
  const [pending, setPending] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchPending = useCallback(async () => {
    try {
      const res = await fetch("/api/properties?pending=true&all=true");
      const data = await res.json();
      setPending(data);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPending();
    const interval = setInterval(fetchPending, 10000);
    return () => clearInterval(interval);
  }, [fetchPending]);

  const handleApprove = async (id: number) => {
    setActionLoading(id);
    try {
      await fetch(`/api/properties/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });
      setPending((prev) => prev.filter((p) => p.id !== id));
    } catch {}
    setActionLoading(null);
  };

  const handleReject = async (id: number) => {
    if (!confirm("هل أنت متأكد من رفض هذا العقار؟")) return;
    setActionLoading(id);
    try {
      await fetch(`/api/properties/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject" }),
      });
      setPending((prev) => prev.filter((p) => p.id !== id));
    } catch {}
    setActionLoading(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3 mb-6">
        <Clock className="text-orange-500" />
        طلبات إضافة عقارات
        {pending.length > 0 && (
          <span className="text-sm bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-medium">
            {pending.length} طلب{pending.length > 1 ? "" : ""}
          </span>
        )}
      </h2>

      {pending.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <CheckCircle size={48} className="mx-auto text-green-300 mb-3" />
          <p className="text-gray-500">لا توجد طلبات معلقة</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map((property) => {
            const images = property.images ? JSON.parse(property.images) : [];
            return (
              <div key={property.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {images.length > 0 && (
                      <img src={images[0]} alt="" className="w-24 h-24 object-cover rounded-xl shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-gray-800 text-lg">{property.title}</h3>
                          <p className="text-sm text-gray-500">{property.district || ""} {property.city}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${
                          property.listingType === "sale" ? "bg-emerald-100 text-emerald-700" : "bg-purple-100 text-purple-700"
                        }`}>
                          {property.listingType === "sale" ? "للبيع" : "للإيجار"}
                        </span>
                      </div>

                      <p className="text-xl font-bold text-orange-500 mt-1">
                        {formatPrice(property.price, property.listingType)}
                      </p>

                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                        <span>{typeLabels[property.propertyType]}</span>
                        {property.area && <span>{property.area} م²</span>}
                        {property.bedrooms ? <span>{property.bedrooms} غرف</span> : null}
                        {property.bathrooms ? <span>{property.bathrooms} حمامات</span> : null}
                      </div>

                      {property.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{property.description}</p>
                      )}

                      {/* Owner Contact */}
                      {(property.ownerName || property.ownerPhone) && (
                        <div className="mt-3 p-3 bg-amber-50 rounded-xl text-sm">
                          <p className="font-medium text-amber-800">بيانات مقدم الطلب:</p>
                          {property.ownerName && <p className="text-amber-700">الاسم: {property.ownerName}</p>}
                          {property.ownerPhone && (
                            <p className="text-amber-700 flex items-center gap-1">
                              <Phone size={14} />
                              <span dir="ltr">{property.ownerPhone}</span>
                            </p>
                          )}
                        </div>
                      )}

                      {property.mapUrl && (
                        <a href={property.mapUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:text-blue-700">
                          <ExternalLink size={14} /> عرض الموقع
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleApprove(property.id)}
                      disabled={actionLoading === property.id}
                      className="flex-1 py-2.5 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {actionLoading === property.id ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <><CheckCircle size={18} />موافقة</>
                      )}
                    </button>
                    <button
                      onClick={() => handleReject(property.id)}
                      disabled={actionLoading === property.id}
                      className="flex-1 py-2.5 bg-red-100 text-red-600 font-bold rounded-xl hover:bg-red-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <XCircle size={18} />رفض
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
