import { NextResponse } from "next/server";
import { blockIpAddress } from "@/lib/db/queries/security";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ip, reason, blockedBy } = body;

    if (!ip) {
      return NextResponse.json(
        { success: false, error: "IP address is required." },
        { status: 400 }
      );
    }

    const event = await blockIpAddress(
      ip,
      reason || "Manual IP block enforced by administrator.",
      blockedBy || "Super Admin"
    );

    return NextResponse.json({
      success: true,
      message: `IP ${ip} has been permanently blocked in the firewall.`,
      event,
    });
  } catch (error: any) {
    console.error("[API /api/security/block-ip POST] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to block IP address" },
      { status: 500 }
    );
  }
}
