// Import types for TypeScript
import { NextResponse } from "next/server";

// Define the window information interface
interface WindowInfo {
  id: number;
  appName: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
}

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
      return NextResponse.json({
        success: true,
        windows: getMockWindowData(),
        isMock: true,
      });
    }

    // Get all windows
    const windows = Window.all();

    // Map windows to the information we want to return
    const windowsInfo: WindowInfo[] = windows.map((window: any) => ({
      id: window.id,
      appName: window.appName,
      title: window.title,
      x: window.x,
      y: window.y,
      width: window.width,
      height: window.height,
      isMinimized: window.isMinimized,
      isMaximized: window.isMaximized,
    }));

    return NextResponse.json({
      success: true,
      windows: windowsInfo,
      isMock: false,
    });
  } catch (error: any) {
    console.error("Error getting window information:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get window information",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// Function to generate mock window data for testing
function getMockWindowData(): WindowInfo[] {
  return [
    {
      id: 1,
      appName: "Visual Studio Code",
      title: "window.ts - onchain-app-template - Visual Studio Code",
      x: 0,
      y: 0,
      width: 1200,
      height: 800,
      isMinimized: false,
      isMaximized: false,
    },
    {
      id: 2,
      appName: "Google Chrome",
      title: "Next.js Documentation - Google Chrome",
      x: 100,
      y: 100,
      width: 1024,
      height: 768,
      isMinimized: false,
      isMaximized: true,
    },
    {
      id: 3,
      appName: "Terminal",
      title: "npm run dev - Terminal",
      x: 200,
      y: 200,
      width: 800,
      height: 600,
      isMinimized: false,
      isMaximized: false,
    },
  ];
}
