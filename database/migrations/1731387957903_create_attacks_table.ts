import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'attacks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('game_id').unsigned().references('id').inTable('games').notNullable()
      table.integer('player_id').unsigned().references('id').inTable('users').notNullable()
      table.integer('x').notNullable()
      table.integer('y').notNullable()
      table.boolean('hit').notNullable()
      table.timestamp('created_at').nullable().defaultTo(null);
      table.timestamp('updated_at').nullable().defaultTo(null);      
      table.timestamp('deleted_at').nullable().defaultTo(null);
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}