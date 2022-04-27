import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import { column, beforeSave, BaseModel } from '@ioc:Adonis/Lucid/Orm'

export default class Users extends BaseModel {
  @column({ isPrimary: true })
  public user_id: number

  @column()
  public email: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public remember_me_token?: string

  @column.dateTime({ autoCreate: true })
  public created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updated_at: DateTime

  @beforeSave()
  public static async hashPassword (users: Users) {
    if (users.$dirty.password) {
      users.password = await Hash.make(users.password)
    }
  }
}