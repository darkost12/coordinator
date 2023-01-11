import Datastore from '@seald-io/nedb'
import { dirname } from '@discordx/importer'
import { Activity } from './types/activity.js'
import { Result, Success, Failure } from './types/result.js'
import type { Guild, GuildMember } from 'discord.js'

const PageSize = 10

const datastore = () => {
  const db = new Datastore({ filename: dirname(import.meta.url) + '/../.db', autoload: true })

  return db
}

export async function ensureIndexes() {
  const db = datastore()

  const titleIndex = () =>
    db.ensureIndexAsync({ fieldName: 'title', unique: false, sparse: false })
  const userIndex = () =>
    db.ensureIndexAsync({ fieldName: 'userId', unique: false, sparse: false })

  return await Promise.all([titleIndex(), userIndex()])
}

export async function insert(act: Activity): Promise<Result<void>> {
  try {
    await datastore().insertAsync(act)

    return new Success
  } catch (error: any) {
    console.log(`Database error: ${error}`)

    return new Failure(error.message || error)
  }
}

export async function find(
  activity: string | undefined,
  user: GuildMember | undefined,
  guild: Guild | null,
  page: number | undefined
): Promise<Result<Activity[]>> {
  try {
    const baseParams = { visible: true }
    const optionalActivityParam =
      activity ? { title: { $regex: new RegExp('.*' + activity + '.*', 'i') } } : {}
    const optionalUserParam = user ? { userId: user?.id } : {}
    const optionalGuildParam = guild ? { guildId: guild?.id } : {}

    const docs =
      await datastore()
        .findAsync({
          ...baseParams,
          ...optionalActivityParam,
          ...optionalUserParam,
          ...optionalGuildParam
        })
        .skip((page && page > 0 ? page - 1 : 0) * PageSize)
        .limit(PageSize)

    return new Success(
      docs.map(
        d => new Activity(d._id, d.title, d.description, d.guildId, d.userId, d.link, d.visible)
      )
    )
  } catch (error: any) {
    console.log(`Database error: ${error}`)

    return new Failure(error.message || error)
  }
}

export async function byTitle(
  title: string,
  guildId: string
): Promise<Result<Activity[]>> {
  try {
    const docs =
      await datastore().findAsync({ title: title, visible: true })

    return new Success(
      docs.map(
        d => new Activity(d._id, d.title, d.description, d.guildId, d.userId, d.link, d.visible)
      )
    )
  } catch (error: any) {
    console.log(`Database error: ${error}`)

    return new Failure(error.message || error)
  }
}

export async function remove(
  id: string,
  guildId: string,
  userId: string,
  admin: boolean
): Promise<Result<number>> {
  try {
    const baseParams = { _id: { $regex: new RegExp('^' + id + '.{56}$') }, guildId: guildId }
    const optionalUserParam = admin ? {} : { userId: userId }

    const removedItems =
      await datastore()
        .removeAsync({ ...baseParams, ...optionalUserParam }, { multi: false })

    return new Success(removedItems)
  } catch (error: any) {
    console.log(`Database error: ${error}`)

    return new Failure(error.message || error)
  }
}

export async function purge(
  guildId: string
): Promise<Result<void>> {
  try {
    await datastore().removeAsync({ guildId: guildId }, { multi: true })

    return new Success
  } catch (error: any) {
    console.log(`Database error: ${error}`)

    return new Failure(error.message || error)
  }
}

export async function toggleVisible(
  guildId: string,
  userId: string,
  goal: boolean
): Promise<Result<void>> {
  try {
    await datastore()
      .updateAsync(
        { userId: userId, guildId: guildId, visible: !goal },
        { $set: { visible: goal } },
        { multi: true }
      )

    return new Success
  } catch (error: any) {
    console.log(`Database error: ${error}`)

    return new Failure(error.message || error)
  }
}
