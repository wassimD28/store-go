import { useState, useEffect } from "react";
import { Avatar } from "@/client/components/ui/avatar";
import { Badge } from "@/client/components/ui/badge";
import { Button } from "@/client/components/ui/button";
import { Skeleton } from "@/client/components/ui/skeleton";
import { StarIcon, Star, MessageSquare } from "lucide-react";
import {
  getProductReviews,
  ReviewWithUser,
} from "@/app/actions/review.actions";
import Image from "next/image";

// Updated interface to match ReviewWithUser from server actions
interface ReviewsTabContentProps {
  productId: string;
}

function ReviewsTabContent({ productId }: ReviewsTabContentProps) {
  const [reviews, setReviews] = useState<ReviewWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [averageRating, setAverageRating] = useState<number>(0);

  useEffect(() => {
    async function loadReviews() {
      setLoading(true);
      try {
        const response = await getProductReviews(productId);

        if (response.success && response.data) {
          setReviews(response.data);

          // Calculate average rating
          if (response.data.length > 0) {
            const totalRating = response.data.reduce(
              (sum, review) => sum + review.rating,
              0,
            );
            setAverageRating(totalRating / response.data.length);
          }
        } else if (!response.success) {
          // Fixed error handling - check success flag first
          setError(response.error || "Failed to load reviews");
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        setError("An error occurred while fetching reviews");
      } finally {
        setLoading(false);
      }
    }

    loadReviews();
  }, [productId]);

  // Helper function to render star ratings
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star}>
            {star <= rating ? (
              <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            ) : (
              <Star className="h-4 w-4 text-gray-300" />
            )}
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3 rounded-lg border p-4">
            <div className="flex justify-between">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-16 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <MessageSquare className="mx-auto mb-2 h-12 w-12 text-gray-400" />
        <p className="text-gray-500">{error}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="p-6 text-center">
        <MessageSquare className="mx-auto mb-2 h-12 w-12 text-gray-400" />
        <h3 className="mb-1 font-medium">No Reviews Yet</h3>
        <p className="mb-4 text-gray-500">
          Be the first to review this product
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Reviews summary */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="space-y-1">
          <h3 className="text-lg font-medium">Customer Reviews</h3>
          <div className="flex items-center space-x-2">
            {renderStars(Math.round(averageRating))}
            <span className="text-sm font-medium">
              {averageRating.toFixed(1)} out of 5
            </span>
          </div>
        </div>
        <Badge variant="outline" className="px-2 py-1">
          {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}
        </Badge>
      </div>

      {/* Reviews list */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="space-y-3 rounded-lg border p-4 transition-all hover:border-primary"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10 border">
                  {review.appUser.avatar ? (
                    <Image
                      src={review.appUser.avatar}
                      alt={review.appUser.name}
                      className="object-cover"
                      width={100}
                      height={100}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary/10 font-medium text-primary">
                      {review.appUser.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </Avatar>
                <div>
                  <p className="font-medium">{review.appUser.name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div>{renderStars(review.rating)}</div>
            </div>
            <p className="text-gray-700">{review.content || ""}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReviewsTabContent;
