import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import client from './api';
import './CardGame.css';

type Card = {
  id: string;
  content: string;
  category: string;
  difficulty: string;
};

const GAME_TIME = 10; // 10秒

export default function CardGame() {
  const [cards, setCards] = useState<Card[]>([]);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [displayedCardIds, setDisplayedCardIds] = useState<Set<string>>(new Set());
  const [isFlipped, setIsFlipped] = useState(false);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 初期データ取得
  useEffect(() => {
    // APIからカード一覧を取得する
    const fetchData = async () => {
      try {
        const response = await client.get('/');
        if (response.data && response.data.success) {
          setCards(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };
    fetchData();
  }, []);

  // タイマー処理
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isActive, timeLeft]);

  /**
   * 次のカードを取得してゲームを進める
   */
  const nextCard = () => {
    // まだ表示していないカードをフィルタリング
    const remainingCards = cards.filter((card) => !displayedCardIds.has(card.id));

    if (remainingCards.length === 0) {
      alert('全てのお題が出ました！リセットします。');
      setDisplayedCardIds(new Set());
      setIsFlipped(false);
      setIsActive(false);
      setTimeLeft(GAME_TIME);
      setCurrentCard(null);
      return;
    }

    // ランダムに選択
    const randomIndex = Math.floor(Math.random() * remainingCards.length);
    const next = remainingCards[randomIndex];

    setCurrentCard(next);
    setDisplayedCardIds((prev) => new Set(prev).add(next.id));
    setIsFlipped(true);
    setTimeLeft(GAME_TIME);
    setIsActive(true);
  };

  /**
   * カードタップでゲームを開始する
   */
  const handleCardClick = () => {
    if (isFlipped) {
      // 既にめくられている場合は何もしない（あるいはパス機能を実装してもいい）
      return;
    }
    nextCard();
  };

  /**
   * 次へボタンのクリックを処理する
   */
  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(false);
    setIsActive(false);
    setTimeout(() => {
      nextCard();
    }, 300); // カードが戻るアニメーションを待つ
  };

  /**
   * 残り時間に応じてタイマーバーの色を決定する
   */
  const getProgressColor = () => {
    if (timeLeft > 5) return 'progress-green';
    if (timeLeft > 2) return 'progress-yellow';
    return 'progress-red';
  };

  return (
    <div className="game-container">
      {/* ヘッダー情報 */}
      <div className="game-header">
        <div className="game-title">Card Flip Game</div>
        <div className="game-progress">
          残りカード: {cards.length - displayedCardIds.size} / {cards.length}
        </div>
      </div>

      {/* タイマーバー */}
      {isFlipped && (
        <div className="timer-container">
          <div className="timer-row">
            <span>Time: {timeLeft}s</span>
            {timeLeft === 0 && <span className="timer-timeup">TIME UP!</span>}
          </div>
          <div className="timer-bar">
            <motion.div
              className={`timer-progress ${getProgressColor()}`}
              initial={{ width: '100%' }}
              animate={{ width: `${(timeLeft / GAME_TIME) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {/* カード */}
      <div className="flip-card card-wrapper" onClick={handleCardClick}>
        <motion.div
          className="flip-card-inner card-inner"
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
        >
          {/* 表面（お題） */}
          <div className="flip-card-front card-front">
            <h1 className="card-front-title">TAP TO START</h1>
            <p className="card-front-subtitle">タップしてお題を表示</p>
          </div>

          {/* 裏面（内容） */}
          <div className="flip-card-back card-back">
            {currentCard ? (
              <>
                <div className="card-badges">
                  <span className={`badge ${currentCard.difficulty}`}>
                    {currentCard.difficulty.toUpperCase()}
                  </span>
                </div>
                <div className="card-category">{currentCard.category.toUpperCase()}</div>
                <h2 className="card-question">{currentCard.content}</h2>
              </>
            ) : (
              <div className="card-loading">Loading...</div>
            )}
          </div>
        </motion.div>
      </div>

      {/* コントロール */}
      <AnimatePresence>
        {isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="next-button-wrapper"
          >
            <button onClick={handleNext} className="next-button">
              NEXT CARD
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="next-button-icon"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
