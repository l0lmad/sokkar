import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, phone, currentPassword, newPassword } = body;

    if (!id) {
      return NextResponse.json(
        { error: "معرف المستخدم مطلوب" },
        { status: 400 }
      );
    }

    // Get current user
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.id, id));

    if (existing.length === 0) {
      return NextResponse.json(
        { error: "المستخدم غير موجود" },
        { status: 404 }
      );
    }

    const user = existing[0];

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "كلمة المرور الحالية مطلوبة" },
          { status: 400 }
        );
      }

      if (user.password !== currentPassword) {
        return NextResponse.json(
          { error: "كلمة المرور الحالية غير صحيحة" },
          { status: 401 }
        );
      }
    }

    // Update user
    const updateData: { name?: string; phone?: string; password?: string } = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (newPassword) updateData.password = newPassword;

    const result = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();

    const updatedUser = result[0];

    return NextResponse.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      isAdmin: updatedUser.isAdmin,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "حدث خطأ في تحديث البيانات" },
      { status: 500 }
    );
  }
}
