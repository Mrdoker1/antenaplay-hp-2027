import { createContext, useContext } from 'react'

export type Feed = {
  /** Point the page background at a title's colour. Debounced and crossfaded,
   *  so sweeping the pointer across a row is not a strobe. There is no matching
   *  "unfeed": the background keeps the last colour it was given instead of
   *  snapping back, which is what stops it flapping between two states as the
   *  pointer crosses gaps between cards. */
  feed: (title: string, art: string | null) => void
}

export const ColorFeedContext = createContext<Feed>({ feed: () => {} })

export const useColorFeed = () => useContext(ColorFeedContext)
