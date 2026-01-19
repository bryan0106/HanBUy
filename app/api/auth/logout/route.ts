import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Get Authorization header
    const authHeader = request.headers.get("authorization");
    
    // Optional: Validate token format (Bearer token)
    if (authHeader && !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid authorization header format",
          message: "Authorization header must be in format: Bearer {token}",
        },
        { status: 400 }
      );
    }

    // Logout is successful - token invalidation should be handled by backend
    // This endpoint just acknowledges the logout request
    return NextResponse.json(
      {
        success: true,
        message: "Logged out successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to logout",
        message: "An error occurred during logout",
      },
      { status: 500 }
    );
  }
}

