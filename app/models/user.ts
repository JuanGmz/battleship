import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { SoftDeletes } from 'adonis-lucid-soft-deletes'
import Game from '#models/game'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder, SoftDeletes) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fullName: string | null

  @column()
  declare email: string

  @column()
  declare active: Boolean

  @column()
  declare role: string

  @column()
  declare avatar: string | null

  @column({ serializeAs: null })
  declare password: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @column.dateTime({ columnName: 'deleted_at' })
  declare deletedAt: DateTime

  static accessTokens = DbAccessTokensProvider.forModel(User)

  @hasMany(() => Game, { foreignKey: 'player1Id' })
  declare gamesAsPlayer1: HasMany<typeof Game>

  @hasMany(() => Game, { foreignKey: 'player2Id' })
  declare gamesAsPlayer2: HasMany<typeof Game>
}