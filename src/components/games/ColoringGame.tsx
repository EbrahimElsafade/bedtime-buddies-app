import { useState } from 'react'
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
import { RotateCcw, Download } from 'lucide-react'

interface ColorArea {
  id: string
  color: string
}

const COLORS = [
  { name: 'red', hex: '#ef4444', label: 'Red' },
  { name: 'blue', hex: '#3b82f6', label: 'Blue' },
  { name: 'green', hex: '#10b981', label: 'Green' },
  { name: 'yellow', hex: '#eab308', label: 'Yellow' },
  { name: 'purple', hex: '#a855f7', label: 'Purple' },
  { name: 'pink', hex: '#ec4899', label: 'Pink' },
  { name: 'orange', hex: '#f97316', label: 'Orange' },
  { name: 'cyan', hex: '#06b6d4', label: 'Cyan' },
]

// Simple coloring areas that can be customized
const createInitialAreas = (): ColorArea[] => [
  { id: 'area-1', color: '#ffffff' },
  { id: 'area-2', color: '#ffffff' },
  { id: 'area-3', color: '#ffffff' },
  { id: 'area-4', color: '#ffffff' },
  { id: 'area-5', color: '#ffffff' },
  { id: 'area-6', color: '#ffffff' },
]

const ColoringGame = () => {
  const { t } = useTranslation('games')
  const [areas, setAreas] = useState<ColorArea[]>(createInitialAreas())
  const [selectedColor, setSelectedColor] = useState(COLORS[0].hex)
  const [completion, setCompletion] = useState(0)

  const handleColorArea = (areaId: string) => {
    setAreas(prev =>
      prev.map(area => {
        if (area.id === areaId) {
          return { ...area, color: selectedColor }
        }
        return area
      }),
    )
    // Calculate completion percentage
    const colored = areas.filter(a => a.color !== '#ffffff').length + 1
    setCompletion(Math.round((colored / areas.length) * 100))
  }

  const handleReset = () => {
    setAreas(createInitialAreas())
    setCompletion(0)
  }

  const handleDownload = () => {
    // Create a simple canvas and download as image
    const canvas = document.getElementById(
      'coloring-canvas',
    ) as HTMLCanvasElement
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
          {/* Canvas-like coloring area */}
          <div className="flex justify-center">
            <svg
              id="coloring-canvas"
              width="300"
              height="300"
              viewBox="0 0 300 300"
              className="rounded-lg border-2 border-dashed border-primary/30 bg-white"
            >
              {/* Simple boat drawing with coloring areas */}
              {/* Boat hull */}
              <ellipse
                cx="150"
                cy="200"
                rx="80"
                ry="50"
                fill={areas[0].color}
                stroke="#333"
                strokeWidth="2"
                className="cursor-pointer transition-opacity hover:opacity-80"
                onClick={() => handleColorArea('area-1')}
              />

              {/* Sail */}
              <polygon
                points="150,200 140,80 190,80"
                fill={areas[1].color}
                stroke="#333"
                strokeWidth="2"
                className="cursor-pointer transition-opacity hover:opacity-80"
                onClick={() => handleColorArea('area-2')}
              />

              {/* Mast */}
              <line
                x1="150"
                y1="80"
                x2="150"
                y2="200"
                stroke="#333"
                strokeWidth="3"
              />

              {/* Window */}
              <circle
                cx="150"
                cy="210"
                r="12"
                fill={areas[2].color}
                stroke="#333"
                strokeWidth="2"
                className="cursor-pointer transition-opacity hover:opacity-80"
                onClick={() => handleColorArea('area-3')}
              />

              {/* Sky area 1 */}
              <rect
                x="50"
                y="20"
                width="60"
                height="40"
                fill={areas[3].color}
                stroke="#333"
                strokeWidth="1"
                className="cursor-pointer transition-opacity hover:opacity-80"
                onClick={() => handleColorArea('area-4')}
              />

              {/* Sky area 2 */}
              <rect
                x="190"
                y="20"
                width="60"
                height="40"
                fill={areas[4].color}
                stroke="#333"
                strokeWidth="1"
                className="cursor-pointer transition-opacity hover:opacity-80"
                onClick={() => handleColorArea('area-5')}
              />

              {/* Sun */}
              <circle
                cx="270"
                cy="50"
                r="20"
                fill={areas[5].color}
                stroke="#333"
                strokeWidth="2"
                className="cursor-pointer transition-opacity hover:opacity-80"
                onClick={() => handleColorArea('area-6')}
              />
              <line
                x1="270"
                y1="20"
                x2="270"
                y2="5"
                stroke="#333"
                strokeWidth="2"
              />
              <line
                x1="270"
                y1="80"
                x2="270"
                y2="95"
                stroke="#333"
                strokeWidth="2"
              />
              <line
                x1="240"
                y1="50"
                x2="225"
                y2="50"
                stroke="#333"
                strokeWidth="2"
              />
              <line
                x1="300"
                y1="50"
                x2="315"
                y2="50"
                stroke="#333"
                strokeWidth="2"
              />
            </svg>
          </div>

          {/* Completion percentage */}
          <div className="text-center">
            <p className="mb-2 text-sm text-muted-foreground">
              {t('coloring.completion')}:{' '}
              <span className="font-bold text-primary">{completion}%</span>
            </p>
            <div className="h-2 w-full rounded-full bg-secondary">
              <div
                className="h-2 rounded-full bg-primary transition-all duration-300"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>

          {/* Color palette */}
          <div className="flex flex-wrap justify-center gap-2">
            {COLORS.map(color => (
              <button
                key={color.name}
                onClick={() => setSelectedColor(color.hex)}
                className={`h-10 w-10 rounded-full border-2 transition-all ${
                  selectedColor === color.hex
                    ? 'scale-110 border-black shadow-lg'
                    : 'border-gray-300 hover:scale-105'
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
        <div className="flex w-full gap-2">
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
