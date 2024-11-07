"use client"

import { useState, useRef } from "react"
import { Camera, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createWorker } from 'tesseract.js'
import { BarcodeDetector } from 'barcode-detector'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type ScannedNutrition = {
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  name?: string
  servingSize?: string
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

  const parseNutritionInfo = (text: string): ScannedNutrition => {
    const nutrition: ScannedNutrition = {}
    const lines = text.toLowerCase().split('\n')
    
    // Helper function to extract numeric value
    const extractNumber = (str: string): number | undefined => {
      const match = str.match(/(\d+(\.\d+)?)/);
      return match ? parseFloat(match[1]) : undefined;
    }

    // Helper function to find line containing text
    const findLine = (searchTerms: string[]): string | undefined => {
      return lines.find(line => 
        searchTerms.some(term => line.includes(term.toLowerCase()))
      )
    }

    // Extract serving size
    const servingSizeTerms = ['serving size', 'per serving', 'portion']
    const servingSizeLine = findLine(servingSizeTerms)
    if (servingSizeLine) {
      nutrition.servingSize = servingSizeLine
        .replace(/serving size:?/i, '')
        .replace(/per serving:?/i, '')
        .trim()
    }

    // Extract calories
    const calorieTerms = ['calories', 'energy', 'kcal']
    const calorieLine = findLine(calorieTerms)
    if (calorieLine) {
      nutrition.calories = extractNumber(calorieLine)
    }

    // Extract protein
    const proteinTerms = ['protein']
    const proteinLine = findLine(proteinTerms)
    if (proteinLine) {
      nutrition.protein = extractNumber(proteinLine)
    }

    // Extract carbohydrates
    const carbTerms = ['carbohydrate', 'carbs', 'total carb']
    const carbLine = findLine(carbTerms)
    if (carbLine) {
      nutrition.carbs = extractNumber(carbLine)
    }

    // Extract fat
    const fatTerms = ['total fat', 'fat']
    const fatLine = findLine(fatTerms)
    if (fatLine) {
      nutrition.fat = extractNumber(fatLine)
    }

    // Try to extract product name
    for (let i = 0; i < Math.min(3, lines.length); i++) {
      const line = lines[i].trim()
      if (line && !line.includes('nutrition') && !line.includes('serving')) {
        nutrition.name = line
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
        break
      }
    }

    // Validate and clean up the data
    const cleanNumber = (value: number | undefined): number => {
      if (typeof value !== 'number' || isNaN(value)) return 0
      return Math.max(0, Math.round(value))
    }

    return {
      ...nutrition,
      calories: cleanNumber(nutrition.calories),
      protein: cleanNumber(nutrition.protein),
      carbs: cleanNumber(nutrition.carbs),
      fat: cleanNumber(nutrition.fat)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsScanning(true)
      setError(null)
      setScanProgress(10)
      
      // Create preview
      const preview = URL.createObjectURL(file)
      setPreviewUrl(preview)
      setScanProgress(30)

      // Process image with Tesseract OCR
      const worker = await createWorker()
      
      // Configure Tesseract for better nutrition label recognition
      await worker.setParameters({
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz .,%()/',
        tessedit_pageseg_mode: '6',
        preserve_interword_spaces: '1',
      })

      const { data: { text } } = await worker.recognize(file)
      await worker.terminate()
      setScanProgress(90)

      // Parse nutrition information from the text
      const nutritionData = parseNutritionInfo(text)
      setScanProgress(100)

      // Only complete if we found at least some nutritional data
      if (nutritionData.calories || nutritionData.protein || 
          nutritionData.carbs || nutritionData.fat) {
        onScanComplete(nutritionData)
      } else {
        setError('Could not detect nutrition information. Please try again or enter manually.')
      }

    } catch (err) {
      console.error('Error scanning food label:', err)
      setError('Failed to scan food label. Please try again or enter manually.')
    } finally {
      setIsScanning(false)
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Scan Food Label</CardTitle>
        <CardDescription>
          Take a photo or upload an image of a nutrition label to automatically extract information
        </CardDescription>
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