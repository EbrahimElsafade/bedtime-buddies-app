import { useState, useMemo, useCallback } from 'react'

interface UsePaginationOptions {
  pageSize?: number
  initialPage?: number
}

interface UsePaginationResult<T> {
  currentPage: number
  totalPages: number
  pageSize: number
  paginatedItems: T[]
  goToPage: (page: number) => void
  nextPage: () => void
  prevPage: () => void
  setPageSize: (size: number) => void
  startIndex: number
  endIndex: number
}

export function usePagination<T>(
  items: T[],
  options: UsePaginationOptions = {}
): UsePaginationResult<T> {
  const { pageSize: initialPageSize = 10, initialPage = 1 } = options
  
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [pageSize, setPageSizeState] = useState(initialPageSize)

  const totalPages = useMemo(() => 
    Math.ceil(items.length / pageSize) || 1
  , [items.length, pageSize])

  // Reset to page 1 if current page exceeds total pages
  const validCurrentPage = useMemo(() => 
    Math.min(currentPage, totalPages)
  , [currentPage, totalPages])

  const startIndex = (validCurrentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, items.length)

  const paginatedItems = useMemo(() => 
    items.slice(startIndex, endIndex)
  , [items, startIndex, endIndex])

  const goToPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(validPage)
  }, [totalPages])

  const nextPage = useCallback(() => {
    goToPage(validCurrentPage + 1)
  }, [goToPage, validCurrentPage])

  const prevPage = useCallback(() => {
    goToPage(validCurrentPage - 1)
  }, [goToPage, validCurrentPage])

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size)
    setCurrentPage(1) // Reset to first page when changing page size
  }, [])

  return {
    currentPage: validCurrentPage,
    totalPages,
    pageSize,
    paginatedItems,
    goToPage,
    nextPage,
    prevPage,
    setPageSize,
    startIndex,
    endIndex,
  }
}
