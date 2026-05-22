import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface MaterialIconProps {
  /**
   * Either a Google Material Symbols icon name (e.g. "code", "palette",
   * "psychology") or an emoji / arbitrary text node. When the value matches
   * a material symbol name pattern it renders as a Material Symbols glyph;
   * otherwise it renders the original content unchanged (backward compat
   * with emoji-based icons stored in the DB).
   */
  name: ReactNode
  className?: string
  filled?: boolean
}

const MATERIAL_NAME_RE = /^[a-z][a-z0-9_]*$/

const MaterialIcon = ({ name, className, filled = false }: MaterialIconProps) => {
  if (typeof name === 'string' && MATERIAL_NAME_RE.test(name.trim())) {
    return (
      <span
        aria-hidden="true"
        className={cn('material-symbols-rounded leading-none', className)}
        style={
          filled
            ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }
            : undefined
        }
      >
        {name.trim()}
      </span>
    )
  }
  return <span className={cn('leading-none', className)}>{name}</span>
}

export default MaterialIcon
