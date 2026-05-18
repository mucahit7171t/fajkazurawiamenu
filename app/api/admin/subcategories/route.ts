import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Subcategory from "@/lib/models/Subcategory";
import Category from "@/lib/models/Category";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();

    const body = await req.json();

    if (!body.title?.pl || !body.title?.en) {
      return NextResponse.json(
        { error: "Subcategory title is required" },
        { status: 400 }
      );
    }

    if (!body.category) {
      return NextResponse.json(
        { error: "Parent category is required" },
        { status: 400 }
      );
    }

    const parentCategory = await Category.findById(body.category);

    if (!parentCategory) {
      return NextResponse.json(
        { error: "Parent category not found" },
        { status: 404 }
      );
    }

    const subcategory = await Subcategory.create({
      title: body.title,
      category: body.category,
      order: body.order || 0,
    });

    return NextResponse.json(subcategory, { status: 201 });
  } catch (error) {
    console.error("ADMIN CREATE SUBCATEGORY ERROR:", error);

    return NextResponse.json(
      { error: "Subcategory could not be created" },
      { status: 500 }
    );
  }
}