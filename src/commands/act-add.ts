import {
  ActionRowBuilder,
  CommandInteraction,
  ModalBuilder,
  ModalSubmitInteraction,
  TextInputBuilder,
  TextInputStyle
} from 'discord.js'
import { Discord, Slash, ModalComponent } from 'discordx'
import { createActivity } from '../types/activity.js'
import { Result } from '../types/result.js'
import silent from '../utils/silent.js'
import { insert } from '../db.js'

const message = (result: Result<void>): string => {
  if (result.type === 'failure') {
    const error = result.error

    if (error && error.includes('unique constraint')) {
      return '❗ Entry already exists'
    } else if (error) {
      return `❗ Error occurred: ${error}`
    } else {
      return '❗ Unknown error occurred'
    }
  } else {
    return '✅ Activity submitted'
  }
}

@Discord()
export class ActAdd {
  @Slash({ description: 'Add new activity preference', name: 'act-add' })
  async handle(interaction: CommandInteraction): Promise<void> {
    const modal = new ModalBuilder()
      .setTitle('New activity')
      .setCustomId('submit')

    const title = new TextInputBuilder()
      .setCustomId('title')
      .setLabel('activity')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Be precise')
      .setRequired(true)
      .setMaxLength(100)
      .setMinLength(3)

    const url = new TextInputBuilder()
      .setCustomId('url')
      .setLabel('link')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Link')
      .setRequired(false)

    const description = new TextInputBuilder()
      .setCustomId('description')
      .setLabel('description')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Your rank in game, convenient hours, etc')
      .setRequired(true)
      .setMaxLength(1000)
      .setMinLength(10)

    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(title),
      new ActionRowBuilder<TextInputBuilder>().addComponents(url),
      new ActionRowBuilder<TextInputBuilder>().addComponents(description)
    )

    await interaction.showModal(modal)
  }

  @ModalComponent()
  async submit(interaction: ModalSubmitInteraction): Promise<void> {
    const [title, url, description] = ['title', 'url', 'description'].map(id =>
      interaction.fields.getTextInputValue(id)
    )

    const result =
      await insert(
        await createActivity(
          title,
          description,
          interaction.guildId || '',
          interaction.user.id,
          url
        )
      )

    await interaction.reply(silent({ content: message(result) }))
    return
  }
}
