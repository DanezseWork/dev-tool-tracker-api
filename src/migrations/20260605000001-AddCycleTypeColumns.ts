import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCycleTypeColumns20260605000001 implements MigrationInterface {
  name = 'AddCycleTypeColumns20260605000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the cycle_type enum type
    await queryRunner.query(`
      CREATE TYPE "public"."tools_cycle_type_enum" AS ENUM ('monthly', 'weekly', 'custom')
    `);

    // Add cycle_type column with default 'monthly' so existing rows are backfilled
    await queryRunner.query(`
      ALTER TABLE "tools"
        ADD COLUMN "cycle_type" "public"."tools_cycle_type_enum" NOT NULL DEFAULT 'monthly'
    `);

    // Add cycle_length_days — nullable, only used for custom cycles
    await queryRunner.query(`
      ALTER TABLE "tools"
        ADD COLUMN "cycle_length_days" integer
    `);

    // Add cycle_start_date — nullable, used for weekly and custom cycles
    await queryRunner.query(`
      ALTER TABLE "tools"
        ADD COLUMN "cycle_start_date" date
    `);

    // Ensure billing_reset_day is nullable (safe to run even if already nullable)
    await queryRunner.query(`
      ALTER TABLE "tools"
        ALTER COLUMN "billing_reset_day" DROP NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tools" DROP COLUMN "cycle_start_date"`);
    await queryRunner.query(`ALTER TABLE "tools" DROP COLUMN "cycle_length_days"`);
    await queryRunner.query(`ALTER TABLE "tools" DROP COLUMN "cycle_type"`);
    await queryRunner.query(`DROP TYPE "public"."tools_cycle_type_enum"`);
  }
}
