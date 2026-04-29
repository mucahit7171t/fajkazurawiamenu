import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";

export async function GET() {
  try {
    await connectDB();

    const categories = await Category.find().sort({ order: 1, createdAt: 1 });
    const products = await Product.find().sort({ order: 1, createdAt: -1 });

    const menu = categories.map((cat) => ({
      id: cat.anchorId || String(cat._id),
      title: cat.title?.en || cat.title?.pl || "",
      imageLabel: (cat.title?.en || cat.title?.pl || "").toUpperCase(),
      image: cat.image || "/product-default.jpg",
      items: products
        .filter((p) => {
          const productCategory = p.categoryId || p.category || "snacks";
          return productCategory === cat.anchorId || productCategory === String(cat._id);
        })
        .map((p) => ({
          name: p.name?.en || p.name?.pl || "",
          description: p.desc?.en || p.desc?.pl || "",
          price: p.price || "",
          badge: p.badge || undefined,
          image: p.image || "",
        })),
    }));

    return NextResponse.json(menu);
  } catch (error) {
    console.error("GET MENU ERROR:", error);
    return NextResponse.json([]);
  }
}