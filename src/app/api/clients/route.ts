import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { eq, sql, type SQL, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const clientType = searchParams.get("clientType");
    const search = searchParams.get("search");

    const conditions: SQL[] = [];

    if (clientType) conditions.push(eq(clients.clientType, clientType));
    if (search) {
      conditions.push(
        sql`(${clients.name} ILIKE ${'%' + search + '%'} OR ${clients.phone} ILIKE ${'%' + search + '%'} OR ${clients.email} ILIKE ${'%' + search + '%'})`
      );
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const results = await db
      .select()
      .from(clients)
      .where(where)
      .orderBy(clients.createdAt);

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await db.insert(clients).values(body).returning();
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
