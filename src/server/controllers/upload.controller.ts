import { Context } from "hono";
import ImageKit from "imagekit";
import { idSchema } from "../schemas/common.schema";
import { UserRepository } from "../repositories/user.repository";

interface FileData {
  buffer: Buffer;
  type: string;
  name?: string;
  size: number;
}

export class UploadController {
  // Initialize ImageKit with your credentials
  static imagekit = new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
  });

  /**
   * Helper function to process file data from form data
   * Handles both File objects and string/Blob data
   */
  static async processFileData(fileInput: unknown): Promise<FileData | null> {
    // If there's no file, return null
    if (!fileInput) return null;

    // Handle File object case (browser environment)
    if (typeof File !== "undefined" && fileInput instanceof File) {
      const arrayBuffer = await fileInput.arrayBuffer();
      return {
        buffer: Buffer.from(arrayBuffer),
        type: fileInput.type,
        name: fileInput.name,
        size: fileInput.size,
      };
    }

    // Handle Blob case
    if (fileInput instanceof Blob) {
      const arrayBuffer = await fileInput.arrayBuffer();
      return {
        buffer: Buffer.from(arrayBuffer),
        type: fileInput.type,
        size: fileInput.size,
      };
    }

    // Handle string case (might happen in some environments)
    if (typeof fileInput === "string") {
      // For string data, we might have base64 encoded data
      // This is just a fallback scenario and might need adjustment
      try {
        const buffer = Buffer.from(fileInput, "base64");
        return {
          buffer,
          type: "application/octet-stream", // Default MIME type
          size: buffer.length,
        };
      } catch (error) {
        console.error("Error processing string file data:", error);
        return null;
      }
    }

    // If none of the above cases match, return null
    return null;
  }

  /**
   * Helper function to extract fileId from ImageKit URL
   * Returns null if fileId cannot be extracted
   */
  static extractFileIdFromUrl(url: string): string | null {
    try {
      // Check if the URL is from ImageKit
      if (!url || !url.includes("ik.imagekit.io")) {
        return null;
      }

      // ImageKit fileIds can be extracted from URLs in different ways depending on your setup
      // Method 1: Try to extract from URL path by getting the last segment without extension
      const urlPath = new URL(url).pathname;
      const segments = urlPath.split("/");
      const filename = segments[segments.length - 1];

      // If the filename contains an underscore with a random string (common in ImageKit)
      if (filename.includes("_")) {
        const parts = filename.split("_");
        if (parts.length >= 2) {
          // The last part typically contains the fileId before the extension
          const lastPart = parts[parts.length - 1];
          // Remove file extension if exists
          return lastPart.split(".")[0] || null;
        }
      }

      // Method 2: If your ImageKit URLs contain the fileId directly
      // This is an example pattern - adjust based on your actual URL structure
      const matches = url.match(/\/([a-zA-Z0-9]{24})($|\/|\.|_)/);
      if (matches && matches[1]) {
        return matches[1];
      }

      return null;
    } catch (error) {
      console.error("Error extracting fileId from URL:", error);
      return null;
    }
  }

  /**
   * Handle avatar upload for user
   * Will replace existing avatar if user already has one
   */
  static async uploadAvatar(c: Context) {
    try {
      // Get user ID from params
      const userId = c.req.param("userId");

      // Validate user ID
      const validId = idSchema.safeParse(userId);
      if (!validId.success) {
        return c.json(
          {
            status: "error",
            message: "Invalid user ID format",
            details: validId.error.errors,
          },
          400,
        );
      }

      // Check if the user exists
      const user = await UserRepository.findById(userId);
      if (!user) {
        return c.json(
          {
            status: "error",
            message: `User with ID ${userId} not found`,
          },
          404,
        );
      }

      // Check permissions
      const { id: currentUserId } = c.get("user");
      if (currentUserId !== userId) {
        const isAdmin = c.get("isAdmin") || false;
        if (!isAdmin) {
          return c.json(
            {
              status: "error",
              message: "You don't have permission to update this user's avatar",
            },
            403,
          );
        }
      }

      // Check content type to ensure we have the right format
      const contentType = c.req.header("content-type") || "";
      if (!contentType.includes("multipart/form-data")) {
        return c.json(
          {
            status: "error",
            message: "Content-Type must be multipart/form-data",
            details:
              "Make sure you're sending the request as form-data, not raw JSON or other formats",
          },
          400,
        );
      }

      let formData;
      try {
        // Get form data with the image file
        formData = await c.req.formData();
      } catch (error) {
        console.error("FormData parsing error:", error);
        return c.json(
          {
            status: "error",
            message: "Failed to parse form data",
            details:
              "Ensure you're properly formatting the multipart form data request",
            error: error instanceof Error ? error.message : "Unknown error",
          },
          400,
        );
      }

      const fileInput = formData.get("avatar");

      // Process the file data
      const fileData = await UploadController.processFileData(fileInput);

      // Handle case where no file is provided or processing failed
      if (!fileData) {
        return c.json(
          {
            status: "error",
            message: "No avatar file provided or invalid file format",
            details:
              "Make sure you're including a valid image file with the key 'avatar' in your form data",
          },
          400,
        );
      }

      // Check file type
      if (!fileData.type.startsWith("image/")) {
        return c.json(
          {
            status: "error",
            message: "Only image files are allowed",
            details: `Received file of type: ${fileData.type}`,
          },
          400,
        );
      }

      // Check file size (limit to 5MB)
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
      if (fileData.size > MAX_FILE_SIZE) {
        return c.json(
          {
            status: "error",
            message: "File size exceeds the limit",
            details: "Maximum file size allowed is 5MB",
          },
          400,
        );
      }

      // Extract file extension safely
      let fileExtension = "jpg"; // Default extension
      if (fileData.name && fileData.name.includes(".")) {
        fileExtension = fileData.name.split(".").pop() || "jpg";
      } else if (fileData.type) {
        // Extract from MIME type (e.g., image/jpeg -> jpeg)
        fileExtension = fileData.type.split("/").pop() || "jpg";
      }

      // Prepare file name - use userId to make it unique
      const fileName = `avatar-${userId}-${Date.now()}`;

      // Before uploading new avatar, check if user already has an avatar and try to delete it
      if (user.avatar) {
        try {
          // Try to extract fileId from the existing avatar URL
          const existingFileId = UploadController.extractFileIdFromUrl(
            user.avatar,
          );

          // If we found a fileId, try to delete it from ImageKit
          if (existingFileId) {
            await UploadController.imagekit.deleteFile(existingFileId);
            console.log(
              `Successfully deleted old avatar with fileId: ${existingFileId}`,
            );
          } else {
            console.log(
              "Could not extract fileId from existing avatar URL:",
              user.avatar,
            );
          }
        } catch (deleteError) {
          // Log the error but continue with upload - don't fail the whole operation
          console.warn("Failed to delete old avatar image:", deleteError);
        }
      }

      // Upload to ImageKit with additional error handling
      let uploadResponse;
      try {
        uploadResponse = await UploadController.imagekit.upload({
          file: fileData.buffer,
          fileName: `${fileName}.${fileExtension}`,
          folder: "/avatars",
          // Optional: Add tags or other metadata
          tags: [`user-${userId}`, "avatar"],
        });
      } catch (uploadError) {
        console.error("ImageKit upload error:", uploadError);
        return c.json(
          {
            status: "error",
            message: "Failed to upload image to storage provider",
            details:
              uploadError instanceof Error
                ? uploadError.message
                : "Unknown upload error",
          },
          500,
        );
      }

      // Update user avatar URL in database
      let updatedUser;
      try {
        updatedUser = await UserRepository.update(userId, {
          avatar: uploadResponse.url,
        });
      } catch (dbError) {
        console.error("Database update error:", dbError);
        // Note: Image was uploaded but DB update failed
        // We should try to clean up the uploaded image
        try {
          await UploadController.imagekit.deleteFile(uploadResponse.fileId);
        } catch (cleanupError) {
          console.error(
            "Failed to clean up image after DB update error:",
            cleanupError,
          );
        }

        return c.json(
          {
            status: "error",
            message: "Failed to update user profile with new avatar",
            details:
              dbError instanceof Error
                ? dbError.message
                : "Unknown database error",
          },
          500,
        );
      }

      return c.json({
        status: "success",
        message: user.avatar
          ? "Avatar replaced successfully"
          : "Avatar uploaded successfully",
        data: {
          avatar: uploadResponse.url,
          fileId: uploadResponse.fileId,
          fileName: uploadResponse.name,
          user: updatedUser,
        },
      });
    } catch (error) {
      console.error("Unexpected error uploading avatar:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to upload avatar due to server error",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        500,
      );
    }
  }

  /**
   * Handle avatar deletion
   * Removes avatar from ImageKit storage and updates user record
   */
  static async deleteAvatar(c: Context) {
    try {
      // Get user ID from params
      const userId = c.req.param("userId");

      // Validate user ID
      const validId = idSchema.safeParse(userId);
      if (!validId.success) {
        return c.json(
          {
            status: "error",
            message: "Invalid user ID format",
          },
          400,
        );
      }

      // Check if the user exists
      const user = await UserRepository.findById(userId);
      if (!user) {
        return c.json(
          {
            status: "error",
            message: `User with ID ${userId} not found`,
          },
          404,
        );
      }

      // Check if user has an avatar
      if (!user.avatar) {
        return c.json(
          {
            status: "error",
            message: "User does not have an avatar to delete",
          },
          400,
        );
      }

      // Check permissions
      const { id: currentUserId } = c.get("user");
      if (currentUserId !== userId) {
        const isAdmin = c.get("isAdmin") || false;
        if (!isAdmin) {
          return c.json(
            {
              status: "error",
              message: "You don't have permission to delete this user's avatar",
            },
            403,
          );
        }
      }

      // Extract file ID from the avatar URL
      const fileId = UploadController.extractFileIdFromUrl(user.avatar);

      // Try to delete from ImageKit if we have a fileId
      if (fileId) {
        try {
          await UploadController.imagekit.deleteFile(fileId);
        } catch (deleteError) {
          console.warn("Failed to delete image from ImageKit:", deleteError);
          // Continue execution - we still want to remove from DB even if ImageKit delete fails
        }
      }

      // Update user to remove avatar URL
      const updatedUser = await UserRepository.update(userId, {
        avatar: null,
      });

      return c.json({
        status: "success",
        message: "Avatar deleted successfully",
        data: {
          user: updatedUser,
        },
      });
    } catch (error) {
      console.error("Error deleting avatar:", error);
      return c.json(
        {
          status: "error",
          message: "Failed to delete avatar",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        500,
      );
    }
  }
}
