import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'games'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('player_1_id').unsigned().references('id').inTable('users').notNullable()
      table.integer('player_2_id').unsigned().references('id').inTable('users').nullable()
      table.enum('status', ['WAITING', 'IN_PROGRESS', 'FINISHED']).defaultTo('WAITING')
      table.integer('winner_id').unsigned().references('id').inTable('users').nullable()
      table.integer('looser_id').unsigned().references('id').inTable('users').nullable()
      table.timestamp('created_at').nullable().defaultTo(null);
      table.timestamp('updated_at').nullable().defaultTo(null);      
      table.timestamp('deleted_at').nullable().defaultTo(null);
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}