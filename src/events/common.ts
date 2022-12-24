import type { ArgsOf, Client } from 'discordx'
import { Discord, On } from 'discordx'
import { purge, toggleVisible } from '../db.js'

@Discord()
export class Events {
  @On()
  guildBanAdd([ban]: ArgsOf<'guildBanAdd'>, _: Client): void {
    toggleVisible(ban.guild.id, ban.user.id, false)
  }
  @On()
  guildMemberRemove([member]: ArgsOf<'guildMemberRemove'>, _: Client): void {
    toggleVisible(member.guild.id, member.id, false)
  }

  @On()
  guildBanRemove([ban]: ArgsOf<'guildBanRemove'>, _: Client): void {
    toggleVisible(ban.guild.id, ban.user.id, true)
  }
  @On()
  guildMemberAdd([member]: ArgsOf<'guildMemberAdd'>, _: Client): void {
    toggleVisible(member.guild.id, member.id, true)
  }

  @On()
  guildDelete([guild]: ArgsOf<'guildDelete'>, _: Client): void {
    purge(guild.id)
  }
}
