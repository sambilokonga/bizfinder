"use client";

import React, { Suspense } from "react";
import ClaimBusinessWizardContent from "@/components/claim/ClaimBusinessWizardContent";

export default function ClaimBusinessWizardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      }
    >
      <ClaimBusinessWizardContent />
    </Suspense>
  );
}
