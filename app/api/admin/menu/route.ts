import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";
import Subcategory from "@/lib/models/Subcategory";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();

    const [categories, subcategories, products] = await Promise.all([
      Category.find().sort({ order: 1, createdAt: 1 }).lean(),
      Subcategory.find().sort({ order: 1, createdAt: 1 }).lean(),
      Product.find().sort({ order: 1, createdAt: -1 }).lean(),
    ]);

    const menu = (categories as any[]).map((cat) => {
      const categoryId = String(cat._id);

      const categoryProducts = (products as any[]).filter((p) => {
        const productCategory = p.categoryId || p.category || "";

        return (
          productCategory === cat.anchorId ||
          productCategory === categoryId
        );
      });

      const categorySubcategories = (subcategories as any[])
        .filter((sub) => String(sub.category) === categoryId)
        .map((sub) => {
          const subcategoryId = String(sub._id);

          return {
            _id: subcategoryId,
            title: sub.title,
            category: categoryId,
            order: sub.order || 0,
            products: categoryProducts
              .filter((p) => String(p.subcategory || "") === subcategoryId)
              .map((p) => ({
                _id: String(p._id),
                name: p.name,
                desc: p.desc,
                price: p.price || "",
                prices: p.prices || [],
                image: p.image || "",
                badge: p.badge || "",
                category: p.categoryId || p.category || "",
                categoryId: p.categoryId || p.category || "",
                subcategory: p.subcategory || "",
                order: p.order || 0,
              })),
          };
        });

      return {
        _id: categoryId,
        title: cat.title,
        anchorId: cat.anchorId,
        image: cat.image || "",
        order: cat.order || 0,
        subcategories: categorySubcategories,
        products: categoryProducts.map((p) => ({
          _id: String(p._id),
          name: p.name,
          desc: p.desc,
          price: p.price || "",
          prices: p.prices || [],
          image: p.image || "",
          badge: p.badge || "",
          category: p.categoryId || p.category || "",
          categoryId: p.categoryId || p.category || "",
          subcategory: p.subcategory || "",
          order: p.order || 0,
        })),
      };
    });

    return NextResponse.json(menu);
  } catch (error) {
    console.error("GET ADMIN MENU ERROR:", error);

    return NextResponse.json(
      { error: "Admin menu could not be fetched" },
      { status: 500 }
    );
  }
}