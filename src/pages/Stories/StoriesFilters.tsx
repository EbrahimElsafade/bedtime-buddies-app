import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslation } from 'react-i18next'
import { Category } from '@/types/language'
import { Badge } from '@/components/ui/badge'

interface StoriesFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedCategory: string
  onCategoryChange: (value: string) => void
  categories: Category[]
}

export const StoriesFilters = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
}: StoriesFiltersProps) => {
  const { t } = useTranslation('stories')

  return (
    <div className="mb-4 space-y-3 md:mb-6 md:space-y-4 lg:mb-8">
      <Tabs
        defaultValue="all"
        className="w-full"
        onValueChange={onCategoryChange}
        value={selectedCategory}
      >
        <TabsList className="mb-4 w-full justify-start gap-2 overflow-x-auto p-1 md:mb-6 lg:mb-8">
          <TabsTrigger value="all">{t('allCategories')}</TabsTrigger>

          {categories.map(category => (
            <TabsTrigger key={category.id} value={category.name}>
              {t(`category.${category.name}`, {
                defaultValue:
                  category.name.charAt(0).toUpperCase() +
                  category.name.slice(1),
              })}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground rtl:left-auto rtl:right-3" />
          <Input
            type="text"
            placeholder={t('searchStories')}
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full py-2 ps-10 text-start text-sm md:text-base"
          />
        </div>

        {/* <div className="flex gap-4 justify-between w-full lg:max-w-md rounded-lg px-4 py-2 flex-wrap">
          <Badge>the</Badge>
          <Badge>age</Badge>
          <Badge>filters</Badge>
          <Badge>well</Badge>
          <Badge>be</Badge>
          <Badge>here</Badge>
        </div> */}
      </div>
    </div>
  )
}
