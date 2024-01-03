import { useEffect, useState } from "react";
import { motion } from 'framer-motion';
import client from "./api";
import "./MainPage.css";


type Card = {
  id: number;
  content: string;
};


export default function MainPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [displayedCards, setDisplayedCards] = useState<Card[]>([]);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimation, setIsAnimation] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await client.get("/");
        setCards(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, []);


  function handleFlip() {
    // まだ表示されていないカードがある場合にのみ処理を実行
    if (!isAnimation && cards.length > displayedCards.length) {
      setIsFlipped(!isFlipped);
      setIsAnimation(true);

      
      if (!isFlipped) { // カードがフリップされていない時
        // まだ表示されていないカードのみを含む配列を作成
        const remainingCards = cards.filter(card => !displayedCards.includes(card));
        // 0以上1未満のランダムな数✖️未表示のカードの数で、ランダムにインデックスを選択
        const randomIndex = Math.floor(Math.random() * remainingCards.length);
        // 選択されたカードを取得
        const selectedCard = remainingCards[randomIndex];

        setCurrentCard(selectedCard);
        setDisplayedCards([...displayedCards, selectedCard]);
      }
    }
  }


  return (
    <div className="flex items-center justify-center bg-black h-[800px] cursor-pointer">
      <div className="flip-card w-[600px] h-[360px] rounded-md" onClick={handleFlip}>
        <motion.div
          className="flip-card-inner w-[100%] h-[100%]"
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 360 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          onAnimationComplete={() => setIsAnimation(false)}
        >
          <div className="flip-card-front w-[100%] h-[100%] bg-cover border-[1%] text-white rounded-lg p-4">
            <h1>お題</h1>
          </div>
          <div className="flip-card-back w-[100%] h-[100%] bg-cover border-[1%] text-white rounded-lg p-4">
            <h1 className="text-2xl font-bold">{currentCard ? currentCard.content : "Loading..."}</h1>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
