"use client";

import { useState } from "react";
import { User, Phone, LogIn, UserPlus, Lock, Eye, EyeOff } from "lucide-react";

interface AuthScreenProps {
  onLogin: (user: {
    id: number;
    name: string;
    email: string | null;
    phone: string;
    isAdmin: boolean;
  }) => void;
}

export default function AuthScreen({ onLogin }: AuthScreenProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "register") {
        if (!formData.name || !formData.phone || !formData.password) {
          setError("الاسم ورقم الهاتف وكلمة المرور مطلوبة");
          setLoading(false);
          return;
        }

        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await res.json();

        if (res.ok) {
          localStorage.setItem("sokkar_user", JSON.stringify(data));
          onLogin(data);
        } else {
          setError(data.error || "حدث خطأ في التسجيل");
        }
      } else {
        if (!formData.phone || !formData.password) {
          setError("رقم الهاتف وكلمة المرور مطلوبان");
          setLoading(false);
          return;
        }

        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: formData.phone, password: formData.password }),
        });

        const data = await res.json();

        if (res.ok) {
          localStorage.setItem("sokkar_user", JSON.stringify(data));
          onLogin(data);
        } else {
          setError(data.error || "حدث خطأ في تسجيل الدخول");
        }
      }
    } catch (err) {
      setError("حدث خطأ في الاتصال");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto shadow-2xl mb-4">
            <span className="text-4xl">🏠</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
            Sokkar
          </h1>
          <p className="text-gray-400 mt-2">سوق العقارات</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10">
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            {mode === "login" ? "تسجيل الدخول" : "إنشاء حساب جديد"}
          </h2>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 mb-4 text-red-300 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  الاسم الكامل
                </label>
                <div className="relative">
                  <User
                    size={18}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="أدخل اسمك"
                    className="w-full pr-10 pl-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-gray-300 text-sm mb-2">
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
                  placeholder="01012345678"
                  className="w-full pr-10 pl-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 text-sm mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pr-10 pl-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              ) : mode === "login" ? (
                <>
                  <LogIn size={20} />
                  دخول
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  إنشاء حساب
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError("");
                setFormData({ name: "", phone: "", password: "" });
              }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {mode === "login" ? (
                <>
                  ليس لديك حساب؟{" "}
                  <span className="text-orange-400">سجل الآن</span>
                </>
              ) : (
                <>
                  لديك حساب بالفعل؟{" "}
                  <span className="text-orange-400">سجل دخول</span>
                </>
              )}
            </button>
          </div>
        </div>

        <p className="text-gray-500 text-xs text-center mt-6">
          © 2025 Sokkar - جميع الحقوق محفوظة
        </p>
      </div>
    </div>
  );
}
