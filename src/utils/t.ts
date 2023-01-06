import fs from 'fs'
import { parse } from 'yaml'
import { Locale } from 'discord.js'
import { dirname } from '@discordx/importer'
import { allSupportedLocales, Locale as SupportedLocale } from '../types/locale.js'

const mapLocale = (l: Locale): SupportedLocale => {
  if (l === Locale.Russian) {
    return 'ru'
  } else {
    return 'en'
  }
}
let translate: (path: string, l: Locale) => string,
  t = function get(path: string, l: Locale) {
    if (translate) {
      return translate(path, l)
    } else {
      const mapping =
        Object.fromEntries(
          allSupportedLocales.map(l => [
            l,
            parse(fs.readFileSync(dirname(import.meta.url) + `/../../locales/${l}.yml`, 'utf8'))
          ])
        )

      translate = (
        (path: string, l: Locale): string => {
          try {
            return (
              path
                .split('.')
                .reduce(
                  (nestedObject, currentPathKey) =>
                    nestedObject[currentPathKey], mapping[mapLocale(l)]
                )
            )
          } catch (_: any) {
            return `Translation for key ${path} not found`
          }
        }
      )

      return translate(path, l)
    }
  }

export default t
