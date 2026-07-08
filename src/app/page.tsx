"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import NextDynamic from "next/dynamic";
import AuthScreen from "@/components/AuthScreen";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import PropertiesList from "@/components/PropertiesList";
import AddPropertyForm from "@/components/AddPropertyForm";
import PropertyDetail from "@/components/PropertyDetail";
import PendingApprovals from "@/components/PendingApprovals";
import type { Property } from "@/db/schema";
import {
  Settings,
  MessageSquare,
  Building2,
  User,
  Lock,
  Phone,
  MessageCircle,
  Clock,
  Save,
  CheckCircle,
  Eye,
  EyeOff,
  Shield,
  UserPlus,
  ExternalLink,
  Users,
  Search,
  Trash2,
  Mail,
} from "lucide-react";

const MapView = NextDynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
    </div>
  ),
});

interface User {
  id: number;
  name: string;
  email: string | null;
  phone: string;
  isAdmin: boolean;
}

function SettingsPage({
  user,
  onUserUpdate,
}: {
  user: User;
  onUserUpdate: (user: User) => void;
}) {
  const [formData, setFormData] = useState({
    name: user.name,
    phone: user.phone,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSaveProfile = async () => {
    if (!formData.name || !formData.phone) {
      setError("الاسم ورقم الهاتف مطلوبان");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/auth/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          name: formData.name,
          phone: formData.phone,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        onUserUpdate(data);
        localStorage.setItem("sokkar_user", JSON.stringify(data));
        setSuccess("تم حفظ التعديلات بنجاح");
      } else {
        setError(data.error || "حدث خطأ");
      }
    } catch (err) {
      setError("حدث خطأ في الاتصال");
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (!formData.currentPassword) {
      setError("كلمة المرور الحالية مطلوبة");
      return;
    }
    if (!formData.newPassword) {
      setError("كلمة المرور الجديدة مطلوبة");
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError("كلمة المرور الجديدة غير متطابقة");
      return;
    }
    if (formData.newPassword.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/auth/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("تم تغيير كلمة المرور بنجاح");
        setFormData({
          ...formData,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setError(data.error || "حدث خطأ");
      }
    } catch (err) {
      setError("حدث خطأ في الاتصال");
    }
    setSaving(false);
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3 mb-6">
        <Settings className="text-orange-500" />
        الإعدادات
      </h2>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <CheckCircle className="text-green-500" />
          <span className="text-green-700 font-medium">{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <span className="text-red-700">{error}</span>
        </div>
      )}

      <div className="grid gap-6 max-w-2xl">
        {/* Profile Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <User size={20} />
            البيانات الشخصية
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                الاسم
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={user.email || ""}
                disabled
                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">
                البريد الإلكتروني (اختياري)
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                رقم الهاتف
              </label>
              <div className="relative">
                <Phone
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              ) : (
                <Save size={20} />
              )}
              حفظ التعديلات
            </button>
          </div>
        </div>

        {/* Password Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Lock size={20} />
            تغيير كلمة المرور
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                كلمة المرور الحالية
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pr-10 pl-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                كلمة المرور الجديدة
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pr-10 pl-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                تأكيد كلمة المرور الجديدة
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <button
              onClick={handleChangePassword}
              disabled={saving}
              className="w-full py-3 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-900 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              ) : (
                <Lock size={20} />
              )}
              تغيير كلمة المرور
            </button>
          </div>
        </div>

        {/* Admin Section - Create Admin Accounts */}
        {user.isAdmin && (
          <AdminAccountsSection />
        )}
      </div>
    </div>
  );
}

function AdminAccountsSection() {
  const [formData, setFormData] = useState({ name: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.phone || !formData.password) {
      setError("جميع الحقول مطلوبة");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, isAdmin: true }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(`تم إنشاء حساب المدير "${formData.name}" بنجاح`);
        setFormData({ name: "", phone: "", password: "" });
      } else {
        setError(data.error || "حدث خطأ");
      }
    } catch {
      setError("حدث خطأ في الاتصال");
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Shield size={20} className="text-orange-500" />
        إنشاء حساب مدير جديد
      </h3>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 flex items-center gap-3">
          <CheckCircle className="text-green-500" />
          <span className="text-green-700 font-medium">{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <span className="text-red-700">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">الاسم</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="اسم المدير"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">رقم الهاتف</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="01012345678"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">كلمة المرور</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      <button
        onClick={handleCreate}
        disabled={loading}
        className="mt-4 py-3 px-6 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
        ) : (
          <UserPlus size={20} />
        )}
        إنشاء حساب مدير
      </button>
    </div>
  );
}

function InquiriesPage() {
  const [inquiries, setInquiries] = useState<
    Array<{
      inquiry: {
        id: number;
        message: string | null;
        status: string;
        createdAt: string | null;
      };
      property: { id: number; title: string; city: string } | null;
      client: { id: number; name: string; phone: string; whatsapp: string | null; contactTime: string | null; } | null;
    }>
  >([]);
  const [loading, setLoading] = useState(true);

  const fetchInquiries = useCallback(async () => {
    try {
      const res = await fetch("/api/inquiries");
      const data = await res.json();
      setInquiries(data);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInquiries();
    const interval = setInterval(fetchInquiries, 10000);
    return () => clearInterval(interval);
  }, [fetchInquiries]);

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
        <MessageSquare className="text-orange-500" />
        استفسارات العملاء
      </h2>

      {inquiries.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <MessageSquare size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">لا توجد استفسارات بعد</p>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map(({ inquiry, property, client }) => (
            <div
              key={inquiry.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-gray-800">
                    {client?.name || "عميل"}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Phone size={14} />
                    <span dir="ltr">{client?.phone}</span>
                  </p>
                  {client?.whatsapp && (
                    <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                      <MessageCircle size={14} />
                      <span dir="ltr">{client.whatsapp}</span>
                    </p>
                  )}
                  {client?.contactTime && (
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Clock size={12} />
                      <span>
                        {client.contactTime === "morning" ? "الفترة الصباحية" :
                         client.contactTime === "afternoon" ? "الفترة الظهرية" :
                         client.contactTime === "evening" ? "الفترة المسائية" :
                         client.contactTime === "night" ? "الفترة الليلية" : client.contactTime}
                      </span>
                    </p>
                  )}
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    inquiry.status === "new"
                      ? "bg-amber-100 text-amber-700"
                      : inquiry.status === "contacted"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {inquiry.status === "new"
                    ? "جديد"
                    : inquiry.status === "contacted"
                    ? "تم التواصل"
                    : "مغلق"}
                </span>
              </div>
              {property && (
                <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600">
                    <Building2 size={14} className="inline ml-1" />
                    {property.title} - {property.city}
                  </p>
                </div>
              )}
              {inquiry.message && (
                <p className="mt-3 text-gray-600 text-sm">{inquiry.message}</p>
              )}
              {inquiry.createdAt && (
                <p className="mt-2 text-xs text-gray-400">
                  {new Date(inquiry.createdAt).toLocaleDateString("ar-EG", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ClientsPage() {
  const [clients, setClients] = useState<Array<{
    id: number;
    name: string;
    email: string | null;
    phone: string;
    whatsapp: string | null;
    contactTime: string | null;
    clientType: string;
    notes: string | null;
    city: string | null;
    budget: string | null;
    createdAt: string | null;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter) params.append("clientType", typeFilter);
      if (search) params.append("search", search);
      const res = await fetch(`/api/clients?${params.toString()}`);
      const data = await res.json();
      setClients(data);
    } catch {}
    setLoading(false);
  }, [typeFilter, search]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا العميل?")) return;
    try {
      await fetch(`/api/clients/${id}`, { method: "DELETE" });
      fetchClients();
    } catch {}
  };

  const contactTimeLabel = (t: string | null) => {
    if (!t) return "";
    return {
      morning: "الفترة الصباحية",
      afternoon: "الفترة الظهرية",
      evening: "الفترة المسائية",
      night: "الفترة الليلية",
    }[t] || t;
  };

  const typeLabel = (t: string) => {
    return {
      buyer: "مشتري",
      seller: "بائع",
      tenant: "مستأجر",
    }[t] || t;
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3 mb-6">
        <Users className="text-orange-500" />
        العملاء
      </h2>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن عميل..."
              className="w-full pr-10 pl-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">كل الأنواع</option>
            <option value="buyer">مشتري</option>
            <option value="seller">بائع</option>
            <option value="tenant">مستأجر</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Users size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">لا يوجد عملاء بعد</p>
        </div>
      ) : (
        <div className="space-y-4">
          {clients.map((client) => (
            <div key={client.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-gray-800">{client.name}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <Phone size={14} />
                    <span dir="ltr">{client.phone}</span>
                  </p>
                  {client.whatsapp && (
                    <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                      <MessageCircle size={14} />
                      <span dir="ltr">{client.whatsapp}</span>
                    </p>
                  )}
                  {client.email && (
                    <p className="text-sm text-blue-600 flex items-center gap-1 mt-1">
                      <Mail size={14} />
                      <span>{client.email}</span>
                    </p>
                  )}
                  {client.city && (
                    <p className="text-xs text-gray-400 mt-1">📍 {client.city}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                    {typeLabel(client.clientType)}
                  </span>
                  <button
                    onClick={() => handleDelete(client.id)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              {client.contactTime && (
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-2">
                  <Clock size={12} />
                  {contactTimeLabel(client.contactTime)}
                </p>
              )}
              {client.notes && (
                <p className="mt-2 text-sm text-gray-600 bg-gray-50 rounded-xl p-3">{client.notes}</p>
              )}
              {client.budget && (
                <p className="mt-2 text-sm text-orange-600 font-bold">
                  الميزانية: {parseFloat(client.budget).toLocaleString("ar-EG")} جنيه
                </p>
              )}
              {client.createdAt && (
                <p className="mt-2 text-xs text-gray-400">
                  {new Date(client.createdAt).toLocaleDateString("ar-EG", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );

  useEffect(() => {
    const saved = localStorage.getItem("sokkar_user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {}
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("sokkar_user");
    setUser(null);
    setActiveTab("dashboard");
  };

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard
            isAdmin={user.isAdmin}
            onNavigate={setActiveTab}
            onViewProperty={setSelectedProperty}
          />
        );
      case "properties":
        return (
          <PropertiesList
            isAdmin={user.isAdmin}
            userName={user.name}
            userPhone={user.phone}
          />
        );
      case "map":
        return <MapView userName={user.name} userPhone={user.phone} isAdmin={user.isAdmin} />;
      case "add-property":
        return user.isAdmin ? (
          <AddPropertyForm onSuccess={() => setActiveTab("properties")} />
        ) : null;
      case "pending-approvals":
        return user.isAdmin ? <PendingApprovals /> : null;
      case "settings":
        return <SettingsPage user={user} onUserUpdate={handleUserUpdate} />;
      case "inquiries":
        return user.isAdmin ? <InquiriesPage /> : null;
      case "clients":
        return user.isAdmin ? <ClientsPage /> : null;
      default:
        return (
          <Dashboard
            isAdmin={user.isAdmin}
            onNavigate={setActiveTab}
            onViewProperty={setSelectedProperty}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />

      <main className="lg:mr-72 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">{renderContent()}</div>
      </main>

      {selectedProperty && (
        <PropertyDetail
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onDelete={() => setSelectedProperty(null)}
          userName={user.name}
          userPhone={user.phone}
          isAdmin={user.isAdmin}
        />
      )}
    </div>
  );
}
