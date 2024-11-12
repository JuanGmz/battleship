import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'ships'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('board_id').unsigned().references('id').inTable('boards').notNullable()
      table.integer('player_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.integer('x').notNullable()
      table.integer('y').notNullable()
      table.integer('hits').defaultTo(0)
      table.timestamps(true)
      table.timestamp('deleted_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}