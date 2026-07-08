import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { eq, gte, lte, and, sql, type SQL } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get("city");
    const district = searchParams.get("district");
    const propertyType = searchParams.get("propertyType");
    const listingType = searchParams.get("listingType");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const minArea = searchParams.get("minArea");
    const maxArea = searchParams.get("maxArea");
    const bedrooms = searchParams.get("bedrooms");
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");
    const pending = searchParams.get("pending");
    const all = searchParams.get("all");

    const conditions: SQL[] = [];

    if (city) conditions.push(eq(properties.city, city));
    if (district) conditions.push(eq(properties.district, district));
    if (propertyType) {
      conditions.push(
        eq(properties.propertyType, propertyType as "apartment" | "villa" | "studio" | "office" | "land" | "shop")
      );
    }
    if (listingType) {
      conditions.push(
        eq(properties.listingType, listingType as "sale" | "rent")
      );
    }
    if (minPrice) conditions.push(gte(properties.price, minPrice));
    if (maxPrice) conditions.push(lte(properties.price, maxPrice));
    if (minArea) conditions.push(gte(properties.area, parseInt(minArea)));
    if (maxArea) conditions.push(lte(properties.area, parseInt(maxArea)));
    if (bedrooms) conditions.push(eq(properties.bedrooms, parseInt(bedrooms)));
    if (featured === "true") conditions.push(eq(properties.featured, true));
    if (pending === "true") conditions.push(eq(properties.isApproved, false));
    if (all !== "true") conditions.push(eq(properties.isApproved, true));
    if (search) {
      conditions.push(
        sql`(${properties.title} ILIKE ${'%' + search + '%'} OR ${properties.description} ILIKE ${'%' + search + '%'} OR ${properties.city} ILIKE ${'%' + search + '%'} OR ${properties.district} ILIKE ${'%' + search + '%'})`
      );
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const results = await db
      .select()
      .from(properties)
      .where(where)
      .orderBy(properties.createdAt);

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching properties:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await db.insert(properties).values(body).returning();
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error creating property:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
