import { Context } from "hono";
import { PromotionRepository } from "@/server/repositories/promotion.repository";
import { idSchema } from "../schemas/common.schema";

export class PromotionController {
  static async getAllPromotions(c: Context) {
    try {
      const { storeId } = c.get("user");
      const promotions = await PromotionRepository.findAll(storeId);

      return c.json({
        status: "success",
        data: promotions,
      });
    } catch (error) {
      console.error("Error in getAllPromotions:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to fetch promotions",
        },
        500,
      );
    }
  }

  static async getPromotionById(c: Context) {
    try {
      const promotionId = c.req.param("promotionId");
      // Validate ID
      const validId = idSchema.safeParse(promotionId);
      if (!validId.success) {
        return c.json(
          {
            status: "error",
            message: "Invalid promotion ID",
          },
          400,
        );
      }

      const { storeId } = c.get("user");
      const promotion = await PromotionRepository.findById(promotionId, storeId);

      if (!promotion) {
        return c.json(
          {
            status: "error",
            message: "Promotion not found",
          },
          404,
        );
      }

      return c.json({
        status: "success",
        data: promotion,
      });
    } catch (error) {
      console.error("Error in getPromotionById:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to fetch promotion",
        },
        500,
      );
    }
  }
}
