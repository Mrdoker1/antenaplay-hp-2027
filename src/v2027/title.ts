/** AntenaPLAY separates a show from its qualifier with a pipe — "Insula Iubirii
 *  | Sezonul 10". Left alone, a wrap can put that pipe at the start of the next
 *  line, which reads as if the title begins with punctuation. Gluing it to the
 *  word before with a non-breaking space moves the break to after the
 *  separator, where it belongs. */
export function tidyTitle(title: string): string {
  return title.replace(/ \| /g, ' | ')
}
