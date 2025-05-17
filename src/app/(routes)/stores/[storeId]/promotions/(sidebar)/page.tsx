import { getPromotionsByStore } from "@/app/actions/promotion.actions";
import { PromotionTableClient } from "@/client/components/data-table/tables/promotion.table";
import { Button } from "@/client/components/ui/button";
import Heading from "@/client/components/ui/heading";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

interface PromotionsPageProps {
  params: Promise<{ storeId: string }>;
}

const PromotionsPage = async ({ params }: PromotionsPageProps) => {
  const storeId = (await params).storeId;

  // Fetch promotions
  const promotionsResult = await getPromotionsByStore(storeId);

  return (
    <div className="h-full w-full p-4">
      <div className="mb-6 flex items-center justify-between">
        <Heading
          title="Promotions"
          description="Manage your store promotions and discounts"
        />
        <div className="flex space-x-2">
          <Link href={`/stores/${storeId}/promotions/new`}>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Promotion
            </Button>
          </Link>
        </div>
      </div>

      {!promotionsResult.success ? (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{promotionsResult.error || "Failed to fetch promotions"}</p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : !promotionsResult.promotions ||
        promotionsResult.promotions.length === 0 ? (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>No Promotions Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              You haven&apos;t created any promotions yet. Click the &quot;Add
              Promotion&quot; button to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <PromotionTableClient
          promotions={promotionsResult.promotions.map((promotion) => ({
            ...promotion,
            applicableProducts: Array.isArray(promotion.applicableProducts)
              ? promotion.applicableProducts
              : [],
            applicableCategories: Array.isArray(promotion.applicableCategories)
              ? promotion.applicableCategories
              : [],
          }))}
        />
      )}
    </div>
  );
};

export default PromotionsPage;
