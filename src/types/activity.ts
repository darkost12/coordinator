import hash from '../utils/hash.js'
export class Activity {
  _id: string
  title: string
  link: string
  description: string
  guildId: string
  userId: string
  visible: boolean

  constructor(
    id: string,
    title: string,
    description: string,
    guildId: string,
    userId: string,
    link?: string,
    visible?: boolean
  ) {
    this._id = id
    this.title = title
    this.description = description
    this.guildId = guildId
    this.userId = userId
    this.link = link || ''
    this.visible = visible || true
  }

  public async createActivity(
    title: string,
    description: string,
    guildId: string,
    userId: string,
    link?: string
  ): Promise<Activity> {
    const id = await hash(title + userId.toString())

    return new Activity(id, title, description, guildId, userId, link)
  }
}

export const createActivity = Activity.prototype.createActivity
