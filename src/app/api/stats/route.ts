import { NextResponse } from "next/server";
import { db } from "@/db";
import { properties, clients, inquiries } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET() {
  try {
    const [propCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(properties);

    const [forSale] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(properties)
      .where(eq(properties.listingType, "sale"));

    const [forRent] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(properties)
      .where(eq(properties.listingType, "rent"));

    const [clientCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(clients);

    const [inquiryCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(inquiries);

    const [available] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(properties)
      .where(eq(properties.status, "available"));

    return NextResponse.json({
      totalProperties: propCount.count,
      forSale: forSale.count,
      forRent: forRent.count,
      totalClients: clientCount.count,
      totalInquiries: inquiryCount.count,
      available: available.count,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
