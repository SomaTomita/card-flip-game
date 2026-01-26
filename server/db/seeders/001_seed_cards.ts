import { CardRepository } from '../../src/repositories/CardRepository';
import { CreateCardInput } from '../../src/models/Card';

/**
 * 大喜利のお題データ
 */
const cardData: CreateCardInput[] = [
  // 大喜利系
  { content: 'こんな結婚式は嫌だ。どんなの？', category: 'oogiri', difficulty: 'easy' },
  { content: '「あ、この人モテないな」と思う瞬間', category: 'oogiri', difficulty: 'easy' },
  {
    content: '絶対に言ってはいけない「ただいま」の後の一言',
    category: 'oogiri',
    difficulty: 'medium',
  },
  { content: '世界一やる気のない応援団の掛け声', category: 'oogiri', difficulty: 'medium' },
  { content: '「それ今言う!?」って思う告白のタイミング', category: 'oogiri', difficulty: 'easy' },
  { content: 'AIが人類を滅ぼす前に最後に言った一言', category: 'oogiri', difficulty: 'hard' },
  { content: '「えっ、そこ!?」ってなる遺言', category: 'oogiri', difficulty: 'medium' },
  { content: '合コンで一発アウトになる自己紹介', category: 'oogiri', difficulty: 'easy' },
  { content: '最悪な「おばあちゃんの知恵袋」', category: 'oogiri', difficulty: 'medium' },
  { content: 'サンタクロースがブチギレた理由', category: 'oogiri', difficulty: 'easy' },
  { content: '「この医者、信用できない。」どんな理由？', category: 'oogiri', difficulty: 'medium' },
  { content: '最低最悪のデートプラン', category: 'oogiri', difficulty: 'easy' },
  { content: 'ディズニーランドが急に閉園したワケ', category: 'oogiri', difficulty: 'medium' },
  { content: '「お前はもうクビだ」上司がそう言った理由', category: 'oogiri', difficulty: 'medium' },
  { content: '絶対に流行らない今年の流行語', category: 'oogiri', difficulty: 'hard' },
  { content: 'ダイエット中に絶対言ってはいけない一言', category: 'oogiri', difficulty: 'easy' },
  { content: '最悪のプロポーズの言葉', category: 'oogiri', difficulty: 'medium' },
  { content: '「あ、こいつ嘘ついてるな」と分かる瞬間', category: 'oogiri', difficulty: 'easy' },
  { content: '居酒屋で絶対に頼んではいけないメニュー名', category: 'oogiri', difficulty: 'hard' },
  {
    content: '寿司屋で「お客様、それはちょっと...」何した？',
    category: 'oogiri',
    difficulty: 'medium',
  },
];

/**
 * お題データをシードする
 */
export async function run(): Promise<void> {
  const repository = new CardRepository();

  console.log('🌱 Seeding cards...');

  const cards = await repository.bulkCreate(cardData);
  console.log(`✅ Seeded ${cards.length} cards`);
}

export const name = '001_seed_cards';
