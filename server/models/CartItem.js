// server/models/CartItem.js
import { DataTypes, Op } from 'sequelize';
import sequelize from '../db/index.js';

const CartItem = sequelize.define('CartItem', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  cartId: { type: DataTypes.BIGINT, allowNull: false },
  // B2C offer (nullable when using storeOfferId)
  offerId: { type: DataTypes.BIGINT, allowNull: true },
  // Merchant store offer (nullable when using offerId)
  storeOfferId: { type: DataTypes.BIGINT, allowNull: true },
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  unitPriceAmount: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: 'cart_items',
  underscored: true,
  paranoid: true,
  // Define partial unique indexes to mirror DB migrations when sync(alter) is used locally.
  // Enforce uniqueness only among non-deleted rows.
  indexes: [
    {
      unique: true,
      fields: ['cartId', 'offerId'],
      where: { deleted_at: null, offer_id: { [Op.ne]: null } },
    },
    {
      unique: true,
      fields: ['cartId', 'storeOfferId'],
      where: { deleted_at: null, store_offer_id: { [Op.ne]: null } },
    },
  ],
});

export default CartItem;
