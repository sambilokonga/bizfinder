"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FolderTree, CheckCircle2, Loader2, Sparkles, Edit2 } from "lucide-react";
import { Category } from "@/types/category";

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  categories: Category[];
  onUpdateCategory: (updated: Category) => Promise<void> | void;
}

export function EditCategoryModal({
  isOpen,
  onClose,
  category,
  categories,
  onUpdateCategory,
}: EditCategoryModalProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState<string>("");
  const [icon, setIcon] = useState("FolderTree");
  const [featured, setFeatured] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.name || "");
      setSlug(category.slug || "");
      setParentId(category.parentId || "");
      setIcon(category.icon || "FolderTree");
      setFeatured(Boolean(category.featured));
      setIsSaved(false);
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !name.trim()) return;

    setIsSubmitting(true);
    try {
      const parentCat = categories.find((c) => c.id === parentId);
      const level = parentCat ? parentCat.level + 1 : 1;

      const updatedCategory: Category = {
        ...category,
        name: name.trim(),
        slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        parentId: parentId ? parentId : null,
        level,
        icon: icon.trim() || "FolderTree",
        featured,
      };

      await onUpdateCategory(updatedCategory);
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        onClose();
      }, 600);
    } catch (err) {
      console.error("Error updating category:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!category) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6 bg-card border-border rounded-3xl shadow-2xl">
        <DialogTitle className="text-lg font-black text-foreground flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <Edit2 className="w-4 h-4" />
          </div>
          <span>Edit Category</span>
        </DialogTitle>
        <DialogDescription className="text-xs text-muted-foreground">
          Update actual category attributes and taxonomy hierarchy in MongoDB.
        </DialogDescription>

        {isSaved ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h4 className="font-bold text-base text-foreground">Changes Saved!</h4>
            <p className="text-xs text-muted-foreground">Category taxonomy updated across all listing workflows.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs">
            <div>
              <label className="font-bold text-foreground block mb-1">
                Category Name <span className="text-destructive">*</span>
              </label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Traditional Coffee Ceremonies"
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
                placeholder="e.g. traditional-coffee-ceremonies"
                className="text-xs font-mono rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-foreground block mb-1">
                Parent Category (Hierarchy Level)
              </label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">None (Top-Level Industry / Level 1)</option>
                {categories
                  .filter((c) => c.id !== category.id && c.level < 3)
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {"— ".repeat(cat.level - 1)} {cat.name} (Level {cat.level})
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-foreground block mb-1">
                  Lucide Icon Name
                </label>
                <Input
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="e.g. Coffee, Utensils, Hotel"
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
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" variant="gradient" className="font-bold gap-1.5" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
