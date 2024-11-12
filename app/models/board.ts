import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { compose } from '@adonisjs/core/helpers'
import { SoftDeletes } from 'adonis-lucid-soft-deletes'
import Game from '#models/game'
import User from '#models/user'
import Ship from '#models/ship'

export default class Board extends compose(BaseModel, SoftDeletes) {
  public static table = 'boards'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare gameId: number

  @column()
  declare playerId: number

  @column({ serializeAs: null })
  declare boardData: any 

  @belongsTo(() => Game)
  declare game: BelongsTo<typeof Game>

  @belongsTo(() => User)
  declare player: BelongsTo<typeof User>

  @hasMany(() => Ship)
  declare ships: HasMany<typeof Ship>
}
