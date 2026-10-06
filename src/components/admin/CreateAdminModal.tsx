"use client";

import React from "react";
import { AssignGeoAdminModal } from "./AssignGeoAdminModal";
import { AdminAccount } from "@/app/api/admin/admins/route";

interface CreateAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdminCreated?: (admin: AdminAccount) => void;
  initialRole?: "super_admin" | "country_admin" | "city_admin";
  initialCountry?: string;
  initialCity?: string;
}

/**
 * CreateAdminModal is unified with AssignGeoAdminModal
 * ensuring full integration with Clerk Dashboard publicMetadata and MongoDB.
 */
export function CreateAdminModal({
  isOpen,
  onClose,
  onAdminCreated,
  initialRole = "country_admin",
  initialCountry = "Ethiopia",
  initialCity = "",
}: CreateAdminModalProps) {
  return (
    <AssignGeoAdminModal
      isOpen={isOpen}
      onClose={onClose}
      onAdminAssigned={() => {
        onAdminCreated?.({
          id: `adm-${Date.now()}`,
          name: "Administrator",
          email: "",
          role: initialRole,
          status: "active",
          departments: ["Territory Administration"],
          permissions: ["all"],
          createdAt: new Date().toISOString().split("T")[0],
          lastLogin: "Just now",
          actionsCount: 0,
        });
      }}
      initialRole={initialRole}
      initialCountry={initialCountry}
      initialCity={initialCity}
      currentAdminRole="super_admin"
    />
  );
}
