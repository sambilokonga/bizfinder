import { NextResponse } from "next/server";
import { incrementBusinessCounter } from "@/lib/db/queries/businesses";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;

  try {
    const body = await request.json();
    const field = body.field as "viewCount" | "callCount" | "directionCount";

    const allowed = ["viewCount", "callCount", "directionCount"];
    if (!allowed.includes(field)) {
      return NextResponse.json({ error: "Invalid counter field" }, { status: 400 });
    }

    await incrementBusinessCounter(id, field);
    return NextResponse.json({ success: true });
  } catch (error) {
    // Silent fail — counter increments are non-critical
    return NextResponse.json({ success: false });
  }
}
