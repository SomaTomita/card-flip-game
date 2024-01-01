import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/db.config';

export class Card extends Model<InferAttributes<Card>, InferCreationAttributes<Card>> {
  public id!: CreationOptional<number>;
  public content!: string;
  // CreationOptional = 特定のフィールドがモデルのインスタンスを作成する際に省略可
  // public = アクセス修飾子 = このプロパティがクラスの外部からアクセス可(デフォルトで public)
            // card.routes.tsでは、Card クラスのコンストラクタに渡されるオブジェクト（この場合は { content }）を使用して、新しいカードをデータベースに保存
  // !: = 非nullアサーション演算子 = nullまたはundefinedにならず必ず値あり
}

Card.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  content: {
    type: new DataTypes.STRING(40),
    allowNull: false,
  },
}, {
  tableName: 'cards',
  sequelize,
});