import { useCallback, useEffect, useRef, useState } from 'react'

/** D-pad navigation.
 *
 *  A TV has no pointer: there is a focus, and four directions. That single fact
 *  is what makes a TV screen a different design rather than a bigger one, so it
 *  is modelled first and everything else is built on top.
 *
 *  Two behaviours matter more than they look. Each row remembers the column you
 *  left it on, so going down a row and back up returns you where you were
 *  rather than to the start — without it, browsing feels like being reset. And
 *  the focused item is always scrolled into view, because on a remote you
 *  cannot scroll independently of focus. */
export type TvFocus = { row: number; col: number }

export function useTvNav(
  rowLengths: number[],
  onEnter?: (f: TvFocus) => void,
  /** Off while another surface owns the remote. */
  enabled = true,
  /** Called when a press cannot move any further in that direction. The screen
   *  decides what a wall means — pressing Left at the first column is how you
   *  reach the menu. */
  onEdge?: (direction: 'left' | 'right' | 'up' | 'down') => void,
) {
  const [focus, setFocus] = useState<TvFocus>({ row: 0, col: 0 })
  /** the column each row was last left on */
  const memory = useRef<number[]>([])

  const move = useCallback(
    (dRow: number, dCol: number) => {
    setFocus((prev) => {
      const rows = rowLengths
      if (dRow) {
        const row = Math.max(0, Math.min(rows.length - 1, prev.row + dRow))
        if (row === prev.row) {
          onEdge?.(dRow < 0 ? 'up' : 'down')
          return prev
        }
        memory.current[prev.row] = prev.col
        const remembered = memory.current[row] ?? 0
        return { row, col: Math.max(0, Math.min((rows[row] ?? 1) - 1, remembered)) }
      }
      const max = (rows[prev.row] ?? 1) - 1
      const col = Math.max(0, Math.min(max, prev.col + dCol))
      if (col === prev.col) {
        onEdge?.(dCol < 0 ? 'left' : 'right')
        return prev
      }
      return { ...prev, col }
    })
    },
    [rowLengths, onEdge],
  )

  useEffect(() => {
    if (!enabled) return
    const onKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault()
          move(-1, 0)
          break
        case 'ArrowDown':
          e.preventDefault()
          move(1, 0)
          break
        case 'ArrowLeft':
          e.preventDefault()
          move(0, -1)
          break
        case 'ArrowRight':
          e.preventDefault()
          move(0, 1)
          break
        case 'Enter':
          e.preventDefault()
          onEnter?.(focus)
          break
        default:
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [move, onEnter, focus, enabled])

  return { focus, setFocus, move }
}

/** Keeps the focused element in view. Called by whatever is focused, since on a
 *  remote the two cannot be separated. */
export function useScrollIntoFocus(active: boolean, node: HTMLElement | null) {
  useEffect(() => {
    if (!active || !node) return
    node.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }, [active, node])
}
