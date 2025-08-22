import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const CartItem = sequelize.define('CartItem', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  cartId: { type: DataTypes.BIGINT, allowNull:false },
  offerId: { type: DataTypes.BIGINT, allowNull:false },
  quantity: { type: DataTypes.INTEGER, allowNull:false, defaultValue:1 },
  unitPriceAmount: { type: DataTypes.INTEGER, allowNull:false }
},{ tableName:'cart_items', underscored:true, paranoid:true, indexes:[{ unique:true, fields:['cart_id','offer_id'] }]});
export default CartItem;
