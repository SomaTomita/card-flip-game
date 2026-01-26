/**
 * カードモデル - お題カードのデータ構造を定義
 */
export interface Card {
  id: string;
  content: string;
  category: CardCategory;
  difficulty: CardDifficulty;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * カードのカテゴリ
 */
export type CardCategory = 'oogiri' | 'kiwadoi' | 'normal';

/**
 * 難易度レベル
 */
export type CardDifficulty = 'easy' | 'medium' | 'hard';

/**
 * カード作成時の入力データ
 */
export interface CreateCardInput {
  content: string;
  category?: CardCategory;
  difficulty?: CardDifficulty;
}

/**
 * カード更新時の入力データ
 */
export interface UpdateCardInput {
  content?: string;
  category?: CardCategory;
  difficulty?: CardDifficulty;
  isActive?: boolean;
}

/**
 * カードフィルタリング用のパラメータ
 */
export interface CardFilterParams {
  category?: CardCategory;
  difficulty?: CardDifficulty;
  isActive?: boolean;
  limit?: number;
}
