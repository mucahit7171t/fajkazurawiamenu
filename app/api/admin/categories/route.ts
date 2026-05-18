import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Category from "@/lib/models/Category";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();

    const body = await req.json();

    const category = await Category.create({
      title: body.title,
      anchorId: body.anchorId,
      image: body.image || "",
      order: body.order || 0,
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("ADMIN CREATE CATEGORY ERROR:", error);

    return NextResponse.json(
      { error: "Category could not be created" },
      { status: 500 }
    );
  }
}