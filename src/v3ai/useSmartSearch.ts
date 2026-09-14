import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { countMatches, search, type Hit } from './search'

/** How long the assistant appears to think before results land. A set that
 *  appears on the same frame as the keystroke reads as a filter; the point of
 *  this surface is that it reads as an assistant. */
const THINK_MS = 260

export type SmartSearch = {
  query: string
  setQuery: (q: string) => void
  /** phrase the current results answer — trails `query` by one beat */
  settled: string
  hits: Hit[]
  /** the full page of results, once the phrase has been committed */
  all: Hit[]
  total: number
  /** Enter commits the phrase and opens the results page. Without it the panel
   *  is the only answer the search ever gives, and a phrase typed and confirmed
   *  appears to do nothing — which is exactly how a working search gets read as
   *  a stub. */
  expanded: boolean
  setExpanded: (v: boolean) => void
  commit: () => void
  thinking: boolean
  open: boolean
  setOpen: (v: boolean) => void
  pick: (phrase: string) => void
  inputRef: React.RefObject<HTMLInputElement | null>
}

export function useSmartSearch(): SmartSearch {
  const [query, setQuery] = useState('')
  const [settled, setSettled] = useState('')
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const q = query.trim()
    const t = setTimeout(() => setSettled(q), q ? THINK_MS : 0)
    return () => clearTimeout(t)
  }, [query])

  const [committed, setExpanded] = useState(false)
  /* Reopening the panel to type a new phrase puts the page back — derived
     rather than set from an effect, so there is no render where the page shows
     results for a phrase that has already been typed over. */
  const expanded = committed && !open
  const hits = useMemo<Hit[]>(() => (settled ? search(settled, 6) : []), [settled])
  const all = useMemo<Hit[]>(() => (expanded && settled ? search(settled, 30) : []), [expanded, settled])
  const total = useMemo(() => (settled ? countMatches(settled) : 0), [settled])
  const thinking = query.trim() !== settled

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  // "/" opens it from anywhere, Escape closes — the shortcuts someone who
  // lives in search will reach for
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = /^(INPUT|TEXTAREA)$/.test((e.target as HTMLElement)?.tagName ?? '')
      if (e.key === '/' && !typing) {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === 'Escape') {
        setOpen(false)
        setExpanded(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const pick = useCallback((phrase: string) => {
    setQuery(phrase)
    inputRef.current?.focus()
  }, [])

  const commit = useCallback(() => {
    if (!inputRef.current?.value.trim()) return
    setExpanded(true)
    setOpen(false)
  }, [])

  return {
    query,
    setQuery,
    settled,
    hits,
    all,
    total,
    thinking,
    open,
    setOpen,
    expanded,
    setExpanded,
    commit,
    pick,
    inputRef,
  }
}
