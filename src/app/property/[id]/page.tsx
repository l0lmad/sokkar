import { db } from "@/db";
import { properties } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PropertyPublicView from "./PropertyPublicView";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const result = await db
    .select()
    .from(properties)
    .where(eq(properties.id, parseInt(id)));

  if (result.length === 0) return { title: "العقار غير موجود" };

  const p = result[0];
  return {
    title: `${p.title} | Sokkar`,
    description: p.description || `عقار ${p.propertyType} في ${p.city}`,
    openGraph: {
      title: p.title,
      description: p.description || undefined,
      images: p.images ? [JSON.parse(p.images)[0]].filter(Boolean) : [],
    },
  };
}

export default async function PropertyPage({ params }: Props) {
  const { id } = await params;
  const result = await db
    .select()
    .from(properties)
    .where(eq(properties.id, parseInt(id)));

  if (result.length === 0) notFound();

  const property = result[0];

  return <PropertyPublicView property={property} />;
}
