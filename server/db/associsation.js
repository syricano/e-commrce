// server/db/association.js
// Wire up all Sequelize model associations. Call `applyAssociations()` after all models are initialized.
// ESM imports
import User from '../models/User.js';
import Address from '../models/Address.js';
import Store from '../models/Store.js';
import StoreUser from '../models/StoreUser.js';
import Category from '../models/Category.js';
import CategoryTranslation from '../models/CategoryTranslation.js';
import Brand from '../models/Brand.js';
import BrandTranslation from '../models/BrandTranslation.js';
import Product from '../models/Product.js';
import ProductTranslation from '../models/ProductTranslation.js';
import ProductVariant from '../models/ProductVariant.js';
import Media from '../models/Media.js';
import Offer from '../models/Offer.js';
import Inventory from '../models/Inventory.js';
import Cart from '../models/Cart.js';
import CartItem from '../models/CartItem.js';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Shipment from '../models/Shipment.js';
import Payment from '../models/Payment.js';
import Refund from '../models/Refund.js';
import ReturnRequest from '../models/ReturnRequest.js';
import Review from '../models/Review.js';
import CommissionScheme from '../models/CommissionScheme.js';
import Payout from '../models/Payout.js';
import Collection from '../models/Collection.js';
import CollectionTranslation from '../models/CollectionTranslation.js';
import CollectionRule from '../models/CollectionRule.js';
import Placement from '../models/Placement.js';
import ReviewVote from '../models/ReviewVote.js';
import AuditLog from '../models/AuditLog.js';

export function applyAssociations() {
  // User ↔ Address
  User.hasMany(Address, { foreignKey: 'user_id', as: 'addresses', onDelete: 'CASCADE' });
  Address.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // User ↔ Store (owner)
  User.hasMany(Store, { foreignKey: 'owner_user_id', as: 'ownedStores' });
  Store.belongsTo(User, { foreignKey: 'owner_user_id', as: 'owner' });

  // StoreUser (membership)
  Store.hasMany(StoreUser, { foreignKey: 'store_id', as: 'members', onDelete: 'CASCADE' });
  StoreUser.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });
  User.hasMany(StoreUser, { foreignKey: 'user_id', as: 'storeMemberships', onDelete: 'CASCADE' });
  StoreUser.belongsTo(User, { foreignKey: 'user_id', as: 'member' });

  // CommissionScheme ↔ Store
  CommissionScheme.hasMany(Store, { foreignKey: 'commission_scheme_id', as: 'stores' });
  Store.belongsTo(CommissionScheme, { foreignKey: 'commission_scheme_id', as: 'commissionScheme' });

  // Category tree
  Category.hasMany(Category, { foreignKey: 'parent_id', as: 'children' });
  Category.belongsTo(Category, { foreignKey: 'parent_id', as: 'parent' });

  // Category ↔ CategoryTranslation
  Category.hasMany(CategoryTranslation, { foreignKey: 'category_id', as: 'translations', onDelete: 'CASCADE' });
  CategoryTranslation.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

  // Brand ↔ BrandTranslation
  Brand.hasMany(BrandTranslation, { foreignKey: 'brand_id', as: 'translations', onDelete: 'CASCADE' });
  BrandTranslation.belongsTo(Brand, { foreignKey: 'brand_id', as: 'brand' });

  // Product masters
  Brand.hasMany(Product, { foreignKey: 'brand_id', as: 'products' });
  Product.belongsTo(Brand, { foreignKey: 'brand_id', as: 'brand' });

  Category.hasMany(Product, { foreignKey: 'default_category_id', as: 'products' });
  Product.belongsTo(Category, { foreignKey: 'default_category_id', as: 'defaultCategory' });

  // Product ↔ ProductTranslation
  Product.hasMany(ProductTranslation, { foreignKey: 'product_id', as: 'translations', onDelete: 'CASCADE' });
  ProductTranslation.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

  // Product ↔ Variant
  Product.hasMany(ProductVariant, { foreignKey: 'product_id', as: 'variants', onDelete: 'CASCADE' });
  ProductVariant.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

  // Media can belong to Product or Variant
  Product.hasMany(Media, { foreignKey: 'product_id', as: 'media' });
  Media.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
  ProductVariant.hasMany(Media, { foreignKey: 'variant_id', as: 'media' });
  Media.belongsTo(ProductVariant, { foreignKey: 'variant_id', as: 'variant' });

  // Offer (listing) per seller per variant
  Store.hasMany(Offer, { foreignKey: 'store_id', as: 'offers', onDelete: 'CASCADE' });
  Offer.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });
  ProductVariant.hasMany(Offer, { foreignKey: 'variant_id', as: 'offers', onDelete: 'CASCADE' });
  Offer.belongsTo(ProductVariant, { foreignKey: 'variant_id', as: 'variant' });

  // Inventory per Offer
  Offer.hasOne(Inventory, { foreignKey: 'offer_id', as: 'inventory', onDelete: 'CASCADE' });
  Inventory.belongsTo(Offer, { foreignKey: 'offer_id', as: 'offer' });

  // Cart and items
  User.hasMany(Cart, { foreignKey: 'user_id', as: 'carts' });
  Cart.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  Cart.hasMany(CartItem, { foreignKey: 'cart_id', as: 'items', onDelete: 'CASCADE' });
  CartItem.belongsTo(Cart, { foreignKey: 'cart_id', as: 'cart' });

  Offer.hasMany(CartItem, { foreignKey: 'offer_id', as: 'cartItems', onDelete: 'CASCADE' });
  CartItem.belongsTo(Offer, { foreignKey: 'offer_id', as: 'offer' });

  // Orders
  User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
  Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items', onDelete: 'CASCADE' });
  OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

  // OrderItem relations
  Offer.hasMany(OrderItem, { foreignKey: 'offer_id', as: 'orderItems' });
  OrderItem.belongsTo(Offer, { foreignKey: 'offer_id', as: 'offer' });

  Store.hasMany(OrderItem, { foreignKey: 'store_id', as: 'orderItems' });
  OrderItem.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });

  // Shipments per order and store
  Order.hasMany(Shipment, { foreignKey: 'order_id', as: 'shipments' });
  Shipment.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

  Store.hasMany(Shipment, { foreignKey: 'store_id', as: 'shipments' });
  Shipment.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });

  // Payments and refunds
  Order.hasMany(Payment, { foreignKey: 'order_id', as: 'payments' });
  Payment.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

  Order.hasMany(Refund, { foreignKey: 'order_id', as: 'refunds' });
  Refund.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

  Payment.hasMany(Refund, { foreignKey: 'payment_id', as: 'refunds' });
  Refund.belongsTo(Payment, { foreignKey: 'payment_id', as: 'payment' });

  // Returns
  Order.hasMany(ReturnRequest, { foreignKey: 'order_id', as: 'returnRequests' });
  ReturnRequest.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

  OrderItem.hasMany(ReturnRequest, { foreignKey: 'order_item_id', as: 'returnRequests' });
  ReturnRequest.belongsTo(OrderItem, { foreignKey: 'order_item_id', as: 'orderItem' });

  // Reviews and votes
  User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews' });
  Review.belongsTo(User, { foreignKey: 'user_id', as: 'author' });

  Product.hasMany(Review, { foreignKey: 'product_id', as: 'reviews' });
  Review.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

  Store.hasMany(Review, { foreignKey: 'store_id', as: 'reviews' });
  Review.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });

  Review.hasMany(ReviewVote, { foreignKey: 'review_id', as: 'votes', onDelete: 'CASCADE' });
  ReviewVote.belongsTo(Review, { foreignKey: 'review_id', as: 'review' });

  User.hasMany(ReviewVote, { foreignKey: 'user_id', as: 'reviewVotes', onDelete: 'CASCADE' });
  ReviewVote.belongsTo(User, { foreignKey: 'user_id', as: 'voter' });

  // Payouts
  Store.hasMany(Payout, { foreignKey: 'store_id', as: 'payouts' });
  Payout.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });

  // Collections, translations, rules, placements
  Collection.hasMany(CollectionTranslation, { foreignKey: 'collection_id', as: 'translations', onDelete: 'CASCADE' });
  CollectionTranslation.belongsTo(Collection, { foreignKey: 'collection_id', as: 'collection' });

  Collection.hasMany(CollectionRule, { foreignKey: 'collection_id', as: 'rules', onDelete: 'CASCADE' });
  CollectionRule.belongsTo(Collection, { foreignKey: 'collection_id', as: 'collection' });

  Collection.hasMany(Placement, { foreignKey: 'collection_id', as: 'placements', onDelete: 'CASCADE' });
  Placement.belongsTo(Collection, { foreignKey: 'collection_id', as: 'collection' });

  // Audit log
  User.hasMany(AuditLog, { foreignKey: 'actor_user_id', as: 'auditLogs' });
  AuditLog.belongsTo(User, { foreignKey: 'actor_user_id', as: 'actor' });

  // Return useful map if needed
  return {
    User,
    Address,
    Store,
    StoreUser,
    Category,
    CategoryTranslation,
    Brand,
    BrandTranslation,
    Product,
    ProductTranslation,
    ProductVariant,
    Media,
    Offer,
    Inventory,
    Cart,
    CartItem,
    Order,
    OrderItem,
    Shipment,
    Payment,
    Refund,
    ReturnRequest,
    Review,
    CommissionScheme,
    Payout,
    Collection,
    CollectionTranslation,
    CollectionRule,
    Placement,
    ReviewVote,
    AuditLog
  };
}

export default applyAssociations;
