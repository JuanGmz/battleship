import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { compose } from '@adonisjs/core/helpers'
import { SoftDeletes } from 'adonis-lucid-soft-deletes'
import User from '#models/user'
import Board from '#models/board'
import Attack from '#models/attack'

export default class Game extends compose(BaseModel, SoftDeletes) {
  public static table = 'games'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare player1_id: number

  @column()
  declare player2_id: number | null

  @column()
  declare status: 'WAITING' | 'IN_PROGRESS' | 'FINISHED'

  @column()
  declare winnerId: number | null

  @column()
  declare looserId: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @column.dateTime({ columnName: 'deleted_at' })
  declare deletedAt: DateTime

  @belongsTo(() => User, { foreignKey: 'player1Id' })
  declare player1: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'player2Id' })
  declare player2: BelongsTo<typeof User>

  @hasMany(() => Board)
  declare boards: HasMany<typeof Board>

  @hasMany(() => Attack)
  declare attacks: HasMany<typeof Attack>
}
