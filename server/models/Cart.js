import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';

const Cart = sequelize.define('Cart', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.BIGINT },
  guestToken: { type: DataTypes.STRING(64), unique:true },
  currency: { type: DataTypes.STRING(3), allowNull:false, defaultValue:'EUR' },
  itemsSubtotalAmount: { type: DataTypes.INTEGER, allowNull:false, defaultValue:0 },
  shippingAmount: { type: DataTypes.INTEGER, allowNull:false, defaultValue:0 },
  taxAmount: { type: DataTypes.INTEGER, allowNull:false, defaultValue:0 },
  discountAmount: { type: DataTypes.INTEGER, allowNull:false, defaultValue:0 },
  grandTotalAmount: { type: DataTypes.INTEGER, allowNull:false, defaultValue:0 },
  expiresAt: { type: DataTypes.DATE }
},{ tableName:'carts', underscored:true, paranoid:true });
export default Cart;
