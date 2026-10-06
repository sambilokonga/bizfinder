"use client";

import React, { useEffect, use } from "react";
import { useRouter } from "next/navigation";

export default function ClaimRedirectPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = use(params);
  const router = useRouter();

  useEffect(() => {
    router.replace(`/claim?bizId=${businessId}`);
  }, [businessId, router]);

  return (
    <div className="w-full py-20 text-center text-xs text-muted-foreground">
      Redirecting to Business Claiming & Verification Wizard...
    </div>
  );
}
