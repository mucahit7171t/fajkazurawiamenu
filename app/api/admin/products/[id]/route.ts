import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";
import Subcategory from "@/lib/models/Subcategory";
import { requireAdmin } from "@/lib/auth";

function normalizePrices(prices: unknown) {
  if (!Array.isArray(prices)) return [];

  return prices
    .map((item: any) => ({
      label: String(item?.label || "").trim(),
      value: String(item?.value || "").trim(),
    }))
    .filter((item) => item.label || item.value);
}

function normalizeProductPayload(body: any) {
  const categoryId = String(body.categoryId || body.category || "").trim();
  const subcategory = String(body.subcategory || "").trim();

  return {
    name: {
      pl: String(body.name?.pl || "").trim(),
      en: String(body.name?.en || "").trim(),
    },

    desc: {
      pl: String(body.desc?.pl || body.description?.pl || "").trim(),
      en: String(body.desc?.en || body.description?.en || "").trim(),
    },

    price: String(body.price || "").trim(),

    prices: normalizePrices(body.prices),

    badge: body.badge ? String(body.badge).trim() : "",

    image: String(body.image || "").trim(),

    categoryId,
    category: categoryId,

    subcategory,

    isActive: body.isActive !== false,

    order:
      typeof body.order === "number"
        ? body.order
        : Number.isFinite(Number(body.order))
        ? Number(body.order)
        : 0,
  };
}

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
    const productData = normalizeProductPayload(body);

    if (!productData.name.pl && !productData.name.en) {
      return NextResponse.json(
        { error: "Product name is required" },
        { status: 400 }
      );
    }

    if (!productData.categoryId) {
      return NextResponse.json(
        { error: "Product category is required" },
        { status: 400 }
      );
    }

    const categoryExists = await Category.findOne({
      $or: [{ _id: productData.categoryId }, { anchorId: productData.categoryId }],
    });

    if (!categoryExists) {
      return NextResponse.json(
        { error: "Selected category does not exist" },
        { status: 404 }
      );
    }

    if (productData.subcategory) {
      const subcategoryExists = await Subcategory.findOne({
        _id: productData.subcategory,
        category: String(categoryExists._id),
      });

      if (!subcategoryExists) {
        return NextResponse.json(
          { error: "Selected subcategory does not exist in this category" },
          { status: 404 }
        );
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, productData, {
      new: true,
    });

    if (!updatedProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("ADMIN UPDATE PRODUCT ERROR:", error);

    return NextResponse.json(
      { error: "Product update failed" },
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

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ADMIN DELETE PRODUCT ERROR:", error);

    return NextResponse.json(
      { error: "Product delete failed" },
      { status: 500 }
    );
  }
}