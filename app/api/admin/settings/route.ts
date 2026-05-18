import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Settings from "@/lib/models/Settings";
import { requireAdmin } from "@/lib/auth";

const defaultSettings = {
  siteName: "FAJKA BAR",
  location: "Warsaw",
  currency: "zł",
  language: "pl",
  isOpen: true,
  phone: "+48 000 000 000",
  openingHours: {
    monday: "12:00 - 02:00",
    tuesday: "12:00 - 02:00",
    wednesday: "12:00 - 02:00",
    thursday: "12:00 - 02:00",
    friday: "12:00 - 04:00",
    saturday: "12:00 - 04:00",
    sunday: "12:00 - 02:00",
  },
  notices: [
    {
      icon: "👥",
      text: "Powyżej 3 osób shisha jest sprzedawana tylko przy zakupie napojów.",
      order: 0,
      isActive: true,
    },
    {
      icon: "🥤",
      text: "Prosimy nie spożywać napojów i jedzenia przyniesionego z zewnątrz.",
      order: 1,
      isActive: true,
    },
    {
      icon: "🛋️",
      text: "Za uszkodzenia fajek wodnych, kanap i innych mebli spowodowane nieostrożnym zachowaniem odpowiadają nasi klienci.",
      order: 2,
      isActive: true,
    },
  ],
};

export async function PUT(req: NextRequest) {
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    await connectDB();

    const body = await req.json();
    const { key, value } = body;

    if (!key || typeof key !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Setting key is required",
        },
        { status: 400 }
      );
    }

    const current = await Settings.findOne({ key: "site-settings" });

    const updatedValue = {
      ...defaultSettings,
      ...(current?.value || {}),
      [key]: value,
    };

    const settings = await Settings.findOneAndUpdate(
      { key: "site-settings" },
      { value: updatedValue },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      settings: settings.value,
    });
  } catch (error) {
    console.error("ADMIN SETTINGS UPDATE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Settings update failed",
      },
      { status: 500 }
    );
  }
}