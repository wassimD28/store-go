"use client";

import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/client/components/ui/alert-dialog";
import { Button } from "@/client/components/ui/button";
import { Trash2 } from "lucide-react";

import { deleteCategory } from "@/app/actions/category.actions";
import toast from "react-hot-toast";

interface DeleteCategoryDialogProps {
  categoryId: string;
  categoryName: string;
  onDeleteSuccess: () => void;
}

export function DeleteCategoryDialog({
  categoryId,
  categoryName,
  onDeleteSuccess,
}: DeleteCategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const result = await deleteCategory(categoryId);

      if (result.success) {
        toast.success(`"${categoryName}" has been removed successfully.`);
        onDeleteSuccess();
        setOpen(false);
      } else {
        // Show the error in the dialog instead of a toast for constraint issues
        setErrorMessage(result.error || "Failed to delete category");
        toast.error("Delete operation failed");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
      toast.error("Failed to delete the category. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          setErrorMessage(null);
          setOpen(true);
        }}
        title="Delete Category"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{categoryName}&quot;? This
              action cannot be undone.
              {errorMessage && (
                <div className="mt-4 rounded-md border border-destructive bg-destructive/10 p-3 text-destructive">
                  {errorMessage}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
