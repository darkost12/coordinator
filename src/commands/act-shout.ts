import {
  ApplicationCommandOptionType,
  CommandInteraction,
  UserManager,
  userMention
} from 'discord.js'
import { Discord, Slash, SlashOption } from 'discordx'
import { Failure, Result } from '../types/result.js'
import { Activity } from '../types/activity'
import removeDuplicates from '../utils/removeDuplicates.js'
import resolveIds from '../utils/usersFromIds.js'
import silent from '../utils/silent.js'
import { byTitle } from '../db.js'

async function message(
  result: Result<Activity[]>,
  activityTitle: string,
  userText: string | undefined,
  userId: string,
  manager: UserManager
): Promise<[string, boolean]> {
  if (result.type === 'success' && result.value) {
    const users =
      await resolveIds(
        removeDuplicates(
          result.value.map(act => act.userId).filter(id => id.toString() !== userId)
        ),
        manager
      )

    const mentions = users.map(u => userMention(u.id))

    if (mentions.length > 0 || userText) {
      const base = userMention(userId) + ' gathers people for ' + activityTitle

      return [`${base} \n ${userText || ''} \n ${mentions.join(' ')} \n`, false]
    } else {
      return [`❗ No users with this activity or no message provided`, true]
    }
  } else {
    if (result.type === 'failure' && result.error) {
      return [`❗ Error occurred: ${result.error}`, true]
    } else {
      return ['❗ Unknown error occurred', true]
    }
  }
}

@Discord()
export class ActShout {
  @Slash({ description: 'Notify people with same interests', name: 'act-shout' })
  async handle(
    @SlashOption({
      description: 'title',
      name: 'title',
      required: true,
      type: ApplicationCommandOptionType.String
    })
    @SlashOption({
      description: 'additional text',
      name: 'text',
      required: false,
      type: ApplicationCommandOptionType.String
    })
    title: string,
    text: string | undefined,
    interaction: CommandInteraction
  ): Promise<void> {
    const guildId = interaction.guildId

    const result = async () => {
      if (guildId) {
        return await byTitle(title, guildId)
      } else {
        return new Failure('No guildId provided')
      }
    }

    const [response, silently] =
      await message(
        await result(),
        title,
        text,
        interaction.user.id,
        interaction.client.users
      )

    if (silently) {
      await interaction.reply(silent({ content: response }))
    } else {
      await interaction.reply({ content: response })
    }

    return
  }
}
