import { useRef, useState } from 'react'
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

// 3x3 puzzle pieces with unique IDs
const initialPieces = [
  { id: 'piece-1', position: 1 },
  { id: 'piece-2', position: 2 },
  { id: 'piece-3', position: 3 },
  { id: 'piece-4', position: 4 },
  { id: 'piece-5', position: 5 },
  { id: 'piece-6', position: 6 },
  { id: 'piece-7', position: 7 },
  { id: 'piece-8', position: 8 },
  { id: 'piece-9', position: 9 },
]

const PicturePuzzleGame = () => {
  const { t } = useTranslation('games')
  const [pieces, setPieces] = useState(() =>
    [...initialPieces].sort(() => Math.random() - 0.5),
  )
  const [imageUrl, setImageUrl] = useState(
    'https://brxbtgzaumryxflkykpp.supabase.co/storage/v1/object/public/admin-content/story-covers/cover-1748118101626-SCENE-02_page-0001.jpg',
  )
  const [showFeedback, setShowFeedback] = useState(false)

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

    // Check if puzzle is solved after the move
    const isSolved = copy.every((piece, idx) => piece.position === idx + 1)
    if (isSolved) {
      setShowFeedback(true)
      // Auto-hide feedback after 3 seconds
      setTimeout(() => setShowFeedback(false), 3000)
    }
  }

  const onDragOver = (e: React.DragEvent) => e.preventDefault()

  const reset = () => {
    setPieces([...initialPieces].sort(() => Math.random() - 0.5))
    setShowFeedback(false)
  }

  const solved = pieces.every((piece, idx) => piece.position === idx)

  // Calculate background position for each piece
  const getBackgroundPosition = (pieceNum: number) => {
    const row = Math.floor(pieceNum / 3)
    const col = pieceNum % 3
    return `${col * 50}% ${row * 50}%`
  }

  return (
    <Card className="overflow-hidden border-primary/20 bg-secondary/50 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <CardHeader>
          <CardTitle>{t('puzzle.title')}</CardTitle>
          <CardDescription>{t('puzzle.description')}</CardDescription>
        </CardHeader>

        <img
          src={imageUrl}
          alt="Puzzle"
          className="size-32 rounded-sm object-cover pe-2 pt-2"
        />
      </div>
      <CardContent>
        <div className="mx-auto grid w-fit grid-cols-3 gap-2">
          {/* here */}

          {pieces.map((piece, i) => (
            <div
              key={piece.id}
              draggable
              onDragStart={e => onDragStart(e, i)}
              onDragOver={onDragOver}
              onDrop={e => onDrop(e, i)}
              className="h-32 w-32 cursor-grab select-none rounded-md border-2 border-white/50 shadow-lg transition-shadow hover:shadow-xl"
              style={{
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: '300% 300%',
                backgroundPosition: getBackgroundPosition(piece.position),
              }}
            >
              {piece.id}
            </div>
          ))}
          {/* </DndContext> */}
        </div>
        {showFeedback && (
          <div className="mt-6 animate-bounce rounded-lg bg-gradient-to-r from-green-400 to-blue-500 p-6 text-center shadow-lg">
            <div className="mb-2 text-4xl">🎉</div>
            <div className="mb-2 text-2xl font-bold text-white">
              {t('puzzle.solved')}
            </div>
            <div className="text-lg text-white">
              ⭐ Amazing work! You did it! ⭐
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <div className="flex w-full gap-2">
          <Button onClick={reset} className="flex-1">
            {t('puzzle.shuffle')}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

export default PicturePuzzleGame
