import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { compose } from '@adonisjs/core/helpers'
import { SoftDeletes } from 'adonis-lucid-soft-deletes'
import Board from '#models/board'

export default class Ship extends compose(BaseModel, SoftDeletes) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare boardId: number

  @column()
  declare x: number

  @column()
  declare y: number

  @column()
  declare size: number

  @column()
  declare playerId: number  

  @column()
  declare hits: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @column.dateTime({ columnName: 'deleted_at' })
  declare deletedAt: DateTime

  @belongsTo(() => Board)
  declare board: BelongsTo<typeof Board>
}