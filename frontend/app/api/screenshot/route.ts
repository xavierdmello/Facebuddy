import { NextResponse } from "next/server";

// Target app name to screenshot
const TARGET_APP_NAME = "Chrome";

export async function GET() {
  try {
    // Attempt to import node-screenshots
    let Window;
    try {
      const nodeScreenshots = require("node-screenshots");
      Window = nodeScreenshots.Window;
    } catch (error: any) {
      console.warn(
        "node-screenshots module could not be loaded:",
        error.message
      );
      // Return mock data if the module is not available
      return NextResponse.json(
        {
          success: false,
          error: "node-screenshots module not available",
          details: error.message,
        },
        { status: 500 }
      );
    }

    // Get all windows
    const windows = Window.all();

    // Filter windows by app name
    const targetWindows = windows.filter((window: any) =>
      window.appName.includes(TARGET_APP_NAME)
    );

    if (targetWindows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: `No windows found with app name "${TARGET_APP_NAME}"`,
        },
        { status: 404 }
      );
    }

    // Find the window with the largest area
    const largestWindow = targetWindows.reduce((largest: any, current: any) => {
      const largestArea = largest.width * largest.height;
      const currentArea = current.width * current.height;
      return currentArea > largestArea ? current : largest;
    }, targetWindows[0]);

    // Capture screenshot of the largest window
    const image = largestWindow.captureImageSync();
    const screenshotBuffer = image.toPngSync();

    // Return the screenshot as a PNG image
    return new Response(screenshotBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Content-Length": String(screenshotBuffer.length),
      },
    });
  } catch (error: any) {
    console.error("Error capturing screenshot:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to capture screenshot",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
