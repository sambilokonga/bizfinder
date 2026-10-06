import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getBusinessById, updateBusiness } from "@/lib/db/queries/businesses";
import { createNotification } from "@/lib/db/queries/notifications";
import { normalizeRole } from "@/lib/auth/roles";
import { ApprovalAuditEntry, BusinessApprovalStatus } from "@/types/business";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: Params) {
  let clerkUserId: string | null = null;
  try {
    const authResult = await auth();
    clerkUserId = authResult?.userId ?? null;
  } catch (e) {
    clerkUserId = null;
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const {
      action,
      actorId = clerkUserId || "admin-system",
      actorName = "Platform Administrator",
      actorRole: requestedRole,
      notes = "",
      rejectionReason = "",
    } = body;

    const business = await getBusinessById(id);
    if (!business) {
      return NextResponse.json({ error: "Business listing not found" }, { status: 404 });
    }

    const now = new Date().toISOString();
    const effectiveRole = requestedRole ? normalizeRole(requestedRole) : "admin";

    let nextStatus: BusinessApprovalStatus = business.approvalStatus || "pending_city";
    let isApproved = business.isApproved ?? false;
    let isPublished = business.isPublished ?? false;
    let isVerified = business.isVerified ?? false;

    let approvedByCity = business.approvedByCity || { approved: false };
    let approvedByCountry = business.approvedByCountry || { approved: false };
    let approvedBySuperAdmin = business.approvedBySuperAdmin || { approved: false };

    let auditStep: ApprovalAuditEntry["step"] = "city_approved";
    let auditNotes = notes;

    switch (action) {
      // ── Step 1: City Admin Approval ──────────────────────────────────────────
      case "city_approve": {
        approvedByCity = {
          approved: true,
          at: now,
          by: actorName,
          notes: notes || `Approved by ${business.cityName || "City"} Municipal Admin`,
        };
        nextStatus = "pending_country";
        auditStep = "city_approved";
        auditNotes = notes || `City Admin approved listing and forwarded to Country Lead.`;

        // Notify Business Owner
        if (business.ownerId) {
          await createNotification({
            title: `[City Approved] "${business.name}" passed City Admin review`,
            body: `Your business listing for "${business.name}" has been approved by ${business.cityName || "City"} Admin and forwarded to Country Lead for Stage 2 review.`,
            target: "user",
            targetUserId: business.ownerId,
            targetBusinessId: business.id,
            type: "system",
            priority: "medium",
            status: "Delivered",
          }).catch(() => {});
        }

        // Notify Country Admin
        await createNotification({
          title: `[Country Queue] "${business.name}" in ${business.cityName} awaiting Country Lead review`,
          body: `${actorName} (${business.cityName} City Admin) approved "${business.name}". It is now waiting for national compliance review.`,
          target: "admin",
          targetBusinessId: business.id,
          type: "system",
          priority: "medium",
          status: "Delivered",
        }).catch(() => {});

        break;
      }

      // ── Step 2: Country Admin Approval ───────────────────────────────────────
      case "country_approve": {
        approvedByCountry = {
          approved: true,
          at: now,
          by: actorName,
          notes: notes || `Approved by ${business.countryName || "National"} Country Lead`,
        };
        nextStatus = "pending_super_admin";
        auditStep = "country_approved";
        auditNotes = notes || `Country Admin approved listing and forwarded to Super Admin for final sign-off.`;

        // Notify Business Owner
        if (business.ownerId) {
          await createNotification({
            title: `[Country Approved] "${business.name}" passed Country Admin review`,
            body: `National compliance passed! Your listing is now with the Super Admin for final activation and posting.`,
            target: "user",
            targetUserId: business.ownerId,
            targetBusinessId: business.id,
            type: "system",
            priority: "medium",
            status: "Delivered",
          }).catch(() => {});
        }

        // Notify Super Admin
        await createNotification({
          title: `[Super Admin Queue] "${business.name}" ready for final sign-off`,
          body: `"${business.name}" (${business.cityName}, ${business.countryName}) has completed City and Country approvals. Final sign-off required to publish.`,
          target: "admin",
          targetBusinessId: business.id,
          type: "system",
          priority: "high",
          status: "Delivered",
        }).catch(() => {});

        break;
      }

      // ── Step 3: Super Admin Final Approval & Posting ─────────────────────────
      case "super_admin_approve": {
        approvedBySuperAdmin = {
          approved: true,
          at: now,
          by: actorName,
          notes: notes || "Final authorization and publication approved by Super Admin",
        };
        nextStatus = "approved";
        isApproved = true;
        isPublished = true;
        isVerified = true;
        auditStep = "super_admin_approved";
        auditNotes = notes || `Super Admin granted final approval. Business is now officially live across all public portals.`;

        // Notify Business Owner
        if (business.ownerId) {
          await createNotification({
            title: `🎉 Listing Published! "${business.name}" is now live!`,
            body: `Congratulations! Super Admin completed the final sign-off. Your business is now publicly searchable, verified, and featured on BizFinder!`,
            target: "user",
            targetUserId: business.ownerId,
            targetBusinessId: business.id,
            type: "system",
            priority: "high",
            status: "Delivered",
            link: `/business/${business.slug || business.id}`,
          }).catch(() => {});
        }

        break;
      }

      // ── SUPER ADMIN FAST-TRACK OVERRIDE ──────────────────────────────────────
      // "the super admin can approve without following those steps and can post it."
      case "super_admin_override": {
        if (!approvedByCity?.approved) {
          approvedByCity = {
            approved: true,
            at: now,
            by: `${actorName} (Fast-Track Override)`,
            notes: "Stage 1 City Review bypassed via Super Admin Direct Authorization",
          };
        }

        if (!approvedByCountry?.approved) {
          approvedByCountry = {
            approved: true,
            at: now,
            by: `${actorName} (Fast-Track Override)`,
            notes: "Stage 2 Country Review bypassed via Super Admin Direct Authorization",
          };
        }

        approvedBySuperAdmin = {
          approved: true,
          at: now,
          by: actorName,
          notes: notes || "Direct Super Admin Fast-Track Authorization & Immediate Publication",
        };

        nextStatus = "approved";
        isApproved = true;
        isPublished = true;
        isVerified = true;
        auditStep = "super_admin_override";
        auditNotes = notes || `Super Admin executed Fast-Track Override: immediately authorized and published listing without intermediate queues.`;

        // Notify Business Owner
        if (business.ownerId) {
          await createNotification({
            title: `⚡ Fast-Track Approved! "${business.name}" is now live!`,
            body: `Your listing for "${business.name}" was fast-track approved by Super Admin and is immediately live on BizFinder.`,
            target: "user",
            targetUserId: business.ownerId,
            targetBusinessId: business.id,
            type: "system",
            priority: "high",
            status: "Delivered",
            link: `/business/${business.slug || business.id}`,
          }).catch(() => {});
        }

        break;
      }

      // ── Rejection ────────────────────────────────────────────────────────────
      case "reject": {
        nextStatus = "rejected";
        isApproved = false;
        isPublished = false;
        auditStep = "rejected";
        auditNotes = rejectionReason || notes || "Listing rejected by compliance administrator.";

        if (business.ownerId) {
          await createNotification({
            title: `[Listing Rejected] "${business.name}" not approved`,
            body: `Your listing was not approved. Reason: ${auditNotes}. You may edit your submission from your dashboard.`,
            target: "user",
            targetUserId: business.ownerId,
            targetBusinessId: business.id,
            type: "system",
            priority: "high",
            status: "Delivered",
          }).catch(() => {});
        }
        break;
      }

      // ── Revision Requested ───────────────────────────────────────────────────
      case "request_revision": {
        nextStatus = "revision_requested";
        isApproved = false;
        isPublished = false;
        auditStep = "revision_requested";
        auditNotes = rejectionReason || notes || "Additional credentials or document revision requested.";

        if (business.ownerId) {
          await createNotification({
            title: `[Action Required] Revision requested for "${business.name}"`,
            body: `An administrator requested updates to your listing: ${auditNotes}. Please update your profile in the owner dashboard.`,
            target: "user",
            targetUserId: business.ownerId,
            targetBusinessId: business.id,
            type: "system",
            priority: "high",
            status: "Delivered",
          }).catch(() => {});
        }
        break;
      }

      default:
        return NextResponse.json({ error: `Unknown approval action: ${action}` }, { status: 400 });
    }

    const auditEntry: ApprovalAuditEntry = {
      step: auditStep,
      actorId,
      actorName,
      actorRole: effectiveRole,
      timestamp: now,
      notes: auditNotes,
    };

    const isApprovedNow = nextStatus === "approved";
    const validationDate = isApprovedNow ? (business.validationDate || now) : business.validationDate;
    const nextAuditDate = isApprovedNow
      ? new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString()
      : business.nextAuditDate;

    const existingHistory: ApprovalAuditEntry[] = Array.isArray(business.approvalHistory)
      ? business.approvalHistory
      : [];
    const updatedHistory: ApprovalAuditEntry[] = [...existingHistory, auditEntry];

    const updated = await updateBusiness(id, {
      approvalStatus: nextStatus,
      isApproved,
      isPublished,
      isVerified,
      approvedByCity,
      approvedByCountry,
      approvedBySuperAdmin,
      approvalHistory: updatedHistory,
      rejectionReason: nextStatus === "rejected" || nextStatus === "revision_requested" ? auditNotes : undefined,
      validationDate,
      nextAuditDate,
      existenceStatus: isApprovedNow ? "confirmed" : business.existenceStatus,
    } as any);

    return NextResponse.json({
      success: true,
      business: updated,
      message: `Approval action "${action}" executed successfully. New status: ${nextStatus}.`,
    });
  } catch (error: any) {
    console.error("[API /businesses/[id]/approval PATCH]", error);
    return NextResponse.json(
      { error: error.message || "Failed to process approval action" },
      { status: 500 }
    );
  }
}
