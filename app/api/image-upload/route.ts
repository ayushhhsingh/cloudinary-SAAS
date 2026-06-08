import { NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"
import { getAuth } from "@clerk/nextjs/server"

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

interface CloudinaryUploadResult {
  public_id: string
  [key: string]: unknown
}

const createErrorResponse = (message: string, status: number, details?: string) => {
  return NextResponse.json({ 
    message, 
    details,
    timestamp: new Date().toISOString()
  }, { status })
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication using getAuth (doesn't consume body)
    const { userId } = getAuth(request)
    console.log("🔍 Image upload - Auth check - userId:", userId)
    
    if (!userId) {
      return createErrorResponse("Unauthorized - Please sign in first", 401)
    }

    // Check Cloudinary credentials
    console.log("🔍 Checking Cloudinary credentials...")
    console.log("Cloud Name:", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? "✓ Set" : "✗ Missing")
    console.log("API Key:", process.env.CLOUDINARY_API_KEY ? "✓ Set" : "✗ Missing")
    console.log("API Secret:", process.env.CLOUDINARY_API_SECRET ? "✓ Set" : "✗ Missing")
    
    if (
      !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return createErrorResponse("Cloudinary credentials not configured", 500, "Missing environment variables")
    }

    const formData = await request.formData()
    const file = formData.get("file")
    
    console.log("📷 Image file received:", file ? "Yes" : "No")
    
    if (!(file instanceof File)) {
      return createErrorResponse("No file provided", 400)
    }
    
    if (!file.type.startsWith("image/")) {
      return createErrorResponse("Invalid file type - only images allowed", 400)
    }
    if (file.size > 15 * 1024 * 1024) {
      return createErrorResponse("File too large - max 15MB allowed", 400)
    }

    console.log("📷 Image details:", {
      name: file.name,
      size: file.size,
      type: file.type
    })

    // Upload to Cloudinary
    console.log("☁️ Uploading image to Cloudinary...")
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const result = await new Promise<CloudinaryUploadResult>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "image-uploads" },
          (error, uploadResult) => {
            if (error) {
              console.error("❌ Cloudinary image upload error:", error)
              reject(error)
              return
            }
            if (!uploadResult) {
              console.error("❌ No upload result from Cloudinary")
              reject(new Error("No upload result"))
              return
            }
            console.log("✅ Cloudinary image upload success:", uploadResult.public_id)
            resolve(uploadResult as CloudinaryUploadResult)
          }
        )
        uploadStream.end(buffer)
      }
    )

    if (!result.public_id) {
      throw new Error("Invalid upload response from Cloudinary")
    }

    console.log("✅ Image uploaded successfully!")
    return NextResponse.json(
      {
        success: true,
        publicId: result.public_id,
        public_id: result.public_id,
        message: "Image uploaded successfully!"
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("❌ Upload image failed:", error)
    return createErrorResponse(
      "Image upload failed", 
      500, 
      error instanceof Error ? error.message : String(error)
    )
  }
}
