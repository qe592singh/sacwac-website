import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const correctPassword = process.env.ADMIN_PASSWORD || "sacwac";

    if (password === correctPassword) {
      return NextResponse.json({
        success: true,
        message: "Authenticated successfully",
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid admin password" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
