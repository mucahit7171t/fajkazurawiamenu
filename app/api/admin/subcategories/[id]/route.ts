import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Subcategory from "@/lib/models/Subcategory";
import Category from "@/lib/models/Category";
import Product from "@/lib/models/Product";
import { requireAdmin } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();

    const { id } = await params;
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

    const updatedSubcategory = await Subcategory.findByIdAndUpdate(
      id,
      {
        title: body.title,
        category: body.category,
        order: body.order || 0,
      },
      { new: true }
    );

    if (!updatedSubcategory) {
      return NextResponse.json(
        { error: "Subcategory not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedSubcategory);
  } catch (error) {
    console.error("ADMIN UPDATE SUBCATEGORY ERROR:", error);

    return NextResponse.json(
      { error: "Subcategory update failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();

    const { id } = await params;

    const deletedSubcategory = await Subcategory.findByIdAndDelete(id);

    if (!deletedSubcategory) {
      return NextResponse.json(
        { error: "Subcategory not found" },
        { status: 404 }
      );
    }

    await Product.updateMany(
      { subcategory: id },
      { $set: { subcategory: "" } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ADMIN DELETE SUBCATEGORY ERROR:", error);

    return NextResponse.json(
      { error: "Subcategory delete failed" },
      { status: 500 }
    );
  }
}