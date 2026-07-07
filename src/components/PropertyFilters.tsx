"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";

interface Filters {
  search: string;
  city: string;
  propertyType: string;
  listingType: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  minArea: string;
  maxArea: string;
}

interface PropertyFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
}

const cities = ["القاهرة", "الجيزة", "الإسكندرية"];
const propertyTypes = [
  { value: "apartment", label: "شقة" },
  { value: "villa", label: "فيلا" },
  { value: "studio", label: "ستوديو" },
  { value: "office", label: "مكتب" },
  { value: "land", label: "أرض" },
  { value: "shop", label: "محل" },
];

export default function PropertyFilters({
  filters,
  onFilterChange,
  showFilters,
  onToggleFilters,
}: PropertyFiltersProps) {
  const update = (key: keyof Filters, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      search: "",
      city: "",
      propertyType: "",
      listingType: "",
      minPrice: "",
      maxPrice: "",
      bedrooms: "",
      minArea: "",
      maxArea: "",
    });
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search
            size={20}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="ابحث عن عقار..."
            value={filters.search}
            onChange={(e) => update("search", e.target.value)}
            className="w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={onToggleFilters}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
            showFilters
              ? "bg-orange-50 border-orange-300 text-orange-600"
              : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
          }`}
        >
          <SlidersHorizontal size={20} />
          <span className="hidden sm:inline">فلترة</span>
        </button>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-all"
          >
            <X size={20} />
            <span className="hidden sm:inline">مسح</span>
          </button>
        )}
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              نوع العرض
            </label>
            <select
              value={filters.listingType}
              onChange={(e) => update("listingType", e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">الكل</option>
              <option value="sale">للبيع</option>
              <option value="rent">للإيجار</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              نوع العقار
            </label>
            <select
              value={filters.propertyType}
              onChange={(e) => update("propertyType", e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">الكل</option>
              {propertyTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              المدينة
            </label>
            <select
              value={filters.city}
              onChange={(e) => update("city", e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">الكل</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              غرف النوم
            </label>
            <select
              value={filters.bedrooms}
              onChange={(e) => update("bedrooms", e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">الكل</option>
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n.toString()}>
                  {n === 0 ? "بدون" : n}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              أقل سعر
            </label>
            <input
              type="number"
              placeholder="0"
              value={filters.minPrice}
              onChange={(e) => update("minPrice", e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              أعلى سعر
            </label>
            <input
              type="number"
              placeholder="بدون حد"
              value={filters.maxPrice}
              onChange={(e) => update("maxPrice", e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              أقل مساحة (م²)
            </label>
            <input
              type="number"
              placeholder="0"
              value={filters.minArea}
              onChange={(e) => update("minArea", e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              أعلى مساحة (م²)
            </label>
            <input
              type="number"
              placeholder="بدون حد"
              value={filters.maxArea}
              onChange={(e) => update("maxArea", e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}
