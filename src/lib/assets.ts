/** Resolves an artwork key to a bundled file.
 *
 *  Two sources, one lookup:
 *
 *  - `src/assets/img/` — exports pulled straight out of Figma, named by the
 *    asset hash Figma gave them (`npm run figma:assets`).
 *  - `src/assets/web/` — stills fetched from AntenaPLAY's own site for cards
 *    the Figma capture left as placeholders, named by the show's slug
 *    (`node scripts/fetch-antena-art.mjs`).
 *
 *  So a card carries either a hash or a slug and neither it nor the resolver
 *  needs to care which. Anything unresolved returns null and the card renders
 *  its designed placeholder. */

const files = {
  ...(import.meta.glob('../assets/img/*.{png,jpg,jpeg,svg,webp}', {
    eager: true,
    query: '?url',
    import: 'default',
  }) as Record<string, string>),
  ...(import.meta.glob('../assets/web/*.{png,jpg,jpeg,webp}', {
    eager: true,
    query: '?url',
    import: 'default',
  }) as Record<string, string>),
}

const byKey = new Map<string, string>()
for (const [path, url] of Object.entries(files)) {
  const key = path.split('/').pop()!.replace(/\.[^.]+$/, '')
  byKey.set(key, url)
}

export function asset(key: string | null | undefined): string | null {
  return key ? (byKey.get(key) ?? null) : null
}

export const assetCount = byKey.size
