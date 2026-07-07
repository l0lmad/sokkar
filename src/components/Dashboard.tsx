"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  ShoppingCart,
  Key,
  TrendingUp,
  ArrowLeft,
} from "lucide-react";
import type { Property } from "@/db/schema";

interface Stats {
  totalProperties: number;
  forSale: number;
  forRent: number;
  available: number;
}

interface DashboardProps {
  isAdmin: boolean;
  onNavigate: (tab: string) => void;
  onViewProperty: (property: Property) => void;
}

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

export default function Dashboard({ isAdmin, onNavigate, onViewProperty }: DashboardProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/stats").then((res) => res.json()),
      fetch("/api/properties?featured=true").then((res) => res.json()),
    ])
      .then(([statsData, propertiesData]) => {
        setStats(statsData);
        setFeaturedProperties(propertiesData.slice(0, 6));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  const cards = isAdmin && stats
    ? [
        {
          title: "إجمالي العقارات",
          value: stats.totalProperties,
          icon: Building2,
          color: "from-blue-500 to-blue-600",
          tab: "properties",
        },
        {
          title: "للبيع",
          value: stats.forSale,
          icon: ShoppingCart,
          color: "from-emerald-500 to-emerald-600",
          tab: "properties",
        },
        {
          title: "للإيجار",
          value: stats.forRent,
          icon: Key,
          color: "from-purple-500 to-purple-600",
          tab: "properties",
        },
        {
          title: "متاح الآن",
          value: stats.available,
          icon: TrendingUp,
          color: "from-orange-500 to-pink-500",
          tab: "properties",
        },
      ]
    : [];

  return (
    <div>
      {/* Hero Section for Users */}
      {!isAdmin && (
        <div className="mb-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-10 left-10 text-9xl">🏠</div>
            <div className="absolute bottom-10 right-10 text-9xl">🏢</div>
          </div>
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-2">أهلاً بك في Sokkar</h1>
            <p className="text-xl text-white/90 mb-6">
              اكتشف أفضل العقارات للبيع والإيجار في مصر
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate("properties")}
                className="px-6 py-3 bg-white text-orange-600 font-bold rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                تصفح العقارات
                <ArrowLeft size={18} />
              </button>
              <button
                onClick={() => onNavigate("map")}
                className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-bold rounded-xl hover:bg-white/30 transition-colors"
              >
                عرض الخريطة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Stats Cards */}
      {isAdmin && (
        <>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">لوحة التحكم</h2>
            <p className="text-gray-500">نظرة عامة على العقارات</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <button
                  key={card.title}
                  onClick={() => onNavigate(card.tab)}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-lg transition-all text-right group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                    >
                      <Icon size={24} className="text-white" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-800">{card.value}</p>
                  <p className="text-gray-500 text-sm">{card.title}</p>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Featured Properties */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {isAdmin ? "العقارات المميزة" : "عقارات مميزة"}
          </h2>
          <p className="text-gray-500">أحدث العقارات المتاحة</p>
        </div>
        <button
          onClick={() => onNavigate("properties")}
          className="text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
        >
          عرض الكل
          <ArrowLeft size={16} />
        </button>
      </div>

      {featuredProperties.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <Building2 size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">لا توجد عقارات مميزة حالياً</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredProperties.map((property) => (
            <button
              key={property.id}
              onClick={() => onViewProperty(property)}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all text-right group"
            >
              <div className="relative h-40 bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center">
                {property.images ? (
                  <img
                    src={JSON.parse(property.images)[0]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-5xl group-hover:scale-110 transition-transform">
                    {typeIcons[property.propertyType] || "🏢"}
                  </span>
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      property.listingType === "sale"
                        ? "bg-emerald-500 text-white"
                        : "bg-purple-500 text-white"
                    }`}
                  >
                    {property.listingType === "sale" ? "للبيع" : "للإيجار"}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-800 truncate mb-1">
                  {property.title}
                </h3>
                <p className="text-gray-500 text-sm mb-2">
                  {property.district ? `${property.district}، ` : ""}
                  {property.city}
                </p>
                <p className="text-lg font-bold text-orange-600">
                  {formatPrice(property.price, property.listingType)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
