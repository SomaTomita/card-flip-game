import { CardRepository } from '../repositories/CardRepository';
import { Card, CreateCardInput, UpdateCardInput, CardFilterParams } from '../models/Card';

/**
 * カードに関するビジネスロジックを担当するサービスクラス
 */
export class CardService {
  private readonly repository: CardRepository;

  constructor() {
    this.repository = new CardRepository();
  }

  /**
   * 新しいカードを作成する
   */
  async createCard(input: CreateCardInput): Promise<Card> {
    if (!input.content || input.content.trim().length === 0) {
      throw new Error('カードの内容は必須です');
    }

    if (input.content.length > 200) {
      throw new Error('カードの内容は200文字以内にしてください');
    }

    return this.repository.create({
      ...input,
      content: input.content.trim(),
    });
  }

  /**
   * IDでカードを取得する
   */
  async getCardById(id: string): Promise<Card> {
    const card = await this.repository.findById(id);
    if (!card) {
      throw new Error('カードが見つかりません');
    }
    return card;
  }

  /**
   * 全カードを取得する
   */
  async getAllCards(params?: CardFilterParams): Promise<Card[]> {
    return this.repository.findAll(params);
  }

  /**
   * ゲーム用にランダムなカードを取得する
   */
  async getRandomCards(count: number = 10): Promise<Card[]> {
    if (count < 1 || count > 100) {
      throw new Error('取得枚数は1〜100の間で指定してください');
    }
    return this.repository.findRandomActive(count);
  }

  /**
   * カードを更新する
   */
  async updateCard(id: string, input: UpdateCardInput): Promise<Card> {
    if (input.content !== undefined) {
      if (input.content.trim().length === 0) {
        throw new Error('カードの内容は空にできません');
      }
      if (input.content.length > 200) {
        throw new Error('カードの内容は200文字以内にしてください');
      }
      input.content = input.content.trim();
    }

    const updated = await this.repository.update(id, input);
    if (!updated) {
      throw new Error('カードが見つかりません');
    }
    return updated;
  }

  /**
   * カードを削除する
   */
  async deleteCard(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new Error('カードが見つかりません');
    }
  }

  /**
   * 複数カードを一括作成する
   */
  async bulkCreateCards(inputs: CreateCardInput[]): Promise<Card[]> {
    if (inputs.length === 0) {
      throw new Error('少なくとも1つのカードを指定してください');
    }

    if (inputs.length > 100) {
      throw new Error('一度に作成できるカードは100枚までです');
    }

    // バリデーション
    for (const input of inputs) {
      if (!input.content || input.content.trim().length === 0) {
        throw new Error('全てのカードに内容が必要です');
      }
      if (input.content.length > 200) {
        throw new Error('カードの内容は200文字以内にしてください');
      }
    }

    return this.repository.bulkCreate(
      inputs.map((input) => ({
        ...input,
        content: input.content.trim(),
      }))
    );
  }
}
