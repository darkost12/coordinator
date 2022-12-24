import { InteractionReplyOptions } from 'discord.js'

export default function silent(options: InteractionReplyOptions): InteractionReplyOptions {
  return { ...options, ephemeral: true }
}
