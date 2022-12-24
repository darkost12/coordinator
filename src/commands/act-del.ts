import {
  ApplicationCommandOptionType,
  CommandInteraction
} from 'discord.js'
import { Discord, Slash, SlashOption } from 'discordx'
import { Failure, Result } from '../types/result.js'
import silent from '../utils/silent.js'
import { remove } from '../db.js'

const message = (result: Result<number>): string => {
  if (result.type === 'failure') {
    const error = result.error

    if (error) {
      return `❗ Error occurred: ${error}`
    } else {
      return '❗ Unknown error occurred'
    }
  } else if (result.type === 'success' && result.value === 0) {
    return '🟰 Not deleted'
  } else {
    return '✅ Successfully deleted'
  }
}

@Discord()
export class ActDel {
  @Slash({ description: 'Delete activity', name: 'act-del' })
  async handle(
    @SlashOption({
      description: 'id',
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

    await interaction.reply(silent({ content: message(await result()) }))

    return
  }
}
