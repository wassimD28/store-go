interface MessagesTabContentProps {
  productId: string;
}

function MessagesTabContent({ productId }: MessagesTabContentProps) {
  // You could eventually fetch messages data for this product here

  return (
    <div className="py-4">
      <p className="text-center text-gray-500">
        No messages related to this product.
      </p>
    </div>
  );
}

export default MessagesTabContent;
