import {
  ActionRowBuilder,
  CommandInteraction,
  Locale,
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
import t from '../utils/t.js'

const message = (result: Result<void>, locale: Locale): string => {
  if (result.type === 'failure') {
    const error = result.error

    if (error && error.includes('unique constraint')) {
      return '❗ ' + t('errors.already_exists', locale)
    } else if (error) {
      return '❗ ' + t('errors.specific', locale) + error
    } else {
      return '❗ ' + + t('errors.unknown', locale)
    }
  } else {
    return '✅ ' + t('add.success', locale)
  }
}

@Discord()
export class ActAdd {
  @Slash({
    description: 'Add new activity preference',
    name: 'act-add',
    descriptionLocalizations: {
      "ru": t('add.gist', Locale.Russian)
    }
  })
  async handle(interaction: CommandInteraction): Promise<void> {
    const locale = interaction.locale

    const modal = new ModalBuilder()
      .setTitle(t('add.modal_name', locale))
      .setCustomId('submit')

    const title = new TextInputBuilder()
      .setCustomId('title')
      .setLabel(t('add.title', locale))
      .setStyle(TextInputStyle.Short)
      .setPlaceholder(t('add.title_placeholder', locale))
      .setRequired(true)
      .setMaxLength(100)
      .setMinLength(3)

    const url = new TextInputBuilder()
      .setCustomId('url')
      .setLabel(t('add.link', locale))
      .setStyle(TextInputStyle.Short)
      .setPlaceholder(t('add.link_placeholder', locale))
      .setRequired(false)

    const description = new TextInputBuilder()
      .setCustomId('description')
      .setLabel(t('add.description', locale))
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder(t('add.description_placeholder', locale))
      .setRequired(true)
      .setMaxLength(1000)
      .setMinLength(10)

    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(title),
      new ActionRowBuilder<TextInputBuilder>().addComponents(url),
      new ActionRowBuilder<TextInputBuilder>().addComponents(description)
    )

    await interaction.showModal(modal)

    return
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

    await interaction.reply(silent({ content: message(result, interaction.locale) }))
    return
  }
}
