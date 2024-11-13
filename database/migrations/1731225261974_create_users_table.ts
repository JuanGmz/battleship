import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('full_name').nullable()
      table.string('email', 254).notNullable().unique()
      table.string('password').notNullable()
      table.boolean('active').notNullable().defaultTo(false)
      table.string('role').notNullable().defaultTo('guest')
      table.string('avatar').nullable()
      table.string('token_laravel', 2048).nullable()
      table.string('token_adonis', 2048).nullable()
      table.timestamp('created_at').nullable().defaultTo(null);
      table.timestamp('updated_at').nullable().defaultTo(null);      
      table.timestamp('deleted_at').nullable().defaultTo(null);
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}