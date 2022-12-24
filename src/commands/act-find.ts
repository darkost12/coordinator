import {
  ApplicationCommandOptionType,
  CommandInteraction,
  EmbedBuilder,
  GuildMember,
  italic,
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

const presentUsername = (users: User[], id: string) => {
  const mbUser = users.find(u => u.id.toString() === id)

  if (mbUser) {
    return userMention(mbUser.id)
  } else {
    return 'Unknown user'
  }
}

const presentActivity = (act: Activity, userName: string): string => {
  const presentTitle = (act: Activity): string => {
    const t = italic(act.title)
    const l = act.link

    return `${act._id.substring(0, 8)} | ` + (l ? `[${t}](${l})` : t)
  }

  return `${userName} suggests ${presentTitle(act)} \n ${act.description} \n`
}

async function embed(result: Result<Activity[]>, manager: UserManager): Promise<EmbedBuilder> {
  const embed = new EmbedBuilder().setTitle('Results')

  if (result.type === 'success' && result.value) {
    if (result.value.length > 0) {
      const users =
        await resolveIds(removeDuplicates(result.value.map(act => act.userId)), manager)
      const entries = result.value.map((entry, i) =>
        `${i + 1}. ` + presentActivity(entry, presentUsername(users, entry.userId))
      )

      return embed.setDescription(entries.join('\n'))
    } else {
      return embed.setDescription('No entries found')
    }
  } else {
    if (result.type === 'failure' && result.error) {
      return embed.setDescription(`❗ Error occurred: ${result.error}`)
    } else {
      return embed.setDescription('❗ Unknown error occurred')
    }
  }
}

@Discord()
export class ActFind {
  @Slash({ description: 'Find existing activities', name: 'act-find' })
  async handle(
    @SlashOption({
      description: 'user',
      name: 'user',
      required: false,
      type: ApplicationCommandOptionType.User,
    })
    @SlashOption({
      description: 'page',
      name: 'page',
      required: false,
      type: ApplicationCommandOptionType.Integer,
    })
    user: GuildMember | undefined,
    page: number | undefined,
    interaction: CommandInteraction
  ): Promise<void> {
    const result = await find(user, interaction.guild, page)

    await interaction.reply(silent({ embeds: [await embed(result, interaction.client.users)] }))

    return
  }
}
