import {
  ApplicationCommandOptionType,
  CommandInteraction,
  Locale,
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
import t from '../utils/t.js'

async function message(
  result: Result<Activity[]>,
  activityTitle: string,
  userText: string | undefined,
  userId: string,
  manager: UserManager,
  locale: Locale
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
      const base = userMention(userId) + t('shout.gathers', locale) + activityTitle

      return [`${base} \n${userText || ''} \n ${mentions.join(' ')} \n`, false]
    } else {
      return ['❗ ' + t('shout.nothing_found', locale), true]
    }
  } else {
    if (result.type === 'failure' && result.error) {
      return ['❗ ' + t('errors.specific', locale) + result.error, true]
    } else {
      return ['❗ ' + t('errors.unknown', locale), true]
    }
  }
}

@Discord()
export class ActShout {
  @Slash({
    description: 'State your readiness to do something and call people to participate',
    name: 'act-shout',
    descriptionLocalizations: {
      'ru': t('shout.gist', Locale.Russian)
    },
  })
  async handle(
    @SlashOption({
      description: 'Title',
      name: 'title',
      descriptionLocalizations: {
        'ru': t('shout.param_title', Locale.Russian)
      },
      required: true,
      type: ApplicationCommandOptionType.String
    })
    @SlashOption({
      description: 'Additional message',
      name: 'text',
      descriptionLocalizations: {
        'ru': t('find.param_text', Locale.Russian)
      },
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
        interaction.client.users,
        interaction.locale
      )

    if (silently) {
      await interaction.reply(silent({ content: response }))
    } else {
      await interaction.reply({ content: response })
    }

    return
  }
}
