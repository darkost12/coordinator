import {
  ApplicationCommandOptionType,
  CommandInteraction,
  Locale
} from 'discord.js'
import { Discord, Slash, SlashOption } from 'discordx'
import { Failure, Result } from '../types/result.js'
import silent from '../utils/silent.js'
import { remove } from '../db.js'
import t from '../utils/t.js'

const message = (result: Result<number>, locale: Locale): string => {
  if (result.type === 'failure') {
    const error = result.error

    if (error) {
      return '❗ ' + t('errors.specific', locale) + error
    } else {
      return '❗ ' + t('errors.unknown', locale)
    }
  } else if (result.type === 'success' && result.value === 0) {
    return '🟰 ' + t('delete.not_performed', locale)
  } else {
    return '✅ ' + t('delete.performed', locale)
  }
}

@Discord()
export class ActDel {
  @Slash({
    description: 'Delete existing activity',
    name: 'act-del',
    descriptionLocalizations: {
      'ru': t('delete.gist', Locale.Russian)
    }
  })
  async handle(
    @SlashOption({
      description: 'ID',
      name: 'id',
      required: true,
      type: ApplicationCommandOptionType.String
    })
    id: string,
    interaction: CommandInteraction
  ): Promise<void> {
    const bypassUserFilter =
      interaction.memberPermissions?.has('Administrator') ||
      interaction.memberPermissions?.has('BanMembers') ||
      false

    const guildId = interaction.guildId
    const userId = interaction.user.id

    const result = async () => {
      if (!guildId) {
        return new Failure('No guildId provided')
      } else if (!bypassUserFilter && !userId) {
        return new Failure('Not userId provided')
      } else {
        return await remove(id, guildId, interaction.user.id, bypassUserFilter)
      }
    }

    await interaction.reply(silent({ content: message(await result(), interaction.locale) }))

    return
  }
}
