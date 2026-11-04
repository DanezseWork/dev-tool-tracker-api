import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema20260604000000 implements MigrationInterface {
  name = 'InitSchema20260604000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "email" character varying NOT NULL,
        "password_hash" character varying NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email")
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."tools_billing_cycle_enum" AS ENUM ('monthly', 'annual', 'free')
    `);

    await queryRunner.query(`
      CREATE TABLE "tools" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "name" character varying NOT NULL,
        "description" character varying,
        "category" character varying,
        "usage_limit" integer,
        "usage_unit" character varying,
        "billing_cycle" "public"."tools_billing_cycle_enum" NOT NULL DEFAULT 'monthly',
        "billing_reset_day" integer NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tools" PRIMARY KEY ("id"),
        CONSTRAINT "FK_tools_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "usage_logs" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tool_id" uuid NOT NULL,
        "usage_percent" integer NOT NULL,
        "absolute_used" integer,
        "note" character varying,
        "logged_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_usage_logs" PRIMARY KEY ("id"),
        CONSTRAINT "FK_usage_logs_tool" FOREIGN KEY ("tool_id") REFERENCES "tools"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "usage_logs"`);
    await queryRunner.query(`DROP TABLE "tools"`);
    await queryRunner.query(`DROP TYPE "public"."tools_billing_cycle_enum"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
