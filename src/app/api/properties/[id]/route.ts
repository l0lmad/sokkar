import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db
      .select()
      .from(properties)
      .where(eq(properties.id, parseInt(id)));
    
    if (result.length === 0) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error fetching property:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = await db
      .update(properties)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(properties.id, parseInt(id)))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error updating property:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db
      .delete(properties)
      .where(eq(properties.id, parseInt(id)))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting property:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    if (action === "approve") {
      const result = await db
        .update(properties)
        .set({ isApproved: true, status: "available", updatedAt: new Date() })
        .where(eq(properties.id, parseInt(id)))
        .returning();

      if (result.length === 0) {
        return NextResponse.json({ error: "Property not found" }, { status: 404 });
      }
      return NextResponse.json(result[0]);
    }

    if (action === "reject") {
      await db
        .delete(properties)
        .where(eq(properties.id, parseInt(id)));

      return NextResponse.json({ success: true, message: "تم رفض العقار وحذفه" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error processing property action:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
