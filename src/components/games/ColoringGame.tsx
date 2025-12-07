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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useTranslation } from 'react-i18next'
import {
  RotateCcw,
  Download,
  RefreshCw,
  Paintbrush,
  Droplet,
  PaintBucket,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

const COLORING_IMAGES = [
  '/coloring/easy_t.svg',
  '/coloring/smiling-puppy.svg',
  '/coloring/dog-coloring.svg',
  '/coloring/easy_t_1.svg',
  '/coloring/minimalist-horse-coloring-page-art-600nw-2329234791.svg',
  '/coloring/coloring-pages-for-children-sonic-34208.svg',
]

const ColoringGame = () => {
  const { t } = useTranslation('games')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedColor, setSelectedColor] = useState('#0055ff')
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentImage, setCurrentImage] = useState('')
  const [brushSize, setBrushSize] = useState(10)
  const [drawingMethod, setDrawingMethod] = useState<'brush' | 'fill'>('fill')

  const loadRandomImage = () => {
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
      const canvasWidth = 1024
      const canvasHeight = 768

      canvas.width = canvasWidth
      canvas.height = canvasHeight
      ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight)
    }
    img.src = currentImage
  }, [currentImage])

  const getCanvasCoordinates = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
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

  const draw = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
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

  const floodFill = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas) return

    const coords = getCanvasCoordinates(e)
    if (!coords) return

    const x = Math.floor(coords.x)
    const y = Math.floor(coords.y)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    const targetColor = {
      r: data[(y * canvas.width + x) * 4],
      g: data[(y * canvas.width + x) * 4 + 1],
      b: data[(y * canvas.width + x) * 4 + 2],
      a: data[(y * canvas.width + x) * 4 + 3],
    }

    const fillColor = {
      r: parseInt(selectedColor.substring(1, 3), 16),
      g: parseInt(selectedColor.substring(3, 5), 16),
      b: parseInt(selectedColor.substring(5, 7), 16),
      a: 255,
    }

    if (
      targetColor.r === fillColor.r &&
      targetColor.g === fillColor.g &&
      targetColor.b === fillColor.b
    ) {
      return
    }

    const stack: [number, number][] = [[x, y]]
    const visited = new Set<string>()

    while (stack.length > 0) {
      const [cx, cy] = stack.pop()!

      if (cx < 0 || cx >= canvas.width || cy < 0 || cy >= canvas.height)
        continue

      const key = `${cx},${cy}`
      if (visited.has(key)) continue
      visited.add(key)

      const pixelIndex = (cy * canvas.width + cx) * 4
      const pixelColor = {
        r: data[pixelIndex],
        g: data[pixelIndex + 1],
        b: data[pixelIndex + 2],
        a: data[pixelIndex + 3],
      }

      if (
        pixelColor.r !== targetColor.r ||
        pixelColor.g !== targetColor.g ||
        pixelColor.b !== targetColor.b ||
        pixelColor.a !== targetColor.a
      ) {
        continue
      }

      data[pixelIndex] = fillColor.r
      data[pixelIndex + 1] = fillColor.g
      data[pixelIndex + 2] = fillColor.b
      data[pixelIndex + 3] = fillColor.a

      stack.push([cx + 1, cy])
      stack.push([cx - 1, cy])
      stack.push([cx, cy + 1])
      stack.push([cx, cy - 1])
    }

    ctx.putImageData(imageData, 0, 0)
  }

  const startDrawing = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    if (drawingMethod === 'fill') {
      floodFill(e)
    } else {
      setIsDrawing(true)
      draw(e)
    }
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
              className="max-w-full cursor-crosshair touch-none rounded-lg border-2 border-dashed border-primary/30 bg-white"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>

          <div className="flex items-center justify-around">
            {/* Color picker */}
            <div className="flex items-center justify-center gap-4">
              <label className="text-sm text-muted-foreground">
                {t('coloring.color') || 'Color'}:
              </label>

              <input
                type="color"
                value={selectedColor}
                onChange={e => setSelectedColor(e.target.value)}
                className="size-7 cursor-pointer rounded-full"
              />
            </div>

            {/* Drawing method selector */}
            <div className="flex items-center justify-center gap-4">
              <label className="text-sm text-muted-foreground">
                {t('coloring.method') || 'Method'}:
              </label>

              <RadioGroup
                value={drawingMethod}
                onValueChange={value =>
                  setDrawingMethod(value as 'brush' | 'fill')
                }
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="brush" id="brush" />

                    <Label htmlFor="brush" className="cursor-pointer">
                      <Paintbrush className="text-primary" />
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fill" id="fill" />

                    <Label htmlFor="fill" className="cursor-pointer">
                      <PaintBucket className="text-primary" />
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Brush size slider */}
            {drawingMethod === 'brush' && (
              <div className="flex items-center justify-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {t('coloring.brushSize') || 'Brush Size'}:
                </span>

                <input
                  type="range"
                  min="2"
                  max="30"
                  value={brushSize}
                  onChange={e => setBrushSize(Number(e.target.value))}
                  className="w-32 cursor-pointer"
                  style={{ accentColor: '#0055ff' }}
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
            )}
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
