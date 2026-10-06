"use client";

import React, { useState } from "react";
import { Clock, CheckCircle2, Save, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Business, OpeningHourSlot } from "@/types/business";

interface HoursEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: Business;
  onSaveHours: (hours: OpeningHourSlot[]) => void;
}

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export function HoursEditorModal({
  isOpen,
  onClose,
  business,
  onSaveHours,
}: HoursEditorModalProps) {
  // Normalize opening hours to 7 days
  const [schedule, setSchedule] = useState<OpeningHourSlot[]>(() => {
    return DAYS_OF_WEEK.map((day, idx) => {
      const existing = business.openingHours.find((h) => h.dayOfWeek === idx + 1);
      return (
        existing || {
          dayOfWeek: idx + 1,
          openTime: "08:00",
          closeTime: "22:00",
          isClosed: false,
          is24h: false,
        }
      );
    });
  });

  const [isSaved, setIsSaved] = useState(false);

  const handleUpdateDay = (
    dayOfWeek: number,
    field: keyof OpeningHourSlot,
    value: any
  ) => {
    setSchedule((prev) =>
      prev.map((slot) =>
        slot.dayOfWeek === dayOfWeek ? { ...slot, [field]: value } : slot
      )
    );
  };

  const handleSave = () => {
    onSaveHours(schedule);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-6 bg-card border-border rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="text-xl font-black text-foreground flex items-center justify-between pb-2 border-b border-border">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            <span>Manage Weekly Business Hours</span>
          </div>
        </DialogTitle>

        {isSaved ? (
          <div className="py-12 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h3 className="text-lg font-bold text-foreground">
              Opening Hours Saved!
            </h3>
            <p className="text-xs text-muted-foreground">
              Your live status badge now reflects this updated schedule.
            </p>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <p className="text-xs text-muted-foreground">
              Configure daily operating times. BizFinder calculates live "Open Now", "Closing Soon", and overnight shift countdowns automatically.
            </p>

            <div className="space-y-3 divide-y divide-border/60">
              {schedule.map((slot, index) => {
                const dayName = DAYS_OF_WEEK[slot.dayOfWeek - 1];
                return (
                  <div
                    key={slot.dayOfWeek}
                    className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <span className="font-bold text-foreground w-24">
                      {dayName}
                    </span>

                    {/* Controls */}
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="flex items-center gap-1.5 cursor-pointer text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={slot.isClosed}
                          onChange={(e) =>
                            handleUpdateDay(
                              slot.dayOfWeek,
                              "isClosed",
                              e.target.checked
                            )
                          }
                          className="w-4 h-4 rounded accent-primary"
                        />
                        <span>Closed</span>
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={slot.is24h}
                          onChange={(e) =>
                            handleUpdateDay(
                              slot.dayOfWeek,
                              "is24h",
                              e.target.checked
                            )
                          }
                          className="w-4 h-4 rounded accent-primary"
                        />
                        <span>24 Hours</span>
                      </label>

                      {!slot.isClosed && !slot.is24h && (
                        <div className="flex items-center gap-1.5">
                          <Input
                            type="time"
                            value={slot.openTime || "08:00"}
                            onChange={(e) =>
                              handleUpdateDay(
                                slot.dayOfWeek,
                                "openTime",
                                e.target.value
                              )
                            }
                            className="h-8 w-28 text-xs"
                          />
                          <span>to</span>
                          <Input
                            type="time"
                            value={slot.closeTime || "22:00"}
                            onChange={(e) =>
                              handleUpdateDay(
                                slot.dayOfWeek,
                                "closeTime",
                                e.target.value
                              )
                            }
                            className="h-8 w-28 text-xs"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="gradient"
                onClick={handleSave}
                className="gap-2 font-bold"
              >
                <Save className="w-4 h-4" />
                Save Schedule
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
