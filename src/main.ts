import { dirname, importx } from '@discordx/importer'
import { config as envConfig } from 'dotenv'
import type { Interaction } from 'discord.js'
import { IntentsBitField, ActivityType } from 'discord.js'
import { Client } from 'discordx'
import { ensureIndexes } from './db.js'

const bot = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages
  ],
  silent: false
})

bot.once('ready', async () => {
  await bot.initApplicationCommands()

  console.log('Bot started')
})

bot.on('interactionCreate', (interaction: Interaction) => {
  bot.executeInteraction(interaction)
})

async function run() {
  envConfig()
  ensureIndexes()

  await importx(`${dirname(import.meta.url)}/{events,commands}/**/*.{ts,js}`)

  if (process.env.BOT_TOKEN) {
    await bot.login(process.env.BOT_TOKEN)

    bot.user?.setActivity('activities', { type: ActivityType.Watching })
  } else {
    throw Error('Could not find BOT_TOKEN')
  }
}

run()
