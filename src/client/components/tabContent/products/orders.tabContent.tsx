interface OrdersTabContentProps {
  productId: string;
}

function OrdersTabContent({ productId }: OrdersTabContentProps) {
  // You could eventually fetch orders data for this product here

  return (
    <div className="py-4">
      <p className="text-center text-gray-500">
        No orders found for this product.
      </p>
    </div>
  );
}

export default OrdersTabContent;
