import { NextRequest, NextResponse } from "next/server";
import { GET as adminGet, POST as adminPost } from "@/app/api/admin/media/route";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return adminGet(req);
}

export async function POST(req: NextRequest) {
  return adminPost(req);
}
