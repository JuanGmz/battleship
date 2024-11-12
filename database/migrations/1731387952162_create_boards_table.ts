import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'boards'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('game_id').unsigned().references('id').inTable('games').notNullable()
      table.integer('player_id').unsigned().references('id').inTable('users').notNullable()
      table.json('board_data').notNullable() // JSON column to store board positions
      table.timestamps(true)
      table.timestamp('deleted_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}