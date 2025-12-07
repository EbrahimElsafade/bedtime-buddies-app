import { useState, useEffect } from 'react'
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
import { supabase } from '@/integrations/supabase/client'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { getImageUrl } from '@/utils/imageUtils'

interface PuzzlePiece {
  id: string
  correctPosition: number // 0-indexed position where this piece belongs
}

// Create pieces with their correct positions (0-indexed)
const createInitialPieces = (): PuzzlePiece[] => [
  { id: 'piece-0', correctPosition: 0 },
  { id: 'piece-1', correctPosition: 1 },
  { id: 'piece-2', correctPosition: 2 },
  { id: 'piece-3', correctPosition: 3 },
  { id: 'piece-4', correctPosition: 4 },
  { id: 'piece-5', correctPosition: 5 },
  { id: 'piece-6', correctPosition: 6 },
  { id: 'piece-7', correctPosition: 7 },
  { id: 'piece-8', correctPosition: 8 },
]

// Shuffle array using Fisher-Yates algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

interface SortablePieceProps {
  piece: PuzzlePiece
  imageUrl: string
}

const SortablePiece = ({ piece, imageUrl }: SortablePieceProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: piece.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  }

  // Calculate background position based on the piece's correct position
  const getBackgroundPosition = (position: number) => {
    const row = Math.floor(position / 3)
    const col = position % 3
    return `${col * 50}% ${row * 50}%`
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: '300% 300%',
        backgroundPosition: getBackgroundPosition(piece.correctPosition),
      }}
      {...attributes}
      {...listeners}
      className={`h-24 w-24 cursor-grab select-none rounded-md border-2 border-border/50 shadow-lg transition-shadow hover:shadow-xl sm:h-28 sm:w-28 md:h-32 md:w-32 ${
        isDragging ? 'scale-105 opacity-90' : ''
      }`}
    >
      {/* {piece.id} */}
    </div>
  )
}

const PicturePuzzleGame = () => {
  const { t } = useTranslation('games')
  const [pieces, setPieces] = useState<PuzzlePiece[]>(() =>
    shuffleArray(createInitialPieces()),
  )
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showFeedback, setShowFeedback] = useState(false)

  useEffect(() => {
    fetchRandomImage()
  }, [])

  const fetchRandomImage = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('stories')
      .select('cover_image')
      .eq('is_published', true)
      .not('cover_image', 'is', null)

    console.log(data)

    if (!error && data && data.length > 0) {
      const randomIndex = Math.floor(Math.random() * data.length)
      setImageUrl(data[randomIndex].cover_image)
    }
    setIsLoading(false)
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setPieces(items => {
        const oldIndex = items.findIndex(item => item.id === active.id)
        const newIndex = items.findIndex(item => item.id === over.id)
        const newPieces = arrayMove(items, oldIndex, newIndex)

        // Check if puzzle is solved after the move
        const isSolved = newPieces.every(
          (piece, idx) => piece.correctPosition === idx,
        )
        if (isSolved) {
          setShowFeedback(true)
          setTimeout(() => setShowFeedback(false), 3000)
        }

        return newPieces
      })
    }
  }

  const reset = () => {
    setPieces(shuffleArray(createInitialPieces()))
    setShowFeedback(false)
    fetchRandomImage()
  }

  if (isLoading || !imageUrl) {
    return (
      <Card className="overflow-hidden border-primary/20 bg-secondary/50 backdrop-blur-sm">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="mx-auto grid w-fit grid-cols-3 gap-2">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden border-primary/20 bg-secondary/50 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <CardHeader>
          <CardTitle>{t('puzzle.title')}</CardTitle>
          <CardDescription>{t('puzzle.description')}</CardDescription>
        </CardHeader>

        <img
          src={getImageUrl(imageUrl)}
          alt="Puzzle reference"
          className="size-24 rounded-sm pe-2 pt-2 sm:size-28 md:size-32"
        />
      </div>

      <CardContent>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={pieces} strategy={rectSortingStrategy}>
            <div dir="ltr" className="mx-auto grid w-fit grid-cols-3 gap-2">
              {pieces.map(piece => (
                <SortablePiece
                  key={piece.id}
                  piece={piece}
                  imageUrl={getImageUrl(imageUrl)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

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
