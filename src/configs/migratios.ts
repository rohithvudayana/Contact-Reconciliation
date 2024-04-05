import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("Contact", function (table) {
    table.increments("id").primary();
    table.string("phone_number");
    table.string("email");
    table.integer("linked_id").unsigned().nullable();
    table.enum("link_precedence", ["secondary", "primary"]).notNullable();
    // table.enum('linkPrecedence', ['secondary', 'primary']).notNullable().defaultTo('primary');        // table.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    table.timestamps(true, true);
    table.dateTime("deleted_at").nullable();

    // Add foreign key constraint to link contacts
    table.foreign("linked_id").references("id").inTable("Contact");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("Contact");
}
