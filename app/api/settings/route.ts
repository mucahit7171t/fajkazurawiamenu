import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Settings from "@/lib/models/Settings";

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

export async function GET() {
  try {
    await connectDB();

    const settings = await Settings.findOne({ key: "site-settings" }).lean();

    if (!settings) {
      return NextResponse.json(defaultSettings);
    }

    return NextResponse.json({
      ...defaultSettings,
      ...(settings as any).value,
      notices: Array.isArray((settings as any).value?.notices)
        ? (settings as any).value.notices
        : [],
    });
  } catch (error) {
    console.error("GET PUBLIC SETTINGS ERROR:", error);

    return NextResponse.json(defaultSettings);
  }
}