import {
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { DynamoDBConfig } from '../config/dynamodb';
import { Card, CreateCardInput, UpdateCardInput, CardFilterParams } from '../models/Card';

/**
 * カードデータのDynamoDB操作を担当するリポジトリクラス
 */
export class CardRepository {
  private readonly tableName: string;
  private readonly docClient = DynamoDBConfig.getClient();

  constructor() {
    this.tableName = DynamoDBConfig.getTableName('cards');
  }

  /**
   * 新しいカードを作成する
   */
  async create(input: CreateCardInput): Promise<Card> {
    const now = new Date().toISOString();
    const card: Card = {
      id: uuidv4(),
      content: input.content,
      category: input.category || 'normal',
      difficulty: input.difficulty || 'medium',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: card,
      })
    );

    return card;
  }

  /**
   * IDでカードを取得する
   */
  async findById(id: string): Promise<Card | null> {
    const result = await this.docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { id },
      })
    );

    return (result.Item as Card) || null;
  }

  /**
   * 全カードを取得する（フィルタリング可能）
   */
  async findAll(params?: CardFilterParams): Promise<Card[]> {
    const filterExpressions: string[] = [];
    const expressionAttributeValues: Record<string, unknown> = {};
    const expressionAttributeNames: Record<string, string> = {};

    if (params?.category) {
      filterExpressions.push('#category = :category');
      expressionAttributeNames['#category'] = 'category';
      expressionAttributeValues[':category'] = params.category;
    }

    if (params?.difficulty) {
      filterExpressions.push('#difficulty = :difficulty');
      expressionAttributeNames['#difficulty'] = 'difficulty';
      expressionAttributeValues[':difficulty'] = params.difficulty;
    }

    if (params?.isActive !== undefined) {
      filterExpressions.push('#isActive = :isActive');
      expressionAttributeNames['#isActive'] = 'isActive';
      expressionAttributeValues[':isActive'] = params.isActive;
    }

    const result = await this.docClient.send(
      new ScanCommand({
        TableName: this.tableName,
        ...(filterExpressions.length > 0 && {
          FilterExpression: filterExpressions.join(' AND '),
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: expressionAttributeValues,
        }),
        ...(params?.limit && { Limit: params.limit }),
      })
    );

    return (result.Items as Card[]) || [];
  }

  /**
   * アクティブなカードをランダムに取得する
   */
  async findRandomActive(count: number = 1): Promise<Card[]> {
    const allActive = await this.findAll({ isActive: true });

    // Fisher-Yatesシャッフル
    const shuffled = [...allActive];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, count);
  }

  /**
   * カードを更新する
   */
  async update(id: string, input: UpdateCardInput): Promise<Card | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const updateExpressions: string[] = ['#updatedAt = :updatedAt'];
    const expressionAttributeNames: Record<string, string> = { '#updatedAt': 'updatedAt' };
    const expressionAttributeValues: Record<string, unknown> = {
      ':updatedAt': new Date().toISOString(),
    };

    if (input.content !== undefined) {
      updateExpressions.push('#content = :content');
      expressionAttributeNames['#content'] = 'content';
      expressionAttributeValues[':content'] = input.content;
    }

    if (input.category !== undefined) {
      updateExpressions.push('#category = :category');
      expressionAttributeNames['#category'] = 'category';
      expressionAttributeValues[':category'] = input.category;
    }

    if (input.difficulty !== undefined) {
      updateExpressions.push('#difficulty = :difficulty');
      expressionAttributeNames['#difficulty'] = 'difficulty';
      expressionAttributeValues[':difficulty'] = input.difficulty;
    }

    if (input.isActive !== undefined) {
      updateExpressions.push('#isActive = :isActive');
      expressionAttributeNames['#isActive'] = 'isActive';
      expressionAttributeValues[':isActive'] = input.isActive;
    }

    const result = await this.docClient.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { id },
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
      })
    );

    return result.Attributes as Card;
  }

  /**
   * カードを削除する
   */
  async delete(id: string): Promise<boolean> {
    const existing = await this.findById(id);
    if (!existing) return false;

    await this.docClient.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: { id },
      })
    );

    return true;
  }

  /**
   * 複数カードを一括作成する
   */
  async bulkCreate(inputs: CreateCardInput[]): Promise<Card[]> {
    const cards: Card[] = [];
    for (const input of inputs) {
      const card = await this.create(input);
      cards.push(card);
    }
    return cards;
  }
}
