import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// 環境変数を読み込む
dotenv.config({ path: path.join(__dirname, '..', '.env') });

interface Migration {
  name: string;
  up: () => Promise<void>;
  down: () => Promise<void>;
}

interface Seeder {
  name: string;
  run: () => Promise<void>;
}

/**
 * マイグレーションファイルを読み込む
 */
async function loadMigrations(): Promise<Migration[]> {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.ts'));

  const migrations: Migration[] = [];
  for (const file of files.sort()) {
    const migration = await import(path.join(migrationsDir, file));
    migrations.push(migration);
  }

  return migrations;
}

/**
 * シーダーファイルを読み込む
 */
async function loadSeeders(): Promise<Seeder[]> {
  const seedersDir = path.join(__dirname, 'seeders');
  const files = fs.readdirSync(seedersDir).filter((f) => f.endsWith('.ts'));

  const seeders: Seeder[] = [];
  for (const file of files.sort()) {
    const seeder = await import(path.join(seedersDir, file));
    seeders.push(seeder);
  }

  return seeders;
}

/**
 * 全マイグレーションを実行する
 */
async function runMigrations(): Promise<void> {
  console.log('🔄 Running migrations...\n');

  const migrations = await loadMigrations();
  for (const migration of migrations) {
    console.log(`📦 Running: ${migration.name}`);
    await migration.up();
    console.log('');
  }

  console.log('✅ All migrations completed!');
}

/**
 * 全マイグレーションをロールバックする
 */
async function rollbackMigrations(): Promise<void> {
  console.log('🔄 Rolling back migrations...\n');

  const migrations = await loadMigrations();
  for (const migration of migrations.reverse()) {
    console.log(`📦 Rolling back: ${migration.name}`);
    await migration.down();
    console.log('');
  }

  console.log('✅ All migrations rolled back!');
}

/**
 * 全シーダーを実行する
 */
async function runSeeders(): Promise<void> {
  console.log('🌱 Running seeders...\n');

  const seeders = await loadSeeders();
  for (const seeder of seeders) {
    console.log(`📦 Running: ${seeder.name}`);
    await seeder.run();
    console.log('');
  }

  console.log('✅ All seeders completed!');
}

/**
 * DBをリセットする（ロールバック → マイグレーション → シード）
 */
async function resetDatabase(): Promise<void> {
  console.log('🔄 Resetting database...\n');

  await rollbackMigrations();
  console.log('');
  await runMigrations();
  console.log('');
  await runSeeders();

  console.log('\n✅ Database reset completed!');
}

/**
 * ヘルプを表示する
 */
function showHelp(): void {
  console.log(`
📚 Database CLI

Usage: npm run db:<command>

Commands:
  migrate   Run all pending migrations
  seed      Run all seeders
  reset     Reset database (rollback + migrate + seed)

Examples:
  npm run db:migrate
  npm run db:seed
  npm run db:reset
`);
}

/**
 * メイン処理
 */
async function main(): Promise<void> {
  const command = process.argv[2];

  try {
    switch (command) {
      case 'migrate':
        await runMigrations();
        break;
      case 'seed':
        await runSeeders();
        break;
      case 'reset':
        await resetDatabase();
        break;
      default:
        showHelp();
        break;
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
