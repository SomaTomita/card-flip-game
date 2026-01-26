import { Router } from 'express';
import { CardController } from '../controllers/CardController';

/**
 * カード関連のルーティングを定義
 */
const router = Router();
const controller = new CardController();

// ゲーム用ランダムカード取得（/random は :id より先に定義）
router.get('/random', controller.getRandomCards);

// CRUD操作
router.get('/', controller.getAllCards);
router.get('/:id', controller.getCardById);
router.post('/', controller.createCard);
router.post('/bulk', controller.bulkCreateCards);
router.put('/:id', controller.updateCard);
router.delete('/:id', controller.deleteCard);

export default router;
