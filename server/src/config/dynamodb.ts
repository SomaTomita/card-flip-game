import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import dotenv from 'dotenv';

dotenv.config();

/**
 * DynamoDB クライアントの設定と初期化を行う
 */
class DynamoDBConfig {
  private static instance: DynamoDBDocumentClient | null = null;
  private static rawInstance: DynamoDBClient | null = null;

  /**
   * DynamoDB Document Client のシングルトンインスタンスを取得
   */
  static getClient(): DynamoDBDocumentClient {
    if (!this.instance) {
      const client = this.getRawClient();

      this.instance = DynamoDBDocumentClient.from(client, {
        marshallOptions: {
          removeUndefinedValues: true,
        },
      });
    }

    return this.instance;
  }

  /**
   * DynamoDB Low-level Client のシングルトンインスタンスを取得
   */
  static getRawClient(): DynamoDBClient {
    if (!this.rawInstance) {
      const isLocal = process.env.NODE_ENV !== 'production';

      this.rawInstance = new DynamoDBClient({
        region: process.env.APP_AWS_REGION || process.env.AWS_REGION || 'ap-northeast-1',
        ...(isLocal && {
          endpoint: process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000',
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'local',
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'local',
          },
        }),
      });
    }

    return this.rawInstance;
  }

  /**
   * テーブル名にプレフィックスを付与して返す
   */
  static getTableName(baseName: string): string {
    const prefix = process.env.DYNAMODB_TABLE_PREFIX || 'cardflip_';
    return `${prefix}${baseName}`;
  }
}

export { DynamoDBConfig };
