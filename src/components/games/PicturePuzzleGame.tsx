import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'

// Simple 4-piece puzzle (2x2)
const initialPieces = ['1', '2', '3', '4']

const PicturePuzzleGame = () => {
  const { t } = useTranslation('games')
  const [pieces, setPieces] = useState(() => [...initialPieces].sort(() => Math.random() - 0.5))

  const dragIndexRef = useRef<number>(-1)

  const onDragStart = (e: React.DragEvent, index: number) => {
    dragIndexRef.current = index
    e.dataTransfer.effectAllowed = 'move'
  }

  const onDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    const from = dragIndexRef.current
    if (from === index || from < 0) return
    const copy = pieces.slice()
    const tmp = copy[from]
    copy[from] = copy[index]
    copy[index] = tmp
    setPieces(copy)
  }

  const onDragOver = (e: React.DragEvent) => e.preventDefault()

  const reset = () => setPieces([...initialPieces].sort(() => Math.random() - 0.5))

  const solved = pieces.join('') === initialPieces.join('')

  return (
    <Card className="overflow-hidden border-primary/20 bg-secondary/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>{t('puzzle.title')}</CardTitle>
        <CardDescription>{t('puzzle.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {pieces.map((p, i) => (
            <div key={i}
              draggable
              onDragStart={e => onDragStart(e, i)}
              onDragOver={onDragOver}
              onDrop={e => onDrop(e, i)}
              className="h-36 w-36 cursor-grab select-none rounded-md bg-gradient-to-br from-primary/80 to-primary-foreground/80 flex items-center justify-center text-2xl font-bold text-white shadow"
            >
              {p}
            </div>
          ))}
        </div>
        {solved && <div className="mt-2 text-green-600 font-semibold">{t('puzzle.solved')}</div>}
      </CardContent>
      <CardFooter>
        <div className="flex w-full gap-2">
          <Button onClick={reset} className="flex-1">{t('puzzle.shuffle')}</Button>
        </div>
      </CardFooter>
    </Card>
  )
}

export default PicturePuzzleGame
