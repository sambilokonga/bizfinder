import { NextResponse } from "next/server";
import { GLOBALBIZ_SUBSCRIPTION_PLANS, OFFICIAL_PAYMENT_ACCOUNTS } from "@/types/billing";

export async function GET() {
  return NextResponse.json({
    success: true,
    plans: GLOBALBIZ_SUBSCRIPTION_PLANS,
    paymentAccounts: OFFICIAL_PAYMENT_ACCOUNTS,
  });
}
