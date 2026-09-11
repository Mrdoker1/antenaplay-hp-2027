/** Content shapes for the AntenaPLAY home page.
 *
 *  Image fields hold bare Figma asset hashes (see src/lib/assets.ts); the
 *  resolver turns them into real URLs when the exported file is present in
 *  src/assets/img and falls back to a branded placeholder when it is not. */

export type Channel = {
  name: string
  logo: string | null
  badge?: string
}

export type Poster = {
  name: string
  /** full-bleed artwork behind the card */
  cover: string | null
  /** show/title lockup burnt into the lower third of the card */
  logo?: string | null
}

export type HeroSlide = {
  title: string
  description: string
  poster?: string
  still?: string
  /** AntenaPLAY's own slug for this title */
  slug?: string
  /** id of the trailer on AntenaPLAY's player. The stream itself sits behind
   *  their token/auth gate, so this is used to link out to their player rather
   *  than to play the file here. */
  trailerId?: string
  /** Video id on the show's own YouTube channel, used to actually play
   *  something behind the hero. Only filled where a published official upload
   *  was found — the rest fall back to the still rather than to a guess. */
  youtubeId?: string
}

export type LiveEvent = {
  title: string
  competition: string
  when: string
  /** frame grab used as the card's thumbnail */
  still?: string
}
