import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createPayment } from "@/lib/db/queries/payments";
import { createBusiness, updateBusiness } from "@/lib/db/queries/businesses";
import { uploadToCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    let userId: string | null = null;
    try {
      const authObj = await auth();
      userId = authObj?.userId || null;
    } catch (_) {
      userId = null;
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const businessId = (formData.get("businessId") as string) || "";
    const businessName = (formData.get("businessName") as string) || "My Business";
    const planId = (formData.get("planId") as string) || "plan-pro";
    const tier = (formData.get("tier") as string) || "pro";
    const billingCycle = (formData.get("billingCycle") as string) || "monthly";
    const amount = Number(formData.get("amount") || 1499);
    const currency = (formData.get("currency") as string) || "ETB";
    const transferType = (formData.get("transferType") as string) || "cbe_bank"; // "cbe_bank" | "telebirr_direct"
    const bankReference = (formData.get("bankReference") as string) || "";
    const payerName = (formData.get("payerName") as string) || "Business Owner";
    const payerPhone = (formData.get("payerPhone") as string) || "";
    const depositedAccount =
      transferType === "telebirr_direct" ? "0913273066" : "1000377050917";

    // New business registration fields (optional if user is creating on payment)
    const newBizName = (formData.get("newBizName") as string) || "";
    const newBizCategory = (formData.get("newBizCategory") as string) || "General Services";
    const newBizCity = (formData.get("newBizCity") as string) || "Addis Ababa";
    const newBizAddress = (formData.get("newBizAddress") as string) || "";

    let receiptUrl = "";

    // If a file was uploaded, store receipt on Cloudinary
    if (file && typeof file !== "string") {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      if (isCloudinaryConfigured()) {
        try {
          const uploaded = await uploadToCloudinary(buffer, { folder: "globalbiz/receipts" });
          receiptUrl = uploaded.url;
        } catch (uploadErr) {
          console.error("[receipt-upload] Cloudinary error:", uploadErr);
        }
      }

      // Fallback to local filesystem if Cloudinary is unavailable
      if (!receiptUrl) {
        const { writeFile, mkdir } = await import("fs/promises");
        const path = await import("path");
        const originalName = file.name || "receipt.jpg";
        const ext = path.extname(originalName) || ".jpg";
        const cleanBase = path
          .basename(originalName, ext)
          .replace(/[^a-zA-Z0-9_-]/g, "_")
          .slice(0, 30);
        const uniqueFilename = `receipt-${Date.now()}-${cleanBase}${ext.toLowerCase()}`;
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        await mkdir(uploadDir, { recursive: true });
        await writeFile(path.join(uploadDir, uniqueFilename), buffer);
        receiptUrl = `/uploads/${uniqueFilename}`;
      }
    }

    let activeBusinessId = businessId;
    let activeBusinessName = businessName;

    // If registering a new business
    if (newBizName) {
      const created = await createBusiness({
        name: newBizName.trim(),
        categoryId: "cat-general",
        categoryName: newBizCategory,
        countryName: "Ethiopia",
        cityName: newBizCity,
        addressLine: newBizAddress || "Main Commercial Street",
        telephone: payerPhone,
        mobile: payerPhone,
        description: `Registered with ${transferType === "telebirr_direct" ? "Telebirr" : "CBE"} bank receipt transfer.`,
        status: "open",
        isVerified: false, // will be verified when admin approves
        isFeatured: false,
        ownerId: userId || `owner_${Date.now()}`,
      } as any);

      if (created) {
        activeBusinessId = created.id;
        activeBusinessName = created.name;
      }
    } else if (activeBusinessId) {
      await updateBusiness(activeBusinessId, {
        status: "open",
      });
    }

    // Generate transaction record
    const prefix = transferType === "telebirr_direct" ? "TEL-DIR" : "CBE-BNK";
    const txId = `TX-${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;

    const payment = await createPayment({
      id: txId,
      businessId: activeBusinessId,
      businessName: activeBusinessName,
      payerName,
      payerPhone,
      amount,
      currency: currency as any,
      provider: transferType === "telebirr_direct" ? "telebirr" : "bank_transfer",
      paymentType: "subscription",
      status: "pending",
      reference: bankReference || `${prefix}-${Date.now().toString().slice(-6)}`,
      description: `${tier.toUpperCase()} Subscription via ${
        transferType === "telebirr_direct"
          ? "Telebirr Transfer (0913273066)"
          : "CBE Bank Transfer (1000377050917)"
      }`,
      metadata: {
        planId,
        tier,
        billingCycle,
        transferType,
        depositedAccount,
        receiptUrl,
        bankReference,
        payerPhone,
        submittedAt: new Date().toISOString(),
      },
      registeredBy: userId ? `Owner (${userId})` : "Bank Receipt Upload",
    });

    return NextResponse.json({
      success: true,
      message:
        "Receipt attached successfully! Our financial compliance team will verify your transfer and confirm your subscription.",
      payment,
      receiptUrl,
      txId,
      businessId: activeBusinessId,
      businessName: activeBusinessName,
    });
  } catch (error: any) {
    console.error("[API /billing/receipt-upload POST] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process receipt upload" },
      { status: 500 }
    );
  }
}
