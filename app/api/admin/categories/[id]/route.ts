import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Category from "@/lib/models/Category";
import Product from "@/lib/models/Product";
import Subcategory from "@/lib/models/Subcategory";
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
        { error: "Category title is required" },
        { status: 400 }
      );
    }

    if (!body.anchorId) {
      return NextResponse.json(
        { error: "Category anchorId is required" },
        { status: 400 }
      );
    }

    const existingCategory = await Category.findById(id);

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const oldAnchorId = existingCategory.anchorId;
    const newAnchorId = body.anchorId;

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      {
        title: body.title,
        anchorId: newAnchorId,
        image: body.image || "",
        order: body.order || 0,
      },
      { new: true }
    );

    if (oldAnchorId !== newAnchorId) {
      await Product.updateMany(
        {
          $or: [{ categoryId: oldAnchorId }, { category: oldAnchorId }],
        },
        {
          $set: {
            categoryId: newAnchorId,
            category: newAnchorId,
          },
        }
      );
    }

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error("ADMIN UPDATE CATEGORY ERROR:", error);

    return NextResponse.json(
      { error: "Category update failed" },
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

    const category = await Category.findById(id);

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const categoryId = String(category._id);
    const categoryAnchorId = category.anchorId;

    await Subcategory.deleteMany({
      category: categoryId,
    });

    await Product.deleteMany({
      $or: [
        { categoryId: categoryId },
        { categoryId: categoryAnchorId },
        { category: categoryId },
        { category: categoryAnchorId },
      ],
    });

    await Category.findByIdAndDelete(categoryId);

    return NextResponse.json({
      success: true,
      deletedCategory: categoryId,
    });
  } catch (error) {
    console.error("ADMIN DELETE CATEGORY ERROR:", error);

    return NextResponse.json(
      { error: "Category delete failed" },
      { status: 500 }
    );
  }
}