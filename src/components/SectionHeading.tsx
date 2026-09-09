/** Figma: "Heading 2" — 34.56px/57.024 bold, 0.2px tracking, optional live dot. */
export function SectionHeading({
  children,
  dot = false,
}: {
  children: React.ReactNode
  dot?: boolean
}) {
  return (
    <h2 className="flex items-center page-gutter text-[34.56px]/[57.024px] font-bold tracking-[0.2px]">
      {dot && (
        <span
          className="mr-[20.736px] size-[17.273px] shrink-0 rounded-[8.637px] bg-brand"
          aria-hidden
        />
      )}
      <span className="truncate">{children}</span>
    </h2>
  )
}
