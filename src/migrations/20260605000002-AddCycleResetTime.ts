import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCycleResetTime20260605000002 implements MigrationInterface {
  name = 'AddCycleResetTime20260605000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Nullable TIME column — null means midnight UTC is assumed at runtime
    await queryRunner.query(`
      ALTER TABLE "tools"
        ADD COLUMN "cycle_reset_time" time
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tools" DROP COLUMN "cycle_reset_time"`);
  }
}
