"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Ticket, Send, Building2, User, HelpCircle, Shield } from "lucide-react";
import { ISupportTicket, TicketCategory, TicketPriority } from "@/types/ticket";
import { toast } from "sonner";

interface CreateSupportTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTicketCreated: (ticket: ISupportTicket) => void;
  defaultBusinessId?: string;
  defaultBusinessName?: string;
  defaultUserId?: string;
  defaultUserName?: string;
  defaultUserEmail?: string;
  defaultUserRole?: "user" | "owner" | "admin" | "super_admin";
  city?: string;
  country?: string;
  initialCategory?: TicketCategory;
  initialSubject?: string;
}

export const SUPPORT_CATEGORIES: Array<{
  key: TicketCategory;
  label: string;
  desc: string;
  icon: string;
}> = [
  {
    key: "verification",
    label: "Business Verification",
    desc: "Trade license, TIN certificates, and verified badge requests",
    icon: "✅",
  },
  {
    key: "billing",
    label: "Billing & Financial Settlements",
    desc: "Telebirr, CBE Birr, Chapa, Stripe receipts and refunds",
    icon: "💳",
  },
  {
    key: "technical",
    label: "Technical & Platform Issues",
    desc: "Map coordinates, photo uploads, analytics bugs, or API",
    icon: "⚙️",
  },
  {
    key: "listing",
    label: "Listing & Catalog Management",
    desc: "Merges, category changes, branch setups, operating hours",
    icon: "🏢",
  },
  {
    key: "dispute",
    label: "Review Disputes & Legal",
    desc: "Unfair review appeals, competitor infringement claims",
    icon: "⚖️",
  },
  {
    key: "account",
    label: "Account & Security Access",
    desc: "2FA phone resets, email transitions, staff permissions",
    icon: "🔐",
  },
  {
    key: "general",
    label: "General Support & Inquiries",
    desc: "Ecosystem questions, partnership inquiries, and feature suggestions",
    icon: "💬",
  },
];

export function CreateSupportTicketModal({
  isOpen,
  onClose,
  onTicketCreated,
  defaultBusinessId,
  defaultBusinessName,
  defaultUserId = "user_current",
  defaultUserName = "Business Owner",
  defaultUserEmail = "owner@bizfinder.et",
  defaultUserRole = "owner",
  city = "Addis Ababa",
  country = "Ethiopia",
  initialCategory,
  initialSubject,
}: CreateSupportTicketModalProps) {
  const [subject, setSubject] = useState(initialSubject || "");
  const [category, setCategory] = useState<TicketCategory>(initialCategory || "verification");
  const [priority, setPriority] = useState<TicketPriority>("medium");
  const [message, setMessage] = useState("");
  const [businessName, setBusinessName] = useState(defaultBusinessName || "");
  const [userEmail, setUserEmail] = useState(defaultUserEmail || "");
  const [userPhone, setUserPhone] = useState("+251 91 123 4567");
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      if (initialCategory) setCategory(initialCategory);
      if (initialSubject) setSubject(initialSubject);
      if (defaultBusinessName) setBusinessName(defaultBusinessName);
      if (defaultUserEmail) setUserEmail(defaultUserEmail);
    }
  }, [isOpen, initialCategory, initialSubject, defaultBusinessName, defaultUserEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim()) {
      toast.error("Please enter a ticket subject.");
      return;
    }

    if (!message.trim()) {
      toast.error("Please describe your issue or inquiry.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          category,
          priority,
          initialMessage: message.trim(),
          userId: defaultUserId,
          userName: defaultUserName,
          userEmail: userEmail.trim(),
          userPhone: userPhone.trim(),
          userRole: defaultUserRole,
          businessId: defaultBusinessId,
          businessName: businessName.trim() || undefined,
          city,
          country,
        }),
      });

      const data = await res.json();
      if (data?.success && data.data) {
        toast.success(`Support Ticket ${data.data.id} created successfully!`);
        onTicketCreated(data.data);
        onClose();
        // Reset fields
        setSubject("");
        setMessage("");
      } else {
        toast.error(data?.error || "Failed to create support ticket");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error creating ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden rounded-3xl border-border bg-card">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-border/80 bg-muted/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Ticket className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black text-foreground">
                Open Support Ticket
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Submit an official inquiry or escalation to BizFinder Platform Administration.
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Form Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
          {/* Category Selector Cards */}
          <div>
            <label className="font-bold text-foreground block mb-1.5">
              Select Ticket Category
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SUPPORT_CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat.key}
                  onClick={() => setCategory(cat.key)}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-2.5 ${
                    category === cat.key
                      ? "bg-primary/5 border-primary shadow-sm"
                      : "bg-background border-border/80 hover:border-foreground/30"
                  }`}
                >
                  <span className="text-xl shrink-0">{cat.icon}</span>
                  <div>
                    <div className="font-bold text-foreground text-xs">{cat.label}</div>
                    <div className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                      {cat.desc}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="font-bold text-foreground block mb-1">
              Ticket Subject *
            </label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Verification delay for Trade License certificate renewal"
              className="text-xs rounded-xl"
              required
            />
          </div>

          {/* Priority & Business Entity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-foreground block mb-1">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                className="w-full bg-background text-foreground text-xs font-semibold py-2 px-3 rounded-xl border border-border focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="low">⚪ Low (General question)</option>
                <option value="medium">🔵 Medium (Normal operation)</option>
                <option value="high">🔥 High (Financial or verification blocker)</option>
                <option value="critical">🚨 Critical SLA (Business halting / fraud)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-foreground block mb-1">
                Associated Business Name
              </label>
              <Input
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g., Abyssinia Gourmet Cafe"
                className="text-xs rounded-xl"
              />
            </div>
          </div>

          {/* Detailed Message */}
          <div>
            <label className="font-bold text-foreground block mb-1">
              Detailed Issue Description *
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Please provide complete context: invoice numbers, document dates, screenshot details, or specific steps to reproduce the issue..."
              rows={4}
              className="text-xs rounded-xl resize-none"
              required
            />
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-border/80">
            <div>
              <label className="font-bold text-muted-foreground block mb-1">
                Contact Email
              </label>
              <Input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="text-xs rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-muted-foreground block mb-1">
                Direct Telephone
              </label>
              <Input
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                className="text-xs rounded-xl"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border/80">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient"
              disabled={isSubmitting}
              className="text-xs font-bold gap-1.5 shadow-md shadow-primary/20"
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmitting ? "Registering Ticket..." : "Submit Ticket"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
