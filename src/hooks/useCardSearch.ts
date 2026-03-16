/**
 * hooks/useCardSearch.ts
 *
 * Debounced card search backed by TanStack Query.
 * Results are cached — re-running the same query is instant.
 */

import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { NormalizedCard } from '@/types'
import { searchCards, autocomplete, normalizeCard } from '@/services/scryfall'
import { queryKeys } from './queryKeys'

interface UseCardSearchReturn {
  query: string
  submittedQuery: string
  setQuery: (q: string) => void
  submit: () => void
  selectSuggestion: (name: string) => void
  results: NormalizedCard[]
  suggestions: string[]
  isSearching: boolean
  isSuggesting: boolean
  error: string | null
}

export function useCardSearch(): UseCardSearchReturn {
  const [query, setQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')

  // Autocomplete — fires while typing, debounced via staleTime
  const { data: suggestions = [], isFetching: isSuggesting } = useQuery({
    queryKey: queryKeys.cards.autocomplete(query),
    queryFn: () => autocomplete(query),
    enabled: query.length >= 2,
    staleTime: 30_000,   // autocomplete results are stable for 30s
    placeholderData: [], // no flash of empty state between keystrokes
  })

  // Full search — only fires when user submits
  const { data: rawResults = [], isFetching: isSearching, error: searchError } = useQuery({
    queryKey: queryKeys.cards.search(submittedQuery),
    queryFn: () => searchCards(submittedQuery, { maxPages: 1 }),
    enabled: submittedQuery.length > 0,
    staleTime: 5 * 60_000, // search results cached for 5 min
    select: (cards) => cards.map(normalizeCard), // transform once, on cache write
  })

  const submit = useCallback(() => {
    if (query.trim()) setSubmittedQuery(query.trim())
  }, [query])

  const selectSuggestion = useCallback((name: string) => {
    setQuery(name)
    setSubmittedQuery(name)
  }, [])

  const error = searchError instanceof Error ? searchError.message : null

  return {
    query,
    submittedQuery,
    setQuery,
    submit,
    selectSuggestion,
    results: rawResults as NormalizedCard[],
    suggestions: suggestions.slice(0, 8),
    isSearching,
    isSuggesting,
    error,
  }
}
