"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Upload, X } from "lucide-react"
import Image from "next/image"

export default function ImageUpload({ onImageChange, defaultImage = null }) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(defaultImage)
  const fileInputRef = useRef(null)
  const { toast } = useToast()

  useEffect(() => {
    // Update preview URL if defaultImage changes
    if (defaultImage) {
      setPreviewUrl(defaultImage)
    }
  }, [defaultImage])

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image size should be less than 5MB",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      // Create a preview
      const reader = new FileReader()
      reader.onload = () => {
        setPreviewUrl(reader.result)
        setIsUploading(false)
      }
      reader.readAsDataURL(file)

      // Pass the file to parent component
      onImageChange(file)
    } catch (error) {
      console.error("Error processing image:", error)
      toast({
        title: "Error",
        description: "Failed to process the image. Please try again.",
        variant: "destructive",
      })
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onImageChange(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
          disabled={isUploading}
        />

        {previewUrl ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-md border border-border">
            <Image src={previewUrl || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
            <Button
              variant="destructive"
              size="icon"
              className="absolute right-2 top-2"
              onClick={handleRemoveImage}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted/50 hover:bg-muted"
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <div className="flex flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Processing...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <Upload className="h-10 w-10 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Click to upload an image</p>
                <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 5MB</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
