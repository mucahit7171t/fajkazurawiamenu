import { NextResponse } from "next/server";

let settings = {
  siteName: "FAJKA BAR",
  location: "Warsaw",
  currency: "zł",
  language: "pl",
  isOpen: true,
};

export async function GET() {
  return NextResponse.json(settings);
}

export async function PUT(req: Request) {
  const body = await req.json();

  settings = {
    ...settings,
    ...body,
  };

  return NextResponse.json({
    success: true,
    settings,
  });
}