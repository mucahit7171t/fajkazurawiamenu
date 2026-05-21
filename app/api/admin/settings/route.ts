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
    monday: "04:00 PM - 03:00 AM",
    tuesday: "04:00 PM - 03:00 AM",
    wednesday: "04:00 PM - 04:00 AM",
    thursday: "04:00 PM - 04:00 AM",
    friday: "02:00 PM - 05:00 AM",
    saturday: "02:00 PM - 05:00 AM",
    sunday: "03:00 PM - 04:00 AM",
  },
  notices: [],
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