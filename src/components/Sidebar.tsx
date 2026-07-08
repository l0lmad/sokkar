"use client";

import { useState, useEffect } from "react";
import {
  Home,
  Building2,
  MapPin,
  PlusCircle,
  Menu,
  X,
  LogOut,
  Settings,
  MessageSquare,
  Clock,
} from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string | null;
  phone: string;
  isAdmin: boolean;
}

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  user: User;
  onLogout: () => void;
}

export default function Sidebar({ activeTab, onTabChange, user, onLogout }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [newInquiriesCount, setNewInquiriesCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSeenInquiries, setLastSeenInquiries] = useState(0);
  const [lastSeenPending, setLastSeenPending] = useState(0);

  useEffect(() => {
    if (!user.isAdmin) return;
    const fetchCount = async () => {
      try {
        const res = await fetch("/api/inquiries?status=new");
        const data = await res.json();
        const count = Array.isArray(data) ? data.length : 0;
        setNewInquiriesCount(count);
      } catch {}
      try {
        const res = await fetch("/api/properties?pending=true&all=true");
        const data = await res.json();
        const count = Array.isArray(data) ? data.length : 0;
        setPendingCount(count);
      } catch {}
    };
    fetchCount();
    const interval = setInterval(fetchCount, 10000);
    return () => clearInterval(interval);
  }, [user.isAdmin]);

  const handleTabClick = (tabId: string) => {
    if (tabId === "inquiries") setLastSeenInquiries(newInquiriesCount);
    if (tabId === "pending-approvals") setLastSeenPending(pendingCount);
    onTabChange(tabId);
    setMobileOpen(false);
  };

  const unseenInquiries = Math.max(0, newInquiriesCount - lastSeenInquiries);
  const unseenPending = Math.max(0, pendingCount - lastSeenPending);

  const menuItems = user.isAdmin
    ? [
        { id: "dashboard", label: "لوحة التحكم", icon: Home },
        { id: "properties", label: "العقارات", icon: Building2 },
        { id: "map", label: "خريطة العقارات", icon: MapPin },
        { id: "add-property", label: "إضافة عقار", icon: PlusCircle },
        { id: "pending-approvals", label: "طلبات الإضافة", icon: Clock, badge: unseenPending },
        { id: "inquiries", label: "الاستفسارات", icon: MessageSquare, badge: unseenInquiries },
        { id: "settings", label: "الإعدادات", icon: Settings },
      ]
    : [
        { id: "dashboard", label: "الرئيسية", icon: Home },
        { id: "properties", label: "تصفح العقارات", icon: Building2 },
        { id: "map", label: "خريطة العقارات", icon: MapPin },
      ];

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 bg-gradient-to-r from-orange-500 to-pink-500 text-white p-2 rounded-lg shadow-lg"
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full w-72 bg-gradient-to-b from-gray-900 to-gray-800 text-white z-40 transform transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🏠</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                Sokkar
              </h1>
              <p className="text-gray-400 text-xs">سوق العقارات</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-700">
          <div className="bg-gray-800/50 rounded-xl p-3">
            <p className="font-bold text-white truncate">{user.name}</p>
            <p className="text-gray-400 text-xs truncate" dir="ltr">{user.phone}</p>
            {user.isAdmin && (
              <span className="inline-block mt-2 px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full">
                مدير النظام
              </span>
            )}
          </div>
        </div>

        {/* Menu */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg"
                    : "text-gray-400 hover:bg-gray-700/50 hover:text-white"
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
                {(item as { badge?: number }).badge ? (
                  <span className="mr-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                    {(item as { badge: number }).badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-3 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut size={18} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>
    </>
  );
}
