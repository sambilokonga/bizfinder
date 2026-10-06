import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getClaims } from "@/lib/db/queries/claims";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || undefined;
  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "20");

  try {
    const result = await getClaims(status, page, limit);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[API /claims GET]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
