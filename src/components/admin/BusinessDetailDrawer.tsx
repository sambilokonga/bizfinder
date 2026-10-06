"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  User,
  Calendar,
  Image as ImageIcon,
  Video,
  Layers,
  Sparkles,
  FileCheck,
  AlertTriangle,
  ExternalLink,
  Edit,
  Trash2,
} from "lucide-react";
import { Business } from "@/types/business";
import { toast } from "sonner";
import { extractYoutubeVideoId, isYoutubeUrl, getYoutubeEmbedUrl } from "@/lib/utils/youtube";

interface BusinessDetailDrawerProps {
  isOpen: boolean;
  business: Business | null;
  onClose: () => void;
  onApprove?: (id: string, name: string) => void;
  onReject?: (id: string, name: string) => void;
}

export function BusinessDetailDrawer({
  isOpen,
  business,
  onClose,
  onApprove,
  onReject,
}: BusinessDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "services" | "media" | "hours" | "owner" | "verification"
  >("overview");

  if (!business) return null;

  const displayCover = business.coverUrl || (business as any).coverImageUrl || (business as any).featuredImage || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80";
  const displayLogo = business.logoUrl || (business as any).featuredImage || displayCover;
  const displayPhone = business.telephone || business.mobile || (business as any).phone;
  const displayCategory = business.categoryName || (business as any).category || "General Business";
  const displaySubcategory = business.subcategoryName || (business as any).subCategory;
  const displayRating = (business.ratingAvg ?? (business as any).rating ?? 0).toFixed(1);
  const displayAddress = business.addressLine || (business as any).address || `${business.districtName || "Central"}, ${business.cityName || "Addis Ababa"}`;
  const displayCity = business.cityName || (business as any).city || "Addis Ababa";
  const displayCountry = business.countryName || (business as any).country || "Ethiopia";

  const allMediaPhotos = (business.media && business.media.length > 0)
    ? business.media.filter((m) => m.type !== "video" && !isYoutubeUrl(m.url)).map((m) => m.url)
    : [displayCover, displayLogo].filter(Boolean);

  const videoItem = business.media?.find((m) => m.type === "video" || isYoutubeUrl(m.url));
  const effectiveYtId =
    extractYoutubeVideoId(business.youtubeVideoId) ||
    (videoItem ? extractYoutubeVideoId(videoItem.url) : null);
  const videoUrl = videoItem?.url || (effectiveYtId ? `https://www.youtube.com/watch?v=${effectiveYtId}` : null);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0 rounded-3xl border-border">
        {/* Cover Header */}
        <div className="relative h-48 sm:h-56 w-full bg-slate-900 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayCover}
            alt={business.name}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

          {/* Business Logo & Primary Identity */}
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between gap-4">
            <div className="flex items-end gap-3.5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-card border-2 border-border shadow-xl overflow-hidden flex items-center justify-center shrink-0">
                {displayLogo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={displayLogo}
                    alt={business.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 className="w-8 h-8 text-primary" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-foreground">{business.name}</h2>
                  {business.isVerified && (
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] py-0.5">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {business.businessLevel && (
                    <Badge variant="outline" className="text-[10px] uppercase font-bold text-indigo-500 border-indigo-500/30">
                      {business.businessLevel} Scale
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <span className="font-semibold text-primary">{displayCategory}</span>
                  {displaySubcategory && (
                    <>
                      <span>•</span>
                      <span>{displaySubcategory}</span>
                    </>
                  )}
                  <span>•</span>
                  <span className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    {displayRating} ({business.reviewCount || 0} reviews)
                  </span>
                </div>
              </div>
            </div>

            <Badge
              className={
                business.isVerified
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs"
              }
            >
              {business.isVerified ? "Verified Active" : "Pending Review"}
            </Badge>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 border-b border-border/80 bg-muted/20 overflow-x-auto">
          {[
            { id: "overview", label: "Overview & Contacts" },
            { id: "services", label: `Services & Menu (${business.services?.length || (business.servicesAndMenu ? "1+" : "0")})` },
            { id: "media", label: `Media & Video (${allMediaPhotos.length + (videoUrl ? 1 : 0)})` },
            { id: "hours", label: "Opening Hours" },
            { id: "owner", label: "Owner Details" },
            { id: "verification", label: "Verification Documents" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3.5 text-xs font-bold transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Tab 1: Overview */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  About Business & Description
                </h3>
                <p className="text-sm text-foreground leading-relaxed">
                  {business.description || "No description provided."}
                </p>
                {business.shortDescription && (
                  <p className="text-xs text-muted-foreground italic mt-2">
                    &ldquo;{business.shortDescription}&rdquo;
                  </p>
                )}
              </div>

              {/* Contact & Location Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-card border border-border space-y-2.5">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Contact Channels
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-foreground">
                      <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{displayPhone || "Not specified"}</span>
                    </div>
                    {business.whatsapp && (
                      <div className="flex items-center gap-2 text-foreground">
                        <Phone className="w-4 h-4 text-green-600 shrink-0" />
                        <span>WhatsApp: +{business.whatsapp}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-foreground">
                      <Mail className="w-4 h-4 text-sky-500 shrink-0" />
                      <span>{business.email || "Not specified"}</span>
                    </div>
                    {business.website && (
                      <div className="flex items-center gap-2 text-foreground">
                        <Globe className="w-4 h-4 text-indigo-500 shrink-0" />
                        <a
                          href={business.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline flex items-center gap-1 truncate max-w-[200px]"
                        >
                          {business.website}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border space-y-2.5">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Location, Building & Floor
                  </div>
                  <div className="space-y-1.5 text-xs text-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                      <span className="font-semibold">
                        {displayAddress}
                      </span>
                    </div>
                    {(business.building || business.floorNumber) && (
                      <div className="text-muted-foreground text-[11px] pl-6">
                        Building: {business.building || "—"} | Floor / Suite: {business.floorNumber || "—"}
                      </div>
                    )}
                    <div className="text-muted-foreground text-[11px] pl-6">
                      City/Country: {displayCity}, {displayCountry}
                    </div>
                    <div className="text-muted-foreground text-[11px] pl-6 font-mono">
                      GPS: {business.latitude ? `${business.latitude.toFixed(5)}° N, ${business.longitude?.toFixed(5)}° E` : "Coordinates recorded"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Amenities Grid */}
              {business.attributes && (
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Amenities & Facilities
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {business.attributes.wifi && <Badge variant="outline" className="p-2">📶 High-Speed Wi-Fi</Badge>}
                    {business.attributes.parking && <Badge variant="outline" className="p-2">🚗 Dedicated Parking</Badge>}
                    {business.attributes.delivery && <Badge variant="outline" className="p-2">🛵 Delivery Service</Badge>}
                    {business.attributes.acceptsCards && <Badge variant="outline" className="p-2">💳 Cards Accepted</Badge>}
                    {business.attributes.outdoorSeating && <Badge variant="outline" className="p-2">🌿 Outdoor Seating</Badge>}
                    {business.attributes.airConditioning && <Badge variant="outline" className="p-2">❄️ Air Conditioning</Badge>}
                    {business.attributes.petFriendly && <Badge variant="outline" className="p-2">🐾 Pet Friendly</Badge>}
                    {business.attributes.accessible && <Badge variant="outline" className="p-2">♿ Accessible</Badge>}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Services & Menu */}
          {activeTab === "services" && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Services, Specialties & Menu Highlights
              </h3>
              {business.services && business.services.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {business.services.map((item, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-card border border-border space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-foreground">{item.name}</span>
                        {item.price && <Badge variant="outline" className="text-xs text-primary">{item.price}</Badge>}
                      </div>
                      {item.description && (
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{item.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : business.servicesAndMenu ? (
                <div className="p-4 rounded-2xl bg-card border border-border text-xs leading-relaxed whitespace-pre-line text-foreground">
                  {business.servicesAndMenu}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No specific services or menu highlights uploaded.</p>
              )}
            </div>
          )}

          {/* Tab 3: Media */}
          {activeTab === "media" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  Uploaded Photos Gallery ({allMediaPhotos.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {allMediaPhotos.map((photo, i) => (
                    <div
                      key={i}
                      className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-border group shadow-sm"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo}
                        alt={`Business Photo ${i + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Video Tour Showcase */}
              {(videoUrl || effectiveYtId) && (
                <div className="space-y-2 pt-4 border-t border-border">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-primary" />
                    <span>Business Video Tour</span>
                  </h3>
                  <div className="relative aspect-video rounded-2xl overflow-hidden border border-border bg-black shadow-lg">
                    {effectiveYtId || (videoUrl && isYoutubeUrl(videoUrl)) ? (
                      <iframe
                        src={getYoutubeEmbedUrl(effectiveYtId || videoUrl) || ""}
                        title="Business Video"
                        className="w-full h-full border-0"
                        allowFullScreen
                      />
                    ) : (
                      <video controls className="w-full h-full object-contain" src={videoUrl || ""} />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Hours */}
          {activeTab === "hours" && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Weekly Operating Hours
              </h3>
              <div className="space-y-2">
                {[
                  { name: "Monday", num: 1 },
                  { name: "Tuesday", num: 2 },
                  { name: "Wednesday", num: 3 },
                  { name: "Thursday", num: 4 },
                  { name: "Friday", num: 5 },
                  { name: "Saturday", num: 6 },
                  { name: "Sunday", num: 0 },
                ].map((d) => {
                  const hourEntry = business.openingHours?.find((h) => h.dayOfWeek === d.num);
                  return (
                    <div
                      key={d.name}
                      className="p-3 rounded-2xl bg-card border border-border flex items-center justify-between text-xs"
                    >
                      <span className="font-bold text-foreground">{d.name}</span>
                      {hourEntry?.isClosed ? (
                        <Badge variant="outline" className="text-[10px] text-red-500 border-red-500/20">
                          Closed
                        </Badge>
                      ) : hourEntry?.is24h ? (
                        <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/20">
                          Open 24 Hours
                        </Badge>
                      ) : (
                        <span className="font-mono text-muted-foreground font-semibold">
                          {hourEntry?.openTime || "08:30"} – {hourEntry?.closeTime || "22:00"}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 5: Owner */}
          {activeTab === "owner" && (
            <div className="p-5 rounded-3xl bg-card border border-border space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-black text-lg">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-sm text-foreground">
                    {business.ownerId ? `Listing Owner (${business.ownerId})` : "Unassigned / Registered User"}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    Owner Reference: {business.ownerId || "Guest / Direct Listing"}
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground pt-2 border-t border-border space-y-1">
                <div>Registered Business Name: {business.name}</div>
                <div>Contact Phone: {displayPhone || "—"}</div>
                <div>Contact Email: {business.email || "—"}</div>
                <div>Registration Date: {new Date(business.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          )}

          {/* Tab 6: Verification Documents */}
          {activeTab === "verification" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    Business Registration & Commercial License Record
                  </div>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                    Official record in {displayCity}, {displayCountry}. Verified status can be granted or toggled by administrators below.
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileCheck className="w-5 h-5 text-primary" />
                  <div>
                    <div className="text-xs font-bold text-foreground">Official_Commercial_License.pdf</div>
                    <div className="text-[10px] text-muted-foreground">Verification Record • Active</div>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs font-semibold text-emerald-600 border-emerald-500/30">
                  Ready for Audit
                </Badge>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <DialogFooter className="p-6 border-t border-border bg-muted/10 flex flex-row items-center justify-between gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>

          <div className="flex items-center gap-2">
            {!business.isVerified && onApprove && (
              <Button
                variant="gradient"
                onClick={() => {
                  onApprove(business.id, business.name);
                  onClose();
                }}
                className="gap-1.5 text-xs font-bold"
              >
                <CheckCircle2 className="w-4 h-4" /> Approve & Verify Listing
              </Button>
            )}
            {business.isVerified && onReject && (
              <Button
                variant="outline"
                onClick={() => {
                  onReject(business.id, business.name);
                  onClose();
                }}
                className="gap-1.5 text-xs text-red-600 border-red-500/30 hover:bg-red-500/10"
              >
                <XCircle className="w-4 h-4" /> Revoke / Suspend
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
