"use client"

import { useState, useRef } from "react"
import { Camera, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createWorker } from 'tesseract.js'
import { BarcodeDetector } from 'barcode-detector'

type ScannedNutrition = {
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  servingSize?: string
  name?: string
  barcode?: string
}

interface FoodLabelScannerProps {
  onScanComplete: (nutritionData: ScannedNutrition) => void
  onClose: () => void
}

export function FoodLabelScanner({ onScanComplete, onClose }: FoodLabelScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsScanning(true)
      setError(null)
      
      // Create preview
      const preview = URL.createObjectURL(file)
      setPreviewUrl(preview)

      // Process image with Tesseract OCR
      const worker = await createWorker()
      await worker.loadLanguage('eng')
      await worker.initialize('eng')

      worker.setParameters({
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz ',
      })

      const { data: { text } } = await worker.recognize(file)
      await worker.terminate()

      // Try to detect barcode
      let barcode = null
      try {
        const barcodeDetector = new BarcodeDetector()
        const barcodes = await barcodeDetector.detect(await createImageBitmap(file))
        if (barcodes.length > 0) {
          barcode = barcodes[0].rawValue
        }
      } catch (e) {
        console.warn('Barcode detection not supported or failed:', e)
      }

      // Parse nutrition information from the text
      const nutritionData = parseNutritionInfo(text, barcode)
      onScanComplete(nutritionData)

    } catch (err) {
      console.error('Error scanning food label:', err)
      setError('Failed to scan food label. Please try again.')
    } finally {
      setIsScanning(false)
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }

  const parseNutritionInfo = (text: string, barcode?: string | null): ScannedNutrition => {
    const nutrition: ScannedNutrition = { barcode: barcode || undefined }
    
    // Extract serving size
    const servingSizeMatch = text.match(/serving size[:\s]+([^\n]+)/i)
    if (servingSizeMatch) {
      nutrition.servingSize = servingSizeMatch[1].trim()
    }

    // Extract calories
    const caloriesMatch = text.match(/calories[:\s]+(\d+)/i)
    if (caloriesMatch) {
      nutrition.calories = parseInt(caloriesMatch[1])
    }

    // Extract protein
    const proteinMatch = text.match(/protein[:\s]+(\d+)g/i)
    if (proteinMatch) {
      nutrition.protein = parseInt(proteinMatch[1])
    }

    // Extract carbs
    const carbsMatch = text.match(/carbohydrate[s]?[:\s]+(\d+)g/i)
    if (carbsMatch) {
      nutrition.carbs = parseInt(carbsMatch[1])
    }

    // Extract fat
    const fatMatch = text.match(/fat[:\s]+(\d+)g/i)
    if (fatMatch) {
      nutrition.fat = parseInt(fatMatch[1])
    }

    // Try to extract product name
    const lines = text.split('\n')
    nutrition.name = lines[0].trim() // Usually the product name is at the top

    return nutrition
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Scan Food Label</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center gap-4">
          {previewUrl && (
            <div className="relative w-full max-w-sm">
              <img
                src={previewUrl}
                alt="Label preview"
                className="w-full rounded-lg"
              />
            </div>
          )}

          <Input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />

          <div className="flex gap-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isScanning}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Image
            </Button>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isScanning}
              variant="outline"
            >
              <Camera className="mr-2 h-4 w-4" />
              Take Photo
            </Button>
          </div>

          {isScanning && (
            <div className="w-full">
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
              <p className="text-center text-sm text-muted-foreground mt-2">
                Scanning label...
              </p>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 