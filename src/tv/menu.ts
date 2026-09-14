import { IconHome, IconLibrary, IconLive, IconSearch, IconSport } from '../v3ai/icons'
import { IconSeries, IconShows } from './icons'

/** The side menu's entries. In their own module so the component file exports
 *  only a component. */
export const MENU = [
  { key: 'home', label: 'Acasă', Icon: IconHome },
  { key: 'search', label: 'Caută', Icon: IconSearch },
  { key: 'live', label: 'Live', Icon: IconLive },
  { key: 'emisiuni', label: 'Emisiuni', Icon: IconShows },
  { key: 'seriale', label: 'Seriale', Icon: IconSeries },
  { key: 'sport', label: 'Sport', Icon: IconSport },
  { key: 'list', label: 'Lista mea', Icon: IconLibrary },
] as const
