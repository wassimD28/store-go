interface ReviewsTabContentProps {
  productId: string;
}

function ReviewsTabContent({ productId }: ReviewsTabContentProps) {
  // You could eventually fetch reviews data for this product here

  return (
    <div className="py-4">
      <p className="text-center text-gray-500">
        No reviews available for this product.
      </p>
    </div>
  );
}

export default ReviewsTabContent;
