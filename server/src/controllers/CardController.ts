import { Request, Response, NextFunction } from 'express';
import { CardService } from '../services/CardService';
import { CardCategory, CardDifficulty } from '../models/Card';

/**
 * カード関連のHTTPリクエストを処理するコントローラー
 */
export class CardController {
  private readonly service: CardService;

  constructor() {
    this.service = new CardService();
  }

  /**
   * 全カードを取得する
   * GET /api/cards
   */
  getAllCards = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { category, difficulty, isActive, limit } = req.query;

      const cards = await this.service.getAllCards({
        category: category as CardCategory | undefined,
        difficulty: difficulty as CardDifficulty | undefined,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });

      res.json({ success: true, data: cards });
    } catch (error) {
      next(error);
    }
  };

  /**
   * ゲーム用にランダムなカードを取得する
   * GET /api/cards/random
   */
  getRandomCards = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const count = req.query.count ? parseInt(req.query.count as string, 10) : 10;
      const cards = await this.service.getRandomCards(count);

      res.json({ success: true, data: cards });
    } catch (error) {
      next(error);
    }
  };

  /**
   * IDでカードを取得する
   * GET /api/cards/:id
   */
  getCardById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const card = await this.service.getCardById(req.params.id);
      res.json({ success: true, data: card });
    } catch (error) {
      next(error);
    }
  };

  /**
   * 新しいカードを作成する
   * POST /api/cards
   */
  createCard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const card = await this.service.createCard(req.body);
      res.status(201).json({ success: true, data: card });
    } catch (error) {
      next(error);
    }
  };

  /**
   * カードを更新する
   * PUT /api/cards/:id
   */
  updateCard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const card = await this.service.updateCard(req.params.id, req.body);
      res.json({ success: true, data: card });
    } catch (error) {
      next(error);
    }
  };

  /**
   * カードを削除する
   * DELETE /api/cards/:id
   */
  deleteCard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.deleteCard(req.params.id);
      res.json({ success: true, message: 'カードを削除しました' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * 複数カードを一括作成する
   * POST /api/cards/bulk
   */
  bulkCreateCards = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cards = await this.service.bulkCreateCards(req.body.cards || []);
      res.status(201).json({ success: true, data: cards });
    } catch (error) {
      next(error);
    }
  };
}
