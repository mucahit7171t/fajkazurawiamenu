import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/lib/models/Product";

const categories = [
  { _id: "snacks", title: { en: "Snacks", pl: "Snacks" }, anchorId: "snacks", image: "/product-default.jpg", order: 0 },
  { _id: "classic-shisha", title: { en: "Classic Shisha", pl: "Classic Shisha" }, anchorId: "classic-shisha", image: "/product-default.jpg", order: 1 },
  { _id: "shisha-alcohol", title: { en: "Shisha With Alcohol", pl: "Shisha With Alcohol" }, anchorId: "shisha-alcohol", image: "/product-default.jpg", order: 2 },
  { _id: "premium-shisha", title: { en: "Premium Shisha", pl: "Premium Shisha" }, anchorId: "premium-shisha", image: "/product-default.jpg", order: 3 },
  { _id: "classic-drinks", title: { en: "Klasyczne Drinki", pl: "Klasyczne Drinki" }, anchorId: "classic-drinks", image: "/product-default.jpg", order: 4 },
  { _id: "bottles", title: { en: "Butelki", pl: "Butelki" }, anchorId: "bottles", image: "/product-default.jpg", order: 5 },
  { _id: "hot-drinks", title: { en: "Hot Drinks", pl: "Hot Drinks" }, anchorId: "hot-drinks", image: "/product-default.jpg", order: 6 },
];

export async function GET() {
  try {
    await connectDB();

    const products = await Product.find().sort({
      order: 1,
      createdAt: -1,
    });

    const menu = categories.map((cat) => ({
      ...cat,
      subcategories: [],
      products: products
        .filter((p) => p.categoryId === cat._id)
        .map((p) => ({
          _id: String(p._id),
          name: p.name,
          desc: p.desc,
          price: p.price,
          prices: p.prices || [],
          image: p.image,
          badge: p.badge || "",
          category: p.categoryId,
          categoryId: p.categoryId,
          order: p.order,
        })),
    }));

    return NextResponse.json(menu);
  } catch (error) {
    console.error("GET ADMIN MENU ERROR:", error);
    return NextResponse.json(
      { error: "Admin menu could not be fetched" },
      { status: 500 }
    );
  }
}