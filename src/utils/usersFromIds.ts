import { UserManager, User } from 'discord.js'

const removeNulls = (value: User | null): value is User => {
  return value !== null
}

export default async function fromIds(ids: string[], manager: UserManager): Promise<User[]> {
  const results =
    await Promise.all(
      ids.map(async id => {
        try {
          return await manager.fetch(id, { cache: true })
        } catch (_: any) {
          return Promise.resolve(null)
        }
      })
    )

  return results.filter(removeNulls)
}
