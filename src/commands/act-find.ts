import {
  ApplicationCommandOptionType,
  CommandInteraction,
  EmbedBuilder,
  GuildMember,
  italic,
  Locale,
  User,
  UserManager,
  userMention
} from 'discord.js'
import { Discord, Slash, SlashOption } from 'discordx'
import { Activity } from '../types/activity'
import { Result } from '../types/result.js'
import removeDuplicates from '../utils/removeDuplicates.js'
import resolveIds from '../utils/usersFromIds.js'
import silent from '../utils/silent.js'
import { find } from '../db.js'
import t from '../utils/t.js'

const presentUsername = (users: User[], id: string, locale: Locale) => {
  const mbUser = users.find(u => u.id.toString() === id)

  if (mbUser) {
    return userMention(mbUser.id)
  } else {
    return t('find.unknown_user', locale)
  }
}

const presentActivity = (act: Activity, userName: string, locale: Locale): string => {
  const presentTitle = (act: Activity): string => {
    const t = italic(act.title)
    const l = act.link

    return (l ? `[${t}](${l})` : t) + ' | ' + act._id.substring(0, 8)
  }

  return `${userName} ${t('find.suggests', locale)} ${presentTitle(act)} \n ${act.description} \n`
}

async function embed(
  result: Result<Activity[]>,
  manager: UserManager,
  locale: Locale
): Promise<EmbedBuilder> {
  const embed = new EmbedBuilder().setTitle(t('find.results', locale))

  if (result.type === 'success' && result.value) {
    if (result.value.length > 0) {
      const users =
        await resolveIds(removeDuplicates(result.value.map(act => act.userId)), manager)
      const entries = result.value.map((entry, i) =>
        `${i + 1}. ` + presentActivity(entry, presentUsername(users, entry.userId, locale), locale)
      )

      return embed.setDescription(entries.join('\n'))
    } else {
      return embed.setDescription(t('find.nothing_found', locale))
    }
  } else {
    if (result.type === 'failure' && result.error) {
      return embed.setDescription('❗ ' + t('errors.specific', locale) + result.error)
    } else {
      return embed.setDescription('❗ ' + t('errors.unknown', locale))
    }
  }
}

@Discord()
export class ActFind {
  @Slash({
    description: 'Find existing activities',
    name: 'act-find',
    descriptionLocalizations: {
      "ru": t('find.gist', Locale.Russian)
    }
  })
  async handle(
    @SlashOption({
      description: 'User',
      name: 'user',
      descriptionLocalizations: {
        "ru": t('find.param_user', Locale.Russian)
      },
      required: false,
      type: ApplicationCommandOptionType.User,
    })
    @SlashOption({
      description: 'Page',
      name: 'page',
      descriptionLocalizations: {
        "ru": t('find.param_page', Locale.Russian)
      },
      required: false,
      type: ApplicationCommandOptionType.Integer,
    })
    user: GuildMember | undefined,
    page: number | undefined,
    interaction: CommandInteraction
  ): Promise<void> {
    const result = await find(user, interaction.guild, page)

    await interaction.reply(
      silent({
        embeds: [await embed(result, interaction.client.users, interaction.locale)]
      })
    )

    return
  }
}
