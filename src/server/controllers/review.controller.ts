
import { Context } from "hono";
import { ReviewRepository } from "@/server/repositories/review.repository";
import { idSchema } from "../schemas/common.schema";
import { z } from "zod";

// Define a schema for review data validation
const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  content: z.string().optional(),
  productId: z.string().uuid(),
});

// Define types to match repository


interface ReviewUpdateData {
  rating?: number;
  content?: string;
}

export class ReviewController {
  static async getReviewsByProductId(c: Context) {
    try {
      const productId = c.req.param("productId");
      // Validate product ID
      const validId = idSchema.safeParse(productId);
      if (!validId.success) {
        return c.json(
          {
            status: "error",
            message: "Invalid product ID",
          },
          400,
        );
      }

      const { storeId } = c.get("user");
      const reviews = await ReviewRepository.findByProductId(
        productId,
        storeId,
      );

      return c.json({
        status: "success",
        data: reviews,
      });
    } catch (error) {
      console.error("Error in getReviewsByProductId:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to fetch reviews",
        },
        500,
      );
    }
  }

  static async getReviewById(c: Context) {
    try {
      const reviewId = c.req.param("reviewId");
      // Validate review ID
      const validId = idSchema.safeParse(reviewId);
      if (!validId.success) {
        return c.json(
          {
            status: "error",
            message: "Invalid review ID",
          },
          400,
        );
      }

      const review = await ReviewRepository.findById(reviewId);
      if (!review) {
        return c.json(
          {
            status: "error",
            message: "Review not found",
          },
          404,
        );
      }

      return c.json({
        status: "success",
        data: review,
      });
    } catch (error) {
      console.error("Error in getReviewById:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to fetch review",
        },
        500,
      );
    }
  }

  static async createReview(c: Context) {
    try {
      const productId = c.req.param("productId");
      // Validate product ID
      const validId = idSchema.safeParse(productId);
      if (!validId.success) {
        return c.json(
          {
            status: "error",
            message: "Invalid product ID",
          },
          400,
        );
      }

      // Get user data from authenticated context
      const { id: appUserId, storeId } = c.get("user");

      // Check if the request has content before trying to parse it
      const contentType = c.req.header("Content-Type");
      const contentLength = parseInt(c.req.header("Content-Length") || "0");

      // Check if the request body is empty
      if (
        !contentType ||
        !contentType.includes("application/json") ||
        contentLength === 0
      ) {
        return c.json(
          {
            status: "error",
            message: "Request body is required and must be JSON format",
          },
          400,
        );
      }

      // Try to parse the body with error handling
      let body;
      try {
        body = await c.req.json();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        return c.json(
          {
            status: "error",
            message: "Invalid JSON in request body",
          },
          400,
        );
      }

      // Check if body is empty after parsing (could be {})
      if (!body || Object.keys(body).length === 0) {
        return c.json(
          {
            status: "error",
            message: "Review data is required",
          },
          400,
        );
      }

      // Parse and validate request body
      const validatedData = reviewSchema.safeParse({
        ...body,
        productId,
      });

      if (!validatedData.success) {
        return c.json(
          {
            status: "error",
            message: "Invalid review data",
            errors: validatedData.error.format(),
          },
          400,
        );
      }

      // Check if product exists
      const product = await ReviewRepository.checkProductExists(
        productId,
        storeId,
      );
      if (!product) {
        return c.json(
          {
            status: "error",
            message: "Product not found",
          },
          404,
        );
      }

      // Check if user already reviewed this product
      const existingReview = await ReviewRepository.findByUserAndProduct(
        appUserId,
        productId,
      );
      if (existingReview) {
        return c.json(
          {
            status: "error",
            message: "You have already reviewed this product",
          },
          400,
        );
      }

      // Create the review
      const reviewData = {
        storeId,
        appUserId,
        productId,
        rating: validatedData.data.rating,
        content: validatedData.data.content || null,
      };

      const newReview = await ReviewRepository.create(reviewData);

      return c.json(
        {
          status: "success",
          message: "Review created successfully",
          data: newReview,
        },
        201,
      );
    } catch (error) {
      console.error("Error in createReview:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to create review",
        },
        500,
      );
    }
  }

  static async updateReview(c: Context) {
    try {
      const reviewId = c.req.param("reviewId");
      // Validate review ID
      const validId = idSchema.safeParse(reviewId);
      if (!validId.success) {
        return c.json(
          {
            status: "error",
            message: "Invalid review ID",
          },
          400,
        );
      }

      // Get user data from authenticated context
      const { id: appUserId } = c.get("user");

      // Check if the request has content before trying to parse it
      const contentType = c.req.header("Content-Type");
      const contentLength = parseInt(c.req.header("Content-Length") || "0");

      // Check if the request body is empty
      if (
        !contentType ||
        !contentType.includes("application/json") ||
        contentLength === 0
      ) {
        return c.json(
          {
            status: "error",
            message: "Request body is required and must be JSON format",
          },
          400,
        );
      }

      // Check if review exists and belongs to the user
      const existingReview = await ReviewRepository.findById(reviewId);
      if (!existingReview) {
        return c.json(
          {
            status: "error",
            message: "Review not found",
          },
          404,
        );
      }

      if (existingReview.appUserId !== appUserId) {
        return c.json(
          {
            status: "error",
            message: "You are not authorized to update this review",
          },
          403,
        );
      }

      // Parse and validate request body
      const body = await c.req.json();

      // Check for typos in field names by using strict validation
      const updateSchema = z
        .object({
          rating: z.number().min(1).max(5).optional(),
          content: z.string().optional(),
        })
        .strict()
        .refine((data) => Object.keys(data).length > 0, {
          message: "At least one field must be provided for update",
        });

      const validatedData = updateSchema.safeParse(body);
      if (!validatedData.success) {
        return c.json(
          {
            status: "error",
            message: "Invalid review data",
            errors: validatedData.error.format(),
          },
          400,
        );
      }

      // Update the review
      const updateData: ReviewUpdateData = validatedData.data;
      const updatedReview = await ReviewRepository.update(reviewId, updateData);

      return c.json({
        status: "success",
        message: "Review updated successfully",
        data: updatedReview,
      });
    } catch (error) {
      console.error("Error in updateReview:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to update review",
        },
        500,
      );
    }
  }

  static async deleteReview(c: Context) {
    try {
      const reviewId = c.req.param("reviewId");
      // Validate review ID
      const validId = idSchema.safeParse(reviewId);
      if (!validId.success) {
        return c.json(
          {
            status: "error",
            message: "Invalid review ID",
          },
          400,
        );
      }

      // Get user data from authenticated context
      const { id: appUserId } = c.get("user");

      // Check if review exists and belongs to the user
      const existingReview = await ReviewRepository.findById(reviewId);
      if (!existingReview) {
        return c.json(
          {
            status: "error",
            message: "Review not found",
          },
          404,
        );
      }

      if (existingReview.appUserId !== appUserId) {
        return c.json(
          {
            status: "error",
            message: "You are not authorized to delete this review",
          },
          403,
        );
      }

      // Delete the review
      await ReviewRepository.delete(reviewId);

      return c.json({
        status: "success",
        message: "Review deleted successfully",
      });
    } catch (error) {
      console.error("Error in deleteReview:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to delete review",
        },
        500,
      );
    }
  }
}
