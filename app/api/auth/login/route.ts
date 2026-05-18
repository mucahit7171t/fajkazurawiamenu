import { NextResponse } from "next/server";
import { signToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const username = String(body.username || "").trim();
    const password = String(body.password || "").trim();

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminUsername || !adminPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin login configuration is missing.",
        },
        { status: 500 }
      );
    }

    if (username === adminUsername && password === adminPassword) {
      const user = {
        id: "admin",
        username: adminUsername,
        role: "admin" as const,
      };

      const token = signToken(user);

      return NextResponse.json({
        success: true,
        user,
        token,
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: "Invalid username or password",
      },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid request.",
      },
      { status: 400 }
    );
  }
}