import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { compose } from '@adonisjs/core/helpers'
import { SoftDeletes } from 'adonis-lucid-soft-deletes'
import { DateTime } from 'luxon'
import Game from '#models/game'
import User from '#models/user'

export default class Attack extends compose(BaseModel, SoftDeletes) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare gameId: number

  @column()
  declare playerId: number

  @column()
  declare x: number

  @column()
  declare y: number

  @column()
  declare hit: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @column.dateTime({ columnName: 'deleted_at' })
  declare deletedAt: DateTime

  @belongsTo(() => Game)
  declare game: BelongsTo<typeof Game>

  @belongsTo(() => User)
  declare player: BelongsTo<typeof User>
}