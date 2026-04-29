import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/lib/models/Product";

const categoryInfo: Record<string, { title: string; imageLabel: string }> = {
  snacks: { title: "Snacks", imageLabel: "SNACKS" },
  "classic-shisha": { title: "Classic Shisha", imageLabel: "CLASSIC SHISHA" },
  "shisha-alcohol": { title: "Shisha With Alcohol", imageLabel: "SHISHA WITH ALCOHOL" },
  "premium-shisha": { title: "Premium Shisha", imageLabel: "PREMIUM SHISHA" },
  "classic-drinks": { title: "Klasyczne Drinki", imageLabel: "KLASYCZNE DRINKI" },
  bottles: { title: "Butelki", imageLabel: "BUTELKI" },
  "hot-drinks": { title: "Hot Drinks", imageLabel: "HOT DRINKS" },
};

export async function GET() {
  try {
    await connectDB();

    const products = await Product.find({ isActive: true }).sort({
      order: 1,
      createdAt: -1,
    });

    const grouped: Record<string, any[]> = {};

    products.forEach((product) => {
      const categoryId = product.categoryId || product.category || "snacks";

      if (!grouped[categoryId]) grouped[categoryId] = [];

      grouped[categoryId].push({
        name: product.name?.en || product.name?.pl || "",
        description: product.desc?.en || product.desc?.pl || "",
        price: product.price || "",
        badge: product.badge || undefined,
        image: product.image || "",
      });
    });

    const categories = Object.keys(grouped).map((categoryId) => {
      const info = categoryInfo[categoryId] || {
        title: categoryId,
        imageLabel: categoryId.toUpperCase(),
      };

      return {
        id: categoryId,
        title: info.title,
        imageLabel: info.imageLabel,
        items: grouped[categoryId],
      };
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("GET MENU ERROR:", error);
    return NextResponse.json([]);
  }
}