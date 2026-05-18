import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Category from "@/lib/models/Category";
import Product from "@/lib/models/Product";
import Subcategory from "@/lib/models/Subcategory";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();

    const [categories, subcategories, products] = await Promise.all([
      Category.find().sort({ order: 1, createdAt: 1 }).lean(),
      Subcategory.find().sort({ order: 1, createdAt: 1 }).lean(),
      Product.find({ isActive: { $ne: false } })
        .sort({ order: 1, createdAt: -1 })
        .lean(),
    ]);

    const menu = (categories as any[]).map((cat) => {
      const categoryId = String(cat._id);

      const categoryProducts = (products as any[]).filter((product) => {
        const productCategory = product.categoryId || product.category || "";

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
            id: subcategoryId,
            _id: subcategoryId,
            title: sub.title,
            category: categoryId,
            order: sub.order || 0,
            items: categoryProducts
              .filter(
                (product) => String(product.subcategory || "") === subcategoryId
              )
              .map((product) => ({
                id: String(product._id),
                _id: String(product._id),
                name: product.name,
                desc: product.desc,
                description: product.desc,
                price: product.price || "",
                prices: product.prices || [],
                image: product.image || "",
                badge: product.badge || "",
                order: product.order || 0,
                subcategory: product.subcategory || "",
              })),
          };
        });

      const items = categoryProducts.map((product) => ({
        id: String(product._id),
        _id: String(product._id),
        name: product.name,
        desc: product.desc,
        description: product.desc,
        price: product.price || "",
        prices: product.prices || [],
        image: product.image || "",
        badge: product.badge || "",
        order: product.order || 0,
        subcategory: product.subcategory || "",
      }));

      return {
        id: categoryId,
        _id: categoryId,
        title: cat.title,
        imageLabel: cat.title,
        anchorId: cat.anchorId,
        image: cat.image || "",
        order: cat.order || 0,
        subcategories: categorySubcategories,
        items,
      };
    });

    return NextResponse.json(menu);
  } catch (error) {
    console.error("GET PUBLIC MENU ERROR:", error);

    return NextResponse.json(
      { error: "Menu could not be fetched" },
      { status: 500 }
    );
  }
}