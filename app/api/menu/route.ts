import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";

const defaultCategories = [
  { id: "snacks", title: "Snacks", imageLabel: "SNACKS", image: "/product-default.jpg", order: 0 },
  { id: "classic-shisha", title: "Classic Shisha", imageLabel: "CLASSIC SHISHA", image: "/product-default.jpg", order: 1 },
  { id: "shisha-alcohol", title: "Shisha With Alcohol", imageLabel: "SHISHA WITH ALCOHOL", image: "/product-default.jpg", order: 2 },
  { id: "premium-shisha", title: "Premium Shisha", imageLabel: "PREMIUM SHISHA", image: "/product-default.jpg", order: 3 },
  { id: "classic-drinks", title: "Klasyczne Drinki", imageLabel: "KLASYCZNE DRINKI", image: "/product-default.jpg", order: 4 },
  { id: "bottles", title: "Butelki", imageLabel: "BUTELKI", image: "/product-default.jpg", order: 5 },
  { id: "hot-drinks", title: "Hot Drinks", imageLabel: "HOT DRINKS", image: "/product-default.jpg", order: 6 },
];

function normalizeId(value: any) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (value._id) return String(value._id);
  if (value.id) return String(value.id);
  return String(value);
}

export async function GET() {
  try {
    await connectDB();

    const dbCategories = await Category.find().sort({ order: 1, createdAt: 1 });
    const products = await Product.find({
  $or: [
    { isActive: true },
    { isActive: { $exists: false } },
    { active: true },
    { active: { $exists: false } },
  ],
}).sort({
  order: 1,
  createdAt: -1,
});

    const dbCategoryList = dbCategories.map((cat) => ({
      id: cat.anchorId || String(cat._id),
      mongoId: String(cat._id),
      title: cat.title?.en || cat.title?.pl || "",
      imageLabel: (cat.title?.en || cat.title?.pl || "").toUpperCase(),
      image: cat.image || "/product-default.jpg",
      order: cat.order || 0,
    }));

    const mergedCategories = [
      ...defaultCategories.map((cat) => ({ ...cat, mongoId: cat.id })),
      ...dbCategoryList.filter(
        (dbCat) =>
          !defaultCategories.some(
            (def) => def.id === dbCat.id || def.id === dbCat.mongoId
          )
      ),
    ].sort((a, b) => a.order - b.order);

    const categories = mergedCategories.map((category) => ({
      id: category.id,
      title: category.title,
      imageLabel: category.imageLabel,
      image: category.image,
      items: products
        .filter((product) => {
          const productCategory = normalizeId(
            product.categoryId || product.category || product.category?._id
          );

          return (
            productCategory === category.id ||
            productCategory === category.mongoId
          );
        })
        .map((product) => ({
          name: product.name?.en || product.name?.pl || "",
          description: product.desc?.en || product.desc?.pl || "",
          price: product.price || "",
          badge: product.badge || undefined,
          image: product.image || "",
        })),
    }));

    return NextResponse.json(categories);
  } catch (error) {
    console.error("GET MENU ERROR:", error);
    return NextResponse.json([]);
  }
}