"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, CheckCircle2 } from "lucide-react";
import { LocationNode, LocationType } from "@/types/location";

interface EditLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: LocationNode | null;
  locations: LocationNode[];
  onUpdateLocation: (updated: LocationNode) => void;
}

export function EditLocationModal({
  isOpen,
  onClose,
  location,
  locations,
  onUpdateLocation,
}: EditLocationModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<LocationType>("subcity");
  const [parentId, setParentId] = useState("");
  const [latitude, setLatitude] = useState(8.9954);
  const [longitude, setLongitude] = useState(38.7891);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (location) {
      setName(location.name || "");
      setType(location.type || "subcity");
      setParentId(location.parentId || "");
      setLatitude(location.latitude ?? 8.9954);
      setLongitude(location.longitude ?? 38.7891);
    }
  }, [location]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location || !name.trim()) return;

    const updatedLoc: LocationNode = {
      ...location,
      name: name.trim(),
      type,
      parentId: parentId || null,
      latitude: Number(latitude),
      longitude: Number(longitude),
    };

    onUpdateLocation(updatedLoc);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  if (!location) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6 bg-card border-border rounded-3xl">
        <DialogTitle className="text-lg font-black text-foreground flex items-center gap-2">
          <MapPin className="w-5 h-5 text-indigo-500" />
          <span>Edit Location Node</span>
        </DialogTitle>

        {isSaved ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto animate-bounce" />
            <h4 className="font-bold text-sm text-foreground">
              Location Node Updated!
            </h4>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs">
            <div>
              <label className="font-bold text-foreground block mb-1">
                Location Name
              </label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Bole Medhanialem"
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-foreground block mb-1">
                  Location Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as LocationType)}
                  className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="country">Country</option>
                  <option value="region">Region</option>
                  <option value="city">City</option>
                  <option value="subcity">Subcity</option>
                  <option value="district">District / Woreda</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">
                  Parent Location
                </label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">None (Root Node)</option>
                  {locations
                    .filter((l) => l.id !== location.id)
                    .map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.type})
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-foreground block mb-1">
                  Latitude
                </label>
                <Input
                  type="number"
                  step="0.0001"
                  value={latitude}
                  onChange={(e) => setLatitude(Number(e.target.value))}
                  className="text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">
                  Longitude
                </label>
                <Input
                  type="number"
                  step="0.0001"
                  value={longitude}
                  onChange={(e) => setLongitude(Number(e.target.value))}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" variant="gradient">
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
