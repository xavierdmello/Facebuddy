import { NextResponse } from "next/server";
import { windowManager } from "@johnlindquist/node-window-manager";

export async function GET() {
  try {
    // Request accessibility permissions on macOS
    windowManager.requestAccessibility();

    // Get the active window
    const window = windowManager.getActiveWindow();

    // Get the bounds of the active window
    const bounds = window.getBounds();

    return NextResponse.json({ bounds });
  } catch (error) {
    console.error("Error getting window bounds:", error);
    return NextResponse.json(
      { error: "Failed to get window bounds" },
      { status: 500 }
    );
  }
}
