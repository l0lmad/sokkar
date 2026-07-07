import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, password } = body;

    if (!phone || !password) {
      return NextResponse.json(
        { error: "رقم الهاتف وكلمة المرور مطلوبان" },
        { status: 400 }
      );
    }

    const result = await db
      .select()
      .from(users)
      .where(eq(users.phone, phone));

    if (result.length === 0) {
      return NextResponse.json(
        { error: "رقم الهاتف أو كلمة المرور غير صحيحة" },
        { status: 401 }
      );
    }

    const user = result[0];

    if (user.password !== password) {
      return NextResponse.json(
        { error: "رقم الهاتف أو كلمة المرور غير صحيحة" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    return NextResponse.json(
      { error: "حدث خطأ في تسجيل الدخول" },
      { status: 500 }
    );
  }
}
