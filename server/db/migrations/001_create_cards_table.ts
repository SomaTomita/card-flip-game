import {
  CreateTableCommand,
  DeleteTableCommand,
  DescribeTableCommand,
} from '@aws-sdk/client-dynamodb';
import { DynamoDBConfig } from '../../src/config/dynamodb';

const tableName = DynamoDBConfig.getTableName('cards');

/**
 * cardsテーブルを作成するマイグレーション
 */
export async function up(): Promise<void> {
  const client = DynamoDBConfig.getRawClient();

  // テーブルが既に存在するかチェック
  try {
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    console.log(`Table ${tableName} already exists, skipping...`);
    return;
  } catch (error: unknown) {
    if ((error as { name?: string }).name !== 'ResourceNotFoundException') {
      throw error;
    }
  }

  await client.send(
    new CreateTableCommand({
      TableName: tableName,
      KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' },
        { AttributeName: 'category', AttributeType: 'S' },
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'category-index',
          KeySchema: [{ AttributeName: 'category', KeyType: 'HASH' }],
          Projection: { ProjectionType: 'ALL' },
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
          },
        },
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
    })
  );

  console.log(`✅ Created table: ${tableName}`);
}

/**
 * cardsテーブルを削除する
 */
export async function down(): Promise<void> {
  const client = DynamoDBConfig.getRawClient();

  try {
    await client.send(new DeleteTableCommand({ TableName: tableName }));
    console.log(`✅ Deleted table: ${tableName}`);
  } catch (error: unknown) {
    if ((error as { name?: string }).name === 'ResourceNotFoundException') {
      console.log(`Table ${tableName} does not exist, skipping...`);
      return;
    }
    throw error;
  }
}

export const name = '001_create_cards_table';
