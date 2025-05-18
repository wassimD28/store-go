import { Context } from "hono";
import { ReviewRepository } from "@/server/repositories/review.repository";
import { idSchema } from "../schemas/common.schema";
import { z } from "zod";
import Pusher from "pusher";
import { StoreNotificationRepository } from "../repositories/notification.repository";

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
  static pusherServer = (() => {
    try {
      // Check if all required variables are defined
      const appId = process.env.PUSHER_APP_ID!;
      const key = process.env.NEXT_PUBLIC_PUSHER_KEY!;
      const secret = process.env.PUSHER_APP_SECRET!;
      const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER!;

      if (!appId || !key || !secret || !cluster) {
        console.warn(
          "Pusher environment variables are missing. Real-time notifications will be disabled.",
        );
        return null;
      }

      return new Pusher({
        appId,
        key,
        secret,
        cluster,
      });
    } catch (error) {
      console.error("Failed to initialize Pusher:", error);
      return null;
    }
  })();

  static async getReviewsByProductId(c: Context) {
    try {
      const productId = c.req.param("productId");
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
      console.log(`Received request to create review for product: ${productId}`);
      
      const validId = idSchema.safeParse(productId);
      if (!validId.success) {
        console.log(`Invalid product ID: ${productId}`);
        return c.json(
          {
            status: "error",
            message: "Invalid product ID",
          },
          400,
        );
      }

      const user = c.get("user");
      if (!user || !user.id) {
        console.log('User authentication failed: user or user.id missing');
        return c.json(
          {
            status: "error",
            message: "User not authenticated or user ID missing",
          },
          401,
        );
      }

      const { id: appUserId, storeId } = user;
      if (!appUserId) {
        console.log('User ID is missing');
        return c.json(
          {
            status: "error",
            message: "User ID is required",
          },
          400,
        );
      }
      console.log(`Authenticated user: ${appUserId}, store: ${storeId}`);

      const contentType = c.req.header("Content-Type");
      const contentLength = parseInt(c.req.header("Content-Length") || "0");
      console.log(`Content-Type: ${contentType}, Content-Length: ${contentLength}`);

      if (
        !contentType ||
        !contentType.includes("application/json") ||
        contentLength === 0
      ) {
        console.log('Invalid request body: Content-Type or body missing');
        return c.json(
          {
            status: "error",
            message: "Request body is required and must be JSON format",
          },
          400,
        );
      }

      let body;
      try {
        body = await c.req.json();
      } catch (error) {
        console.log('Invalid JSON in request body:', error);
        return c.json(
          {
            status: "error",
            message: "Invalid JSON in request body",
          },
          400,
        );
      }

      if (!body || Object.keys(body).length === 0) {
        console.log('Review data is empty');
        return c.json(
          {
            status: "error",
            message: "Review data is required",
          },
          400,
        );
      }

      const validatedData = reviewSchema.safeParse({
        ...body,
        productId,
      });

      if (!validatedData.success) {
        console.log('Invalid review data:', validatedData.error.format());
        return c.json(
          {
            status: "error",
            message: "Invalid review data",
            errors: validatedData.error.format(),
          },
          400,
        );
      }

      const product = await ReviewRepository.checkProductExists(
        productId,
        storeId,
      );
      if (!product) {
        console.log(`Product not found: ${productId} in store ${storeId}`);
        return c.json(
          {
            status: "error",
            message: "Product not found",
          },
          404,
        );
      }
      console.log(`Product found: ${productId}`);

      const existingReview = await ReviewRepository.findByUserAndProduct(
        appUserId,
        productId,
      );
      if (existingReview) {
        console.log(`Duplicate review by user ${appUserId} for product ${productId}`);
        return c.json(
          {
            status: "error",
            message: "You have already reviewed this product",
          },
          400,
        );
      }

      const reviewData = {
        storeId,
        appUserId,
        productId,
        rating: validatedData.data.rating,
        content: validatedData.data.content || null,
      };

      console.log("Creating review with data:", JSON.stringify(reviewData));
      
      const newReview = await ReviewRepository.create(reviewData);
      // Create notification record
      await StoreNotificationRepository.create({
        storeId,
        type: "new_review",
        title: "New review received",
        content: `A product received a ${validatedData.data.rating}-star review`,
        data: {
          productId,
          reviewId: newReview.id,
          rating: newReview.rating,
          appUserId
        },
      });

      // Trigger notification after review is created
      // Only trigger if pusherServer is initialized
      if (ReviewController.pusherServer) {
        try {
          await ReviewController.pusherServer.trigger(
            `store-${storeId}`,
            "new-review",
            {
              productId,
              reviewId: newReview.id,
              rating: newReview.rating,
              appUserId
            },
          );
        } catch (error) {
          console.error("Error triggering Pusher notification:", error);
          // Continue with the response - don't let Pusher failure break the API
        }
      }

      console.log('Review created successfully:', newReview);
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
          message: error instanceof Error ? error.message : "Failed to create review",
        },
        500,
      );
    }
  }

  static async updateReview(c: Context) {
    try {
      const reviewId = c.req.param("reviewId");
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

      const { id: appUserId } = c.get("user");

      const contentType = c.req.header("Content-Type");
      const contentLength = parseInt(c.req.header("Content-Length") || "0");

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

      const body = await c.req.json();

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

      const { id: appUserId } = c.get("user");

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