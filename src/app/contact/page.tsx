"use client";

import { useState } from "react";
import { Phone, MessageCircle, Clock, Send, CheckCircle, ArrowRight, Mail } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", phone: "", whatsapp: "", email: "", contactTime: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      setError("الاسم ورقم الهاتف مطلوبان");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const clientRes = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          whatsapp: formData.whatsapp || null,
          contactTime: formData.contactTime || null,
          clientType: "buyer",
        }),
      });
      const client = await clientRes.json();

      await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: client.id,
          message: formData.message || "استفسار عام",
        }),
      });

      setSubmitted(true);
    } catch {
      setError("حدث خطأ في الاتصال");
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors">
            <ArrowRight size={20} />
            <span className="font-medium">العودة للرئيسية</span>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-sm">🏠</span>
            </div>
            <span className="font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">Sokkar</span>
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">تواصل معنا</h1>
          <p className="text-gray-500">اترك استفسارك وسنواتصل بك في أقرب وقت</p>
        </div>

        {submitted ? (
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={48} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">تم إرسال رسالتك! ✅</h2>
            <p className="text-gray-500 mb-6">سنواتصل بك على رقم {formData.phone} في أقرب وقت</p>
            <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90">
              <ArrowRight size={20} />
              العودة للرئيسية
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">{error}</div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">الاسم *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange}
                  placeholder="اسمك الكامل"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">رقم الهاتف *</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                  placeholder="01012345678"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
                  <MessageCircle size={14} /> واتساب (اختياري)
                </label>
                <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange}
                  placeholder="01012345678"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
                  <Mail size={14} /> البريد الإلكتروني (اختياري)
                </label>
                <input type="email" name="email" value={formData.email} onChange={handleChange}
                  placeholder="example@email.com"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
                  <Clock size={14} /> وقت التواصل المناسب
                </label>
                <select name="contactTime" value={formData.contactTime} onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option value="">في أي وقت</option>
                  <option value="morning">الفترة الصباحية</option>
                  <option value="afternoon">الفترة الظهرية</option>
                  <option value="evening">الفترة المسائية</option>
                  <option value="night">الفترة الليلية</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">رسالتك</label>
                <textarea name="message" value={formData.message} onChange={handleChange}
                  rows={4} placeholder="اكتب استفسارك هنا..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" />
              </div>
            </div>

            <button type="submit" disabled={submitting || !formData.name || !formData.phone}
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {submitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              ) : (
                <><Send size={20} />إرسال</>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
