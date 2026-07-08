"use client";

import { useEffect, useState, useCallback } from "react";
import PropertyFilters from "./PropertyFilters";
import PropertyCard from "./PropertyCard";
import PropertyDetail from "./PropertyDetail";
import EditPropertyModal from "./EditPropertyModal";
import type { Property } from "@/db/schema";
import { Building2 } from "lucide-react";

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

interface PropertiesListProps {
  isAdmin: boolean;
  userName?: string;
  userPhone?: string;
}

const emptyFilters: Filters = {
  search: "",
  city: "",
  propertyType: "",
  listingType: "",
  minPrice: "",
  maxPrice: "",
  bedrooms: "",
  minArea: "",
  maxArea: "",
};

export default function PropertiesList({
  isAdmin,
  userName,
  userPhone,
}: PropertiesListProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    try {
      const res = await fetch(`/api/properties?${params.toString()}`);
      const data = await res.json();
      setProperties(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    const timeout = setTimeout(fetchProperties, 300);
    return () => clearTimeout(timeout);
  }, [fetchProperties]);

  const handleDelete = async (property: Property) => {
    if (!confirm(`هل أنت متأكد من حذف "${property.title}"؟`)) return;
    try {
      await fetch(`/api/properties/${property.id}`, { method: "DELETE" });
      fetchProperties();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
  };

  const handleEditSave = () => {
    setEditingProperty(null);
    fetchProperties();
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <Building2 className="text-orange-500" />
          {isAdmin ? "إدارة العقارات" : "تصفح العقارات"}
        </h2>
        <p className="text-gray-500 mt-1">
          {isAdmin
            ? "عرض وتعديل وحذف العقارات"
            : "تصفح جميع العقارات المتاحة"}
        </p>
      </div>

      <PropertyFilters
        filters={filters}
        onFilterChange={setFilters}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-16">
          <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">لا توجد عقارات تطابق البحث</p>
          <p className="text-gray-400 text-sm">جرب تغيير معايير الفلترة</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            تم العثور على <strong>{properties.length}</strong> عقار
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onView={setSelectedProperty}
                onEdit={isAdmin ? handleEdit : undefined}
                onDelete={isAdmin ? handleDelete : undefined}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        </>
      )}

      {selectedProperty && (
        <PropertyDetail
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onDelete={() => { setSelectedProperty(null); fetchProperties(); }}
          userName={userName}
          userPhone={userPhone}
          isAdmin={isAdmin}
        />
      )}

      {editingProperty && (
        <EditPropertyModal
          property={editingProperty}
          onClose={() => setEditingProperty(null)}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
}
