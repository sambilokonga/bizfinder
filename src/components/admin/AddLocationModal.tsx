"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Plus, CheckCircle2 } from "lucide-react";
import { LocationNode, LocationType } from "@/types/location";

interface AddLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  locations: LocationNode[];
  onAddLocation: (location: LocationNode) => void;
}

export function AddLocationModal({
  isOpen,
  onClose,
  locations,
  onAddLocation,
}: AddLocationModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<LocationType>("subcity");
  const [parentId, setParentId] = useState("");
  const [latitude, setLatitude] = useState(8.9954);
  const [longitude, setLongitude] = useState(38.7891);
  const [isSaved, setIsSaved] = useState(false);

  const handleNameChange = (val: string) => {
    setName(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newLoc: LocationNode = {
      id: `loc-${Date.now()}`,
      name: name.trim(),
      type,
      parentId: parentId || null,
      latitude: Number(latitude),
      longitude: Number(longitude),
    };

    onAddLocation(newLoc);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      setName("");
      setParentId("");
      onClose();
    }, 800);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6 bg-card border-border rounded-3xl">
        <DialogTitle className="text-lg font-black text-foreground flex items-center gap-2">
          <MapPin className="w-5 h-5 text-indigo-500" />
          <span>Add Location Node</span>
        </DialogTitle>

        {isSaved ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto animate-bounce" />
            <h4 className="font-bold text-sm text-foreground">
              Location Node Added!
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
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Gerji"
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
                  <option value="district">District / Neighborhood</option>
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
                  <option value="">None (Top Root)</option>
                  {locations.map((loc) => (
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
                  Latitude GPS
                </label>
                <Input
                  type="number"
                  step="any"
                  required
                  value={latitude}
                  onChange={(e) => setLatitude(Number(e.target.value))}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">
                  Longitude GPS
                </label>
                <Input
                  type="number"
                  step="any"
                  required
                  value={longitude}
                  onChange={(e) => setLongitude(Number(e.target.value))}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="gradient" size="sm" className="font-bold">
                Create Location
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
