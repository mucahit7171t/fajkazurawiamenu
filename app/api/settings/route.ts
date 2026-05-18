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
    });
  } catch (error) {
    console.error("GET PUBLIC SETTINGS ERROR:", error);

    return NextResponse.json(defaultSettings);
  }
}