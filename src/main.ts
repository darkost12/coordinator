import { dirname, importx } from '@discordx/importer'
import { config as envConfig } from 'dotenv'
import type { Interaction } from 'discord.js'
import { IntentsBitField, ActivityType } from 'discord.js'
import { Client } from 'discordx'
import { ensureIndexes } from './db.js'
import { createServer } from 'http'

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

bot.rest.on('restDebug', message => {
  if (message.includes('429 rate limit')) {
    console.log('Rate limit hit at' + (new Date()).toTimeString())
    // Your handler
  }
})

async function run() {
  envConfig({ path: dirname(import.meta.url) + '/../shared/.env' })
  ensureIndexes()

  await importx(`${dirname(import.meta.url)}/{events,commands}/**/*.{ts,js}`)

  if (process.env.BOT_TOKEN && process.env.DB_FILE) {
    await bot.login(process.env.BOT_TOKEN)

    bot.user?.setActivity('your activities', { type: ActivityType.Watching })

    createServer((_, res) => res.end('Bot is alive!')).listen(3000)
  } else {
    throw Error('Could not find BOT_TOKEN or DB_FILE')
  }
}

run()
