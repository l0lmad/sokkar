import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { inquiries, properties, clients } from "@/db/schema";
import { eq, and, type SQL } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const propertyId = searchParams.get("propertyId");

    const conditions: SQL[] = [];
    if (status) conditions.push(eq(inquiries.status, status));
    if (propertyId) conditions.push(eq(inquiries.propertyId, parseInt(propertyId)));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const results = await db
      .select({
        inquiry: inquiries,
        property: properties,
        client: clients,
      })
      .from(inquiries)
      .leftJoin(properties, eq(inquiries.propertyId, properties.id))
      .leftJoin(clients, eq(inquiries.clientId, clients.id))
      .where(where)
      .orderBy(inquiries.createdAt);

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await db.insert(inquiries).values(body).returning();
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error creating inquiry:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
