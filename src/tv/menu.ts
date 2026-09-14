import { IconHome, IconLibrary, IconLive, IconSearch, IconSport } from '../v3ai/icons'

/** The side menu's entries. In their own module so the component file exports
 *  only a component. */
export const MENU = [
  { key: 'home', label: 'Acasă', Icon: IconHome },
  { key: 'search', label: 'Caută', Icon: IconSearch },
  { key: 'live', label: 'Live', Icon: IconLive },
  { key: 'sport', label: 'Sport', Icon: IconSport },
  { key: 'list', label: 'Lista mea', Icon: IconLibrary },
] as const
