import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Category from "@/lib/models/Category";
import { requireAdmin } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();

    const body = await req.json();

    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const updates = body.map((item: any) =>
      Category.findByIdAndUpdate(item.id, { order: item.order })
    );

    await Promise.all(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("REORDER CATEGORIES ERROR:", error);

    return NextResponse.json(
      { error: "Failed to reorder categories" },
      { status: 500 }
    );
  }
}