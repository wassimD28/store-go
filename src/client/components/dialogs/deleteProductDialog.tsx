"use client";

import { useState } from "react";
import { Button } from "@/client/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/client/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import TrashIcon from "../icons/trashIcon";
import { deleteProduct } from "@/app/actions/product.actions";
import toast from "react-hot-toast";

interface DeleteProductDialogProps {
  productId: string;
  productName: string;
  onDeleteSuccess?: () => void;
}

export function DeleteProductDialog({
  productId,
  productName,
  onDeleteSuccess,
}: DeleteProductDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await deleteProduct(productId);

      if (response.success) {
        toast.success(`${productName} has been deleted successfully`);

        if (onDeleteSuccess) {
          onDeleteSuccess();
        }
      } else {
        toast.error(response.error || "Failed to delete product");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Delete Product">
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-[400px] px-4 pt-10">
        <div className="flex items-center justify-center pb-4">
          <div className="rounded-full bg-red-50 p-6">
            <TrashIcon width={24} height={28} color="#CB0101" />
          </div>
        </div>
        <AlertDialogHeader className="text-center">
          <AlertDialogTitle className="text-xl text-center font-semibold">
            Delete Product
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-foreground/50">
            Do you want to delete &quot;{productName}&quot;? This action can&apos;t be undone
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex justify-between gap-20 pt-4">
          <AlertDialogCancel
            disabled={isDeleting}
            className="flex-1 border border-foreground/50 bg-background text-foreground/70 hover:bg-foreground/5"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 bg-red-600 text-white hover:bg-red-700"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
