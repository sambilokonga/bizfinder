"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FolderTree, Plus, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { Category } from "@/types/category";

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onAddCategory: (category: Partial<Category>) => Promise<void> | void;
  defaultParentId?: string;
}

export function AddCategoryModal({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  defaultParentId,
}: AddCategoryModalProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState<string>("");
  const [icon, setIcon] = useState("FolderTree");
  const [featured, setFeatured] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setSlug("");
      setParentId(defaultParentId || "");
      setIcon(defaultParentId ? "Tag" : "FolderTree");
      setFeatured(false);
      setIsSaved(false);
    }
  }, [isOpen, defaultParentId]);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const parentCat = categories.find((c) => c.id === parentId);
      const level = parentCat ? parentCat.level + 1 : 1;

      const newCategory: Partial<Category> = {
        name: name.trim(),
        slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        parentId: parentId ? parentId : null,
        level,
        icon: icon.trim() || (level === 1 ? "FolderTree" : "Tag"),
        featured,
      };

      await onAddCategory(newCategory);
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        onClose();
      }, 700);
    } catch (err) {
      console.error("Error registering category:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter possible parents (level 1 or 2, don't allow nesting deeper than 3)
  const availableParents = categories.filter((c) => c.level === 1 || c.level === 2);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6 bg-card border-border rounded-3xl shadow-2xl">
        <DialogTitle className="text-lg font-black text-foreground flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <FolderTree className="w-4 h-4" />
          </div>
          <span>Register New Category</span>
        </DialogTitle>
        <DialogDescription className="text-xs text-muted-foreground">
          Register an official industry, category, or subcategory directly to MongoDB.
        </DialogDescription>

        {isSaved ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h4 className="font-bold text-base text-foreground">Category Registered!</h4>
            <p className="text-xs text-muted-foreground">Saved to actual database & integrated into listing wizards.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs">
            <div>
              <label className="font-bold text-foreground block mb-1">
                Category / Taxonomy Name <span className="text-destructive">*</span>
              </label>
              <Input
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Renewable Energy & Solar"
                className="text-xs rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-foreground block mb-1">
                URL Slug <span className="text-destructive">*</span>
              </label>
              <Input
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. renewable-energy-solar"
                className="text-xs font-mono rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-foreground block mb-1">
                Parent Category (Hierarchy Level)
              </label>
              <select
                value={parentId}
                onChange={(e) => {
                  setParentId(e.target.value);
                  if (!e.target.value) setIcon("FolderTree");
                  else setIcon("Tag");
                }}
                className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">None (Top-Level Industry / Level 1)</option>
                {availableParents.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.level === 2 ? `↳ ${c.name}` : c.name} (Level {c.level})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-foreground block mb-1">
                  Lucide Icon
                </label>
                <Input
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="e.g. Zap, Coffee, Store"
                  className="text-xs font-mono rounded-xl"
                />
              </div>
              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 cursor-pointer pb-2.5">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="rounded border-input text-primary focus:ring-primary w-4 h-4"
                  />
                  <span className="font-bold text-foreground text-xs flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Featured
                  </span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" variant="gradient" size="sm" className="font-bold gap-1.5" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Registering...
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" /> Register Category
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
