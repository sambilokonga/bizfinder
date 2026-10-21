"use client";

import React, { use, Suspense } from "react";
import { ClaimBusinessWizardContent } from "@/components/claim/ClaimBusinessWizardContent";

export default function ClaimBusinessPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = use(params);

  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      }
    >
      <ClaimBusinessWizardContent initialBizId={businessId} />
    </Suspense>
  );
}
