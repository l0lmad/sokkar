import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, password, email, isAdmin } = body;

    if (!name || !phone || !password) {
      return NextResponse.json(
        { error: "الاسم ورقم الهاتف وكلمة المرور مطلوبة" },
        { status: 400 }
      );
    }

    // Check if phone exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.phone, phone));

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "رقم الهاتف مسجل بالفعل" },
        { status: 400 }
      );
    }

    const result = await db
      .insert(users)
      .values({ name, phone, password, email: email || null, isAdmin: isAdmin === true })
      .returning();

    const user = result[0];
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isAdmin: user.isAdmin,
    }, { status: 201 });
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json(
      { error: "حدث خطأ في التسجيل" },
      { status: 500 }
    );
  }
}
