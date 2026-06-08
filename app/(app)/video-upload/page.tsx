"use client"
import React, { useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import Link from "next/link"


function VideoUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [statusMessage, setStatusMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()

  const MAX_FILE_SIZE = 80 * 1024 * 1024 // 80MB limit
  const MAX_FILE_SIZE_IN_MB = 80

  const formatFileSize = (size: number) => {
    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`
    }
    return `${(size / (1024 * 1024)).toFixed(2)} MB`
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null
    setFile(selectedFile)
    setUploadProgress(0)
    setStatusMessage("")
    setErrorMessage(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setErrorMessage(null)
    setUploadProgress(0)
    setStatusMessage("")

    // Validate inputs
    if (!file) {
      setErrorMessage("Please select a video file before uploading.")
      return
    }

    if (!title || title.trim() === "") {
      setErrorMessage("Please enter a title for your video.")
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage(
        `File is too large. Maximum allowed size is ${MAX_FILE_SIZE_IN_MB} MB.`
      )
      return
    }

    setIsUploading(true)
    setStatusMessage("Uploading video...")

    const formData = new FormData()
    formData.append("file", file)
    formData.append("title", title)
    formData.append("description", description)
    formData.append("originalSize", file.size.toString())

    try {
      console.log("📤 Starting video upload to /api/video-upload...")
      console.log("📦 FormData contents:")
      console.log("   - file:", file.name, `(${file.size} bytes, ${file.type})`)
      console.log("   - title:", title || "(empty)")
      console.log("   - description:", description || "(empty)")
      console.log("   - originalSize:", file.size)
      
      const response = await axios.post("/api/video-upload", formData, {
        // DO NOT set Content-Type header manually - Axios will set it with boundary automatically
        // Setting it manually breaks FormData parsing because the boundary is missing
        onUploadProgress: (progressEvent) => {
          if (!progressEvent.total) return

          const progress = Math.min(
            100,
            Math.round((progressEvent.loaded * 100) / progressEvent.total)
          )

          setUploadProgress(progress)
          if (progress >= 100) {
            setStatusMessage("Upload complete. Processing video...")
          } else if (progress >= 50) {
            setStatusMessage("Uploading... Almost there!")
          } else {
            setStatusMessage("Uploading video...")
          }
        },
      })

      console.log("✅ Upload successful:", response.data)
      setStatusMessage("Upload successful! Redirecting...")
      router.push("/home")
      router.refresh()
    } catch (error) {
      console.error("❌ Upload failed:", error)
      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data as
          | { message?: string; error?: string; details?: string }
          | undefined
        const apiMessage =
          typeof responseData?.message === "string"
            ? responseData.message
            : typeof responseData?.error === "string"
              ? responseData.error
            : null
        const apiDetails = responseData?.details
        
        let errorMsg = apiMessage || "Upload failed. Please try again."
        if (apiDetails) {
          errorMsg += ` (${apiDetails})`
        }
        
        setStatusMessage("")
        setErrorMessage(errorMsg)
        
        console.error("📋 Error details:", {
          status: error.response?.status,
          data: responseData,
          details: apiDetails
        })
      } else {
        setStatusMessage("")
        setErrorMessage("Upload failed. Please try again.")
      }
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Upload Video</h1>
        <p className="text-base-content/70">
          Upload your video and we will automatically compress it for you. Max file size: {MAX_FILE_SIZE_IN_MB} MB
        </p>
      </div>

      {/* Upload Form Card */}
      <div className="card border border-base-300 bg-base-200 shadow-xl">
        <div className="card-body gap-6">
          {errorMessage && (
            <div className="alert alert-error shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title Input */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold text-lg">Video Title</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input input-bordered input-lg w-full bg-base-100"
                placeholder="Enter a descriptive title for your video"
                required
                disabled={isUploading}
              />
            </div>

            {/* Description Input */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold text-lg">Description (Optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="textarea textarea-bordered textarea-lg w-full bg-base-100 h-32"
                placeholder="Add more details about your video..."
                disabled={isUploading}
              />
            </div>

            {/* File Upload */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold text-lg">Video File</span>
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="file-input file-input-bordered file-input-lg w-full bg-base-100"
                required
                disabled={isUploading}
              />
              <label className="label">
                <span className="label-text-alt text-base-content/60">
                  Supported: MP4, MOV, WebM • Max: {MAX_FILE_SIZE_IN_MB} MB
                </span>
              </label>
            </div>

            {/* File Preview */}
            {file && (
              <div className="alert alert-info border-info bg-info/10">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div className="flex-1">
                  <p className="font-semibold">{file.name}</p>
                  <p className="text-sm opacity-70">
                    {formatFileSize(file.size)} • {file.type || "Unknown type"}
                  </p>
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold flex items-center gap-2">
                    <span className="loading loading-spinner loading-sm text-primary"></span>
                    {statusMessage}
                  </span>
                  <span className="text-primary font-bold">{uploadProgress}%</span>
                </div>
                <progress
                  className="progress progress-primary w-full"
                  value={uploadProgress}
                  max="100"
                />
                <p className="text-xs text-base-content/60 text-center">
                  Please keep this page open while uploading...
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="card-actions justify-end pt-4">
              <Link href="/home" className="btn btn-ghost">
                Cancel
              </Link>
              <button
                type="submit"
                className="btn btn-primary btn-lg gap-2"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload & Compress
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default VideoUpload
