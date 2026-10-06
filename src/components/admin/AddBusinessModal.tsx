"use client";

import React from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { EmbeddedListingWizard } from "@/components/dashboard/EmbeddedListingWizard";
import { Business } from "@/types/business";
import { Category } from "@/types/category";

interface AddBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBusinessCreated: (business?: Business) => void;
  defaultCountry?: string;
  defaultCity?: string;
  categories?: Category[];
}

/**
 * Super Admin Add Business Modal - powered by the unified 7-step EmbeddedListingWizard.
 * Ensures 100% parity with /dashboard/listings/new and direct MongoDB registration.
 */
export function AddBusinessModal({
  isOpen,
  onClose,
  onBusinessCreated,
  defaultCountry = "Ethiopia",
  defaultCity = "Addis Ababa",
  categories,
}: AddBusinessModalProps) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[94vh] p-4 sm:p-6 overflow-y-auto rounded-3xl bg-background border border-border shadow-2xl">
        <DialogTitle className="sr-only">Add New Business Listing Wizard</DialogTitle>
        <DialogDescription className="sr-only">
          Add a new verified business listing with the unified 7-step wizard identical to /dashboard/listings/new.
        </DialogDescription>
        <EmbeddedListingWizard
          mode="embedded"
          isAdmin={true}
          redirectPath={null}
          defaultCountry={defaultCountry}
          defaultCity={defaultCity}
          categories={categories}
          onSuccess={(newBizId) => {
            onBusinessCreated?.({ id: newBizId } as Business);
            onClose();
          }}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
