import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useTranslation } from 'react-i18next'
import { RotateCcw, Download, RefreshCw } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

const COLORS = [
  { name: 'red', hex: '#ef4444', label: 'Red' },
  { name: 'blue', hex: '#3b82f6', label: 'Blue' },
  { name: 'green', hex: '#10b981', label: 'Green' },
  { name: 'yellow', hex: '#eab308', label: 'Yellow' },
  { name: 'purple', hex: '#a855f7', label: 'Purple' },
  { name: 'pink', hex: '#ec4899', label: 'Pink' },
  { name: 'orange', hex: '#f97316', label: 'Orange' },
  { name: 'cyan', hex: '#06b6d4', label: 'Cyan' },
  { name: 'brown', hex: '#92400e', label: 'Brown' },
  { name: 'black', hex: '#1f2937', label: 'Black' },
  { name: 'white', hex: '#ffffff', label: 'White' },
  { name: 'skyblue', hex: '#7dd3fc', label: 'Sky Blue' },
]

const COLORING_IMAGES = [
  '/coloring/deer-scene.jpg',
  '/coloring/minecraft.png',
  '/coloring/mushroom-house.png',
  '/coloring/mushrooms.png',
  '/coloring/bear.png',
  '/coloring/flowers-butterflies.png',
  '/coloring/kids-walking.png',
]

const ColoringGame = () => {
  const { t } = useTranslation('games')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedColor, setSelectedColor] = useState(COLORS[0].hex)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentImage, setCurrentImage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [brushSize, setBrushSize] = useState(10)

  const loadRandomImage = () => {
    setIsLoading(true)
    const randomIndex = Math.floor(Math.random() * COLORING_IMAGES.length)
    setCurrentImage(COLORING_IMAGES[randomIndex])
  }

  useEffect(() => {
    loadRandomImage()
  }, [])

  useEffect(() => {
    if (!currentImage || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      // Set canvas size to match image aspect ratio
      const maxWidth = 400
      const maxHeight = 400
      let width = img.width
      let height = img.height

      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height
        height = maxHeight
      }

      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)
      setIsLoading(false)
    }
    img.src = currentImage
  }, [currentImage])

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    if ('touches' in e) {
      const touch = e.touches[0]
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      }
    }

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return

    const coords = getCanvasCoordinates(e)
    if (!coords) return

    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = selectedColor
    ctx.beginPath()
    ctx.arc(coords.x, coords.y, brushSize, 0, Math.PI * 2)
    ctx.fill()
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    draw(e)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const handleReset = () => {
    if (!currentImage || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    }
    img.src = currentImage
  }

  const handleNewImage = () => {
    loadRandomImage()
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const link = document.createElement('a')
      link.href = canvas.toDataURL('image/png')
      link.download = 'my-coloring.png'
      link.click()
    }
  }

  if (isLoading) {
    return (
      <Card className="overflow-hidden border-primary/20 bg-secondary/50 backdrop-blur-sm">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <Skeleton className="h-[300px] w-[300px] rounded-lg" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden border-primary/20 bg-secondary/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>{t('coloring.title')}</CardTitle>
        <CardDescription>{t('coloring.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          {/* Canvas coloring area */}
          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              className="max-w-full cursor-crosshair rounded-lg border-2 border-dashed border-primary/30 bg-white touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>

          {/* Brush size slider */}
          <div className="flex items-center justify-center gap-4">
            <span className="text-sm text-muted-foreground">{t('coloring.brushSize') || 'Brush Size'}:</span>
            <input
              type="range"
              min="2"
              max="30"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-32"
            />
            <div
              className="rounded-full border border-foreground/30"
              style={{
                width: brushSize * 2,
                height: brushSize * 2,
                backgroundColor: selectedColor,
              }}
            />
          </div>

          {/* Color palette */}
          <div className="flex flex-wrap justify-center gap-2">
            {COLORS.map(color => (
              <button
                key={color.name}
                onClick={() => setSelectedColor(color.hex)}
                className={`h-10 w-10 rounded-full border-2 transition-all ${
                  selectedColor === color.hex
                    ? 'scale-110 border-foreground shadow-lg'
                    : 'border-muted-foreground/30 hover:scale-105'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.label}
              />
            ))}
          </div>

          {/* Instructions */}
          <div className="rounded-lg bg-primary/10 p-3 text-center text-xs text-muted-foreground md:text-sm">
            {t('coloring.instructions')}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex w-full flex-wrap gap-2">
          <Button onClick={handleNewImage} variant="outline" className="flex-1">
            <RefreshCw className="mr-2 h-4 w-4" />
            {t('coloring.newImage') || 'New Image'}
          </Button>
          <Button onClick={handleReset} variant="outline" className="flex-1">
            <RotateCcw className="mr-2 h-4 w-4" />
            {t('coloring.reset')}
          </Button>
          <Button onClick={handleDownload} className="flex-1">
            <Download className="mr-2 h-4 w-4" />
            {t('coloring.download')}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

export default ColoringGame
