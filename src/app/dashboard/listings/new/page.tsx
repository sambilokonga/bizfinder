"use client";

import { EmbeddedListingWizard } from "@/components/dashboard/EmbeddedListingWizard";

/**
 * Standalone New Listing Wizard page at /dashboard/listings/new.
 * Renders the full-featured 7-step wizard in fullscreen layout.
 * After successful submission, redirects to /dashboard automatically.
 */
export default function NewListingWizardPage() {
  return <EmbeddedListingWizard mode="fullscreen" />;
}
