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
  total: number
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

  const hits = useMemo<Hit[]>(() => (settled ? search(settled, 6) : []), [settled])
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
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const pick = useCallback((phrase: string) => {
    setQuery(phrase)
    inputRef.current?.focus()
  }, [])

  return { query, setQuery, settled, hits, total, thinking, open, setOpen, pick, inputRef }
}
